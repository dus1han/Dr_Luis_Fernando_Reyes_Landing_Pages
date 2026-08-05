"use client";

import Image from "next/image";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { Eyebrow } from "@/components/lp/Eyebrow";
import { ImageReveal } from "@/components/lp/ImageReveal";
import { MaskedHeading } from "@/components/lp/MaskedHeading";
import { Reveal, RevealGroup, RevealItem } from "@/components/lp/Reveal";
import { PADDING } from "@/components/lp/Section";
import { EASE_OUT_SOFT } from "@/lib/motion";
import { SHARED } from "@/lib/generated/images";
import { SURGEON } from "../content";

const portrait = SHARED["dr-portrait.jpg"];

/**
 * The one full-dark band on the page, and the only place the surgeon
 * himself is the subject — so the portrait leads and everything else
 * runs beside it.
 *
 * Previously this was two stacked two-column blocks. Both left a hole:
 * the intro column finished ~120px above the portrait, and the "why
 * patients travel" heading finished ~240px above its own paragraphs.
 * One grid — portrait pinned on the left, the whole story flowing on
 * the right — removes both and keeps him on screen while he's read
 * about.
 */
export function Surgeon() {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const portraitY = useTransform(
    scrollYProgress,
    [0, 1],
    reduced ? ["0%", "0%"] : ["-4%", "4%"]
  );

  return (
    <section
      ref={ref}
      id="surgeon"
      /* Raw <section> rather than <Section> because useScroll needs a
         ref, so the padding is pulled from the shared scale by hand.

         Deliberately NOT overflow-hidden: an ancestor with clipped
         overflow silently disables `position: sticky` inside it, which
         is what stopped the portrait pinning. The bloom gets its own
         clipping wrapper below instead — a sibling of the sticky
         column, so it can't interfere. */
      className={`grain relative bg-espresso ${PADDING.tight}`}
    >
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute -left-[10%] top-[8%] h-[46vw] max-h-[560px] w-[46vw] max-w-[560px] rounded-full opacity-45 blur-[90px]"
          style={{
            background: "radial-gradient(circle, rgb(168 127 73 / 0.5) 0%, transparent 70%)",
          }}
        />
      </div>

      {/* No `items-start` here: the grid cell must stretch to the row
          height for the sticky child to have anywhere to travel. With
          the cell sized to its own content, sticky pins and immediately
          releases, which is why the portrait was scrolling away. */}
      <div className="shell relative z-2 grid gap-12 lg:grid-cols-[0.84fr_1.16fr] lg:gap-16">
        {/* ---------- portrait, pinned ---------- */}
        <div>
          <div className="lg:sticky lg:top-[calc(var(--nav-h)+40px)]">
          <div className="relative">
            {/* Offset rule behind the frame — an editorial device that
                gives the portrait weight without a heavy border. */}
            <motion.span
              aria-hidden
              className="absolute -inset-4 border border-gold/30"
              initial={{ opacity: 0, scale: 0.94 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 1, delay: 0.35, ease: EASE_OUT_SOFT }}
            />

            <ImageReveal curtain="bg-espresso" className="relative rounded-[3px]">
              <motion.div style={{ y: portraitY }} className="will-change-transform">
                {/* Slow Ken Burns. Long and shallow on purpose: the point
                    is that the frame feels alive, not that it moves. */}
                <motion.div
                  animate={reduced ? undefined : { scale: [1, 1.06, 1] }}
                  transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
                  className="will-change-transform"
                >
                  <Image
                    src={portrait.src}
                    alt="Portrait of Dr. Luis Fernando Reyes"
                    width={portrait.width}
                    height={portrait.height}
                    sizes="(max-width: 1024px) 92vw, 40vw"
                    placeholder="blur"
                    blurDataURL={portrait.blurDataURL}
                    className="h-auto w-full"
                  />
                </motion.div>
              </motion.div>

              {/* The portrait was shot on black, so only the outer edge is
                  feathered — a stronger vignette swallows the subject. */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0"
                style={{
                  background:
                    "radial-gradient(135% 105% at 50% 40%, transparent 62%, var(--color-espresso) 100%)",
                }}
              />
            </ImageReveal>
          </div>

            <Reveal delay={0.15} className="mt-10 border-l-2 border-gold pl-6">
              <p className="m-0 font-display text-[22px] italic leading-[1.4] text-champagne sm:text-[25px]">
                &ldquo;{SURGEON.pullQuote}&rdquo;
              </p>
              <p className="m-0 mt-3 text-[12px] font-semibold uppercase tracking-[0.16em] text-white/45">
                {SURGEON.pullQuoteMeta}
              </p>
            </Reveal>
          </div>
        </div>

        {/* ---------- the whole story, in one column ---------- */}
        <div>
          <Eyebrow onDark>{SURGEON.eyebrow}</Eyebrow>

          <MaskedHeading
            lines={[
              <span key="a" className="text-white">
                {SURGEON.headline[0]}
              </span>,
              <em key="b" className="italic text-champagne">
                {SURGEON.headline[1]}
              </em>,
            ]}
            className="mb-7 font-display text-[clamp(34px,4.6vw,50px)] font-semibold leading-[1.1] tracking-[-0.01em]"
          />

          <Reveal as="p" className="m-0 max-w-[62ch] text-[17px] leading-[1.8] text-white/74">
            {SURGEON.intro}
          </Reveal>

          {/* Affiliation ribbon, in place of the three credential pills
              that used to sit here. Those repeated the intro paragraph
              directly above them word for word; these carry the same
              claim with the institutions behind it.

              Hairlines top and bottom rather than a filled band — it
              matches the rule under this column and keeps the marks
              sitting on the espresso rather than on a panel of their
              own. */}
          {/* The label lives on this wrapper, not on RevealGroup — its
              props are typed to children/className/as/delay/step, so an
              aria-* passed there wouldn't typecheck. */}
          <div
            role="group"
            aria-label="Training and professional affiliations"
            /* The space above and below this band has to match. It didn't:
               32px sat between the intro and the top rule while 88px sat
               between the bottom rule and the heading below, so the ribbon
               looked stuck to the paragraph above it. Both are 56 now. */
            className="mt-14 border-y border-champagne/14 py-6"
          >
          <RevealGroup
            step={0.09}
            as="ul"
            className="m-0 flex list-none flex-wrap items-center gap-x-6 gap-y-6 p-0"
          >
            {SURGEON.affiliations.map((a) => {
              const logo = SHARED[a.image as keyof typeof SHARED];
              return (
                <RevealItem as="li" key={a.image}>
                  <Image
                    src={logo.src}
                    alt={a.name}
                    width={logo.width}
                    height={logo.height}
                    /* Height is fixed per logo and the width follows, so
                       every mark is optically the same weight whatever
                       its aspect ratio. */
                    style={{ height: a.height, width: "auto" }}
                    className="opacity-[0.78] transition-opacity duration-400 hover:opacity-100"
                  />
                </RevealItem>
              );
            })}
          </RevealGroup>
          </div>

          {/* No rule on top of this block. It used to carry one, back when
              the only thing above it was a row of text pills. The
              affiliation ribbon now closes with its own hairline, so a
              second rule below it read as two separators for one boundary.

              56 to match the gap above the ribbon — see the note there. */}
          <div className="mt-14">
            <MaskedHeading
              lines={[
                <span key="a" className="text-white">
                  {SURGEON.whyHeadline[0]}
                </span>,
                <em key="b" className="italic text-champagne">
                  {SURGEON.whyHeadline[1]}
                </em>,
              ]}
              className="mb-6 font-display text-[clamp(27px,3.4vw,38px)] font-semibold leading-[1.14] tracking-[-0.01em]"
            />

            {SURGEON.why.map((p, i) => (
              <Reveal
                key={i}
                as="p"
                delay={0.07 * i}
                className="max-w-[64ch] text-[16.5px] leading-[1.8] text-white/70"
              >
                {p}
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
