import type { Metadata } from "next";
import { Footer } from "@/components/lp/Footer";
import { Nav } from "@/components/lp/Nav";
import { ScrollProgress } from "@/components/lp/ScrollProgress";
import { StickyCTA } from "@/components/lp/StickyCTA";
import { physicianNode } from "@/lib/schema";
import { SITE } from "@/lib/site";
import { ORIGIN } from "@/lib/site-url";
import { FAQ, NAV_LINKS, SLUG } from "./content";
import { Assurance } from "./sections/Assurance";
import { Benefits } from "./sections/Benefits";
import { Booking } from "./sections/Booking";
import { Candidate } from "./sections/Candidate";
import { Faq } from "./sections/Faq";
import { Hero } from "./sections/Hero";
import { Procedure } from "./sections/Procedure";
import { Results } from "./sections/Results";
import { Reviews } from "./sections/Reviews";
import { Stats } from "./sections/Stats";
import { Steps } from "./sections/Steps";
import { Surgeon } from "./sections/Surgeon";

/*
 * The tab title. The root layout appends " | Dr. Luis Fernando Reyes", so
 * this has to stay short — anything carrying its own benefit clause runs
 * past what a tab shows or what Google keeps in a result.
 */
/*
 * "(BBL)" is in the title because that is how people search. The full
 * phrase and the initialism are effectively two different queries, and the
 * page can only match a query with words it contains — the body copy uses
 * "BBL" throughout, but the title is the strongest signal there is.
 *
 * 34 characters, plus the layout's " | Dr. Luis Fernando Reyes" = 60. That
 * is at the edge of what a result displays, which is the reason nothing
 * more goes in here.
 */
const TITLE = "Brazilian Butt Lift (BBL) in Dubai";

/*
 * Kept longer than the tab title, and deliberately not the same string.
 * A shared link or an OG preview has room for the benefit, and that is
 * where it earns a click — unlike a tab, which truncates it away.
 */
const SHARE_TITLE = "Brazilian Butt Lift in Dubai | Natural Curves, Your Own Fat";

/*
 * Kept under ~155 characters, which is roughly where Google truncates.
 *
 * The previous one ran to 260 and was cut mid-sentence, losing the CTA at
 * the end — the part doing the work. A description is not a ranking factor,
 * but it is most of what decides whether the result gets clicked, and half
 * a sentence trailing into an ellipsis reads as carelessness.
 */
const DESCRIPTION =
  "Brazilian Butt Lift (BBL) in Dubai by Dr. Luis Fernando Reyes, double board certified plastic surgeon. Natural curves from your own fat. Book a consultation.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: `/${SLUG}` },
  openGraph: {
    type: "website",
    title: SHARE_TITLE,
    description: DESCRIPTION,
    url: `${ORIGIN}/${SLUG}`,
    siteName: SITE.doctor,
    locale: "en_AE",
    images: [
      {
        url: `/${SLUG}/hero-bg.jpg`,
        width: 1000,
        height: 667,
        alt: "Balanced body proportions after Colombian body contouring",
      },
    ],
  },
  twitter: { card: "summary_large_image", title: SHARE_TITLE, description: DESCRIPTION },
};

/** Structured data — richer Google results and clearer entity signals. */
function StructuredData() {
  const graph = {
    "@context": "https://schema.org",
    "@graph": [
      physicianNode([`${ORIGIN}/${SLUG}#procedure`]),
      /*
       * Describes the PAGE, where the nodes above describe the surgeon and
       * the operation. Without it there is nothing for the breadcrumb to
       * attach to and nothing declaring what the page is primarily about.
       *
       * No `lastReviewed` or `reviewedBy`: both are real E-E-A-T signals on
       * medical pages and both are claims about a review process that has
       * not happened. Add them when the clinic confirms who signed the
       * content off and when — not before.
       */
      {
        "@type": "MedicalWebPage",
        "@id": `${ORIGIN}/${SLUG}#webpage`,
        url: `${ORIGIN}/${SLUG}`,
        name: SHARE_TITLE,
        description: DESCRIPTION,
        inLanguage: "en",
        about: { "@id": `${ORIGIN}/${SLUG}#procedure` },
        mainEntity: { "@id": `${ORIGIN}/${SLUG}#procedure` },
        provider: { "@id": `${ORIGIN}/#physician` },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: SITE.practice,
            item: ORIGIN,
          },
          { "@type": "ListItem", position: 2, name: TITLE },
        ],
      },
      {
        "@type": "MedicalProcedure",
        "@id": `${ORIGIN}/${SLUG}#procedure`,
        name: "Brazilian Butt Lift",
        /* Both initialisms people actually search, so the entity matches
           the query however it is phrased. */
        alternateName: ["BBL", "Gluteal fat transfer", "Gluteal augmentation"],
        bodyLocation: "Buttocks",
        procedureType: "https://schema.org/SurgicalProcedure",
        howPerformed:
          "Under general anaesthesia, fat is removed by liposuction from donor areas such as the abdomen, waist, flanks, back or thighs, purified, and injected into the buttocks to build shape and projection. The procedure typically takes three to five hours and is followed by a compression garment.",
        followup:
          "Most patients gradually return to light daily activities within a few weeks, with recovery guided by scheduled follow-up appointments to support healing and fat retention.",
        performer: { "@id": `${ORIGIN}/#physician` },
      },
      {
        "@type": "FAQPage",
        mainEntity: FAQ.items.map((item) => ({
          "@type": "Question",
          name: item.q,
          acceptedAnswer: { "@type": "Answer", text: item.a },
        })),
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }}
    />
  );
}

export default function BrazilianButtLiftPage() {
  return (
    <>
      <StructuredData />
      <ScrollProgress />
      <Nav links={NAV_LINKS} />

      <main>
        <Hero />
        <Stats />
        <Assurance />
        <Procedure />
        <Steps />
        <Benefits />
        {/* "Am I a candidate?" sits directly after the benefits: the
            visitor has just read what the procedure does, and the next
            question is whether it applies to them — before the proof. */}
        <Candidate />
        {/* The surgeon follows the candidate check: once a visitor thinks
            "that's me", the next question is who would be doing it. */}
        <Surgeon />
        <Results />
        <Reviews />
        <Faq />
        <Booking />
      </main>

      <Footer currentSlug={SLUG} />
      <StickyCTA />
    </>
  );
}
