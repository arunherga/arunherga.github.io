import { escapeHTML as esc, humanize, assessmentFor, filterItems } from "./view.js";

const paths = {
  arrow: '<path d="M7 17 17 7M7 7h10v10"/>',
  back: '<path d="m12 5-7 7 7 7M5 12h14"/>',
  lock: '<rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3"/>',
  equity: '<path d="M3 3v18h18M6 15l5-5 4 3 6-8M17 5h4v4"/>',
  recycle: '<path d="m7 7 3-5h4l4 7M15 8l3 1 1-3M19 12l3 5-2 4h-8M14 18l-2 3 2 2M8 21H3l-2-4 4-7M2 11l3-1 2 3"/>',
  refresh: '<path d="M20 7v5h-5M4 17v-5h5M6 6a8 8 0 0 1 13 3M18 18A8 8 0 0 1 5 15"/>',
  search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>',
  down: '<path d="m6 9 6 6 6-6"/>',
  file: '<path d="M14 2H5v20h14V7l-5-5v5h5M8 12h8M8 16h6"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  alert: '<path d="m12 3 10 18H2L12 3ZM12 9v5M12 17h.01"/>',
  logout: '<path d="M9 4H4v16h5M9 12h12m-4-4 4 4-4 4"/>',
};
const icon = (name, cls = "") => `<svg class="icon ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || paths.file}</svg>`;
const meta = {
  equity: { title: "Equity intelligence", short: "Equity", eyebrow: "MARKETS / DAILY BRIEFING", description: "The events behind your watchlist. Read the context, understand the impact, and follow the sources.", repo: "global-equity-intelligence", icon: "equity" },
  recycling: { title: "Recycling intelligence", short: "Recycling", eyebrow: "INDUSTRY / DAILY BRIEFING", description: "A closer look at India’s recycling industry. Explore opportunities, regulation, and developments near home.", repo: "plastic-recycling-intelligence", icon: "recycle" },
};
const initialFilters = () => ({ search: "", priority: "relevant", ticker: "", direction: "", category: "", opportunity: false });
const state = { kind: "equity", dates: [], date: "", report: null, identity: null, loading: true, error: "", checkedAt: "", filters: initialFilters(), limit: 20 };
let controller;
const root = document.querySelector("#app");
const dateLabel = value => {
  if (!value) return "Unavailable";
  const date = new Date(value.length === 10 ? `${value}T12:00:00Z` : value);
  return Number.isNaN(date.getTime()) ? "Unavailable" : new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Kolkata" }).format(date);
};
const timeLabel = value => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Time unavailable" : new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Kolkata" }).format(date) + " IST";
};
const count = value => typeof value === "number" ? value.toLocaleString("en-IN") : "—";
const pill = (value, cls = "") => `<span class="pill ${cls}">${esc(value)}</span>`;
const textList = values => values.length ? `<ul>${values.map(value => `<li>${esc(value)}</li>`).join("")}</ul>` : '<p class="muted">Not provided by the source report.</p>';
const option = (value, label, selected) => `<option value="${esc(value)}" ${value === selected ? "selected" : ""}>${esc(label)}</option>`;

async function api(path, signal) {
  const response = await fetch(path, { credentials: "same-origin", cache: "no-store", redirect: "manual", signal });
  if (response.type === "opaqueredirect" || [401, 403].includes(response.status)) {
    const error = new Error("Your session has ended or this account does not have access. Sign in again to continue.");
    error.session = true;
    throw error;
  }
  let data;
  try { data = await response.json(); } catch { throw new Error("The server returned an unreadable response. Please try again."); }
  if (!response.ok) throw new Error(data.error || "Could not load this report.");
  return data;
}

function shell() {
  const m = meta[state.kind];
  root.innerHTML = `<div class="workspace ${state.kind}">
    <aside class="sidebar">
      <a href="https://arunbhat.com/" class="brand" aria-label="Arun Balakrishna Bhat portfolio"><span class="monogram">ab<span>_</span></span><span>ARUN’S<br><b>INTELLIGENCE</b></span></a>
      <div class="side-label">YOUR COLLECTIONS <span>02</span></div>
      <nav aria-label="Report collections">${Object.entries(meta).map(([key, value]) => `<button data-kind="${key}" ${state.kind === key ? 'aria-current="page"' : ""}>${icon(value.icon)}<span>${value.short}<small>${key === "equity" ? "Markets & watchlist" : "Industry & opportunities"}</small></span>${icon("arrow")}</button>`).join("")}</nav>
      <div class="side-note">${icon("lock")}<b>A space of your own.</b><p>Two research streams.<br>One quieter place to read.</p><span>PRIVATE WORKSPACE</span></div>
      <div class="side-bottom"><a href="https://arunbhat.com/">${icon("back")} Back to portfolio</a><span>ARUN BALAKRISHNA BHAT</span></div>
    </aside>
    <div class="workspace-body">
      <header class="topbar"><span>WORKSPACE <span class="slash">/</span> <b>${esc(m.short)}</b></span><div class="account"><span class="private-tag">${icon("lock")} Private</span><span class="account-name" title="${esc(state.identity?.email)}">Arun</span><a href="/cdn-cgi/access/logout" aria-label="Sign out" title="Sign out">${icon("logout")}</a></div></header>
      <main id="main" tabindex="-1">
        <section class="intro"><div><div class="eyebrow"><span class="tiny-square"></span>${m.eyebrow}</div><h1>${m.title}<span>.</span></h1><p>${m.description}</p></div><div class="intro-art" aria-hidden="true">${icon(m.icon)}<span>RESEARCH<br>IN FOCUS</span></div></section>
        <div class="report-toolbar"><div><label for="report-date">REPORT DATE</label><select id="report-date" ${state.loading || !state.dates.length ? "disabled" : ""}>${state.dates.length ? state.dates.map((date, i) => option(date, `${dateLabel(date)}${i === 0 ? " · Latest" : ""}`, state.date)).join("") : '<option>No report selected</option>'}</select></div><button class="button refresh" data-refresh ${state.loading ? "disabled" : ""}>${icon("refresh", state.loading ? "spin" : "")} ${state.loading ? "Loading" : "Refresh"}</button><span class="refresh-note">${state.checkedAt ? `Checked ${esc(timeLabel(state.checkedAt))}` : "Reading your repositories"}<small>Source updates may take up to 5 minutes to appear</small></span></div>
        <div id="report-content" aria-busy="${state.loading}"></div>
        <footer class="page-footer"><span>${icon("lock")} Access limited to approved accounts</span><span>Built for thoughtful reading.</span></footer>
      </main>
    </div>
  </div>`;
  renderReport();
}

function renderReport() {
  const content = document.querySelector("#report-content");
  if (state.loading) {
    content.innerHTML = '<div class="loading" role="status"><span class="loading-line"></span><h2>Gathering the briefing</h2><p>Reading the latest output from your repository…</p></div>';
    return;
  }
  if (state.error) {
    content.innerHTML = `<div class="empty error" role="alert">${icon("alert")}<h2>Couldn’t open this report</h2><p>${esc(state.error)}</p>${state.sessionError ? '<a class="button" href="/">Sign in again</a>' : '<button class="button" data-refresh>Try again</button>'}</div>`;
    return;
  }
  if (!state.report) {
    content.innerHTML = '<div class="empty"><h2>Your first report will appear here</h2><p>There are no daily reports in this collection yet.</p></div>';
    return;
  }
  const report = state.report;
  const equity = state.kind === "equity";
  const s = report.stats;
  const metrics = equity ? [["Articles scanned", s.articles_scanned, "Across configured sources"], ["Relevant events", s.relevant_events, "Source-reported count"], ["High impact", s.high_impact_events, "Source-reported count"], ["Critical events", s.critical_events, "Highest attention band"]] : [["Articles scanned", s.collected, "Before filtering and deduplication"], ["Relevant articles", s.relevant, "Relevance score of 4 or higher"], ["High priority", s.high_priority, "Relevance score of 8 or higher"], ["Opportunities", s.opportunities, "Flagged by the source report"]];
  const matchingRecords = filterItems(report, initialFilters()).length;
  const sourceCount = equity ? s.relevant_events : s.relevant;
  const issues = report.diagnostics.filter(d => d.status !== "ok").length;
  const generated = Date.parse(report.generatedAt);
  const stale = Number.isNaN(generated) || Date.now() - generated > 36 * 60 * 60 * 1000;
  const historical = state.date !== state.dates[0];
  content.innerHTML = `<div class="snapshot-meta"><span>${historical ? "ARCHIVED BRIEFING" : "LATEST AVAILABLE BRIEFING"} <b>${esc(dateLabel(report.date))}</b></span><span>Generated ${esc(timeLabel(report.generatedAt))}</span></div>
    ${report.dryRun ? '<div class="notice">This is a dry-run report from the source repository.</div>' : ""}
    ${stale && !historical ? '<div class="notice">This is the latest available output, but it is over 36 hours old or its generation time is unavailable. Refreshing here reads the repository; it does not run the collectors.</div>' : ""}
    <section class="metrics" aria-label="Report summary">${metrics.map(([label, value, detail], i) => `<div class="metric"><span class="metric-label">${label}<span>0${i + 1}</span></span><strong>${count(value)}</strong><small>${detail}</small></div>`).join("")}</section>
    ${sourceCount != null && sourceCount !== matchingRecords ? `<p class="reading-note">The collector reports ${count(sourceCount)} relevant findings; ${count(matchingRecords)} stored records meet this reader’s score filter. The summary above preserves the collector’s figures.</p>` : ""}
    <details class="source-health ${issues ? "has-issues" : ""}"><summary>${icon(issues ? "alert" : "check")}<span><b>${issues ? `Coverage needs attention · ${issues} source groups` : report.diagnostics.length ? "Sources checked · no errors reported" : "Source status unavailable"}</b><small>${issues ? "Some sources failed or returned partial results. Review before relying on this briefing." : "Open collection details and notes"}</small></span>${icon("down")}</summary><div class="health-details">${report.diagnostics.map(d => `<div><span class="health-status ${esc(d.status)}">${esc(humanize(d.status))}</span><h3>${esc(humanize(d.name))}</h3>${d.articles != null ? `<small>${count(d.articles)} items collected</small>` : ""}${d.errors.length ? textList(d.errors) : ""}${d.note ? `<p>${esc(d.note)}</p>` : ""}</div>`).join("")}${report.notes.length ? `<div class="collection-notes"><h3>Collection notes</h3>${textList(report.notes)}</div>` : ""}</div></details>
    <section class="findings"><div class="section-heading"><div><span class="eyebrow">THE READING ROOM</span><h2>${equity ? "Events worth your attention" : "Industry signals & opportunities"}</h2></div><a class="text-link" href="/api/report?kind=${state.kind}&date=${state.date}&download=1">${icon("file")} Download report</a></div>
    <p class="reading-note">${equity ? "Impact scores indicate attention, not investment recommendations. Direction and confidence come from your source analysis." : "Relevance scores and opportunity flags come from your collector. Open the original source to investigate a finding."}</p>
    <div class="filters"><label class="search-field"><span class="sr-only">Search findings</span>${icon("search")}<input type="search" name="search" placeholder="${equity ? "Search events, companies, topics…" : "Search news, locations, topics…"}" value="${esc(state.filters.search)}" /></label>
      <label>Priority<select name="priority">${option("relevant", "Relevant", state.filters.priority)}${option("high", "High priority", state.filters.priority)}${option("all", "All findings", state.filters.priority)}</select></label>
      ${equity ? `<label>Company<select name="ticker">${option("", "All companies", state.filters.ticker)}${report.tickers.map(t => option(t, t, state.filters.ticker)).join("")}</select></label><label>Direction<select name="direction">${option("", "All directions", state.filters.direction)}${["POSITIVE", "NEGATIVE", "MIXED", "UNCERTAIN"].map(d => option(d, humanize(d), state.filters.direction)).join("")}</select></label>` : `<label>Category<select name="category">${option("", "All categories", state.filters.category)}${[...new Set(report.items.flatMap(i => i.categories))].sort().map(c => option(c, humanize(c), state.filters.category)).join("")}</select></label><label class="checkbox"><input type="checkbox" name="opportunity" ${state.filters.opportunity ? "checked" : ""} /> Opportunities only</label>`}
    </div><div id="result-count" class="results-meta" aria-live="polite"></div><div id="results"></div></section>
    <div class="provenance"><span>${icon("file")}</span><div><b>From your repository, with the context intact.</b><p>Report dates, scores, explanations, and source links are preserved. A private dashboard does not change the visibility of files in the source repositories.</p><a href="${esc(report.sourceURL)}" target="_blank" rel="noopener noreferrer">View original data ${icon("arrow")}</a></div></div>`;
  renderResults();
}

function assessmentDetail(a) {
  return `<div class="assessment"><div class="assessment-title"><h4>${esc(a.ticker)}</h4>${pill(`${a.score ?? "—"}/15 impact`)}${pill(humanize(a.direction), `direction ${["POSITIVE", "NEGATIVE", "MIXED", "UNCERTAIN"].includes(a.direction) ? a.direction.toLowerCase() : ""}`)}</div><div class="analysis-meta"><span>Relationship <b>${esc(humanize(a.relationship) || "Not provided")}</b></span><span>Confidence <b>${a.confidence == null ? "Not provided" : Math.round(a.confidence * 100) + "%"}</b></span><span>Horizon <b>${esc(humanize(a.horizon) || "Not provided")}</b></span></div><h5>Why it matters</h5><p>${esc(a.why || "Not provided by the source report.")}</p><div class="analysis-columns"><div><h5>Score breakdown</h5>${textList(a.reasons)}</div><div><h5>Watch next</h5>${textList(a.watch)}</div></div><details class="reasoning"><summary>Direction & confidence reasoning ${icon("down")}</summary><div class="analysis-columns"><div>${textList(a.directionReasons)}</div><div>${textList(a.confidenceReasons)}</div></div></details></div>`;
}

function finding(item, index) {
  const equity = state.kind === "equity";
  const assessment = equity ? assessmentFor(item, state.filters) : null;
  const score = equity ? assessment.score : item.score;
  const prominent = score != null && score >= 8;
  const assessments = equity ? [assessment, ...item.assessments.filter(a => a !== assessment)] : [];
  return `<article class="finding"><div class="finding-index">${String(index + 1).padStart(2, "0")}</div><div class="finding-body"><div class="finding-top"><div class="tags">${equity ? pill(assessment.ticker, "company") : ""}${item.categories.slice(0, 2).map(c => pill(humanize(c))).join("")}${item.opportunity ? pill("Opportunity", "opportunity") : ""}${item.international ? pill("International") : ""}</div><span class="score ${prominent ? "high" : ""}" title="${equity ? "Impact" : "Relevance"} score">${equity ? "IMPACT" : "RELEVANCE"} <b>${score ?? "—"}${equity ? "<small>/15</small>" : ""}</b></span></div>
    <h3>${esc(item.title)}</h3><div class="finding-meta"><span>${esc(dateLabel(item.date))}</span><span>${esc(item.sources[0]?.label || "Source unavailable")}${item.sources.length > 1 ? ` +${item.sources.length - 1}` : ""}</span>${equity ? `<span>${esc(humanize(assessment.direction))} · ${assessment.confidence == null ? "Confidence unavailable" : Math.round(assessment.confidence * 100) + "% confidence"}</span>` : `<span>${esc(item.locations.join(" · "))}</span>`}</div>
    <p class="finding-excerpt">${esc(equity ? assessment.why || item.summary : item.summary)}</p>
    <details class="finding-detail"><summary>Read analysis ${icon("down")}<span>${equity && item.assessments.length > 1 ? `${item.assessments.length} companies affected` : item.sources.length + " linked source" + (item.sources.length === 1 ? "" : "s")}</span></summary><div class="detail-content"><div class="report-summary"><h4>${equity ? "Event summary" : esc(item.summaryKind)}</h4><p>${esc(item.summary || "No summary provided.")}</p></div>${equity ? assessments.map(assessmentDetail).join("") : `<div class="analysis-columns"><div><h4>Why it was selected</h4>${textList(item.reasons)}</div><div><h4>Opportunity context</h4>${item.opportunity ? textList(item.opportunityTypes) : "<p>No business opportunity was flagged in this report.</p>"}${item.relatedCoverage ? `<p>${count(item.relatedCoverage)} related duplicates recorded by the collector.</p>` : ""}</div></div>`}
      <div class="source-links"><h4>Go to the evidence</h4>${item.sources.map(source => source.url ? `<a href="${esc(source.url)}" target="_blank" rel="noopener noreferrer">${esc(source.label)} ${source.official ? pill("Official") : ""}${icon("arrow")}</a>` : `<span>${esc(source.label)} · link unavailable</span>`).join("")}</div>
      ${item.history.length ? `<details class="reasoning"><summary>Event history ${icon("down")}</summary><ul class="history">${item.history.map(h => `<li><time>${esc(timeLabel(h.date))}</time> ${esc(h.detail || humanize(h.change))}</li>`).join("")}</ul></details>` : ""}
      <span class="record-id">${esc(item.id)}</span></div></details></div></article>`;
}

function renderResults() {
  const items = filterItems(state.report, state.filters);
  document.querySelector("#result-count").innerHTML = `<span><b>${count(items.length)}</b> ${state.kind === "equity" ? "event" : "article"}${items.length === 1 ? " matches" : "s match"} your filters <span class="muted">· Highest score first</span></span><button class="reset-button" data-reset>Reset filters</button>`;
  document.querySelector("#results").innerHTML = items.length ? items.slice(0, state.limit).map(finding).join("") + (items.length > state.limit ? `<div class="load-more"><button class="button" data-more>Show ${Math.min(20, items.length - state.limit)} more findings ${icon("down")}</button><span>${state.limit} of ${items.length} shown</span></div>` : "") : `<div class="empty">${icon(state.kind === "equity" ? "equity" : "recycle")}<h3>No findings match these filters</h3><p>${state.filters.opportunity ? "No opportunities match this selection. You can still browse the other industry findings." : "Try another priority, company, category, or search term."}</p><button class="button" data-reset>Reset filters</button></div>`;
}

async function loadReport({ archive = true, date = "" } = {}) {
  controller?.abort();
  const current = new AbortController();
  controller = current;
  state.loading = true; state.error = ""; state.sessionError = false; state.report = null; state.limit = 20;
  if (date) state.date = date;
  shell();
  try {
    if (archive) {
      const listing = await api(`/api/reports?kind=${state.kind}`, current.signal);
      state.dates = listing.dates;
      if (!state.dates.includes(state.date)) state.date = state.dates[0] || "";
      state.checkedAt = listing.checkedAt;
    }
    if (state.date) state.report = await api(`/api/report?kind=${state.kind}&date=${state.date}`, current.signal);
  } catch (error) {
    if (current.signal.aborted) return;
    state.error = error.message; state.sessionError = error.session === true;
    if (state.sessionError) state.report = null;
  }
  if (current.signal.aborted) return;
  state.loading = false;
  shell();
}

root.addEventListener("click", event => {
  const target = event.target.closest("button");
  if (!target) return;
  if (target.dataset.kind && target.dataset.kind !== state.kind) {
    state.kind = target.dataset.kind; state.date = ""; state.dates = []; state.checkedAt = ""; state.filters = initialFilters(); loadReport();
  } else if (target.hasAttribute("data-refresh")) loadReport();
  else if (target.hasAttribute("data-reset")) { state.filters = initialFilters(); state.limit = 20; renderReport(); }
  else if (target.hasAttribute("data-more")) { state.limit += 20; renderResults(); }
});
root.addEventListener("change", event => {
  if (event.target.id === "report-date") { state.filters = initialFilters(); loadReport({ archive: false, date: event.target.value }); }
  else if (Object.hasOwn(state.filters, event.target.name)) {
    state.filters[event.target.name] = event.target.type === "checkbox" ? event.target.checked : event.target.value;
    state.limit = 20; renderResults();
  }
});
root.addEventListener("input", event => {
  if (event.target.name === "search") { state.filters.search = event.target.value; state.limit = 20; renderResults(); }
});
// Do not retain a report in a browser's back/forward cache after signing out.
window.addEventListener("pagehide", () => { controller?.abort(); state.report = null; root.replaceChildren(); });
window.addEventListener("pageshow", event => { if (event.persisted) window.location.reload(); });

try {
  state.identity = await api("/api/session");
  await loadReport();
} catch (error) {
  state.loading = false; state.error = error.message; state.sessionError = error.session === true; shell();
}
