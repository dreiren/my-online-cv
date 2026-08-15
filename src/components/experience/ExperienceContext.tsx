"use client";

import { createContext, useContext } from "react";

export type ExperiencePhase = "boot" | "splash" | "console";

export type ExperienceContextValue = {
  phase: ExperiencePhase;
  progress: number;
  beginSplash: () => void;
  beginConsole: () => void;
};

export const ExperienceContext = createContext<ExperienceContextValue | null>(
  null,
);

export function useExperience() {
  const value = useContext(ExperienceContext);
  if (!value) {
    throw new Error("useExperience must be used within JarvisExperience");
  }
  return value;
}
