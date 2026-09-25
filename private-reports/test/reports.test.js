import test from "node:test";
import assert from "node:assert/strict";
import { normalizeReport, reportDates, githubJSON, repository, safeURL, validDate } from "../src/reports.js";
import { createHandler } from "../src/worker.js";
import { filterItems, escapeHTML } from "../public/view.js";

const date = "2026-09-24";
const stock = (score, direction = "UNCERTAIN") => ({ impact_score: score, direction, confidence: 0.68, why_it_matters: "Source explanation", score_reasons: ["+2 regulation"], watch_next: ["Company response"] });
const equity = () => ({ run_date: date, finished_at: `${date}T12:00:00Z`, stats: { events_detected: 2, high_impact_events: 1 }, tickers: ["AAA", "BBB"], diagnostics: [{ source: "nse", ok: false, errors: ["Timed out"] }, { source: "rss", ok: true, errors: ["One feed failed"] }], events: [
  { event_id: "one", title: "<img onerror=alert(1)>", summary: "Headline", event_date: date, stocks: { AAA: stock(12, "POSITIVE"), BBB: stock(3, "NEGATIVE") }, sources: [{ url: "javascript:alert(1)", source_name: "Source" }] },
  { event_id: "two", title: "Second event", event_date: date, stocks: { BBB: stock(9, "NEGATIVE") }, sources: [{ url: "https://example.com/news", source_name: "Example" }] },
] });
const filters = { priority: "relevant", search: "", ticker: "", direction: "", category: "", opportunity: false };

test("preserves scores, dates, reasoning and uncertainty instead of inventing analysis", () => {
  const report = normalizeReport("equity", equity(), date);
  assert.equal(report.items[0].assessments[0].score, 12);
  assert.equal(report.items[0].assessments[0].confidence, 0.68);
  assert.equal(report.items[0].assessments[0].why, "Source explanation");
  assert.deepEqual(report.items[0].assessments[0].watch, ["Company response"]);
  assert.equal(report.items[0].sources[0].url, "");
  assert.equal(report.diagnostics[0].status, "failed");
  assert.equal(report.diagnostics[1].status, "partial");
});
test("company, score and direction filters apply to the same assessment", () => {
  const report = normalizeReport("equity", equity(), date);
  assert.deepEqual(filterItems(report, { ...filters, ticker: "BBB" }).map(i => i.id), ["two"]);
  assert.deepEqual(filterItems(report, { ...filters, ticker: "BBB", direction: "POSITIVE" }), []);
  assert.deepEqual(filterItems(report, { ...filters, ticker: "BBB", priority: "all" }).map(i => i.id), ["two", "one"]);
  assert.deepEqual(filterItems(report, { ...filters, search: "second" }).map(i => i.id), ["two"]);
});
test("recycling supports opportunities, categories, location search and zero-result days", () => {
  const report = normalizeReport("recycling", { date, stats: { opportunities: 0, source_errors: ["Feed failed"] }, articles: [{ article_id: "news", title: "Regulation", location: ["Udupi"], category: ["EPR"], relevance_score: 6, business_opportunity: false }, { article_id: "duplicate", duplicate_of: "news" }] }, date);
  assert.equal(report.items.length, 1);
  assert.equal(report.stats.opportunities, 0);
  assert.equal(report.diagnostics[0].status, "failed");
  assert.equal(filterItems(report, { ...filters, search: "udupi", category: "EPR" }).length, 1);
  assert.equal(filterItems(report, { ...filters, opportunity: true }).length, 0);
  assert.equal(normalizeReport("recycling", { date, articles: [] }, date).items.length, 0);
});
test("archive lists only real dated JSON files, newest first", () => {
  assert.deepEqual(reportDates([{ name: "2026-09-23.json", type: "file" }, { name: "2026-09-24.json", type: "file" }, { name: "2026-02-30.json", type: "file" }, { name: "2026-09-22.json", type: "dir" }, { name: "sample.json", type: "file" }]), ["2026-09-24", "2026-09-23"]);
  for (const value of ["2026-02-30", "../secret", null, "2026-9-4"]) assert.equal(validDate(value), false);
});
test("schema/date mismatches fail visibly instead of showing another report", () => {
  assert.throws(() => normalizeReport("equity", equity(), "2026-09-23"), /date does not match/);
  assert.throws(() => normalizeReport("recycling", { date, articles: null }, date), /format has changed/);
});
test("source HTML is escaped and non-web or credential-bearing links are rejected", () => {
  assert.equal(escapeHTML('<script>"x" & \'y\'</script>'), "&lt;script&gt;&quot;x&quot; &amp; &#39;y&#39;&lt;/script&gt;");
  for (const link of ["javascript:alert(1)", "data:text/html,test", "file:///tmp/a", "https://user:pass@example.com"]) assert.equal(safeURL(link), "");
  assert.equal(safeURL("https://example.com/a"), "https://example.com/a");
});
test("repository and path allowlists prevent arbitrary upstream reads", async () => {
  assert.throws(() => repository("__proto__"), /Unknown/);
  assert.throws(() => repository("https://example.com"), /Unknown/);
  await assert.rejects(githubJSON("equity", "../secrets", {}), /Invalid report path/);
});
test("upstream failures produce useful errors and are never cached as success", async () => {
  let writes = 0;
  const cache = { match: async () => null, put: async () => { writes++; } };
  for (const status of [404, 403, 429, 500]) await assert.rejects(githubJSON("equity", "data/daily", {}, cache, async () => new Response("no", { status })));
  await assert.rejects(githubJSON("equity", "data/daily", {}, cache, async () => new Response("not json")), /unreadable/);
  assert.equal(writes, 0);
});
test("server cache reuses source data without putting credentials into cache keys", async () => {
  let fetched = 0; let stored;
  const cache = { match: async () => stored?.clone(), put: async (key, response) => { assert.equal(key.headers.get("Authorization"), null); stored = response; } };
  const fetcher = async (url, options) => { fetched++; assert.ok(url.startsWith("https://api.github.com/repos/arunherga/")); assert.equal(options.headers.Authorization, "Bearer test-secret"); return Response.json([{ name: "2026-09-24.json", type: "file" }]); };
  for (let i = 0; i < 2; i++) await githubJSON("equity", "data/daily", { GITHUB_TOKEN: "test-secret" }, cache, fetcher);
  assert.equal(fetched, 1);
});
test("redirects are rejected without forwarding the GitHub credential", async () => {
  let requests = 0;
  await assert.rejects(githubJSON("equity", "data/daily", { GITHUB_TOKEN: "test-secret" }, undefined, async (url, options) => {
    requests++;
    assert.equal(options.redirect, "manual");
    return new Response(null, { status: 302, headers: { Location: "https://untrusted.example/" } });
  }), /could not be reached/);
  assert.equal(requests, 1);
});
test("only an aborted or timed-out request is reported as a timeout", async () => {
  await assert.rejects(githubJSON("equity", "data/daily", {}, undefined, async () => { throw new TypeError("Unsupported option"); }), /connection to GitHub/);
  await assert.rejects(githubJSON("equity", "data/daily", {}, undefined, async () => { throw new DOMException("Timed out", "TimeoutError"); }), /taking too long/);
});
test("authorized API serves normalized and downloadable reports with correct dates", async () => {
  const handler = createHandler({ verify: async () => ({ email: "owner@example.com" }), read: async () => equity() });
  const result = await handler(new Request(`https://example.com/api/report?kind=equity&date=${date}`), {});
  assert.equal(result.status, 200);
  assert.equal((await result.json()).items.length, 2);
  const download = await handler(new Request(`https://example.com/api/report?kind=equity&date=${date}&download=1`), {});
  assert.match(download.headers.get("Content-Disposition"), /equity-2026-09-24.json/);
  assert.equal((await download.json()).events.length, 2);
  const invalid = await handler(new Request("https://example.com/api/report?kind=equity&date=../../secrets"), {});
  assert.equal(invalid.status, 400);
});
