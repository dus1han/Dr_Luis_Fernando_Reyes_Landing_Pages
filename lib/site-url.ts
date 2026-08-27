import type { Metadata } from "next";

/**
 * The public origin this site is served from, and whether that origin is real
 * enough to invite Google into.
 *
 * Canonical URLs, Open Graph tags, the sitemap and the JSON-LD all have to
 * agree on one hostname. Getting it wrong is quiet and expensive: Google
 * indexes the wrong host, canonical tags point somewhere that 404s, and
 * structured data is rejected — none of which shows up when you look at the
 * page.
 *
 * **This is read at BUILD time, not runtime — verify before assuming
 * otherwise.** Every page here is statically prerendered, so the value is
 * baked into the HTML, `robots.txt` and `sitemap.xml` on disk during
 * `next build`. Setting `SITE_URL` in the container's environment and
 * restarting changes nothing.
 *
 * That is why the Dockerfile takes `SITE_URL` as a **build arg**, fed by the
 * `SITE_URL` repository variable, and why `docker-compose.yml` deliberately
 * does *not* set it — a value there would look authoritative and do nothing.
 * `deploy/remote-deploy.sh` strips it from `.env` if anyone adds it back, and
 * warns when the variable no longer matches what the pulled image was built
 * with.
 *
 * **Changing the domain needs a rebuild** — push, or *Actions → Run workflow*.
 *
 * **Server-only.** In a client component `process.env.SITE_URL` compiles to
 * `undefined`. Nothing here imports it from the client, and nothing should —
 * if a client component ever needs the origin, use a relative URL.
 */
const CONFIGURED = (process.env.SITE_URL || "").trim();

/** No trailing slash, or every generated URL gets a double one. */
export const ORIGIN = (
  CONFIGURED || "https://surgery.luisfernandoreyesmd.com"
).replace(/\/+$/, "");

/**
 * Whether this build is allowed to be indexed.
 *
 * **Derived from the origin rather than a separate flag, on purpose.** A
 * `PRODUCTION=true` switch is one more thing to set correctly under time
 * pressure, and it fails silently in exactly the situation where nobody is
 * checking. The origin already carries the answer: the day `SITE_URL` becomes
 * a real HTTPS hostname, indexing turns itself on.
 *
 * A real deployment is HTTPS on a hostname. A bare IP, a port, plain HTTP or
 * nothing configured is a preview.
 *
 * **Unset means noindex.** The fallback above exists so URLs are well-formed,
 * not as a claim that the site has launched — and the site is publicly
 * reachable while being previewed, so the permissive default is the dangerous
 * one. If Google indexes a preview address, that copy competes with the real
 * domain for the same content on launch day, and removing it afterwards is
 * slow and manual.
 *
 * Being indexed and running ads are unrelated: a `noindex` page serves ads
 * perfectly well. See `app/robots.ts` for why AdsBot is named explicitly.
 */
export const INDEXABLE = (() => {
  if (!CONFIGURED) return false;
  try {
    const { protocol, hostname } = new URL(ORIGIN);
    if (protocol !== "https:") return false;
    // IPv4 literal, or IPv6 in brackets — never a production hostname.
    if (/^\d{1,3}(\.\d{1,3}){3}$/.test(hostname) || hostname.startsWith("[")) {
      return false;
    }
    return hostname.includes(".");
  } catch {
    return false;
  }
})();

/**
 * The robots directives every page emits, in one place.
 *
 * Shared because it is set TWICE — the root layout, and the index, which
 * overrides the layout's `robots` wholesale rather than merging into it.
 * Next does not deep-merge that field, so two literals had to agree by hand,
 * which is how they eventually stop agreeing.
 *
 * `max-image-preview: large` is why this exists at all. Leave it out and
 * Google applies its own default, which is not `large`, and the result gets a
 * thumbnail capped small enough to read as an afterthought. WordPress has put
 * this directive on every page since 5.7 for the same reason.
 *
 * **It sets the SIZE of the preview and nothing else.** Which image gets
 * chosen is decided by the page's own content and by `primaryImageOfPage` in
 * the JSON-LD. `large` pointed at the wrong image simply shows the wrong
 * image bigger.
 *
 * The `googleBot` block repeats index/follow on purpose. Google obeys the
 * most specific user-agent block it finds, so a `googlebot` tag carrying only
 * `max-image-preview` would take the `noindex` a preview build depends on
 * down with it — the directive would be honoured and the protection lost.
 */
export const ROBOTS: Metadata["robots"] = {
  index: INDEXABLE,
  follow: INDEXABLE,
  googleBot: {
    index: INDEXABLE,
    follow: INDEXABLE,
    "max-image-preview": "large",
  },
};
