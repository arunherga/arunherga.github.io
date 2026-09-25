import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { Miniflare, convertV4MiniflareOptions } from "miniflare";

const source = await readFile(new URL("../src/reports.js", import.meta.url), "utf8");

test("Cloudflare runtime reads and caches both report collections with safe fetch options", async () => {
  const requests = [];
  const runtime = new Miniflare(convertV4MiniflareOptions({
    modules: true,
    compatibilityDate: "2026-09-24",
    script: source + `
      export default { async fetch() {
        const results = [];
        for (const kind of ['equity', 'recycling']) {
          const listing = await githubJSON(kind, 'data/daily', {}, caches.default);
          const dates = reportDates(listing);
          const path = 'data/daily/' + dates[0] + '.json';
          const raw = await githubJSON(kind, path, {}, caches.default);
          await githubJSON(kind, path, {}, caches.default);
          const normalized = normalizeReport(kind, raw, dates[0]);
          results.push({ kind, date: normalized.date, count: normalized.items.length });
        }
        return Response.json(results);
      }};`,
    outboundService: request => {
      requests.push({ url: request.url, userAgent: request.headers.get("User-Agent") });
      if (new URL(request.url).pathname.endsWith("data/daily")) return Response.json([{ name: "2026-09-24.json", type: "file" }]);
      return Response.json(request.url.includes("global-equity")
        ? { run_date: "2026-09-24", events: [{ event_id: "example", title: "Fixture event", stocks: {}, sources: [] }] }
        : { date: "2026-09-24", articles: [{ article_id: "example", title: "Fixture article" }] });
    },
  }));
  try {
    const response = await runtime.dispatchFetch("https://runtime-test.local/");
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), [
      { kind: "equity", date: "2026-09-24", count: 1 },
      { kind: "recycling", date: "2026-09-24", count: 1 },
    ]);
    assert.equal(requests.length, 4, "the second report read must use the server cache");
    for (const request of requests) {
      assert.equal(new URL(request.url).hostname, "api.github.com");
      assert.equal(request.userAgent, "Arun-Private-Intelligence");
    }
  } finally { await runtime.dispose(); }
});
