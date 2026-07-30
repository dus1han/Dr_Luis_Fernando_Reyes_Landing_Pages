import type { Metadata } from "next";
import Link from "next/link";
import { LeadEvent } from "@/components/analytics/LeadEvent";
import { GlowLogo } from "@/components/lp/GlowLogo";
import { SITE } from "@/lib/site";
import { SLUG } from "../content";

export const metadata: Metadata = {
  title: "Thank you",
  /**
   * `noindex` regardless of the origin, unlike every other page here.
   *
   * Without it, strangers reach a "thank you for your enquiry" page from a
   * search result — confusing on its own, and a source of phantom conversions
   * the moment anyone switches the conversion action to a URL rule.
   */
  robots: { index: false, follow: false },
};

/**
 * A real page, not a modal.
 *
 * The form used to swap itself for an inline success card. That produced no
 * page load — so there was nothing for a URL-based conversion rule to hang on,
 * no shareable confirmation, and nothing to screenshot for the clinic.
 *
 * `<LeadEvent>` is what actually reports the conversion, and only when the
 * one-time flag set at submit is present.
 */
export default function ThankYou() {
  return (
    <>
      <LeadEvent formLocation={SLUG} />

      <main className="grid min-h-screen place-items-center bg-espresso-deep px-6 py-20 text-center">
        <div className="relative">
          <div
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-1/2 h-[70vw] max-h-[520px] w-[70vw] max-w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-35 blur-[90px]"
            style={{
              background:
                "radial-gradient(circle, rgb(168 127 73 / 0.55) 0%, transparent 70%)",
            }}
          />

          <div className="relative z-1 mx-auto max-w-[52ch]">
            <div className="mb-9 flex justify-center">
              <GlowLogo width={210} />
            </div>

            {/* Static tick, not an animated one. This page can be reached by
                a back-navigation, where a drawing animation replays and reads
                as though something submitted again. */}
            <svg
              width="56"
              height="56"
              viewBox="0 0 52 52"
              fill="none"
              className="mx-auto mb-6"
              aria-hidden
            >
              <circle
                cx="26"
                cy="26"
                r="24"
                stroke="var(--color-gold)"
                strokeWidth="1.5"
                opacity="0.4"
              />
              <path
                d="M16 26.5 23 33.5 36 20"
                stroke="var(--color-champagne)"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>

            <p className="m-0 mb-4 font-sans text-[12px] font-semibold uppercase tracking-[0.24em] text-champagne">
              Request received
            </p>

            <h1 className="m-0 font-display text-[clamp(32px,6vw,52px)] font-semibold leading-[1.1] tracking-[-0.015em] text-white">
              Thank you &mdash;{" "}
              <em className="italic text-champagne">we&rsquo;ll be in touch</em>
            </h1>

            <p className="mx-auto mb-9 mt-6 max-w-[46ch] text-[16.5px] leading-[1.75] text-white/64">
              A member of {SITE.doctorShort}&rsquo;s team will call you on the
              number you provided to arrange your consultation.
            </p>

            {/* Someone who has just enquired is the most likely they will ever
                be to make contact directly, so both routes are here rather
                than only a link back to the page they came from. */}
            <div className="flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
              <a
                href={SITE.contactHref}
                className="inline-flex min-h-12 items-center justify-center rounded-[2px] bg-gold px-7 text-[13px] font-semibold uppercase tracking-[0.09em] text-white no-underline transition-colors duration-300 hover:bg-champagne hover:text-espresso-deep"
              >
                Call {SITE.contactDisplay}
              </a>
              <a
                href={SITE.whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-12 items-center justify-center rounded-[2px] border border-champagne/35 px-7 text-[13px] font-semibold uppercase tracking-[0.09em] text-champagne no-underline transition-colors duration-300 hover:border-champagne hover:bg-champagne hover:text-espresso-deep"
              >
                WhatsApp us
              </a>
            </div>

            <p className="m-0 mt-10 text-[12.5px] text-white/38">
              <Link
                href={`/${SLUG}`}
                className="text-white/50 no-underline transition-colors duration-300 hover:text-champagne"
              >
                Back to the {SITE.doctorShort} page
              </Link>
            </p>
          </div>
        </div>
      </main>
    </>
  );
}
