"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Activity, Box, Code2, Pause, Play, Rocket } from "lucide-react";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

const stages = [{ title: "Code", Icon: Code2 }, { title: "Build", Icon: Box }, { title: "Deploy", Icon: Rocket }, { title: "Observe", Icon: Activity }];

export function HeroSignal() {
  const [paused, setPaused] = useState(false);
  const [inView, setInView] = useState(true);
  const [tabVisible, setTabVisible] = useState(true);
  const reducedMotion = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting));
    observer.observe(ref.current);
    const onVisibility = () => setTabVisible(!document.hidden);
    document.addEventListener("visibilitychange", onVisibility);
    return () => { observer.disconnect(); document.removeEventListener("visibilitychange", onVisibility); };
  }, []);

  return <div ref={ref} className={`hero-signal${paused || !inView || !tabVisible || reducedMotion ? " is-paused" : ""}`}>
    <div className="signal-heading"><span>FROM AN IDEA TO A RUNNING PLATFORM</span><button type="button" disabled={reducedMotion} aria-label={reducedMotion ? "Homepage animation disabled by reduced motion preference" : paused ? "Play homepage animation" : "Pause homepage animation"} aria-pressed={paused || reducedMotion} onClick={() => setPaused(!paused)}>{paused || reducedMotion ? <Play size={13} /> : <Pause size={13} />}{reducedMotion ? "Motion off" : paused ? "Play" : "Pause"}</button></div>
    <div className="signal-track" aria-label="Code, build, deploy, observe">
      <div className="signal-rail" aria-hidden="true"><span className="signal-packet" /><span className="signal-packet trailing" /></div>
      {stages.map(({ title, Icon }, index) => <div key={title} className="signal-stage" style={{ "--stage-delay": `${index * 1.75}s` } as CSSProperties}><span className="signal-node" aria-hidden="true"><Icon size={19} strokeWidth={1.6} /></span><span>{title}</span></div>)}
    </div>
  </div>;
}
