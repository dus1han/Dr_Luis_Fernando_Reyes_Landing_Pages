/**
 * Conversion tracking layer.
 *
 * GTM is live and every CTA calls track() with a stable event name, so
 * Google Ads conversions are configured entirely from the GTM UI without
 * touching code. What remains is building the tags inside the container —
 * see docs/ads-readiness.md for the event contract they must match.
 *
 * GA4_ID and ADS_CONVERSION below stay empty on purpose: with GTM in place
 * both belong inside the container, where marketing can change them without
 * a deploy. Filling them here loads a second, competing tag stack.
 */
/**
 * The clinic's Google Tag Manager container, supplied by the marketing side.
 *
 * **A container ID is not a secret.** It ships in the page source of every
 * site that uses GTM, so there is nothing to protect by keeping it out of the
 * repository — and the reason it once lived only in a repository variable
 * turned out not to hold: `NEXT_PUBLIC_*` is compiled into the bundle, so
 * changing it needs a **rebuild** either way. The variable bought no
 * operational flexibility over a constant, and cost a manual step that, if
 * forgotten, fails invisibly — the build goes green, the page looks perfect,
 * and no conversion is ever recorded.
 *
 * `NEXT_PUBLIC_GTM_ID` still overrides this, so a fork or a second clinic can
 * point at its own container without editing code. Set it to `off` to disable
 * tracking entirely — an empty value falls back to the default, because "the
 * variable is unset" is far more often an oversight than an intention.
 */
const DEFAULT_GTM_ID = "GTM-NHBRF7G5";

const CONFIGURED_GTM_ID = process.env.NEXT_PUBLIC_GTM_ID?.trim() ?? "";

export const ANALYTICS = {
  /**
   * e.g. "GTM-XXXXXXX". Defaults to the clinic's container; override with the
   * `NEXT_PUBLIC_GTM_ID` repository variable, which is passed to the Docker
   * build as a build arg.
   *
   * Compiled in at build time, so **changing it needs a rebuild, not a
   * restart** — setting it in `.env` on the server does nothing.
   */
  GTM_ID: CONFIGURED_GTM_ID === "off" ? "" : CONFIGURED_GTM_ID || DEFAULT_GTM_ID,
  /**
   * e.g. "G-XXXXXXXXXX". Not wired to CI on purpose — with GTM in place, GA4
   * and Ads are better added as tags *inside* the GTM container, which the
   * marketing side can do without a deploy. Fill these in only if you decide
   * to skip GTM entirely, and remember they are literals: a change here needs
   * a commit.
   */
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

/* ────────────────────────────────────────────────────────────────────
 * The conversion contract
 *
 * The site announces "a lead was submitted". GTM decides who hears about
 * it. Nothing below names a tracking product, a slug or a domain, so it
 * copies between projects unchanged — and adding GA4, Meta Pixel or
 * TikTok later needs no code change and no deploy.
 * ──────────────────────────────────────────────────────────────────── */

/** The one event a conversion action should be built on. */
export const LEAD_EVENT = "generate_lead";

/**
 * Set on submit, read and cleared once on the thank-you page.
 *
 * `sessionStorage`, not the URL: a query parameter survives sharing and
 * bookmarking, so `?submitted=1` forwarded to a colleague reports a
 * conversion that never happened. Google's bidding optimises toward
 * whatever it is told, so a false positive actively spends the clinic's
 * budget in the wrong direction. Inflated counts are worse than none.
 */
export const LEAD_FLAG = "reyes:lead-submitted";

/** Where the click ID is parked between landing and submitting. */
export const CLICK_ID_KEY = "reyes:click-id";

/**
 * `gclid` is the classic Google Ads click ID. `wbraid` and `gbraid` are
 * what Google substitutes on iOS when ATT prevents the usual join —
 * miss them and a large share of mobile traffic arrives unattributable.
 */
export const CLICK_ID_PARAMS = ["gclid", "wbraid", "gbraid"] as const;
export type ClickIdParam = (typeof CLICK_ID_PARAMS)[number];

/** 90 days — the longest Google Ads click-through conversion window. */
export const CLICK_ID_TTL_MS = 90 * 24 * 60 * 60 * 1000;

export type StoredClickId = {
  param: ClickIdParam;
  value: string;
  /** Epoch ms. Past this the record is treated as absent. */
  expires: number;
};

/**
 * Push a raw object onto the dataLayer.
 *
 * Separate from `track()` below because a conversion is not an
 * interaction: it carries its own field names, which are the contract
 * GTM tags are built against, and it must not pick up that helper's
 * GA4/Ads side effects.
 */
export function pushDataLayer(payload: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(payload);
}

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
