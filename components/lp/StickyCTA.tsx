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

/**
 * Mobile-only action bar. Ads traffic is overwhelmingly mobile, and the
 * form sits far down the page — this keeps call, WhatsApp and booking
 * one thumb-tap away for the whole scroll.
 *
 * Appears once the visitor starts moving. The threshold is deliberately
 * early: the hero photo pushes its own CTAs just below the fold on
 * phones, so this bar is what keeps a booking action reachable from the
 * moment scrolling begins.
 */
export function StickyCTA() {
  const { scrollY } = useScroll();
  const [shown, setShown] = useState(false);

  useMotionValueEvent(scrollY, "change", (y) => setShown(y > 340));

  return (
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
            href={SITE.contactHref}
            onClick={() => track("call_click", { label: "sticky_bar" })}
            aria-label={`Call ${SITE.doctorShort} on ${SITE.contactDisplay}`}
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
  );
}
