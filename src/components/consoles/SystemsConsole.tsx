"use client";

import JarvisFrame from "./JarvisFrame";

type ConsoleProps = {
  active: boolean;
};

export default function SystemsConsole({ active }: ConsoleProps) {
  return (
    <JarvisFrame
      code="03"
      title="SYSTEMS"
      moduleId="MOD.PROTOCOL"
      width="min(50rem, 86vw)"
      height="min(32rem, 64vh)"
      accent="#48cae4"
      active={active}
    />
  );
}
