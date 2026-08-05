import { BBL, BUCCAL, type ImageAsset } from "@/lib/generated/images";

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
  /**
   * The card's thumbnail, taken straight from the generated manifest.
   *
   * The asset itself rather than a key into it: every page has its own
   * manifest now (`BUCCAL`, `BBL`, …) and they share key names — both
   * define `hero-bg.jpg` — so a bare string could no longer say which
   * file it meant.
   */
  image: ImageAsset;
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
    image: BUCCAL["hero-bg.jpg"],
    status: "live",
  },
  {
    slug: "brazilian-butt-lift",
    eyebrow: "Body contouring",
    title: "Brazilian Butt Lift",
    blurb:
      "Fuller, naturally shaped curves built from your own fat, with the waist and flanks sculpted in the same procedure.",
    image: BBL["hero-bg.jpg"],
    status: "live",
  },

  /* ── PAGES 3–4 ──────────────────────────────────────────────────────
   * Add them here as they're built. The index picks them up with no
   * other change. Copy the shape above:
   *
   *   { slug: "…", eyebrow: "…", title: "…", blurb: "…",
   *     image: PAGE["…"], status: "live" }
   *
   * `image` comes from that page's manifest in `lib/generated/images.ts`
   * — run `npm run images` after dropping the source file into the page's
   * Images folder, or TypeScript will reject the entry at build time
   * rather than shipping a broken thumbnail.
   * ─────────────────────────────────────────────────────────────────── */
];

export const LIVE_PAGES = PAGES.filter((p) => p.status === "live");
