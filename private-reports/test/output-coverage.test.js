import test from "node:test";
import assert from "node:assert/strict";
import { normalizeReport } from "../src/reports.js";
import { filterItems, assessmentFor, equitySummary, renderConsumer, renderWatchlist, renderExposure, coverageSummary, diagnosticLabel, renderAIOverview } from "../public/view.js";

const date = "2026-10-03";
const raw = overrides => ({ run_date: date, tickers: ["AAA", "BBB"], events: [], ...overrides });
const filters = { priority: "relevant", ticker: "", direction: "", category: "", search: "", aiOnly: false, scope: "" };
const stock = (score, relationship = "DIRECT", direction = "NEUTRAL") => ({ impact_score: score, relationship, direction });

test("skipped, empty, inactive, failed and partial collection are distinct", () => {
  const report = normalizeReport("equity", raw({ diagnostics: [
    { source: "skipped", skipped: true, ok: false, attempted: 0, succeeded: 0, articles: 0 },
    { source: "empty", ok: true, attempted: 2, succeeded: 2, articles: 0 },
    { source: "inactive", ok: true, attempted: 0, succeeded: 0, articles: 0 },
    { source: "failed", ok: false, attempted: 2, succeeded: 0, articles: 0 },
    { source: "partial", ok: true, attempted: 3, succeeded: 2, articles: 4, duration_s: 1.25 },
    { source: "verified", ok: true, attempted: 2, succeeded: 2, articles: 4 },
  ] }), date);
  assert.deepEqual(report.diagnostics.map(d => d.status), ["skipped", "no_data", "not_run", "failed", "partial", "ok"]);
  assert.deepEqual(coverageSummary(report.diagnostics), { issues: 2, quiet: 3 });
  assert.equal(report.diagnostics[4].duration, 1.25);
  assert.equal(diagnosticLabel("no_data"), "No data");
});

test("weak links respect source thresholds and never hide a valid lower-scoring company", () => {
  const report = normalizeReport("equity", raw({ events: [
    { event_id: "both", stocks: { AAA: stock(8, "WEAK"), BBB: stock(6) } },
    { event_id: "weak", stocks: { AAA: stock(8, "WEAK") } },
    { event_id: "weak-high", stocks: { AAA: stock(9, "WEAK") } },
  ] }), date);
  assert.equal(assessmentFor(report.items[0], filters).ticker, "BBB");
  assert.deepEqual(filterItems(report, filters).map(i => i.id), ["weak-high", "both"]);
  assert.deepEqual(filterItems(report, { ...filters, priority: "high" }).map(i => i.id), ["weak-high"]);
  assert.equal(filterItems(report, { ...filters, priority: "all", ticker: "AAA" }).length, 3);
  assert.equal(filterItems(report, { ...filters, direction: "NEUTRAL" }).length, 2);
});

test("global exposure excludes direct links and cross-company view requires relevant links", () => {
  const report = normalizeReport("equity", raw({ events: [
    { event_id: "global", is_international: true, stocks: { AAA: stock(12), BBB: stock(6, "INDIRECT") } },
    { event_id: "direct", is_international: true, stocks: { AAA: stock(10), BBB: stock(2, "INDIRECT") } },
    { event_id: "local", stocks: { AAA: stock(7), BBB: stock(6) } },
  ] }), date);
  const global = { ...filters, scope: "global" };
  assert.deepEqual(filterItems(report, global).map(i => i.id), ["global"]);
  assert.equal(assessmentFor(report.items[0], global).ticker, "BBB");
  assert.deepEqual(filterItems(report, { ...filters, scope: "cross" }).map(i => i.id), ["global", "local"]);
});

test("stored totals distinguish one event from its two company assessments and preserve raw counters", () => {
  const report = normalizeReport("equity", raw({ stats: { relevant_events: 99 }, events: [{ event_id: "one", stocks: { AAA: stock(13), BBB: stock(14) } }] }), date);
  assert.deepEqual(equitySummary(report), { relevant: 1, high: 1, critical: 1, highAssessments: 2, criticalAssessments: 2 });
  assert.equal(report.stats.relevant_events, 99);
  assert.match(renderWatchlist(report), /data-company="AAA"/);
  assert.match(renderWatchlist(report), /Neutral/);
});

test("consumer changes retain zero and negative counts, source examples and uncertainty", () => {
  const report = normalizeReport("equity", raw({ consumer: [{ ticker: "AAA", mentions: 1, previous_mentions: 2, mention_change: -1, positive: 0, negative: 0, neutral: 1, engagement: 0, net: 0, net_change: 1, leaning: "too few to read", terms: { "product": 1 }, examples: [{ title: "A review", url: "https://example.com/review", source: "Video author", polarity: "neutral" }] }] }), date);
  assert.equal(report.consumer[0].mentionChange, -1);
  assert.equal(report.consumer[0].engagement, 0);
  const html = renderConsumer(report);
  assert.match(html, /Too few mentions to establish a trend/);
  assert.match(html, /A review/);
  assert.match(html, /Net polarity 0 · Change \+1/);
  assert.match(html, /Positive 0 · Negative 0 · Neutral 1/);
  assert.equal(report.items.length, 0, "consumer mentions must not become scored events");
});

test("consumer examples and exposure fields escape source HTML and reject unsafe links", () => {
  const report = normalizeReport("equity", raw({ consumer: [{ ticker: "<img onerror=x>", mentions: "<script>", terms: { "<svg>": 2 }, examples: [{ title: "<script>x</script>", url: "javascript:alert(1)", source: "<img>" }] }], events: [{ stocks: { AAA: { ...stock(6), business_impacts: ["<img>"], exposures: [{ term: "<svg>", exposure_type: "<script>", weight: "<img>" }] } } }] }), date);
  const html = renderConsumer(report) + renderExposure(report.items[0].assessments[0]);
  assert.doesNotMatch(html, /<(script|img|svg)\b|href="javascript/);
  assert.match(html, /&lt;script&gt;/);
  assert.equal(report.consumer[0].mentions, null);
  assert.equal(report.items[0].assessments[0].exposures[0].weight, null);
});

test("missing consumer output is distinguished from an explicitly empty run", () => {
  assert.match(renderConsumer(normalizeReport("equity", raw({}), date)), /older report/);
  assert.match(renderConsumer(normalizeReport("equity", raw({ consumer: [] }), date)), /No consumer mentions/);
  assert.equal(renderConsumer({ kind: "recycling" }), "");
});

test("an AI run with no work or intentionally skipped does not claim missing analysis", () => {
  for (const skipped of [false, true]) {
    const report = normalizeReport("equity", raw({ diagnostics: [{ source: "ai_enrichment", ok: true, skipped, attempted: 0, succeeded: 0, articles: 0 }] }), date);
    assert.doesNotMatch(renderAIOverview(report), /Some AI analysis is unavailable/);
  }
});

test("source titles, dates, quality, exposure and business effects survive normalization", () => {
  const report = normalizeReport("equity", raw({ events: [{ primary_source: "Example", article_count: 2, source_count: 1, first_seen: date, last_updated: date, sources: [{ source_name: "Example", title: "Evidence headline", url: "https://example.com", quality: 8, published: date, source_type: "official", is_official: true }], stocks: { AAA: { ...stock(8), business_impacts: ["COSTS"], exposures: [{ exposure_type: "COMMODITY", term: "coal", relationship: "INDIRECT", weight: 2, detail: "Input cost" }] } } }] }), date);
  const item = report.items[0];
  assert.equal(item.sourceCount, 1); assert.equal(item.articleCount, 2);
  assert.equal(item.sources[0].title, "Evidence headline"); assert.equal(item.sources[0].quality, 8);
  assert.match(renderExposure(item.assessments[0]), /Input cost/);
  assert.equal(filterItems(report, { ...filters, search: "coal" }).length, 1);
});
