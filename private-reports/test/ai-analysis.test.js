import test from "node:test";
import assert from "node:assert/strict";
import { normalizeReport } from "../src/reports.js";
import { createHandler } from "../src/worker.js";
import { assessmentFor, filterItems, renderAIAnalysis, renderAIOverview } from "../public/view.js";

const date = "2026-09-29";
const fields = ["revenue_effect", "margin_effect", "cost_effect", "competitive_effect", "regulatory_effect", "short_term", "medium_long_term", "second_order_effects", "key_uncertainty"];
const analysis = () => ({ provider: "gemini", model: "source-model", ...Object.fromEntries(fields.map(key => [key, `Source ${key}`])), monitor_next: ["Next filing", "Quarterly results"], redactions: ["Source removed a recommendation"] });
const raw = () => ({
  run_date: date, events: [{ event_id: "event", title: "An event", event_date: date, stocks: {
    AAA: { impact_score: 12, direction: "POSITIVE", confidence: 0.8 },
    BBB: { impact_score: 6, direction: "UNCERTAIN", confidence: 0.4, ai_analysis: analysis() },
  } }],
  diagnostics: [{ source: "ai_enrichment", ok: true, attempted: 6, succeeded: 4, errors: [], note: "Two requests unavailable" }],
});
const filters = { search: "", priority: "all", ticker: "", direction: "", category: "", aiOnly: false };

test("AI commentary retains all source fields and belongs to its company without replacing scores", () => {
  const report = normalizeReport("equity", raw(), date);
  const [aaa, bbb] = report.items[0].assessments;
  assert.equal(aaa.ai, null);
  assert.equal(bbb.score, 6);
  assert.equal(bbb.direction, "UNCERTAIN");
  assert.equal(bbb.confidence, 0.4);
  assert.deepEqual(bbb.ai.sections.map(section => section.key), fields);
  assert.deepEqual(bbb.ai.sections.map(section => section.text), fields.map(key => `Source ${key}`));
  assert.deepEqual(bbb.ai.monitor, analysis().monitor_next);
  assert.deepEqual(bbb.ai.redactions, analysis().redactions);
  assert.equal(bbb.ai.provider, "gemini");
  assert.equal(bbb.ai.model, "source-model");
  assert.equal(report.diagnostics[0].status, "partial");
  assert.match(renderAIOverview(report), /4 of 6 selected analyses completed/);
});

test("AI-only, company, direction and score filtering refer to the same assessment", () => {
  const report = normalizeReport("equity", raw(), date);
  const aiFilters = { ...filters, aiOnly: true };
  assert.equal(assessmentFor(report.items[0], aiFilters).ticker, "BBB");
  assert.equal(filterItems(report, aiFilters).length, 1);
  assert.equal(filterItems(report, { ...aiFilters, ticker: "AAA" }).length, 0);
  assert.equal(filterItems(report, { ...aiFilters, direction: "POSITIVE" }).length, 0);
  assert.equal(filterItems(report, { ...aiFilters, priority: "high" }).length, 0);
  assert.equal(filterItems(report, { ...aiFilters, search: "Quarterly results" }).length, 1);
  assert.equal(filterItems(report, { ...aiFilters, search: "second_order_effects" }).length, 1);
  assert.equal(filterItems(report, filters).length, 1);
});

test("older, empty and malformed AI payloads never invent analysis or break the report", () => {
  for (const value of [undefined, null, {}, [], "text", { provider: "gemini", model: "example" }, { revenue_effect: {}, monitor_next: [12, {}] }]) {
    const report = raw();
    report.events[0].stocks.BBB.ai_analysis = value;
    const normalized = normalizeReport("equity", report, date);
    assert.equal(normalized.items[0].assessments[1].ai, null);
    assert.match(renderAIOverview(normalized), /No AI analysis was included/);
    assert.equal(filterItems(normalized, filters).length, 1);
  }
  assert.equal(renderAIAnalysis(null), "");
  assert.equal(renderAIOverview({ kind: "recycling" }), "");
  const partial = raw();
  partial.events[0].stocks.BBB.ai_analysis = { key_uncertainty: " Unknown demand ", monitor_next: ["One item", null] };
  const ai = normalizeReport("equity", partial, date).items[0].assessments[1].ai;
  assert.equal(ai.sections.length, 1);
  assert.equal(ai.sections[0].text, "Unknown demand");
  assert.deepEqual(ai.monitor, ["One item"]);
});

test("AI HTML, model metadata, monitoring and redactions render as text", () => {
  const report = raw();
  report.events[0].stocks.BBB.ai_analysis = { ...analysis(), provider: '<img src=x onerror="attack()">', model: '<script>attack()</script>', revenue_effect: '<a href="javascript:attack()">Claim</a>', monitor_next: ['<iframe src="bad"></iframe>'], redactions: ["<svg onload=attack()>"] };
  const normalized = normalizeReport("equity", report, date);
  const ai = normalized.items[0].assessments[1].ai;
  const html = renderAIAnalysis(ai) + renderAIOverview(normalized);
  assert.doesNotMatch(html, /<(script|img|iframe|svg|a)\b/);
  assert.match(html, /&lt;script&gt;/);
  assert.match(html, /&lt;a href=&quot;javascript:attack\(\)&quot;&gt;/);
  assert.match(html, /&lt;iframe/);
  assert.match(html, /&lt;svg/);
});

test("authorized report API includes AI and original download retains its raw schema", async () => {
  const handler = createHandler({ verify: async () => ({ email: "owner@example.com" }), read: async () => raw() });
  const response = await handler(new Request(`https://example.com/api/report?kind=equity&date=${date}`), {});
  assert.equal(response.status, 200);
  assert.equal((await response.json()).items[0].assessments[1].ai.sections.length, 9);
  assert.match(response.headers.get("Cache-Control"), /private, no-store/);
  const download = await handler(new Request(`https://example.com/api/report?kind=equity&date=${date}&download=1`), {});
  assert.deepEqual((await download.json()).events[0].stocks.BBB.ai_analysis, analysis());
});
