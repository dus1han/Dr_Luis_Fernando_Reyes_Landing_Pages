"use client";

import { motion, type Variants } from "motion/react";
import type { ElementType, ReactNode } from "react";
import { fadeUp, inView, stagger } from "@/lib/motion";

type RevealProps = {
  children: ReactNode;
  className?: string;
  as?: ElementType;
  /** Seconds to hold before starting. */
  delay?: number;
  variants?: Variants;
};

/** Fades + rises a block the first time it scrolls into view. */
export function Reveal({
  children,
  className,
  as = "div",
  delay = 0,
  variants = fadeUp,
}: RevealProps) {
  const MotionTag = motion[as as keyof typeof motion] as typeof motion.div;

  return (
    <MotionTag
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={inView}
      variants={variants}
      transition={{ delay }}
    >
      {children}
    </MotionTag>
  );
}

/**
 * Wraps a list so children reveal one after another. Children must be
 * <RevealItem> (or any motion element using the same variant names).
 */
export function RevealGroup({
  children,
  className,
  as = "div",
  step = 0.09,
  delay = 0,
}: Omit<RevealProps, "variants"> & { step?: number }) {
  const MotionTag = motion[as as keyof typeof motion] as typeof motion.div;

  return (
    <MotionTag
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={inView}
      variants={stagger(step, delay)}
    >
      {children}
    </MotionTag>
  );
}

export function RevealItem({
  children,
  className,
  as = "div",
  variants = fadeUp,
}: Omit<RevealProps, "delay">) {
  const MotionTag = motion[as as keyof typeof motion] as typeof motion.div;

  return (
    <MotionTag className={className} variants={variants}>
      {children}
    </MotionTag>
  );
}
