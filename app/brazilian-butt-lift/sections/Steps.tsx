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

const art = BBL["steps.jpg"];

/** How long each step holds before advancing. */
const DWELL = 5200;

/**
 * How it's performed — the buccal page's `Anatomy` section, rebuilt around
 * a photograph.
 *
 * Same behaviour: a self-playing stepper that pauses on hover or focus,
 * restarts its dwell on a click, and only runs while on screen. What is
 * gone is the travelling locator ring. That ring sat on measured
 * coordinates of a medical illustration — it pointed at the buccal fat pad
 * because the artwork had a buccal fat pad at 7.35%, 64.07%. There is no
 * equivalent illustration for this procedure, and putting a ring on an
 * editorial photograph would be pointing at nothing.
 *
 * The progress rail stays, evenly spaced: it is a position indicator for
 * four steps, which is honest, rather than a map of the image above it.
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

  const last = STEPS.steps.length - 1;
  const progress = active / last;

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
            the section, so both columns start at the top and the steps
            fill the space beside the photograph. */}
        <div className="grid items-start gap-9 lg:grid-cols-[1.06fr_0.94fr] lg:gap-14">
          {/* ---------- heading + photograph ---------- */}
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

            <figure className="relative m-0 overflow-hidden rounded-[3px]">
              <Image
                src={art.src}
                /* Decorative, and it has to stay that way. This is
                   editorial photography, not a patient record, so it must
                   not be captioned as a result — the four steps beside it
                   carry the meaning. */
                alt=""
                aria-hidden
                width={art.width}
                height={art.height}
                sizes="(max-width: 1024px) 92vw, 52vw"
                placeholder="blur"
                blurDataURL={art.blurDataURL}
                className="h-auto w-full"
              />

              {/* The source is a dark interior; the caption needs a floor
                  to sit on at the bottom edge without dimming the frame. */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 bg-linear-to-t from-espresso-deep/70 via-transparent to-transparent"
              />
              <figcaption className="absolute inset-x-0 bottom-0 m-0 p-5 text-[12.5px] font-medium uppercase tracking-[0.14em] text-white/85">
                {STEPS.caption}
              </figcaption>
            </figure>

            {/* Progress rail — four evenly spaced stops, one per step. */}
            <div className="relative mt-5 h-4 px-[3px]" aria-hidden>
              <span className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-ink/14" />
              <motion.span
                className="absolute left-0 top-1/2 h-px origin-left -translate-y-1/2 bg-gold"
                style={{ width: "100%" }}
                animate={{ scaleX: progress }}
                transition={{ duration: 0.9, ease: EASE_OUT_SOFT }}
              />
              {STEPS.steps.map((s, i) => (
                <motion.span
                  key={s.n}
                  className="absolute top-1/2 block h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border border-gold bg-sand"
                  style={{ left: `${(i / last) * 100}%` }}
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
              return (
                <li key={s.n} className="border-b border-ink/12 last:border-0">
                  {/* Every step shows its detail at all times. Collapsing
                      the inactive ones hides three quarters of the
                      explanation behind a click. */}
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

        {/*
          Recovery, spanning both columns.

          Outside the numbered list on purpose — see the note on STEPS.note
          in content.ts. Full width rather than stacked under the fourth
          step, which is where it started: the photograph column is a good
          200px shorter than four steps plus a panel, so keeping it in the
          right-hand column left a hole under the progress rail and nothing
          to fill it. Spanning both closes the hole and gives recovery its
          own beat, which the same strip in the candidate band already
          established as this page's shape for an aside.
        */}
        <motion.aside
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.7, ease: EASE_OUT_SOFT }}
          className="mt-10 flex flex-col gap-4 rounded-[3px] border border-gold/28 bg-ivory p-6 sm:flex-row sm:items-baseline sm:gap-10 sm:p-7"
        >
          <h3 className="m-0 flex-none font-sans text-[11px] font-semibold uppercase tracking-[0.2em] text-gold sm:w-[14ch]">
            {STEPS.note.title}
          </h3>
          <p className="m-0 max-w-[86ch] text-[15.5px] leading-[1.7] text-body">
            {STEPS.note.body}
          </p>
        </motion.aside>
      </div>
    </Section>
  );
}
