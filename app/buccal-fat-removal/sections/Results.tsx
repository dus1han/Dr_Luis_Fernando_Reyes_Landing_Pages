"use client";

import Image from "next/image";
import { BeforeAfterSlider } from "@/components/lp/BeforeAfterSlider";
import { Eyebrow } from "@/components/lp/Eyebrow";
import { MaskedHeading } from "@/components/lp/MaskedHeading";
import { Reveal, RevealGroup, RevealItem } from "@/components/lp/Reveal";
import { ButtonLink } from "@/components/lp/Button";
import { Section, SectionHead } from "@/components/lp/Section";
import { IMAGES } from "@/lib/generated/images";
import { SHOW_RESULTS_DISCLAIMER } from "@/lib/site";
import { RESULTS } from "../content";

const heroBefore = IMAGES["hero-before.jpg"];
const heroAfter = IMAGES["hero-after.jpg"];

/**
 * The clinic's own before/after cards, used exactly as supplied.
 *
 * **Squares first, deliberately.** Three are 1:1 and three are 1.84:1, and
 * ordering them by shape means each row of the three-column grid holds one
 * shape and comes out even. Interleaving them gives ragged rows for nothing.
 *
 * The caption states the arrangement because it genuinely varies between
 * cards, and a visitor cannot be expected to work out which half is which on
 * a stacked pair when the one beside it is side by side.
 */
const PAIRS = [
  { key: "ba-1.jpg", layout: "stacked" },
  { key: "ba-2.jpg", layout: "side" },
  { key: "ba-3.jpg", layout: "stacked" },
  { key: "ba-4.jpg", layout: "side" },
  { key: "ba-5.jpg", layout: "side" },
  { key: "ba-6.jpg", layout: "side" },
] as const;

/**
 * Where each label sits, per arrangement.
 *
 * The labels are back **on** the photograph rather than in a caption strip
 * under it. They were removed when these images arrived because the old
 * markup pinned "After" to the right on every card, which is wrong for a
 * stacked pair — but the fix was to place them correctly, not to give up and
 * describe the layout in words underneath.
 *
 * A visitor reads "before / after" off the image in a glance. A line of
 * small caps below the frame saying "BEFORE ABOVE · AFTER BELOW" is a
 * sentence they have to parse and then map back onto the picture.
 */
const ARRANGEMENT = {
  side: {
    before: "left-3 top-3",
    after: "right-3 top-3",
    /** For the alt text, which still has to carry this in words. */
    described: "before left, after right",
  },
  stacked: {
    before: "left-3 top-3",
    after: "bottom-3 left-3",
    described: "before above, after below",
  },
} as const;

/**
 * Frosted pill. `backdrop-blur` is what makes one legible over skin tones,
 * hair and background wall alike without a heavy slab of colour — the tint
 * only has to nudge the contrast, not carry it.
 */
function Tag({
  children,
  position,
  tone,
}: {
  children: React.ReactNode;
  position: string;
  tone: "before" | "after";
}) {
  return (
    <span
      className={`pointer-events-none absolute ${position} z-1 rounded-full px-3 py-[5px] text-[9.5px] font-semibold uppercase tracking-[0.16em] backdrop-blur-md ${
        tone === "before"
          ? "bg-espresso-deep/42 text-white/95 ring-1 ring-white/25"
          : "bg-gold/85 text-white ring-1 ring-white/30"
      }`}
    >
      {children}
    </span>
  );
}

export function Results() {
  return (
    /* Ivory, because the candidate band ahead of it is now sand. */
    <Section id="results" tone="ivory" padding="tight">
      <div className="shell">
        <SectionHead>
          <Eyebrow center>{RESULTS.eyebrow}</Eyebrow>
          <MaskedHeading
            lines={[
              RESULTS.headline[0],
              <em key="a" className="accent">
                {RESULTS.headline[1]}
              </em>,
            ]}
            className="font-display text-[clamp(32px,4.4vw,46px)] font-semibold leading-[1.12] tracking-[-0.01em] text-ink"
          />
        </SectionHead>

        {/* Featured comparison — the one image on the page the visitor can
            actually operate, so it leads the proof section.
            Paired with the reading guide rather than centred alone: at
            500px in a 1220px shell it left ~360px empty either side. */}
        <div className="mb-14 grid items-center gap-10 lg:grid-cols-[0.82fr_1.18fr] lg:gap-16">
          <Reveal>
            <div className="mb-4 flex items-baseline justify-between border-b border-ink/16 pb-3 text-[12px] font-semibold uppercase tracking-[0.12em] text-muted">
              <span>Actual comparison</span>
              <span>Mid face &amp; jawline</span>
            </div>
            <BeforeAfterSlider
              before={heroBefore}
              after={heroAfter}
              beforeAlt="Front view of a patient's face before buccal fat removal, showing fullness through the mid face"
              afterAlt="The same patient after buccal fat removal, showing a more defined cheekbone and jawline"
              sizes="(max-width: 1024px) 92vw, 460px"
            />
          </Reveal>

          <div>
            <Reveal as="p" className="m-0 max-w-[52ch] text-[17.5px] leading-[1.75] text-body">
              {RESULTS.intro}
            </Reveal>

            <RevealGroup step={0.1} className="mt-9">
              {RESULTS.lookFor.map((l) => (
                <RevealItem
                  key={l.title}
                  className="border-t border-ink/12 py-5 last:border-b"
                >
                  <h3 className="mb-1.5 font-display text-[19px] leading-[1.3] text-ink">
                    {l.title}
                  </h3>
                  <p className="m-0 max-w-[54ch] text-[15.5px] leading-[1.6] text-muted">
                    {l.body}
                  </p>
                </RevealItem>
              ))}
            </RevealGroup>
          </div>
        </div>

        {/*
          `items-start` so a card is never stretched away from its own aspect
          ratio. With squares ordered before the landscape pairs each row is
          one shape anyway, but a future addition in a third shape then slots
          in without distorting anything.
        */}
        <RevealGroup
          step={0.07}
          className="grid items-start gap-5 sm:grid-cols-2 lg:grid-cols-3"
        >
          {PAIRS.map(({ key, layout }) => {
            const img = IMAGES[key as keyof typeof IMAGES];
            const place = ARRANGEMENT[layout];
            return (
              <RevealItem key={key}>
                {/*
                  No caption strip under the frame any more — the labels sit
                  on the photograph where they are read, so a bar repeating
                  the same thing in words was doing nothing but adding height.
                */}
                <figure className="group relative m-0 overflow-hidden rounded-[3px] bg-greige shadow-[0_20px_40px_-32px_rgb(35_27_22/0.5)] transition-[box-shadow] duration-500 ease-out-soft hover:shadow-[0_28px_54px_-30px_rgb(35_27_22/0.6)]">
                  <div className="relative overflow-hidden">
                    <Image
                      src={img.src}
                      alt={`Buccal fat removal before and after — ${place.described}`}
                      width={img.width}
                      height={img.height}
                      sizes="(max-width: 640px) 92vw, (max-width: 1024px) 46vw, 31vw"
                      placeholder="blur"
                      blurDataURL={img.blurDataURL}
                      className="h-auto w-full transition-transform duration-700 ease-out-soft group-hover:scale-[1.035]"
                    />

                    {/* Positioned per card. On a stacked pair "After" sits at
                        the bottom, not the right — which is exactly what the
                        old fixed markup got wrong. */}
                    <Tag position={place.before} tone="before">
                      Before
                    </Tag>
                    <Tag position={place.after} tone="after">
                      After
                    </Tag>
                  </div>
                </figure>
              </RevealItem>
            );
          })}
        </RevealGroup>

        <Reveal delay={0.12} className="mt-11 text-center">
          <ButtonLink href="#book" event="cta_click" eventLabel="results">
            See what&rsquo;s possible for your face
          </ButtonLink>
          {SHOW_RESULTS_DISCLAIMER && (
            <p className="mx-auto m-0 mt-6 max-w-[62ch] text-[13px] leading-[1.7] text-muted">
              {RESULTS.disclaimer}
            </p>
          )}
        </Reveal>
      </div>
    </Section>
  );
}
