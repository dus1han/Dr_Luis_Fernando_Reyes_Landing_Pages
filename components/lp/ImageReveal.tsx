"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";
import { EASE_OUT_SOFT, inView } from "@/lib/motion";

/**
 * Reveals an image by sliding a solid "curtain" up off it while the image
 * settles out of a slight overscale.
 *
 * Deliberately not clip-path: when `whileInView` fires, Motion reads the
 * element's *computed* clip-path as the animation origin, and the browser
 * collapses `inset(0 0 100% 0)` to a shorter form that no longer matches
 * the target's argument count — so the tween silently never runs. A
 * transform-driven curtain has no such parsing dependency, and scaleY is
 * cheaper to composite than animating clip-path every frame.
 */
export function ImageReveal({
  children,
  /** Must match the section background, or the curtain will be visible. */
  curtain,
  className = "",
  delay = 0,
}: {
  children: ReactNode;
  curtain: string;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial="hidden"
      whileInView="show"
      viewport={inView}
      className={`relative overflow-hidden ${className}`}
    >
      <motion.div
        variants={{
          hidden: { scale: 1.08 },
          show: {
            scale: 1,
            transition: { duration: 1.25, delay, ease: EASE_OUT_SOFT },
          },
        }}
        className="will-change-transform"
      >
        {children}
      </motion.div>

      <motion.span
        aria-hidden
        className={`pointer-events-none absolute inset-0 origin-bottom will-change-transform ${curtain}`}
        variants={{
          hidden: { scaleY: 1 },
          show: {
            scaleY: 0,
            transition: { duration: 1.05, delay, ease: EASE_OUT_SOFT },
          },
        }}
      />
    </motion.div>
  );
}
