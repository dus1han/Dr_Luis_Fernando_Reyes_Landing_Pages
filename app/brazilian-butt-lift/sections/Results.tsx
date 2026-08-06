"use client";

import Image from "next/image";
import { BeforeAfterSlider } from "@/components/lp/BeforeAfterSlider";
import { Eyebrow } from "@/components/lp/Eyebrow";
import { MaskedHeading } from "@/components/lp/MaskedHeading";
import { Reveal, RevealGroup, RevealItem } from "@/components/lp/Reveal";
import { ButtonLink } from "@/components/lp/Button";
import { Section, SectionHead } from "@/components/lp/Section";
import { BBL } from "@/lib/generated/images";
import { SHOW_RESULTS_DISCLAIMER } from "@/lib/site";
import { FEATURED, GALLERY, RESULTS } from "../content";

const compareBefore = BBL[FEATURED.before as keyof typeof BBL];
const compareAfter = BBL[FEATURED.after as keyof typeof BBL];

/**
 * Frosted pill. `backdrop-blur` is what makes one legible over skin tones,
 * clothing and clinic wall alike without a heavy slab of colour — the tint
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

        {/*
          Featured comparison — the one image on the page the visitor can
          actually operate, so it leads the proof section.

          Centred and alone, where the buccal page sets its slider in a
          two-column row beside a reading guide. That guide was removed
          here at the clinic's request (see the note on RESULTS in
          content.ts), and a lone column in a two-column grid is just an
          element pinned to one side with a hole next to it.

          430px, not the full shell. The halves are 310px of source — all
          the clinic's card holds — so this is a 1.39x upscale, about as
          far as a photograph stretches before it reads as soft. The rule
          above shares the width so the two align as one block.
        */}
        <Reveal className="mx-auto mb-14 w-full max-w-[430px]">
          <div className="mb-4 flex items-baseline justify-between border-b border-ink/16 pb-3 text-[12px] font-semibold uppercase tracking-[0.12em] text-muted">
            <span>Actual comparison</span>
            <span>{FEATURED.area}</span>
          </div>
          <BeforeAfterSlider
            before={compareBefore}
            after={compareAfter}
            beforeAlt={FEATURED.beforeAlt}
            afterAlt={FEATURED.afterAlt}
            sizes="(max-width: 640px) 92vw, 430px"
          />
        </Reveal>

        {/*
          `items-start` so a card is never stretched away from its own
          aspect ratio. All five are 700x380 today, so nothing is ragged —
          but the buccal page's gallery mixes two shapes, and a card added
          here in a third would otherwise be stretched to match its row.

          Flex wrap, not grid — and that is the whole reason it changed.
          Five cards in three columns leaves an orphan row of two, and CSS
          grid has no way to centre it: `justify-content` centres the
          *track set*, so the two still sit in columns 1 and 2 with a hole
          on the right. Flex lays out row by row, so `justify-center`
          centres the trailing pair under the gap between the three above.

          The widths reproduce the grid's columns arithmetically — one up,
          two from sm, three from lg — because `basis` has to do the job
          `grid-cols` was doing.

          Tags come from each card's own `kind`, not from a rule applied to
          the whole gallery: three of these photographs have no "before" in
          them, and stamping the pair labels across all five would be
          describing pictures that don't exist. See the note above GALLERY
          in content.ts.
        */}
        <RevealGroup
          step={0.07}
          className="flex flex-wrap items-start justify-center gap-5"
        >
          {GALLERY.map((card) => {
            const img = BBL[card.key as keyof typeof BBL];
            const pair = card.kind === "pair";
            return (
              <RevealItem
                key={card.key}
                className="w-full sm:w-[calc((100%-20px)/2)] lg:w-[calc((100%-40px)/3)]"
              >
                <figure className="group relative m-0 overflow-hidden rounded-[3px] bg-greige shadow-[0_20px_40px_-32px_rgb(35_27_22/0.5)] transition-[box-shadow] duration-500 ease-out-soft hover:shadow-[0_28px_54px_-30px_rgb(35_27_22/0.6)]">
                  <div className="relative overflow-hidden">
                    <Image
                      src={img.src}
                      alt={
                        pair
                          ? `${card.area} before and after — before left, after right`
                          : `${card.area} after body contouring with Dr. Luis Fernando Reyes`
                      }
                      width={img.width}
                      height={img.height}
                      sizes="(max-width: 640px) 92vw, 380px"
                      placeholder="blur"
                      blurDataURL={img.blurDataURL}
                      className="h-auto w-full transition-transform duration-700 ease-out-soft group-hover:scale-[1.035]"
                    />

                    {pair ? (
                      <>
                        <Tag position="left-3 top-3" tone="before">
                          Before
                        </Tag>
                        <Tag position="right-3 top-3" tone="after">
                          After
                        </Tag>
                      </>
                    ) : (
                      /* One tag, and it does not say "after". A single
                         photograph with nothing to compare it to is a
                         result; calling it an "after" implies a "before"
                         the visitor is never shown. */
                      <Tag position="left-3 top-3" tone="after">
                        Result
                      </Tag>
                    )}
                  </div>
                </figure>
              </RevealItem>
            );
          })}
        </RevealGroup>

        <Reveal delay={0.12} className="mt-11 text-center">
          {/* Shorter than the buccal page's "…for your face", which sits
              exactly at the shell width at 390px. Matching its character
              count is not enough — this label is uppercase, and BODY is
              measurably wider than FACE at the same length. Dropping the
              noun leaves real headroom instead of landing on the limit
              again. */}
          <ButtonLink href="#book" event="cta_click" eventLabel="results">
            See what&rsquo;s possible for you
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
