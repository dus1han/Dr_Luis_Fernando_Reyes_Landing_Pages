# Google Ads readiness — origin, indexing and conversions

Two things this covers: what the site says its own address is, and how it
reports a lead. Both fail silently when wrong, which is why each has a check
that runs rather than a note that says it was done.

---

## 1 · One origin, and it is a build-time value

Every hostname comes from `ORIGIN` in `lib/site-url.ts`, fed by the `SITE_URL`
repository **variable** passed as a Docker **build arg**.

**Setting `SITE_URL` on the running container does nothing.** Every page here
is statically prerendered, so canonical tags, `og:url`, `robots.txt`,
`sitemap.xml` and the JSON-LD are written to disk during `next build`. This was
measured, not assumed: with the variable set only at runtime, the canonical tag
still carried the build-time default.

Consequences:

- **Changing the hostname is a rebuild**, not a restart. Push, or *Actions →
  Run workflow*.
- `docker-compose.yml` deliberately does not set it, and
  `deploy/remote-deploy.sh` strips it from `.env` if anyone adds it back — a
  line that reads as authoritative and does nothing is worse than no line.
- The deploy compares the origin baked into the pulled image against the
  current variable and warns when they disagree.

---

## 2 · Indexing is derived from the origin, not from a flag

`INDEXABLE` in `lib/site-url.ts`. A real deployment is **https + a hostname**.
A bare IP, a port, plain HTTP, or nothing configured is a preview and is
`noindex` plus a `robots.txt` disallow.

There is no `PRODUCTION=true` switch on purpose. That is one more thing to set
correctly under time pressure, and it fails silently in exactly the situation
where nobody is checking. The origin already carries the answer, so the day the
variable becomes a real hostname, indexing turns itself on.

**Unset means noindex.** The fallback origin exists so URLs are well-formed,
not as a claim the site has launched — and the site is publicly reachable while
being previewed, so the permissive default is the dangerous one. If Google
indexes a preview address, that copy competes with the real domain for the same
content on launch day, and removing it afterwards is slow and manual.

### AdsBot is allowed in both states

`AdsBot-Google` and `AdsBot-Google-Mobile` are named explicitly in `robots.ts`
whether or not the site is indexable.

Google Ads crawls landing pages with AdsBot to assess quality and policy. An ad
whose destination it cannot fetch is disapproved as *destination not
crawlable* — that stops the campaign, not just the SEO.

These agents ignore `User-agent: *` by design, so the blanket disallow does not
actually block them and the rule is strictly redundant today. **It is there
because that is non-obvious**: someone tightening `robots.txt` later would
otherwise take the ads down with no way of knowing, and nothing would error.

Being indexed and running ads are unrelated. A `noindex` page runs ads fine.

### Verified against real image builds

| `SITE_URL` | `robots.txt` | meta robots (landing) | sitemap | page |
|---|---|---|---|---|
| unset | `Disallow: /` + AdsBot allow | `noindex, nofollow` | empty | 200, form works |
| `http://<ip>:<port>` | `Disallow: /` + AdsBot allow | `noindex, nofollow` | empty | 200, form works |
| `https://real.host` | `Allow: /`, `Disallow: /api/`, sitemap line | `index, follow` | 1 URL | 200, form works |

The root index stays `noindex` in all three — it is a hub, not a landing page —
and the thank-you page is `noindex, nofollow` unconditionally.

The page serves identically in every state. The origin changes what the site
*advertises about itself*, never whether it works.

---

## 3 · The conversion signal

The site announces *"a lead was submitted"*. GTM decides who hears about it.

```js
{ event: 'generate_lead', form_name: 'consultation_request', form_location: '<slug>' }
```

That is the entire contract — build every tag against it. Adding GA4, Meta
Pixel or TikTok later needs no code change and no deploy. `form_location` is
what lets one GTM container serve every landing page on this subdomain and
still report which produced the lead.

No tracking IDs in the repository. `NEXT_PUBLIC_GTM_ID` is a repository
variable passed as a build arg; unset, the container script renders nothing —
no requests, no errors, no console noise — and the build **warns rather than
fails**. Tracking is a marketing concern and must never be able to take the
clinic's page offline.

### A real page, not a modal

Submitting navigates to `/<slug>/thank-you` with `window.location.assign` — a
full navigation, not a router push. That guarantees a clean document and a
single unambiguous page view for the tag to observe, which matters the day
someone switches the conversion action to a URL rule and expects it to work.

The form's old inline success card gave a URL rule nothing to hang on, no
shareable confirmation, and nothing to screenshot for the clinic.

### Firing exactly once

A one-time `sessionStorage` flag is set on submit; the thank-you page reads it,
clears it, and only then pushes. **Not a query parameter** — those survive
sharing, so a forwarded link would report a lead nobody submitted.

Google's bidding optimises toward whatever it is told, so a false positive
actively spends the clinic's budget in the wrong direction. **Inflated
conversion counts are worse than none.** If storage is blocked the event is
skipped rather than guessed.

### Click IDs, captured on landing

`gclid`, plus `wbraid` and `gbraid` which Google substitutes on iOS, are read
from the landing URL by `<ClickIdCapture>` in the root layout and stored for
**90 days** — the longest Google Ads click-through window.

In the layout, not the form, because the ID only exists in the URL the visitor
*landed* on. Someone who arrives from an ad, leaves, and returns days later to
enquire would otherwise submit unattributed — precisely the considered
conversion worth the most. `localStorage`, not `sessionStorage`, for the same
reason.

Nothing consumes it yet. It is there so the clinic can later import **offline
conversions**: telling Google Ads which enquiries became real patients. That is
the difference between bidding for form fills and bidding for customers, and
**it cannot be backfilled** — the click ID has to be captured at the time or it
is gone.

The three are submitted as separate fields, because they are not
interchangeable to an offline-conversion import.

### Verify with the script, not by clicking

```bash
npm run verify:conversion -- https://the-deployed-url
```

Drives a real browser and asserts all eleven checks. **Items 8 and 9 — refresh
and direct visit — are the ones that matter and the ones normally skipped.**
Re-run after any change to the form or the thank-you page.

Current result against a production image: **11/11**.

---

## 4 · In Google Ads and GTM

- Conversion action: **Submit lead form**, Count = **One**. A person becomes a
  patient once; this setting alone prevents most double-counting.
- **Add the Conversion Linker tag on All Pages.** Without it Google Ads cannot
  read the click ID, so conversions are attributed to "direct" rather than to
  the ad that paid for them. It is the most commonly forgotten tag, and
  everything looks like it is working while quietly mis-attributing.
- Trigger: Custom Event, event name `generate_lead`.
- Test in GTM **Preview** before publishing: submit a real test enquiry,
  confirm the tag fires, **then refresh the thank-you page and confirm nothing
  fires again.**

---

## 5 · Order before spending

1. DNS → 2. TLS → 3. `SITE_URL` set **and rebuilt** → 4. GTM and the conversion
action tested with Tag Assistant → 5. *then* point ads at it.

Spend that happens before conversion tracking works is spend Google cannot
learn from, and **it cannot be backfilled**.

> ### Do not run ads on the IP
> Google Ads rejects IP-address final URLs outright. And a form collecting a
> name, phone number and medical interest over plain HTTP shows **"Not secure"**
> in Chrome — a conversion problem before it is a policy problem.

> ### Naming, if more campaigns are coming
> A campaign-named subdomain forces `buccalfat.example.com/buccal-fat-removal` —
> redundant as a display URL, and every new campaign then needs its own DNS
> record and Caddy block. A generic one is one record, one container, unlimited
> pages.
>
> **Settled: `surgery.luisfernandoreyesmd.com`.** It carries pages 2–4 as
> routes on the same container — `…/buccal-fat-removal`, `…/rhinoplasty` — with
> no new DNS record or Caddy block per campaign. It also avoids `go.` and `lp.`,
> which read as a redirect and as internal jargon respectively and quietly
> undercut trust in a medical ad. The display URL in the ad does not have to
> match the real path, so the path can stay tidy.

---

## 6 · Lead delivery

**Done — leads are emailed to the clinic.** `lib/lead-mail.ts` sends over SMTP
to `drluisfernandomarketing@gmail.com` and `luisfernandoreyesmd@yahoo.com`, with
the page name in the subject:

```
[Buccal Fat Removal] New consultation request — Jane Doe
```

`Reply-To` is the patient's own address, so replying answers them directly, and
the body carries a `wa.me` link built from the number they typed — the clinic
works WhatsApp-first and retyping a number is where a fast callback goes to die.
The Google Ads click ID travels with it, because whoever eventually runs an
offline-conversion import is reading the inbox, not `docker logs`.

The credentials are **runtime** values in `.env` on the VPS, not build args —
see "Lead delivery" in [deployment.md](deployment.md) for the four keys.

> ### Reporting a conversion nobody receives is worse than not tracking at all
> The campaign optimises toward leads, Google reports success, and the enquiries
> sit in a container log until it rotates. Two things guard against a silent
> regression:
>
> - Every lead is written to the container log **before** the send is attempted,
>   so a relay outage costs a notification but never the lead itself.
> - `deploy/remote-deploy.sh` warns on every run while `SMTP_HOST`, `SMTP_USER`
>   or `SMTP_PASS` is missing. The site looks identical either way, so this is
>   the only place the gap is visible.
>
> Confirm delivery with a real submission before the first ad runs —
> `npm run test:lead -- https://surgery.luisfernandoreyesmd.com` — having first
> pointed `LEAD_TO` at yourself.
