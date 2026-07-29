/**
 * Clinic-wide constants shared by every landing page.
 * Change a number here and it updates the nav, footer, sticky bar,
 * click-to-call links and structured data at once.
 */
export const SITE = {
  doctor: "Dr. Luis Fernando Reyes",
  doctorShort: "Dr. Luis",
  practice: "Plastic & Aesthetic Surgery",
  city: "Dubai",
  country: "United Arab Emirates",

  phoneDisplay: "+971 55 557 2547",
  phoneHref: "tel:+971555572547",
  whatsappHref:
    "https://wa.me/971555572547?text=" +
    encodeURIComponent(
      "Hello, I'd like to book a consultation about buccal fat removal."
    ),

  email: "luisfernandoreyesmd@yahoo.com",
  emailHref: "mailto:luisfernandoreyesmd@yahoo.com",

  instagram: "https://www.instagram.com/dr.luisfernandoreyes_surgery/",
  facebook: "https://www.facebook.com/drluisfernandoreyes/",
  mapUrl: "https://share.google/JFXKjPDSRNDthp82J",

  /** Confirmed by the clinic. */
  clinicName: "Kasaesthetic Clinic",

  /**
   * ── TO SUPPLY ───────────────────────────────────────────────────────
   * Left empty on purpose. An earlier value ("Villa #1087, Al Wasl Road,
   * Al Manara") was read off a Google listing found by *text search*, and
   * the coordinates you later supplied sit on a different street — so the
   * two disagreed and one of them was wrong.
   *
   * The coordinates are authoritative, so the map is correct either way.
   * The written address is not, and a wrong street address on a surgical
   * clinic page sends patients to the wrong building — so nothing is
   * printed until you give the real one.
   *
   * Add it here and it appears in the footer *and* as `streetAddress` in
   * the page's structured data automatically.
   * ────────────────────────────────────────────────────────────────────
   */
  addressLines: [] as string[],

  /**
   * Clinic coordinates, supplied by the clinic.
   * (25°08'22.6"N 55°12'13.0"E — decimal form below.)
   *
   * Coordinates rather than a text query on purpose: a query re-resolves
   * against Google's listings every load and can drift to a neighbouring
   * business if a listing changes. A lat/lng pins one point, forever.
   *
   * Set to null to fall back to a styled placeholder card.
   */
  coords: { lat: 25.13966512152247, lng: 55.20361384037153 } as {
    lat: number;
    lng: number;
  } | null,

  /** Shown beside the address. Leave empty to hide the row. */
  openingHours: "" as string,

  /*
   * There is deliberately no `baseUrl` here any more.
   *
   * The public origin is now `ORIGIN` in `lib/site-url.ts`, read from the
   * SITE_URL environment variable at runtime. A constant in this file is
   * baked into the bundle, so moving the site to its real hostname meant a
   * rebuild and redeploy; an env var means editing `.env` on the server and
   * restarting the container.
   *
   * `ORIGIN` is server-only — see the note in that file.
   */
} as const;

/**
 * Map links, both built from SITE.coords.
 *
 * `mapUrl` used to be the share.google short link, which resolves to a
 * Google *search results* page rather than the map — so "Get directions"
 * opened a list of results. These use the documented Maps URL API, which
 * opens the map itself and hands off to the native app on mobile.
 */
export const MAPS = {
  /**
   * Keyless embed — no API key, no billing, no consent banner.
   *
   * `q` names the marker, `ll` fixes where it sits. Both are needed:
   *
   *   • `q=lat,lng`            → correct spot, pin shows raw coordinates
   *   • `q=lat,lng (Label)`    → the embed ignores the suffix entirely
   *   • `q=Name` alone         → re-resolves against Google's listings and
   *                              drifts (it lands on a differently-named
   *                              clinic a street away)
   *   • `q=Name` + `ll=lat,lng` → labelled pin, clinic's own coordinates
   *
   * Verified side by side before settling on the last one.
   */
  embedSrc: SITE.coords
    ? `https://maps.google.com/maps?q=${encodeURIComponent(
        SITE.clinicName || SITE.doctor
      )}&ll=${SITE.coords.lat},${SITE.coords.lng}&z=17&output=embed`
    : null,

  /** Opens turn-by-turn directions to the clinic. */
  directions: SITE.coords
    ? `https://www.google.com/maps/dir/?api=1&destination=${SITE.coords.lat},${SITE.coords.lng}`
    : SITE.mapUrl,

  /** Opens the pin on the map. */
  place: SITE.coords
    ? `https://www.google.com/maps/search/?api=1&query=${SITE.coords.lat},${SITE.coords.lng}`
    : SITE.mapUrl,
} as const;

/**
 * Before/after photography on this page is illustrative reference art,
 * not identified patient records. Set to false once consented clinical
 * photography replaces it.
 */
export const SHOW_RESULTS_DISCLAIMER = true;

/**
 * Renders reviews marked `placeholder: true` in content.ts.
 *
 * ON while the page is being built and reviewed, so the section reads as
 * finished. **Set to false before running paid traffic** — placeholder
 * reviews are written for layout, not supplied by patients, and shipping
 * them as testimonials is a Google Ads policy violation and a regulatory
 * risk under DHA advertising rules.
 *
 * With it off, only genuine entries render and the grid adapts to how
 * many there are. The build logs a warning while it is on.
 */
export const SHOW_PLACEHOLDER_REVIEWS = true;
