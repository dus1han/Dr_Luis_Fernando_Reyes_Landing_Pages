"use client";

import { motion, useScroll, useSpring } from "motion/react";

/** Gold hairline across the top of the viewport tracking read progress. */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 220,
    damping: 34,
    restDelta: 0.001,
  });

  return (
    <motion.div
      aria-hidden
      style={{ scaleX }}
      className="fixed inset-x-0 top-0 z-70 h-[2px] origin-left bg-linear-to-r from-gold to-gold-light"
    />
  );
}
