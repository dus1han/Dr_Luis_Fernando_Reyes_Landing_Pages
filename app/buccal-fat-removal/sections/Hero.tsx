"use client";

import Image from "next/image";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { ButtonLink } from "@/components/lp/Button";
import { Eyebrow } from "@/components/lp/Eyebrow";
import { MaskedHeading } from "@/components/lp/MaskedHeading";
import { EASE_OUT_SOFT } from "@/lib/motion";
import { IMAGES } from "@/lib/generated/images";
import { HERO } from "../content";

const bg = IMAGES["hero-bg.jpg"];

/** How much of the phone viewport the photograph occupies. */
const PHOTO_H = "40svh";

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
 * Hero built around the photograph — framed differently at each
 * breakpoint, because a 3:4 portrait cannot serve both.
 *
 *   • Phones  — the photo takes the top 40svh and the copy sits *below*
 *               it on flat ivory, centred like every other mobile
 *               section. Earlier versions floated the copy over the
 *               portrait; the block is ~500px tall in ~700px of space, so
 *               it always started over her face, and the scrim needed to
 *               keep 12px gold legible there was heavy enough to bury
 *               her. Stacking gives the face a clean half and the type a
 *               clean half.
 *   • Desktop — the photo holds the right 60%, feathered into the ivory
 *               the copy sits on. The feather clears her face entirely
 *               (transparent by 64% of the viewport) so she reads at full
 *               strength rather than through a wash.
 *
 * Ivory scrims, never dark: the palette is ink-on-ivory, and darkening
 * the photo to carry white text would fight every other section.
 *
 * One <Image> serves both — the container is repositioned per breakpoint
 * rather than shipping two files, since this is the LCP element.
 */
export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const copyY = useTransform(scrollYProgress, [0, 1], ["0%", reduced ? "0%" : "-10%"]);
  const copyOpacity = useTransform(scrollYProgress, [0, 0.85], [1, reduced ? 1 : 0.2]);
  const imageY = useTransform(scrollYProgress, [0, 1], ["0%", reduced ? "0%" : "7%"]);

  return (
    <section
      ref={ref}
      id="top"
      /* pb-[28px] on phones, not the page's 44 — this is the one band that
         ends on a full-width button pair. A button already carries 17px of
         its own padding, and the outline one's hairline border reads as a
         weak edge, so 44 below it looked like a hole next to the 12px
         holding the two buttons together and the 28px above them. 28
         frames the pair evenly. The hard ivory→espresso change into the
         trust strip is what marks the boundary here; padding doesn't have
         to. */
      className="relative overflow-hidden bg-ivory pb-[28px] lg:flex lg:min-h-[calc(94svh-var(--nav-h))] lg:items-center lg:py-[70px]"
    >
      {/* ---------- photograph ---------- */}
      <motion.div
        style={{ y: imageY, ["--photo-h" as string]: PHOTO_H }}
        className="absolute inset-x-0 top-0 h-(--photo-h) will-change-transform lg:inset-y-0 lg:left-[40%] lg:h-auto"
      >
        <Image
          src={bg.src}
          alt=""
          aria-hidden
          fill
          priority
          sizes="(max-width: 1023px) 100vw, 60vw"
          placeholder="blur"
          blurDataURL={bg.blurDataURL}
          className="object-cover object-[48%_14%] lg:object-[52%_16%]"
        />

        {/* Phones: only the last slice of the photo fades, so the join
            with the ivory below reads as a soft edge rather than a cut. */}
        <div
          aria-hidden
          className="absolute inset-0 lg:hidden"
          style={{
            background:
              "linear-gradient(180deg," +
              " transparent 0%," +
              " transparent 62%," +
              " rgb(251 248 244 / 0.55) 84%," +
              " var(--color-ivory) 100%)",
          }}
        />
      </motion.div>

      {/* Desktop feather: ivory across the copy, fully clear by 64% so her
          face is never seen through a wash. */}
      <div
        aria-hidden
        className="absolute inset-0 hidden lg:block"
        style={{
          background:
            "linear-gradient(90deg," +
            " var(--color-ivory) 0%," +
            " var(--color-ivory) 33%," +
            " rgb(251 248 244 / 0.94) 41%," +
            " rgb(251 248 244 / 0.58) 49%," +
            " rgb(251 248 244 / 0.20) 56%," +
            " transparent 64%)",
        }}
      />

      {/* ---------- copy ---------- */}
      <motion.div
        style={{ y: copyY, opacity: copyOpacity, ["--photo-h" as string]: PHOTO_H }}
        className="shell relative z-2 pt-[calc(var(--photo-h)+30px)] text-center lg:pt-0 lg:text-left"
      >
        <div className="mx-auto max-w-[38ch] lg:mx-0 lg:max-w-[44ch]">
          {/* Two eyebrows so the rules can sit either side when centred and
              only on the left when not. `hidden` drops the inactive one
              from the accessibility tree, so nothing is announced twice. */}
          <div className="lg:hidden">
            <Eyebrow center>{HERO.eyebrow}</Eyebrow>
          </div>
          <div className="hidden lg:block">
            <Eyebrow>{HERO.eyebrow}</Eyebrow>
          </div>

          <motion.p
            custom={-2}
            initial="hidden"
            animate="show"
            variants={item}
            className="m-0 mb-2.5 font-display text-[18px] font-medium leading-[1.35] text-muted sm:text-[21px] lg:text-[23px]"
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
            className="font-display text-[clamp(44px,9vw,74px)] font-semibold leading-[1.03] tracking-[-0.02em] text-ink"
          />

          <motion.span
            custom={0}
            initial="hidden"
            animate="show"
            variants={item}
            aria-hidden
            className="mx-auto mt-6 block h-px w-[58px] bg-gold/55 lg:mx-0"
          />

          <motion.p
            custom={1}
            initial="hidden"
            animate="show"
            variants={item}
            className="mx-auto mb-7 mt-5 max-w-[46ch] text-[16px] text-body sm:text-[17.5px] lg:mx-0"
          >
            {HERO.lede}
          </motion.p>

          <motion.div
            custom={2}
            initial="hidden"
            animate="show"
            variants={item}
            className="flex w-full flex-col items-stretch gap-3 sm:w-auto sm:flex-row sm:items-center sm:justify-center lg:justify-start"
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
        </div>
      </motion.div>
    </section>
  );
}
