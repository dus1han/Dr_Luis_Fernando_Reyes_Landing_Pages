"use client";

import Image from "next/image";
import { motion, useInView, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { Eyebrow } from "@/components/lp/Eyebrow";
import { MaskedHeading } from "@/components/lp/MaskedHeading";
import { Section } from "@/components/lp/Section";
import { EASE_OUT_SOFT } from "@/lib/motion";
import { IMAGES } from "@/lib/generated/images";
import { ANATOMY } from "../content";

const art = IMAGES["anatomy.webp"];

/** How long each step holds before advancing. */
const DWELL = 5200;

/**
 * Where the locator sits for each step, as percentages of the trimmed
 * 1157x437 illustration.
 *
 * Measured off the artwork's alpha channel, not estimated: for each
 * column, the vertical extent of opaque pixels peaks exactly at a
 * circle's horizontal centre, which pins both axes at once. The tissue
 * insets peak at x=85 and x=1071, spanning y=181..379 — so centres of
 * (85, 280) and (1071, 280), diameter 198.
 *
 * The arrow sits in the sparse band between the two faces, x=530..600 /
 * y=261..284, so it needs its own centre and a smaller ring: a
 * circle-sized locator would swamp a 70px glyph.
 *
 * An earlier version had these at 8.7% / 91.3% because the scan window
 * clipped the shapes and returned the window's midpoint rather than the
 * circle's. That put the ring ~8px off centre at both ends.
 */
const STOPS = [
  { x: 7.35, y: 64.07, size: "17.1%" },
  { x: 48.83, y: 62.36, size: "9.4%" },
  { x: 92.57, y: 64.07, size: "17.1%" },
];

export function Anatomy() {
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
    const t = setTimeout(() => setActive((a) => (a + 1) % ANATOMY.steps.length), DWELL);
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
            the section. Full width, it left a ~550x180 hole in the top
            right; here both columns start at the top and the steps fill
            that space. */}
        <div className="grid items-start gap-9 lg:grid-cols-[1.06fr_0.94fr] lg:gap-14">
          {/* ---------- heading + illustration with a travelling locator ---------- */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, ease: EASE_OUT_SOFT }}
          >
            <Eyebrow>{ANATOMY.eyebrow}</Eyebrow>
            <MaskedHeading
              lines={[
                ANATOMY.headline[0],
                <em key="a" className="accent">
                  {ANATOMY.headline[1]}
                </em>,
              ]}
              className="mb-9 font-display text-[clamp(30px,4vw,42px)] font-semibold leading-[1.12] tracking-[-0.01em] text-ink"
            />

            <div className="relative">
              <Image
                src={art.src}
                alt="Medical illustration comparing the buccal fat pad before and after reduction"
                width={art.width}
                height={art.height}
                sizes="(max-width: 1024px) 92vw, 52vw"
                placeholder="blur"
                blurDataURL={art.blurDataURL}
                className="h-auto w-full"
              />

              {/* Only the ring sits on the artwork. The progress rail used
                  to run across here too, drawing a line straight over both
                  faces — it lives under the illustration now. */}
              <motion.span
                aria-hidden
                className="absolute block aspect-square -translate-x-1/2 -translate-y-1/2"
                animate={{
                  left: `${STOPS[active].x}%`,
                  top: `${STOPS[active].y}%`,
                  width: STOPS[active].size,
                }}
                transition={{ duration: 0.9, ease: EASE_OUT_SOFT }}
              >
                <span className="absolute inset-0 rounded-full border-2 border-gold" />
                <span className="absolute inset-0 rounded-full bg-gold/10" />
                {!reduced && (
                  <motion.span
                    className="absolute inset-0 rounded-full border border-gold"
                    animate={{ scale: [1, 1.35], opacity: [0.6, 0] }}
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
            {ANATOMY.steps.map((s, i) => {
              const isActive = i === active;
              return (
                <li key={s.n} className="border-b border-ink/12 last:border-0">
                  {/* Every step shows its detail at all times. Collapsing
                      the inactive ones hid two thirds of the explanation
                      behind a click and left the column half empty. */}
                  <motion.button
                    onClick={() => setActive(i)}
                    aria-current={isActive}
                    animate={{ opacity: isActive ? 1 : 0.45 }}
                    transition={{ duration: 0.45, ease: EASE_OUT_SOFT }}
                    className="flex w-full cursor-pointer items-start gap-4 bg-transparent px-0 py-3 text-left"
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
