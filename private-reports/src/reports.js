export const REPOSITORIES = Object.freeze({
  equity: "arunherga/global-equity-intelligence",
  recycling: "arunherga/plastic-recycling-intelligence",
});

export class ReportError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}

export function validDate(date) {
  return typeof date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(date) &&
    !Number.isNaN(Date.parse(date)) && new Date(date).toISOString().slice(0, 10) === date;
}

export function repository(kind) {
  if (!Object.hasOwn(REPOSITORIES, kind)) throw new ReportError(400, "Unknown report collection.");
  return REPOSITORIES[kind];
}

export function safeURL(value) {
  try {
    const url = new URL(value);
    return ["https:", "http:"].includes(url.protocol) && !url.username && !url.password ? url.href : "";
  } catch { return ""; }
}

const str = value => typeof value === "string" ? value : "";
const list = value => Array.isArray(value) ? value : [];
const strings = value => list(value).filter(v => typeof v === "string");
const num = value => typeof value === "number" && Number.isFinite(value) ? value : null;
const stats = value => Object.fromEntries(Object.entries(value || {}).filter(([, v]) => typeof v === "number" && Number.isFinite(v)));

export function normalizeReport(kind, raw, date) {
  repository(kind);
  const equity = kind === "equity";
  if (!raw || typeof raw !== "object" || (equity ? raw.run_date : raw.date) !== date ||
      !Array.isArray(equity ? raw.events : raw.articles)) {
    throw new ReportError(502, "The report format has changed or its date does not match. Please check the source report.");
  }
  const items = equity ? raw.events.map(event => ({
    id: str(event.event_id), title: str(event.title), summary: str(event.summary),
    date: str(event.event_date), categories: strings(event.event_types), locations: [],
    international: event.is_international === true,
    firstSeen: str(event.first_seen), updated: str(event.last_updated),
    sources: list(event.sources).map(source => ({ label: str(source.source_name) || str(source.source_domain) || "Source", url: safeURL(source.url), official: source.is_official === true })),
    assessments: Object.entries(event.stocks || {}).map(([ticker, value]) => ({
      ticker, score: num(value.impact_score), band: str(value.impact_band),
      direction: str(value.direction), confidence: num(value.confidence),
      relationship: str(value.relationship), horizon: str(value.time_horizon),
      why: str(value.why_it_matters), reasons: strings(value.score_reasons),
      directionReasons: strings(value.direction_reasons), confidenceReasons: strings(value.confidence_reasons),
      watch: strings(value.watch_next), impacts: strings(value.business_impacts),
    })).sort((a, b) => (b.score ?? -1) - (a.score ?? -1)),
    history: list(event.event_history).map(h => ({ date: str(h.timestamp), detail: str(h.detail), change: str(h.change) })),
  })) : raw.articles.filter(a => !a.duplicate_of).map(article => ({
    id: str(article.article_id), title: str(article.title),
    summary: str(article.ai_summary) || str(article.description),
    summaryKind: article.ai_summary ? "Source AI summary" : "Source description",
    date: str(article.published_at), categories: strings(article.category), locations: strings(article.location),
    score: num(article.relevance_score), reasons: strings(article.score_reasons),
    opportunity: article.business_opportunity === true, opportunityTypes: strings(article.opportunity_type),
    relatedCoverage: num(article.duplicate_count),
    sources: [{ label: str(article.source) || "Source", url: safeURL(article.url), official: false }],
    assessments: [], history: [],
  }));
  const diagnostics = equity ? list(raw.diagnostics).map(d => ({
    name: str(d.source), status: d.ok === false ? "failed" : list(d.errors).length ? "partial" : "ok",
    articles: num(d.articles), errors: strings(d.errors), note: str(d.note),
  })) : [
    ...strings(raw.stats?.sources_ok).map(name => ({ name, status: "ok", errors: [], note: "" })),
    ...strings(raw.stats?.source_errors).map(error => ({ name: "Collection issue", status: "failed", errors: [error], note: "" })),
  ];
  return {
    kind, date, generatedAt: str(equity ? raw.finished_at : raw.generated_at),
    dryRun: raw.dry_run === true, stats: stats(raw.stats), tickers: strings(raw.tickers),
    items, diagnostics, notes: equity ? [] : strings(raw.stats?.source_notes),
    sourceURL: `https://github.com/${repository(kind)}/blob/main/data/daily/${date}.json`,
  };
}

export function reportDates(listing) {
  if (!Array.isArray(listing)) throw new ReportError(502, "Could not read the report archive.");
  return [...new Set(listing.filter(f => f.type === "file" && /^\d{4}-\d{2}-\d{2}\.json$/.test(f.name))
    .map(f => f.name.slice(0, 10)).filter(validDate))].sort().reverse();
}

export async function githubJSON(kind, path, env, cache, fetcher = fetch) {
  const repo = repository(kind);
  if (path !== "data/daily" && !/^data\/daily\/\d{4}-\d{2}-\d{2}\.json$/.test(path)) {
    throw new ReportError(400, "Invalid report path.");
  }
  const url = `https://api.github.com/repos/${repo}/contents/${path}?ref=main`;
  const cacheKey = new Request(url);
  const cached = cache && await cache.match(cacheKey);
  if (cached) return cached.json();
  const headers = { "User-Agent": "Arun-Private-Intelligence", "Accept": "application/vnd.github.raw+json", "X-GitHub-Api-Version": "2022-11-28" };
  if (env.GITHUB_TOKEN) headers.Authorization = `Bearer ${env.GITHUB_TOKEN}`;
  let response;
  try {
    // Workers supports manual/follow, but rejects the browser's "error" mode.
    // Keep redirects manual so credentials never follow an upstream redirect.
    response = await fetcher(url, { headers, redirect: "manual", signal: AbortSignal.timeout(15000) });
  } catch (error) {
    const timedOut = ["TimeoutError", "AbortError"].includes(error?.name);
    throw new ReportError(502, timedOut
      ? "GitHub is taking too long to respond. Please try again shortly."
      : "The connection to GitHub could not be completed. Please try again shortly.");
  }
  if (!response.ok) {
    if (response.status === 404) throw new ReportError(404, "This report is not available in the repository.");
    if ([403, 429].includes(response.status)) throw new ReportError(503, "GitHub temporarily limited report requests. Please try again later.");
    throw new ReportError(502, "The source repository could not be reached. Please try again.");
  }
  const text = await response.text();
  if (text.length > 16000000) throw new ReportError(502, "This report is too large to display.");
  let data;
  try { data = JSON.parse(text); } catch { throw new ReportError(502, "The source returned an unreadable report."); }
  if (cache) await cache.put(cacheKey, new Response(text, { headers: { "Content-Type": "application/json", "Cache-Control": "max-age=300" } }));
  return data;
}
