"use client";

import { useCallback, useState } from "react";
import Background from "@/components/background/Background";
import Container from "@/components/Container";
import {
  SpaceFlightContext,
  type SpaceFlight,
} from "@/components/space/SpaceFlightContext";

const INITIAL_FLIGHT: SpaceFlight = {
  activeIndex: 0,
  fromIndex: 0,
  isFlying: true,
};

export default function SpaceExperience() {
  const [flight, setFlight] = useState<SpaceFlight>(INITIAL_FLIGHT);
  const onFlightChange = useCallback((next: SpaceFlight) => {
    setFlight(next);
  }, []);

  return (
    <SpaceFlightContext.Provider value={flight}>
      <Background />
      <Container onFlightChange={onFlightChange} />
    </SpaceFlightContext.Provider>
  );
}
