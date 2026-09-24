import test from "node:test";
import assert from "node:assert/strict";
import { generateKeyPair, SignJWT } from "jose";
import { authenticate } from "../src/auth.js";
import { createHandler } from "../src/worker.js";
import { readFile } from "node:fs/promises";

const env = { ACCESS_TEAM_DOMAIN: "test-team.cloudflareaccess.com", ACCESS_AUD: "test-audience", ALLOWED_EMAILS: "arun.b.bhat@gmail.com" };
const { publicKey, privateKey } = await generateKeyPair("RS256");
const otherKeys = await generateKeyPair("RS256");
async function token(overrides = {}, key = privateKey) {
  return new SignJWT({ type: "app", email: env.ALLOWED_EMAILS, iss: `https://${env.ACCESS_TEAM_DOMAIN}`, aud: env.ACCESS_AUD, sub: "owner", iat: Math.floor(Date.now() / 1000), exp: Math.floor(Date.now() / 1000) + 600, ...overrides }).setProtectedHeader({ alg: "RS256" }).sign(key);
}
const request = (jwt, path = "/") => new Request(`https://private.example${path}`, { headers: jwt ? { "Cf-Access-Jwt-Assertion": jwt } : {} });

test("owner can authenticate only with a valid signed application token", async () => {
  assert.deepEqual(await authenticate(request(await token()), env, publicKey), { email: env.ALLOWED_EMAILS });
});
for (const [name, overrides] of Object.entries({
  "different email": { email: "someone@example.com" },
  "wrong audience": { aud: "another-app" },
  "wrong issuer": { iss: "https://attacker.cloudflareaccess.com" },
  "expired session": { exp: Math.floor(Date.now() / 1000) - 60 },
  "missing expiry": { exp: undefined },
  "future validity": { nbf: Math.floor(Date.now() / 1000) + 600 },
  "service identity": { type: "service" },
  "missing identity": { email: undefined },
})) test(`rejects ${name}`, async () => {
  await assert.rejects(authenticate(request(await token(overrides)), env, publicKey), error => [401, 403].includes(error.status));
});
test("rejects signatures from another key and unsigned or malformed tokens", async () => {
  for (const jwt of [await token({}, otherKeys.privateKey), "not.a.token", ""]) {
    await assert.rejects(authenticate(request(jwt), env, publicKey), error => error.status === 401);
  }
});
test("missing or invalid deployment settings fail closed", async () => {
  for (const settings of [{}, { ...env, ACCESS_AUD: "" }, { ...env, ALLOWED_EMAILS: "" }, { ...env, ACCESS_TEAM_DOMAIN: "localhost:1234" }]) {
    await assert.rejects(authenticate(request(await token()), settings, publicKey), error => error.status === 503);
  }
});
test("every asset, API, download and unknown route is protected before data is read", async () => {
  let reads = 0;
  const handler = createHandler({ read: async () => { reads++; }, verify: (req, settings) => authenticate(req, settings, publicKey) });
  const settings = { ...env, ASSETS: { fetch: async () => { reads++; return new Response("secret"); } } };
  for (const path of ["/", "/app.js", "/styles.css", "/favicon.svg", "/api/session", "/api/reports?kind=equity", "/api/report?kind=equity&date=2026-09-24", "/api/report?kind=equity&date=2026-09-24&download=1", "/unknown"]) {
    const response = await handler(request(null, path), settings);
    assert.equal(response.status, 401, path);
    assert.match(response.headers.get("Cache-Control"), /no-store/);
    assert.match(response.headers.get("X-Robots-Tag"), /noindex/);
    assert.match(response.headers.get("Content-Security-Policy"), /frame-ancestors 'none'/);
    assert.equal(response.headers.get("Access-Control-Allow-Origin"), null);
  }
  assert.equal(reads, 0);
});
test("authorized asset requests succeed and remain uncacheable in the browser", async () => {
  const handler = createHandler({ verify: (req, settings) => authenticate(req, settings, publicKey) });
  const response = await handler(request(await token(), "/styles.css"), { ...env, ASSETS: { fetch: async () => new Response("body{}", { headers: { "Cache-Control": "public,max-age=3600" } }) } });
  assert.equal(response.status, 200);
  assert.match(response.headers.get("Cache-Control"), /private, no-store/);
});
test("deployment runs authentication before all static assets and disables preview URLs", async () => {
  const config = JSON.parse(await readFile(new URL("../wrangler.jsonc", import.meta.url), "utf8"));
  assert.equal(config.assets.run_worker_first, true);
  assert.equal(config.preview_urls, false);
  assert.equal(config.main, "src/worker.js");
  assert.equal(config.assets.directory, "./public");
});
