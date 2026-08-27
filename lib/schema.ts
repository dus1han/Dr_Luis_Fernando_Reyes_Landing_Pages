import { SHARED } from "@/lib/generated/images";
import { MAPS, SITE } from "@/lib/site";
import { ORIGIN } from "@/lib/site-url";

const PORTRAIT = SHARED["dr-portrait.jpg"];

/**
 * The surgeon, as one JSON-LD node, built in one place.
 *
 * This block used to be copied inline into each landing page. Adding it to
 * the root index as well would have made three copies of forty lines whose
 * only job is to be identical — and `@id` is what tells Google these are one
 * entity rather than three surgeons who happen to share a name. A copy that
 * drifts does not read as a typo; it reads as a different person, and the
 * name searches this node exists to win are exactly what would suffer.
 *
 * `availableService` is the only part that legitimately varies: a landing
 * page points at the procedure it is about, the index points at all of them.
 *
 * @param procedureIds `@id`s of the `MedicalProcedure` nodes this page
 *   declares. Pass an empty array on a page that declares none.
 */
export function physicianNode(procedureIds: string[]) {
  return {
    "@type": "Physician",
    "@id": `${ORIGIN}/#physician`,
    name: SITE.doctor,
    medicalSpecialty: "PlasticSurgery",
    telephone: SITE.phoneDisplay,
    email: SITE.email,
    url: ORIGIN,
    /*
     * The photograph that represents the surgeon, given its own `@id` so a
     * page can point `primaryImageOfPage` at this object rather than
     * declaring a second one that says the same thing.
     *
     * This is the ONLY place any page states which image is him, and it is
     * the reason the index used to show a buccal fat photograph in search
     * results: a result thumbnail is chosen from what Google finds on the
     * page, `openGraph.images` is not part of that, and the only images the
     * index rendered were two procedure shots marked `aria-hidden`.
     *
     * Absolute, not `PORTRAIT.src`. Structured data is read away from the
     * page it was served on, where a root-relative path resolves to nothing.
     */
    image: {
      "@type": "ImageObject",
      "@id": `${ORIGIN}/#portrait`,
      url: `${ORIGIN}${PORTRAIT.src}`,
      width: PORTRAIT.width,
      height: PORTRAIT.height,
      caption: SITE.doctor,
    },
    /*
     * `mainSite` is the load-bearing entry, not the social profiles.
     *
     * The clinic's established site carries the domain age and whatever
     * links it has earned; this subdomain starts from zero. Naming it here
     * is the only signal in this repo that connects the two, and it costs
     * nothing to state.
     */
    sameAs: [SITE.mainSite, SITE.instagram, SITE.facebook],
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
    // Coordinates are clinic-supplied and exact, so they carry the location
    // for local search even while the street address is still outstanding.
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
    /*
     * The service area, which is a different claim from the address and is
     * the one that matters for "… in Dubai" queries. Safe to state without
     * the street address, which is still outstanding.
     */
    areaServed: [
      { "@type": "City", name: SITE.city },
      { "@type": "Country", name: SITE.country },
    ],
    /*
     * Ties the surgeon to the procedures as an entity rather than leaving
     * unrelated nodes on the page.
     *
     * A single procedure stays a bare object rather than a one-element
     * array purely so the landing pages emit exactly the markup they were
     * validated with — schema.org treats the two as equivalent.
     */
    ...(procedureIds.length === 1
      ? { availableService: { "@id": procedureIds[0] } }
      : procedureIds.length
        ? { availableService: procedureIds.map((id) => ({ "@id": id })) }
        : {}),
  };
}
