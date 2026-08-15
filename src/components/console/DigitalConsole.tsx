"use client";

import { useEffect } from "react";
import { motion, useMotionTemplate, useSpring } from "framer-motion";
import ImageBlock from "./ImageBlock";
import DetailBlock from "./DetailBlock";
import { useExperience } from "@/components/experience/ExperienceContext";

export default function DigitalConsole() {
  const { pointer } = useExperience();
  const rotX = useSpring(0, { stiffness: 90, damping: 16, mass: 0.55 });
  const rotY = useSpring(0, { stiffness: 90, damping: 16, mass: 0.55 });
  const transX = useSpring(0, { stiffness: 70, damping: 18, mass: 0.7 });
  const transY = useSpring(0, { stiffness: 70, damping: 18, mass: 0.7 });
  const transZ = useSpring(0, { stiffness: 60, damping: 20, mass: 0.8 });

  const transform = useMotionTemplate`translate3d(${transX}px, ${transY}px, ${transZ}px) rotateX(${rotX}deg) rotateY(${rotY}deg)`;

  useEffect(() => {
    const onMove = (event: MouseEvent) => {
      const nx = event.clientX / window.innerWidth - 0.5;
      const ny = event.clientY / window.innerHeight - 0.5;
      pointer.current.x = nx * 2;
      pointer.current.y = -ny * 2;
      rotY.set(nx * 16);
      rotX.set(-ny * 11);
      transX.set(nx * 22);
      transY.set(ny * 16);
      transZ.set(18);
    };

    const onLeave = () => {
      rotX.set(0);
      rotY.set(0);
      transX.set(0);
      transY.set(0);
      transZ.set(0);
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseleave", onLeave);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseleave", onLeave);
    };
  }, [pointer, rotX, rotY, transX, transY, transZ]);

  return (
    <div className="console-space">
      <motion.article
        className="digital-console"
        style={{ transform, transformStyle: "preserve-3d" }}
        initial={{ opacity: 0, scale: 0.62, z: -180, filter: "blur(12px)" }}
        animate={{ opacity: 1, scale: 1, z: 0, filter: "blur(0px)" }}
        transition={{ duration: 1.15, ease: [0.22, 1, 0.36, 1] }}
        aria-label="Identity console"
      >
        <div className="digital-console__bezel">
          <span className="digital-console__corner tl" />
          <span className="digital-console__corner tr" />
          <span className="digital-console__corner bl" />
          <span className="digital-console__corner br" />
          <header className="digital-console__top">
            <span>J.A.R.V.I.S.</span>
            <span className="digital-console__pulse">LINK ESTABLISHED</span>
            <span>MOD.IDENTITY</span>
          </header>
          <div className="digital-console__grid">
            <ImageBlock />
            <DetailBlock />
          </div>
          <footer className="digital-console__top">
            <span>CAM.TRACK</span>
            <span>HOVER TO ORBIT</span>
            <span>SYS.READY</span>
          </footer>
        </div>
      </motion.article>
    </div>
  );
}
