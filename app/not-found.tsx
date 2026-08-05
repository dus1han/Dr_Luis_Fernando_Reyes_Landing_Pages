import type { Metadata } from "next";
import Link from "next/link";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: false },
};

/**
 * Branded 404.
 *
 * Next's default is an unstyled "This page could not be found" — on a site
 * running paid traffic that reads as broken, and a visitor who mistypes or
 * follows a stale ad link simply leaves. This one keeps the brand and
 * offers the two things that recover the visit: the landing page, or the
 * phone.
 */
export default function NotFound() {
  return (
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

        <div className="relative z-1">
          <p className="m-0 mb-5 font-sans text-[12px] font-semibold uppercase tracking-[0.24em] text-champagne">
            Page not found
          </p>

          <h1 className="m-0 font-display text-[clamp(38px,7vw,64px)] font-semibold leading-[1.08] tracking-[-0.015em] text-white">
            This page doesn&rsquo;t
            <br />
            <em className="italic text-champagne">exist any more</em>
          </h1>

          <p className="mx-auto mb-9 mt-6 max-w-[46ch] text-[16.5px] leading-[1.75] text-white/64">
            The link may be out of date. You can see the procedures we have
            pages for, or speak to the clinic directly.
          </p>

          <div className="flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
            {/* The index, not a named procedure. This button pointed at
                buccal fat removal while that was the only page; with more
                than one, sending everyone to a specific one is a guess,
                and `/` lists them all. */}
            <Link
              href="/"
              className="inline-flex min-h-12 items-center justify-center rounded-[2px] bg-gold px-7 text-[13px] font-semibold uppercase tracking-[0.09em] text-white no-underline transition-colors duration-300 hover:bg-champagne hover:text-espresso-deep"
            >
              See the procedures
            </Link>
            <a
              href={SITE.contactHref}
              className="inline-flex min-h-12 items-center justify-center rounded-[2px] border border-champagne/35 px-7 text-[13px] font-semibold uppercase tracking-[0.09em] text-champagne no-underline transition-colors duration-300 hover:border-champagne hover:bg-champagne hover:text-espresso-deep"
            >
              Call the clinic
            </a>
          </div>

          <p className="m-0 mt-10 text-[12.5px] text-white/38">
            {SITE.doctor} &middot; {SITE.city}
          </p>
        </div>
      </div>
    </main>
  );
}
