"use client";

import Image from "next/image";
import { Eyebrow } from "@/components/lp/Eyebrow";
import { MaskedHeading } from "@/components/lp/MaskedHeading";
import { Reveal } from "@/components/lp/Reveal";
import { Section } from "@/components/lp/Section";
import { TiltCard } from "@/components/lp/TiltCard";
import { IMAGES } from "@/lib/generated/images";
import { BENEFITS } from "../content";

const portrait = IMAGES["benefits-portrait.jpg"];

const ICONS: Record<string, React.ReactNode> = {
  contour: (
    <path d="M4 6c4.5 0 7 2.2 8.4 5.2C13.8 14.2 16.6 17 21 18" strokeLinecap="round" />
  ),
  hidden: (
    <>
      <path d="M2 12s3.6-6 10-6 10 6 10 6-3.6 6-10 6-10-6-10-6Z" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="2.6" />
      <path d="M3 3l18 18" strokeLinecap="round" />
    </>
  ),
  permanent: (
    <>
      <path d="M12 3.5 20 7v5.4c0 4.6-3.2 7.6-8 9.1-4.8-1.5-8-4.5-8-9.1V7l8-3.5Z" strokeLinejoin="round" />
      <path d="m8.8 12.2 2.2 2.2 4.4-4.4" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="8.6" />
      <path d="M12 7.2V12l3.2 2" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  pairs: (
    <>
      <circle cx="9" cy="12" r="5.6" />
      <circle cx="15" cy="12" r="5.6" />
    </>
  ),
  once: (
    <>
      <path d="M20.5 12a8.5 8.5 0 1 1-2.6-6.1" strokeLinecap="round" />
      <path d="M20.6 4v4.6H16" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
};

export function Benefits() {
  return (
    <Section id="benefits" tone="ivory" padding="tight">
      <div className="shell">
        {/* Not <SectionHead>: its 54px bottom margin is 24px more than
            this band can spare once the photograph is in the row, and
            passing `mb-*` through its className would sit at equal
            specificity with the built-in one — a coin flip decided by
            stylesheet order, not attribute order. Inlining is the honest
            way to take a different value. */}
        <div className="mx-auto mb-[30px] max-w-[64ch] text-center">
          <Eyebrow center>{BENEFITS.eyebrow}</Eyebrow>
          <MaskedHeading
            lines={[
              BENEFITS.headline[0],
              <em key="a" className="accent">
                {BENEFITS.headline[1]}
              </em>,
            ]}
            className="font-display text-[clamp(32px,4.4vw,46px)] font-semibold leading-[1.12] tracking-[-0.01em] text-ink"
          />
        </div>

        {/* One grid holds the photograph and all six cards.

            Front-facing on purpose: this section is describing cheekbone
            and jawline definition, and the hero's three-quarter view
            can't show it.

            The shape is driven by a single rule — **the photograph and
            every card have to be on screen together**. That rules out
            three rows of cards: at 1440x900 it made the band 1246px and
            you could never see the top of the photo and the last card at
            once. Four columns with the photo spanning both rows gets the
            whole thing to ~830px, inside a 900px viewport.

            The cost is card width. Three columns of cards at 237px is
            narrower than the 364px they had before the photo arrived, so
            the type came down with it. That's the trade: everything
            visible at once, or roomier cards you have to scroll between.

            No `items-start` here — the photo cell is sized by the two
            card rows beside it, and `items-start` would collapse it to
            its own content instead. */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr] lg:gap-5">
          {/* Spans the full width while stacked, then becomes the left
              column across both card rows. The inner div is absolute so
              it fills whatever height those rows come to — the photo is
              sized by the cards, never the other way round. */}
          <Reveal className="relative sm:col-span-2 lg:col-span-1 lg:row-span-2">
            {/* Offset hairline, like a matted print. Desktop only — at
                phone widths it just crowds the shell edge. */}
            <span
              aria-hidden
              className="pointer-events-none absolute -bottom-3.5 -left-3.5 hidden h-full w-full rounded-[3px] border border-gold/30 lg:block"
            />

            {/* 5:4 while stacked. A 4:5 portrait is far too tall to sit
                above a phone's card stack, but the 16:10 band this started
                as cropped the chin away — and the jawline is half of what
                the copy beside it is claiming. 5:4 is the widest crop that
                still holds hairline to jaw. */}
            <div className="relative aspect-[5/4] overflow-hidden rounded-[3px] lg:absolute lg:inset-0 lg:aspect-auto">
              <Image
                src={portrait.src}
                /* Decorative. This is reference photography, not a patient
                   record, so it must not be described as a result — the
                   copy beside it carries the meaning. */
                alt=""
                aria-hidden
                fill
                sizes="(max-width: 1023px) 100vw, 500px"
                placeholder="blur"
                blurDataURL={portrait.blurDataURL}
                /* 42% while stacked puts the crop window over hairline-to-
                   jaw rather than centring it on the eyes. From lg the
                   column is taller than the source is wide, so cover uses
                   the full height and the vertical value stops mattering —
                   only the horizontal 50% does. */
                className="object-cover object-[50%_42%] lg:object-[50%_24%]"
              />

              {/* Warm wash pinned to the lower edge, so the photograph
                  settles into the ivory instead of ending on a line. */}
              <div
                aria-hidden
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(180deg, transparent 62%," +
                    " rgb(242 235 225 / 0.28) 85%," +
                    " rgb(242 235 225 / 0.7) 100%)",
                }}
              />
            </div>
          </Reveal>

          {/* Cards are siblings of the photograph, not nested in their own
              grid — they have to be direct children for the photo's
              row-span to place them around it. `Reveal` with a per-index
              delay gives the same stagger `RevealGroup` did. */}
          {BENEFITS.items.map((b, i) => (
            <Reveal key={b.title} delay={0.05 * i} className="h-full">
              <TiltCard className="group h-full overflow-hidden rounded-[3px] border border-ink/12 bg-sand/45 transition-[background-color,box-shadow] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:bg-ivory hover:shadow-[0_28px_50px_-34px_rgb(35_27_22/0.45)]">
                {/* Compact on purpose. Two rows of these set the height of
                    the whole band, and the band has to fit a screen — so
                    padding and type are sized down to what a 237px column
                    actually needs rather than what looked generous at
                    364px. */}
                <article className="relative h-full p-[18px]">
                  {/* Gold rule draws across the top edge on hover. */}
                  <span
                    aria-hidden
                    className="absolute inset-x-0 top-0 h-[2px] origin-left scale-x-0 bg-linear-to-r from-gold to-gold-light transition-transform duration-600 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-x-100"
                  />

                  <span className="mb-3.5 grid h-9 w-9 place-items-center rounded-full border border-gold/30 text-gold transition-[background-color,color,border-color] duration-400 group-hover:border-gold group-hover:bg-gold group-hover:text-white">
                    <svg
                      width="17"
                      height="17"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      aria-hidden
                    >
                      {ICONS[b.icon]}
                    </svg>
                  </span>

                  <h3 className="mb-2.5 font-display text-[17px] leading-[1.3] text-ink">
                    {b.title}
                  </h3>
                  <p className="m-0 text-[14px] leading-[1.56] text-body">{b.body}</p>
                </article>
              </TiltCard>
            </Reveal>
          ))}
        </div>
      </div>
    </Section>
  );
}
