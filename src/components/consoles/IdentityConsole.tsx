"use client";

import JarvisFrame from "./JarvisFrame";

type ConsoleProps = {
  active: boolean;
};

export default function IdentityConsole({ active }: ConsoleProps) {
  return (
    <JarvisFrame
      code="01"
      title="IDENTITY"
      moduleId="MOD.BIOMETRIC"
      width="min(54rem, 88vw)"
      height="min(34rem, 68vh)"
      accent="#12c0e0"
      active={active}
    />
  );
}
