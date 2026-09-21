"use client";

import { useState, type ComponentType } from "react";
import { ArrowDown, Play } from "lucide-react";
import { WorkFilmFrame } from "./work-film-frame";
import { CHAPTER_FRAMES, FILM_SECONDS, filmChapters, formatFilmTime } from "@/lib/work-film";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

export function WorkShowcase() {
  const [FilmPlayer, setFilmPlayer] = useState<ComponentType<{ reducedMotion: boolean; initialChapter: number }> | null>(null);
  const [selectedChapter, setSelectedChapter] = useState(0);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  const reducedMotion = useReducedMotion();

  async function openFilm() {
    setLoading(true);
    setFailed(false);
    try {
      // Deliberately load the player only after a click, never on page load.
      const loadedPlayer = await import("./work-film-player");
      setFilmPlayer(() => loadedPlayer.default);
    } catch {
      setFailed(true);
    } finally {
      setLoading(false);
    }
  }

  return <section className="work-showcase wrap" id="in-motion" aria-labelledby="showcase-title">
    <div className="showcase-heading"><div><p className="eyebrow">{FILM_SECONDS} SECONDS / FOUR PROJECTS</p><h2 id="showcase-title">Different problems. Different tools.</h2></div><a className="button-text" href="#projects">Jump to projects <ArrowDown size={15} /></a></div>
    <div className="film-shell" aria-label="Animated project walkthrough">
      {FilmPlayer ? <FilmPlayer reducedMotion={reducedMotion} initialChapter={selectedChapter} /> : <>
        <button type="button" className="film-poster" onClick={openFilm} disabled={loading} aria-label={`${reducedMotion ? "Open" : "Play"} ${filmChapters[selectedChapter].label} walkthrough`}>
          <WorkFilmFrame frame={selectedChapter * CHAPTER_FRAMES + filmChapters[selectedChapter].previewFrame} />
          <span className="film-play"><Play size={19} fill="currentColor" aria-hidden="true" />{loading ? "Loading walkthrough…" : failed ? "Try again" : reducedMotion ? "Open walkthrough" : "Play walkthrough"}<span>{formatFilmTime(FILM_SECONDS)}</span></span>
        </button>
        <div className="film-chapters" aria-label="Choose a project preview">{filmChapters.map((chapter, index) => <button key={chapter.label} type="button" aria-pressed={selectedChapter === index} disabled={loading} onClick={() => setSelectedChapter(index)}><span>0{index + 1}</span>{chapter.label}</button>)}</div>
      </>}
    </div>
    <div className="film-caption"><p>Choose a project to explore its own illustrated workflow.</p><span>Silent · Play at your pace</span></div>
    <p className="sr-only" role="status">{loading ? "Loading walkthrough" : failed ? "The walkthrough could not load. Try again, or read the projects below." : FilmPlayer ? "Walkthrough ready" : ""}</p>
    {reducedMotion && <p className="film-accessibility-note">Reduced motion is on. Playback starts paused; select a chapter to view its diagram.</p>}
    {failed && <p className="film-accessibility-note">The walkthrough could not load. Try again or explore the projects below.</p>}
    <details className="film-transcript"><summary>Read the walkthrough</summary><ol>{filmChapters.map(chapter => <li key={chapter.label}><strong>{chapter.label}:</strong> {chapter.transcript}</li>)}</ol></details>
  </section>;
}
