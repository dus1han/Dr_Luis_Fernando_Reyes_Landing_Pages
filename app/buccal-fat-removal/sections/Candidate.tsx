"use client";

import { motion } from "motion/react";
import { ButtonLink } from "@/components/lp/Button";
import { Eyebrow } from "@/components/lp/Eyebrow";
import { MaskedHeading } from "@/components/lp/MaskedHeading";
import { Reveal } from "@/components/lp/Reveal";
import { Section } from "@/components/lp/Section";
import { EASE_OUT_SOFT, inView, stagger } from "@/lib/motion";
import { CANDIDATE } from "../content";

/** Gold tick that draws itself in as the row arrives. */
const check = {
  hidden: { pathLength: 0, opacity: 0 },
  show: {
    pathLength: 1,
    opacity: 1,
    transition: { duration: 0.5, ease: EASE_OUT_SOFT },
  },
};

const row = {
  hidden: { opacity: 0, x: -14 },
  show: { opacity: 1, x: 0, transition: { duration: 0.6, ease: EASE_OUT_SOFT } },
};

export function Candidate() {
  return (
    /* Sand, because this now follows the ivory benefits band — two ivory
       sections in a row read as one continuous block. */
    <Section id="candidate" tone="sand" padding="tight">
      <div className="shell">
        <div className="grid gap-[38px] lg:grid-cols-[0.92fr_1.08fr] lg:gap-[70px]">
          <div>
            <Eyebrow>{CANDIDATE.eyebrow}</Eyebrow>
            <MaskedHeading
              lines={[
                CANDIDATE.headline[0],
                <em key="a" className="accent">
                  {CANDIDATE.headline[1]}
                </em>,
              ]}
              className="mb-7 font-display text-[clamp(30px,4vw,42px)] font-semibold leading-[1.14] tracking-[-0.01em] text-ink"
            />
            <Reveal as="p" className="m-0 max-w-[50ch] text-body">
              {CANDIDATE.intro}
            </Reveal>
          </div>

        <motion.ul
          initial="hidden"
          whileInView="show"
          viewport={inView}
          variants={stagger(0.11)}
          className="m-0 list-none p-0"
        >
          {CANDIDATE.items.map((item) => (
            <motion.li
              key={item}
              variants={row}
              className="flex items-start gap-4 border-b border-ink/12 py-[22px] first:border-t first:border-ink/12"
            >
              <span className="mt-0.5 grid h-7 w-7 flex-none place-items-center rounded-full border border-gold/35">
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
                  <motion.path
                    d="m3.5 8.4 3 3 6-6.8"
                    stroke="var(--color-gold)"
                    strokeWidth="1.9"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    variants={check}
                  />
                </svg>
              </span>
              <span className="text-[16.5px] leading-[1.6] text-ink">{item}</span>
            </motion.li>
          ))}
          </motion.ul>
        </div>

        {/* Full width rather than tucked into the left column. As a
            column item it made that side taller than the checklist and
            left a matching hole on the right; spanning both keeps the
            two columns even and gives the CTA more presence. */}
        <Reveal
          delay={0.1}
          className="mt-10 flex flex-col gap-5 rounded-[3px] border border-gold/28 bg-ivory p-6 sm:flex-row sm:items-center sm:justify-between sm:gap-8 sm:p-7"
        >
          <p className="m-0 max-w-[62ch] text-[16px] leading-[1.6] text-ink">
            {CANDIDATE.note}
          </p>
          <ButtonLink
            href="#book"
            size="sm"
            className="flex-none self-start sm:self-auto"
            event="cta_click"
            eventLabel="candidate"
          >
            Ask Dr. Luis
          </ButtonLink>
        </Reveal>
      </div>
    </Section>
  );
}
