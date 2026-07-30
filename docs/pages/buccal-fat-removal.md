# Page reference — `/buccal-fat-removal`

A section-by-section guide for changing this page later. Every section
lists its file, which content keys it reads, how it's laid out, what
animates, and what will bite you if you change it.

**All copy lives in one file:** `app/buccal-fat-removal/content.ts`.
For a wording change, that's the only file you need.

**Section order and composition:** `app/buccal-fat-removal/page.tsx`.

---

## At a glance

Padding is written `desktop / mobile` (the breakpoint is `sm`, 640px).

| # | Section | File | `id` | Tone | Padding | Height @1440 |
|---|---|---|---|---|---|---|
| 1 | Hero | `sections/Hero.tsx` | `top` | ivory + photo | 70 / 0·28 | 669 |
| 2 | Trust strip | `sections/Stats.tsx` | — | espresso | 0 | 152 |
| 3 | Credentials | `sections/Assurance.tsx` | — | sand | 68 / 44 | 488 |
| 4 | What is buccal fat | `sections/Procedure.tsx` | `procedure` | ivory | 68 / 44 | 727 |
| 5 | How it's performed | `sections/Anatomy.tsx` | — | sand | 68 / 44 | 584 |
| 6 | Benefits | `sections/Benefits.tsx` | `benefits` | ivory | 68 / 44 | 820 |
| 7 | Am I a candidate | `sections/Candidate.tsx` | `candidate` | sand | 68 / 44 | 707 |
| 8 | Meet Dr. Luis | `sections/Surgeon.tsx` | `surgeon` | espresso | 68 / 44 | 1251 |
| 9 | Before & after | `sections/Results.tsx` | `results` | ivory | 68 / 44 | 1838 |
| 10 | Reviews | `sections/Reviews.tsx` | `reviews` | sand | 68 / 44 | 847 |
| 11 | FAQ | `sections/Faq.tsx` | `faq` | ivory | 68 / 44 | 1024 |
| 12 | Booking | `sections/Booking.tsx` | `book` | espresso-deep | 68·44 / 44·30 | 676 |
| — | Footer | `components/lp/Footer.tsx` | — | espresso-deep | 44 / 30 | 547 |

Every section from 3 to 12 is on the same rhythm. Keep it that way — a
section left on the old 100px puts 168px of dead space against its
neighbour, which reads as a gap rather than a break.

### The rhythm is not one number

`PADDING.tight` is `py-[44px] sm:py-[68px]` — **68px on desktop, 44px on
phones**, and the two are not a ratio of each other.

68 top and bottom puts 136px between sections. On a 1440px canvas that's
a breath; on a 390px phone the same 136px is a third of the viewport and
reads as a hole rather than a break. Mobile was on 58px and it was still
too loose. 44 is the value where a phone boundary (85–108px of visual gap,
measured ink-to-ink) sits in proportion to the content beside it.

**Do not "simplify" this back to a single number.** Desktop is signed off
at 68 and must not move. Page height at 1440 is **10390px**; treat a change
there as a regression unless a section was deliberately restructured.

#### The hero is the one exception: 28px, not 44

It's the only band that ends on a full-width button pair, and a button is
not a line of text. It already carries 17px of its own padding, and the
secondary button's hairline border is a weak edge, so 44px below it read
as a hole — especially against the 12px holding the two buttons together
and the 28px above them. At 28 the pair is framed evenly.

That makes hero→trust-strip the tightest boundary on the page (69px) and
that is correct: the hard ivory→espresso tone change marks it. Padding
only has to do that work where both sides share a tone.

Trailing space under a **button** always needs less than under text.
Apply the same reasoning if another band ends on a CTA.

### Trailing padding under a divider that isn't drawn

Two mobile bands lost measurable dead space to the same bug, and it will
recur wherever a list uses hairline dividers:

- `Assurance.tsx` — rows are `border-b … py-6 last:border-0`
- `Anatomy.tsx` — steps are `border-b … last:border-0`, button `py-3`

The last row drops its divider but **keeps its bottom padding**. That
padding is no longer separating two rows from each other; it just stacks
onto the section's own padding. Assurance was carrying 24px of it and
Anatomy 12px, so those two boundaries measured 126px and 120px against a
94px norm.

Fixed with `last:pb-0` (Assurance) and `max-lg:last:[&>button]:pb-0`
(Anatomy) — both scoped to the stacked layout only, because from `sm`/`lg`
those items are grid columns with `py-0` and the trailing padding doesn't
set the section height. Boundaries are now 102px and 108px.

**If you add a hairline-divided list, add the `last:` padding reset with
it.**

### Two rules that hold across the page

**Tones must alternate.** No two adjacent sections share a background,
or they read as one continuous block. If you reorder anything, re-check
the whole run: ivory → sand → ivory → espresso → …

**Sections are sized to fit one screen** (~700px at 1366×768) wherever
the content allows. Reviews, FAQ, Booking and Before & after are
legitimately taller because of how much they hold.

---

## 1. Hero — `sections/Hero.tsx`

Built around the photograph, framed differently at each breakpoint.

- **Content:** `HERO` — `eyebrow`, `kicker`, `headline` (2 lines), `lede`, `primaryCta`, `secondaryCta`
- **Image:** `hero-bg.jpg`, from `hero.png` (a 3:4 portrait)
- **Animation:** headline rises out of a clipping mask on load; the gold
  accent word carries a travelling sheen (`.accent-sheen` in `globals.css`);
  the photo drifts on scroll

### The two layouts

| | Photo | Copy |
|---|---|---|
| **Phones** | Top `40svh`, full bleed, bottom edge feathered to ivory | *Below* the photo, on flat ivory, **centred** like every other mobile section |
| **Desktop** | Right 60%, feathered into the ivory at its left edge | Left, over the flat side |

One `<Image>` serves both — the container is repositioned per breakpoint
rather than shipping two files, because this is the LCP element.

> **Why the copy is stacked below the photo on phones, not over it.**
> The copy block is ~500px tall in ~700px of viewport, so floating it
> over the portrait always started it over her face. Making 12px gold
> legible there needed a scrim heavy enough to bury the subject —
> measured at 2.64:1 contrast even with a 74%-opaque scrim. Stacking
> gives the face a clean half and the type a clean half. Don't "fix" this
> by overlaying again.

> **Why the desktop feather clears by 64%.** At 80% her face sat under a
> ~25% wash and read as faded. The image column starts at `left-[40%]`
> and the gradient is fully transparent by 64% of the viewport, so she is
> never seen through a scrim.

Scrims are **ivory, never dark** — the palette is ink-on-ivory, and
darkening the photo to carry white text would fight every other section.

### Performance

Adding the photo made it the LCP element. Measured against a production
build: **1176ms desktop / 884ms mobile**, at **41kb / 29kb** served —
`next/image` delivers AVIF at the right width. It carries `priority` so
it preloads, and `sizes` is honest about the rendered width so phones
never fetch the 1000px original.

`alt=""` is deliberate: it's a decorative background carrying nothing the
copy doesn't already say. Empty alt is the correct marker — an audit that
flags it as "missing alt" is wrong.

### The CTA sits just below the fold on phones

Primary CTA top lands at ~831px against an 844px viewport, so it crests
the fold as a scroll cue. The **sticky bar threshold was lowered from
620px to 340px** to compensate — a booking action is reachable the moment
scrolling starts. If you make the photo taller, lower that threshold too.

> `components/lp/Aurora.tsx` (the vertical light columns) is no longer
> used here — the photograph is the visual interest now. It found a home
> on the root index instead, where its columns sit on espresso-deep; see
> `docs/pages/index.md`.

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

A portrait and six cards in **one grid**: four columns, the photo spanning
both rows on the left.

- **Content:** `BENEFITS.items` — `{icon, title, body}`
- **Image:** `benefits-portrait.jpg`, from `frontfacing.png` (4:5)
- **Animation:** staggered entry; pointer tilt with a gold glow following
  the cursor (`components/lp/TiltCard.tsx`)

**To add a benefit:** add to `BENEFITS.items` and add the icon path to the
`ICONS` map in `Benefits.tsx`. Six fills two rows of three beside the
photo; **seven breaks the layout** — it starts a third row and the section
stops fitting a screen. If a seventh is genuinely needed, cut one.

### The one rule that decides this section's shape

**The photograph and every card have to be on screen together.** That is
the constraint everything else was fitted around, and it is worth knowing
before changing anything here.

Two earlier versions failed it:

| Version | Height @1440 | Why it failed |
|---|---|---|
| Photo sticky at 4:5, cards 2 cols | 1246 | ~330px of bare ivory under the photo, and because it stuck to the viewport top that gap was on screen the whole way down |
| Photo filling the column, cards 2 cols | 1246 | No dead space, but three card rows meant the top of the photo and the last card were never visible at once |
| **Photo spanning 2 rows, cards 3 cols** | **820** | Fits a 900px viewport under the 73px nav |

Three rows of cards is the thing that breaks it. Keep it at two.

### Why the photograph is front-facing

The hero portrait is a three-quarter view, which cannot show what this
section claims. Cheekbone and jawline symmetry only reads head-on.

### What fitting a screen cost

Card width. Three columns beside the photo is 256px against the 364px they
had before the photo arrived, so padding and type came down with it —
`p-[18px]`, 17px titles, 14px body. Those numbers are sized to the column,
not chosen for their own sake; widen the column and they can go back up.

The section head is **inlined rather than `<SectionHead>`**, because its
54px bottom margin is 24px more than this band can spare. Passing `mb-*`
through `SectionHead`'s `className` would have sat at equal specificity
with the built-in one — a coin flip decided by stylesheet order. Inlining
is the honest way to take a different value.

Mobile came out *shorter* than before the photo existed: 1757px against
2012px, because the compaction more than paid for the image.

### How the photo is sized

Its cell is `lg:col-span-1 lg:row-span-2`; the div inside is
`lg:absolute lg:inset-0`. So the photo is sized by the two card rows, never
the other way round — 387×501 at 1440, which is 1:1.29 against a 4:5
source and barely a crop at all.

> **No `items-start` on that grid.** It sizes each cell to its own content,
> which would collapse the photo cell to zero — it only has an
> absolutely-positioned child. Default `stretch` is what gives it height.
> This is the same trap the surgeon section hit.

> **The cards are direct children of that grid**, not nested in their own.
> They have to be, for the photo's `row-span` to place them around it.
> That's why they use `Reveal` with a per-index delay instead of
> `RevealGroup`/`RevealItem` — nesting them would break the placement.

### The stacked crop is 5:4, and that number matters

It started as a 16:10 band, which looked fine and **cropped the chin
away** — losing half of what the copy beside it claims. 5:4 is the widest
crop that still holds hairline to jaw.

`object-position` is `50% 42%` while stacked and `50% 24%` from `lg`. The
42% puts the window over hairline-to-jaw instead of centring it on the
eyes. From `lg` the column is taller than the source is wide, so cover uses
the full height and the vertical value stops mattering — only the
horizontal 50% does.

> **`alt=""`, deliberately.** This is reference photography, not a patient
> record. Describing it as a result would be a claim the clinic hasn't
> made — the copy beside it carries the meaning. Same treatment as the
> hero.

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
intro, affiliation ribbon, then "why patients travel".

- **Content:** `SURGEON` — `eyebrow`, `headline`, `intro`,
  `affiliations[]`, `whyHeadline`, `why[]`, `pullQuote`, `pullQuoteMeta`
- **Images:** `dr-portrait.jpg`; `affil-*.png` (six)
- **Animation:** curtain reveal, 20s Ken Burns, offset gold frame that
  scales in, parallax drift

### The affiliation ribbon

Six institution marks — Universidad del Rosario, Emory, Universidad de
Buenos Aires, the American Society of Plastic Surgeons, AASMA and FILACP —
on hairlines top and bottom, sitting where three text pills used to.
Universities first, then the societies.

Those pills read "Double board certified", "19+ years international
experience" and "Plastic, aesthetic & reconstructive". **All three were
already in the intro paragraph immediately above them**, so they were
repetition dressed as evidence. The marks make the same claim with
something behind it.

**The logos are recoloured, not used as supplied.** They arrive as line art
that would be invisible on espresso, so `prepare-images.mjs` trims each to
its ink, replaces the RGB with a flat champagne, and normalises them to
144px tall. Only the RGB changes — the original alpha is kept, so
antialiasing and every interior cut in the engraved seals survive.
Monochrome is the usual treatment for an accreditation ribbon; here it's
also the only legible option.

#### One source has no alpha, and that needs a different path

AASMA arrived as a WebP converted to PNG: **three channels, fully opaque,
83% white**. Sent through the same path — "recolour everything that isn't
transparent" — it would emit a solid champagne rectangle, because there is
no transparency to skip.

`onWhite: true` on that entry derives the alpha first, via
`alpha = 255 - min(r, g, b)`: how far each pixel departs from white in *any*
channel.

> **Luminance would be wrong here.** The badge's ink is a saturated cyan
> whose luminance is around 150, so `255 - luminance` renders it at 41%
> opacity — visibly washed out beside the other five. The minimum channel
> gives that same cyan an alpha of 242 while still resolving pure white to 0
> and antialiased edges to a soft ramp.

It has to run **before** the trim, or there is no transparency for the trim
to find and it crops nothing.

A pleasant side effect: the badge's rim lettering was darker than its ring,
so it ends up knocked *out* of the champagne band rather than merging into
it, and stays readable.

**Check any new logo for an alpha channel before adding it.** A flattened
source is not obvious from looking at it — it looks identical in a viewer.

> Trimming has to happen **before** the resize. Without it each logo
> normalises to the height of its transparent padding rather than of its
> artwork, and the row comes out visually ragged even though every file
> is nominally the same height.

> The source folder holds six files. `IMG_3483.PNG` is a byte-identical
> copy of `IMG_3478.PNG` (verified by checksum) and is deliberately not
> emitted.

**Heights are per-logo in `content.ts`, and that is deliberate.** Four are
horizontal lockups; ASPS is stacked and AASMA is a circular badge, and
matching either to the wordmarks' height shrinks its type to nothing. The
values balance them by eye, not by the numbers.

They also have to keep the row on **one line at 1440**, where the column is
670px. Six logos come to 510px plus five 24px gaps — 630px, with 40px
spare. Adding a seventh means shrinking everything again or accepting that
it wraps. Phones wrap it to two rows regardless.

> The `aria-label` sits on a wrapper `<div role="group">`, not on
> `RevealGroup`. That component's props are typed to
> children/className/as/delay/step, so an `aria-*` passed to it would not
> typecheck.

**"Why patients travel" has no rule above it.** It used to — back when the
only thing above it was a row of text pills. The ribbon now closes with
its own hairline, so a second rule below it read as two separators for one
boundary.

**If the ribbon is ever removed, put that rule back** — without either,
the intro and the "why" block run together with nothing marking the
change of subject.

### The gaps either side of the ribbon must match

Both are `mt-14`. They were 32px above and 88px below, which made the band
look stuck to the paragraph above it and marooned from the heading below.

The two numbers came from different places and nobody had compared them:
32 was the pills' old `mt-8`, and 88 was the old `mt-11 + pt-11` that used
to straddle a rule. Removing the rule left the 88 behind with nothing to
justify it.

Measured box-to-box the gaps read 56 above and 50 below, because the
display heading carries ~6px of leading above its cap height. That is the
right kind of imbalance — optically the two look equal.

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
- **Images:** `hero-before.jpg` / `hero-after.jpg` (slider), `ba-1…6.jpg` (gallery)
- **Animation:** slider auto-sweeps once on first view to teach the
  interaction, then yields to the user

### The gallery is the clinic's own photography now

`ba-1…6.jpg` replaced `result-1…6.jpg`, which were cut out of a 4×3
composite of reference art. That composite and its measured gutters are gone
from the pipeline. The new files need no cutting — **each one is already a
complete pair**, watermarked, and in some cases anonymised by the clinic.

**Two shapes, both preserved rather than normalised:** three are 1080×1080
and three are 700×380. Forcing one aspect with `object-cover` would crop
half of a before or an after off the card, which destroys the comparison the
image exists to make. The page orders **squares first** so each row of the
three-column grid holds one shape and comes out even, and the grid is
`items-start` so nothing is stretched away from its own ratio.

> **The centre divider and the Before/After badges were removed.** They were
> right for the old art, which was uniformly side-by-side. On these they
> would be **actively wrong**: two of the six are stacked, so a badge reading
> "After" pinned to the right would sit on the right half of the *before*
> photograph. The caption states the arrangement per card instead — "Before
> above · after below" or "Before left · after right" — which is true of
> every card and is information the visitor needs when the layout varies
> between neighbours.

**The disclaimer is switched off** — `SHOW_RESULTS_DISCLAIMER = false` in
`lib/site.ts`, at the clinic's request. The copy still exists in
`RESULTS.disclaimer` (the word "illustrative" was removed from it when the
gallery stopped being reference art), so flipping the flag restores it
without rewriting anything.

> **Raise this at DHA approval.** The page now shows real surgical
> before/after photography with no qualifying statement beneath it. A
> results-vary line is the usual expectation on medical advertising and is
> cheap insurance; its absence is the kind of thing an approval pass asks
> about.

> **Consent is outstanding.** Some of these are anonymised — eyes masked, or
> cropped below the eyeline — and others show a fully identifiable face.
> That inconsistency is worth resolving before paid traffic: DHA advertising
> rules govern patient imagery, and identifiable clinical photographs need
> documented consent. Flagged in `lib/site.ts` and the launch checklist.

> **Gotcha —** the slider is paired with the reading guide rather than
> centred alone. At 500px in a 1220px shell it left ~360px empty either
> side.

---

## 10. Reviews — `sections/Reviews.tsx`

- **Content:** `REVIEWS.items` — `{quote, name, meta, placeholder?}` (5 real reviews; no placeholders remain)
- **Switch:** `SHOW_PLACEHOLDER_REVIEWS` in `lib/site.ts`

### Layout switches on the count

| Reviews shown | Layout |
|---|---|
| 1 | single card, centred, max 560px |
| 2 | two columns, centred, max 820px |
| 3 | three columns, full width |
| **4+** | **carousel with prev/next** |
| 0 | section returns `null` and disappears |

Threshold is `CAROUSEL_FROM` in the section file. There are currently 5
entries, so the marquee is live.

### These are real reviews now, and they carry two problems

All six written-for-layout entries were replaced with genuine patient
reviews supplied by the clinic, and `SHOW_PLACEHOLDER_REVIEWS` is `false`.
They are reproduced **verbatim, including their typos** — "Juno start" and
"from the begging to end" read as transcription slips, but editing a quote
attributed to a real person misrepresents them. Fix at source or not at
all. Names are the reviewers' own platform handles.

**1 · None of them is about buccal fat removal, and none is from Dubai.**
They describe body contouring at the Colombian practice — gluteal
biopolymer removal, liposculpture with augmentation — and two name
"Majestic" rather than the Dubai clinic. `meta` states each actual
procedure, because labelling them "Buccal fat removal" would be a
fabricated claim on a medical page. The honesty is what makes the mismatch
visible: someone researching a facial procedure reads five testimonials
about bodies. **Facial-surgery reviews would convert better and carry less
risk.**

**2 · DHA advertising rules restrict patient testimonials** in healthcare
marketing in Dubai. The risk is the testimonials themselves, not their
wording, so this section needs the same approval pass as the rest of the
copy before it runs traffic.

### Hover, and a Tailwind v4 trap worth knowing

Cards lift, warm their border to gold and deepen their shadow; the quotation
mark grows and warms with them. Same vocabulary as the index cards and the
benefits grid, so the page has one idea of what "interactive" looks like.

> **`transition-[transform,…]` does nothing in Tailwind v4.** `-translate-y-*`
> and `scale-*` now compile to the standalone `translate` and `scale` CSS
> properties, not to `transform` — so a transition list naming `transform`
> leaves the movement **snapping** while the colours beside it animate
> smoothly. It looks like a broken tween and reads as jank.
>
> The lists are `transition-[translate,border-color,box-shadow]` and
> `transition-[color,scale]`. Caught by reading computed style mid-hover: at
> 120ms the card was at `translate: 0 -4.82px` and the mark at `scale: 1.08`,
> which is what proves it is tweening rather than jumping. `getComputedStyle`
> on `transform` reports `none` in both states and tells you nothing.

The scroll container carries `pt-2 pb-4` as headroom. Setting `overflow-x`
makes `overflow-y` compute to `auto`, so without it a lifted card is clipped
at the top and the deeper shadow can trip a vertical scrollbar.

No `motion-reduce` variants: `globals.css` drops every transition to 0.001ms
under `prefers-reduced-motion`, so these snap instead of moving.

### The autoplay had to go

It was a continuous auto-scrolling marquee. **Anything that moves on its own
turns every control inside it into a moving target**, and once the cards
carried a "Read more" button it became effectively unclickable. Pausing on
hover only ever helped a mouse — on a phone there is no hover, so the button
could not reliably be tapped at all.

It is now a carousel the visitor drives: native horizontal scrolling with
`scroll-snap`, plus prev/next buttons. **Nothing moves unless someone asks
it to.** Swipe, trackpad, shift-wheel and keyboard all work for free, and the
arrows are `scrollBy` — nothing re-implements a scrollbar. The buttons
disable at each end.

`scripts/verify-reviews.mjs` asserts "does not auto-scroll" and clicks Read
more at its real coordinates, so this cannot come back quietly.

> The `animate-marquee` class and its `marquee-scroll` keyframes were deleted
> from `globals.css`. Nothing referenced them any more.

### The full quote opens in a native `<dialog>`

Rather than expanding in place, which changed the card's height — the one
thing an equal-height row cannot afford.

`showModal()` is doing real work: focus is trapped inside, Esc closes, the
rest of the page goes inert, and the backdrop is a styleable pseudo-element.
Hand-rolling those is where accessible modals usually go wrong.

Two things it does *not* give you, both handled:

- **The page still scrolls behind it.** `showModal` makes the background
  inert but does not lock scrolling; the body gets `overflow: hidden` while
  open, restored on unmount.
- **Backdrop clicks** land on the dialog element itself, so closing on
  backdrop is `e.target === dialogRef.current`.

The dialog is mounted only while open, so mount/unmount drives
`showModal`/`close` and there is no second source of truth for whether it is
up.

### Small cards, clamped, with Read more

The real quotes run 213 to 676 characters, so the length problem had to be
solved rather than absorbed. Two attempts before this one:

| Approach | Result |
|---|---|
| Flex default (stretch) | Longest quote set every card to 716px; shortest carried ~500px of empty ivory |
| `items-start`, natural heights | No dead space, but cards ranged 352–716px and the section hit 1059px |
| **Clamp to 6 lines + `min-height` + Read more** | **352–407px, section 751px** |

The clamp gives uniform small cards; the `min-height` is what makes the
short ones match rather than sitting undersized. `items-start` stays,
because it is what lets an expanded card grow **on its own** instead of
dragging every sibling to its height.

**Whether "Read more" appears is measured, not counted.** The same string
wraps to a different number of lines at 330px and 370px, so a character
threshold would put the control on cards with nothing hidden behind them.
A `ResizeObserver` compares `scrollHeight` to `clientHeight`; the result is
**latched**, because an expanded paragraph no longer overflows and
re-measuring would remove the control needed to collapse it again.

The 213-character review correctly has no button.

> **The duplicate marquee copy is `inert`.** The cards now contain a
> button, and `aria-hidden` alone would leave focusable controls in the
> duplicate — reachable by Tab, invisible to assistive tech. `inert`
> removes both. Any future interactive element inside a card inherits this
> for free; anything added *outside* `Card` needs it considered again.

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

### There are TWO numbers, and they are not interchangeable

| | Number | Where | Behaviour |
|---|---|---|---|
| `phoneDisplay` / `phoneHref` | **+971 55 557 2547** | **Footer only**, plus `telephone` in the JSON-LD | `tel:` — the voice line |
| `contactDisplay` / `contactHref` / `whatsappHref` | **+971 56 663 6359** | Everywhere else, every page | WhatsApp, or `tel:` where the affordance is explicitly labelled "call" |

The footer keeps the voice line because that is the number that answers
calls, and `telephone` in schema.org drives click-to-call in search
results — pointing it at a WhatsApp-only line would send searchers to a
number that does not ring.

Everywhere else shows and links the WhatsApp number, because that is the
channel the clinic wants enquiries on. **The nav number opens WhatsApp
rather than a dialler** — it is a contact display, not a call button.

> **Four affordances are labelled "call" and dial the WhatsApp number**:
> the sticky bar's phone icon, the FAQ button, the 404 and the form's error
> message. They sit beside a separate WhatsApp button in two of those
> places, so pointing them at WhatsApp too would give two identical
> buttons. **If that number does not take voice calls, repoint them at
> `whatsappHref` or remove them** — a call button that rings nothing is
> worse than no call button. Flagged in the launch checklist.

Every WhatsApp link carries `target="_blank"` with
`rel="noopener noreferrer"`. The audit fails a bare `target="_blank"`.

Counting occurrences in the raw HTML overcounts — Next's RSC payload
repeats every string, and the JSON-LD adds another. Query the DOM instead;
`scratchpad/qa/phones.mjs` lists every `tel:` and `wa.me` anchor per route
with its number, container and rel.
- **Form:** `components/lp/LeadForm.tsx`
- **Validation:** `lib/validation.ts` — one Zod schema shared by client
  and server, so they can't drift
- **Handler:** `app/api/lead/route.ts`

### Layout

| Left | Right |
|---|---|
| Eyebrow, headline, the lead line in italic champagne, two paragraphs | The form card |

On phones this stacks **form first, copy second** — see below.

The two columns are tuned to land level: **512 vs 540px**, with
`items-center` splitting the 28px remainder. If you change the headline
size or the copy length, re-check that — the balance is deliberate, not
incidental. The closing headline is also the largest on the page
(`clamp(34px, 5.2vw, 58px)`), which is both the right emphasis for a
final CTA and what makes the left column reach the form's height.

#### On phones the form comes first

`order-first lg:order-none` on the form's `<Reveal>`.

All five CTAs on the page point at `#book` — hero, nav, sticky bar,
candidate, results. With the copy leading the stack, that anchor landed
people on the pitch with the form below the fold: they'd tapped a button
that said "Book a consultation" and still had to scroll to find a form.
Now the card lands whole in the viewport — **top 129px, bottom 691px of
844**, all three fields and the submit button visible without scrolling.

It works because the card is self-contained: it opens with its own
"Request your consultation" heading and standfirst, so it doesn't need
the section head above it. The section copy follows as reinforcement for
anyone who keeps scrolling.

Two things to know if you touch this:

- **It's a no-op from `lg`.** Both children are `order: 0` there and the
  columns sit exactly as before. It did not move the desktop height.
- **DOM order stays copy-then-form**, so on phones the visual order and
  the reading order differ. Acceptable here — the copy holds no focusable
  elements, so tab order is unaffected, and both sequences are coherent
  (context then action, or action then context). Don't extend the trick
  to a case where the reordered block contains links or inputs.

> The sticky bar stays up over this section. It doesn't overlap the card
> (bar starts at 754px, card ends at 691px), but it is offering a button
> that does nothing once you're here. Hiding it when `#book` enters the
> viewport is a reasonable improvement; it hasn't been made.

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

Padding matches the page sections (`PADDING.tight` — 68px desktop, 44px
mobile) rather than a bespoke footer value, but the top is taken one step
down (44 / 30) because the booking band above is the same espresso-deep:
there is no tone change marking the boundary, so a full pair of paddings
between them read as one dead gap instead of two sections meeting. The
divider inside `.shell` is what marks it. Height went 690px → **547px**.

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
| `/` | `app/page.tsx` | Index of every landing page, `noindex, follow`. See `docs/pages/index.md` |
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

**Kill the old server before restarting it.** If a previous `next start`
still holds 3100, the new one fails to bind silently and the old build
keeps serving. The HTML then references a CSS chunk the old build doesn't
have, that request 404s, and the page renders completely unstyled — which
looks like a catastrophic layout regression rather than a stale process.
Confirm the stylesheet is actually being served before trusting any
measurement:

```bash
CSS=$(curl -s http://localhost:3100/buccal-fat-removal \
  | grep -oE '/_next/static/chunks/[^"]*\.css' | head -1)
curl -s -o /dev/null -w "%{http_code} %{size_download}\n" "http://localhost:3100$CSS"
```

### Measuring spacing

Two scripts, and they answer different questions:

- `mobile-spacing.mjs` — computed padding and content-box slack per
  section. Good for "is the rhythm uniform".
- `tail-compare.mjs` — the *visual* gap, scanning screenshot rows for ink.
  Good for "does this boundary look bigger than its neighbours".

Element rects lie: anything inside `overflow-hidden`, and anything under a
parallax or Ken Burns transform, still reports its **unclipped** box. That
is why `surgeon` shows a negative top gap and several sections show a 20px
bottom overflow — measurement artifacts, not defects. The ink scan is also
unreliable on the gradient-backed bands (`surgeon`, `results`, `reviews`,
`faq`, `book`); it only tells the truth on the flat ivory and sand ones.
Confirm anything either script flags with a cropped screenshot before
changing code.

Current mobile boundary gaps, ink to ink, at 390×844: hero→stats **69**,
stats→credentials **86**, credentials→procedure **102**, anatomy→benefits
**108**, benefits→candidate **94**, candidate→surgeon **88**. Total page
height **17073px**.

> **Uniform padding is not the same as even spacing.** Section 1 sat at
> 44px like everything else and still looked loose, because what precedes
> the padding differs: a 60px button with 17px of internal padding and a
> hairline border leaves far more apparent space than a paragraph does.
> The number to match across sections is the *visual* gap, not the CSS
> value. Check with `tail-compare.mjs` and a crop, not the computed style.

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
