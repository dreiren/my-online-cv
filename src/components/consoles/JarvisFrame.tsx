"use client";

import { type CSSProperties, type ReactNode } from "react";
import { motion, type Variants } from "framer-motion";

export type JarvisFrameProps = {
  children?: ReactNode;
  code: string;
  title: string;
  moduleId: string;
  width: string;
  height: string;
  accent?: string;
  active?: boolean;
};

const frameVariants = {
  idle: { opacity: 0.72, scale: 0.96 },
  online: {
    opacity: [0.72, 0.4, 1, 0.78, 1],
    scale: 1,
    transition: {
      duration: 0.72,
      times: [0, 0.18, 0.42, 0.64, 1],
      ease: "easeOut" as const,
    },
  },
} satisfies Variants;

const chromeVariants = {
  idle: { opacity: 0, y: -6 },
  online: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, delay: 0.12, ease: [0.22, 1, 0.36, 1] as const },
  },
} satisfies Variants;

const cornerVariants = {
  idle: { opacity: 0, scale: 0.45 },
  online: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.4, delay: 0.08, ease: [0.16, 1, 0.3, 1] as const },
  },
} satisfies Variants;

const scanVariants = {
  idle: { top: "-8%", opacity: 0 },
  online: {
    top: ["-8%", "108%"],
    opacity: [0, 0.85, 0],
    transition: {
      duration: 1.55,
      repeat: Infinity,
      repeatDelay: 3.4,
      ease: "easeInOut" as const,
    },
  },
} satisfies Variants;

export default function JarvisFrame({
  children,
  code,
  title,
  moduleId,
  width,
  height,
  accent = "#12c0e0",
  active = false,
}: JarvisFrameProps) {
  return (
    <motion.article
      className="jarvis-console"
      style={
        {
          "--console-width": width,
          "--console-height": height,
          "--jarvis-accent": accent,
        } as CSSProperties
      }
      variants={frameVariants}
      initial="idle"
      animate={active ? "online" : "idle"}
      aria-label={`${title} console`}
    >
      <motion.span
        className="jarvis-console__corner jarvis-console__corner--tl"
        variants={cornerVariants}
      />
      <motion.span
        className="jarvis-console__corner jarvis-console__corner--tr"
        variants={cornerVariants}
      />
      <motion.span
        className="jarvis-console__corner jarvis-console__corner--bl"
        variants={cornerVariants}
      />
      <motion.span
        className="jarvis-console__corner jarvis-console__corner--br"
        variants={cornerVariants}
      />

      <motion.header className="jarvis-console__chrome" variants={chromeVariants}>
        <div className="jarvis-console__mark">
          <span className="jarvis-console__code">{code}</span>
          <span className="jarvis-console__title">{title}</span>
        </div>
        <div className="jarvis-console__status">
          <span className="jarvis-console__module">{moduleId}</span>
          <span className="jarvis-console__live">
            {active ? "ONLINE" : "STANDBY"}
          </span>
        </div>
      </motion.header>

      <div className="jarvis-console__viewport">{children}</div>

      <motion.footer className="jarvis-console__chrome" variants={chromeVariants}>
        <span>J.A.R.V.I.S. // LINK</span>
        <span className="jarvis-console__size">SIZE.FLEX</span>
        <span>{active ? "SYS.READY" : "SYS.IDLE"}</span>
      </motion.footer>

      <span className="jarvis-console__arc" />
      <span className="jarvis-console__ticks" />

      <motion.span className="jarvis-console__scan" variants={scanVariants} />
    </motion.article>
  );
}
