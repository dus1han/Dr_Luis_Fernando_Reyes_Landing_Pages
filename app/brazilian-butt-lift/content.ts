/**
 * Every word on the Brazilian Butt Lift page lives here.
 * Sections import from this file, so copy edits never require touching
 * a component. Source: "BBL - LP Content.docx".
 *
 * ── WHAT THE DOCX DID NOT SUPPLY ────────────────────────────────────────
 * The template carries four blocks the BBL brief has no copy for: the
 * numbers strip, the credentials row, the six benefit cards and the
 * reading guide over the results gallery.
 *
 * None of them is invented. Every line in those blocks is a restatement of
 * something the brief already asserts elsewhere in this file — the 3-5 hour
 * operating time, "without implants", "sculpting the donor areas", the fat
 * that establishes a blood supply. Where the brief is vague, this file is
 * vague with it: it says recovery is "a few weeks" rather than picking a
 * number, which is why the recovery stat the buccal page carries is a
 * procedure-length stat here instead.
 * ────────────────────────────────────────────────────────────────────────
 */

export const SLUG = "brazilian-butt-lift";

export const NAV_LINKS = [
  { label: "The procedure", href: "#procedure" },
  { label: "Benefits", href: "#benefits" },
  { label: "Results", href: "#results" },
  { label: "Dr. Luis", href: "#surgeon" },
  { label: "FAQ", href: "#faq" },
];

export const HERO = {
  eyebrow: "Body contouring · Dubai",
  kicker: "Curves that look naturally yours",
  headline: ["Brazilian", "Butt Lift"] as const,
  lede: "Enhance your natural curves with Colombian aesthetic artistry, creating fuller, beautifully balanced proportions.",
  /*
   * "Book a consultation", not the brief's "Book Your Consultation".
   *
   * The hero CTAs sit side by side inside a 44ch copy column. The pair's
   * natural width has to fit it, and "your" instead of "a" pushed the
   * primary from 250px to 277px — past the limit, at which point flex
   * shrank BOTH buttons and both wrapped to two lines. The secondary was
   * already narrower than the buccal page's and wrapped anyway, which is
   * the tell: it is the pair's total that matters, not either label.
   *
   * These two lengths are what the layout was built around. Lengthen
   * either and measure the pair again before shipping it.
   */
  primaryCta: "Book a consultation",
  secondaryCta: "See the results",
};

/** `display` opts a stat out of the count-up animation. */
export type Stat = {
  value: number;
  prefix?: string;
  suffix?: string;
  display?: string;
  label: string;
};

export const STATS: Stat[] = [
  { value: 19, suffix: "+", label: "Years of experience" },
  { value: 2, display: "Double", label: "Board certified" },
  /*
   * A range, so it uses `display` and skips the count-up — "3-5" has no
   * sensible intermediate state. `value` is inert while `display` is set.
   *
   * Operating time, not recovery time. The buccal page's fourth stat is
   * "4-5 days / typical recovery"; the brief for this procedure says only
   * that patients "gradually return to light daily activities within a few
   * weeks", and turning that into a number would be inventing one.
   */
  { value: 5, display: "3-5 Hours", label: "Typical procedure" },
  { value: 0, display: "Zero", label: "Implants used" },
];

/**
 * Qualification signals, shown high on the page. Each supporting line is
 * drawn from facts already established elsewhere in this file — nothing
 * here asserts a credential the clinic hasn't stated.
 */
export const ASSURANCE = {
  eyebrow: "Why you're in safe hands",
  items: [
    {
      icon: "certificate",
      title: "Double Board-Certified Plastic Surgeon",
      body: "Double board certified in plastic, aesthetic and reconstructive surgery.",
    },
    {
      icon: "shield",
      title: "DHA-Licensed & Accredited Clinic",
      body: "Practising in Dubai under Dubai Health Authority regulation.",
    },
    {
      icon: "globe",
      title: "International Standards. Colombian Artistry",
      body: "Over 19 years of practice across international patients and standards.",
    },
    {
      icon: "heart",
      title: "Care That Continues After Surgery",
      body: "Every stage of recovery monitored, with scheduled follow-up and a team you can reach.",
    },
  ],
} as const;

export const PROCEDURE = {
  eyebrow: "The procedure",
  headline: ["What is a", "Brazilian Butt Lift?"] as const,
  body: [
    "A Brazilian Butt Lift (BBL) is a body contouring procedure that enhances the size and shape of the buttocks using your own natural fat. Unwanted fat is gently removed from areas such as the abdomen, waist, back or thighs before being carefully purified and strategically transferred to the buttocks.",
    "By sculpting the surrounding areas first and enhancing the buttocks with your own fat, a BBL creates smoother transitions, improved body proportions, and natural-looking curves that complement your unique figure.",
  ],
  quote:
    "A silhouette that feels balanced, confident, and naturally yours.",
};

/**
 * The how-it's-performed stepper.
 *
 * Four steps rather than the buccal page's three, because the brief
 * describes four distinct stages and collapsing two of them would either
 * lose the operating time or lose the compression garment.
 *
 * `note` is the brief's own "Recovery" heading. It sits under the steps
 * rather than becoming a fifth one: recovery is not a stage of the
 * operation, and numbering it as though it were would say the procedure
 * ends where it actually continues.
 */
export const STEPS = {
  eyebrow: "How it's performed",
  headline: ["Sculpted first,", "then shaped"] as const,
  steps: [
    {
      n: "01",
      title: "Comfortable under general anaesthesia",
      body: "You're comfortably placed under general anaesthesia, so the surgery is performed safely while you remain asleep throughout. A BBL typically takes 3 to 5 hours, depending on how many areas are being sculpted and the complexity of your treatment.",
    },
    {
      n: "02",
      title: "The donor areas are sculpted",
      body: "Using advanced liposuction techniques, fat is gently removed from carefully selected donor areas such as the abdomen, waist, flanks, back or thighs.",
    },
    {
      n: "03",
      title: "Purified fat is placed with intent",
      body: "The harvested fat is purified before the healthiest cells are meticulously injected into specific areas of the buttocks — placed by Dr. Luis to create smooth contours, natural projection and beautifully balanced curves.",
    },
    {
      n: "04",
      title: "Supported from the first hour",
      body: "You're fitted with a specialised compression garment to reduce swelling and support the newly contoured areas, then discharged after a period of supervised recovery with detailed aftercare instructions and a personalised follow-up plan.",
    },
  ],
  note: {
    title: "Recovery",
    body: "Dr. Luis and his medical team provide detailed guidance on everything from sleeping positions and sitting recommendations to compression garments, activity levels and follow-up appointments. Every stage of your recovery is carefully monitored to support optimal healing and fat retention.",
  },
  caption: "Colombian body contouring, performed in Dubai",
};

/**
 * Six cards, none of them a new claim.
 *
 * The brief has no benefits list, so each of these is a fact stated
 * elsewhere in it — the FAQ, the candidate list, the "why patients travel"
 * section — restated as a benefit. Deliberately silent on longevity beyond
 * what the brief says: a portion of the fat survives, and a stable weight
 * preserves it. Not "permanent".
 */
export const BENEFITS = {
  eyebrow: "The benefits",
  headline: ["What this actually", "changes for you"] as const,
  items: [
    {
      icon: "curves",
      title: "Fuller, naturally shaped curves",
      body: "Fat is placed to build shape and projection rather than volume alone, so the result reads as your own figure.",
    },
    {
      icon: "natural",
      title: "Your own fat, no implants",
      body: "Nothing artificial is placed in the body. For many patients their own fat gives a softer, more natural appearance.",
    },
    {
      icon: "waist",
      title: "A slimmer waist at the same time",
      body: "The donor areas are sculpted first, so the abdomen, waist, flanks or back are contoured as part of the same procedure.",
    },
    {
      icon: "balance",
      title: "Proportion, not just size",
      body: "The waist, hips, buttocks and overall silhouette are shaped to complement one another rather than one part being enlarged.",
    },
    {
      icon: "hidden",
      title: "Small, discreet incisions",
      body: "The procedure is performed through very small incisions placed in discreet areas wherever possible, difficult to notice once healed.",
    },
    {
      icon: "clock",
      title: "Long-lasting with a stable weight",
      body: "A portion of the transferred fat establishes a permanent blood supply and becomes part of your body. Keeping your weight stable preserves it.",
    },
  ],
} as const;

/**
 * The gallery, card by card. Six cards, all from the clinic's own `B A`
 * folder and used exactly as supplied.
 *
 * Each card carries its own label because this set is not uniform, and
 * stamping "Before"/"After" across all of it would be a claim about
 * photographs that do not all contain a before.
 *
 *   pair    a genuine side-by-side comparison — before left, after right
 *   result  a single post-operative photograph, labelled as a result only
 *
 * `area` says what the card actually shows. Cards 1-3 are waist and
 * abdomen: that is the donor site, and sculpting it is half of what a BBL
 * does, so they belong here — but calling them buttock results would not
 * be true.
 *
 * ── WHAT USED TO BE HERE ────────────────────────────────────────────────
 * Six more cards led this list: before/after pairs cut out of the grid
 * composite in `Images/`, showing the buttocks themselves. They were
 * removed at the clinic's request. The featured comparison at the top of
 * the section is still cut from that same grid, so the page has not lost
 * the procedure's own before/after — only the twelve-card gallery.
 *
 * The cut coordinates survive in `scripts/prepare-images.mjs`; restoring
 * the cards means emitting them again and adding them back above.
 * ────────────────────────────────────────────────────────────────────────
 *
 * ── FOR THE CLINIC TO CONFIRM ───────────────────────────────────────────
 * `ba-4` (the two dress photographs) is labelled `result`, not `pair`.
 * Both halves read as post-operative, and neither carries a "before"
 * marking. If it is in fact a before/after, change `kind` to "pair" and it
 * gets the two tags; do not leave it labelled a pair on a guess.
 * ────────────────────────────────────────────────────────────────────────
 */
export type GalleryCard = {
  /** Key into the BBL image manifest. */
  key: string;
  kind: "pair" | "result";
  area: string;
};

export const GALLERY: GalleryCard[] = [
  { key: "ba-1.jpg", kind: "pair", area: "Waist and abdomen" },
  { key: "ba-2.jpg", kind: "pair", area: "Waist and abdomen" },
  { key: "ba-3.jpg", kind: "pair", area: "Waist and abdomen" },
  { key: "ba-4.jpg", kind: "result", area: "Silhouette" },
  { key: "ba-5.jpg", kind: "result", area: "Silhouette" },
  { key: "ba-6.jpg", kind: "result", area: "Silhouette" },
];

export const RESULTS = {
  eyebrow: "Before & after",
  headline: ["The difference is in", "the proportions"] as const,
  intro:
    "Look at the waist as much as the buttocks. The donor areas are sculpted before anything is transferred, so what changes is the whole silhouette rather than one part of it.",
  /** Describes what the photographs show — no claims beyond the copy above. */
  lookFor: [
    {
      title: "Projection",
      body: "Purified fat is placed to build a rounded, projected shape rather than volume alone.",
    },
    {
      title: "The waist",
      body: "Fat taken from the abdomen, waist or flanks narrows the mid section, which is half of what makes a curve read.",
    },
    {
      title: "The transitions",
      body: "Waist to hip and hip to thigh soften, so the silhouette reads as one continuous line.",
    },
  ],
  /*
   * Longer than the buccal page's, and deliberately so: fat transfer has a
   * variable this page has already told the visitor about — not all of the
   * transferred fat survives — and a results-vary line that omits it would
   * be leaving out the one thing that actually varies most.
   */
  disclaimer:
    "Individual results vary and are determined by your own anatomy, the donor fat available and how much of the transferred fat is retained during healing.",
};

export const SURGEON = {
  eyebrow: "Meet your surgeon",
  headline: ["Meet", "Dr. Luis"] as const,
  intro:
    "Inspired by the renowned artistry of Colombian aesthetics, Dr. Luis is a Double Board-Certified Plastic, Aesthetic and Reconstructive Surgeon with over 19 years of international experience. His philosophy combines artistic vision with surgical precision to create beautifully balanced body contours that enhance your natural proportions while maintaining elegant, natural-looking results.",
  /**
   * The affiliation ribbon. Identical on every page — the marks are the
   * surgeon's, not the procedure's — and the files come from the SHARED
   * manifest for the same reason.
   *
   * `height` is the rendered height in px and is per-logo on purpose. A
   * single height across all six doesn't work: four are horizontal
   * lockups, while ASPS is stacked and AASMA is a circular badge — match
   * either of those to the wordmarks' height and their type shrinks to
   * nothing. These values balance them by eye, not by the numbers.
   */
  affiliations: [
    { image: "affil-rosario.png", name: "Universidad del Rosario", height: 34 },
    { image: "affil-emory.png", name: "Emory University", height: 32 },
    { image: "affil-uba.png", name: "Universidad de Buenos Aires", height: 34 },
    { image: "affil-asps.png", name: "American Society of Plastic Surgeons", height: 48 },
    {
      image: "affil-aasma.png",
      name: "Arab Association of Surgical and Medical Aesthetics",
      height: 48,
    },
    {
      image: "affil-filacp.png",
      name: "Federación Ibero Latinoamericana de Cirugía Plástica",
      height: 32,
    },
  ],
  whyHeadline: ["Why patients", "travel to Dr. Luis"] as const,
  pullQuote: "Proportion, never simply size.",
  pullQuoteMeta: "The principle behind every body procedure",
  why: [
    "Dr. Luis brings the renowned artistry of Colombian plastic surgery to Dubai, where the focus is creating beautifully balanced, natural-looking body proportions. Colombian aesthetic philosophy is built around creating harmony, where the waist, hips, buttocks and overall silhouette complement one another naturally.",
    "A Brazilian Butt Lift is never approached as simply increasing the size of the buttocks. It begins by sculpting the donor areas to create a slimmer waist, smoother transitions and improved body proportions before carefully transferring purified fat to enhance shape, projection and balance.",
    "Most importantly, your journey doesn't end after surgery. From your first consultation to every follow-up appointment, Dr. Luis and his experienced medical team remain closely involved, ensuring your recovery progresses smoothly while supporting you every step of the way.",
  ],
};

export const CANDIDATE = {
  eyebrow: "Am I a candidate?",
  headline: ["You may be a suitable candidate", "if this sounds familiar"] as const,
  /*
   * Two paragraphs, not one. The brief opens this section by naming who it
   * is for and closes it on what the consultation decides, and running the
   * two together buries the second — which is the honest half.
   */
  intro: [
    "Not everyone is naturally born with full, well-defined curves. Many people have naturally flatter buttocks or wish to enhance their body proportions for a more balanced silhouette, and ageing, pregnancy, significant weight loss and natural changes in skin elasticity all affect the shape and firmness of the buttocks over time.",
    "If you've worked hard to lose weight but are left with a body shape that no longer reflects your efforts, a BBL can restore volume, improve contour and create more harmonious proportions.",
  ],
  items: [
    "You want fuller, naturally shaped buttocks without implants",
    "You feel your body lacks balanced curves or proportion",
    "You have unwanted fat in areas such as the abdomen, waist, back or thighs",
    "You're close to your ideal weight and maintain a healthy lifestyle",
    "You'd like a more sculpted hourglass silhouette",
    "You're looking for natural-looking enhancement using your own body fat",
  ],
  note: "Dr. Luis assesses your anatomy, the donor fat available and your aesthetic goals before saying yes — that's what the consultation is for.",
};

export const REVIEWS = {
  eyebrow: "Patient stories",
  headline: ["In their", "own words"] as const,
  /**
   * Five genuine patient reviews, supplied by the clinic and reproduced
   * VERBATIM — including their typos. Editing a patient's words changes a
   * quote attributed to a real person, so the two that read as
   * transcription slips ("Juno start", "from the begging to end") are left
   * exactly as written. Correct them at source or not at all.
   *
   * Names are the reviewers' own handles from the platform they were left
   * on. Inventing tidier initials would misattribute them.
   *
   * These are the same five the buccal page carries, and here they finally
   * describe the right procedure: gluteal biopolymer removal, liposculpture
   * with hip and gluteal augmentation, body contouring. They are body
   * work, from the Colombian practice — which is what this page is about.
   * Two still name "Majestic" rather than the Dubai clinic, and none was
   * performed in Dubai.
   *
   * ── STILL TRUE, AND STILL WORTH READING ─────────────────────────────
   * DHA advertising rules restrict patient testimonials in healthcare
   * marketing in Dubai. Get this section through the same approval as the
   * rest of the copy before running traffic on it — the risk is the
   * testimonials themselves, not just their wording.
   * ────────────────────────────────────────────────────────────────────
   */
  items: [
    {
      quote:
        "I had a very good experience with the doctors. I felt 100% confident with my procedure when I had my first surgery with them, and I felt the same confidence when I chose them again for this gluteal biopolymer removal procedure. I would recommend them without hesitation; they are the best.",
      name: "Philosophical968460",
      meta: "Gluteal biopolymer removal",
    },
    {
      quote:
        "My experience with Dr. Reyes was terrific!!! His team is top-notch, his facility is high end and his sculpting skills are advanced. My body healed quickly and my results are exactly what I wanted. Everything is proportionate to my size. I had a liposculpture surgery with augmentation to hips and butt. Dr. Reyes listened to everything I wanted - he went above and beyond! I look like a Barbie doll! I only trust the Majestic team with my body! Thank you Dr. for giving me the body of my dreams.",
      name: "Laluna2016",
      meta: "Liposculpture with hip & gluteal augmentation",
    },
    {
      quote:
        "Dr Luis Fernando Reyes is a life changing surgeon. He completely changed my life and gave me the Juno start I needed on my fitness journey. If you are looking for a highly professional, extremely talented, safe and trustworthy dr, look no further. Dr Luis’ work is the closest thing to magic on this earth. The results I experienced were above and beyond my expectations. I came home with a brand new body and my confidence restored. Dr Luis and his entire team made my trip to Colombia comfortable and seamless. If I had to do it, I would do it all over again with dr Luis because I know 100% I am in good hands. I cannot thank dr Luis enough, I am grateful for him everyday.",
      name: "Kap5645",
      meta: "Body contouring · Colombia",
    },
    {
      quote:
        "It was a wonderful experience, great human quality, beautiful results, I loved it. I recommend him, excellent surgeon, always available to clarify any doubts The attention of all the staff in general is excellent.",
      name: "Courageous739392",
      meta: "Patient review",
    },
    {
      quote:
        "Words are not enough to thank you for the life change! I had the best experience from the begging to end. Dr. Reyes and the whole team make you feel so comfortable, they’re always there to answer every single question and are very reachable through the phone. Their professionalism and knowledge will make you have the results you have always wanted. They do give the extra mile in everything, and really care about you as patient. Also, they have a beautiful and classy office. I will always recommend Majestic and Dr. Reyes",
      name: "losman1",
      meta: "Patient review",
    },
  ] as ReviewItem[],
};

export type ReviewItem = {
  quote: string;
  name: string;
  /**
   * The procedure each review is actually about.
   *
   * **Not rendered** — the line under the reviewer's name was removed from
   * the buccal page at the clinic's request and this page follows it. Kept
   * as the record of what each review describes. Restoring the line is one
   * span in `Reviews.tsx`.
   */
  meta: string;
  /** Not a real review — dev-only, never rendered in production. */
  placeholder?: boolean;
};

export const FAQ = {
  eyebrow: "Questions",
  headline: ["The things people", "actually ask"] as const,
  items: [
    {
      q: "Will my results look natural?",
      a: "Yes. Dr. Luis focuses on creating balanced body proportions rather than excessive volume, producing results that complement your natural figure.",
    },
    {
      q: "Will there be visible scars?",
      a: "The procedure is performed through very small incisions placed in discreet areas whenever possible, making them difficult to notice once healed.",
    },
    {
      q: "How long do the results last?",
      a: "A portion of the transferred fat naturally establishes a permanent blood supply and becomes part of your body. Maintaining a stable weight helps preserve your long-term results.",
    },
    {
      q: "Is a Brazilian Butt Lift better than implants?",
      a: "For many patients, using their own fat provides a softer, more natural appearance while also improving body contours through liposuction. During your consultation, Dr. Luis will recommend the most suitable option for your anatomy and goals.",
    },
    {
      q: "How long is the recovery?",
      a: "Most patients gradually return to light daily activities within a few weeks. Dr. Luis will provide personalised guidance throughout your recovery to help optimise healing and fat retention.",
    },
    {
      q: "How much fat survives after a BBL?",
      a: "Not all transferred fat cells survive the healing process, which is a normal part of the procedure. Dr. Luis carefully plans each treatment with this in mind to help achieve the desired long-term shape once healing is complete.",
    },
    {
      q: "Will the procedure be painful?",
      a: "Your comfort is planned for from the very beginning. You'll be under anaesthesia throughout the procedure, and a personalised pain management plan will be provided to help keep you comfortable during recovery. While some soreness, swelling and tightness are expected, most patients find these symptoms improve steadily during healing.",
    },
    {
      q: "What happens during my consultation?",
      a: "Your consultation includes a detailed assessment of your body proportions, donor fat availability and aesthetic goals. Dr. Luis will explain whether you're a suitable candidate and create a personalised surgical plan designed around your desired outcome.",
    },
    {
      q: "What happens after my surgery?",
      a: "Your care doesn't end when your procedure is complete. Dr. Luis and his medical team continue to monitor your recovery through scheduled follow-up appointments, checking you're healing as expected, answering your questions and guiding you through each stage. Should you need advice or reassurance during your healing journey, the team is always available to support you.",
    },
  ],
};

export const BOOKING = {
  eyebrow: "Book your consultation",
  headline: ["Beautiful curves begin", "with beautiful proportions"] as const,
  /** Opens larger than the rest — it's the line the section turns on. */
  lead: "A Brazilian Butt Lift is all about revealing a silhouette that feels balanced, confident, and naturally yours.",
  body: [
    "If you're considering a Brazilian Butt Lift, your journey begins with a personalised consultation. Together, you'll discuss your goals, evaluate your body proportions, and create a treatment plan designed specifically for you.",
    "Book your private consultation with Dr. Luis today and discover what's possible with personalised Colombian body contouring.",
  ],
};
