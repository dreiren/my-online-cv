"use client";

import JarvisFrame from "./JarvisFrame";

export default function SystemsConsole() {
  return (
    <section id="systems" className="jarvis-section" aria-label="Systems">
      <JarvisFrame
        code="03"
        title="SYSTEMS"
        moduleId="MOD.PROTOCOL"
        width="min(50rem, 86vw)"
        height="min(32rem, 64vh)"
        accent="#48cae4"
      />
    </section>
  );
}
