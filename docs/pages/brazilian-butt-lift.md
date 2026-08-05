# Page reference — `/brazilian-butt-lift`

The second landing page. It is the buccal fat page's structure, section for
section, with different copy and different photography.

**Read [`buccal-fat-removal.md`](buccal-fat-removal.md) first.** Everything
that page documents about the shared kit — the nav and its mobile menu, the
padding rhythm, the reviews carousel, the FAQ accordion, the booking form,
the footer and the map, the cross-cutting traps — applies here unchanged and
is not repeated. **This file documents only what is different**, and why.

**All copy lives in one file:** `app/brazilian-butt-lift/content.ts`.
For a wording change, that's the only file you need.

**Section order and composition:** `app/brazilian-butt-lift/page.tsx`.

**Source brief:** `../brazilian-butt-lift/BBL - LP Content.docx`.

---

## At a glance

Padding is written `desktop / mobile` (the breakpoint is `sm`, 640px).
Measured at 1440×900 with reduced motion.

| # | Section | File | `id` | Tone | Padding | Height @1440 |
|---|---|---|---|---|---|---|
| 1 | Hero | `sections/Hero.tsx` | `top` | ivory + photo | 70 / 0·28 | 762 |
| 2 | Trust strip | `sections/Stats.tsx` | — | espresso | 0 | 152 |
| 3 | Credentials | `sections/Assurance.tsx` | — | sand | 68 / 44 | 512 |
| 4 | What is a BBL | `sections/Procedure.tsx` | `procedure` | ivory | 68 / 44 | 727 |
| 5 | How it's performed | **`sections/Steps.tsx`** | — | sand | 68 / 44 | 940 |
| 6 | Benefits | `sections/Benefits.tsx` | `benefits` | ivory | 68 / 44 | 820 |
| 7 | Am I a candidate | `sections/Candidate.tsx` | `candidate` | sand | 68 / 44 | 838 |
| 8 | Meet Dr. Luis | `sections/Surgeon.tsx` | `surgeon` | espresso | 68 / 44 | 1251 |
| 9 | Before & after | `sections/Results.tsx` | `results` | ivory | 68 / 44 | 1471 |
| 10 | Reviews | `sections/Reviews.tsx` | `reviews` | sand | 68 / 44 | 802 |
| 11 | FAQ | `sections/Faq.tsx` | `faq` | ivory | 68 / 44 | 1173 |
| 12 | Booking | `sections/Booking.tsx` | `book` | espresso-deep | 68·44 / 44·30 | 824 |
| — | Footer | `components/lp/Footer.tsx` | — | espresso-deep | 44 / 30 | 454 |

Same twelve sections, same order, same tone alternation. Two files differ
from the buccal page by more than their imports: **`Steps.tsx`** (which
replaces `Anatomy.tsx`) and **`Results.tsx`**. Everything else is the same
component reading different content.

The page is 10.8k tall at 1440 against the buccal page's 10.3k. Most of the
difference is section 5, where four steps and a recovery panel run taller
than the buccal page's three.

---

## The image manifest is namespaced now

This is the one change that reaches back into the live page, so it is worth
knowing before anything else.

`lib/generated/images.ts` used to export a single flat `IMAGES` object with
every asset in it, all served from `/buccal-fat-removal/`. It now exports
three:

| Export | Public path | Holds |
|---|---|---|
| `SHARED` | `/shared/` | The clinic and the surgeon — `logo-white.png`, `logo-ink.png`, `dr-portrait.jpg`, `dr-surgery.jpg`, the six `affil-*.png` |
| `BUCCAL` | `/buccal-fat-removal/` | That page's own photography |
| `BBL` | `/brazilian-butt-lift/` | This page's own photography |

The split is not cosmetic. Two things forced it:

1. **Both pages define `hero-bg.jpg`.** A flat manifest cannot hold two, and
   a bare string key can no longer say which one a caller means — which is
   why `lib/pages.ts` now stores the asset object rather than a key.
2. **The shared kit has no page context.** `Nav` and `GlowLogo` render on
   every route and take no props. Leaving the logo in the buccal bucket
   would have had this page fetch `/buccal-fat-removal/logo-ink.png`.

`scripts/prepare-images.mjs` writes all three from one run; `into("bbl")`
switches which bucket `emit` writes to. Adding page 3 is a bucket in `DIRS`
and a block at the bottom.

---

## 1. Hero — `sections/Hero.tsx`

Identical to the buccal hero. The only difference is the photograph:
`BBL["hero-bg.jpg"]`, derived from `Images/Hero Image.png` and capped at
1000px like its counterpart, because it is still the LCP element.

It is a **3:2 landscape** where the buccal source is a 3:4 portrait, and the
hero absorbs that without a change: the container is repositioned per
breakpoint and the image is `object-cover`, so the crop moves rather than
the layout. The section comes out 93px taller than the buccal hero simply
because the lede runs to three lines at this width.

---

## 2–3. Trust strip and credentials

Same components. Two content notes, both about not inventing facts the
brief doesn't contain:

**The fourth stat is an operating time, not a recovery time.** The buccal
page runs `4-5 Days / Typical recovery`. The BBL brief says only that
patients "gradually return to light daily activities within a few weeks",
which is not a number — so the slot holds `3-5 Hours / Typical procedure`,
which the brief does state, and `Zero / Implants used` closes the row.

**The fourth credential changed.** "Patient-Centred Safety Standards" became
"Care That Continues After Surgery", because that is what this brief
actually evidences: it returns to post-operative monitoring and follow-up
three separate times.

---

## 4. What is a BBL — `sections/Procedure.tsx`

Unchanged component. The theatre photograph is now `SHARED["dr-surgery.jpg"]`
— the same file the buccal page uses, emitted once.

---

## 5. How it's performed — `sections/Steps.tsx`

**This is the one section rebuilt rather than re-copied.** It replaces
`Anatomy.tsx`, and the file is renamed because there is no anatomy in it.

### What was dropped, and why

The buccal version puts a gold locator ring on a medical illustration and
travels it between three measured stops — `x: 7.35, y: 64.07` is where the
buccal fat pad actually sits in that artwork, found by scanning its alpha
channel.

There is no equivalent illustration for this procedure, and the clinic
supplied none. A ring on an editorial photograph points at nothing, and
drawing an anatomical diagram to put one back would mean inventing anatomy
on a medical page. So the ring is gone and the slot holds a photograph —
`BBL["steps.jpg"]`, the dark interior shot, dark on purpose so it doesn't
compete with the four steps beside it.

### What was kept

Everything else about the behaviour: the self-playing stepper, `DWELL` of
5200ms, pause on hover or focus, click to restart the dwell, the timer only
running while the section is on screen, and the per-step progress hairline.

The progress rail stays too, but its stops are now **evenly spaced**
(`left: (i / last) * 100%`) rather than aligned to features in the artwork.
That is honest: it is a position indicator for four steps, not a map of the
image above it.

### Four steps, not three

The brief describes four distinct stages — anaesthesia and duration, donor
sculpting, purification and placement, garment and discharge — and merging
any two loses either the operating time or the compression garment.

### Recovery spans both columns

`STEPS.note` is the brief's own "Recovery" heading, and it renders as a
full-width strip **below** the grid.

Two reasons, and the second is the one that will bite if you move it back:

- Recovery is not a stage of the operation. Numbering it as a fifth step
  would say the procedure ends where it actually continues.
- The photograph column is ~200px shorter than four steps plus a panel. With
  the note inside the right-hand column, the left column ran out at the
  progress rail and left a visible hole beneath it. Spanning both closes it.
  The same shape is already established by the candidate band's CTA strip.

---

## 6. Benefits — `sections/Benefits.tsx`

Same four-column grid, same one rule that decides its shape (**the
photograph and all six cards have to be on screen together** — see the
buccal doc). Two differences:

**The icon set.** Four shapes carry over; `waist` (an hourglass) and
`balance` (a beam and fulcrum) are new, because an hourglass has no facial
equivalent. Same drawing conventions — 24px box, 1.5 stroke, no fills — so
the two pages' cards read as one system.

**The crop.** `BBL["benefits-portrait.jpg"]` is a 3:2 landscape, not a 4:5
portrait, so both the stacked 5:4 box and the tall desktop cell crop it
*horizontally*. Only the horizontal value in `object-[56%_50%]` is doing any
work — the vertical is inert. 56 rather than 50 because the subject stands
right of centre against an empty wall.

### The six cards are derived, not supplied

The brief has no benefits list. Every card restates something the brief
asserts elsewhere — the FAQ, the candidate list, the "why patients travel"
section — and nothing else. Worth preserving if you edit them.

In particular, the longevity card says **"Long-lasting with a stable
weight"**, not "permanent". The brief is precise about this: *a portion* of
the transferred fat establishes a blood supply, and a stable weight
preserves it. The buccal page can say "permanent" because removed fat cells
don't come back; this page cannot, and shouldn't.

---

## 7. Am I a candidate — `sections/Candidate.tsx`

One structural difference: **`CANDIDATE.intro` is an array here**, rendered
with a `map`, where the buccal page's is a single string. The brief splits
this section into two paragraphs — who it is for, then what the consultation
decides — and running them together buries the second, which is the honest
half.

---

## 8. Meet Dr. Luis — `sections/Surgeon.tsx`

Unchanged component. Portrait and affiliation logos both come from `SHARED`,
so the ribbon is byte-identical across pages. The per-logo `height` values
in `SURGEON.affiliations` are copied deliberately — see the buccal doc for
why they are not all the same number, and why a seventh logo makes the row
wrap.

Copy differs: the intro and the three "why patients travel" paragraphs are
the brief's, verbatim, and the pull quote is "Proportion, never simply
size."

---

## 9. Before & after — `sections/Results.tsx`

The section with the most changes, all driven by what the clinic supplied.

**Everything in this section comes from the clinic's `B A` folder.** Six
files, six uses: one leads as the featured comparison, five fill the
gallery. Nothing is sourced from `Images/`.

### There is no drag slider here

The buccal page's featured slot is a `<BeforeAfterSlider>`, and that needs
the before and after as two separate, equally sized files. No image in
`B A` can supply them. Measured — scoring every column by the *median*
row-to-row difference, so one high-contrast row can't fake a seam:

| File | Seam | Why it can't be split |
|---|---|---|
| `(20)` | none (score 8) | Both photographs sit on one continuous black backdrop with "NICOLE ECHEVERRY" spanning the join. There is no edge to cut on |
| `(21)` | x313, weak (21) | A real tonal step, but the clinic's crown mark and "LUIS FERNANDO REYES" straddle it — a split leaves half a crown and "…S FERNANDO R" |
| `(25)` | x350, hard (131) | Splits cleanly. It is also the intra-operative photograph |
| `(26)` | x371, hard (296) | Splits, but into unequal halves, and it is not a confirmed pair |

Cutting a clinic watermark in half to feed a slider is not a trade worth
making, and the one file that does split is the one image on the page you'd
least want blown up as the lead. So the slot holds `(21)` **whole**, as a
large static card, with the header rule above it kept exactly as it was.

**Consequence worth knowing:** `slider_interact` never fires on this page.
The event contract in `lib/analytics.ts` is shared across pages, and a page
with no slider simply doesn't emit one of its events. Nothing to fix.

The column split changes with it — `1.15fr` here against the buccal page's
`0.82fr` — because this is a 1.84:1 landscape and that is a portrait. At
`0.82` the card renders ~470×255 and the pair stops being readable; `1.15`
lands near 640×347 and still leaves the reading guide ~475px.

No Before/After pills on this one either: the clinic burnt its own labels
into the photograph, and a second set over the top would label each half
twice. (Its "Before" is clipped to "ore" at the left edge — that is in the
supplied file, not the crop.)

### The gallery labels each card

Five cards, all 700×380, resized only.

> **It used to be twelve, then six.** Six pairs cut out of a grid composite
> in `Images/` led the list, and the featured slot was a slider cut from the
> same grid. The clinic asked for the before/after to come from `B A` and
> nothing else, so no part of this section is sourced outside that folder
> now. The grid is still on disk and `prepare-images.mjs` still records
> where its separators are, but nothing reads it.

**Flex wrap, not grid.** Five cards in three columns leaves an orphan row of
two, and CSS grid cannot centre it — `justify-content` centres the *track
set*, so the two stay in columns 1 and 2 with a hole on the right. Flex lays
out row by row, so `justify-center` puts the trailing pair under the gap
between the three above. The `basis` widths reproduce the grid's columns
arithmetically because they have to do the job `grid-cols` was doing.

The tags come from each card's own `kind` in `GALLERY`, not from a rule
applied to the whole gallery:

- `pair` → **Before** left, **After** right
- `result` → a single **Result** tag, and deliberately not "After" — a
  single photograph with nothing to compare it to has no "before", and
  labelling one implies a comparison the visitor is never shown

Three of the supplied cards are single post-operative photographs, which is
why the distinction exists at all.

### Three things for the clinic to confirm

1. **`ba-4`** — the two dress photographs — is labelled `result`, not
   `pair`. Both halves read as post-operative and neither carries a "before"
   marking. If it *is* a before/after, change `kind` to `"pair"` in
   `content.ts`; don't leave it labelled a pair on a guess.
2. **`ba-1`** carries a different surgeon's watermark (**NE / Nicole
   Echeverry**) rather than Dr. Luis's. It is presumably from the same
   practice, but it is the only card on the page not branded to him.
3. **`ba-3`** is an intra-operative photograph — a patient on the table
   beside the healed result. It is a legitimate before/after; it is also the
   most clinical image on a consumer landing page.

### `area` is copy, not decoration

The pairs are waist and abdomen. That is the donor site, and sculpting it is
half of what a BBL does, so they belong here — but `area` says so, and the
alt text says so, because calling them buttock results would not be true.

Worth stating plainly for whoever picks this up: **no image on the page now
shows a buttock before and after.** The only source that did was the grid,
and it is out. If the clinic wants gluteal before/afters back, they need to
come from `B A` — which means new files in that folder, not a code change.

---

## 10–12. Reviews, FAQ, Booking

Unchanged components.

**The reviews finally match the page.** These are the same five the buccal
page carries, and there they are body-contouring testimonials on a facial
procedure. Here they describe gluteal biopolymer removal, liposculpture with
hip and gluteal augmentation, and body contouring — which is what this page
is about. They are reordered so the two most relevant lead.

Still true, and still worth reading before traffic runs: none was performed
in Dubai, two name "Majestic" rather than the Dubai clinic, and **DHA
advertising rules restrict patient testimonials in healthcare marketing**.
Get this section through the same approval as the rest of the copy.

The FAQ carries all nine questions from the brief, verbatim, and feeds the
`FAQPage` JSON-LD in `page.tsx`.

---

## Things that were changed *outside* this page

Adding a second page made three things that were correct wrong:

| What | Where | Why |
|---|---|---|
| The WhatsApp prefill named buccal fat removal | `lib/site.ts` → `whatsappHref` | Every WhatsApp button lives in the shared chrome, which has no page context, so BBL visitors were greeted with the wrong procedure. Now procedure-neutral, and it has to stay that way unless the wording is threaded down as a prop |
| The 404 sent everyone to `/buccal-fat-removal` | `app/not-found.tsx` | With more than one page, picking one is a guess. It points at `/`, which lists them all |
| The verify scripts were hardcoded to one slug | `scripts/verify-*.mjs` | All four now take the slug as a second argument, defaulting to `buccal-fat-removal` |

---

## Verifying

```bash
npm run build && npm run start

node scripts/verify-conversion.mjs  http://127.0.0.1:3000 brazilian-butt-lift
node scripts/verify-mobile-menu.mjs http://127.0.0.1:3000 brazilian-butt-lift
node scripts/verify-reviews.mjs     http://127.0.0.1:3000 brazilian-butt-lift
node scripts/verify-phones.mjs      http://127.0.0.1:3000 brazilian-butt-lift
```

All four pass on this page as built. **Run the conversion one after any
change to the form or the thank-you route** — each page has its own form and
its own `/thank-you`, so passing on one proves nothing about the other. The
event it asserts carries `form_location: "brazilian-butt-lift"`, which is
what distinguishes the two pages' leads in GTM.

Kill any old server on the port first — a stale process serves a stale CSS
chunk and the page renders completely unstyled.

### Changing an image without changing its filename

`npm run prepare-images` writing different bytes to the same name is not
enough to see the change locally. Next's image optimiser caches by request
URL under `.next/cache/images`, and `/_next/image?url=…%2Fba-1.jpg` is the
same URL whatever `ba-1.jpg` now contains — so `next start` keeps serving
the **old** picture from cache, correct markup and all.

This is exactly how it looks when it happens: right number of cards, right
Before/After tags, wrong photographs underneath them.

```bash
rm -rf .next/cache/images && npm run build && npm run start
```

Local only. A deploy builds a fresh image with no cache to go stale, so
production never sees it — which is what makes it easy to mistake for a
real bug.
