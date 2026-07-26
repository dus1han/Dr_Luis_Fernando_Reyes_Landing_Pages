/**
 * Conversion tracking layer.
 *
 * ── TO GO LIVE ──────────────────────────────────────────────────────
 * Fill in GTM_ID below (and/or GA4_ID + ADS_CONVERSION). Everything
 * else is already wired: every CTA on every page calls track() with a
 * stable event name, so once the IDs are present Google Ads conversions
 * can be configured entirely from the GTM UI without touching code.
 * Leave the IDs empty and nothing loads — zero requests, zero cost.
 * ────────────────────────────────────────────────────────────────────
 */
export const ANALYTICS = {
  /** e.g. "GTM-XXXXXXX" */
  GTM_ID: "",
  /** e.g. "G-XXXXXXXXXX" */
  GA4_ID: "",
  /** e.g. { id: "AW-123456789", label: "AbC-D_efGh" } */
  ADS_CONVERSION: { id: "", label: "" },
} as const;

export const analyticsEnabled = Boolean(
  ANALYTICS.GTM_ID || ANALYTICS.GA4_ID
);

/** Every conversion-relevant interaction on the page. */
export type TrackEvent =
  | "cta_click"
  | "call_click"
  | "whatsapp_click"
  | "form_start"
  | "form_submit"
  | "form_error"
  | "slider_interact"
  | "faq_open"
  | "scroll_depth";

type Payload = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

/**
 * Push an event. Safe to call before (or without) any tag manager —
 * dataLayer is just an array that GTM drains when it loads.
 */
export function track(event: TrackEvent, payload: Payload = {}) {
  if (typeof window === "undefined") return;

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event, ...payload });

  if (ANALYTICS.GA4_ID && typeof window.gtag === "function") {
    window.gtag("event", event, payload);
  }

  // A form submit is the primary Google Ads conversion for these pages.
  if (
    event === "form_submit" &&
    ANALYTICS.ADS_CONVERSION.id &&
    typeof window.gtag === "function"
  ) {
    window.gtag("event", "conversion", {
      send_to: `${ANALYTICS.ADS_CONVERSION.id}/${ANALYTICS.ADS_CONVERSION.label}`,
    });
  }
}
