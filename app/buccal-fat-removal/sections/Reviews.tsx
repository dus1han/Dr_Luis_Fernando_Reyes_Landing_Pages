"use client";

import { Eyebrow } from "@/components/lp/Eyebrow";
import { MaskedHeading } from "@/components/lp/MaskedHeading";
import { Reveal, RevealGroup, RevealItem } from "@/components/lp/Reveal";
import { Section, SectionHead } from "@/components/lp/Section";
import { SHOW_PLACEHOLDER_REVIEWS } from "@/lib/site";
import { REVIEWS, type ReviewItem } from "../content";

/**
 * Placeholder reviews are written for layout, not supplied by patients.
 * SHOW_PLACEHOLDER_REVIEWS in lib/site.ts decides whether they render;
 * with it off they are dropped from the build entirely rather than
 * hidden with CSS, so they never reach the shipped HTML where crawlers
 * and screen readers would still find them.
 */
const SHOWN: ReviewItem[] = SHOW_PLACEHOLDER_REVIEWS
  ? REVIEWS.items
  : REVIEWS.items.filter((r) => !r.placeholder);

/** Past this, a static grid gets unwieldy and the row starts scrolling. */
const MARQUEE_FROM = 4;
const SCROLLS = SHOWN.length >= MARQUEE_FROM;

/** Columns for the static case, so a short list never orphans a gap. */
const COLUMNS: Record<number, string> = {
  1: "max-w-[560px] mx-auto",
  2: "sm:grid-cols-2 max-w-[820px] mx-auto",
  3: "sm:grid-cols-2 lg:grid-cols-3",
};

if (
  process.env.NODE_ENV !== "production" &&
  SHOW_PLACEHOLDER_REVIEWS &&
  REVIEWS.items.some((r) => r.placeholder)
) {
  const n = REVIEWS.items.filter((r) => r.placeholder).length;
  console.warn(
    `[reviews] ${n} placeholder review(s) are rendering. Set SHOW_PLACEHOLDER_REVIEWS=false in lib/site.ts before paid traffic.`
  );
}

function Stars() {
  return (
    <div className="mb-4 flex gap-1" aria-label="Rated 5 out of 5">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} width="15" height="15" viewBox="0 0 20 20" aria-hidden>
          <path
            d="M10 1.6l2.5 5.2 5.7.8-4.1 4 1 5.7L10 14.6l-5.1 2.7 1-5.7-4.1-4 5.7-.8L10 1.6Z"
            fill="var(--color-gold)"
          />
        </svg>
      ))}
    </div>
  );
}

function Card({ review }: { review: ReviewItem }) {
  return (
    <figure className="relative m-0 flex h-full flex-col rounded-[3px] border border-ink/12 bg-ivory p-7">
      <span
        aria-hidden
        className="absolute right-6 top-4 font-display text-[56px] leading-none text-gold/16"
      >
        &rdquo;
      </span>
      <Stars />
      <blockquote className="m-0 flex-1">
        <p className="m-0 text-[16px] leading-[1.75] text-body">{review.quote}</p>
      </blockquote>
      <figcaption className="mt-6 border-t border-ink/12 pt-4">
        <span className="block font-display text-[17px] font-semibold text-ink">
          {review.name}
        </span>
        <span className="mt-0.5 block text-[12px] font-medium uppercase tracking-[0.14em] text-muted">
          {review.meta}
        </span>
      </figcaption>
    </figure>
  );
}

/**
 * Continuous auto-scrolling row.
 *
 * The list is rendered twice and translated -50%, so the second copy is
 * exactly where the first started when the cycle restarts — that's what
 * makes the loop seamless. The duplicate is aria-hidden so screen
 * readers don't read every review twice.
 *
 * Pauses on hover and on keyboard focus. Under reduced motion the
 * animation is dropped and the row becomes a normal horizontal scroller,
 * so the content stays reachable either way.
 */
function Marquee({ items }: { items: ReviewItem[] }) {
  const duration = items.length * 9;

  return (
    <div
      className="group relative overflow-hidden motion-reduce:overflow-x-auto"
      style={{
        // Fades the cards out at both edges instead of hard-cutting them.
        maskImage:
          "linear-gradient(90deg, transparent, #000 6%, #000 94%, transparent)",
        WebkitMaskImage:
          "linear-gradient(90deg, transparent, #000 6%, #000 94%, transparent)",
      }}
    >
      <div
        className="animate-marquee flex w-max gap-5 group-focus-within:[animation-play-state:paused] group-hover:[animation-play-state:paused] motion-reduce:animate-none"
        style={{ ["--marquee-duration" as string]: `${duration}s` }}
      >
        {[0, 1].map((copy) => (
          <div key={copy} className="flex gap-5" aria-hidden={copy === 1}>
            {items.map((r, i) => (
              <div key={i} className="w-[330px] flex-none sm:w-[370px]">
                <Card review={r} />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function Reviews() {
  if (!SHOWN.length) return null;

  return (
    <Section id="reviews" tone="sand" padding="tight">
      <div className="shell">
        <SectionHead>
          <Eyebrow center>{REVIEWS.eyebrow}</Eyebrow>
          <MaskedHeading
            lines={[
              REVIEWS.headline[0],
              <em key="a" className="accent">
                {REVIEWS.headline[1]}
              </em>,
            ]}
            className="font-display text-[clamp(32px,4.4vw,46px)] font-semibold leading-[1.12] tracking-[-0.01em] text-ink"
          />
        </SectionHead>
      </div>

      {/* Full-bleed, not inside .shell — the row has to run past the
          content column for the edge fade to read as "more this way". */}
      {SCROLLS ? (
        <Reveal>
          <Marquee items={SHOWN} />
        </Reveal>
      ) : (
        <div className="shell">
          <RevealGroup
            step={0.1}
            className={`grid gap-5 ${COLUMNS[Math.min(SHOWN.length, 3)] ?? COLUMNS[3]}`}
          >
            {SHOWN.map((r, i) => (
              <RevealItem key={i} className="h-full">
                <Card review={r} />
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      )}
    </Section>
  );
}
