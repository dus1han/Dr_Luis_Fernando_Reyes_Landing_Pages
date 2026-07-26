"use client";

import { motion, useReducedMotion } from "motion/react";

/**
 * Vertical light columns behind the hero.
 *
 * Two kinds of element, deliberately mixed:
 *   • hairlines — 1–2px, sharp, gold at low alpha
 *   • bands — 40–90px, softly blurred, champagne or blush
 *
 * The mix is what stops it reading as a barcode: sharp lines give it
 * precision, soft bands give it depth. Every column is masked to fade
 * out at the top and bottom, so nothing ever terminates in a hard edge
 * against the section boundary.
 *
 * Density is deliberately uneven. The 34–66% range — directly behind the
 * centred headline — carries only three very faint columns, so the type
 * never competes with the pattern. The strong material sits at the edges
 * where it is seen peripherally.
 *
 * Colours all sit *below* ivory in lightness (champagne, blush, gold),
 * so a column reads as a band of warm light rather than a white smear
 * on a near-white panel.
 *
 * Each column only breathes and drifts in place. Nothing travels across
 * the panel — a sweeping line pulls the eye horizontally, away from the
 * headline it is supposed to sit behind.
 *
 * Transform and opacity only; `pointer-events-none` throughout.
 */

type Column = {
  left: string;
  /** px for hairlines, px for soft bands — width drives which it reads as. */
  width: number;
  color: string;
  /** Blur radius; 0 keeps the edge crisp. */
  blur: number;
  /** Opacity floor and ceiling for the breathing cycle. */
  from: number;
  to: number;
  /** Horizontal travel in px. */
  drift: number;
  duration: number;
  delay: number;
};

const GOLD = "var(--color-gold)";
const CHAMPAGNE = "var(--color-champagne)";
const BLUSH = "var(--color-blush)";

const COLUMNS: Column[] = [
  // ---- left field: dense ----
  { left: "3%", width: 1, color: GOLD, blur: 0, from: 0.14, to: 0.72, drift: 34, duration: 8, delay: 0 },
  { left: "6.5%", width: 62, color: CHAMPAGNE, blur: 22, from: 0.22, to: 1, drift: 58, duration: 10, delay: -4 },
  { left: "11%", width: 2, color: GOLD, blur: 0, from: 0.06, to: 0.5, drift: -30, duration: 9, delay: -7 },
  { left: "15%", width: 40, color: BLUSH, blur: 16, from: 0.18, to: 0.95, drift: 46, duration: 12, delay: -2 },
  { left: "20%", width: 1, color: GOLD, blur: 0, from: 0.1, to: 0.66, drift: -40, duration: 7, delay: -5 },
  { left: "24%", width: 78, color: CHAMPAGNE, blur: 28, from: 0.16, to: 0.9, drift: 66, duration: 13, delay: -11 },
  { left: "29.5%", width: 1, color: GOLD, blur: 0, from: 0.05, to: 0.42, drift: 26, duration: 10, delay: -9 },

  // ---- centre: sparse and faint, behind the headline ----
  { left: "37%", width: 1, color: GOLD, blur: 0, from: 0.04, to: 0.2, drift: 22, duration: 11, delay: -3 },
  { left: "47%", width: 96, color: CHAMPAGNE, blur: 38, from: 0.05, to: 0.3, drift: 38, duration: 14, delay: -13 },
  { left: "59%", width: 1, color: GOLD, blur: 0, from: 0.04, to: 0.22, drift: -22, duration: 9, delay: -6 },

  // ---- right field: dense ----
  { left: "69%", width: 1, color: GOLD, blur: 0, from: 0.08, to: 0.58, drift: -34, duration: 8, delay: -1 },
  { left: "73%", width: 54, color: BLUSH, blur: 20, from: 0.18, to: 0.95, drift: 52, duration: 11, delay: -8 },
  { left: "78.5%", width: 2, color: GOLD, blur: 0, from: 0.06, to: 0.5, drift: 30, duration: 10, delay: -12 },
  { left: "83%", width: 70, color: CHAMPAGNE, blur: 26, from: 0.2, to: 1, drift: -60, duration: 12, delay: -5 },
  { left: "88.5%", width: 1, color: GOLD, blur: 0, from: 0.14, to: 0.76, drift: 38, duration: 8, delay: -10 },
  { left: "92.5%", width: 46, color: CHAMPAGNE, blur: 18, from: 0.18, to: 0.92, drift: 48, duration: 10, delay: -3 },
  { left: "97%", width: 1, color: GOLD, blur: 0, from: 0.08, to: 0.58, drift: -26, duration: 9, delay: -7 },
];

/** Fades every column out at the top and bottom edges. */
const VERTICAL_FADE =
  "linear-gradient(180deg, transparent 0%, #000 18%, #000 80%, transparent 100%)";

export function Aurora() {
  const reduced = useReducedMotion();

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {COLUMNS.map((c, i) => (
        <motion.span
          key={i}
          className="absolute inset-y-0 block will-change-transform"
          style={{
            left: c.left,
            width: c.width,
            background:
              c.blur === 0
                ? c.color
                : `linear-gradient(90deg, transparent, ${c.color}, transparent)`,
            filter: c.blur ? `blur(${c.blur}px)` : undefined,
            maskImage: VERTICAL_FADE,
            WebkitMaskImage: VERTICAL_FADE,
            opacity: c.from,
          }}
          animate={
            reduced
              ? undefined
              : { x: [0, c.drift, 0], opacity: [c.from, c.to, c.from] }
          }
          transition={{
            duration: c.duration,
            delay: c.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}

    </div>
  );
}
