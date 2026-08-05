import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Aurora } from "@/components/lp/Aurora";
import { Eyebrow } from "@/components/lp/Eyebrow";
import { GlowLogo } from "@/components/lp/GlowLogo";
import { MaskedHeading } from "@/components/lp/MaskedHeading";
import { Reveal } from "@/components/lp/Reveal";
import { TiltCard } from "@/components/lp/TiltCard";
import { PAGES, type LandingPage } from "@/lib/pages";
import { INDEXABLE } from "@/lib/site-url";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  /*
   * No `title` on purpose. This page sits at the same level as the root
   * layout, so it takes that layout's `default` — "Dr. Luis Fernando Reyes" —
   * rather than running through the `%s | …` template. Setting one here would
   * produce a bare, unbranded tab, which is what it used to do ("Landing
   * pages"): the one page with no clinic name in its tab was the hub.
   */
  description: `Campaign landing pages for ${SITE.doctor}, ${SITE.practice} in ${SITE.city}.`,
  /**
   * noindex, follow.
   *
   * This is a hub for an ads subdomain, not a page anyone should reach
   * from search. Indexing it would put a thin directory page into results
   * competing with the practice's own site, and Ads doesn't need it — a
   * campaign points at `/<slug>` directly. `follow` is kept so crawlers
   * still reach the landing pages through it.
   *
   * `follow` tracks INDEXABLE: on a preview build there is nothing here a
   * crawler should follow either, and letting it walk through to the landing
   * pages is how a temporary address gets discovered in the first place.
   *
   * Flip `index` to true only if this subdomain is ever meant to rank.
   */
  robots: { index: false, follow: INDEXABLE },
  alternates: { canonical: "/" },
};

/**
 * Grid shape is driven by how many pages exist, because a fixed
 * three-column grid holding one card renders it a third of the width with
 * two empty cells beside it — which reads as a broken layout rather than
 * a short list. With four pages this settles into 2×2.
 */
const GRID = ["", "", "sm:grid-cols-2", "sm:grid-cols-2 lg:grid-cols-3"];
const WIDTH = ["", "max-w-[430px]", "max-w-[840px]", "max-w-[1140px]"];

function shape(count: number) {
  const i = Math.min(count, 3);
  return { cols: GRID[i], width: WIDTH[i] };
}

/** Card contents — the shell around them differs for live vs planned. */
function CardBody({ page, index }: { page: LandingPage; index: number }) {
  const img = page.image;
  const planned = page.status === "planned";

  return (
    <>
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={img.src}
          alt=""
          aria-hidden
          fill
          sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 380px"
          placeholder="blur"
          blurDataURL={img.blurDataURL}
          className={`object-cover object-[50%_16%] transition-transform duration-[1100ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
            planned ? "grayscale" : "group-hover:scale-[1.06]"
          }`}
        />
        {/* Espresso wash so the thumbnail sits in the palette rather than
            beside it, and so the type below has a settled base to meet. */}
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgb(31 23 19 / 0.08) 0%," +
              " rgb(31 23 19 / 0.32) 58%, rgb(51 38 31 / 0.92) 100%)",
          }}
        />

        {/* Index numeral, set large and low-contrast over the photograph —
            gives the grid an editorial spine and makes a single card look
            deliberate rather than lonely. */}
        <span
          aria-hidden
          className="absolute bottom-3 right-5 font-display text-[54px] font-semibold leading-none text-white/12"
        >
          {String(index + 1).padStart(2, "0")}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-7">
        <p className="m-0 mb-3 font-sans text-[11px] font-semibold uppercase tracking-[0.2em] text-champagne">
          {page.eyebrow}
        </p>

        <h2 className="m-0 font-display text-[27px] font-semibold leading-[1.18] tracking-[-0.012em] text-white">
          {page.title}
        </h2>

        <p className="mb-0 mt-3.5 flex-1 text-[15px] leading-[1.7] text-white/62">
          {page.blurb}
        </p>

        {planned ? (
          <span className="mt-7 inline-flex w-fit items-center rounded-full border border-white/12 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/34">
            In progress
          </span>
        ) : (
          <span className="mt-7 inline-flex items-center gap-2.5 text-[12px] font-semibold uppercase tracking-[0.14em] text-gold-light transition-colors duration-300 group-hover:text-champagne">
            View page
            <span
              aria-hidden
              className="relative block h-px w-[26px] overflow-hidden bg-current/40"
            >
              {/* Hairline fills toward the arrow on hover — the same
                  left-origin wipe the stepper and dwell bars use. */}
              <span className="absolute inset-0 origin-left scale-x-0 bg-current transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-x-100" />
            </span>
            <svg
              width="16"
              height="8"
              viewBox="0 0 18 8"
              fill="none"
              aria-hidden
              className="transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-1.5"
            >
              <path
                d="M0 4h16M12.5 1 16 4l-3.5 3"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        )}
      </div>
    </>
  );
}

const SHELL =
  "h-full overflow-hidden rounded-[3px] border bg-espresso transition-[border-color,box-shadow] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]";

function Card({ page, index }: { page: LandingPage; index: number }) {
  if (page.status === "planned") {
    return (
      <div className={`${SHELL} group flex flex-col border-white/8 opacity-55`}>
        <CardBody page={page} index={index} />
      </div>
    );
  }

  /* TiltCard carries the shell styling and the `group`, because its cursor
     glow is keyed off group-hover — the same arrangement the benefits grid
     uses. It renders a plain div on touch, so phones get the static card
     with no listeners attached. */
  return (
    <TiltCard
      className={`${SHELL} group border-white/12 hover:border-champagne/50 hover:shadow-[0_30px_60px_-30px_rgb(0_0_0/0.8)]`}
    >
      <Link
        href={`/${page.slug}`}
        className="flex h-full flex-col text-left no-underline"
      >
        <CardBody page={page} index={index} />
      </Link>
    </TiltCard>
  );
}

/**
 * Root index for the ads subdomain.
 *
 * Campaigns link straight to `/<slug>`, so no visitor arrives here from an
 * ad — this exists so the clinic (and whoever picks the work up next) has
 * one address that shows what's live. It replaced a redirect onto the
 * buccal fat page, which stopped making sense the moment there was more
 * than one page to redirect to.
 *
 * Espresso-deep rather than the ivory the landing pages lead with: this is
 * a gateway, and a dark plate reads as distinct from the pages it opens
 * while staying inside the palette — the same treatment the 404 and the
 * footer already use.
 *
 * It leans on three things the kit already had and this page had no
 * competition for: <Aurora> (built for the hero, unused once the
 * photograph took that job), the masked headline entrance, and the
 * pointer tilt from the benefits grid.
 */
export default function Index() {
  const { cols, width } = shape(PAGES.length);

  return (
    /* max-[640px]:-mb-[76px] cancels the body's bottom padding on phones.
       globals.css reserves 76px there for the sticky CTA bar, which only
       exists on a landing page — here nothing covers it, so it rendered as
       a bare ivory strip under the footer line. The negative margin lets
       this band paint over the reserved space instead of removing the rule
       globally, which the landing page still needs. The breakpoint is
       written as an exact arbitrary value because Tailwind's `max-sm` is
       max-width:639px and the globals rule is 640px — a one-pixel window
       where the strip would come back. */
    <main className="grain relative min-h-screen overflow-hidden bg-espresso-deep py-[64px] max-[640px]:-mb-[76px] sm:py-[92px]">
      {/* Aurora was written for an ivory panel, where its columns had to
          stay below ivory in lightness to read as warm light rather than
          a white smear. On espresso-deep that same constraint works in its
          favour — gold, champagne and blush are all far lighter than the
          ground, so the columns genuinely glow. */}
      <Aurora />

      {/* Same warm bloom the booking band and footer carry, sitting over
          the columns so the centre stays quiet behind the headline. */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-[14%] left-1/2 h-[76vw] max-h-[680px] w-[76vw] max-w-[680px] -translate-x-1/2 rounded-full opacity-40 blur-[100px]"
        style={{
          background:
            "radial-gradient(circle, rgb(168 127 73 / 0.55) 0%, transparent 70%)",
        }}
      />

      <div className="shell relative z-2">
        <div className="flex justify-center">
          <GlowLogo width={244} />
        </div>

        <div className="mx-auto mt-[52px] max-w-[54ch] text-center sm:mt-[66px]">
          <Eyebrow onDark center>
            {SITE.city} &middot; {SITE.practice}
          </Eyebrow>

          {/* accent-sheen is documented hero-only on contrast grounds: gold
              is 3.06:1 on ivory, which only just clears the large-text
              minimum. On espresso-deep it sits near 4.4:1 and the glint
              travels toward champagne, so it gets lighter, not washed out.
              The constraint that made it hero-only doesn't bind here. */}
          <MaskedHeading
            as="h1"
            immediate
            lines={[
              "Where would you",
              <em key="accent" className="accent-sheen">
                like to begin?
              </em>,
            ]}
            className="font-display text-[clamp(36px,7vw,62px)] font-semibold leading-[1.06] tracking-[-0.02em] text-white"
          />

          <Reveal
            as="p"
            delay={0.35}
            className="mx-auto mb-0 mt-7 max-w-[48ch] text-[16px] leading-[1.78] text-white/64 sm:text-[17px]"
          >
            Each procedure has a page of its own &mdash; what it involves, who
            it suits, and a consultation form for when you&rsquo;re ready.
          </Reveal>
        </div>

        <div className={`mx-auto mt-[52px] grid gap-7 sm:mt-[64px] ${cols} ${width}`}>
          {PAGES.map((page, i) => (
            <Reveal key={page.slug} delay={0.08 * i} className="h-full">
              <Card page={page} index={i} />
            </Reveal>
          ))}
        </div>

        <div className="mt-[68px] border-t border-white/12 pt-8 text-center sm:mt-[86px]">
          <p className="m-0 text-[13px] leading-[1.7] text-white/48">
            {SITE.doctor} &middot; {SITE.practice}
            <span className="mx-2 opacity-40">|</span>
            <a
              href={SITE.whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="text-champagne no-underline transition-colors duration-300 hover:text-white"
            >
              {SITE.contactDisplay}
            </a>
          </p>
        </div>
      </div>
    </main>
  );
}
