# Launch checklist — `buccal-fat-removal`

Work top to bottom. Nothing below requires touching page or section code.

> **This checklist is per page.** Sections 2 onward (DHA approval, lead
> delivery, tracking, QA) apply unchanged to `/brazilian-butt-lift` —
> substitute the slug, and note the verify scripts now take it as a second
> argument. Section 1 is page-specific, and that page has three extra
> content items of its own:
>
> - [ ] **Confirm `ba-10`** in `app/brazilian-butt-lift/content.ts` →
>       `GALLERY`. It is labelled `result`, not `pair`, because neither
>       half reads as a "before". If it is a before/after, change `kind`.
> - [ ] **Confirm `ba-7`**, which carries a different surgeon's watermark
>       (NE / Nicole Echeverry) rather than Dr. Luis's.
> - [ ] **Confirm `ba-9`**, an intra-operative photograph. Legitimate as a
>       before/after; also the most clinical image on the page.

---

## 1. Content sign-off

- [ ] **Replace placeholder reviews — BLOCKING.**
      `app/buccal-fat-removal/content.ts` → `REVIEWS.items`. Five of six
      carry `placeholder: true`; they are written to demonstrate the
      layout, not supplied by patients. Only the "Margo" entry came from
      the clinic, and the source document supplied it three times.
      Replace `quote` and `name`, then delete the flag.
- [ ] **Set `SHOW_PLACEHOLDER_REVIEWS = false`** in `lib/site.ts`, then
      confirm nothing unfinished shipped:
      ```bash
      npm run build
      grep -c "placeholder" .next/server/app/buccal-fat-removal.html   # expect 0
      ```
      *Fabricated testimonials on a paid medical ad are both a Google Ads
      policy violation and a regulatory risk under DHA advertising rules.
      The switch makes removing them one line — it cannot supply real
      ones.*
- [ ] **Confirm the results photography.** The gallery currently uses
      reference art, not identified patient records. If you swap in real
      consented clinical photos, set `SHOW_RESULTS_DISCLAIMER = false` in
      `lib/site.ts` (or keep it — "individual results vary" is a
      reasonable line to leave up either way).
- [ ] **Verify BOTH numbers and the email** in `lib/site.ts`. There are two
      and they are not interchangeable:
      - `phoneDisplay` / `phoneHref` — **`+971 55 557 2547`**, the voice
        line. Appears in the **footer only**, plus `telephone` in the
        structured data (which drives click-to-call in search results).
      - `contactDisplay` / `contactHref` / `whatsappHref` — **`+971 56 663
        6359`**, WhatsApp. Every other touchpoint on every page.
- [ ] **Confirm `+971 56 663 6359` answers voice calls.** Four affordances
      are labelled "call" and dial it — the sticky bar's phone icon, the FAQ
      button, the 404 and the form's error message. If it is WhatsApp-only,
      repoint those at `whatsappHref` or remove them; a call button that
      rings nothing is worse than no call button.
- [ ] **Verify the email** — `luisfernandoreyesmd@yahoo.com`.
      *A yahoo.com address on a premium clinic page reads as less
      established than a domain address — worth considering.*
- [ ] **Check the clinic location link** resolves correctly:
      `SITE.mapUrl`.
- [ ] **Add the clinic's street address — OUTSTANDING.** `SITE.addressLines`
      in `lib/site.ts` is empty. An earlier value was read off a
      text-searched Google listing and sat on a different street from the
      coordinates the clinic supplied, so it was removed rather than left
      to send patients to the wrong building.
      The map is correct regardless (it is pinned by coordinates), and
      `GeoCoordinates` is already in the structured data. Adding the
      address fills the footer and `streetAddress` together.
- [ ] Optionally set `SITE.openingHours` — the footer row appears only if
      it's filled in.
- [ ] Proofread `content.ts` end to end. Every word on the page is in
      that one file.

---

## 2. Regulatory (UAE / DHA)

Health-service advertising in Dubai requires prior approval, and claims
about outcomes are scrutinised.

- [ ] Get the page copy and imagery through **DHA advertising approval**
      before spending on traffic.
- [ ] **The general medical disclaimer has been removed from the footer**
      at the client's request. Confirm with whoever handles DHA advertising
      approval that the page is acceptable without it — only the results
      photography disclaimer remains. Restoring it is one paragraph in
      `components/lp/Footer.tsx`.
- [ ] Confirm written patient consent exists for any real before/after
      photography used.

---

## 3. Domain and hosting

- [x] Point the ads subdomain `surgery.luisfernandoreyesmd.com` at the VPS
      with an A record — **before** reloading Caddy, or the certificate
      request fails. See [deployment.md](deployment.md). *Done: resolves to
      169.58.92.105, unproxied.*
- [x] Create `/opt/sites/dr-luis-landing-pages/.env` — `IMAGE`,
      `CONTAINER_NAME` and `SITE_PORT=3102`. Not `SITE_URL`; that is a build
      arg and the deploy script strips it from this file.
- [x] Set the `SITE_URL` Actions **variable** to that exact origin, then
      rebuild. It drives canonical URLs, Open Graph and the JSON-LD, and it
      is baked in at **build** time — setting it on the server and
      restarting does nothing. *Confirmed baked into the running image.*
- [x] Add the Caddy block and `caddy reload` (not restart — a restart drops
      requests on every other site). *There was no Caddy on this server at
      all; it was created from scratch at `/opt/sites/caddy`.*
- [x] Confirm HTTPS and that `http://` redirects to `https://`. *308.*
- [x] Remove `BIND_ADDR=0.0.0.0` from `.env` if it was set for previewing —
      it publishes the port with no certificate. *The deploy script does this
      itself once `SITE_URL` is set; container is on `127.0.0.1:3102`.*
- [x] Confirm `/` serves the index (`app/page.tsx`) and that every card on
      it opens the right page. It used to 307 to `/buccal-fat-removal`;
      that redirect has been removed.
- [x] Confirm the index is still `noindex, follow` and that each landing
      page is still indexable.

---

## 4. Lead delivery

- [x] Implement delivery. Leads are emailed over SMTP by `lib/lead-mail.ts`
      to both clinic addresses, subject `[Page Name] New consultation
      request — <name>`, `Reply-To` set to the patient.
- [x] Put any API key in an environment variable, never in the repo. *The
      SMTP credentials are runtime env in `.env` on the VPS; the deploy
      script redacts them from the CI log.*
- [x] **Add the four `SMTP_*` keys to `/opt/sites/dr-luis-landing-pages/.env`
      and restart.** *Done — `smtp.gmail.com:587` as `drnicole.ads@gmail.com`
      with a Gmail app password. `.env` is `600`, owned by `deploy`.*
- [x] **Submit a real test lead** and confirm it arrives at the clinic.
      *Done from the live site; Gmail accepted it for both clinic addresses.
      Tested first with `LEAD_TO` pointed at the sending mailbox, then again
      with it removed.*
- [ ] Confirm with the clinic that the test email actually **landed in the
      inbox, not spam** — acceptance by Gmail is not the same as arrival,
      and the Yahoo address is the more likely of the two to filter it.
- [ ] Confirm someone owns follow-up. Speed-to-lead is the single largest
      lever on paid-traffic conversion — minutes, not hours.
- [ ] Test the failure path: the form shows a fallback phone number if
      delivery fails, so nobody hits a dead end.

---

## 5. Tracking

- [x] Create the GTM container; put its ID in `lib/analytics.ts`.
      *Done — `GTM-NHBRF7G5`, script plus the `<noscript>` iframe, verified
      present in the prerendered HTML of all three pages.*
- [ ] Create the Google Ads conversion action for **form submit** and wire
      it in GTM to the `form_submit` dataLayer event.
- [ ] Add secondary conversions for `call_click` and `whatsapp_click`.
- [ ] Link Google Ads ↔ GA4.
- [ ] Verify in GTM Preview that every event fires:
      `cta_click`, `call_click`, `whatsapp_click`, `form_start`,
      `form_submit`, `form_error`, `slider_interact`, `faq_open`.
- [ ] Submit a test lead with `?gclid=test123` in the URL and confirm the
      value travels with the lead.

> The container now loads on every page, so **anything you do on the live site
> is recorded** — test submissions included. Filter them out in GA4/Ads, or set
> the `NEXT_PUBLIC_GTM_ID` variable to `off` and rebuild while testing.
>
> The tags *inside* the container are still to be built. GTM loading is not the
> same as a conversion being reported: the event contract in
> [ads-readiness.md](ads-readiness.md) is what the tags must be built against.

---

## 6. Pre-flight QA

- [ ] Run `npm run build` — it must complete with no errors.
- [ ] Open the page on a **real phone**, not just a simulator. Check the
      sticky bottom bar, that click-to-call opens the dialler, and that
      WhatsApp opens the right conversation.
- [ ] Drag the hero before/after slider on touch.
- [ ] Tab through the whole page — focus must always be visible.
- [ ] Submit the form with deliberately bad input and confirm inline
      errors appear and focus moves to the first problem.
- [ ] Enable "reduce motion" in OS settings and reload — the page must be
      fully readable and static.
- [ ] Run Lighthouse (mobile). Targets: Performance ≥ 90, Accessibility
      ≥ 95, Best Practices ≥ 95, SEO ≥ 95.
- [ ] Validate structured data at
      <https://search.google.com/test/rich-results>.

---

## 7. Google Ads setup

- [ ] Final URL: `https://<subdomain>/buccal-fat-removal`
- [ ] Enable auto-tagging (required for `gclid` capture).
- [ ] Match ad copy to the page headline — "Buccal Fat Removal", "sharper
      cheekbones", "no scarring on the face". Message match is a direct
      Quality Score input, and Quality Score discounts your CPC.
- [ ] Add sitelinks pointing at `#results`, `#surgeon`, `#faq`.
- [ ] Add call extensions using the same number as the page.
- [ ] Set geo-targeting to Dubai / UAE.
- [ ] Confirm the page passes Google Ads' healthcare policy review before
      scaling budget.

---

## 8. After launch

- [ ] Watch `scroll_depth` and `faq_open` in GA4 to see where attention
      drops off.
- [ ] Compare `form_submit` against `call_click` + `whatsapp_click` —
      in the UAE, messaging often outperforms forms, and if so the sticky
      bar ordering is worth revisiting.
- [ ] A/B the hero headline once there is enough traffic to read a result.
