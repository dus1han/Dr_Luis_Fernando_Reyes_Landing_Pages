"use client";

import { motion, useReducedMotion, type TargetAndTransition } from "motion/react";

export type TrustIconName = "certificate" | "shield" | "globe" | "heart";

/**
 * Line-art credential marks. Each one draws itself on when it scrolls
 * into view, then keeps a slow idle motion so the row stays alive
 * without ever pulling attention away from the copy.
 *
 * Strokes animate via pathLength, which Motion maps to
 * stroke-dasharray/offset — a compositor-friendly property, so a row of
 * four costs nothing measurable on scroll.
 */

const draw = (delay: number) => ({
  hidden: { pathLength: 0, opacity: 0 },
  show: {
    pathLength: 1,
    opacity: 1,
    transition: {
      pathLength: { duration: 1.1, delay, ease: [0.16, 1, 0.3, 1] as const },
      opacity: { duration: 0.25, delay },
    },
  },
});

const common = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.4,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function TrustIcon({ name }: { name: TrustIconName }) {
  const reduced = useReducedMotion();
  /** Idle loops are decorative only — silenced under reduced motion. */
  const idle = (v: TargetAndTransition) => (reduced ? undefined : v);

  return (
    <svg width="34" height="34" viewBox="0 0 24 24" aria-hidden className="overflow-visible">
      {name === "certificate" && (
        <>
          <motion.circle cx="12" cy="9" r="6" {...common} variants={draw(0)} />
          {/* Ribbon tails */}
          <motion.path d="M8.6 14.1 7.4 21.4l4.6-2.7 4.6 2.7-1.2-7.3" {...common} variants={draw(0.35)} />
          {/* The seal mark keeps a slow rotation, like a spinning medal */}
          <motion.g
            style={{ originX: "12px", originY: "9px" }}
            animate={idle({ rotate: [0, 360] })}
            transition={{ duration: 26, repeat: Infinity, ease: "linear" }}
          >
            <motion.path d="M12 5.6v1.2M12 11.2v1.2M8.6 9h1.2M14.2 9h1.2" {...common} variants={draw(0.6)} />
          </motion.g>
          <motion.path d="m9.9 9.2 1.5 1.5 2.9-3" {...common} variants={draw(0.75)} />
        </>
      )}

      {name === "shield" && (
        <>
          <motion.path
            d="M12 2.4 20 5.4v5.7c0 4.9-3.4 8.2-8 9.5-4.6-1.3-8-4.6-8-9.5V5.4Z"
            {...common}
            variants={draw(0)}
          />
          <motion.path d="m8.4 11.7 2.5 2.5 4.7-4.9" {...common} variants={draw(0.5)} />
          {/* Protective halo breathing outward */}
          <motion.path
            d="M12 2.4 20 5.4v5.7c0 4.9-3.4 8.2-8 9.5-4.6-1.3-8-4.6-8-9.5V5.4Z"
            {...common}
            strokeWidth={0.9}
            initial={{ opacity: 0 }}
            animate={idle({ opacity: [0, 0.4, 0], scale: [1, 1.16, 1.24] })}
            transition={{ duration: 3.4, repeat: Infinity, ease: "easeOut" }}
            style={{ originX: "12px", originY: "11px" }}
          />
        </>
      )}

      {name === "globe" && (
        <>
          <motion.circle cx="12" cy="12" r="9" {...common} variants={draw(0)} />
          <motion.path d="M3.4 9.2h17.2M3.4 14.8h17.2" {...common} variants={draw(0.3)} />
          {/* Meridian squashes side to side, reading as rotation. Stops
              well short of flat — collapsing further reads as a glitch. */}
          <motion.g
            animate={idle({ scaleX: [1, 0.45, 1] })}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
            style={{ originX: "12px", originY: "12px" }}
          >
            <motion.path d="M12 3c3.4 3.6 3.4 14.4 0 18" {...common} variants={draw(0.45)} />
            <motion.path d="M12 3c-3.4 3.6-3.4 14.4 0 18" {...common} variants={draw(0.45)} />
          </motion.g>
        </>
      )}

      {name === "heart" && (
        <>
          <motion.path
            d="M12 20.6C6 16.6 3 13.3 3 9.7a4.6 4.6 0 0 1 9-2.2 4.6 4.6 0 0 1 9 2.2c0 3.6-3 6.9-9 10.9Z"
            {...common}
            variants={draw(0)}
            animate={idle({ scale: [1, 1.07, 1, 1.04, 1] })}
            transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut", repeatDelay: 0.7 }}
            style={{ originX: "12px", originY: "13px" }}
          />
          <motion.path d="M5.4 11.9h3l1.3-2.4 1.9 4.4 1.6-2.9 1.1 0.9h3.3" {...common} variants={draw(0.55)} />
        </>
      )}
    </svg>
  );
}
