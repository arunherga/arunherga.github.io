// Shared by the server-rendered poster and the on-demand Remotion composition.
export const FILM_FPS = 30;
export const CHAPTER_FRAMES = 180;
export const filmChapters = [
  {
    label: "kgrep",
    title: "Find signal in the stream.",
    caption: "Search, inspect and export Kafka records.",
    nodes: ["Kafka topic", "kgrep", "Matches"],
    detail: "SEARCH → INSPECT → UNDERSTAND",
  },
  {
    label: "Terraform sandbox",
    title: "Test before the cloud.",
    caption: "Run Terraform workflows against a local mock.",
    nodes: ["Terraform", "Local mock", "Resources"],
    detail: "PLAN → APPLY → DESTROY",
  },
  {
    label: "Kafka latency",
    title: "Measure the journey.",
    caption: "Explore topic-wide and per-partition latency.",
    nodes: ["Producer", "Kafka", "Consumer"],
    detail: "PRODUCE → CONSUME → MEASURE",
  },
] as const;
export const FILM_FRAMES = CHAPTER_FRAMES * filmChapters.length;

export function WorkFilmFrame({ frame = 45, reducedMotion = false }: { frame?: number; reducedMotion?: boolean }) {
  const chapterIndex = Math.min(Math.floor(frame / CHAPTER_FRAMES), filmChapters.length - 1);
  const chapter = filmChapters[chapterIndex];
  const localFrame = frame % CHAPTER_FRAMES;
  const reveal = reducedMotion ? 1 : Math.min(1, localFrame / 12);
  const progress = (frame + 1) / FILM_FRAMES;
  const packetFrame = reducedMotion ? 45 : localFrame;

  return (
    <svg viewBox="0 0 960 600" width="100%" height="100%" aria-hidden="true" focusable="false">
      <defs>
        <pattern id="film-grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M40 0H0V40" fill="none" stroke="#294330" strokeWidth="1" /></pattern>
        <radialGradient id="film-glow"><stop stopColor="#365322" stopOpacity=".55" /><stop offset="1" stopColor="#142119" stopOpacity="0" /></radialGradient>
      </defs>
      <rect width="960" height="600" fill="#142119" />
      <rect width="960" height="600" fill="url(#film-grid)" opacity=".5" />
      <ellipse cx="480" cy="350" rx="440" ry="300" fill="url(#film-glow)" />
      <g fontFamily="Consolas, 'Liberation Mono', monospace">
        <circle cx="43" cy="40" r="5" fill="#c3ed78" />
        <text x="60" y="47" fill="#c4d1bc" fontSize="19" letterSpacing="2">ARUN BHAT / FIELD NOTES</text>
        <text x="918" y="47" textAnchor="end" fill="#a4b698" fontSize="19">0{chapterIndex + 1} / 03</text>
        <path d="M40 70H920" stroke="#3b5039" />
        <g opacity={reveal} transform={`translate(0 ${reducedMotion ? 0 : (1 - reveal) * 10})`}>
          <text x="42" y="120" fill="#c3ed78" fontSize="23">{chapter.label}</text>
          <text x="39" y="182" fill="#f3f6eb" fontFamily="Arial, Helvetica, sans-serif" fontSize="53" fontWeight="700" letterSpacing="-1.5">{chapter.title}</text>
          <text x="42" y="223" fill="#b7c7ad" fontSize="25">{chapter.caption}</text>
          <path d="M160 355H800" stroke="#6c8b57" strokeWidth="2" strokeDasharray="5 7" />
          {[0, 1].map((segment) => (
            <g key={segment}>
              {[0, 1, 2].map((packet) => {
                const phase = ((packetFrame + packet * 23) % 70) / 70;
                const muted = chapterIndex === 0 && segment === 0 && packet === 1;
                if (chapterIndex === 0 && segment === 1 && packet === 1) return null;
                return <rect key={packet} x={280 + segment * 320 + phase * 76} y={349} width="12" height="12" rx="3" fill={muted ? "#6b7c68" : "#c3ed78"} />;
              })}
              <path d={`M${segment === 0 ? 351 : 671} 348l8 7-8 7`} fill="none" stroke="#c3ed78" strokeWidth="2" />
            </g>
          ))}
          {chapter.nodes.map((node, index) => {
            const x = 40 + index * 320;
            return <g key={node}>
              <rect x={x} y="284" width="240" height="142" rx="9" fill={index === 1 ? "#273c24" : "#1a2c20"} stroke={index === 1 ? "#aed66d" : "#577348"} strokeWidth={index === 1 ? 2 : 1} />
              <text x={x + 20} y="316" fill="#9bb889" fontSize="17">0{index + 1}</text>
              <g transform={`translate(${x + 102} 311)`} fill="none" stroke="#c3ed78" strokeWidth="2">
                {chapterIndex === 0 && index === 1 ? <><circle cx="14" cy="14" r="11" /><path d="m22 23 10 10" /></> : chapterIndex === 1 && index === 1 ? <><path d="m18 0 18 10v21L18 41 0 31V10zM0 10l18 10 18-10M18 20v21" /></> : <><rect x="0" y="0" width="36" height="10" rx="2" /><rect x="0" y="16" width="36" height="10" rx="2" /><rect x="0" y="32" width="36" height="10" rx="2" /></>}
              </g>
              <text x={x + 120} y="396" textAnchor="middle" fill="#eef5e7" fontSize="29">{node}</text>
            </g>;
          })}
          {chapterIndex === 2 ? <g fill="#bfd2ae" fontSize="21"><path d="M160 445v15H800v-15" fill="none" stroke="#6c8b57" /><rect x="361" y="443" width="238" height="32" fill="#142119" /><text x="480" y="466" textAnchor="middle">Δt = received − sent</text></g> : <text x="480" y="467" fill="#bfd2ae" fontSize="21" letterSpacing="2" textAnchor="middle">{chapter.detail}</text>}
        </g>
        <path d="M40 510H920" stroke="#3b5039" />
        <path d={`M40 510H${40 + 880 * progress}`} stroke="#c3ed78" strokeWidth="3" />
        <text x="42" y="546" fill="#92a888" fontSize="18">CONCEPTUAL WALKTHROUGH</text>
        <text x="918" y="546" textAnchor="end" fill="#bfd2ae" fontSize="18">arunbhat.com/work</text>
      </g>
    </svg>
  );
}
