"use client";

import dynamic from "next/dynamic";
import { motion } from "framer-motion";

const DigitalWhiteSpaceScene = dynamic(
  () => import("./DigitalWhiteSpaceScene"),
  { ssr: false },
);

export default function Background() {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-white"
      aria-hidden="true"
    >
      <DigitalWhiteSpaceScene />

      <motion.div
        className="digital-scanlines absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.6, ease: "easeOut" }}
      />

      <motion.div
        className="digital-grain absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0.045, 0.07, 0.045] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="digital-vignette absolute inset-0" />
    </div>
  );
}
