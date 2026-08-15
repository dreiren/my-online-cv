"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Background from "@/components/background/Background";
import ParticleLoader from "@/components/loader/ParticleLoader";
import LoadingHud from "@/components/loader/LoadingHud";
import DigitalConsole from "@/components/console/DigitalConsole";
import {
  ExperienceContext,
  type ExperiencePhase,
} from "@/components/experience/ExperienceContext";

export default function JarvisExperience() {
  const [phase, setPhase] = useState<ExperiencePhase>("boot");
  const [progress, setProgress] = useState(0);

  const beginSplash = useCallback(() => {
    setProgress(1);
    setPhase((current) => (current === "boot" ? "splash" : current));
  }, []);

  const beginConsole = useCallback(() => {
    setPhase((current) => (current === "splash" ? "console" : current));
  }, []);

  useEffect(() => {
    if (phase !== "boot") return;

    const start = performance.now();
    let frame = 0;

    const tick = (now: number) => {
      const next = Math.min(1, (now - start) / 4200);
      setProgress(next);
      if (next < 1) frame = window.requestAnimationFrame(tick);
    };

    frame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frame);
  }, [phase]);

  const value = useMemo(
    () => ({
      phase,
      progress,
      beginSplash,
      beginConsole,
    }),
    [phase, progress, beginSplash, beginConsole],
  );

  return (
    <ExperienceContext.Provider value={value}>
      <Background />
      <ParticleLoader />
      <LoadingHud />
      {phase === "console" ? <DigitalConsole /> : null}
    </ExperienceContext.Provider>
  );
}
