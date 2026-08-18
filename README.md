# Dr. Luis Fernando Reyes — Google Ads Landing Pages

A Next.js app serving paid-traffic landing pages for the clinic. One app,
one shared design system, one route per campaign — so pages 3–4 reuse
everything pages 1 and 2 established.

**Live routes:** `/buccal-fat-removal`, `/brazilian-butt-lift`
**Root:** `/` is an index of every page, driven by `lib/pages.ts`.

---

## Documentation

| Doc | What's in it |
|---|---|
| **[docs/pages/buccal-fat-removal.md](docs/pages/buccal-fat-removal.md)** | **Section-by-section reference for page 1** — what each section does, which content keys it reads, what animates, and the gotchas that will bite you if you change it. Start here for any edit, on either page. |
| **[docs/pages/brazilian-butt-lift.md](docs/pages/brazilian-butt-lift.md)** | **Page 2, and only what differs** — the namespaced image manifest, the measured locator stops on its own illustration, the results gallery that labels each card, how its slider halves were cut, and the three images the clinic still has to confirm |
| [docs/pages/index.md](docs/pages/index.md) | The root index at `/` — how to add a page to it, why it's `noindex`, and the body-padding trap any page without a sticky bar will hit |
| [docs/ads-readiness.md](docs/ads-readiness.md) | **Read before spending a penny on ads** — how the origin decides indexing, why AdsBot is named explicitly, the conversion contract, and the one thing still not done |
| [docs/organic-search.md](docs/organic-search.md) | **Ranking these pages in Google** — a live audit of both pages and the main site, why subdomain-vs-subfolder is the decision that dominates the rest, and a phased plan. The technical SEO is already sound; the gaps are links, cost content and local |
| [docs/deployment.md](docs/deployment.md) | VPS, Docker and GitHub Actions — the site directory, the two build-time variables, and why editing them on the server does nothing |
| [docs/LAUNCH-CHECKLIST.md](docs/LAUNCH-CHECKLIST.md) | Ordered pre-launch steps: content sign-off, DHA approval, lead delivery, tracking, QA |
| This file | Architecture, design system, image pipeline, conventions |

One page reference per landing page — copy the file when you add pages 3–4.

## Quick start

```bash
npm install
npm run dev            # http://localhost:3000/buccal-fat-removal
npm run build && npm start
npm run prepare-images    # only after changing source artwork

# Every verify script takes the page slug as a second argument and defaults
# to buccal-fat-removal. Each page has its own form and its own thank-you
# route, so passing on one proves nothing about the next.
npm run verify:conversion -- https://url brazilian-butt-lift
npm run verify:menu -- http://127.0.0.1:3000 brazilian-butt-lift
npm run test:lead -- https://url          # posts one marked test lead

# Deployment is a push to main — see docs/deployment.md
docker build -t lp . && docker run --rm -p 3000:3000 lp   # build the deploy image locally
```

Requires Node 20+. No environment variables are needed to run locally.

---

## Before this goes live

Three things are deliberately left outstanding. Each is isolated to a
single file so none requires touching page code.

| # | What | Where | Notes |
|---|---|---|---|
| 1 | **Patient reviews** | `app/*/content.ts` → `REVIEWS.items` | The same five **real** reviews on both pages; placeholders are gone and `SHOW_PLACEHOLDER_REVIEWS` is false. They are body-contouring reviews from the Colombian practice, so on `/brazilian-butt-lift` they describe the right procedure and on `/buccal-fat-removal` they do not. None is from Dubai. Also: DHA rules restrict patient testimonials. See [docs/pages/buccal-fat-removal.md](docs/pages/buccal-fat-removal.md). |
| 2 | **Clinic street address** | `lib/site.ts` → `addressLines` | Empty. The map is correct regardless (pinned by clinic-supplied coordinates), but nothing is printed until the real address arrives. |
| 3 | **Three BBL gallery cards** | `app/brazilian-butt-lift/content.ts` → `GALLERY` | One may or may not be a before/after and is labelled the cautious way; one carries a different surgeon's watermark; one is intra-operative. All three need the clinic's word. See [docs/pages/brazilian-butt-lift.md](docs/pages/brazilian-butt-lift.md). |

**Google Tag Manager is live** — container `GTM-NHBRF7G5`, a constant in
`lib/analytics.ts`, with both the script and the `<noscript>` iframe on every
page. `NEXT_PUBLIC_GTM_ID` overrides it; `off` disables tracking. The tags
themselves are still built inside the GTM UI — see
[docs/ads-readiness.md](docs/ads-readiness.md) for the event contract.

**Lead email is live.** Consultation requests reach
`plasticsurgeonsdubai@gmail.com` and `drnicole.ads@gmail.com` — changed at
the clinic's request from the two earlier addresses. The delivery path was
verified end to end against the production site on the **old** recipients;
the new pair has not been re-tested live, and `LEAD_TO` on the server
overrides this list outright if it is set. Sent from
`drnicole.ads@gmail.com` via Gmail SMTP with an app password — a shared
marketing mailbox, so the `From` does not match the clinic's own domain.
Worth revisiting if it ever affects deliverability.

Once the ads subdomain is confirmed, set the `SITE_URL` Actions **variable**
to that exact origin and rebuild. It drives canonical URLs, Open Graph tags
and the JSON-LD. There is no `SITE.baseUrl` any more — the origin lives in
`lib/site-url.ts`, and because the campaign pages are prerendered it is baked
in at **build** time. Setting it on the server and restarting does nothing;
see [docs/deployment.md](docs/deployment.md).

### Optional toggle

`SHOW_RESULTS_DISCLAIMER` in `lib/site.ts` controls the "individual results
vary" line under the results gallery. It is **off** at the clinic's request.
The copy still lives in `RESULTS.disclaimer`, so flipping the flag restores
it. Worth raising at DHA approval — the gallery is the clinic's real
before/after photography and now carries no qualifying statement.

---

## Architecture

```
app/
  layout.tsx                    fonts, analytics bootstrap, base metadata
  globals.css                   the palette + design tokens (see below)
  icon.png                      favicon (generated by the image pipeline)
  not-found.tsx                 branded 404
  page.tsx                      root index — lists the pages in lib/pages.ts
  api/lead/route.ts             form handler: validate → spam-filter → deliver
  robots.ts / sitemap.ts        both derived from the origin — see ads-readiness
  buccal-fat-removal/
    page.tsx                    metadata, JSON-LD, section composition
    content.ts                  ALL copy for the page, in one typed object
    sections/                   12 section components
    thank-you/                  real page, noindex, fires the conversion once
  brazilian-butt-lift/          same shape; Anatomy.tsx becomes Steps.tsx

components/analytics/           ClickIdCapture (layout) + LeadEvent (thank-you)
components/lp/                  SHARED KIT — reused by every future page
  Nav  Footer  StickyCTA  ScrollProgress  MotionProvider
  Section  Eyebrow  Button  MaskedHeading  Accordion
  Reveal  ImageReveal  TiltCard  CountUp
  Aurora  GlowLogo  TrustIcon  ClinicMap
  BeforeAfterSlider  LeadForm

lib/
  site.ts                       clinic constants (phone, email, socials, map)
  site-url.ts                   the public origin — SERVER ONLY, baked at build
  pages.ts                      the landing-page register the root index reads
  motion.ts                     shared easings + animation variants
  analytics.ts                  event layer + the generate_lead contract
  click-id.ts                   gclid/wbraid/gbraid, kept 90 days
  validation.ts                 Zod schema shared by client and server
  lead-mail.ts                  consultation requests → the clinic, over SMTP
  generated/images.ts           AUTO-GENERATED — SHARED / BUCCAL / BBL

scripts/prepare-images.mjs      source artwork → optimised page assets
public/shared/                  logo, portrait, affiliation marks — every page
public/buccal-fat-removal/      page 1 assets
public/brazilian-butt-lift/     page 2 assets

Dockerfile                      standalone image, three stages
docker-compose.yml              shipped to the VPS on every deploy
deploy/                         remote-deploy.sh + Caddy reference
.github/workflows/deploy.yml    build → GHCR → ssh → pull → restart
```

### Where to change things

| I want to… | Edit |
|---|---|
| Reword any copy | `app/<slug>/content.ts` |
| Change phone / email / socials | `lib/site.ts` — **one** number now, `phoneDisplay` / `phoneHref`, carrying calls, WhatsApp and the structured data on every page. It used to be two; the separate voice line is retired. The WhatsApp prefill is procedure-neutral on purpose; the shared chrome has no page context |
| Adjust a colour | `app/globals.css` → `@theme` |
| Retune an animation | `lib/motion.ts` |
| Add a section | new file in `sections/`, then add to `page.tsx` |
| Add a new campaign page | copy the `buccal-fat-removal/` folder, swap `content.ts`, add a bucket to `scripts/prepare-images.mjs`, add an entry to `lib/pages.ts` |

---

## Design system

The palette is locked from `colors.html` and is **identical across all
four landing pages**. Defined once in `app/globals.css` under `@theme`,
consumed as Tailwind utilities (`bg-espresso`, `text-gold`, …).

| Token | Hex | Role |
|---|---|---|
| `ink` | `#231B16` | Headings |
| `espresso` | `#33261F` | Dark panels |
| `espresso-deep` | `#1F1713` | Footer, booking band |
| `body` | `#3F352F` | Body text |
| `muted` | `#7A6A5F` | Secondary text |
| `gold` | `#A87F49` | Primary CTA, accents |
| `gold-light` | `#C8A063` | Hover, gradients |
| `champagne` | `#EDDFC6` | Accent on dark |
| `blush` | `#E7D3C8` | Soft accent |
| `ivory` | `#FBF8F4` | Page background |
| `sand` | `#F2EBE1` | Tinted sections |
| `greige` | `#DCD5CB` | Borders, placeholders |
| `danger` | `#A33A28` | Form validation only |

**Type:** Playfair Display (display, gold italic accents) + Poppins
(300/400/500/600). Self-hosted through `next/font` — no render-blocking
request to Google, no layout shift.

---

## Page structure

Order, in one line each, as built for `/buccal-fat-removal`.
**[docs/pages/buccal-fat-removal.md](docs/pages/buccal-fat-removal.md)
covers every section properly** — what it reads from `content.ts`, what
animates, and the gotchas. This table is only a map.

`/brazilian-butt-lift` runs the same twelve sections in the same order, with
two rebuilt. Section 5 runs the same locator animation over its own
three-panel illustration, one panel per step. Section 9 labels each gallery
card individually, because not all of them contain a "before", and cuts its
slider from the one supplied card that can be split. See
[docs/pages/brazilian-butt-lift.md](docs/pages/brazilian-butt-lift.md).

| # | Section | In one line |
|---|---|---|
| — | Nav | Clinic logo lockup; transparent over hero → frosted ivory on scroll. Below `lg` the links move into a full-screen menu |
| 1 | Hero | Built around the portrait — full-bleed top on phones, feathered right 60% on desktop. The LCP element |
| 2 | Trust strip | Four numbers, counting up |
| 3 | Credentials | Four trust marks whose icons draw on, then idle |
| 4 | What is buccal fat | Explanation beside the theatre photo |
| 5 | How it's performed | Self-playing stepper; a gold locator travels the illustration |
| 6 | Benefits | Front-facing portrait beside six cards with pointer tilt; sized to fit one screen |
| 7 | Am I a candidate | Checklist with self-drawing ticks, full-width CTA strip |
| 8 | Meet Dr. Luis | The one full-dark band; portrait pinned while his story scrolls, with a champagne affiliation ribbon |
| 9 | Before & after | Drag-to-compare slider plus the clinic's own six before/after cards |
| 10 | Reviews | Carousel with prev/next; Read more opens the full quote in a dialog |
| 11 | FAQ | Single-open accordion, all collapsed on arrival |
| 12 | Booking | The case left, three-field form right |
| — | Footer | Logo, contact + socials, map |
| — | Sticky CTA | Call · WhatsApp · Book, appearing after the hero. A bottom bar below `sm`; a right-edge rail from 1380px, which is the width at which the shell's margin finally clears it — in between, neither, because an overlay that covers body copy is worse than no overlay |

Every animation uses `transform`/`opacity` only, and the whole system is
disabled under `prefers-reduced-motion` — `MotionProvider` makes Motion
itself honour the preference, which the CSS override alone cannot do.

---

## The image pipeline

Source artwork lives outside this app, one folder per page plus the
affiliation marks: `../buccal-fat-removal/Images/`,
`../buccal-fat-removal/Before after/`, `../buccal-fat-removal/uni logo/`,
`../brazilian-butt-lift/Images/` and `../brazilian-butt-lift/B A/`. Several
of the files are composites that a page needs as separate pieces, and none
are web-sized, so `npm run prepare-images` derives everything.

Output is namespaced into three buckets, which is also how
`lib/generated/images.ts` is shaped:

| Bucket | Public path | Export | Holds |
|---|---|---|---|
| shared | `/shared/` | `SHARED` | The clinic and the surgeon — used by the shared kit, so every page gets the same file |
| buccal | `/buccal-fat-removal/` | `BUCCAL` | Page 1 photography |
| bbl | `/brazilian-butt-lift/` | `BBL` | Page 2 photography |

**Shared**

| Output | Derived from |
|---|---|
| `dr-portrait.jpg` | The full-length studio shot, cropped to a 4:5 portrait around head, shoulders and hands |
| `dr-surgery.jpg` | Resized and re-encoded |
| `logo-full.png` | The English lockup (`PLASTIC SURGEON`, replacing the Spanish `CIRUJANO PLÁSTICO`), for the ivory nav. It arrives as a **JPEG** — two-colour artwork already composited onto white — so `liftOffWhite` inverts that composite rather than thresholding it: `a = 1 − min(r,g,b)/255`, then unpremultiply. Thresholding would leave the gold at ~41% opacity and visibly washed out; unpremultiplying returns it at full strength. Cropped to the measured ink box, x 132–1166 / y 147–567 |
| `affil-*.png` (six) | The affiliation marks. Each is trimmed to its ink, recoloured to a flat champagne and normalised to 144px tall. Most arrive as dark line art on transparency and would be invisible on the espresso band; only the RGB is replaced, so the original alpha keeps the antialiasing and the interior cuts in the engraved seals. **AASMA has no alpha channel at all** — it came flattened on opaque white, so `onWhite: true` derives its alpha from `255 - min(r,g,b)` first; without that it emits a solid champagne rectangle. **Trim before resize** — otherwise each normalises to the height of its transparent padding rather than its artwork, and the row comes out ragged. `IMG_3483.PNG` duplicates `IMG_3478.PNG` byte for byte and is not emitted |
| `logo-light.png` | The same lockup for espresso — the footer, the root index, the open mobile menu. Only the near-black **type** is repainted white; the gold monogram and rule keep their colour, because gold on espresso is a pairing the rest of the site already uses. Gold and type are told apart by `r − b`: the type is neutral, the gold is warm |
| `app/icon.png` | The favicon — just the logo's circular monogram, at x 525–755 / y 147–380, found by scanning for the empty row bands that separate the lockup's four parts. At 16px a full lockup is an illegible smear. Left in its own **gold** rather than recoloured; the previous ink version was marginal on a dark tab strip and gold is lighter. If it still reads poorly, put an espresso-deep plate behind it rather than lightening the mark |

**Buccal fat removal**

| Output | Derived from |
|---|---|
| `hero-bg.jpg` | The hero portrait, capped at 1000px. Tighter than the others because it is the LCP element |
| `hero-before.jpg`, `hero-after.jpg` | The side-by-side hero composite, split at the measured gutter (x766–769) with the burnt-in labels and caption band cropped away, so the drag slider gets two independent, equally-sized images |
| `ba-1…6.jpg` | The clinic's own before/after cards, resized only. Two aspect ratios, both preserved rather than normalised |
| `anatomy.webp` | The medical illustration, trimmed of its white margins with the studio background flood-filled to transparent from the borders inward (interior whites — tissue detail — are preserved). 679 kB PNG → 42 kB WebP |
| `benefits-portrait.jpg` | The front-facing portrait for the benefits band, at 900px. Below the fold and lazy, so it can afford more width than the hero |

**Brazilian butt lift**

| Output | Derived from |
|---|---|
| `hero-bg.jpg` | The hero photograph, capped at 1000px for the same reason |
| `benefits-portrait.jpg` | The profile shot for the benefits band, at 900px |
| `steps.webp` | The three-panel procedure illustration — this page's `anatomy.webp`, and what the how-it's-performed locator ring travels across. Knocked out to transparency at 1200px so it floats on the sand band. Its plate is a flat **cream**, not white, so it goes through `knockOutTint` rather than `knockOutBackground`: the illustration contains surgeons' white gloves that are *brighter* than the background, so any brightness threshold that clears the cream eats them |
| `ba-1…7.jpg` | The clinic's own before/after cards, resized only — all 700×380. Six come from `B A/`; `ba-7` was supplied later and sits one level up, so it is read from its own path rather than moved. **The whole of this page's results section is these seven files:** six fill the gallery, and `ba-2` is cut into the slider halves below instead. The 6-pair grid composite in `Images/` used to feed this section and now feeds none of it |
| `compare-before.jpg`, `compare-after.jpg` | The featured slider, cut from `Untitled design (21)` — the only one of the six with a real seam that is not the intra-operative photograph. Measured three ways: the bodies at x 31–299 and x 403–690, so neither silhouette is clipped; the centre watermark at x 242–435, which no crop avoids while keeping both bodies whole (a faint fragment stays at each inner edge, both corner wordmarks survive); and the burnt-in labels at y 24–46 and y 59–80, cropped away because the slider draws its own. 310×295, native size |

The script also writes `lib/generated/images.ts` with each asset's natural
dimensions and an inline blur placeholder, so `<Image>` never causes
layout shift and never flashes empty.

**Do not hand-edit `lib/generated/images.ts`.** Re-run the script instead.

If you replace the source artwork with differently-shaped composites, the
crop rectangles in `prepare-images.mjs` will need re-measuring — they are
pixel coordinates, not percentages, and each is commented with what it
refers to.

---

## Conversion tracking

Every CTA already calls `track()` with a stable event name. Once a GTM
container ID is present, conversions can be configured entirely from the
GTM UI without a code change.

| Event | Fires on |
|---|---|
| `cta_click` | Any "book" button (labelled by location: `hero_primary`, `nav`, `results`, …) |
| `call_click` | Any click-to-call link |
| `whatsapp_click` | Any WhatsApp link |
| `form_start` | First keystroke in the form |
| `form_submit` | Successful submission — **the primary Ads conversion** |
| `form_error` | Validation or network failure |
| `slider_interact` | User takes control of the before/after slider |
| `faq_open` | An FAQ question is expanded |

`gclid`, `gbraid` and all `utm_*` parameters are captured from the URL on
mount and travel with the lead, so submissions stay attributable to the
campaign that produced them.

---

## Lead handling

`LeadForm` and `app/api/lead/route.ts` share one Zod schema
(`lib/validation.ts`), so client and server validation can never drift.

Spam defences, both invisible to real users:

- A honeypot `company` field, positioned off-screen and non-focusable.
- A timing check — submissions completed in under two seconds are treated
  as automated.

A tripped **timing** check returns `200 OK`, so the bot sees success while the
lead is dropped. A filled **honeypot** returns `400`: the schema types
`company` as `max(0)`, so Zod rejects it before the route's own check is
reached. The lead is blocked either way, but the intent — never tell a bot
which field it got wrong — only holds for the timing gate. Measured, not
inferred, and worth knowing before anyone treats the two as equivalent.

Delivery is email, over SMTP, in `lib/lead-mail.ts`. Both clinic addresses,
subject `[Page Name] New consultation request — <name>` with the page name
resolved through `lib/pages.ts`, `Reply-To` set to the patient, and a `wa.me`
link built from the number they typed. Every lead is written to the container
log **before** the send is attempted, so a relay outage costs a notification
and never the lead.

---

## Accessibility

- The before/after slider is a real `role="slider"`: focusable, driven by
  arrow keys (Shift for larger steps, Home/End for the extremes), and it
  announces its position through `aria-valuetext`.
- The FAQ accordion uses proper `aria-expanded` / `aria-controls` wiring.
- The mobile menu is a real modal dialog: `role="dialog"`, `aria-modal`,
  focus moved into the panel on open and returned to the trigger on close,
  Tab trapped inside it, and Escape to dismiss. One button carries
  `aria-expanded`, so there is a single state to keep honest.
- Form errors are announced via `role="alert"` and focus jumps to the
  first invalid field on failed submit.
- Focus rings are visible and on-brand (`:focus-visible`).
- All motion is disabled under `prefers-reduced-motion`.

---

## Known constraints

- **Results galleries are 3-column on desktop** because the source cards
  are small. At 2 columns they would be upscaled on high-DPI screens.
  Higher-resolution source art would allow a larger presentation.
- **The BBL slider is upscaled ~1.39×, and its halves carry a watermark
  fragment.** They are 310px, cut from a 700px card — the only one of the
  six supplied that can be split at all — and capped at 430px on the page
  to hold the upscale down. The clinic's centre watermark straddles the
  seam and no crop avoids it while keeping both bodies whole, so a faint
  fragment sits at the inner edge of each half; both corner wordmarks
  survive intact. Fixing either needs a supplied file, not a different
  crop. Measured per file in
  [docs/pages/brazilian-butt-lift.md](docs/pages/brazilian-butt-lift.md).
- **No BBL image shows a buttock before and after.** The only source that
  did was a grid composite in `Images/`, dropped when the before/after was
  restricted to the `B A` folder. Restoring one means new files in that
  folder, not a code change.
- **Three BBL gallery cards still need the clinic's word** — one that may
  or may not be a before/after, one carrying a different surgeon's
  watermark, one intra-operative. Listed in
  [docs/pages/brazilian-butt-lift.md](docs/pages/brazilian-butt-lift.md).
- **Before/after photography is reference art**, not identified patient
  records. See `SHOW_RESULTS_DISCLAIMER` above.
- **`lib/motion.ts` intentionally has no clip-path reveal variant.**
  `whileInView` reads the *computed* clip-path as its animation origin,
  and browsers normalise `inset(0 0 100% 0)` to a shorter argument list
  that no longer matches the target — so the tween silently never runs.
  Use `<ImageReveal>`, which wipes a curtain with `scaleY` instead.

---

## Adding campaign pages 3–4

1. `cp -r app/buccal-fat-removal app/<new-slug>`
2. Rewrite `content.ts` — it holds every word on the page.
3. Adjust `page.tsx`: title, description, JSON-LD `MedicalProcedure`.
4. Add a bucket to `DIRS` in `scripts/prepare-images.mjs`, add a block that
   emits the new artwork into it, and re-run the script. Anything that is
   the clinic or the surgeon rather than the procedure belongs in `shared`.
5. Point the copied sections at the new manifest export.
6. Add the page to `lib/pages.ts` so the root index lists it.
7. Drop or swap any section that doesn't apply.
8. Copy `docs/pages/brazilian-butt-lift.md` — it is already written as
   "page 1 plus the differences", which is the right shape for page 3.
9. Verify the conversion path on the new slug:
   `npm run verify:conversion -- <url> <new-slug>`.

The shared kit in `components/lp/`, the palette, the motion vocabulary and
the entire form + tracking stack carry over untouched.

**One thing that does not carry over automatically:** anything in the shared
chrome that names a procedure. `SITE.whatsappHref` was buccal-specific until
page 2 arrived and had to be made neutral, because the nav, sticky bar,
footer and 404 have no idea which page they are on.
