"use client";

import { motion } from "motion/react";
import { Eyebrow } from "@/components/lp/Eyebrow";
import { TrustIcon, type TrustIconName } from "@/components/lp/TrustIcon";
import { Section } from "@/components/lp/Section";
import { EASE_OUT_SOFT, inView, stagger } from "@/lib/motion";
import { ASSURANCE } from "../content";

const card = {
  hidden: { opacity: 0, y: 26 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: EASE_OUT_SOFT },
  },
};

/**
 * Credential row directly beneath the numbers strip. The stats answer
 * "how much"; this answers "on what authority" — the question that
 * actually decides whether a cold visitor books surgery.
 */
export function Assurance() {
  return (
    <Section tone="sand" padding="tight">
      <div className="shell">
        {/* This band's only other titles are h3 cards, so the eyebrow
            carries the section heading to keep the outline unbroken. */}
        <Eyebrow center as="h2">
          {ASSURANCE.eyebrow}
        </Eyebrow>

        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={inView}
          variants={stagger(0.13)}
          className="mt-8 grid gap-x-6 sm:mt-10 sm:grid-cols-2 sm:gap-y-10 lg:grid-cols-4"
        >
          {ASSURANCE.items.map((item) => (
            /* Compact icon-beside-text rows on phones — the centred
               column is elegant on wide screens but stacks into a very
               tall band at 390px. */
            <motion.div
              key={item.title}
              variants={card}
              /* last:pb-0 — the final row has no divider under it, so its
                 24px of bottom padding isn't separating anything; it just
                 stacks onto the section's own padding and reads as a hole.
                 Only below sm, where these are rows: from sm up they're
                 columns with py-0 already. */
              className="group relative flex h-full items-start gap-5 border-b border-ink/10 py-6 text-left last:border-0 last:pb-0 sm:flex-col sm:items-center sm:border-0 sm:px-2 sm:py-0 sm:text-center"
            >
              {/* Icon medallion — ring rotates gently, fills gold on hover */}
              <span className="relative grid h-[58px] w-[58px] flex-none place-items-center sm:mb-6 sm:h-[74px] sm:w-[74px]">
                <motion.span
                  aria-hidden
                  className="absolute inset-0 rounded-full border border-gold/25"
                  variants={{
                    hidden: { scale: 0.7, opacity: 0 },
                    show: {
                      scale: 1,
                      opacity: 1,
                      transition: { duration: 0.7, ease: EASE_OUT_SOFT },
                    },
                  }}
                />
                <span
                  aria-hidden
                  className="absolute inset-0 scale-90 rounded-full bg-gold opacity-0 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-100 group-hover:opacity-100"
                />
                {/* Dashed outer ring, slowly turning */}
                <motion.span
                  aria-hidden
                  className="absolute -inset-2 rounded-full border border-dashed border-gold/22 motion-reduce:hidden"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
                />
                <span className="relative z-1 text-gold transition-colors duration-400 group-hover:text-white">
                  <TrustIcon name={item.icon as TrustIconName} />
                </span>
              </span>

              <div className="sm:contents">
                <h3 className="mb-1.5 max-w-[22ch] font-display text-[18px] leading-[1.3] text-ink sm:mb-2.5 sm:text-[19px]">
                  {item.title}
                </h3>
                <p className="m-0 max-w-[34ch] text-[14.5px] leading-[1.6] text-muted sm:max-w-[30ch] sm:leading-[1.65]">
                  {item.body}
                </p>
              </div>

              {/* Gold underline widens on hover. The wrapper carries the
                  mt-auto so all four align despite uneven body lengths —
                  padding on the rule itself would paint a gold block. */}
              <span aria-hidden className="mt-auto hidden pt-6 sm:block">
                <span className="block h-px w-8 bg-gold/30 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:w-16 group-hover:bg-gold" />
              </span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </Section>
  );
}
