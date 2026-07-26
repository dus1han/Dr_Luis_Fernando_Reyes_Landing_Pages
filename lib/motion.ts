import type { Variants, Transition } from "motion/react";

/**
 * One shared motion vocabulary so all four landing pages feel like the
 * same brand. Everything animates transform/opacity only — no layout
 * properties — so scrolling stays at 60fps on mid-range phones.
 */

export const EASE_OUT_SOFT = [0.16, 1, 0.3, 1] as const;
export const EASE_IN_OUT_SOFT = [0.65, 0, 0.35, 1] as const;

export const springSoft: Transition = {
  type: "spring",
  stiffness: 140,
  damping: 22,
  mass: 0.9,
};

/**
 * Standard "enters as you scroll to it" viewport config.
 *
 * `amount: "some"` — any intersection at all — because every fractional
 * threshold we tried stranded content at the bottom edge of the
 * viewport. A tall paragraph landing there has only a few pixels inside
 * the root, so it never crosses a 0.15 or 0.25 ratio and stays at
 * opacity 0 until the next scroll. That hits real users, not just tests:
 * anyone arriving via an anchor link or a Google sitelink, or scrolling
 * in large jumps.
 *
 * Sections on this page are sized to fit a single screen, which puts
 * content against that edge far more often than a long scrolling layout
 * would. Revealing a touch early is much cheaper than not revealing.
 *
 * anchor-reveal.mjs guards this: it jumps to every anchor at two
 * viewports and fails on any on-screen element left transparent.
 */
export const inView = { once: true, amount: "some", margin: "0px 0px -24px 0px" } as const;

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.75, ease: EASE_OUT_SOFT },
  },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.9, ease: EASE_OUT_SOFT } },
};

/** Parent that releases its children one after another. */
export const stagger = (staggerChildren = 0.09, delayChildren = 0): Variants => ({
  hidden: {},
  show: { transition: { staggerChildren, delayChildren } },
});

/** Headline words rising out of an overflow-hidden mask. */
export const maskRise: Variants = {
  hidden: { y: "110%" },
  show: {
    y: "0%",
    transition: { duration: 0.95, ease: EASE_OUT_SOFT },
  },
};

/**
 * NOTE: there is deliberately no clip-path reveal variant here.
 * `whileInView` reads the computed clip-path as its animation origin, and
 * browsers normalise `inset(0 0 100% 0)` to a shorter argument list that
 * no longer matches the target — so the tween silently never runs. Use
 * <ImageReveal>, which wipes a curtain with scaleY instead.
 */

/** Hairline rule that draws itself horizontally. */
export const drawLine: Variants = {
  hidden: { scaleX: 0 },
  show: {
    scaleX: 1,
    transition: { duration: 0.8, ease: EASE_OUT_SOFT },
  },
};
