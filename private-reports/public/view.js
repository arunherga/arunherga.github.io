export const escapeHTML = value => String(value ?? "").replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
export const humanize = value => String(value || "").toLowerCase().replace(/_/g, " ").replace(/\b\w/g, char => char.toUpperCase()).replace(/\b(Epr|Nse|Bse|Rss|Rbi|Ai|Ir)\b/g, word => word.toUpperCase());
// Mirrors the source ReportBuilder's inclusion rules, checked 2026-10-03.
// All findings deliberately keeps lower-scoring stored assessments available.
export function reportable(a) { return a.score != null && a.score >= (a.relationship === "WEAK" ? 9 : 5); }
export function matchingAssessments(item, filters) {
  return item.assessments.filter(a => (!filters.ticker || a.ticker === filters.ticker) && (!filters.direction || a.direction === filters.direction) && (!filters.aiOnly || a.ai) &&
    (filters.priority === "all" || (reportable(a) && (filters.priority !== "high" || a.score >= 8))) &&
    (filters.scope !== "global" || a.relationship !== "DIRECT"));
}
export function assessmentFor(item, filters) {
  return matchingAssessments(item, filters).reduce((best, a) => !best || (a.score ?? -1) > (best.score ?? -1) ? a : best, undefined);
}
export function filterItems(report, filters) {
  const equity = report.kind === "equity";
  const threshold = filters.priority === "high" ? 8 : filters.priority === "relevant" ? (equity ? 5 : 4) : 0;
  const query = filters.search.trim().toLowerCase();
  return report.items.map(item => {
    const assessment = equity ? assessmentFor(item, filters) : undefined;
    if (equity && !assessment) return null;
    const score = equity ? assessment.score : item.score;
    if ((score === null && filters.priority !== "all") || (score !== null && score < threshold)) return null;
    if (filters.category && !item.categories.includes(filters.category)) return null;
    if (filters.opportunity && !item.opportunity) return null;
    if (filters.scope === "global" && !item.international) return null;
    if (filters.scope === "cross" && item.assessments.filter(reportable).length < 2) return null;
    const assessments = equity ? matchingAssessments(item, filters) : item.assessments;
    if (query && ![item.title, item.summary, ...item.locations, ...item.categories, ...assessments.flatMap(a => [a.ticker, a.why, ...a.watch, ...a.impacts, ...(a.exposures ?? []).map(e => e.term), ...(a.ai?.sections.map(section => section.text) ?? []), ...(a.ai?.monitor ?? [])])].join(" ").toLowerCase().includes(query)) return null;
    return { item, score };
  }).filter(Boolean).sort((a, b) => (b.score ?? -1) - (a.score ?? -1) || b.item.date.localeCompare(a.item.date)).map(row => row.item);
}

export function equitySummary(report) {
  const pairs = report.items.flatMap(item => item.assessments.filter(reportable));
  return {
    relevant: report.items.filter(item => item.assessments.some(reportable)).length,
    high: report.items.filter(item => item.assessments.some(a => reportable(a) && a.score >= 8)).length,
    critical: report.items.filter(item => item.assessments.some(a => reportable(a) && a.score >= 13)).length,
    highAssessments: pairs.filter(a => a.score >= 8).length,
    criticalAssessments: pairs.filter(a => a.score >= 13).length,
  };
}

export function renderWatchlist(report) {
  if (report.kind !== "equity") return "";
  const tickers = [...new Set([...report.tickers, ...report.items.flatMap(item => item.assessments.map(a => a.ticker))])];
  return `<section class="watchlist" aria-labelledby="watchlist-title"><span class="eyebrow">YOUR COMPANIES</span><h2 id="watchlist-title">Watchlist at a glance</h2><p class="reading-note">Counts of relevant stored events, not stock rankings. Select a company to read its findings.</p><div class="table-scroll" tabindex="0" role="region" aria-label="Watchlist event counts"><table><thead><tr><th scope="col">Company</th><th scope="col">Events</th><th scope="col">High impact</th><th scope="col">Positive</th><th scope="col">Negative</th><th scope="col">Mixed</th><th scope="col">Neutral</th><th scope="col">Uncertain</th><th scope="col">With AI</th></tr></thead><tbody>${tickers.map(ticker => {
    const all = report.items.flatMap(item => item.assessments.filter(a => a.ticker === ticker && reportable(a)));
    return `<tr><th scope="row"><button class="company-link" data-company="${escapeHTML(ticker)}">${escapeHTML(ticker)}</button></th><td>${all.length}</td><td>${all.filter(a => a.score >= 8).length}</td>${["POSITIVE", "NEGATIVE", "MIXED", "NEUTRAL", "UNCERTAIN"].map(direction => `<td>${all.filter(a => a.direction === direction).length}</td>`).join("")}<td>${all.filter(a => a.ai).length}</td></tr>`;
  }).join("")}</tbody></table></div></section>`;
}

const numberLabel = value => value == null ? "Not provided" : String(value);
const changeLabel = value => value == null ? "Not provided" : value > 0 ? `+${value}` : String(value);
export function renderConsumer(report) {
  if (report.kind !== "equity") return "";
  const esc = escapeHTML;
  return `<section class="consumer-section" id="consumer-signal" aria-labelledby="consumer-title"><span class="eyebrow">SEPARATE FROM NEWS EVENTS</span><h2 id="consumer-title">Consumer signal</h2><p class="reading-note">Public forum and video mentions from the source report. Polarity is a keyword count, not a verified company association. These mentions do not change event impact scores.</p>${report.consumer?.length ? `<div class="consumer-grid">${report.consumer.map(signal => `<article class="consumer-card"><header><h3>${esc(signal.ticker)}</h3><span class="pill">${esc(signal.leaning || "Leaning not provided")}</span></header><dl class="consumer-metrics"><div><dt>Mentions</dt><dd>${numberLabel(signal.mentions)}</dd></div><div><dt>Previous comparison</dt><dd>${numberLabel(signal.previousMentions)}</dd></div><div><dt>Mention change</dt><dd>${changeLabel(signal.mentionChange)}</dd></div><div><dt>Engagement</dt><dd>${numberLabel(signal.engagement)}</dd></div></dl><p class="consumer-polarity">Positive ${numberLabel(signal.positive)} · Negative ${numberLabel(signal.negative)} · Neutral ${numberLabel(signal.neutral)}</p><p class="consumer-polarity">Net polarity ${numberLabel(signal.net)} · Change ${changeLabel(signal.netChange)}</p>${signal.mentions != null && signal.mentions < 3 ? '<p class="consumer-note">Too few mentions to establish a trend.</p>' : ""}<details class="consumer-evidence"><summary>Matched terms & source examples</summary><p>Matching terms can also find unrelated brands or companies. Check the original before drawing a conclusion.</p><ul>${Object.entries(signal.terms).map(([term, count]) => `<li>${esc(term)} · ${count}</li>`).join("")}</ul>${signal.examples.map(example => `<div class="consumer-example">${example.url ? `<a href="${esc(example.url)}" target="_blank" rel="noopener noreferrer">${esc(example.title || example.source || "Source example")} ↗</a>` : `<span>${esc(example.title || "Source example")} · link unavailable</span>`}<small>${esc(example.source)} · ${esc(humanize(example.polarity))}</small></div>`).join("")}</details></article>`).join("")}</div>` : `<p class="section-empty">${report.consumerAvailable ? "No consumer mentions were included in this report. Check collection details for source coverage." : "This older report does not include consumer-signal output."}</p>`}</section>`;
}

export function diagnosticLabel(status) { return ({ ok: "Verified", no_data: "No data", not_run: "Not run", skipped: "Skipped", failed: "Failed", partial: "Partial" })[status] || humanize(status); }
export function coverageSummary(diagnostics) {
  const issues = diagnostics.filter(d => ["failed", "partial"].includes(d.status)).length;
  const quiet = diagnostics.filter(d => ["skipped", "no_data", "not_run"].includes(d.status)).length;
  return { issues, quiet };
}

export function renderExposure(a) {
  const esc = escapeHTML;
  return `${a.impacts.length ? `<h5>Business areas affected</h5><div class="tags">${a.impacts.map(value => `<span class="pill">${esc(humanize(value))}</span>`).join("")}</div>` : ""}${a.exposures?.length ? `<details class="reasoning"><summary>Company exposure links · ${a.exposures.length}</summary><ul>${a.exposures.map(e => `<li><b>${esc(e.term)}</b> · ${esc(humanize(e.type))} · ${esc(humanize(e.relationship))}${e.weight != null ? ` · matching weight ${e.weight}` : ""}${e.detail ? `<br>${esc(e.detail)}` : ""}</li>`).join("")}</ul></details>` : ""}`;
}

export function renderAIAnalysis(ai) {
  if (!ai) return "";
  const esc = escapeHTML;
  return `<section class="ai-analysis" aria-label="AI analysis">
    <header><div><span class="eyebrow">ADDITIONAL PERSPECTIVE</span><h5>AI analysis</h5></div><span class="ai-model">${[ai.provider && humanize(ai.provider), ai.model].filter(Boolean).map(esc).join(" · ") || "Model not provided"}</span></header>
    <p class="ai-caption">Generated commentary from the source report. The impact score, direction and confidence above are separate assessments.</p>
    <dl class="ai-effects">${ai.sections.map(section => `<div${section.key === "key_uncertainty" ? ' class="ai-uncertainty"' : ""}><dt>${esc(section.label)}</dt><dd>${esc(section.text)}</dd></div>`).join("")}</dl>
    ${ai.monitor.length ? `<div class="ai-monitor"><h5>Monitor next</h5><ul>${ai.monitor.map(value => `<li>${esc(value)}</li>`).join("")}</ul></div>` : ""}
    ${ai.redactions.length ? `<div class="ai-redactions"><h5>Source redactions</h5><ul>${ai.redactions.map(value => `<li>${esc(value)}</li>`).join("")}</ul></div>` : ""}
  </section>`;
}

export function renderAIOverview(report) {
  if (report.kind !== "equity") return "";
  const events = report.items.filter(item => item.assessments.some(a => a.ai));
  const analyses = events.flatMap(item => item.assessments.filter(a => a.ai));
  const diagnostic = report.diagnostics.find(d => d.name === "ai_enrichment");
  const runCounts = diagnostic?.attempted != null && diagnostic?.succeeded != null
    ? `${diagnostic.succeeded} of ${diagnostic.attempted} selected analyses completed in this run.` : "";
  const models = [...new Set(analyses.map(a => [a.ai.provider && humanize(a.ai.provider), a.ai.model].filter(Boolean).join(" · ")).filter(Boolean))];
  return `<section class="ai-overview" aria-labelledby="ai-overview-title"><div><span class="eyebrow">A CLOSER LOOK</span><h2 id="ai-overview-title">AI analysis</h2><p>${analyses.length
    ? `<b>${analyses.length} company ${analyses.length === 1 ? "analysis" : "analyses"}</b> across ${events.length} ${events.length === 1 ? "event" : "events"}. Open <b>Read analysis</b> for business effects, key uncertainties and what to monitor.`
    : "No AI analysis was included in this report. You can still read the source assessments below."}</p>
    ${models.length ? `<p class="ai-model">${models.map(escapeHTML).join(" / ")}</p>` : ""}
    ${runCounts ? `<p class="ai-run-status">${escapeHTML(runCounts)}${["failed", "partial"].includes(diagnostic.status) ? " Some AI analysis is unavailable; see collection details above." : ""}</p>` : ""}</div>
    ${analyses.length ? '<button class="button" data-show-ai>View AI analyses</button>' : ""}</section>`;
}
