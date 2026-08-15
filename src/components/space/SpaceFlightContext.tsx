"use client";

import { createContext, useContext } from "react";

export type SpaceFlight = {
  activeIndex: number;
  fromIndex: number;
  isFlying: boolean;
};

export const SpaceFlightContext = createContext<SpaceFlight>({
  activeIndex: 0,
  fromIndex: 0,
  isFlying: false,
});

export function useSpaceFlight() {
  return useContext(SpaceFlightContext);
}
