import { createRemoteJWKSet, jwtVerify } from "jose";

const keySets = new Map();

export class AccessError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

export function accessConfig(env) {
  const team = (env.ACCESS_TEAM_DOMAIN || "").trim();
  const audience = (env.ACCESS_AUD || "").trim();
  const emails = (env.ALLOWED_EMAILS || "").split(",").map(s => s.trim().toLowerCase()).filter(Boolean);
  if (!/^[a-z0-9-]+\.cloudflareaccess\.com$/.test(team) || !audience || !emails.length) {
    throw new AccessError(503, "Private access is not configured yet. No reports are available until setup is complete.");
  }
  return { issuer: `https://${team}`, audience, emails };
}

// Signature, issuer, audience and expiry are checked even on direct Worker URLs.
// There is intentionally no development bypass in the deployed application.
export async function authenticate(request, env, testKeySet) {
  const config = accessConfig(env);
  const token = request.headers.get("Cf-Access-Jwt-Assertion");
  if (!token || token.length > 16384) throw new AccessError(401, "Please sign in to view your reports.");
  let keys = testKeySet || keySets.get(config.issuer);
  if (!keys) {
    keys = createRemoteJWKSet(new URL(`${config.issuer}/cdn-cgi/access/certs`), { timeoutDuration: 5000 });
    keySets.set(config.issuer, keys);
  }
  let payload;
  try {
    ({ payload } = await jwtVerify(token, keys, {
      issuer: config.issuer,
      audience: config.audience,
      algorithms: ["RS256"],
      requiredClaims: ["exp", "iat", "sub", "email"],
      clockTolerance: 5,
    }));
  } catch {
    throw new AccessError(401, "Your session is invalid or expired. Please sign in again.");
  }
  const email = typeof payload.email === "string" ? payload.email.toLowerCase() : "";
  if (payload.type !== "app" || !config.emails.includes(email)) {
    throw new AccessError(403, "This account does not have access to these reports.");
  }
  return { email };
}
