import { authenticate, AccessError } from "./auth.js";
import { githubJSON, normalizeReport, reportDates, repository, validDate, ReportError } from "./reports.js";

const HEADERS = {
  "Cache-Control": "private, no-store, max-age=0",
  "X-Robots-Tag": "noindex, nofollow, noarchive",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "no-referrer",
  "X-Frame-Options": "DENY",
  "Content-Security-Policy": "default-src 'none'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self'; font-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
};
const json = (value, status = 200) => Response.json(value, { status });
function secure(response) {
  const secured = new Response(response.body, response);
  Object.entries(HEADERS).forEach(([key, value]) => secured.headers.set(key, value));
  return secured;
}

export function createHandler({ verify = authenticate, read = githubJSON } = {}) {
  return async function handle(request, env) {
    try {
      // This must run before *every* route, including static assets and errors.
      const identity = await verify(request, env);
      if (request.method !== "GET" && request.method !== "HEAD") return secure(json({ error: "Method not allowed." }, 405));
      const url = new URL(request.url);
      const cache = typeof caches !== "undefined" ? caches.default : undefined;
      let response;
      if (url.pathname === "/api/session") {
        response = json(identity);
      } else if (url.pathname === "/api/reports") {
        const kind = url.searchParams.get("kind");
        repository(kind);
        const dates = reportDates(await read(kind, "data/daily", env, cache));
        response = json({ dates, checkedAt: new Date().toISOString(), cacheMinutes: 5 });
      } else if (url.pathname === "/api/report") {
        const kind = url.searchParams.get("kind");
        repository(kind);
        const date = url.searchParams.get("date");
        if (!validDate(date)) throw new ReportError(400, "Choose a valid report date.");
        const raw = await read(kind, `data/daily/${date}.json`, env, cache);
        const report = normalizeReport(kind, raw, date);
        response = json(url.searchParams.get("download") === "1" ? raw : report);
        if (url.searchParams.get("download") === "1") response.headers.set("Content-Disposition", `attachment; filename="${kind}-${date}.json"`);
      } else if (url.pathname.startsWith("/api/")) {
        response = json({ error: "Not found." }, 404);
      } else {
        response = await env.ASSETS.fetch(request);
      }
      if (request.method === "HEAD") response = new Response(null, response);
      return secure(response);
    } catch (error) {
      const known = error instanceof AccessError || error instanceof ReportError;
      return secure(json({ error: known ? error.message : "The reports could not be loaded. Please try again." }, known ? error.status : 500));
    }
  };
}

const worker = { fetch: createHandler() };
export default worker;
