"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";

type ContainerProps = {
  children?: ReactNode;
};

export default function Container({ children }: ContainerProps) {
  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
      className="relative z-10 mx-auto min-h-screen w-full max-w-5xl px-6 py-24"
    >
      {children}
    </motion.main>
  );
}
