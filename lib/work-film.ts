export const FILM_FPS = 30;
export const CHAPTER_FRAMES = 240;
export const filmChapters = [
  { label: "kgrep", title: "Find the records that matter.", caption: "A terminal that turns a stream into answers.", accent: "#c3ed78", background: "#142119", previewFrame: 205, transcript: "kgrep scans sample Kafka records, highlights matching order IDs, and exports the matching records to CSV." },
  { label: "Terraform sandbox", title: "Build. Test. Tear down.", caption: "A resource lifecycle, safely inside a local mock.", accent: "#c3acff", background: "#1c182c", previewFrame: 160, transcript: "Terraform plans a resource graph, creates an environment, cluster and dependent resources through the local mock provider, then destroys them in reverse order." },
  { label: "Kafka latency", title: "Make latency visible.", caption: "Compare timestamps. Look inside each partition.", accent: "#f8cd80", background: "#161f2c", previewFrame: 205, transcript: "The latency profiler compares T1 and T2 timestamps on sample messages, displays per-partition timing spans, and builds a distribution. The displayed timings are simulated examples, not project benchmarks." },
  { label: "Recycling intelligence", title: "From headlines to a daily brief.", caption: "Public sources. Local relevance. Clear reasons.", accent: "#7ce0cb", background: "#132b2c", previewFrame: 215, transcript: "The recycling intelligence agent collects news, trade feeds and government updates, removes duplicate articles, scores local relevance and creates a Markdown briefing covering opportunities, regulation and coastal Karnataka." },
] as const;
export const FILM_FRAMES = CHAPTER_FRAMES * filmChapters.length;
export const FILM_SECONDS = FILM_FRAMES / FILM_FPS;
export function formatFilmTime(seconds: number) {
  return `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, "0")}`;
}
