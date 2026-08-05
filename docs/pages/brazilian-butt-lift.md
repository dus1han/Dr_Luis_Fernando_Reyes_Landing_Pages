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
| 9 | Before & after | `sections/Results.tsx` | `results` | ivory | 68 / 44 | 2344 |
| 10 | Reviews | `sections/Reviews.tsx` | `reviews` | sand | 68 / 44 | 802 |
| 11 | FAQ | `sections/Faq.tsx` | `faq` | ivory | 68 / 44 | 1173 |
| 12 | Booking | `sections/Booking.tsx` | `book` | espresso-deep | 68·44 / 44·30 | 824 |
| — | Footer | `components/lp/Footer.tsx` | — | espresso-deep | 44 / 30 | 454 |

Same twelve sections, same order, same tone alternation. Two files differ
from the buccal page by more than their imports: **`Steps.tsx`** (which
replaces `Anatomy.tsx`) and **`Results.tsx`**. Everything else is the same
component reading different content.

The page is 11.7k tall at 1440 against the buccal page's 10.3k. Almost all
of the difference is the results gallery: twelve cards instead of six.

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

### The featured comparison, and its one compromise

The drag slider needs before and after as two separate, equally sized files.
Nothing in the `B A` folder splits cleanly — three of those files are
continuous composites with the clinic's watermark centred **across** the
join, so cutting them in half cuts the watermark in half.

What does split is the 6-pair grid filed under `Images/`
(`ChatGPT Image Jul 25, 2026, 04_23_19 PM.png`), which is also the only
source on this page showing the buttocks before and after. Its separators
were measured, not estimated — columns that are ≥60% near-white:

```
x 253-256   766-769   1290-1293   ← the "→" glyph, INSIDE a pair
x 512-516   1024-1028              ← plain gutter, BETWEEN pairs
y 510-514                          ← the row split
```

The arrow does **not** sit in the white gutter; it bleeds into both
photographs, spanning x 239–273. So the slider halves are taken outside the
glyph — 0–238 and 274–511 — and cropped to 238×298 (waist to mid-thigh)
rather than used at full height, because a 238×509 half makes the slider
twice as tall as the reading guide beside it.

**238px of source is everything the clinic has.** The featured column is
narrowed to `0.66fr` (the buccal page gives its slider `0.82fr`) so it lands
at ~380px — a 1.6× upscale, which a photograph carries. A wider column would
only stretch it further. Fixing this properly needs new source art, not a
different crop.

### The gallery labels each card

Twelve cards: six square pairs cut from the grid on the *between-pair*
gutters (each keeps its own arrow — the arrow is what tells a visitor which
half is which), then the six 700×380 cards from the `B A` folder, resized
only. Squares first so each row of the three-column grid holds one shape.

The tags come from each card's own `kind` in `GALLERY`, not from a rule
applied to the whole gallery:

- `pair` → **Before** left, **After** right
- `result` → a single **Result** tag, and deliberately not "After" — a
  single photograph with nothing to compare it to has no "before", and
  labelling one implies a comparison the visitor is never shown

Three of the supplied cards are single post-operative photographs, which is
why the distinction exists at all.

### Three things for the clinic to confirm

1. **`ba-10`** — the two dress photographs — is labelled `result`, not
   `pair`. Both halves read as post-operative and neither carries a "before"
   marking. If it *is* a before/after, change `kind` to `"pair"` in
   `content.ts`; don't leave it labelled a pair on a guess.
2. **`ba-7`** carries a different surgeon's watermark (**NE / Nicole
   Echeverry**) rather than Dr. Luis's. It is presumably from the same
   practice, but it is the only card on the page not branded to him.
3. **`ba-9`** is an intra-operative photograph — a patient on the table
   beside the healed result. It is a legitimate before/after; it is also the
   most clinical image on a consumer landing page.

### `area` is copy, not decoration

Cards 7–9 are waist and abdomen. That is the donor site, and sculpting it is
half of what a BBL does, so they belong here — but `area` says so, and the
alt text says so, because calling them buttock results would not be true.

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
