"use client";

import { MotionConfig } from "motion/react";
import type { ReactNode } from "react";

/**
 * Makes Motion itself honour `prefers-reduced-motion`.
 *
 * The CSS override in globals.css only neutralises CSS animations and
 * transitions — Motion drives transforms from JavaScript, so without
 * this the rise-and-fade reveals would still play for users who asked
 * for less motion.
 *
 * `reducedMotion="user"` disables transform and layout animations while
 * leaving opacity alone, so content still fades in and nothing is ever
 * left stuck invisible.
 *
 * Client component, but `children` is passed through untouched — the
 * pages it wraps stay server-rendered.
 */
export function MotionProvider({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
