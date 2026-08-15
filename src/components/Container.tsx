"use client";

import { useEffect, useRef } from "react";
import IdentityConsole from "@/components/consoles/IdentityConsole";
import ExperienceConsole from "@/components/consoles/ExperienceConsole";
import SystemsConsole from "@/components/consoles/SystemsConsole";

const SECTION_COUNT = 3;

export default function Container() {
  const scrollerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const root = scrollerRef.current;
    if (!root) return;

    let locked = false;
    let lockTimer = 0;

    const currentIndex = () =>
      Math.round(root.scrollTop / Math.max(root.clientHeight, 1));

    const goTo = (index: number) => {
      const next = Math.min(SECTION_COUNT - 1, Math.max(0, index));
      root.scrollTo({ top: next * root.clientHeight, behavior: "smooth" });
    };

    const lockFor = (ms: number) => {
      locked = true;
      window.clearTimeout(lockTimer);
      lockTimer = window.setTimeout(() => {
        locked = false;
      }, ms);
    };

    const onWheel = (event: WheelEvent) => {
      if (Math.abs(event.deltaY) < 10) return;
      event.preventDefault();
      if (locked) return;

      goTo(currentIndex() + (event.deltaY > 0 ? 1 : -1));
      lockFor(720);
    };

    const onKeyDown = (event: KeyboardEvent) => {
      const forward = event.key === "ArrowDown" || event.key === "PageDown";
      const back = event.key === "ArrowUp" || event.key === "PageUp";
      if (!forward && !back) return;

      event.preventDefault();
      if (locked) return;

      goTo(currentIndex() + (forward ? 1 : -1));
      lockFor(720);
    };

    root.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("keydown", onKeyDown);

    return () => {
      root.removeEventListener("wheel", onWheel);
      window.removeEventListener("keydown", onKeyDown);
      window.clearTimeout(lockTimer);
    };
  }, []);

  return (
    <main ref={scrollerRef} className="jarvis-scroller">
      <IdentityConsole />
      <ExperienceConsole />
      <SystemsConsole />
    </main>
  );
}
