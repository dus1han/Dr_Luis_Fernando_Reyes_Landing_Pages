"use client";

import Image from "next/image";
import { motion, useInView, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { Eyebrow } from "@/components/lp/Eyebrow";
import { MaskedHeading } from "@/components/lp/MaskedHeading";
import { Section } from "@/components/lp/Section";
import { EASE_OUT_SOFT } from "@/lib/motion";
import { BBL } from "@/lib/generated/images";
import { STEPS } from "../content";

const art = BBL["steps.webp"];

/** How long each step holds before advancing. */
const DWELL = 5200;

/**
 * Where the locator sits for each step, as percentages of the 1536x1024
 * illustration.
 *
 * Measured off the artwork, not estimated. The background is a flat cream
 * (250,244,238), so every element is found by asking which pixels are NOT
 * that colour: three panel bands at x 72-485, 568-973 and 1055-1457, each
 * split by an empty row band at y 342-394 into an inset circle above and
 * the main oval below. The ovals are y 398-861 and are what the ring
 * points at — they are the panel, the inset is its detail.
 *
 * An ellipse, not the buccal page's circle: those ovals are 26.4% wide by
 * 45.3% tall, and a circle either sits inside them or swallows the panel
 * next door. So `height` animates alongside `width` and `aspect-square` is
 * gone. Each ring is ~1.8pp wider and ~2.6pp taller than its oval, which
 * puts it just outside the artwork's own outline rather than on top of it.
 *
 * The three are within half a point of each other in size, so one size
 * serves all three — unlike the buccal stops, where the middle one is a
 * 70px arrow between two 198px circles and genuinely needs its own.
 *
 * The source is NOT trimmed to its ink, deliberately. Trimming would put
 * the first oval flush against the left edge and clip the ring that has to
 * surround it; the 72px margin the artwork ships with is what the ring
 * needs to breathe.
 */
const RING = { w: 28.4, h: 47.9 };
const STOPS = [
  { x: 18.13, y: 61.43 },
  { x: 50.16, y: 61.47 },
  { x: 81.77, y: 61.47 },
];

/**
 * How it's performed — the same section the buccal page runs, and now with
 * the same animation.
 *
 * The locator ring was dropped when this page was first built, because the
 * slot held an editorial photograph and a ring on a mood shot points at
 * nothing. The clinic supplied a real three-panel illustration, so it is
 * back: one panel per step, the ring travelling between them, the rail
 * beneath aligned to the same stops.
 */
export function Steps() {
  const ref = useRef<HTMLDivElement>(null);
  const seen = useInView(ref, { amount: 0.3 });
  const reduced = useReducedMotion();

  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  /**
   * Advances on a timer keyed to `active`, so a manual click restarts the
   * dwell rather than cutting it short. Only runs while the section is on
   * screen — an unattended timer offscreen is wasted work, and would mean
   * arriving at a step the visitor never saw start.
   */
  useEffect(() => {
    if (!seen || paused || reduced) return;
    const t = setTimeout(() => setActive((a) => (a + 1) % STEPS.steps.length), DWELL);
    return () => clearTimeout(t);
  }, [active, seen, paused, reduced]);

  /** Fraction of the rail covered, 0 at the first stop, 1 at the last. */
  const span = STOPS[2].x - STOPS[0].x;
  const progress = (STOPS[active].x - STOPS[0].x) / span;

  return (
    <Section tone="sand" padding="tight">
      <div
        ref={ref}
        className="shell"
        onPointerEnter={() => setPaused(true)}
        onPointerLeave={() => setPaused(false)}
        onFocusCapture={() => setPaused(true)}
        onBlurCapture={() => setPaused(false)}
      >
        {/* The heading lives inside the left column rather than spanning
            the section. Full width, it left a hole in the top right; here
            both columns start at the top and the steps fill that space.

            `lg:items-center` where the buccal page uses `items-start`, and
            the illustration's shape is the reason. Its artwork is a 2.65:1
            strip, so heading + image + rail comes to about the height of
            its three steps and the columns finish level. This one is 3:2 —
            370px taller in the same width — while these three steps are
            shorter than the buccal page's. Left-aligned to the top that
            left ~300px of dead sand under the steps; centred, the same
            slack splits above and below them and reads as breathing room
            rather than a hole. */}
        <div className="grid items-start gap-9 lg:grid-cols-[1.06fr_0.94fr] lg:gap-14 lg:items-center">
          {/* ---------- heading + illustration with a travelling locator ---------- */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, ease: EASE_OUT_SOFT }}
          >
            <Eyebrow>{STEPS.eyebrow}</Eyebrow>
            <MaskedHeading
              lines={[
                STEPS.headline[0],
                <em key="a" className="accent">
                  {STEPS.headline[1]}
                </em>,
              ]}
              className="mb-9 font-display text-[clamp(30px,4vw,42px)] font-semibold leading-[1.12] tracking-[-0.01em] text-ink"
            />

            <div className="relative">
              <Image
                src={art.src}
                alt="Illustration of the three stages of a Brazilian Butt Lift: fat drawn from the body by liposuction, purified, then transferred, followed by a compression garment"
                width={art.width}
                height={art.height}
                sizes="(max-width: 1024px) 92vw, 52vw"
                placeholder="blur"
                blurDataURL={art.blurDataURL}
                className="h-auto w-full"
              />

              {/* Only the ring sits on the artwork — the progress rail runs
                  underneath it, not across the panels. */}
              <motion.span
                aria-hidden
                className="absolute block -translate-x-1/2 -translate-y-1/2"
                animate={{
                  left: `${STOPS[active].x}%`,
                  top: `${STOPS[active].y}%`,
                  width: `${RING.w}%`,
                  height: `${RING.h}%`,
                }}
                transition={{ duration: 0.9, ease: EASE_OUT_SOFT }}
              >
                <span className="absolute inset-0 rounded-full border-2 border-gold" />
                <span className="absolute inset-0 rounded-full bg-gold/10" />
                {!reduced && (
                  <motion.span
                    className="absolute inset-0 rounded-full border border-gold"
                    animate={{ scale: [1, 1.12], opacity: [0.6, 0] }}
                    transition={{ duration: 2.2, repeat: Infinity, ease: "easeOut" }}
                  />
                )}
              </motion.span>
            </div>

            {/* Progress rail, aligned to the same stops as the ring so the
                markers sit directly beneath it. */}
            <div
              className="relative mt-5 h-4"
              style={{ marginLeft: `${STOPS[0].x}%`, marginRight: `${100 - STOPS[2].x}%` }}
              aria-hidden
            >
              <span className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-ink/14" />
              <motion.span
                className="absolute left-0 top-1/2 h-px origin-left -translate-y-1/2 bg-gold"
                style={{ width: "100%" }}
                animate={{ scaleX: progress }}
                transition={{ duration: 0.9, ease: EASE_OUT_SOFT }}
              />
              {STOPS.map((s, i) => (
                <motion.span
                  key={s.x}
                  className="absolute top-1/2 block h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border border-gold bg-sand"
                  style={{ left: `${((s.x - STOPS[0].x) / span) * 100}%` }}
                  animate={{
                    backgroundColor:
                      i <= active ? "var(--color-gold)" : "var(--color-sand)",
                    scale: i === active ? 1.35 : 1,
                  }}
                  transition={{ duration: 0.4, ease: EASE_OUT_SOFT }}
                />
              ))}
            </div>
          </motion.div>

          {/* ---------- the steps ---------- */}
          <ol className="m-0 list-none p-0">
            {STEPS.steps.map((s, i) => {
              const isActive = i === active;
              // max-lg:last:[&>button]:pb-0 — the final step has no divider
              // beneath it, so its bottom padding separates nothing and just
              // deepens the gap to the next section. Only while stacked; from
              // lg it sits beside the illustration and doesn't set the height.
              return (
                <li
                  key={s.n}
                  className="border-b border-ink/12 last:border-0 max-lg:last:[&>button]:pb-0"
                >
                  {/* Every step shows its detail at all times. Collapsing
                      the inactive ones hid two thirds of the explanation
                      behind a click and left the column half empty. */}
                  <motion.button
                    onClick={() => setActive(i)}
                    aria-current={isActive}
                    animate={{ opacity: isActive ? 1 : 0.45 }}
                    transition={{ duration: 0.45, ease: EASE_OUT_SOFT }}
                    /* py-5 against the buccal page's py-3. Its step bodies
                       run four and five lines; these run three, so the
                       same padding left the column noticeably lighter than
                       the illustration beside it. */
                    className="flex w-full cursor-pointer items-start gap-4 bg-transparent px-0 py-5 text-left"
                  >
                    <span
                      className={`mt-0.5 grid h-8 w-8 flex-none place-items-center rounded-full border font-display text-[12px] font-semibold transition-colors duration-400 ${
                        isActive ? "border-gold bg-gold text-white" : "border-ink/25 text-muted"
                      }`}
                    >
                      {s.n}
                    </span>

                    <span className="min-w-0 flex-1">
                      <span className="block font-display text-[19px] leading-[1.3] text-ink sm:text-[20px]">
                        {s.title}
                      </span>
                      <span className="mt-1 block text-[14.5px] leading-[1.58] text-body">
                        {s.body}
                      </span>

                      {/* Dwell indicator — doubles as a hint that this
                          advances on its own and can be clicked. */}
                      <span className="mt-2.5 block h-px w-full bg-ink/10">
                        {isActive && (
                          <motion.span
                            key={`${active}-${paused}`}
                            className="block h-px origin-left bg-gold"
                            initial={{ scaleX: 0 }}
                            animate={{ scaleX: paused || reduced ? 1 : [0, 1] }}
                            transition={{
                              duration: paused || reduced ? 0.3 : DWELL / 1000,
                              ease: "linear",
                            }}
                          />
                        )}
                      </span>
                    </span>
                  </motion.button>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </Section>
  );
}
