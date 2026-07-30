import type { MetadataRoute } from "next";
import { LIVE_PAGES } from "@/lib/pages";
import { INDEXABLE, ORIGIN } from "@/lib/site-url";

/**
 * Built from `lib/pages.ts`, so adding a landing page puts it in the sitemap
 * with no second place to remember.
 *
 * Deliberately absent:
 *   • `/` — the root index is a hub for an ads subdomain and is `noindex`.
 *   • `/<slug>/thank-you` — a confirmation page has no business in search,
 *     and indexing one invites strangers onto it from a query, which is both
 *     confusing and a source of phantom conversions if the conversion action
 *     is ever switched to a URL rule.
 *   • `planned` pages — they have no route yet, so they would 404.
 *
 * `robots.ts` only advertises this file when the origin is a real HTTPS
 * hostname; on a preview build nothing points at it.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  /*
   * Empty on a preview build.
   *
   * `robots.ts` already declines to advertise this file, and a compliant
   * crawler would not fetch it — but the route still answered 200 with a list
   * of live URLs on a host that is about to stop existing, which is the one
   * thing left on a preview that volunteers addresses to anything that guesses
   * the path. Costs nothing to close.
   */
  if (!INDEXABLE) return [];

  return LIVE_PAGES.map((page) => ({
    url: `${ORIGIN}/${page.slug}`,
    changeFrequency: "monthly" as const,
    priority: 1,
  }));
}
