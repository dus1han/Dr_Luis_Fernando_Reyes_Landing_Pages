import type { Metadata } from "next";
import { Footer } from "@/components/lp/Footer";
import { Nav } from "@/components/lp/Nav";
import { ScrollProgress } from "@/components/lp/ScrollProgress";
import { StickyCTA } from "@/components/lp/StickyCTA";
import { MAPS, SITE } from "@/lib/site";
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

const TITLE = "Buccal Fat Removal in Dubai | Sharper Cheekbones & Jawline";
const DESCRIPTION =
  "Buccal fat removal by Dr. Luis Fernando Reyes — double board certified plastic surgeon with 19+ years of international experience. Sharper cheekbones, a defined jawline, no scarring on the face. Book a consultation in Dubai.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: `/${SLUG}` },
  openGraph: {
    type: "website",
    title: TITLE,
    description: DESCRIPTION,
    url: `${SITE.baseUrl}/${SLUG}`,
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
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION },
};

/** Structured data — richer Google results and clearer entity signals. */
function StructuredData() {
  const graph = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Physician",
        "@id": `${SITE.baseUrl}/#physician`,
        name: SITE.doctor,
        medicalSpecialty: "PlasticSurgery",
        telephone: SITE.phoneDisplay,
        email: SITE.email,
        url: SITE.baseUrl,
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
          "Most patients return to normal activities within about a week, with mild early swelling that settles during healing.",
        performer: { "@id": `${SITE.baseUrl}/#physician` },
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
