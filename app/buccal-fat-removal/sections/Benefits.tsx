"use client";

import Image from "next/image";
import { Eyebrow } from "@/components/lp/Eyebrow";
import { MaskedHeading } from "@/components/lp/MaskedHeading";
import { Reveal, RevealGroup, RevealItem } from "@/components/lp/Reveal";
import { Section, SectionHead } from "@/components/lp/Section";
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
        <SectionHead>
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
        </SectionHead>

        {/* Portrait beside the cards rather than above them.

            Front-facing on purpose: this section is describing cheekbone
            and jawline definition, and the hero's three-quarter view
            can't show it. The cards drop from three columns to two to
            make room — which also gives them the width their titles
            wanted, since several were wrapping to three lines at a third
            of the shell.

            No `items-start` on this grid — the photo column is sized by
            the card column beside it, and `items-start` would collapse it
            to its own content instead. */}
        <div className="grid gap-8 lg:grid-cols-[0.82fr_1.18fr] lg:gap-10">
          {/* From lg the photograph is pulled out of flow and pinned to
              the cell, so it runs the exact height of the six cards. It
              was sticky at its natural 4:5 first, which left ~330px of
              bare ivory under it — and because it stuck to the top of the
              viewport, that gap was on screen the whole way down the
              section rather than hidden by the scroll.

              Filling the column costs a tighter crop: at 484x940 this is
              1:1.94 against a 4:5 source, so about a third of the width
              goes. The face survives it comfortably — scaled to cover,
              it's ~334px inside a 484px window — and what's lost is
              backdrop and shoulder. */}
          <Reveal className="relative">
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

          <RevealGroup step={0.08} className="grid gap-6 sm:grid-cols-2">
          {BENEFITS.items.map((b) => (
            <RevealItem key={b.title} className="h-full">
              <TiltCard className="group h-full overflow-hidden rounded-[3px] border border-ink/12 bg-sand/45 transition-[background-color,box-shadow] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:bg-ivory hover:shadow-[0_28px_50px_-34px_rgb(35_27_22/0.45)]">
              <article className="relative h-full p-7">
                {/* Gold rule draws across the top edge on hover. */}
                <span
                  aria-hidden
                  className="absolute inset-x-0 top-0 h-[2px] origin-left scale-x-0 bg-linear-to-r from-gold to-gold-light transition-transform duration-600 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-x-100"
                />

                <span className="mb-5 grid h-11 w-11 place-items-center rounded-full border border-gold/30 text-gold transition-[background-color,color,border-color] duration-400 group-hover:border-gold group-hover:bg-gold group-hover:text-white">
                  <svg
                    width="21"
                    height="21"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    aria-hidden
                  >
                    {ICONS[b.icon]}
                  </svg>
                </span>

                <h3 className="mb-3.5 font-display text-[20px] leading-[1.3] text-ink">
                  {b.title}
                </h3>
                <p className="m-0 text-[15.5px] leading-[1.7] text-body">{b.body}</p>
              </article>
              </TiltCard>
            </RevealItem>
          ))}
          </RevealGroup>
        </div>
      </div>
    </Section>
  );
}
