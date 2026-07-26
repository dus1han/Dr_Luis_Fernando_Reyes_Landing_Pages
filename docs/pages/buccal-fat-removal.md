# Page reference — `/buccal-fat-removal`

A section-by-section guide for changing this page later. Every section
lists its file, which content keys it reads, how it's laid out, what
animates, and what will bite you if you change it.

**All copy lives in one file:** `app/buccal-fat-removal/content.ts`.
For a wording change, that's the only file you need.

**Section order and composition:** `app/buccal-fat-removal/page.tsx`.

---

## At a glance

| # | Section | File | `id` | Tone | Padding | Height @1440 |
|---|---|---|---|---|---|---|
| 1 | Hero | `sections/Hero.tsx` | `top` | gradient ivory→sand | 34 / 78 | 669 |
| 2 | Trust strip | `sections/Stats.tsx` | — | espresso | 0 | 152 |
| 3 | Credentials | `sections/Assurance.tsx` | — | sand | 68 | 488 |
| 4 | What is buccal fat | `sections/Procedure.tsx` | `procedure` | ivory | 68 | 727 |
| 5 | How it's performed | `sections/Anatomy.tsx` | — | sand | 68 | 584 |
| 6 | Benefits | `sections/Benefits.tsx` | `benefits` | ivory | 68 | 901 |
| 7 | Am I a candidate | `sections/Candidate.tsx` | `candidate` | sand | 68 | 707 |
| 8 | Meet Dr. Luis | `sections/Surgeon.tsx` | `surgeon` | espresso | 68 | 1247 |
| 9 | Before & after | `sections/Results.tsx` | `results` | ivory | 68 | 1706 |
| 10 | Reviews | `sections/Reviews.tsx` | `reviews` | sand | 68 | 695 |
| 11 | FAQ | `sections/Faq.tsx` | `faq` | ivory | 68 | 1024 |
| 12 | Booking | `sections/Booking.tsx` | `book` | espresso-deep | 68 | 676 |
| — | Footer | `components/lp/Footer.tsx` | — | espresso-deep | 68 | 547 |

Every section from 3 to 12 is on the same 68px rhythm. Keep it that way —
a section left on the old 100px puts 168px of dead space against its
neighbour, which reads as a gap rather than a break.

### Two rules that hold across the page

**Tones must alternate.** No two adjacent sections share a background,
or they read as one continuous block. If you reorder anything, re-check
the whole run: ivory → sand → ivory → espresso → …

**Sections are sized to fit one screen** (~700px at 1366×768) wherever
the content allows. Reviews, FAQ, Booking and Before & after are
legitimately taller because of how much they hold.

---

## 1. Hero — `sections/Hero.tsx`

Centred, text-only. **There is deliberately no image**: the LCP element
is the headline itself, so nothing has to decode before first paint.
This is the single biggest performance lever on the page and feeds
directly into Google Ads Quality Score. Don't add a hero image without
accepting that cost.

- **Content:** `HERO` — `eyebrow`, `kicker`, `headline` (2 lines), `lede`, `primaryCta`, `secondaryCta`
- **Background:** `components/lp/Aurora.tsx` — vertical light columns
- **Animation:** headline rises out of a clipping mask on load; the gold
  accent word carries a travelling sheen (`.accent-sheen` in `globals.css`)

**To change the background feel:** edit the `COLUMNS` array in
`Aurora.tsx`. Each entry is `{left, width, color, blur, from, to, drift,
duration, delay}` — `width: 1` reads as a hairline, `40+` with blur reads
as a soft band.

> **Gotcha —** density across `left: 34%–66%` is deliberately thin.
> That's the band directly behind the headline. Adding strong columns
> there puts pattern behind the type.

> **Gotcha —** cycles are 7–14s on purpose. Earlier versions used 60–110s
> and were technically animating but practically static — nobody looks
> at a hero for two minutes.

---

## 2. Trust strip — `sections/Stats.tsx`

Espresso band of four numbers directly under the hero.

- **Content:** `STATS` — array of `{value, prefix?, suffix?, display?, label}`
- **Animation:** numbers count up on entry

**To add or change a stat:** edit `STATS`. Set `display` for anything
non-numeric (`"Double"`, `"Zero"`) — it opts that stat out of the
count-up. Four fits the grid; more will wrap.

---

## 3. Credentials — `sections/Assurance.tsx`

Four trust marks: board certification, DHA licensing, international
experience, safety-first.

- **Content:** `ASSURANCE.items` — `{icon, title, body}`
- **Icons:** `components/lp/TrustIcon.tsx` (`certificate` · `shield` · `globe` · `heart`)
- **Animation:** each icon draws itself on, then idles — the medal turns,
  the shield pulses, the globe's meridian swings, the heart beats

**To add a fifth item:** the grid is `sm:grid-cols-2 lg:grid-cols-4`.
Five would leave an orphan — either go to 6 or change the grid.

**To add an icon:** add a case in `TrustIcon.tsx` and reference its name
from content.

> **Gotcha —** the eyebrow here is `as="h2"`. This band's other titles are
> `h3`, so without it the outline jumps h1 → h3.

> **Gotcha —** on phones this switches to icon-beside-text rows. The
> centred column stacks into a very tall band at 390px.

---

## 4. What is buccal fat removal — `sections/Procedure.tsx`

Two columns: explanation left, theatre photo right.

- **Content:** `PROCEDURE` — `eyebrow`, `headline`, `body[]`, `quote`
- **Image:** `dr-surgery.jpg`
- **Animation:** curtain wipe on the image (`ImageReveal`)

> **Gotcha —** the image is cropped to `aspect-9/10`. The source is a tall
> 2:3 portrait; at its natural ratio it rendered ~270px taller than the
> text beside it, which is what pushed this section past one screen.
> Changing the aspect will reopen that gap.

---

## 5. How it's performed — `sections/Anatomy.tsx`

A stepper that plays itself. A gold locator travels across the
illustration between three targets while the matching step highlights.

- **Content:** `ANATOMY` — `eyebrow`, `headline`, `steps[]` (`{n, title, body}`)
- **Image:** `anatomy.webp`
- **Timing:** `DWELL` (5200ms). Pauses on hover and focus; no auto-advance
  under reduced motion.

**To change step timing:** edit `DWELL`.

**To add a fourth step:** add to `ANATOMY.steps` **and** add a matching
entry to `STOPS` — they're index-matched. Without it the locator will
throw on the new index.

> **Gotcha — `STOPS` are measured pixel coordinates, not guesses.** They
> were found by scanning the artwork's alpha channel: for each column,
> the vertical extent of opaque pixels peaks exactly at a circle's
> centre. Current values: insets at (85, 280) and (1071, 280) with
> diameter 198; arrow at (565, 272.5), in the trimmed 1157×437 image.
> **If the illustration is ever re-cropped, these must be re-measured.**
> `scratchpad/qa/ring-align.mjs` verifies alignment to 0.0px.

> **Gotcha —** the arrow has its own smaller ring (`9.4%` vs `17.1%`) and
> its own Y. A shared value can't centre on all three.

> **Gotcha —** the progress rail sits *below* the illustration, not across
> it. An earlier version drew it over both faces.

---

## 6. Benefits — `sections/Benefits.tsx`

Six cards, three columns.

- **Content:** `BENEFITS.items` — `{icon, title, body}`
- **Animation:** staggered entry; pointer tilt with a gold glow following
  the cursor (`components/lp/TiltCard.tsx`)

**To add a benefit:** add to `BENEFITS.items` and add the icon path to the
`ICONS` map in `Benefits.tsx`. Six fills two rows of three; seven orphans.

> **Gotcha —** the tilt is mouse-only. On touch it renders as a plain div
> with no listeners — a tilt firing on tap reads as a glitch.

---

## 7. Am I a candidate — `sections/Candidate.tsx`

Intro left, five-point checklist right, full-width CTA strip below.

- **Content:** `CANDIDATE` — `eyebrow`, `headline`, `intro`, `items[]`, `note`
- **Animation:** gold ticks draw themselves in, staggered

> **Gotcha —** the "not sure?" card spans **both** columns on purpose. As a
> left-column item it made that side taller than the checklist and left a
> matching hole on the right. Columns are now exactly equal.

---

## 8. Meet Dr. Luis — `sections/Surgeon.tsx`

The one full-dark band. Portrait pinned left, his whole story right —
intro, credentials, then "why patients travel".

- **Content:** `SURGEON` — `eyebrow`, `headline`, `intro`, `credentials[]`,
  `whyHeadline`, `why[]`, `pullQuote`, `pullQuoteMeta`
- **Image:** `dr-portrait.jpg`
- **Animation:** curtain reveal, 20s Ken Burns, offset gold frame that
  scales in, parallax drift

> **Gotcha — the section must NOT be `overflow-hidden`.** A clipped
> ancestor silently disables `position: sticky` inside it, and the
> portrait stops pinning. The gold bloom has its own clipping wrapper as a
> *sibling* of the sticky column for exactly this reason.

> **Gotcha — the grid must not use `items-start`.** The cell has to stretch
> to the row height or the sticky child has nowhere to travel; it pins and
> releases immediately.

> This is the only section where both parts are one grid. Splitting it back
> into two stacked blocks reopens two holes (~120px and ~240px).

---

## 9. Before & after — `sections/Results.tsx`

Drag-to-compare slider paired with a reading guide, then six pairs.

- **Content:** `RESULTS` — `eyebrow`, `headline`, `intro`, `lookFor[]`, `disclaimer`
- **Images:** `hero-before.jpg` / `hero-after.jpg` (slider), `result-1…6.jpg` (grid)
- **Animation:** slider auto-sweeps once on first view to teach the
  interaction, then yields to the user

**To swap in real patient photos:** replace the sources and re-run
`npm run prepare-images`. Then set `SHOW_RESULTS_DISCLAIMER = false` in
`lib/site.ts` if the disclaimer no longer applies.

> **Gotcha —** the gallery is 3 columns because the source pairs are only
> 696×360. At 2 columns they'd upscale on high-DPI screens. Higher-res
> source art would allow a larger presentation.

> **Gotcha —** the slider is paired with the reading guide rather than
> centred alone. At 500px in a 1220px shell it left ~360px empty either
> side.

---

## 10. Reviews — `sections/Reviews.tsx`

- **Content:** `REVIEWS.items` — `{quote, name, meta, placeholder?}`
- **Switch:** `SHOW_PLACEHOLDER_REVIEWS` in `lib/site.ts`

### Layout switches on the count

| Reviews shown | Layout |
|---|---|
| 1 | single card, centred, max 560px |
| 2 | two columns, centred, max 820px |
| 3 | three columns, full width |
| **4+** | **auto-scrolling marquee** |
| 0 | section returns `null` and disappears |

Threshold is `MARQUEE_FROM` in the section file. There are currently 6
entries, so the marquee is live.

### The marquee

Continuous horizontal scroll, full-bleed (outside `.shell`) so the row
runs past the content column and the edge fade reads as "more this way".

- Speed scales with the count — `items.length * 9` seconds
- **Pauses on hover and on keyboard focus**
- Under reduced motion the animation is dropped and the row becomes a
  normal horizontal scroller, so the content stays reachable
- The list is rendered twice and translated -50%; the second copy is
  where the first started when the cycle restarts, which is what makes
  the loop seamless. **The duplicate is `aria-hidden`** or screen readers
  read every review twice.

Card width is fixed (`330px` / `370px` at `sm`). The marquee needs a
measurable row width — percentage widths break the loop.

### Placeholder reviews

Entries flagged `placeholder: true` are written for layout, not supplied
by patients. `SHOW_PLACEHOLDER_REVIEWS` decides whether they render:

- **`true` (current)** — all entries render, so the section reads as
  finished while the page is being built and reviewed. The dev build
  logs a warning naming how many are live.
- **`false`** — flagged entries are dropped from the build *entirely*,
  not hidden with CSS, so they never reach the shipped HTML where
  crawlers and screen readers would still find them. The grid then
  adapts to however many genuine ones remain.

**To publish a real review:** replace `quote` and `name`, delete the
`placeholder` flag.

Verify a production build has none left:

```bash
npm run build
grep -c "placeholder" .next/server/app/buccal-fat-removal.html   # expect 0
```

> **Only the first entry is genuine.** The other five are written to
> demonstrate the layout. Fabricated testimonials on a paid medical ad
> are a Google Ads policy violation and a regulatory risk under DHA
> advertising rules — **set `SHOW_PLACEHOLDER_REVIEWS` to `false` before
> running traffic**, and replace them with consented feedback.

---

## 11. FAQ — `sections/Faq.tsx`

Single-open accordion, seven questions, **all collapsed on arrival**.

- **Content:** `FAQ.items` — `{q, a}`
- **Component:** `components/lp/Accordion.tsx`

**Adding a question here also adds it to the page's `FAQPage` structured
data** — `page.tsx` generates that from the same array, so they can't
drift apart.

### Collapsed by default

`Accordion` takes an optional `defaultOpen` index; unset means everything
starts closed, which is what this page uses.

An answer expanded on arrival pushes the rest of the list down and makes
the section look longer than it is — the point of the list is that a
visitor scans the questions and opens only what applies to them.
Collapsed, the section is 1024px; one open takes it to ~1138px.

> **This costs nothing in search.** The answers are emitted as `FAQPage`
> structured data from the same array regardless of what's open, and
> panels are only mounted while expanded, so long answers never bloat the
> initial paint.

To start one expanded (e.g. a page where a single question does most of
the work): `<Accordion items={FAQ.items} defaultOpen={0} />`.

---

## 12. Booking — `sections/Booking.tsx`

Final CTA. The left column exists to answer the two questions that stop
people filling in a form on a surgery page — *what am I signing up for?*
and *what happens after I press this?* — so the form can stay short.

- **Content:** `BOOKING` — `eyebrow`, `headline`, `lead`, `body[]`, `steps[]`

### Where the phone number appears

Deliberately **twice on the whole page**: the nav and the footer. It was
four, which read as repetitive once the booking band and footer sat back
to back.

The booking section's Call button and the FAQ's both say "Call the
clinic" instead of printing the digits — same action, no third and fourth
copy inside one screen. `tel:` links carry the number regardless.

Counting occurrences in the rendered HTML will show five: three of those
are `<script>` tags — the JSON-LD `telephone` field (correct and
required) and Next's RSC payload. Only two are visible.
- **Form:** `components/lp/LeadForm.tsx`
- **Validation:** `lib/validation.ts` — one Zod schema shared by client
  and server, so they can't drift
- **Handler:** `app/api/lead/route.ts`

### Layout

| Left | Right |
|---|---|
| Eyebrow, headline, the lead line in italic champagne, two paragraphs | The form card |

The two columns are tuned to land level: **512 vs 540px**, with
`items-center` splitting the 28px remainder. If you change the headline
size or the copy length, re-check that — the balance is deliberate, not
incidental. The closing headline is also the largest on the page
(`clamp(34px, 5.2vw, 58px)`), which is both the right emphasis for a
final CTA and what makes the left column reach the form's height.

> **Three blocks were removed from this section, in order:** a three-item
> assurances list, then a "what happens next" step rail, then an "Or speak
> to the clinic now" phone/WhatsApp row. Each was padding out a left
> column that the copy alone now carries. Section height went 1142px →
> **676px**, inside one screen.

> There used to be a separate three-item assurances list under the form.
> It overlapped the steps almost entirely — both promised an honest
> assessment and realistic expectations. Those promises are now folded
> into **step 03**, which is where they belong: they describe the
> consultation, not the form. One list, not two.

### The form card

- Labels sit **inside** each field, above the input — one compact block
  per field instead of label + gap + box. Saves ~22px a field with no
  loss of tap target.
- A **conic gradient rotates behind a 1.5px ring** at the card edge: the
  square spins inside an `overflow-hidden` shell and the opaque card
  covers the middle. Cheaper and smoother than animating a border colour,
  and it draws the eye without moving anything being read. A static ring
  replaces it under reduced motion so the edge never looks unfinished.

### The form is three fields

Full name, phone, email, plus the consent box. **Preferred time,
procedure interest and the free-text message were removed** — every
additional field costs completions, and the clinic calls back to gather
that anyway, so they bought nothing a two-minute phone call doesn't.

If you add a field, it must go in **three** places or validation will
reject it:

1. `lib/validation.ts` — the Zod schema
2. `components/lp/LeadForm.tsx` — the input, and the `safeParse` payload
3. `docs/pages/*.md` — here

`app/api/lead/route.ts` needs no change; it spreads whatever the schema
validates.

> **`deliver()` in the API route is still a stub.** Validation, honeypot,
> timing check and gclid/UTM capture all work; leads currently log to the
> server console. See `docs/LAUNCH-CHECKLIST.md`.

Raw `<section>`, so it takes padding from `PADDING` in
`components/lp/Section.tsx` rather than the prop.

---

## Footer — `components/lp/Footer.tsx`

Three columns, vertically centred on each other:

| Left | Middle | Right |
|---|---|---|
| The logo, and nothing else | Contact, then Connect with us | The map |

- **Content:** `SITE` and `MAPS` in `lib/site.ts`
- **Map:** `components/lp/ClinicMap.tsx`
- **Logo:** `components/lp/GlowLogo.tsx` — gold halo breathing behind the
  mark on two out-of-phase cycles, so it doesn't read as one throbbing
  blob. Always *behind*, never over: the wordmark is thin white type.

Padding matches the page sections (`PADDING.tight`, 68px) rather than a
bespoke footer value. Height went 690px → **547px**.

Bottom bar is a single centred line: `© <year> <doctor> | Designed and
Developed by HolistiQ Digital`.

### What is deliberately *not* here

**No "Book a consultation" button, no phone card, no positioning
paragraph, no written address block.** The booking band sits directly
above with the form in it, and the footer's job is contact and location —
not a second pitch.

> **The general medical disclaimer was removed at the client's request.**
> It read: *"The information on this page is for general education and is
> not medical advice. Suitability for buccal fat removal is determined
> only at an in-person consultation, and individual results vary."*
>
> The only disclaimer still on the page is the one under the results
> gallery (`RESULTS.disclaimer`, gated by `SHOW_RESULTS_DISCLAIMER`),
> which covers the photography but not the page's claims generally.
> Worth raising with whoever handles DHA advertising approval before
> traffic runs — restoring it is one paragraph in `Footer.tsx`.

### The map

Keyless Google embed (`output=embed`) — no API key, no billing, no
consent banner, lazy-loaded.

**The pin is labelled "Kasaesthetic Clinic" and sits on the clinic's own
coordinates.** Getting both at once needs `q` *and* `ll` together — this
was tested side by side, and only the last form works:

| Embed URL | Result |
|---|---|
| `q=lat,lng` | Right spot, pin shows raw coordinates |
| `q=lat,lng (Label)` | Suffix ignored — bare pin |
| `q=Name` | **Drifts** — lands on a differently-named clinic a street away |
| **`q=Name` + `ll=lat,lng`** | **Labelled pin, clinic's own coordinates** |

`q` names the marker, `ll` fixes where it sits. Don't drop `ll` — a
name-only query re-resolves against Google's listings on every load.

**The whole map is the directions link.** Clicking the pin, or anywhere
around it, opens Google Maps directions and hands off to the native app on
mobile — which is why there's no separate "Get directions" link. The
trade-off is that the map can't be panned in place; for a footer map whose
job is "where is this, and take me there", that's the right way round.

The click overlay stops short of the bottom strip so Google's logo and
"Map data" links stay clickable, as their embed terms require.

> **Three things will silently break it, all already hit:**
>
> 1. **Any `mix-blend-*` layer over it.** A cross-origin iframe composites
>    in its own process; a blend layer spanning it makes the map fail to
>    paint entirely — it loads, reports the right size, renders nothing.
>    This is why the footer does **not** use the `grain` class and the
>    warm wash uses a plain alpha gradient.
> 2. **No intrinsic `width`/`height`.** Google's embed reads its size once
>    at load, and a lazy iframe is 0×0 until it scrolls in — without the
>    attributes it renders the map into a tiny corner box and never
>    reflows.
> 3. **Using `SITE.mapUrl` for directions.** That share link resolves to a
>    Google *search results* page, not the map. `MAPS.directions` uses the
>    documented Maps URL API instead.

Google's embed paints an "Open in Maps" chip top-left with no parameter to
suppress it, so the iframe is grown by `CHIP_CROP` and pushed up, and the
container clips it. **Only the top is cropped** — attribution lives along
the bottom and must stay visible.

> **The street address is still outstanding.** `SITE.addressLines` is
> empty on purpose: an earlier value read off a text-searched Google
> listing sat on a different street from the coordinates the clinic later
> supplied, so one of them was wrong. Coordinates are authoritative, so
> the map is right either way — but nothing is printed until the real
> address arrives. Add it and it appears in the footer *and* as
> `streetAddress` in the structured data automatically.
>
> The coordinates already feed `GeoCoordinates` into that structured data,
> so local search has the location regardless.

Only surface on the page dark enough for the white clinic logo — the nav
uses the ink recolour instead (see the image pipeline in the README).

---

## Other routes

| Route | File | Notes |
|---|---|---|
| `/` | `next.config.ts` | 307 redirect to `/buccal-fat-removal` |
| `/buccal-fat-removal` | `app/buccal-fat-removal/page.tsx` | The landing page. Statically prerendered |
| `/api/lead` | `app/api/lead/route.ts` | Form handler. `deliver()` is still a stub |
| `/icon.png` | `app/icon.png` | Favicon — generated by the image pipeline |
| Any 404 | `app/not-found.tsx` | Branded, `noindex`, offers the landing page or a call |

**The 404 is branded on purpose.** Next's default is an unstyled "This
page could not be found", which on a site running paid traffic reads as
broken — a visitor who mistypes or follows a stale ad link just leaves.

**The favicon is the logo's circular monogram only**, in ink on a
transparent background. At 16px a full lockup is an illegible smear. Its
crop box (432,34 → 195×195) was found by scanning the source logo for
horizontal bands of opaque pixels — regenerate with `npm run
prepare-images`, never by hand.

> Transparent + near-black means low contrast on browsers with a dark tab
> strip. If that proves a problem, put the espresso-deep plate back rather
> than lightening the mark — see `scripts/prepare-images.mjs`.

---

## Auditing the whole thing

`scratchpad/qa/audit.mjs` checks every route plus the landing page for
dead anchors, unnamed links and buttons, broken images, missing alt text,
unlabelled form controls, `target="_blank"` without `rel="noopener"`,
metadata, structured-data parsing, heading order and horizontal overflow.

**Run it against a production build, not the dev server.** The dev server
compiles routes on demand, and across ~16 sequential page loads that
contention makes scroll-reveal checks report false failures. Same scripts
against `next start` come back clean.

```bash
npm run build && npx next start -p 3100
BASE=http://localhost:3100 node scratchpad/qa/audit.mjs
```

---

## Cross-cutting things worth knowing

### Never pass `py-*` or `mb-*` through `className`

`Section` emits its own padding, `SectionHead` its own margin. A second
utility of the same type sits at **equal specificity**, so the winner is
decided by stylesheet order, not the order you wrote it. It silently does
nothing about half the time.

Use `padding="tight" | "default" | "none"`. For components that can't take
the prop (they need a `ref`), import `PADDING` from `Section.tsx`.

This same trap has bitten three times: the nav CTA showing on mobile, the
eyebrow font changing, and the credentials padding not applying.

### Base CSS lives in `@layer base`

In `globals.css`. Unlayered CSS beats *every* layered rule, so a bare
`h2 { font-family: display }` outside a layer would defeat a `font-sans`
class on that element.

### Scroll reveals use `amount: "some"`

In `lib/motion.ts`. Every fractional threshold stranded content at the
bottom edge of the viewport — a tall paragraph landing there has only a
few pixels inside the root and never crosses a 0.15 or 0.25 ratio, so it
stays invisible until the next scroll. That hit real users arriving via
anchor links.

Since sections are sized to fit one screen, content sits against that
edge often. `scratchpad/qa/anchor-reveal.mjs` guards this.

### Don't use clip-path for scroll reveals

`whileInView` reads the *computed* clip-path as its origin, and browsers
normalise `inset(0 0 100% 0)` to a shorter argument list that no longer
matches the target — so the tween silently never runs. Use
`components/lp/ImageReveal.tsx`, which wipes a curtain with `scaleY`.

### Images are generated, not hand-placed

`scripts/prepare-images.mjs` derives every asset from the source artwork
and writes `lib/generated/images.ts` with dimensions and blur
placeholders. **Never hand-edit that file** — re-run `npm run
prepare-images`.

Crop rectangles in the script are pixel coordinates measured from the
specific source files. New artwork means re-measuring.

---

## Building pages 2–4

1. `cp -r app/buccal-fat-removal app/<new-slug>`
2. Rewrite `content.ts` — every word is there
3. Update `page.tsx`: title, description, JSON-LD `MedicalProcedure`
4. Add the new artwork to `scripts/prepare-images.mjs`, re-run it
5. Drop or reorder sections as the procedure needs
6. Copy this file to `docs/pages/<new-slug>.md` and adjust

The shared kit (`components/lp/`), the palette, the motion vocabulary and
the whole form + tracking stack carry over untouched.
