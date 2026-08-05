# `/` — the index

`app/page.tsx`. One dark band listing every landing page on the subdomain.

Campaigns link straight to `/<slug>`, so **no visitor arrives here from an
ad**. It exists so the clinic, and whoever picks the work up next, has one
address that shows what's live.

---

## What replaced what

`/` used to 307 to `/buccal-fat-removal`, configured in `next.config.ts`.
That was fine while there was one page; with four it has to pick a
favourite and hides the rest. The redirect is gone and the route is now a
statically prerendered page.

If you ever want the old behaviour back, put the rule back in
`next.config.ts` — a redirect there wins before this route is reached.

---

## Adding a page

**Everything the index shows comes from `lib/pages.ts`.** Add an entry and
the card appears; nothing in `app/page.tsx` needs touching.

```ts
{
  slug: "…",              // must match the route folder
  eyebrow: "…",           // the category, not the procedure
  title: "…",
  blurb: "…",             // one sentence, what the visitor gets
  image: BBL["hero-bg.jpg"],   // from that page's image manifest
  status: "live",         // or "planned"
}
```

`image` is the asset itself, taken from the page's own manifest in
`lib/generated/images.ts` (`BUCCAL`, `BBL`, …), so a thumbnail that hasn't
been through the pipeline fails the build instead of shipping a broken
card. Run `npm run prepare-images` after dropping the source file in.

It used to be a bare key, typed `keyof typeof IMAGES`, back when one flat
manifest held every asset. That stopped working the moment there was a
second page: both define `hero-bg.jpg`, so the string could no longer say
which file it meant.

`status: "planned"` renders a greyscale, unclickable card with an "In
progress" pill — visible roadmap without a dead link. Use it only for pages
actually committed to, not a wishlist.

### The grid reshapes itself

```ts
const GRID  = ["", "", "sm:grid-cols-2", "sm:grid-cols-2 lg:grid-cols-3"];
const WIDTH = ["", "max-w-[430px]", "max-w-[840px]", "max-w-[1140px]"];
```

Indexed by page count, capped at 3. A fixed three-column grid holding one
card renders it a third of the width with two empty cells beside it, which
reads as a broken layout rather than a short list. At four pages this
settles into 2×2.

---

## Why it's dark

The landing pages lead with ivory. This one is espresso-deep because it's a
gateway rather than a pitch — the same treatment the 404 and the footer
already use, so it's a palette the site already owns.

## What it borrows

Three kit pieces that had no competition on this page:

- **`<Aurora>`** — the vertical light columns, written for the hero and
  unused since the photograph took that job. Its columns had to stay
  *below* ivory in lightness to read as warm light rather than a white
  smear on a near-white panel. On espresso-deep that constraint works in
  its favour: gold, champagne and blush are all far lighter than the
  ground, so they genuinely glow. It takes no props — no change was needed.
- **`<MaskedHeading immediate>`** — the signature entrance.
- **`<TiltCard>`** — from the benefits grid. It carries the card shell and
  the `group`, because its cursor glow is keyed off `group-hover`. Renders
  a plain div on touch, so phones get a static card with no listeners.

### `accent-sheen` outside the hero

The utility is commented "hero-only", on contrast grounds: gold is 3.06:1
on ivory, only just clearing the large-text minimum, so the travelling
glint had to be kept narrow. On espresso-deep gold sits near **4.4:1** and
the glint moves *toward* champagne — lighter, not washed out. The
constraint that made it hero-only doesn't bind here.

---

## Two things that will bite

**`noindex, follow`.** This is a thin directory on an ads subdomain.
Indexing it would put it into results competing with the practice's own
site, and Ads doesn't need it. `follow` is kept so crawlers still reach the
landing pages through it. Flip to `index: true` only if this subdomain is
ever meant to rank.

**The body's 76px bottom padding.** `globals.css` reserves it below 640px
for the sticky mobile CTA bar:

```css
@media (max-width: 640px) { body { padding-bottom: 76px } }
```

There is no sticky bar here, so nothing covered it and it rendered as a
bare ivory strip under the footer line. `main` carries
`max-[640px]:-mb-[76px]` to paint over the reserved space, rather than
changing the global rule — the landing page still needs it.

The breakpoint is written as an exact arbitrary value on purpose:
Tailwind's `max-sm` is `max-width: 639px` and the globals rule is `640px`,
which leaves a one-pixel window where the strip comes back.

**Any future page without a sticky bar needs the same line.**

---

## Verifying

```bash
npm run build && npx next start -p 3100
BASE=http://localhost:3100 node scratchpad/qa/audit.mjs
```

Kill any old server on the port first — see the note in
`docs/pages/buccal-fat-removal.md`, a stale process serves a stale CSS
chunk and the page renders completely unstyled.

Measured at 390×844 and 1440×900: no horizontal overflow, no broken
images, one `h1`, no heading jump, body height equals `main`'s.
