"use client";

import JarvisFrame from "./JarvisFrame";

export default function IdentityConsole() {
  return (
    <section id="identity" className="jarvis-section" aria-label="Identity">
      <JarvisFrame
        code="01"
        title="IDENTITY"
        moduleId="MOD.BIOMETRIC"
        width="min(54rem, 88vw)"
        height="min(34rem, 68vh)"
        accent="#12c0e0"
      />
    </section>
  );
}
