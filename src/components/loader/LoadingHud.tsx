"use client";

import { motion } from "framer-motion";
import { useExperience } from "@/components/experience/ExperienceContext";

export default function LoadingHud() {
  const { phase, progress } = useExperience();

  if (phase === "console") return null;

  const percent = Math.round(progress * 100);

  return (
    <motion.div
      className="loading-hud"
      initial={{ opacity: 0 }}
      animate={{ opacity: phase === "splash" ? 0 : 1 }}
      transition={{ duration: 0.45, ease: "easeIn" }}
    >
      <p className="loading-hud__kicker">J.A.R.V.I.S. // CORE BOOT</p>
      <h1 className="loading-hud__title">Initializing</h1>
      <div className="loading-hud__bar" aria-hidden="true">
        <span style={{ width: `${percent}%` }} />
      </div>
      <p className="loading-hud__meta">
        {phase === "splash" ? "LINKING SPATIAL GRID" : `SYSTEMS ${percent}%`}
      </p>
      <p className="loading-hud__hint">Hover particles to interface</p>
    </motion.div>
  );
}
