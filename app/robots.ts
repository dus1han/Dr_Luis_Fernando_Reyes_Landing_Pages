import type { MetadataRoute } from "next";
import { INDEXABLE, ORIGIN } from "@/lib/site-url";

/**
 * AdsBot is named explicitly in BOTH states, and that is the important part.
 *
 * Google Ads crawls landing pages with AdsBot to assess quality and policy. An
 * ad whose destination it cannot fetch is disapproved as *destination not
 * crawlable* — which stops the campaign, not merely the SEO.
 *
 * These two agents ignore `User-agent: *` by design, so the blanket disallow
 * below does not actually block them and this rule is, strictly, redundant
 * today. It is here because that behaviour is non-obvious: someone tightening
 * robots.txt later would otherwise take the ads down with no way of knowing
 * they had, and no error anywhere to tell them.
 */
const ADS_BOTS = ["AdsBot-Google", "AdsBot-Google-Mobile"];

export default function robots(): MetadataRoute.Robots {
  // Preview — an IP, a port, plain HTTP, or no origin configured at all.
  // See INDEXABLE in lib/site-url.ts for why this is derived from the origin
  // rather than from a flag someone has to remember to set.
  if (!INDEXABLE) {
    return {
      rules: [
        { userAgent: "*", disallow: "/" },
        { userAgent: ADS_BOTS, allow: "/" },
      ],
      // No sitemap line: advertising a sitemap for a host that is about to
      // stop existing invites exactly the indexing this is preventing.
    };
  }

  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: "/api/" },
      { userAgent: ADS_BOTS, allow: "/" },
    ],
    sitemap: `${ORIGIN}/sitemap.xml`,
  };
}
