export const escapeHTML = value => String(value ?? "").replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
export const humanize = value => String(value || "").toLowerCase().replace(/_/g, " ").replace(/\b\w/g, char => char.toUpperCase()).replace(/\b(Epr|Nse|Bse|Rss|Rbi|Ai|Ir)\b/g, word => word.toUpperCase());
export function assessmentFor(item, filters) {
  return item.assessments.filter(a => (!filters.ticker || a.ticker === filters.ticker) && (!filters.direction || a.direction === filters.direction))
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
    return !query || [item.title, item.summary, ...item.locations, ...item.categories, ...item.assessments.map(a => a.ticker)].join(" ").toLowerCase().includes(query);
  }).sort((a, b) => {
    const scoreA = equity ? assessmentFor(a, filters)?.score : a.score;
    const scoreB = equity ? assessmentFor(b, filters)?.score : b.score;
    return (scoreB ?? -1) - (scoreA ?? -1) || b.date.localeCompare(a.date);
  });
}
