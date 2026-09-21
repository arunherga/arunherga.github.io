"use client";

import { useEffect, useRef, useState } from "react";
import { Player, type PlayerRef } from "@remotion/player";
import { useCurrentFrame } from "remotion";
import { Maximize, Pause, Play, RotateCcw } from "lucide-react";
import { CHAPTER_FRAMES, FILM_FPS, FILM_FRAMES, filmChapters, WorkFilmFrame } from "./work-film-frame";

function WorkComposition({ reducedMotion }: { reducedMotion: boolean }) {
  return <WorkFilmFrame frame={useCurrentFrame()} reducedMotion={reducedMotion} />;
}

export default function WorkFilmPlayer({ reducedMotion }: { reducedMotion: boolean }) {
  const playerRef = useRef<PlayerRef>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [frame, setFrame] = useState(0);
  const [playing, setPlaying] = useState(!reducedMotion);
  const [fullscreenError, setFullscreenError] = useState(false);
  const chapter = Math.min(2, Math.floor(frame / CHAPTER_FRAMES));

  useEffect(() => { if (reducedMotion) playerRef.current?.pause(); }, [reducedMotion]);

  useEffect(() => {
    const player = playerRef.current;
    const wrapper = wrapperRef.current;
    if (!player || !wrapper) return;
    // Move keyboard focus from the poster to the actual playback controls.
    wrapper.querySelector<HTMLButtonElement>("button")?.focus({ preventScroll: true });
    const onFrame = ({ detail }: { detail: { frame: number } }) => setFrame(detail.frame);
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const pauseWhenHidden = () => { if (document.hidden) player.pause(); };
    const observer = new IntersectionObserver(([entry]) => { if (!entry.isIntersecting) player.pause(); });
    observer.observe(wrapper);
    player.addEventListener("frameupdate", onFrame);
    player.addEventListener("play", onPlay);
    player.addEventListener("pause", onPause);
    player.addEventListener("ended", onPause);
    document.addEventListener("visibilitychange", pauseWhenHidden);
    return () => {
      observer.disconnect();
      player.removeEventListener("frameupdate", onFrame);
      player.removeEventListener("play", onPlay);
      player.removeEventListener("pause", onPause);
      player.removeEventListener("ended", onPause);
      document.removeEventListener("visibilitychange", pauseWhenHidden);
    };
  }, []);

  async function toggleFullscreen() {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await wrapperRef.current?.requestFullscreen();
      setFullscreenError(false);
    } catch { setFullscreenError(true); }
  }

  return <div ref={wrapperRef} className="film-player">
    <div className="film-stage">
    <Player
      ref={playerRef}
      component={WorkComposition}
      inputProps={{ reducedMotion }}
      durationInFrames={FILM_FRAMES}
      compositionWidth={960}
      compositionHeight={600}
      fps={FILM_FPS}
      controls={false}
      clickToPlay
      autoPlay={!reducedMotion}
      initiallyMuted
      acknowledgeRemotionLicense
      showVolumeControls={false}
      numberOfSharedAudioTags={0}
      moveToBeginningWhenEnded={false}
      style={{ width: "100%", aspectRatio: "8 / 5" }}
      errorFallback={() => <div className="film-error">The walkthrough could not play. You can read about all three projects below.</div>}
    />
    </div>
    <div className="film-controls" aria-label="Playback controls">
      <button type="button" aria-label={playing ? "Pause walkthrough" : "Play walkthrough"} onClick={() => playerRef.current?.toggle()}>{playing ? <Pause size={18} /> : <Play size={18} />}</button>
      <button type="button" aria-label="Restart walkthrough" onClick={() => { playerRef.current?.seekTo(0); playerRef.current?.play(); }}><RotateCcw size={16} /></button>
      <input type="range" min="0" max={FILM_FRAMES - 1} value={frame} aria-label="Walkthrough position" aria-valuetext={`${Math.round(frame / FILM_FPS)} of 18 seconds`} onChange={(event) => { playerRef.current?.pause(); playerRef.current?.seekTo(Number(event.target.value)); }} />
      <span className="film-time" aria-hidden="true">0:{String(Math.round(frame / FILM_FPS)).padStart(2, "0")} / 0:18</span>
      <button type="button" aria-label="Toggle walkthrough fullscreen" onClick={toggleFullscreen}><Maximize size={17} /></button>
    </div>
    {fullscreenError && <p className="film-control-note" role="status">Fullscreen is unavailable in this browser. The walkthrough can still play here.</p>}
    <div className="film-chapters" aria-label="Walkthrough chapters">
      {filmChapters.map((item, index) => <button type="button" key={item.label} aria-current={chapter === index ? "step" : undefined} onClick={() => { playerRef.current?.pause(); playerRef.current?.seekTo(index * CHAPTER_FRAMES + 30); }}><span>0{index + 1}</span>{item.label}</button>)}
    </div>
  </div>;
}
