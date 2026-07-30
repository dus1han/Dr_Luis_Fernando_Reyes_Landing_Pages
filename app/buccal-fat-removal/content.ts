/**
 * Every word on the buccal fat removal page lives here.
 * Sections import from this file, so copy edits never require touching
 * a component. Source: "Buccal fat removal LP content.docx".
 */

export const SLUG = "buccal-fat-removal";

export const NAV_LINKS = [
  { label: "The procedure", href: "#procedure" },
  { label: "Benefits", href: "#benefits" },
  { label: "Results", href: "#results" },
  { label: "Dr. Luis", href: "#surgeon" },
  { label: "FAQ", href: "#faq" },
];

export const HERO = {
  eyebrow: "Facial contouring · Dubai",
  kicker: "Achieve a slimmer, more sculpted face",
  headline: ["Buccal Fat", "Removal"] as const,
  lede: "Combining Colombian aesthetic artistry with precise facial contouring to define the jawline and reduce cheek fullness — through an incision inside the mouth, so nothing shows on your face.",
  primaryCta: "Book a consultation",
  secondaryCta: "See real results",
  // No credentials line here — the trust strip immediately below already
  // states "Double / board certified" and "19+ / years of experience".
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
  { value: 1, prefix: "~", suffix: " week", label: "Typical recovery" },
  { value: 0, display: "Zero", label: "Scars on the face" },
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
      title: "Board-Certified Plastic Surgeon",
      body: "Double board certified in plastic, aesthetic and reconstructive surgery.",
    },
    {
      icon: "shield",
      title: "DHA-Licensed & Accredited Clinic",
      body: "Practising in Dubai under Dubai Health Authority regulation.",
    },
    {
      icon: "globe",
      title: "International Patient Experience",
      body: "Over 19 years of practice across international patients and standards.",
    },
    {
      icon: "heart",
      title: "Patient Safety-First Approach",
      body: "Every face individually assessed — including when the honest answer is no.",
    },
  ],
} as const;

export const PROCEDURE = {
  eyebrow: "The procedure",
  headline: ["What is", "buccal fat removal?"] as const,
  body: [
    "Buccal fat removal is a precise, minimally invasive procedure that refines the shape of your mid face by reducing the buccal fat pad — a deep, naturally occurring pocket of fat that sits between your cheekbone and jaw.",
    "Because this fat sits deep in the mid face and doesn't respond to diet or exercise the way body fat does, no amount of training or clean eating will ever shift it.",
  ],
  quote:
    "Cheekbones that finally show, a slimmer profile, and contours that look like you were simply born with them.",
};

export const ANATOMY = {
  eyebrow: "How it's performed",
  headline: ["A change made", "from the inside"] as const,
  steps: [
    {
      n: "01",
      title: "The fat pad is located",
      body: "The buccal fat pad sits deep between your cheekbone and jaw. Its size and position are assessed against your facial anatomy before anything begins.",
    },
    {
      n: "02",
      title: "Accessed through the mouth",
      body: "A small opening is made inside the mouth and the area is fully numbed with local anaesthetic, so there are no cuts on the face and nothing to see from the outside.",
    },
    {
      n: "03",
      title: "Only the precise amount is removed",
      body: "Enough to reveal the definition already in your bone structure — never enough to hollow the cheeks. The result reads as natural, not operated on.",
    },
  ],
  caption: "Buccal fat pad before and after reduction",
};

export const BENEFITS = {
  eyebrow: "The benefits",
  headline: ["What this actually", "changes for you"] as const,
  items: [
    {
      icon: "contour",
      title: "Sharper cheekbone and jawline definition",
      body: "The bone structure you felt was hidden finally shows — the sculpted profile that dieting could never give you.",
    },
    {
      icon: "hidden",
      title: "No visible scarring",
      body: "Every incision is made inside the mouth, so nothing shows on your face. No one needs to know unless you choose to tell them.",
    },
    {
      icon: "permanent",
      title: "Permanent results",
      body: "Once the buccal fat is reduced, those fat cells don't come back — so the fullness you've fought for years is gone for good.",
    },
    {
      icon: "clock",
      title: "Quick recovery",
      body: "Most people are back to their normal routine within about a week, with mild early swelling that settles as you heal.",
    },
    {
      icon: "pairs",
      title: "Pairs beautifully with other procedures",
      body: "Refining the cheeks alongside other facial work creates balanced, harmonised results that look effortless and whole.",
    },
    {
      icon: "once",
      title: "A one-time alternative to fillers",
      body: "Unlike fillers that fade and need topping up, buccal fat removal is done once. No repeat appointments, no recurring cost.",
    },
  ],
} as const;

export const RESULTS = {
  eyebrow: "Before & after",
  headline: ["The difference is in", "the mid face"] as const,
  intro:
    "Look at the mid face and the line running from cheekbone to chin. The change is structural rather than dramatic — the same face, more clearly defined.",
  /** Describes what the photographs show — no claims beyond the copy above. */
  lookFor: [
    {
      title: "The mid face",
      body: "Fullness through the cheek softens, so the face reads slimmer from the front.",
    },
    {
      title: "The cheekbone",
      body: "Structure that was already there becomes visible once the pad above it is reduced.",
    },
    {
      title: "The jawline",
      body: "The line from cheekbone to chin sharpens — clearest in the profile views.",
    },
  ],
  disclaimer:
    "Photographs are illustrative of typical outcomes. Individual results vary and are determined by your own facial anatomy.",
};

export const SURGEON = {
  eyebrow: "Meet your surgeon",
  headline: ["Meet", "Dr. Luis"] as const,
  intro:
    "Inspired by the renowned artistry of Colombian aesthetics, Dr. Luis is a Double Board Certified Plastic, Aesthetic and Reconstructive Surgeon with over 19 years of international experience. His personalised approach combines surgical precision with artistic vision to create naturally refined facial contours that enhance your features.",
  /**
   * The logo ribbon that replaced three text pills reading "Double board
   * certified", "19+ years international experience" and "Plastic,
   * aesthetic & reconstructive". All three were already stated in the
   * intro paragraph directly above them, so they were repetition; the
   * marks say the same thing with evidence behind it.
   *
   * `height` is the rendered height in px and is per-logo on purpose.
   * A single height across all six doesn't work: four are horizontal
   * lockups, while ASPS is stacked and AASMA is a circular badge — match
   * either of those to the wordmarks' height and their type shrinks to
   * nothing. These values balance them by eye, not by the numbers.
   *
   * They also have to keep the row on ONE line at 1440, where the column
   * is 670px. Six logos plus five gaps is tight; adding a seventh means
   * either shrinking everything again or accepting that it wraps.
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
  pullQuote: "Natural harmony over dramatic change.",
  pullQuoteMeta: "The principle behind every facial procedure",
  why: [
    "Dr. Luis brings the renowned artistry of Colombian plastic surgery to Dubai, where facial aesthetics are guided by one simple principle: natural harmony over dramatic change. Rather than simply removing facial volume, his approach focuses on revealing the definition that's already there — creating balanced, elegant contours that complement your unique features.",
    "Every face deserves an individualised approach. Buccal fat removal is carefully planned around your facial anatomy, bone structure, skin quality and long-term ageing considerations, to achieve a slimmer, more refined appearance without looking overdone.",
    "Most importantly, your care doesn't end after surgery. From your first consultation through every follow-up, Dr. Luis and his experienced medical team remain closely involved — providing personalised guidance and attentive aftercare for a smooth recovery and beautiful, lasting results.",
  ],
};

export const CANDIDATE = {
  eyebrow: "Am I a candidate?",
  headline: ["You may be a suitable candidate", "if this sounds familiar"] as const,
  intro:
    "Not every full cheek is buccal fat, and not every face benefits from reducing it. The right candidate has genuine buccal fullness in the mid face and enough underlying structure for the definition to read naturally once it's reduced. That's exactly what your consultation establishes.",
  items: [
    "You have naturally fuller cheeks that remain despite maintaining a healthy weight",
    "You want a slimmer, more defined lower face",
    "You've lost weight everywhere else and the cheeks stayed full",
    "You've tried dieting and exercise, and the mid face never changed",
    "You're a busy professional wanting maximum impact with minimal disruption — a quick recovery, several concerns addressed at once",
  ],
  note: "Not sure whether it's buccal fat? That's the first thing your consultation confirms.",
};

export const REVIEWS = {
  eyebrow: "Patient stories",
  headline: ["In their", "own words"] as const,
  /**
   * Five genuine patient reviews, supplied by the clinic and reproduced
   * VERBATIM — including their typos. Editing a patient`s words changes a
   * quote attributed to a real person, so the two that read as
   * transcription slips ("Juno start", "from the begging to end") are left
   * exactly as written. Correct them at source or not at all.
   *
   * Names are the reviewers` own handles from the platform they were left
   * on. Inventing tidier initials would misattribute them.
   *
   * ── READ THIS BEFORE THE PAGE GOES LIVE ─────────────────────────────
   * NONE of these describe buccal fat removal, and none were performed in
   * Dubai. They are body-contouring reviews from the Colombian practice —
   * gluteal biopolymer removal, liposculpture with augmentation — and two
   * name "Majestic" rather than the Dubai clinic. `meta` states the actual
   * procedure for each, because labelling them "Buccal fat removal" would
   * be a fabricated claim on a medical page.
   *
   * That honesty is what makes the mismatch visible to a visitor: someone
   * researching a facial procedure reads five testimonials about bodies.
   * Facial-surgery reviews would convert better and carry less risk.
   *
   * Separately: DHA advertising rules restrict patient testimonials in
   * healthcare marketing in Dubai. Get this section through the same
   * approval as the rest of the copy before running traffic on it — the
   * risk is the testimonials themselves, not just their wording.
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
        "It was a wonderful experience, great human quality, beautiful results, I loved it. I recommend him, excellent surgeon, always available to clarify any doubts The attention of all the staff in general is excellent.",
      name: "Courageous739392",
      meta: "Patient review",
    },
    {
      quote:
        "Dr Luis Fernando Reyes is a life changing surgeon. He completely changed my life and gave me the Juno start I needed on my fitness journey. If you are looking for a highly professional, extremely talented, safe and trustworthy dr, look no further. Dr Luis’ work is the closest thing to magic on this earth. The results I experienced were above and beyond my expectations. I came home with a brand new body and my confidence restored. Dr Luis and his entire team made my trip to Colombia comfortable and seamless. If I had to do it, I would do it all over again with dr Luis because I know 100% I am in good hands. I cannot thank dr Luis enough, I am grateful for him everyday.",
      name: "Kap5645",
      meta: "Body contouring · Colombia",
    },
    {
      quote:
        "My experience with Dr. Reyes was terrific!!! His team is top-notch, his facility is high end and his sculpting skills are advanced. My body healed quickly and my results are exactly what I wanted. Everything is proportionate to my size. I had a liposculpture surgery with augmentation to hips and butt. Dr. Reyes listened to everything I wanted - he went above and beyond! I look like a Barbie doll! I only trust the Majestic team with my body! Thank you Dr. for giving me the body of my dreams.",
      name: "Laluna2016",
      meta: "Liposculpture with hip & gluteal augmentation",
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
  meta: string;
  /** Not a real review — dev-only, never rendered in production. */
  placeholder?: boolean;
};

export const FAQ = {
  eyebrow: "Questions",
  headline: ["The things people", "actually ask"] as const,
  items: [
    {
      q: "Will it look natural or overdone?",
      a: "The goal is to reveal the cheekbone and jawline definition you already have, not to strip the cheeks bare. Only the precise amount is removed, so the result reads as “born with it” rather than “had something done.”",
    },
    {
      q: "Will there be visible scars?",
      a: "None. Every incision is made inside the mouth, so there's nothing on the outside of your face. No one needs to know unless you choose to tell them.",
    },
    {
      q: "Is the result permanent?",
      a: "Yes. Once the buccal fat is reduced, those fat cells don't regenerate — so the fullness won't return, even as your weight fluctuates. It's a one-time change, with no fillers to top up.",
    },
    {
      q: "How long is the recovery?",
      a: "Short. Most people are back to normal activities within about a week, with some mild swelling early on that settles as you heal. Individual recovery varies.",
    },
    {
      q: "Does it hurt?",
      a: "The area is fully numbed with local anaesthetic before anything begins, so you're comfortable throughout.",
    },
    {
      q: "What happens at the consultation?",
      a: "Your face is examined to confirm the fullness is genuinely buccal fat, and your goals are talked through honestly. You'll leave knowing whether this is right for you, what to realistically expect, and with your questions answered.",
    },
    {
      q: "Is there a suitable age range?",
      a: "Rather than going by age alone, each patient is evaluated individually — looking at your facial anatomy, the amount and position of buccal fat, and how your features are likely to change over time. A face at one age can be a strong candidate while another isn't, so it's the structure of your face, not a number, that guides the decision. Your consultation is where that's assessed properly.",
    },
  ],
};

export const BOOKING = {
  eyebrow: "Book your consultation",
  headline: ["Your best features", "deserve to be seen"] as const,
  /** Opens larger than the rest — it's the line the section turns on. */
  lead: "Sometimes, subtle changes create the biggest difference.",
  body: [
    "By carefully refining facial contours, buccal fat removal can reveal greater definition while preserving what makes your face uniquely yours.",
    "Book a personalised consultation with Dr. Luis to explore whether buccal fat removal is the right choice for you.",
  ],

};
