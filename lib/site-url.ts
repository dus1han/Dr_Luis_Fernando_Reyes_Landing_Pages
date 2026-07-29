/**
 * The public origin this site is served from.
 *
 * Canonical URLs, Open Graph tags and the JSON-LD all have to agree on one
 * hostname. Getting it wrong is quiet and expensive: Google indexes the wrong
 * host, canonical tags point somewhere that 404s, and structured data is
 * rejected — none of which shows up when you look at the page.
 *
 * **This is read at BUILD time, not runtime — verify before you assume
 * otherwise.** Every page that consumes it (`/` and `/buccal-fat-removal`)
 * is statically prerendered, so the value is baked into the HTML on disk
 * during `next build`. Setting `SITE_URL` in the container's environment and
 * restarting changes nothing at all; the prerendered markup still carries
 * whatever origin the build saw.
 *
 * That is why the Dockerfile takes `SITE_URL` as a **build arg**, fed by the
 * `SITE_URL` repository variable, and why `docker-compose.yml` deliberately
 * does *not* set it — a value there would look authoritative and do nothing.
 * `deploy/remote-deploy.sh` strips it from `.env` if anyone adds it back, and
 * warns when the variable no longer matches what the pulled image was built
 * with.
 *
 * **Changing the domain therefore needs a rebuild** — push, or *Actions → Run
 * workflow*. Not a restart.
 *
 * The fallback below is the only default; the Dockerfile passes an empty
 * string rather than repeating it.
 *
 * **Server-only.** In a client component `process.env.SITE_URL` compiles to
 * `undefined` and this silently falls back to the default. Nothing on this
 * site imports it from the client, and nothing should start — if a client
 * component ever needs the origin, use a relative URL instead.
 *
 * No trailing slash, or every generated URL gets a double one.
 */
export const ORIGIN = (
  process.env.SITE_URL || "https://lp.drluisfernandoreyes.com"
).replace(/\/+$/, "");
