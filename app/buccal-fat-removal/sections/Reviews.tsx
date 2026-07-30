"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
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
const CAROUSEL_FROM = 4;
const SCROLLS = SHOWN.length >= CAROUSEL_FROM;

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

/** Six lines at 16px/1.75 — every card is held to this, so the row reads as a set. */
const CLAMP_LINES = 6;
const CLAMP_HEIGHT = 16 * 1.75 * CLAMP_LINES;

const CARD_GAP = 20; // gap-5

function Card({
  review,
  onExpand,
}: {
  review: ReviewItem;
  onExpand: (r: ReviewItem) => void;
}) {
  const quoteRef = useRef<HTMLParagraphElement>(null);
  const [truncated, setTruncated] = useState(false);

  /*
   * Whether this quote is actually longer than the clamp, measured rather
   * than guessed from a character count — the same string wraps to a
   * different number of lines at 330px and 370px, so a count would show
   * "Read more" on a card with nothing hidden behind it.
   */
  useEffect(() => {
    const el = quoteRef.current;
    if (!el) return;
    const measure = () => setTruncated(el.scrollHeight > el.clientHeight + 1);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Hover lifts the card, warms its border to gold and deepens the shadow —
  // the same vocabulary the index cards and the benefits grid already use, so
  // the page has one idea of what "this is interactive" looks like.
  //
  // No `motion-reduce` variant needed: globals.css drops every transition to
  // 0.001ms under `prefers-reduced-motion`, so these snap instead of moving.
  return (
    <figure className="group relative m-0 flex h-full flex-col rounded-[3px] border border-ink/12 bg-ivory p-7 transition-[translate,border-color,box-shadow] duration-500 ease-out-soft hover:-translate-y-1.5 hover:border-gold/40 hover:shadow-[0_26px_50px_-30px_rgb(35_27_22/0.45)]">
      {/* The one flourish that belongs only to this card: the quotation mark
          warms and grows a little, anchored to its own corner so it opens
          outward rather than drifting across the text. */}
      <span
        aria-hidden
        className="absolute right-6 top-4 origin-top-right font-display text-[56px] leading-none text-gold/16 transition-[color,scale] duration-500 ease-out-soft group-hover:scale-110 group-hover:text-gold/32"
      >
        &rdquo;
      </span>
      <Stars />

      <blockquote className="m-0 flex-1">
        <p
          ref={quoteRef}
          className="m-0 overflow-hidden text-[16px] leading-[1.75] text-body"
          style={{
            display: "-webkit-box",
            WebkitBoxOrient: "vertical",
            WebkitLineClamp: CLAMP_LINES,
            minHeight: CLAMP_HEIGHT,
          }}
        >
          {review.quote}
        </p>

        {/*
          Opens a dialog rather than expanding in place. Expanding changed
          the card's height, which is the one thing this layout cannot
          afford: the cards are a set, and one growing to twice the height
          of its neighbours is what the equal-height clamp exists to stop.
        */}
        {truncated && (
          <button
            type="button"
            onClick={() => onExpand(review)}
            className="mt-2 cursor-pointer border-0 bg-transparent p-0 text-[13px] font-semibold text-gold underline underline-offset-2 transition-colors duration-300 hover:text-ink"
          >
            Read more
            <span className="sr-only"> from {review.name}</span>
          </button>
        )}
      </blockquote>

      {/* Name only. `review.meta` still holds the procedure each review is
          actually about, but it is no longer displayed — see the note on the
          field in content.ts. */}
      <figcaption className="mt-6 border-t border-ink/12 pt-4">
        <span className="block font-display text-[17px] font-semibold text-ink">
          {review.name}
        </span>
      </figcaption>
    </figure>
  );
}

/**
 * The full quote, in a native <dialog>.
 *
 * `showModal()` is doing real work here: focus is trapped inside, Esc
 * closes, the rest of the page goes inert, and the backdrop is a styleable
 * pseudo-element. Hand-rolling those is where accessible modals usually go
 * wrong, and none of it is code we have to own.
 */
function QuoteModal({
  review,
  onClose,
}: {
  review: ReviewItem;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (!dialog.open) dialog.showModal();

    /*
     * `showModal` makes the background inert but does NOT stop it
     * scrolling — a wheel or a swipe still moves the page behind the
     * dialog, which on a carousel reads as the content running away.
     */
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      // Clicking the backdrop lands on the dialog element itself, because
      // the padding-free dialog is exactly its content box.
      onClick={(e) => {
        if (e.target === ref.current) ref.current?.close();
      }}
      aria-labelledby={titleId}
      className="m-auto w-[min(92vw,600px)] rounded-[3px] border border-ink/12 bg-ivory p-0 text-body backdrop:bg-ink/55 backdrop:backdrop-blur-[2px]"
    >
      <div className="p-7 sm:p-9">
        <Stars />

        <blockquote className="m-0">
          <p className="m-0 max-h-[52vh] overflow-y-auto text-[16.5px] leading-[1.8] text-body">
            {review.quote}
          </p>
        </blockquote>

        <div className="mt-7 border-t border-ink/12 pt-4">
          <span
            id={titleId}
            className="block font-display text-[18px] font-semibold text-ink"
          >
            {review.name}
          </span>
        </div>

        <button
          type="button"
          onClick={() => ref.current?.close()}
          className="mt-7 inline-flex min-h-11 w-full cursor-pointer items-center justify-center rounded-[2px] border-0 bg-gold px-6 text-[12.5px] font-semibold uppercase tracking-[0.1em] text-white transition-colors duration-300 hover:bg-ink sm:w-auto"
        >
          Close
        </button>
      </div>
    </dialog>
  );
}

function Arrow({ dir }: { dir: "prev" | "next" }) {
  return (
    <svg width="17" height="12" viewBox="0 0 18 12" fill="none" aria-hidden>
      <path
        d={dir === "next" ? "M0 6h16M12.5 1 17 6l-4.5 5" : "M17 6H1M5.5 1 1 6l4.5 5"}
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * A carousel the visitor drives, not one that drives itself.
 *
 * This replaced a continuous auto-scrolling marquee. **The autoplay is what
 * had to go**: anything that moves on its own turns every control inside it
 * into a moving target, and the "Read more" button was effectively
 * unclickable. Pausing on hover only ever helped a mouse — on a phone there
 * is no hover, so the button could not reliably be tapped at all.
 *
 * Native scrolling with `scroll-snap` rather than a transform: swipe,
 * trackpad, shift-wheel and keyboard all work for free, and the arrows are
 * just `scrollBy`. Nothing here re-implements a scrollbar.
 */
function Carousel({
  items,
  onExpand,
}: {
  items: ReviewItem[];
  onExpand: (r: ReviewItem) => void;
}) {
  const scroller = useRef<HTMLDivElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const sync = useCallback(() => {
    const el = scroller.current;
    if (!el) return;
    setAtStart(el.scrollLeft <= 1);
    // -1 for sub-pixel widths, which otherwise leave "next" enabled at the
    // end and make the control look broken.
    setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 1);
  }, []);

  useEffect(() => {
    sync();
    const el = scroller.current;
    if (!el) return;
    const ro = new ResizeObserver(sync);
    ro.observe(el);
    return () => ro.disconnect();
  }, [sync]);

  const step = (direction: 1 | -1) => {
    const el = scroller.current;
    if (!el) return;
    // One card, measured — the width changes at `sm` and hardcoding it here
    // would silently desync from the class that sets it.
    const card = el.querySelector<HTMLElement>("[data-review-card]");
    const by = (card?.offsetWidth ?? 340) + CARD_GAP;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollBy({ left: by * direction, behavior: reduced ? "auto" : "smooth" });
  };

  const arrowClass =
    "grid h-11 w-11 place-items-center rounded-full border border-ink/18 bg-ivory text-ink transition-[color,border-color,opacity] duration-300 hover:border-gold hover:text-gold disabled:cursor-default disabled:opacity-35 disabled:hover:border-ink/18 disabled:hover:text-ink";

  return (
    <div>
      <div
        ref={scroller}
        onScroll={sync}
        /* Focusable and labelled: a scrollable region that keyboard users
           cannot reach is a scrollable region they cannot read. */
        tabIndex={0}
        role="group"
        aria-label="Patient reviews"
        /* pt-2 / pb-4 is headroom for the hover lift and its shadow. Setting
           overflow-x also makes overflow-y computed `auto`, so without the
           padding a lifted card is clipped at the top and the deepened shadow
           can trip a vertical scrollbar. */
        className="flex snap-x snap-mandatory gap-5 overflow-x-auto pb-4 pt-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {items.map((r, i) => (
          <div
            key={i}
            data-review-card
            className="w-[330px] flex-none snap-start sm:w-[370px]"
          >
            <Card review={r} onExpand={onExpand} />
          </div>
        ))}
      </div>

      <div className="mt-7 flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => step(-1)}
          disabled={atStart}
          aria-label="Previous reviews"
          className={arrowClass}
        >
          <Arrow dir="prev" />
        </button>
        <button
          type="button"
          onClick={() => step(1)}
          disabled={atEnd}
          aria-label="More reviews"
          className={arrowClass}
        >
          <Arrow dir="next" />
        </button>
      </div>
    </div>
  );
}

export function Reviews() {
  const [expanded, setExpanded] = useState<ReviewItem | null>(null);

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

        {SCROLLS ? (
          <Reveal>
            <Carousel items={SHOWN} onExpand={setExpanded} />
          </Reveal>
        ) : (
          <RevealGroup
            step={0.1}
            className={`grid gap-5 ${COLUMNS[Math.min(SHOWN.length, 3)] ?? COLUMNS[3]}`}
          >
            {SHOWN.map((r, i) => (
              <RevealItem key={i} className="h-full">
                <Card review={r} onExpand={setExpanded} />
              </RevealItem>
            ))}
          </RevealGroup>
        )}
      </div>

      {/* Mounted only while open, so mount/unmount drives showModal/close and
          there is no second source of truth for whether the dialog is up. */}
      {expanded && (
        <QuoteModal review={expanded} onClose={() => setExpanded(null)} />
      )}
    </Section>
  );
}
