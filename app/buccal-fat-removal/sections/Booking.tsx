"use client";

import { Eyebrow } from "@/components/lp/Eyebrow";
import { LeadForm } from "@/components/lp/LeadForm";
import { MaskedHeading } from "@/components/lp/MaskedHeading";
import { Reveal } from "@/components/lp/Reveal";
import { BOOKING, SLUG } from "../content";

/**
 * Final CTA. The case on the left, the form on the right.
 *
 * The two columns land at roughly the same height on their own, so the
 * copy carries the left side without needing a step list or an assurances
 * block to pad it out.
 */
export function Booking() {
  return (
    <section
      id="book"
      /* Top padding matches the page rhythm; the bottom is deliberately
         shorter. The footer below is the same espresso-deep, so there's no
         tone change to mark the boundary — a full 68+68 between them read
         as one dead gap rather than two sections meeting. */
      className="grain relative overflow-hidden bg-espresso-deep pb-[30px] pt-[44px] sm:pb-[44px] sm:pt-[68px]"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-[8%] top-[12%] h-[42vw] max-h-[520px] w-[42vw] max-w-[520px] rounded-full opacity-40 blur-[90px]"
        style={{
          background: "radial-gradient(circle, rgb(168 127 73 / 0.55) 0%, transparent 70%)",
        }}
      />

      <div className="shell relative z-2 grid items-center gap-12 lg:grid-cols-[1fr_1fr] lg:gap-16">
        {/* ---------- the case ---------- */}
        <div>
          <Eyebrow onDark>{BOOKING.eyebrow}</Eyebrow>

          <MaskedHeading
            lines={[
              <span key="a" className="text-white">
                {BOOKING.headline[0]}
              </span>,
              <em key="b" className="italic text-champagne">
                {BOOKING.headline[1]}
              </em>,
            ]}
            className="font-display text-[clamp(34px,5.2vw,58px)] font-semibold leading-[1.06] tracking-[-0.015em]"
          />

          <Reveal
            as="p"
            delay={0.08}
            className="mb-7 mt-9 max-w-[30ch] font-display text-[23px] italic leading-[1.4] text-champagne sm:text-[27px]"
          >
            {BOOKING.lead}
          </Reveal>

          {BOOKING.body.map((p, i) => (
            <Reveal
              key={i}
              as="p"
              delay={0.14 + i * 0.07}
              className="max-w-[48ch] text-[17px] leading-[1.85] text-white/70"
            >
              {p}
            </Reveal>
          ))}

        </div>

        {/* ---------- the form ---------- */}
        <Reveal delay={0.1}>
          <LeadForm pageSlug={SLUG} />
        </Reveal>
      </div>
    </section>
  );
}
