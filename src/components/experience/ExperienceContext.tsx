"use client";

import { createContext, useContext, type MutableRefObject } from "react";

export type ExperiencePhase = "boot" | "splash" | "console";

export type ExperienceContextValue = {
  phase: ExperiencePhase;
  progress: number;
  pointer: MutableRefObject<{ x: number; y: number }>;
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
