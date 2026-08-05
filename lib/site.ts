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

  /*
   * TWO numbers, and they are not interchangeable.
   *
   * `phoneDisplay` / `phoneHref` is the clinic's voice line. It appears in
   * exactly one place — the footer — and in the structured data, because
   * `telephone` in schema.org drives click-to-call in search results and
   * should be the line that answers calls.
   *
   * `contactDisplay` / `contactHref` and `whatsappHref` are the number the
   * clinic wants people to reach it on. Every other touchpoint uses these.
   *
   * Changing either means checking every usage: `grep -rn "phoneHref\|
   * phoneDisplay\|contactHref\|contactDisplay\|whatsappHref"`. There are
   * twelve.
   */
  phoneDisplay: "+971 55 557 2547",
  phoneHref: "tel:+971555572547",

  /** Shown and linked everywhere except the footer. WhatsApp-first. */
  contactDisplay: "+971 56 663 6359",
  /*
   * A tel: link on the same number, used only by the affordances that are
   * explicitly labelled "call" — the sticky bar's phone icon, the FAQ
   * button, the 404 and the form's error message. Those already sit beside
   * a separate WhatsApp button, so pointing them at WhatsApp too would give
   * two identical buttons.
   *
   * If this number does NOT take voice calls, those four should be repointed
   * at `whatsappHref` or removed — a call button that rings nothing is worse
   * than no call button.
   */
  contactHref: "tel:+971566636359",

  /*
   * The prefilled message is procedure-NEUTRAL, and has to stay that way.
   *
   * It used to name buccal fat removal, which was correct while that was
   * the only page. Every button that opens WhatsApp lives in the shared
   * chrome — the nav, the sticky bar, the footer, the 404 — and none of
   * those knows which landing page it is sitting on, so a procedure name
   * here would have greeted Brazilian Butt Lift visitors with the wrong
   * one.
   *
   * If per-page wording is ever wanted, it has to be threaded from the
   * page down through those components as a prop; changing this string is
   * not a substitute.
   */
  whatsappHref:
    "https://wa.me/971566636359?text=" +
    encodeURIComponent(
      "Hello, I'd like to book a consultation with Dr. Luis."
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
 * The "individual results vary" line under the results gallery.
 *
 * **Off at the clinic's request.** The copy still exists in
 * `RESULTS.disclaimer`, so switching this back to `true` restores it
 * without rewriting anything.
 *
 * ── WORTH RAISING AT DHA APPROVAL ───────────────────────────────────
 * This page now shows the clinic's own before/after photography of real
 * surgical patients with no qualifying statement beneath it. A
 * results-vary line is the usual expectation on medical advertising and
 * is cheap insurance; its absence is the kind of thing an approval pass
 * asks about.
 *
 * Separately, written consent to publish is still unconfirmed. Some of
 * the images are anonymised (eyes masked, or cropped below the eyeline)
 * and others show a fully identifiable face — that inconsistency is
 * worth resolving before paid traffic, since DHA rules govern the use of
 * patient imagery and identifiable clinical photographs need documented
 * consent.
 * ────────────────────────────────────────────────────────────────────
 */
export const SHOW_RESULTS_DISCLAIMER = false;

/**
 * Renders reviews marked `placeholder: true` in content.ts.
 *
 * **OFF, and there are no placeholders left to render.** All six
 * written-for-layout entries were replaced with genuine patient reviews
 * supplied by the clinic, so the flag has nothing to gate — it is kept
 * only so a future page can use the same mechanism while it is being
 * built.
 *
 * Leave it false. Shipping written-for-layout copy as testimonials is a
 * Google Ads policy violation and a regulatory risk under DHA advertising
 * rules; the build logs a warning if it is ever switched back on with
 * placeholders present.
 */
export const SHOW_PLACEHOLDER_REVIEWS = false;
