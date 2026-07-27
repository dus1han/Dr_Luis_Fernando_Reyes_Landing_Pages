import type { IMAGES } from "@/lib/generated/images";

/**
 * Every landing page on this subdomain, in the order the index lists them.
 *
 * This is the single source of truth. The root index reads it, and so does
 * anything else that needs to know what exists — so adding page 2, 3 or 4
 * is one entry here plus the route itself, with nothing else to remember
 * to update.
 *
 * Ads campaigns point at `/<slug>` directly; this list is for humans
 * (the clinic, whoever picks the work up next) who need to find them.
 */
export type LandingPage = {
  slug: string;
  /** Small caps label above the title — the category, not the procedure. */
  eyebrow: string;
  /** Shown on the card. Keep it to the procedure name. */
  title: string;
  /** One sentence. What the visitor gets, not what the surgery is. */
  blurb: string;
  /** Key into the generated image manifest — the card's thumbnail. */
  image: keyof typeof IMAGES;
  /**
   * `live` renders a link. `planned` renders a muted, unclickable card so
   * the roadmap is visible without shipping a dead link — use it only when
   * the page is genuinely committed, not as a wishlist.
   */
  status: "live" | "planned";
};

export const PAGES: LandingPage[] = [
  {
    slug: "buccal-fat-removal",
    eyebrow: "Facial contouring",
    title: "Buccal Fat Removal",
    blurb:
      "Sharper cheekbones and a defined jawline, through an incision inside the mouth so nothing shows on the face.",
    image: "hero-bg.jpg",
    status: "live",
  },

  /* ── PAGES 2–4 ──────────────────────────────────────────────────────
   * Add them here as they're built. The index picks them up with no
   * other change. Copy the shape above:
   *
   *   { slug: "…", eyebrow: "…", title: "…", blurb: "…",
   *     image: "…", status: "live" }
   *
   * `image` must be a key that already exists in the generated manifest
   * (`lib/generated/images.ts`) — run `npm run images` after dropping the
   * source file into the page's Images folder, or TypeScript will reject
   * the entry at build time rather than shipping a broken thumbnail.
   * ─────────────────────────────────────────────────────────────────── */
];

export const LIVE_PAGES = PAGES.filter((p) => p.status === "live");
