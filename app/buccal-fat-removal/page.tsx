import type { Metadata } from "next";
import { Footer } from "@/components/lp/Footer";
import { Nav } from "@/components/lp/Nav";
import { ScrollProgress } from "@/components/lp/ScrollProgress";
import { StickyCTA } from "@/components/lp/StickyCTA";
import { MAPS, SITE } from "@/lib/site";
import { ORIGIN } from "@/lib/site-url";
import { FAQ, NAV_LINKS, SLUG } from "./content";
import { Anatomy } from "./sections/Anatomy";
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
import { Surgeon } from "./sections/Surgeon";

/*
 * The tab title. The root layout appends " | Dr. Luis Fernando Reyes", so this
 * has to stay short — the previous value carried its own "| Sharper Cheekbones
 * & Jawline" and came out at 74 characters, well past what a tab shows or what
 * Google keeps in a result.
 */
const TITLE = "Buccal Fat Removal in Dubai";

/*
 * Kept longer than the tab title, and deliberately not the same string.
 * A shared link or an OG preview has room for the benefit, and that is where
 * it earns a click — unlike a tab, which truncates it away.
 */
const SHARE_TITLE = "Buccal Fat Removal in Dubai | Sharper Cheekbones & Jawline";

const DESCRIPTION =
  "Buccal fat removal by Dr. Luis Fernando Reyes — double board certified plastic surgeon with 19+ years of international experience. Sharper cheekbones, a defined jawline, no scarring on the face. Book a consultation in Dubai.";

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
        url: `/${SLUG}/hero-after.jpg`,
        width: 766,
        height: 860,
        alt: "Facial contouring result after buccal fat removal",
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
      {
        "@type": "Physician",
        "@id": `${ORIGIN}/#physician`,
        name: SITE.doctor,
        medicalSpecialty: "PlasticSurgery",
        telephone: SITE.phoneDisplay,
        email: SITE.email,
        url: ORIGIN,
        sameAs: [SITE.instagram, SITE.facebook],
        address: {
          "@type": "PostalAddress",
          // Emitted only once a real street address is filled in, so the
          // markup never claims a location the site can't show.
          ...(SITE.addressLines.length
            ? { streetAddress: SITE.addressLines.join(", ") }
            : {}),
          addressLocality: SITE.city,
          addressCountry: "AE",
        },
        // Coordinates are clinic-supplied and exact, so they carry the
        // location for local search even while the street address is
        // still outstanding.
        ...(SITE.coords
          ? {
              geo: {
                "@type": "GeoCoordinates",
                latitude: SITE.coords.lat,
                longitude: SITE.coords.lng,
              },
            }
          : {}),
        hasMap: MAPS.place,
      },
      {
        "@type": "MedicalProcedure",
        name: "Buccal Fat Removal",
        alternateName: "Buccal Lipectomy",
        bodyLocation: "Mid face",
        procedureType: "https://schema.org/SurgicalProcedure",
        howPerformed:
          "The buccal fat pad is accessed through a small incision inside the mouth under local anaesthetic, and a precise amount of fat is removed to reveal cheekbone and jawline definition. No incisions are made on the outside of the face.",
        followup:
          "Most patients return to normal activities within 4-5 days, with mild early swelling that settles during healing.",
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

export default function BuccalFatRemovalPage() {
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
        <Anatomy />
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

      <Footer />
      <StickyCTA />
    </>
  );
}
