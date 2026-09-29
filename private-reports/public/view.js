export const escapeHTML = value => String(value ?? "").replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
export const humanize = value => String(value || "").toLowerCase().replace(/_/g, " ").replace(/\b\w/g, char => char.toUpperCase()).replace(/\b(Epr|Nse|Bse|Rss|Rbi|Ai|Ir)\b/g, word => word.toUpperCase());
export function assessmentFor(item, filters) {
  return item.assessments.filter(a => (!filters.ticker || a.ticker === filters.ticker) && (!filters.direction || a.direction === filters.direction) && (!filters.aiOnly || a.ai))
    .sort((a, b) => (b.score ?? -1) - (a.score ?? -1))[0];
}
export function filterItems(report, filters) {
  const equity = report.kind === "equity";
  const threshold = filters.priority === "high" ? 8 : filters.priority === "relevant" ? (equity ? 5 : 4) : 0;
  const query = filters.search.trim().toLowerCase();
  return report.items.filter(item => {
    const assessment = equity ? assessmentFor(item, filters) : undefined;
    if (equity && !assessment) return false;
    const score = equity ? assessment.score : item.score;
    if ((score === null && filters.priority !== "all") || (score !== null && score < threshold)) return false;
    if (filters.category && !item.categories.includes(filters.category)) return false;
    if (filters.opportunity && !item.opportunity) return false;
    return !query || [item.title, item.summary, ...item.locations, ...item.categories, ...item.assessments.flatMap(a => [a.ticker, ...(a.ai?.sections.map(section => section.text) ?? []), ...(a.ai?.monitor ?? [])])].join(" ").toLowerCase().includes(query);
  }).sort((a, b) => {
    const scoreA = equity ? assessmentFor(a, filters)?.score : a.score;
    const scoreB = equity ? assessmentFor(b, filters)?.score : b.score;
    return (scoreB ?? -1) - (scoreA ?? -1) || b.date.localeCompare(a.date);
  });
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
    ${runCounts ? `<p class="ai-run-status">${escapeHTML(runCounts)}${diagnostic.status !== "ok" ? " Some AI analysis is unavailable; see collection details above." : ""}</p>` : ""}</div>
    ${analyses.length ? '<button class="button" data-show-ai>View AI analyses</button>' : ""}</section>`;
}
