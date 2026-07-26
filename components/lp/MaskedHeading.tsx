"use client";

import { motion } from "motion/react";
import type { ElementType, ReactNode } from "react";
import { inView, maskRise, stagger } from "@/lib/motion";

type Props = {
  /** One entry per visual line — each rises out of its own mask. */
  lines: ReactNode[];
  as?: ElementType;
  className?: string;
  /** Reveal immediately (hero) instead of waiting for scroll. */
  immediate?: boolean;
  step?: number;
  delay?: number;
};

/**
 * Display heading whose lines slide up from behind a clipping mask.
 * Each line keeps its own overflow-hidden wrapper, which is what makes
 * the letters appear to emerge from the page rather than slide over it.
 */
export function MaskedHeading({
  lines,
  as = "h2",
  className = "",
  immediate = false,
  step = 0.1,
  delay = 0,
}: Props) {
  const Tag = as as ElementType;
  const trigger = immediate
    ? { animate: "show" as const }
    : { whileInView: "show" as const, viewport: inView };

  return (
    <motion.div initial="hidden" {...trigger} variants={stagger(step, delay)}>
      <Tag className={className}>
        {lines.map((line, i) => (
          // The mask window needs padding on both edges or it clips the
          // glyphs: italic ascenders (the "l" in "Removal") overshoot the
          // line box at the top, descenders at the bottom.
          //
          // The matching negative top margin cancels the extra height so
          // nothing shifts. At the bottom the same trick applies *between*
          // lines only — cancelling it after the last line would swallow
          // the gap before the following paragraph.
          <span
            key={i}
            className={`-mt-[0.16em] block overflow-hidden pb-[0.12em] pt-[0.16em] ${
              i < lines.length - 1 ? "-mb-[0.12em]" : ""
            }`}
          >
            <motion.span variants={maskRise} className="block will-change-transform">
              {line}
            </motion.span>
          </span>
        ))}
      </Tag>
    </motion.div>
  );
}
