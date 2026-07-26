"use client";

import { motion } from "motion/react";
import { drawLine, inView } from "@/lib/motion";

type Props = {
  children: React.ReactNode;
  /** Centred variant adds a matching rule on the right. */
  center?: boolean;
  /** Use on espresso panels. */
  onDark?: boolean;
  /**
   * Render as a heading when the eyebrow *is* the section's heading —
   * otherwise a section whose only titles are h3 cards would jump
   * straight from h1 to h3 in the document outline.
   */
  as?: "p" | "h2";
  className?: string;
};

/** Small gold caps label with self-drawing hairlines. */
export function Eyebrow({ children, center, onDark, as = "p", className = "" }: Props) {
  const Tag = as === "h2" ? motion.h2 : motion.p;
  const rule = (
    <motion.span
      aria-hidden
      variants={drawLine}
      className={`h-px w-[30px] flex-none origin-left ${onDark ? "bg-champagne" : "bg-gold"}`}
    />
  );

  return (
    <Tag
      initial="hidden"
      whileInView="show"
      viewport={inView}
      className={`m-0 mb-[18px] flex items-center gap-3.5 font-sans text-[12px] font-semibold uppercase tracking-[0.24em] ${
        onDark ? "text-champagne" : "text-gold"
      } ${center ? "justify-center" : ""} ${className}`}
    >
      {rule}
      <motion.span variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { duration: 0.6, delay: 0.15 } } }}>
        {children}
      </motion.span>
      {center && rule}
    </Tag>
  );
}
