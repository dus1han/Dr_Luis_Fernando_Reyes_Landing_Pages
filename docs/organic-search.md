# Ranking the two pages in Google

**Goal, as set:** get `/buccal-fat-removal` and `/brazilian-butt-lift` on
`surgery.luisfernandoreyesmd.com` ranking well — ideally better than the
main site.

Audited live on 2026-08-18. Everything below is measured from the deployed
pages and from the main site, not assumed. Where a number would need a tool
this repo does not have — search volumes, current positions, competitor
strength — it says so rather than inventing one.

---

## The one decision that dominates everything else

**Google treats a subdomain as substantially its own site for authority.**
`surgery.luisfernandoreyesmd.com` does not meaningfully inherit whatever
`luisfernandoreyesmd.com` has earned. It starts from zero.

That matters more than usual here, because of what the audit found on the
main site:

| | Main site | Ads subdomain |
|---|---|---|
| Procedure pages | **none** | 2 |
| Indexed content | 8 pages + 43 posts | 2 pages |
| Blog | 43 posts — playlists, face masks, vegan skincare | none |
| Links to the other property | **zero** | 14 mentions of the root domain |
| Platform | WordPress + Yoast, bilingual EN/ES | Next.js, static, fast |

Two things follow, and they pull in opposite directions.

**The good news.** The main site has *no* buccal fat page and *no* BBL page.
These two pages are not competing with anything the clinic already owns, and
"better than the main site" is a low bar for these queries — the main site
cannot rank for them because it has nothing to rank.

**The catch.** The fastest route to ranking these two terms is not to build
authority on a brand-new subdomain. It is to serve the same pages under the
main domain as a path — `luisfernandoreyesmd.com/brazilian-butt-lift-dubai/`
— where they inherit the domain's age and its existing links from day one.

### The recommendation, and the trade-off

If organic ranking is now a primary goal rather than a bonus, **serve these
pages from the main domain and keep the subdomain for ads only.** Same
Next.js app, same code, reverse-proxied at a path. Nothing about the design,
the form or the conversion tracking has to change.

If the subdomain has to stay the canonical home — because the WordPress host
cannot proxy, or because the ads/organic separation is worth keeping — then
everything below still applies, but expect it to take **longer**, and to lean
much harder on Phase 3 (local) and Phase 4 (links). That is where authority
for a new host actually comes from.

**Decide this before spending effort on content.** Migrating later means
redirects, re-indexing, and losing whatever the subdomain has accumulated.

---

## Where the pages stand today

The technical foundation is genuinely strong. This is not where the problem
is:

- Indexable, correct `robots.txt`, both pages in `sitemap.xml`
- Self-referencing canonicals on the right absolute origin
- One `h1`, 11 `h2`, 23 `h3` — a clean, real heading tree
- Schema: `Physician`, `MedicalProcedure`, `FAQPage`, `GeoCoordinates`
- Titles at 53 and 54 characters — inside what Google displays
- Statically prerendered, optimised imagery, LCP image prioritised
- `AdsBot` named explicitly, so an SEO change cannot take the ads down

What is missing is **not technical**. It is content depth, local signals and
links.

| Gap | Impact | Effort |
|---|---|---|
| No links from the main site to either page | High | Minutes |
| The two pages do not link to each other | Medium | Minutes |
| No cost or price content at all (0–1 mentions) | High | Half a day |
| No street address — weak local signals, no `LocalBusiness` | High | Blocked on the clinic |
| ~1,490 words against established competitors | Medium | Days |
| BBL meta description 260 chars, truncated at ~155 | Low | Minutes |
| No supporting or topical content on the subdomain | Medium | Ongoing |
| No `BreadcrumbList`, no medical-reviewer signals | Low | An hour |

---

## Phase 1 — Free wins, this week

Highest return per hour, and none of it needs new content.

1. **Link from the main site to both pages.** Zero links exist today. Add
   them to the main site's navigation, a procedures list and the footer, with
   descriptive anchor text ("Brazilian Butt Lift in Dubai"), not "click
   here". This is the cheapest authority transfer available, and the reason
   the subdomain currently looks orphaned to a crawler.
2. **Link the two pages to each other.** They share a surgeon, a clinic and
   an audience, and today there is no path between them. A short "other
   procedures" block in the footer is enough.
3. **Trim the BBL meta description** to ~155 characters so it is not cut
   mid-sentence in results.
4. **Add the subdomain to Google Search Console** and request indexing.
   Confirm both pages are actually indexed — `site:surgery.luisfernandoreyesmd.com`
   in Google is the two-second check.
5. **Verify the Google Business Profile exists and is claimed.** For "in
   Dubai" cosmetic-surgery searches the map pack sits above the organic
   results. If there is no GBP, that is a bigger loss than any on-page issue
   on this list.

## Phase 2 — Commercial-intent content

The pages are written to convert, which is not the same as written to rank.
Two specific gaps:

6. **Cost.** "cost" or "price" appears **once** on the buccal page and **not
   at all** on the BBL page. In this market, "bbl cost dubai" and "how much
   is a bbl in dubai" are among the highest-intent queries there are. A
   section giving an honest range, what moves it, and that the consultation
   confirms it, will earn traffic no amount of technical work will.
   *DHA advertising rules constrain how prices may be presented — put the
   wording through the same approval as the rest of the copy.*
7. **Depth on the questions people actually search.** Both pages sit at
   ~1,490 words. Competitors ranking for these terms in Dubai generally run
   longer, because they answer more. Candidates, several already gestured at
   by the existing FAQ: recovery week by week, risks and safety, what happens
   at the consultation, who is *not* a candidate, BBL versus implants, buccal
   fat versus fillers.
8. **Keep every claim inside what the clinic has actually said.** This is a
   YMYL medical page: Google holds it to a higher bar and DHA holds it to a
   legal one. The content files already refuse to invent facts — that
   discipline needs to survive the expansion.

## Phase 3 — Local, which is where Dubai searches actually land

9. **Fill in the street address.** `SITE.addressLines` is still empty, so the
   structured data emits no `streetAddress`. That is a direct local-ranking
   signal, and filling it also unblocks proper `MedicalClinic` /
   `LocalBusiness` markup. Blocked on the clinic, and the highest-value
   outstanding item on this whole list.
10. **Google Business Profile, properly.** Categories set to Plastic Surgeon,
    real photographs, procedures listed, hours, and a steady flow of genuine
    reviews. The map pack outranks everything organic for "plastic surgeon
    near me" and its variants.
11. **NAP consistency.** Name, address and phone identical across the GBP,
    the main site, this subdomain and any directory listing. The phone is now
    a single number everywhere, which helps.

## Phase 4 — Authority

12. **Directory and association listings** the clinic legitimately belongs
    to. The affiliation marks already on the page — ASPS, FILACP, Rosario,
    Emory, UBA, AASMA — are the obvious starting list; several maintain
    member directories that link out.
13. **Real coverage** — press, podcasts, guest pieces. Slow, and it is what
    actually moves a new host.
14. **Do not buy links.** On a medical site that is a manual-action risk
    outweighing anything it buys.

## Phase 5 — Measurement

15. **Search Console first**, before any of the above. You cannot see an
    improvement you never baselined.
16. **Track queries, not positions.** Impressions and clicks per query tell
    you what to write next; a single position number does not.
17. **Watch the paid/organic overlap.** These pages carry ad traffic too. If
    a term ranks organically *and* you are bidding on it, that is worth
    knowing before you keep paying for it.

---

## What can be done in this repo, and what cannot

**In the repo, on request:** meta description lengths, cross-page internal
links, `BreadcrumbList` and `LocalBusiness` schema, medical-reviewer markup,
a cost section, expanded FAQ content, and an `hreflang` pair if Spanish
versions follow the main site's lead.

**Not in the repo:** links from the WordPress site, the Google Business
Profile, the street address, DHA approval of any price wording, and the
subdomain-versus-subfolder decision — which is a hosting question, and the
one worth answering first.
