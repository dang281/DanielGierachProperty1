# 07 — Local SEO & Trust Signals

**Audit date:** 2026-05-10
**Scope:** NAP consistency, Google Business Profile alignment, suburb page strength, RealEstateAgent / LocalBusiness schema, geo-targeted internal linking, location signals (titles/H1/body), reviews & testimonials, credentials display, contact clarity.
**Method:** static analysis of `.astro` source files in `/Users/danielgierach/DanielGierachProperty/src`. No live crawl. GBP, register, social profile and external link verification flagged for Daniel.

---

## Summary

The site is in much better local-SEO shape than the typical agent site. Global JSON-LD in `Layout.astro` is rich (RealEstateAgent + LocalBusiness + Person + FAQPage + WebSite + BreadcrumbList), every page inherits a complete NAP block in JSON-LD, every suburb page has its own LocalBusiness/RealEstateAgent + BreadcrumbList + FAQPage scripts, and the global review block already carries two anonymised real reviews. Phone number on every page tested. License-quality work.

Three categories of issues need attention.

1. **Agency-name fragmentation (LSEO-001 / TRUST-002).** Three different agency names are shipping in production: `Ray White Bulimba` (84 occurrences), `Ray White The Collective` (81 occurrences), `Ray White Collective` (7 occurrences). They appear together on the **same page** in many places (e.g. homepage, footer brand vs footer copyright, `index.astro` JSON-LD). CLAUDE.md says footer should say "Ray White Collective" but BRAND.md says "Ray White Bulimba"; the codebase resolves this inconsistently. This is the single highest-impact fix on this audit because Google Business Profile, REIQ register, and `raywhitebulimba.com.au/agents/daniel-gierach/177117` all need to match exactly one canonical phrase.
2. **Social-profile drift between visible UI and JSON-LD (LSEO-003).** Schema sameAs links point to `linkedin.com/in/daniel-gierach` (hyphen) and `instagram.com/danielgierach`, but the visible footer/contact/walkthrough links point to `linkedin.com/in/danielgierach` (no hyphen) and `instagram.com/dgierach/`. One of these pairs is broken. Search engines crawl both and treat the mismatch as low-trust.
3. **No license number, no AggregateRating in global schema, suburb pages missing geo coordinates (TRUST-001, LSEO-006, LSEO-007).** The site never displays a real estate licence number anywhere (legally required under the QLD *Property Occupations Act 2014* on advertising). The reviews-page AggregateRating only fires on `/reviews`, not site-wide. Suburb-page RealEstateAgent JSON-LD has no `geo` block, no `priceRange`, no `image`, no `email`, no `openingHoursSpecification`.

Below: findings table, then per-finding detail with file:line citations and verification asks for Daniel.

---

## Findings table

| ID | Area | Severity | One-line |
|---|---|---|---|
| LSEO-001 | Agency name | High | Three agency-name variants ship simultaneously: "Ray White Bulimba", "Ray White The Collective", "Ray White Collective". Pick one canonical, align everywhere. |
| LSEO-002 | Phone format | Low | Two phone formats in use (`0412 523 821` visible, `+61412523821` in `tel:` and JSON-LD). Both are technically NAP-consistent but worth noting. |
| LSEO-003 | Social profiles | High | LinkedIn URL hyphen mismatch and Instagram handle mismatch between visible UI and JSON-LD `sameAs`. |
| LSEO-004 | Schema duplication / overrides | Medium | `about.astro`, `contact.astro`, `walkthrough.astro` each pass page-level `RealEstateAgent`/`Person` schemas that are thinner than the global `Layout.astro` graph and repeat the same `@id` implicitly. Risk of confusing crawlers when two `RealEstateAgent` graphs ship on one page. |
| LSEO-005 | Suburb-page schema completeness | Medium | All 47 suburb-page LocalBusiness scripts use `"name": "Daniel Gierach, Ray White The Collective"`, no `geo`, no `priceRange`, no `email`, no `image`, no `sameAs` to social profiles, no `openingHoursSpecification`. They also override the global @id-aware `RealEstateAgent` with a thinner version. |
| LSEO-006 | Geo coordinates | Medium | Geo lat/lng appears only in `Layout.astro` globally (Bulimba office). No suburb page ships a `Place` geo block, so individual suburb pages have no machine-readable geographic anchor beyond the suburb name. |
| LSEO-007 | priceRange / hasOfferCatalog | Low | `priceRange` exists only in `Layout.astro` as `"$$"` (low-information). No `hasOfferCatalog` (residential sales / appraisal services) anywhere. |
| LSEO-008 | Suburb-page H1 / title patterns | Low | Some suburb H1s read "Real Estate Agent Bulimba." which is keyword-target language but slightly awkward for users. Pattern is consistent across suburb pages, which is fine for SEO but should be reviewed for tone. |
| LSEO-009 | Internal linking — suburb cross-links | Low | Bulimba page only cross-links to 3 inner-east suburbs ("Also selling in: Hawthorne, Balmoral, Morningside"). Pattern is shallow on most suburb pages. |
| LSEO-010 | Hub page (brisbane-inner-east) | Low | Hub page ships only a `WebPage` + `BreadcrumbList`. No `Place` schema for Brisbane inner east, no `ItemList` of suburbs, no `RealEstateAgent` override. |
| LSEO-011 | Suburbs index | Low | `/suburbs/index.astro` not directly inspected but worth reviewing for `ItemList` schema covering all suburb pages. |
| TRUST-001 | License number missing | High | No QLD property licence number, no REIQ membership number, no Real Estate Agent registration number visible anywhere. |
| TRUST-002 | Footer agency mismatch | High | Footer brand block says "Ray White · The Collective" (Footer.astro:17) but the same footer's copyright says "Ray White Bulimba" (Footer.astro:155). Same component, two different agency names. |
| TRUST-003 | AggregateRating only on /reviews | Medium | `AggregateRating` JSON-LD fires only on `reviews.astro`. The global Layout has `review` array but no `aggregateRating` — adding a site-wide `aggregateRating` (with low review count, honest) would surface stars in SERPs. |
| TRUST-004 | Reviews bank thin | Medium | Only 2 reviews in `testimonials` array (both anonymised "Seller" / "Buyer"). 6 placeholder slots commented out. The "For Daniel" yellow note is still visible on the live page. |
| TRUST-005 | Awards / track record | Low | No awards, no career sales volume, no GAV or annual results displayed. About page shows "10+ years" and degree — could be stronger. |
| TRUST-006 | Contact clarity | Low | Mobile sticky CTA fires on most pages (good). Phone visible in nav, footer, and most page CTAs (good). No email visible in nav or sticky bar (small gap). |
| TRUST-007 | sameAs missing realestate.com.au and rwnf.com.au | Low | Footer links to `realestate.com.au/agent/daniel-gierach-3819232` but this URL is **not** in the global `sameAs` array. Adding it strengthens entity disambiguation. |
| TRUST-008 | Testimonial placeholder visible | Medium | `reviews.astro:174-179` ships a yellow internal note ("For Daniel: Add Your Client Testimonials") to the live page. PROTECTED-style content but visible to visitors. |
| TRUST-009 | No `image` on suburb-page businesses | Low | Suburb-page LocalBusiness JSON-LD ships without `image`, missing a known good headshot URL that the global graph uses. |

---

## Detail

### LSEO-001 — Three agency names shipping simultaneously [HIGH]

| Variant | Approx occurrences | Where |
|---|---|---|
| `Ray White Bulimba` | 84 | Layout.astro JSON-LD `worksFor.name`, `Footer.astro:155` copyright, `Nav.astro` does NOT contain it (uses "Ray White · The Collective"), `about.astro:113` and 171, every suburb-page meta description, `index.astro` body copy, `reviews.astro:63` page title, `walkthrough.astro` description |
| `Ray White The Collective` | 81 | Every suburb-page LocalBusiness JSON-LD `"name"`, `about.astro:12` Person schema `worksFor`, `walkthrough.astro:13` schema, all 5 LP pages footer signatures, `AuthorBio.astro:13`, `index.astro:350` body copy |
| `Ray White Collective` | 7 | `Method.astro:275`, `index.astro:110, 131, 411, 741`, `lp/murarrie.astro:237`, `lp/seven-hills.astro:251` |
| `Ray White · The Collective` (visual) | many | `Nav.astro:36` logo subtitle, `Footer.astro:17` brand subtitle, all 5 LP pages logo bars |

Concrete example of the problem on a single page: homepage `index.astro`.
- Line 110: `Ray White Collective` (no "The")
- Line 131 (FAQ JSON-LD): `Ray White Bulimba and the Ray White Collective network`
- Line 167 (alt text): `Daniel Gierach, Ray White Bulimba`
- Line 302 (visual): `Ray White - The Collective` (a hyphen-as-clause-separator, also breaks CLAUDE.md em-dash rule visually although a · would have been safer here)
- Line 350: `Ray White Bulimba and the broader Ray White The Collective`
- Line 374: alt text `Daniel Gierach, Ray White Bulimba`
- Line 387: `Daniel Gierach · Ray White Bulimba`

The concrete impact: when Google's crawler builds Daniel's entity it sees three different employer names. NAP consistency is one of the top three ranking factors for local search. This needs one canonical name everywhere.

**Verification needed from Daniel:**
- What is the registered trading name of the office on the REIQ register?
- What does the licence say?
- What is the Google Business Profile name (visit GBP and read it back exactly — title case, "The", commas)?
- What is on Daniel's RateMyAgent profile and `realestate.com.au/agent/daniel-gierach-3819232`?

Pick one and rewrite. The cleanest answer is usually whatever the GBP and the QLD register both say. Until verified, my recommendation is that the agency is "Ray White Bulimba" trading as part of "Ray White The Collective" group — in which case both can appear, but `worksFor` JSON-LD should always say `Ray White Bulimba` (the licensed entity), the visible logo subtitle can say `Ray White · The Collective` (the consumer-facing group brand), and they should never appear interchangeably in the same paragraph or in JSON-LD `name` fields for the same entity.

---

### LSEO-002 — Phone format [LOW]

`+61412523821` and `0412 523 821` both appear, totaling 257 occurrences across 56 files. `tel:` hrefs and JSON-LD `telephone` use `+61412523821` (correct E.164). Visible body copy uses `0412 523 821`. This is best practice. No fix needed; recorded for completeness.

No occurrences of `0412523821` (no spaces) or `0412.523.821` (dots). No occurrences of `(0412) 523 821` or other variants.

---

### LSEO-003 — Social profile drift [HIGH]

| Profile | JSON-LD (`sameAs`) | Visible UI link | Risk |
|---|---|---|---|
| LinkedIn | `https://www.linkedin.com/in/daniel-gierach` (hyphen) — `Layout.astro:148`, `:205` | `https://www.linkedin.com/in/danielgierach` (no hyphen) — `Footer.astro:26`, `contact.astro:89`, `walkthrough.astro:105`, `about.astro:18` | One of the two URLs is a 404 |
| Instagram | `https://www.instagram.com/danielgierach` — `Layout.astro:150`, `:207` | `https://www.instagram.com/dgierach/` — `Footer.astro:25`, `contact.astro:80`, `walkthrough.astro:96` | Different handles entirely; one is wrong |
| Facebook | `https://www.facebook.com/danielgierachproperty` — `Layout.astro:149`, `:206` | No visible Facebook link in nav/footer/contact | Schema-only entry; visit page to verify it loads |
| RateMyAgent | `https://www.ratemyagent.com.au/real-estate-agent/daniel-gierach` — `Layout.astro:151`, `:208` | Same URL on `reviews.astro:123, :208` | Consistent |
| Ray White agent | `https://www.raywhite.com/agents/agent/daniel-gierach-88889915` and `https://raywhitebulimba.com.au/agents/daniel-gierach/177117` | `https://raywhitebulimba.com.au/agents/daniel-gierach` (no ID) — `listings.astro:180`, `:237` | Trailing-slug mismatch |
| realestate.com.au | NOT in any sameAs array | `https://www.realestate.com.au/agent/daniel-gierach-3819232` — `Footer.astro:33` | Missing from JSON-LD |
| Google Business Profile | NOT in any sameAs at site level. Only in `cannon-hill.astro:72`, `coorparoo.astro:72`, `toowong.astro:43`, `murarrie.astro:36`, `milton.astro:43` | `https://share.google/WipmgyJnjC5nkhGwx` in Footer, contact, walkthrough, 5 suburb pages | Should be in global `sameAs` |

**Verification needed from Daniel:**
- Open LinkedIn: which URL is correct, `linkedin.com/in/danielgierach` or `linkedin.com/in/daniel-gierach`?
- Open Instagram: which handle is real, `dgierach` or `danielgierach`?
- Confirm `facebook.com/danielgierachproperty` resolves and is owned by Daniel.

Once confirmed: pick one URL per profile and replace everywhere. Add `realestate.com.au` and the GBP `share.google` URL to the global `Layout.astro` `sameAs` array.

---

### LSEO-004 — Schema duplication on About / Contact / Walkthrough [MEDIUM]

`about.astro`, `contact.astro`, `walkthrough.astro` all pass thin page-level Person/RealEstateAgent schemas as the `schema` prop, which ship alongside the much richer global graph from `Layout.astro`.

`about.astro:5-20`:
```
"@type": "Person",
"worksFor": { "@type": "Organization", "name": "Ray White The Collective", "url": "https://raywhite.com.au" }
```

vs `Layout.astro:178-182` (also on the same page):
```
"worksFor": { "@type": "Organization", "name": "Ray White Bulimba", "url": "https://raywhitebulimba.com.au" }
```

Two schemas on the same page disagree on (a) the agency name, (b) the agency URL. This is exactly the inconsistency Google flags as low-trust.

`contact.astro:4-15` and `walkthrough.astro:5-17` have similar thin overrides.

**Recommendation:** delete the page-level `personSchema` / `contactSchema` / page schemas in those three files and rely on the global graph (which has `@id` anchors so other pages can `mainEntity` them). If a page-level schema is needed (e.g. Service or ContactPage), give it a different `@type` and reference the business via `@id`: `"provider": { "@id": "https://danielgierach.com/#business" }`.

---

### LSEO-005 — Suburb-page LocalBusiness schema completeness [MEDIUM]

All 47 suburb pages ship a per-page `LocalBusiness`/`RealEstateAgent` JSON-LD block. Sample from `bulimba.astro:27-73`, identical pattern across the rest:

```json
{
  "@type": ["LocalBusiness", "RealEstateAgent"],
  "name": "Daniel Gierach, Ray White The Collective",
  "url": "https://danielgierach.com/suburbs/bulimba",
  "telephone": "+61412523821",
  "address": { "addressLocality": "Bulimba", "postalCode": "4171", ... },
  "areaServed": [ {Place x 5} ],
  "knowsAbout": [...],
  "sameAs": ["https://www.raywhite.com/agents/agent/daniel-gierach-88889915"]
}
```

What's missing on every suburb page:
- `email`
- `image` (the headshot URL is already in Layout.astro line 78 — copy it)
- `priceRange`
- `geo` for the suburb (or for the office)
- `openingHoursSpecification`
- `aggregateRating` and `review` (reusable from Layout.astro)
- `sameAs` for LinkedIn, Instagram, Facebook, RateMyAgent
- `@id` to link back to the canonical business at `https://danielgierach.com/#business`

**Recommendation:** the cleanest fix is to give each suburb-page `LocalBusiness` block an `@id: "https://danielgierach.com/#business"` and let the global graph provide everything else. Then the suburb-page block only needs the suburb-specific override (areaServed, knowsAbout, breadcrumbs, FAQ). Two graphs sharing `@id` is the correct way to ship per-page enrichment without contradictory NAP. Right now every suburb page emits a *parallel* business entity with `name` "Daniel Gierach, Ray White The Collective", which conflicts with the global "Daniel Gierach" entity (Layout.astro:73).

---

### LSEO-006 — Suburb pages have no geo block [MEDIUM]

Only `Layout.astro:88-92` has GeoCoordinates (Bulimba office). Suburb-page `addressLocality` is set, but no `geo`. Adding suburb geo (centroid lat/lng for each suburb) and a `Place` block alongside the LocalBusiness on each suburb page makes the page itself a stronger local landmark in Google's eyes, in addition to the agent.

Example pattern to add per suburb:
```json
{
  "@type": "Place",
  "@id": "https://danielgierach.com/suburbs/bulimba#place",
  "name": "Bulimba",
  "containedInPlace": { "@type": "City", "name": "Brisbane" },
  "geo": { "@type": "GeoCoordinates", "latitude": -27.4509, "longitude": 153.0593 }
}
```

(Suburb centroids are well-published — verify each lat/lng against ABS or Wikipedia before committing.)

---

### LSEO-007 — priceRange / hasOfferCatalog [LOW]

`Layout.astro:79` ships `"priceRange": "$$"`. For a real estate agent, a more useful value is the actual price range of recent sales, e.g. `"priceRange": "$700,000 - $5,000,000"` or `"AUD 700000-5000000"`. Google has loosened priceRange semantics, but a real range adds entity richness.

Adding `hasOfferCatalog` lets Daniel surface the services he offers (residential sales, appraisal, walkthrough, off-market campaigns) as a structured list. Sample pattern:
```json
"hasOfferCatalog": {
  "@type": "OfferCatalog",
  "name": "Real Estate Services",
  "itemListElement": [
    { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Residential Property Sales" }},
    { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Free Property Appraisal" }},
    { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Off-Market Campaigns" }}
  ]
}
```

This is purely additive and not strictly required.

---

### LSEO-008 — Suburb-page title / H1 patterns [LOW]

Sample H1s:
- `bulimba.astro:110`: "Real Estate Agent Bulimba." — keyword-stacked, slightly awkward English.
- `seven-hills.astro:106` body: "Specialist property sales in Seven Hills and Brisbane's elevated inner east. Ray White The Collective."

The H1 pattern "Real Estate Agent {Suburb}." is keyword-aligned to the search query but reads as machine-generated. Worth reviewing across all 47 suburb pages for tone (Daniel's BRAND.md voice: "calm, precise, direct, never performative"). Suggested alternative pattern: "Selling in {Suburb}." or "{Suburb} real estate, with local detail."

PROTECTED — visual change. Flagged for Daniel's review, not auto-fix.

---

### LSEO-009 — Suburb cross-linking is shallow [LOW]

`bulimba.astro:179`: "Also selling in: Hawthorne, Balmoral, Morningside." — three links.

Some suburb pages have richer cross-links via the SuburbDeepDive component, others don't. Crawlable internal links between adjacent suburbs is a strong local SEO signal. Worth a one-pass review to ensure every suburb page links to its 3-5 nearest neighbours (not just any 3 suburbs).

The footer "Areas" block (Footer.astro:88-128) does link to all 37 suburb pages globally, which is good. So the bigger gain is contextual in-body links, not nav links.

---

### LSEO-010 — Hub page (brisbane-inner-east) under-schema'd [LOW]

`brisbane-inner-east.astro:10-23` ships only a WebPage + BreadcrumbList. Missing:
- `Place` schema for the inner east region
- `ItemList` of suburbs covered
- A `RealEstateAgent` block referencing `@id: https://danielgierach.com/#business`
- Could add aggregate stats (suburbs covered, years active)

The brisbane-inner-east hub is the natural top-of-funnel for "real estate agent brisbane inner east" queries and deserves the same schema depth as a suburb page.

---

### LSEO-011 — Suburbs index page schema [LOW]

`suburbs/index.astro` not directly inspected in this audit. Worth a follow-up to confirm it ships an `ItemList` covering all 47 suburb-page URLs with `position` integers — this is the cleanest way to tell Google "here are the 47 places I serve."

---

### TRUST-001 — License number missing [HIGH]

Searched: `REIQ`, `License`, `Licensed`, `Licence`, `licensee`, `License Number`. Result:
- `Layout.astro:161`: `"jobTitle": "Licensed Real Estate Agent"` (schema only, not displayed)
- `AuthorBio.astro:13`: "Daniel Gierach is a REIQ-licensed real estate agent" (insights pages only)

No actual licence number anywhere on the site. QLD's *Property Occupations Act 2014* and Office of Fair Trading rules require a real estate agent's licence number to appear on advertising. The site is currently advertising real estate services and naming an individual agent — including the licence number on the About page, footer, or contact page is the conventional way to comply.

**Verification needed from Daniel:** confirm licence number from the QLD OFT register (https://www.business.qld.gov.au/running-business/licensing-obligations/property-licence-public-register), then add it visibly to `about.astro`, the footer (`Footer.astro` bottom bar near copyright), and the global JSON-LD as `identifier` or `hasCredential`.

---

### TRUST-002 — Footer agency mismatch [HIGH]

Same component, two different agency names:
- `Footer.astro:17`: `Ray White · The Collective` (brand block)
- `Footer.astro:155`: `&copy; {year} Daniel Gierach Property · Ray White Bulimba. All rights reserved.`

Pick one. CLAUDE.md says footer should say "Ray White Collective" but the actual code says "Ray White Bulimba" in the copyright. Resolve once LSEO-001 is decided.

---

### TRUST-003 — AggregateRating only on /reviews [MEDIUM]

`reviews.astro:42-59` ships an `AggregateRating` JSON-LD. The global graph (`Layout.astro:67-258`) does not. Adding a low-but-honest `aggregateRating` to the global RealEstateAgent block (e.g. `"ratingValue": "5.0", "reviewCount": "2", "bestRating": "5"`) makes star-snippets eligible across the whole site, not just `/reviews`.

This needs to match the actual review count exactly — Google penalises inflated ratings.

---

### TRUST-004 — Reviews bank is thin and shows internal note [MEDIUM]

`reviews.astro:7-37`: only 2 real reviews (`Bulimba` seller and `Bulimba` buyer), both anonymised as "Seller" / "Buyer". 6 commented-out placeholders for Camp Hill, Hawthorne, Norman Park, Morningside, Carina, Cannon Hill.

`reviews.astro:174-179`: a yellow "For Daniel: Add Your Client Testimonials" instructional box is **rendered to the live page**. This is internal scaffolding visible to visitors. Either gate it behind a `draft={true}` flag or remove it entirely.

**Recommendation for Daniel:** pull 4-6 real reviews from RateMyAgent and Google with a real first name + initial (e.g. "Sarah M.") rather than "Seller". This single change moves the page from "two anonymous quotes" to "credible body of work." The current state risks looking like the agent has only had two clients.

---

### TRUST-005 — Awards / track record [LOW]

About page (`about.astro:181-186`) lists:
- Inner-east Brisbane specialist
- Bachelor in Property Economics
- 10+ years across sales, construction and marketing
- Ray White Bulimba, one of the area's most active offices

Stats on homepage (`index.astro:101-105`):
- 607,000+ buyers (Ray White network — agency stat, not Daniel's)
- 5-Star Client Reviews (only 2 reviews backing this)
- 20 days median DOM

What's missing for trust depth:
- Personal sales volume (annual or career $ transacted)
- Number of properties sold
- REIQ awards if any
- RateMyAgent suburb rankings if any
- Specific record sales

**Verification needed from Daniel:** any of the above he is comfortable publishing.

---

### TRUST-006 — Contact clarity [LOW]

Phone visible in: nav (Nav.astro:54), footer (Footer.astro:142), every page CTA, mobile sticky bar (Layout.astro:466). Excellent.

Email visible in: footer (Footer.astro:146), contact page, about page CTA, reviews page CTA. Not in nav or sticky bar. Minor — phone is conventionally the primary contact for an agent.

**No fix needed.** Recorded for completeness.

---

### TRUST-007 — sameAs missing realestate.com.au [LOW]

Footer (`Footer.astro:33`) links to `https://www.realestate.com.au/agent/daniel-gierach-3819232`. This URL is **not** in any `sameAs` array in the site's JSON-LD. Adding it to the global Layout `sameAs` array (both the RealEstateAgent and Person blocks) strengthens entity disambiguation and helps Google connect Daniel's danielgierach.com entity with his realestate.com.au profile — the latter is one of the highest-authority real estate domains in Australia.

Same applies to the GBP share-link `https://share.google/WipmgyJnjC5nkhGwx`. Better still, replace the share-link with the canonical Google Maps Place URL once Daniel confirms it.

---

### TRUST-008 — Visible internal note on /reviews [MEDIUM]

See TRUST-004. `reviews.astro:174-179`. Easy fix.

---

### TRUST-009 — No image on suburb-page businesses [LOW]

Every suburb-page LocalBusiness block omits `image`. Adding `"image": "https://cdn6.ep.dynamics.net/s3/rw-media/memberphotos/88889915-cef5-4a5f-9c19-0cea700d7bca.jpeg"` (already used in Layout.astro:78, 174) makes the agent recognisable in rich results. Once `@id` linking is in place (LSEO-005), this becomes redundant — the global block carries the image.

---

## Verification needed from Daniel (consolidated)

These cannot be verified from source. Daniel needs to confirm before any fix is shipped.

1. **Canonical agency name.** What appears on the QLD OFT property licence register, on Daniel's Google Business Profile (open GBP, read it back), on RateMyAgent, and on `realestate.com.au`? The four should match. Once confirmed, decide: is the trading entity "Ray White Bulimba" (with "Ray White The Collective" as a parent group brand for visual logo only), or vice versa?
2. **License number.** From the QLD OFT register at https://www.business.qld.gov.au/running-business/licensing-obligations/property-licence-public-register — Daniel's individual licence number. Add it to `about.astro`, footer, and JSON-LD.
3. **REIQ membership status.** Is Daniel a current REIQ member? Member number?
4. **LinkedIn URL.** Open LinkedIn — does the URL bar say `linkedin.com/in/danielgierach` or `linkedin.com/in/daniel-gierach`?
5. **Instagram handle.** Open Instagram — is it `@dgierach` or `@danielgierach`? (And is the account separately a personal account — should it be linked from the business website at all?)
6. **Facebook page.** Does `facebook.com/danielgierachproperty` resolve, and is it owned by Daniel?
7. **Google Business Profile.** Read back: business name (exact), category (Real Estate Agent? Real Estate Agency?), address, phone, hours, primary photo. Confirm all match the site exactly. Confirm `share.google/WipmgyJnjC5nkhGwx` resolves to Daniel's GBP, and grab the canonical Maps Place URL while there (better for `sameAs`).
8. **Office address.** Is the office really `Unit 6, 57-59 Oxford Street, Bulimba QLD 4171`? `raywhitebulimba.com.au` may show a different physical office — confirm match.
9. **Review counts (real).** How many Google reviews and RateMyAgent reviews does Daniel currently have? Update `aggregateRating.reviewCount` and the visible reviews bank to match.
10. **Awards / sales record / volume figures** Daniel is comfortable publishing.

---

## Suggested fix order (when Daniel returns answers)

1. **TRUST-002 + LSEO-001** — pick canonical agency name, replace globally (one PR, careful grep across `*.astro` and `*.md` content).
2. **LSEO-003** — fix LinkedIn / Instagram URLs, align UI and JSON-LD.
3. **TRUST-001** — add licence number to footer + about + JSON-LD.
4. **TRUST-008** — remove visible internal note on `/reviews`.
5. **TRUST-004 + TRUST-003** — add 4-6 real reviews, update AggregateRating site-wide.
6. **LSEO-004** — remove thin page-level schemas on about/contact/walkthrough; rely on global graph + `@id`.
7. **LSEO-005 + LSEO-009** — refactor suburb-page schemas to use `@id` linking + add geo for each suburb.
8. **LSEO-010 + LSEO-011** — strengthen hub and suburbs-index schemas.
9. **LSEO-007 + TRUST-007** — add hasOfferCatalog, add realestate.com.au to sameAs, replace `priceRange "$$"` with a real range.
10. **LSEO-008** — review suburb H1 / title tone with Daniel; PROTECTED — visual.

---

## Files cited

- `/Users/danielgierach/DanielGierachProperty/CLAUDE.md`
- `/Users/danielgierach/DanielGierachProperty/BRAND.md`
- `/Users/danielgierach/DanielGierachProperty/src/layouts/Layout.astro`
- `/Users/danielgierach/DanielGierachProperty/src/layouts/ToolLayout.astro`
- `/Users/danielgierach/DanielGierachProperty/src/layouts/LandingLayout.astro`
- `/Users/danielgierach/DanielGierachProperty/src/components/Footer.astro`
- `/Users/danielgierach/DanielGierachProperty/src/components/Nav.astro`
- `/Users/danielgierach/DanielGierachProperty/src/components/Method.astro`
- `/Users/danielgierach/DanielGierachProperty/src/components/AuthorBio.astro`
- `/Users/danielgierach/DanielGierachProperty/src/pages/index.astro`
- `/Users/danielgierach/DanielGierachProperty/src/pages/about.astro`
- `/Users/danielgierach/DanielGierachProperty/src/pages/contact.astro`
- `/Users/danielgierach/DanielGierachProperty/src/pages/reviews.astro`
- `/Users/danielgierach/DanielGierachProperty/src/pages/walkthrough.astro`
- `/Users/danielgierach/DanielGierachProperty/src/pages/brisbane-inner-east.astro`
- `/Users/danielgierach/DanielGierachProperty/src/pages/404.astro`
- `/Users/danielgierach/DanielGierachProperty/src/pages/suburbs/bulimba.astro` (sample)
- `/Users/danielgierach/DanielGierachProperty/src/pages/suburbs/seven-hills.astro` (sample)
- `/Users/danielgierach/DanielGierachProperty/src/pages/suburbs/morningside.astro` (sample)
- `/Users/danielgierach/DanielGierachProperty/src/pages/suburbs/hawthorne.astro` (sample)
- `/Users/danielgierach/DanielGierachProperty/src/pages/suburbs/murarrie.astro` (sample)
- `/Users/danielgierach/DanielGierachProperty/src/pages/suburbs/cannon-hill.astro` (sample)
- `/Users/danielgierach/DanielGierachProperty/src/pages/lp/murarrie.astro`
- `/Users/danielgierach/DanielGierachProperty/src/pages/lp/seven-hills.astro`
- `/Users/danielgierach/DanielGierachProperty/src/pages/lp/bulimba.astro`
- `/Users/danielgierach/DanielGierachProperty/src/pages/lp/camp-hill.astro`
- `/Users/danielgierach/DanielGierachProperty/src/pages/lp/hawthorne.astro`
