import { useId } from "react";
import { profile } from "@/lib/portfolio";
import { CHAPTER_FRAMES, FILM_FRAMES, filmChapters } from "@/lib/work-film";
import { SearchScene, TerraformScene, LatencyScene, RecyclingScene } from "./work-scenes";

const scenes = [SearchScene, TerraformScene, LatencyScene, RecyclingScene];

// A shared frame keeps the film cohesive; every project has its own scene.
export function WorkFilmFrame({ frame = 205, reducedMotion = false }: { frame?: number; reducedMotion?: boolean }) {
  const gridId = useId();
  const safeFrame = Math.max(0, Math.min(FILM_FRAMES - 1, frame));
  const index = Math.floor(safeFrame / CHAPTER_FRAMES);
  const chapter = filmChapters[index];
  const localFrame = reducedMotion ? chapter.previewFrame : safeFrame % CHAPTER_FRAMES;
  const Scene = scenes[index];
  return <svg viewBox="0 0 960 600" width="100%" height="100%" aria-hidden="true" focusable="false">
    <defs><pattern id={gridId} width="40" height="40" patternUnits="userSpaceOnUse"><path d="M40 0H0V40" fill="none" stroke={chapter.accent} strokeWidth=".6" /></pattern></defs>
    <rect width="960" height="600" fill={chapter.background} /><rect width="960" height="600" fill={`url(#${gridId})`} opacity=".07" />
    <g fontFamily="Consolas, 'Liberation Mono', monospace">
      <circle cx="43" cy="40" r="5" fill={chapter.accent} /><text x="60" y="46" fill="#c4d1cb" fontSize="17" letterSpacing="1.3">{profile.name.toUpperCase()} / FIELD NOTES</text><text x="918" y="46" textAnchor="end" fill={chapter.accent} fontSize="18">0{index + 1} / 0{filmChapters.length}</text>
      <path d="M40 70H920" stroke={chapter.accent} opacity=".25" /><text x="42" y="117" fill={chapter.accent} fontSize="23">{chapter.label}</text><text x="39" y="175" fill="#f3f6eb" fontFamily="Arial, Helvetica, sans-serif" fontSize="48" fontWeight="700" letterSpacing="-1.5">{chapter.title}</text><text x="42" y="214" fill="#b7c7c0" fontSize="23">{chapter.caption}</text>
      <Scene frame={localFrame} />
      <path d="M40 525H920" stroke={chapter.accent} opacity=".25" /><path d={`M40 525H${40 + 880 * (safeFrame + 1) / FILM_FRAMES}`} stroke={chapter.accent} strokeWidth="3" /><text x="42" y="552" fill="#a8b8ae" fontSize="16">ILLUSTRATED WORKFLOW</text><text x="918" y="552" textAnchor="end" fill={chapter.accent} fontSize="16">arunbhat.com/work</text>
    </g>
  </svg>;
}
