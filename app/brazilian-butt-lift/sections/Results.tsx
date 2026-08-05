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
import { GALLERY, RESULTS } from "../content";

const compareBefore = BBL["compare-before.jpg"];
const compareAfter = BBL["compare-after.jpg"];

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

          0.66fr, where the buccal page gives its slider 0.82fr. The two
          halves are 238px of source (see the crop note in
          prepare-images.mjs — that is everything the clinic's grid holds
          at full resolution), and a wider column would only stretch them
          further. 0.66fr lands at roughly 380px, a 1.6x upscale, which a
          photograph carries and a wider one does not.
        */}
        <div className="mb-14 grid items-center gap-10 lg:grid-cols-[0.66fr_1.34fr] lg:gap-16">
          <Reveal>
            <div className="mb-4 flex items-baseline justify-between border-b border-ink/16 pb-3 text-[12px] font-semibold uppercase tracking-[0.12em] text-muted">
              <span>Actual comparison</span>
              <span>Shape &amp; projection</span>
            </div>
            <BeforeAfterSlider
              before={compareBefore}
              after={compareAfter}
              beforeAlt="A patient's buttocks and upper thighs before a Brazilian Butt Lift"
              afterAlt="The same patient after a Brazilian Butt Lift, showing a rounder, more projected shape"
              sizes="(max-width: 1024px) 92vw, 380px"
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
          `items-start` so a card is never stretched away from its own
          aspect ratio. GALLERY orders the six square pairs cut from the
          clinic's grid before the six landscape cards, so each row of the
          three-column grid holds one shape and comes out even.

          Tags come from each card's own `kind`, not from a rule applied to
          the whole gallery: three of these photographs have no "before" in
          them, and stamping the pair labels across all twelve would be
          describing pictures that don't exist. See the note above GALLERY
          in content.ts.
        */}
        <RevealGroup
          step={0.07}
          className="grid items-start gap-5 sm:grid-cols-2 lg:grid-cols-3"
        >
          {GALLERY.map((card) => {
            const img = BBL[card.key as keyof typeof BBL];
            const pair = card.kind === "pair";
            return (
              <RevealItem key={card.key}>
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
                      sizes="(max-width: 640px) 92vw, (max-width: 1024px) 46vw, 31vw"
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
          <ButtonLink href="#book" event="cta_click" eventLabel="results">
            See what&rsquo;s possible for your shape
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
