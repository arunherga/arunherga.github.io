"use client";

import { useState, useSyncExternalStore, type ComponentType } from "react";
import { ArrowDown, Play } from "lucide-react";
import { WorkFilmFrame } from "./work-film-frame";

function subscribeToMotion(callback: () => void) {
  const query = window.matchMedia("(prefers-reduced-motion: reduce)");
  query.addEventListener("change", callback);
  return () => query.removeEventListener("change", callback);
}

export function WorkShowcase() {
  const [FilmPlayer, setFilmPlayer] = useState<ComponentType<{ reducedMotion: boolean }> | null>(null);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  const reducedMotion = useSyncExternalStore(subscribeToMotion, () => window.matchMedia("(prefers-reduced-motion: reduce)").matches, () => false);

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
    <div className="showcase-heading"><div><p className="eyebrow">18 SECONDS / THREE TOOLS</p><h2 id="showcase-title">See the systems in motion.</h2></div><a className="button-text" href="#projects">Jump to projects <ArrowDown size={15} /></a></div>
    <div className="film-shell" aria-label="Animated project walkthrough">
      {FilmPlayer ? <FilmPlayer reducedMotion={reducedMotion} /> : <button type="button" className="film-poster" onClick={openFilm} disabled={loading} aria-label={reducedMotion ? "Open project walkthrough with reduced motion" : "Play 18-second project walkthrough"}>
        <WorkFilmFrame />
        <span className="film-play"><Play size={19} fill="currentColor" aria-hidden="true" />{loading ? "Loading walkthrough…" : failed ? "Try again" : reducedMotion ? "Open walkthrough" : "Play walkthrough"}<span>0:18</span></span>
      </button>}
    </div>
    <div className="film-caption"><p>A visual introduction to the problems these tools solve.</p><span>Silent · Play at your pace</span></div>
    <p className="sr-only" role="status">{loading ? "Loading walkthrough" : failed ? "The walkthrough could not load. Try again, or read the projects below." : FilmPlayer ? "Walkthrough ready" : ""}</p>
    {reducedMotion && <p className="film-accessibility-note">Reduced motion is on. Playback starts paused; select a chapter to view its diagram.</p>}
    {failed && <p className="film-accessibility-note">The walkthrough could not load. Try again or explore the projects below.</p>}
    <details className="film-transcript"><summary>Read the walkthrough</summary><ol><li><strong>kgrep:</strong> Find matching records in Kafka topics, inspect the stream, and export what you need.</li><li><strong>confluent-terraform-mock:</strong> Exercise Terraform plan, apply, and destroy workflows against a local Confluent Cloud mock.</li><li><strong>KafkaEndToEndLatency:</strong> Measure message latency and examine results across topics and partitions.</li></ol></details>
  </section>;
}
