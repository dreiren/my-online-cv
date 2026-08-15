"use client";

import JarvisFrame from "./JarvisFrame";

type ConsoleProps = {
  active: boolean;
};

export default function ExperienceConsole({ active }: ConsoleProps) {
  return (
    <JarvisFrame
      code="02"
      title="EXPERIENCE"
      moduleId="MOD.ARCHIVE"
      width="min(58rem, 90vw)"
      height="min(36rem, 70vh)"
      accent="#0096c7"
      active={active}
    />
  );
}
