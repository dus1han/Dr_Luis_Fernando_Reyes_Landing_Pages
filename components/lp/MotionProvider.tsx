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
 *
 * ────────────────── DO NOT WRAP THIS IN <LazyMotion> ──────────────────
 * Motion is the largest first-party dependency on the page and LazyMotion
 * is the documented way to shrink it, so this will look like the obvious
 * win. It is not, and the failure is silent.
 *
 * `whileInView` is powered by the `inView` feature. Checked against the
 * installed version: `domAnimation` is renderer + animation + exit +
 * hover/tap/focus, and `domMax` is that plus drag and layout. **Neither
 * includes `inView`** — only the full `motion` component loads it.
 *
 * Reveal, RevealGroup and RevealItem are all built on `whileInView` with
 * `initial="hidden"`, and there are ~60 of them across the site. Under
 * LazyMotion they would never animate in, so every one would stay at
 * opacity 0 and the pages would render blank. Nothing would throw.
 *
 * Making it work means rewriting the Reveal family onto `useInView` and
 * imperative animation, at ~60 call sites, to save roughly 6 KB over the
 * full bundle. That is the whole trade, and it is a bad one.
 * ────────────────────────────────────
 */
export function MotionProvider({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
