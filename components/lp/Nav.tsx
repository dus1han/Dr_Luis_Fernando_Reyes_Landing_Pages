"use client";

import Image from "next/image";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { track } from "@/lib/analytics";
import { IMAGES } from "@/lib/generated/images";
import { SITE } from "@/lib/site";
import { ButtonLink } from "./Button";

const logo = IMAGES["logo-ink.png"];

type NavLink = { label: string; href: string };

/**
 * `useLayoutEffect` warns when React renders on the server, and this file is
 * prerendered. The layout variant matters for the scroll lock — see the
 * comment on that effect — so it is selected per environment rather than
 * downgraded to `useEffect` everywhere.
 */
const useIsomorphicLayoutEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;

/** Below this the menu exists; at or above it the links sit inline. */
const DESKTOP_QUERY = "(min-width: 1024px)";

/**
 * Sticky nav that starts transparent over the hero and settles into a
 * frosted ivory bar once the user scrolls, so the hero image is never
 * cropped by a solid header on first paint.
 *
 * Below `lg` the links move into a full-screen panel. They used to be simply
 * `hidden`, which left phone visitors — the majority of ads traffic — with no
 * way to reach Results, Reviews or the FAQ from the top of the page.
 */
export function Nav({ links }: { links: NavLink[] }) {
  const { scrollY } = useScroll();
  const [solid, setSolid] = useState(false);
  const [open, setOpen] = useState(false);

  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();

  useMotionValueEvent(scrollY, "change", (y) => setSolid(y > 40));

  const close = useCallback(() => setOpen(false), []);

  /*
   * Scroll lock — deliberately a LAYOUT effect, not a passive one.
   *
   * Every link in the panel is a same-page anchor, so closing the menu and
   * navigating happen in one click: the handler sets state, and the browser
   * then performs the anchor jump. Passive effects run after paint, which is
   * *after* that jump — so the page would still be locked at the moment it
   * tried to scroll, and the visitor would tap "Results" and go nowhere.
   * A layout effect flushes synchronously while the click is still being
   * dispatched, releasing the lock in time.
   *
   * `overflow` on the body propagates to the viewport, which is what makes
   * this work at all — and also why the ordering matters so much.
   */
  useIsomorphicLayoutEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  /* Escape, focus trap, and focus returned to the trigger on close. */
  useEffect(() => {
    if (!open) return;

    const trigger = triggerRef.current;
    const focusable = () =>
      Array.from(
        panelRef.current?.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled])'
        ) ?? []
      );

    /*
     * The panel itself takes focus, not its first link.
     *
     * Focusing a link draws a focus ring on "The procedure" the instant the
     * menu opens, which reads as a selection nobody made. Focusing the dialog
     * is also what lets a screen reader announce the container and its label
     * before reading the options.
     */
    panelRef.current?.focus({ preventScroll: true });

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        close();
        return;
      }
      if (event.key !== "Tab") return;

      // Without this, Tab walks out of the panel and into the page behind it,
      // which is still rendered — a keyboard or screen-reader user then has no
      // idea where they are.
      const items = focusable();
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      } else if (event.shiftKey && document.activeElement === panelRef.current) {
        // Focus is on the dialog itself, which sits before every link in tab
        // order — shift-Tab from here would leave the panel entirely.
        event.preventDefault();
        last.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      // preventScroll: the panel closes as the page is smooth-scrolling to an
      // anchor, and focusing the trigger would otherwise yank it back to the top.
      trigger?.focus({ preventScroll: true });
    };
  }, [open, close]);

  /*
   * Close on any hash change, not only on our own click handler.
   *
   * The click handler is what makes selecting an option close the menu. This
   * is the backstop for every other route to the same place — the back and
   * forward buttons most of all, which change the hash without any click at
   * all and would otherwise leave the panel sitting over the section the
   * visitor just navigated to.
   */
  useEffect(() => {
    if (!open) return;
    window.addEventListener("hashchange", close);
    return () => window.removeEventListener("hashchange", close);
  }, [open, close]);

  /*
   * Close when the viewport grows past the breakpoint. The trigger is
   * `lg:hidden`, so a phone rotated into a wide landscape would hide the only
   * control that can dismiss the panel — leaving it stuck over the page with
   * the scroll still locked.
   */
  useEffect(() => {
    if (!open) return;
    const mq = window.matchMedia(DESKTOP_QUERY);
    const onChange = () => mq.matches && close();
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [open, close]);

  return (
    <>
      <motion.header
        initial={{ y: -24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        /*
         * Raised above the panel while it is open so one button both opens and
         * closes the menu — two separate controls would mean two `aria-expanded`
         * states to keep honest, and a close button that appears somewhere the
         * thumb was not already resting.
         */
        className={`sticky top-0 transition-[background-color,border-color,backdrop-filter] duration-400 ${
          open
            ? "z-80 border-transparent bg-transparent"
            : solid
              ? "z-60 border-b border-ink/12 bg-ivory/92 backdrop-blur-[12px]"
              : "z-60 border-b border-transparent bg-transparent"
        }`}
      >
        <div className="shell flex h-(--nav-h) items-center justify-between gap-6">
          {/* The supplied logo is white-on-transparent, so the nav uses the
              ink recolour generated by scripts/prepare-images.mjs. The
              footer, being dark, keeps the original white version. */}
          <a
            href="#top"
            onClick={close}
            className="flex items-center no-underline"
            aria-label={`${SITE.doctor} — home`}
          >
            <Image
              src={logo.src}
              alt={`${SITE.doctor}, Cirujano Plástico`}
              width={logo.width}
              height={logo.height}
              priority
              /* The panel behind it is espresso, so the ink logo would
                 disappear into it. Inverted only while open. */
              className={`h-auto w-[124px] transition-[filter] duration-300 sm:w-[142px] lg:w-[152px] ${
                open ? "brightness-0 invert" : ""
              }`}
            />
          </a>

          <nav className="hidden items-center gap-8 lg:flex">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="group relative text-[14px] font-medium text-body no-underline transition-colors duration-250 hover:text-gold"
              >
                {l.label}
                <span className="absolute -bottom-1 left-0 h-px w-full origin-left scale-x-0 bg-gold transition-transform duration-350 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-x-100" />
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            {/* The number in the nav opens WhatsApp, not a dialler — that is
                the channel the clinic wants these going to. External, so it
                needs rel="noopener noreferrer" with the target; the audit
                flags a bare target="_blank". */}
            <a
              href={SITE.whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => track("whatsapp_click", { label: "nav" })}
              className={`hidden text-[14px] font-medium no-underline transition-colors hover:text-gold md:inline lg:hidden xl:inline ${
                open ? "text-champagne" : "text-body"
              }`}
            >
              {SITE.contactDisplay}
            </a>
            {/* Hidden on the smallest screens — the sticky bottom bar owns
                the CTA there and two competing buttons hurt conversion.
                The visibility class sits on a wrapper because the button's
                own `inline-flex` would otherwise beat `hidden`: both are
                display utilities of equal specificity, so source order in
                the stylesheet decides, not the order in the attribute. */}
            <div className="hidden sm:block">
              <ButtonLink href="#book" size="sm" event="cta_click" eventLabel="nav">
                Book a consultation
              </ButtonLink>
            </div>

            <MenuTrigger
              ref={triggerRef}
              open={open}
              panelId={panelId}
              onClick={() => setOpen((v) => !v)}
            />
          </div>
        </div>
      </motion.header>

      {/*
        A sibling of the header, not a child — and that is load-bearing.
        The header is `sticky` with a z-index, so it forms a stacking context;
        a `fixed` panel inside it could never paint above the sticky CTA bar
        (z-70), which would then float over the menu. Out here the two are
        ordinary siblings and z-index means what it says.
      */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.26, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-75 lg:hidden"
          >
            {/* Backdrop. A button rather than a div so the dismiss is real for
                keyboard and assistive tech, not a click handler on nothing. */}
            <button
              type="button"
              aria-label="Close menu"
              tabIndex={-1}
              onClick={close}
              /* Blurred hard rather than merely darkened: at 3px the hero
                 portrait behind it stayed legible enough to read as a ghost of
                 a face rather than as frosted glass. */
              className="absolute inset-0 h-full w-full cursor-default bg-espresso-deep/97 backdrop-blur-[14px]"
            />

            <div
              ref={panelRef}
              id={panelId}
              role="dialog"
              aria-modal="true"
              aria-label="Menu"
              /* Focusable only programmatically — without this the panel
                 cannot take focus on open at all, and `.focus()` is a no-op. */
              tabIndex={-1}
              /* overscroll-contain stops a swipe that runs past the end of the
                 panel from scrolling the page behind it on iOS. */
              className="relative flex h-full flex-col overflow-y-auto overscroll-contain pb-[calc(28px+env(safe-area-inset-bottom))] pt-(--nav-h)"
            >
              <nav className="shell flex flex-1 flex-col justify-center gap-1 py-8">
                {links.map((l, i) => (
                  <motion.a
                    key={l.href}
                    href={l.href}
                    /* The fix that was asked for: selecting an option closes
                       the menu. Same-page anchors fire no route change, so
                       nothing else would ever dismiss it. */
                    onClick={close}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.42,
                      delay: 0.06 + i * 0.055,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    className="group flex items-baseline gap-4 border-b border-champagne/12 py-4 font-display text-[27px] leading-[1.2] text-ivory no-underline transition-colors duration-250 hover:text-champagne sm:text-[31px]"
                  >
                    <span className="font-sans text-[11px] font-semibold tabular-nums tracking-[0.16em] text-gold/70">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    {l.label}
                  </motion.a>
                ))}
              </nav>

              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.42,
                  delay: 0.06 + links.length * 0.055,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="shell flex flex-col gap-3"
              >
                <ButtonLink
                  href="#book"
                  size="block"
                  event="cta_click"
                  eventLabel="mobile_menu"
                  onClick={close}
                >
                  Book a consultation
                </ButtonLink>

                <a
                  href={SITE.whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => {
                    track("whatsapp_click", { label: "mobile_menu" });
                    close();
                  }}
                  className="grid min-h-12 place-items-center rounded-[2px] border border-champagne/30 text-[14px] font-medium text-champagne no-underline"
                >
                  WhatsApp {SITE.contactDisplay}
                </a>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/**
 * The one control that opens and closes the menu.
 *
 * Two bars that cross into an X. `translate` and `rotate` are animated as
 * separate properties rather than through `transform`, because Tailwind v4
 * compiles `-translate-y-*` and `rotate-*` to the standalone CSS properties —
 * a `transition-[transform]` here animates nothing and the bars snap.
 */
const MenuTrigger = ({
  ref,
  open,
  panelId,
  onClick,
}: {
  ref: React.Ref<HTMLButtonElement>;
  open: boolean;
  panelId: string;
  onClick: () => void;
}) => (
  <button
    ref={ref}
    type="button"
    onClick={onClick}
    aria-expanded={open}
    aria-controls={panelId}
    aria-label={open ? "Close menu" : "Open menu"}
    /* 44px square: the minimum comfortable touch target, and the reason the
       bars are drawn inside a fixed box rather than sized to the icon. */
    className="relative grid h-11 w-11 place-items-center lg:hidden"
  >
    {/*
      No `w-full` in the shared part. Width lives entirely in the two branches
      because `w-full` and `w-[16px]` are both width utilities of equal
      specificity — stylesheet source order decides between them, not the order
      they appear in the attribute, and `w-full` wins. That silently made the
      lower bar full width: measured at 23px when it should have been 16px.
      Same trap as `hidden` vs `inline-flex` on the CTA wrapper above.
    */}
    <span className="relative block h-[13px] w-[23px]">
      <span
        className={`absolute left-0 block h-[1.5px] w-full rounded-full transition-[translate,rotate,background-color] duration-350 ease-out-soft ${
          open ? "top-1/2 translate-y-[-0.75px] rotate-45 bg-ivory" : "top-0 bg-ink"
        }`}
      />
      <span
        className={`absolute left-0 block h-[1.5px] rounded-full transition-[translate,rotate,width,background-color] duration-350 ease-out-soft ${
          open
            ? "top-1/2 w-full translate-y-[-0.75px] -rotate-45 bg-ivory"
            : "bottom-0 w-[16px] bg-ink"
        }`}
      />
    </span>
  </button>
);
