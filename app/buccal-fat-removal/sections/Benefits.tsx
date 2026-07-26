"use client";

import { Eyebrow } from "@/components/lp/Eyebrow";
import { MaskedHeading } from "@/components/lp/MaskedHeading";
import { RevealGroup, RevealItem } from "@/components/lp/Reveal";
import { Section, SectionHead } from "@/components/lp/Section";
import { TiltCard } from "@/components/lp/TiltCard";
import { BENEFITS } from "../content";

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

        <RevealGroup
          step={0.08}
          className="grid gap-x-6 gap-y-6 sm:grid-cols-2 lg:grid-cols-3"
        >
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
    </Section>
  );
}
