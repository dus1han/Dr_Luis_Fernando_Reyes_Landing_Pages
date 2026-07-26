"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { Aurora } from "@/components/lp/Aurora";
import { ButtonLink } from "@/components/lp/Button";
import { Eyebrow } from "@/components/lp/Eyebrow";
import { MaskedHeading } from "@/components/lp/MaskedHeading";
import { EASE_OUT_SOFT } from "@/lib/motion";
import { HERO } from "../content";

/** Staged entrance so the eye lands on headline → promise → action. */
const item = {
  hidden: { opacity: 0, y: 18 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.75, delay: 0.45 + i * 0.12, ease: EASE_OUT_SOFT },
  }),
};

/**
 * Text-only hero. With no image to decode, the LCP element is the
 * headline itself — the fastest possible first paint for paid traffic.
 * The before/after comparison leads the results section instead.
 *
 * Height is content-driven rather than viewport-locked, so the trust
 * strip sits just under the fold instead of behind a screen of padding.
 */
export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  // The whole block drifts and fades as it scrolls away.
  const y = useTransform(scrollYProgress, [0, 1], ["0%", reduced ? "0%" : "-14%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.85], [1, reduced ? 1 : 0.15]);

  return (
    <section
      ref={ref}
      id="top"
      /* Tight under the nav — the eyebrow sits close to the bar, with the
         breathing room kept below the CTAs instead. */
      className="relative overflow-hidden bg-linear-to-b from-ivory to-sand pb-[54px] pt-[26px] sm:pb-[66px] sm:pt-[30px] lg:pb-[78px] lg:pt-[34px]"
    >
      <Aurora />

      <motion.div
        style={{ y, opacity }}
        className="shell relative z-2 flex flex-col items-center text-center"
      >
        <Eyebrow center>{HERO.eyebrow}</Eyebrow>

        <motion.p
          custom={-2}
          initial="hidden"
          animate="show"
          variants={item}
          className="m-0 mb-2.5 font-display text-[18px] font-medium leading-[1.35] text-muted sm:text-[22px] lg:text-[25px]"
        >
          {HERO.kicker}
        </motion.p>

        <MaskedHeading
          as="h1"
          immediate
          delay={0.12}
          lines={[
            HERO.headline[0],
            <em key="accent" className="accent-sheen">
              {HERO.headline[1]}
            </em>,
          ]}
          className="font-display text-[clamp(46px,8.8vw,90px)] font-semibold leading-[1.02] tracking-[-0.02em] text-ink"
        />

        <motion.span
          custom={0}
          initial="hidden"
          animate="show"
          variants={item}
          aria-hidden
          className="mt-6 block h-px w-[58px] bg-gold/55"
        />

        <motion.p
          custom={1}
          initial="hidden"
          animate="show"
          variants={item}
          className="mx-auto mb-8 mt-5 max-w-[54ch] text-[16.5px] text-body sm:text-[18.5px]"
        >
          {HERO.lede}
        </motion.p>

        <motion.div
          custom={2}
          initial="hidden"
          animate="show"
          variants={item}
          className="flex w-full flex-col items-stretch gap-3 sm:w-auto sm:flex-row sm:items-center sm:justify-center"
        >
          <ButtonLink href="#book" event="cta_click" eventLabel="hero_primary">
            {HERO.primaryCta}
          </ButtonLink>
          <ButtonLink
            href="#results"
            variant="outline"
            event="cta_click"
            eventLabel="hero_secondary"
          >
            {HERO.secondaryCta}
          </ButtonLink>
        </motion.div>
      </motion.div>
    </section>
  );
}
