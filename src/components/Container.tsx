"use client";

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import {
  animate,
  motion,
  useMotionTemplate,
  useMotionValue,
  useTransform,
} from "framer-motion";
import IdentityConsole from "@/components/consoles/IdentityConsole";
import ExperienceConsole from "@/components/consoles/ExperienceConsole";
import SystemsConsole from "@/components/consoles/SystemsConsole";
import {
  cameraForPose,
  flightMidpoint,
  generateSpacePoses,
  introCamera,
  type CameraRig,
  type SpacePose,
} from "@/components/space/generatePoses";
import type { SpaceFlight } from "@/components/space/SpaceFlightContext";

const CONSOLE_COUNT = 3;

type ContainerProps = {
  onFlightChange?: (flight: SpaceFlight) => void;
};

export default function Container({ onFlightChange }: ContainerProps) {
  const [poses, setPoses] = useState<SpacePose[] | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isFlying, setIsFlying] = useState(true);

  const activeIndexRef = useRef(0);
  const flyingRef = useRef(true);
  const cameraRef = useRef<CameraRig | null>(null);
  const stopRef = useRef<Array<{ stop: () => void }>>([]);
  const timeoutRef = useRef(0);

  const camX = useMotionValue(0);
  const camY = useMotionValue(0);
  const camZ = useMotionValue(0);
  const camPitch = useMotionValue(0);
  const camYaw = useMotionValue(0);
  const camRoll = useMotionValue(0);

  const worldX = useTransform(camX, (value) => -value);
  const worldY = useTransform(camY, (value) => -value);
  const worldZ = useTransform(camZ, (value) => -value);
  const worldPitch = useTransform(camPitch, (value) => -value);
  const worldYaw = useTransform(camYaw, (value) => -value);
  const worldRoll = useTransform(camRoll, (value) => -value);

  const worldTransform = useMotionTemplate`rotateX(${worldPitch}deg) rotateY(${worldYaw}deg) rotateZ(${worldRoll}deg) translate3d(${worldX}px, ${worldY}px, ${worldZ}px)`;

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const nextPoses = generateSpacePoses();
      const first = cameraForPose(nextPoses[0]);
      const intro = introCamera(nextPoses[0]);

      cameraRef.current = intro;
      camX.set(intro.x);
      camY.set(intro.y);
      camZ.set(intro.z);
      camPitch.set(intro.pitch);
      camYaw.set(intro.yaw);
      camRoll.set(intro.roll);

      setPoses(nextPoses);
      fly(intro, first, 2.05);
    });

    return () => window.cancelAnimationFrame(frame);
    // fly is invoked only after mount to pick a fresh random layout.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    onFlightChange?.({
      activeIndex,
      fromIndex: activeIndexRef.current,
      isFlying,
    });
  }, [activeIndex, isFlying, onFlightChange]);

  function stopFlights() {
    stopRef.current.forEach((control) => control.stop());
    stopRef.current = [];
  }

  function fly(from: CameraRig, to: CameraRig, duration: number) {
    const mid = flightMidpoint(from, to);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    stopFlights();
    flyingRef.current = true;
    setIsFlying(true);

    if (reduced) {
      camX.set(to.x);
      camY.set(to.y);
      camZ.set(to.z);
      camPitch.set(to.pitch);
      camYaw.set(to.yaw);
      camRoll.set(to.roll);
      cameraRef.current = to;
      flyingRef.current = false;
      setIsFlying(false);
      return;
    }

    const transition = {
      duration,
      times: [0, 0.44, 1],
      ease: [0.42, 0.02, 0.18, 1] as const,
    };

    const channels: Array<[typeof camX, number, number, number]> = [
      [camX, from.x, mid.x, to.x],
      [camY, from.y, mid.y, to.y],
      [camZ, from.z, mid.z, to.z],
      [camPitch, from.pitch, mid.pitch, to.pitch],
      [camYaw, from.yaw, mid.yaw, to.yaw],
      [camRoll, from.roll, mid.roll, to.roll],
    ];

    stopRef.current = channels.map(([value, start, middle, end]) =>
      animate(value, [start, middle, end], transition),
    );

    window.clearTimeout(timeoutRef.current);
    timeoutRef.current = window.setTimeout(() => {
      cameraRef.current = to;
      flyingRef.current = false;
      setIsFlying(false);
    }, duration * 1000);
  }

  function goTo(index: number) {
    if (!poses || flyingRef.current) return;

    const next = Math.min(CONSOLE_COUNT - 1, Math.max(0, index));
    if (next === activeIndexRef.current) return;

    const from = cameraRef.current ?? cameraForPose(poses[activeIndexRef.current]);
    const to = cameraForPose(poses[next]);
    const compact = window.innerWidth < 768;

    activeIndexRef.current = next;
    setActiveIndex(next);
    fly(from, to, compact ? 1.35 : 1.8);
  }

  useEffect(() => {
    if (!poses) return;

    let touchStartY = 0;

    const onWheel = (event: WheelEvent) => {
      if (Math.abs(event.deltaY) < 10) return;
      event.preventDefault();
      goTo(activeIndexRef.current + (event.deltaY > 0 ? 1 : -1));
    };

    const onKeyDown = (event: KeyboardEvent) => {
      const forward = event.key === "ArrowDown" || event.key === "PageDown";
      const back = event.key === "ArrowUp" || event.key === "PageUp";
      if (!forward && !back) return;
      event.preventDefault();
      goTo(activeIndexRef.current + (forward ? 1 : -1));
    };

    const onTouchStart = (event: TouchEvent) => {
      touchStartY = event.touches[0]?.clientY ?? 0;
    };

    const onTouchEnd = (event: TouchEvent) => {
      const endY = event.changedTouches[0]?.clientY ?? touchStartY;
      const delta = touchStartY - endY;
      if (Math.abs(delta) < 48) return;
      goTo(activeIndexRef.current + (delta > 0 ? 1 : -1));
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });

    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchend", onTouchEnd);
      window.clearTimeout(timeoutRef.current);
      stopFlights();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [poses]);

  return (
    <main className="space-shell">
      <div className="space-viewport">
        <motion.div
          className="space-world"
          style={{ transform: worldTransform, transformStyle: "preserve-3d" }}
        >
          {poses ? (
            <>
              <SpaceSlot
                pose={poses[0]}
                active={activeIndex === 0}
                flying={isFlying}
                label="Identity"
              >
                <IdentityConsole active={activeIndex === 0} />
              </SpaceSlot>
              <SpaceSlot
                pose={poses[1]}
                active={activeIndex === 1}
                flying={isFlying}
                label="Experience"
              >
                <ExperienceConsole active={activeIndex === 1} />
              </SpaceSlot>
              <SpaceSlot
                pose={poses[2]}
                active={activeIndex === 2}
                flying={isFlying}
                label="Systems"
              >
                <SystemsConsole active={activeIndex === 2} />
              </SpaceSlot>
            </>
          ) : null}
        </motion.div>
      </div>
    </main>
  );
}

function SpaceSlot({
  pose,
  active,
  flying,
  label,
  children,
}: {
  pose: SpacePose;
  active: boolean;
  flying: boolean;
  label: string;
  children: ReactNode;
}) {
  return (
    <div
      className={`space-slot${active ? " is-active" : ""}${flying ? " is-flying" : ""}`}
      aria-hidden={!active}
      aria-label={label}
      style={
        {
          transform: `translate(-50%, -50%) translate3d(${pose.x}px, ${pose.y}px, ${pose.z}px) rotateX(${pose.rotateX}deg) rotateY(${pose.rotateY}deg) rotateZ(${pose.rotateZ}deg)`,
        } as CSSProperties
      }
    >
      <div className="space-slot__float">{children}</div>
    </div>
  );
}
