"use client";

import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { useState } from "react";
import { SITE } from "@/lib/site";
import { track } from "@/lib/analytics";

const PhoneIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden>
    <path
      d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1A17 17 0 0 1 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.2.2 2.4.6 3.6.1.3 0 .7-.2 1l-2.3 2.2Z"
      fill="currentColor"
    />
  </svg>
);

const WhatsAppIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
    <path
      d="M12.04 2C6.6 2 2.2 6.4 2.2 11.84c0 1.74.46 3.44 1.32 4.94L2.1 22l5.35-1.4a9.8 9.8 0 0 0 4.59 1.17h.01c5.43 0 9.84-4.4 9.84-9.84 0-2.63-1.02-5.1-2.88-6.96A9.77 9.77 0 0 0 12.04 2Zm5.75 14.06c-.24.68-1.42 1.3-1.95 1.35-.5.05-1.13.07-1.82-.11a16.6 16.6 0 0 1-1.65-.61c-2.9-1.25-4.8-4.17-4.94-4.36-.15-.19-1.19-1.58-1.19-3.01 0-1.44.75-2.14 1.02-2.43.27-.29.58-.36.78-.36.19 0 .39 0 .56.01.18.01.42-.07.66.5.24.58.82 2.02.9 2.16.07.15.12.32.02.51-.1.19-.15.31-.29.48-.15.16-.31.37-.44.5-.15.14-.3.3-.13.59.17.29.76 1.25 1.63 2.02 1.12.99 2.06 1.3 2.35 1.45.29.14.46.12.63-.07.17-.2.73-.85.92-1.14.19-.29.39-.24.65-.15.27.1 1.7.8 1.99.95.29.14.48.22.55.34.07.12.07.7-.17 1.38Z"
      fill="currentColor"
    />
  </svg>
);

const CalendarIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden>
    <rect x="3.2" y="5" width="17.6" height="16" rx="2" stroke="currentColor" strokeWidth="1.7" />
    <path d="M3.2 9.6h17.6M8 3v4M16 3v4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
  </svg>
);

/**
 * The three persistent actions, in one place so the phone bar and the
 * desktop rail can never drift apart — same targets, same tracking
 * labels, one edit if a number or an event name changes.
 *
 * `label` is the rail's caption. The phone bar shows it only on the book
 * button; its other two are icon-only by necessity at 390px.
 */
const ACTIONS = [
  {
    key: "call",
    label: "Call now",
    href: SITE.phoneHref,
    icon: PhoneIcon,
    event: "call_click",
    aria: `Call ${SITE.doctorShort} on ${SITE.phoneDisplay}`,
    external: false,
  },
  {
    key: "whatsapp",
    label: "WhatsApp",
    href: SITE.whatsappHref,
    icon: WhatsAppIcon,
    event: "whatsapp_click",
    aria: "Message the clinic on WhatsApp",
    external: true,
  },
  {
    key: "book",
    label: "Book now",
    href: "#book",
    icon: CalendarIcon,
    event: "cta_click",
    aria: "Book a consultation",
    external: false,
  },
] as const;

/**
 * Persistent action affordances, in two shapes.
 *
 *   • below `sm` — a bottom bar. Ads traffic is overwhelmingly mobile and
 *     the form sits far down the page, so call, WhatsApp and booking stay
 *     one thumb-tap away for the whole scroll.
 *   • from `sm` — a rail pinned to the right edge, vertically centred.
 *     Same three actions, stacked, each an icon over its caption.
 *
 * Both appear once the visitor starts moving. The threshold is
 * deliberately early: the hero photo pushes its own CTAs just below the
 * fold on phones, so this is what keeps a booking action reachable from
 * the moment scrolling begins.
 *
 * They are separate elements rather than one restyled block because they
 * animate from different edges — the bar rises, the rail slides in from
 * the right — and a single element cannot do both. `ACTIONS` is what keeps
 * them honest.
 */
export function StickyCTA() {
  const { scrollY } = useScroll();
  const [shown, setShown] = useState(false);

  useMotionValueEvent(scrollY, "change", (y) => setShown(y > 340));

  return (
    <>
      <DesktopRail shown={shown} />
      <AnimatePresence>
        {shown && (
          <motion.div
          initial={{ y: "110%" }}
          animate={{ y: 0 }}
          exit={{ y: "110%" }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-x-0 bottom-0 z-70 grid grid-cols-[auto_auto_1fr] items-stretch gap-2 border-t border-champagne/16 bg-espresso/97 px-3 pb-[calc(10px+env(safe-area-inset-bottom))] pt-2.5 backdrop-blur-[8px] sm:hidden"
        >
          <a
            href={SITE.phoneHref}
            onClick={() => track("call_click", { label: "sticky_bar" })}
            aria-label={`Call ${SITE.doctorShort} on ${SITE.phoneDisplay}`}
            className="grid min-h-12 w-12 place-items-center rounded-[2px] border border-champagne/30 text-champagne"
          >
            <PhoneIcon />
          </a>
          <a
            href={SITE.whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => track("whatsapp_click", { label: "sticky_bar" })}
            aria-label="Message the clinic on WhatsApp"
            className="grid min-h-12 w-12 place-items-center rounded-[2px] border border-champagne/30 text-champagne"
          >
            <WhatsAppIcon />
          </a>
          <a
            href="#book"
            onClick={() => track("cta_click", { label: "sticky_bar" })}
            className="grid min-h-12 place-items-center rounded-[2px] bg-gold px-4 text-[13px] font-semibold uppercase tracking-[0.09em] text-white no-underline"
          >
            Book a consultation
          </a>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/**
 * The desktop rail: three tiles pinned to the right edge, vertically
 * centred, each an icon over a small caption.
 *
 * `top-1/2 -translate-y-1/2` rather than a fixed offset, so it stays
 * centred at any viewport height — at 1440x720 a top-anchored rail would
 * sit level with the nav and read as part of it.
 *
 * Rounded on the left only. It is attached to the edge of the window, not
 * floating in front of it, and rounding the right corners would put a
 * sliver of page between the tile and the edge.
 *
 * ── WHY 1380px AND NOT `sm` ─────────────────────────────────────────────
 * This rail overlays the page, so it may only appear where it covers
 * nothing. `--shell` is `min(1220px, 90vw)`, so the free margin either
 * side is:
 *
 *   below 1356px   0.05 × viewport   — 68px at the very top of that range
 *   above 1356px   (viewport − 1220) / 2
 *
 * The rail is 78px wide, so the margin only clears it from
 * (78 × 2) + 1220 = 1376px. Rounded to 1380. Below that it would sit on
 * top of the right-hand edge of every section — a card, a form field, the
 * end of a line of body copy — and covering content is worse than not
 * having the affordance.
 *
 * That leaves 640–1380 with no persistent CTA, which is exactly where it
 * was before this existed: the bottom bar is `sm:hidden`. No regression,
 * just no gain in that band. Widening the bottom bar to cover it is a
 * bigger change than it looks — it is laid out for a 390px thumb.
 * ────────────────────────────────────────────────────────────────────────
 *
 * The tracking label is `desktop_rail`, separate from the bar's
 * `sticky_bar`, so the two surfaces stay distinguishable in GTM. Same
 * actions, different placement — averaging them would hide which one works.
 */
function DesktopRail({ shown }: { shown: boolean }) {
  return (
    <AnimatePresence>
      {shown && (
        <motion.nav
          aria-label="Contact the clinic"
          initial={{ x: "110%", opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: "110%", opacity: 0 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="fixed right-0 top-1/2 z-70 hidden -translate-y-1/2 flex-col overflow-hidden rounded-l-[3px] bg-espresso/97 shadow-[0_18px_44px_-20px_rgb(35_27_22/0.55)] backdrop-blur-[8px] min-[1380px]:flex"
        >
          {ACTIONS.map(({ key, label, href, icon: Icon, event, aria, external }) => (
            <a
              key={key}
              href={href}
              aria-label={aria}
              {...(external
                ? { target: "_blank", rel: "noopener noreferrer" }
                : {})}
              onClick={() => track(event, { label: "desktop_rail" })}
              /* 78px fixed, so the three tiles are identical whatever
                 their caption length — and it is the number the 1380px
                 breakpoint above is derived from, so the two move
                 together. `nowrap` because "Call now" and "Book now" both
                 wrap at 74px, which turns a 3-tile rail into a ragged
                 5-line one. */
              className="group flex w-[78px] flex-col items-center gap-1.5 whitespace-nowrap border-b border-champagne/14 px-1.5 py-3.5 text-champagne no-underline transition-colors duration-300 last:border-b-0 hover:bg-gold hover:text-white"
            >
              <Icon />
              <span className="text-[10px] font-semibold uppercase leading-none tracking-[0.06em]">
                {label}
              </span>
            </a>
          ))}
        </motion.nav>
      )}
    </AnimatePresence>
  );
}
