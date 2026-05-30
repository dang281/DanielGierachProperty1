# Website audit summary — danielgierach.com

**Audit date:** 2026-05-10
**Site:** Brisbane real estate agent at Ray White (agency name conflict, see LSEO-001)
**Scope:** Full site, 716 generated pages, 8 areas
**Primary growth challenge:** traffic and awareness, not conversion

---

## Tier overview (confirmed with Daniel before audit)

| Tier | Pages | Constraint |
|---|---|---|
| Protected (no visual or copy changes) | Home, /property-worth, /property-report, /walkthrough, /get-an-appraisal, /contact, /thank-you, /suburbs/* (48), /tools/* (56), /lp/* (5) — 116 total | Technical/SEO/perf/a11y fixes that don't affect rendered output ARE allowed |
| Supporting (in scope) | /brisbane-inner-east, /about, /listings, /results, /reviews, /insights/* (571), /resources/* (27) — 602 total | Full edits permitted |
| Utility (in scope) | /404, /privacy, /terms, sitemap, robots.txt | Full edits permitted |
| Internal (security only) | /dashboard, /social-preview | Audit security only, do not edit content |

---

## Headline state of the site

**Strong:** modern static Astro 6 build, rich global JSON-LD graph (RealEstateAgent + Person + WebSite + FAQPage), correct E.164 phone in tel: links, mobile sticky call bar, native `<details>` for FAQ accordions, web-vitals already wired to GA4, viewport meta correct (no `user-scalable=no`), inputs forced to 16px on mobile to prevent iOS zoom, sound HTTPS + HSTS posture.

**Weak:** site is leaking authority through duplicate content (49 insight clusters, 130-160 deletion candidates), the agency name appears in three different forms across the same pages, key sales pages have no Meta Pixel `Lead` events (so ad spend is under-attributed), 6 financial calculators ship outdated 2026 data, a chat widget (Tawk.to) has placeholder IDs and 404s on every page, dashboard and social-preview pages are visible to anyone who curls them despite a client-side password gate, and 414 of 574 insight articles have zero in-body internal links.

**Highest impact for traffic:** consolidate the 571 insights into ~360, fix the dual-sitemap conflict, normalise titles (especially the 56 tool pages titled `| Dan's Website`), unify the agency name, and add internal linking from articles to suburbs and tools.

**Highest impact for trust and credibility:** remove the internal "For Daniel: Add Your Client Testimonials" debug box from `/reviews`, add the QLD OFT licence number, and fix the 6 calculators with stale figures.

**Highest impact for security:** rotate the Supabase service-role key sitting in `.env`, gate `/dashboard` and `/social-preview` server-side or remove their server-rendered draft content, and add a Content Security Policy header.

---

## Layer 1: prioritised action list (all areas combined)

Ordered by impact. Effort: S = under 1hr, M = 1–4hr, L = half day or more.

### P0 (do first)

| ID | Finding | Area | Effort | Protected | Outcome |
|---|---|---|---|---|---|
| SEC-002 | `/dashboard` and `/social-preview` SSR'd content (recent commits, draft captions, internal API URL, GitHub repo) is visible via `curl` despite client-side password gate (`'dang2026'`) | Security | M | N | Removes accidental disclosure of business state |
| SEC-001 | `SUPABASE_KEY=sb_secret_...` sits in `/.env` on disk; rotate even though not committed | Security | S | N | Eliminates risk of future leak via backup/sync |
| TSEO-001 | Dual sitemap conflict: `/sitemap-index.xml` (Astro, 721 URLs) and `/sitemap.xml` (custom, 255 URLs) both declared in robots.txt, disagree on URL count and trailing slashes | Tech SEO | M | N | Restores predictable crawl behaviour |
| TSEO-002 | `/thank-you/`, `/404/` and arguably `/privacy/`, `/terms/` ship `<meta name="robots" content="index, follow">` | Tech SEO | S | Y (thank-you) | Stops crawl waste, removes thank-you from organic surface |
| TSEO-003 | Astro sitemap leaks `/dashboard/`, 5x `/lp/*`, `/social-preview/` — filter only excludes 4 paths | Tech SEO | S | N | Stops Google from indexing internal/ad pages |
| TSEO-007 / OSEO-005 | All 55 tool pages have `<title>... \| Dan's Website</title>` due to `ToolLayout.astro` line 14 | On-page SEO | S | Y | Fixes brand display in SERP for entire tools section |
| LSEO-001 / TRUST-002 | Three different agency names live across the site: "Ray White Bulimba" (84x), "Ray White The Collective" (81x), "Ray White Collective" (7x). Footer alone has both | Local SEO | M | Y (some pages) | Single biggest local-SEO and brand-trust fix |
| TRUST-008 | Internal yellow box "For Daniel: Add Your Client Testimonials" is server-rendered live on `/reviews` | Trust | S | N | Removes obvious unfinished-site signal |
| TOOL-001 | `true-cost-to-buy.astro` uses obsolete First Home Concession thresholds ($500k/$550k vs current $700k/$800k since 9 Jun 2024); stale FHBG cap ($900k vs $1M); missing 2025 New Home Concession | Tools | M | Y | Fixes incorrect financial output (worse than no calculator) |
| TOOL-002 | `land-tax.astro` missing $10M+ band; absentee surcharge calculated wrong (2% on full value vs 3% on land above $350k) | Tools | M | Y | Fixes incorrect tax output |
| TOOL-005 | `depreciation-estimator.astro` hardcodes `currentYear = 2025` | Tools | S | Y | Year-off-by-one fix |
| ANLY-001 | Two different Meta Pixel IDs in production (`1493183205636761` main, `1462440981414974` LP) that never overlap. LP-driven leads cannot be attributed back to main-site behaviour | Analytics | S | N | Restores ad attribution; major media-spend issue |
| ANLY-002 | No Meta Pixel `Lead` event on `/walkthrough`, `/property-report`, `/contact`, `/get-an-appraisal`, or hero address form. Only LPs and PDF downloads fire it | Analytics | S | N | Lead-gen attribution becomes accurate; restores Pixel optimisation signal |
| PERF-003 / TSEO-Other | Tawk.to widget loads `embed.tawk.to/TAWK_PROPERTY_ID/TAWK_WIDGET_ID` (literal placeholder) on every page → 404 + console error sitewide | Performance | S | N | Stops 743 broken requests per visit, cleans console |
| PERF-002 | `/lp/*` pages load Google Maps as render-blocking `<script>` (homepage migrated to async loader, LPs were not) | Performance | S | Y | LP load time improves; CLS improves |
| PERF-001 | 369 content `<img>` tags across 743 pages: only 4.9% have `loading="lazy"`, 0.8% have `decoding="async"`, 91.9% missing `width`/`height` | Performance | M | Y | Reduces CLS, improves LCP, reduces over-eager fetch |
| A11Y-010 | Phone CTA in nav (`#nav-phone`, gold) drops to ~1.4:1 contrast after scroll (gold on cream `glass-nav`) — major fail on most prominent CTA | Accessibility | S | Y | Restores WCAG AA on the highest-conversion-intent element |
| A11Y-001 | 192 inline `outline:none` strip keyboard focus indicators sitewide; no global `:focus-visible` defined | Accessibility | M | Some Y | Restores keyboard accessibility across all pages |
| CONT-001 | 6 articles still cite obsolete 12.5% Foreign Resident CGT Withholding rate. From 1 Jan 2025 the rate is 15% with no $750K threshold | Content | M | N | Removes direct factual errors that could mislead vendors |
| CONT-002 | 4 disclosure articles describe regime superseded 1 Aug 2025 by Property Law Act 2023; one explicitly says "QLD does not have a formal vendor statement system" | Content | M | N | Removes legally-misleading content; consolidate to the updated article |
| OSEO-001 | 414 of 574 insight articles (72.1%) have **zero** in-body internal links to other insights, suburbs, tools or resources | On-page SEO | L | N | Highest-leverage SEO move for an article-heavy site |

### P1 (high impact)

| ID | Finding | Area | Effort | Protected | Outcome |
|---|---|---|---|---|---|
| TSEO-004 | Custom sitemap missing 466+ URLs (27 resources, 1 suburb, 1 tool, ~435 insights) | Tech SEO | S | N | Indexability of 60% of site content |
| TSEO-005 | `/dashboard` and `/social-preview` use JS-based noindex via meta-tag mutation; initial HTML still says `index, follow` | Tech SEO | S | N | Cross-references SEC-002 |
| TSEO-006 | Trailing-slash inconsistency: canonicals use `/foo/`, custom sitemap uses `/foo`, JSON-LD `url` uses `/foo` | Tech SEO | M | N | Removes duplicate-URL signals |
| OSEO-002 | 91.5% of insight titles exceed 70 chars (SERP-truncate). Brand suffix "\| Daniel Gierach Property" alone is 25 chars | On-page SEO | L | N | Improves CTR in SERP across the largest section of the site |
| OSEO-003 / OSEO-004 | 52 pairs of insight slugs are >=0.7 Jaccard similar; 3 duplicate `<title>` strings | On-page SEO | M | N | Stops keyword cannibalisation |
| OSEO-006 / OSEO-008 | 47 suburb pages use 3 different title templates; suburb title and H1 conflict on the same page (Selling in X vs Real Estate Agent X) | On-page SEO | M | Y | Consolidates suburb topical authority |
| LSEO-003 | Social URLs disagree between visible UI and JSON-LD (LinkedIn hyphen vs no-hyphen; Instagram username mismatch) | Local SEO | S | N | Fixes broken sameAs links |
| TRUST-001 | No QLD OFT real estate licence number displayed (advertising rule expectation) | Trust | S | Y (footer) | Compliance + trust |
| LSEO-005 | All 47 suburb LocalBusiness schemas thin (no email, image, geo, priceRange, sameAs, openingHoursSpecification, no @id link to canonical entity) | Local SEO | M | N | Improves local-pack eligibility |
| LSEO-004 | Page-level Person/RealEstateAgent schemas on `/about`, `/contact`, `/walkthrough` ship alongside global graph and disagree on `worksFor.name` | Local SEO | S | N | Stops contradictory entity signals |
| SEC-003 | No Content-Security-Policy header in `vercel.json` | Security | M | N | Significant XSS surface reduction; improves header score |
| SEC-004 | Mixed content `http://raywhitebulimba.com.au/...` at `index.astro:52` and `:63` | Security | S | Y | Eliminates browser-warning trigger |
| CODE-001 | 144,224 inline `style="..."` attrs across the build (avg 193/page, peak 6,830 on `/dashboard`) | Code | L | Y (some) | Defeats Tailwind caching; biggest HTML page-weight contributor |
| PERF-005 / PERF-004 | No preconnect for `cdn6.ep.dynamics.net` (Ray White CDN, hosts most LCP images) or `unpkg.com` (web-vitals) | Performance | S | N | Reduces LCP for image-heavy pages |
| PERF-006 | `/dashboard/index.html` is 1.5 MB; `/social-preview/index.html` is 1.4 MB (both shipped to production) | Performance | S | N | Cross-references SEC-002 |
| PERF-007 | Nav scroll listener is unthrottled, non-passive, mutates DOM styles on every scroll | Performance | S | N | INP improvement on every page |
| A11Y-002 | Mobile menu has no `aria-expanded`, no Escape handler, no focus trap; collapsed menu items remain in tab order (max-height:0 doesn't remove from a11y tree) | Accessibility | S | N | Keyboard + screen reader fix |
| A11Y-003 | No skip-to-content link in either layout | Accessibility | S | N | Standard WCAG fix |
| A11Y-004 | Only 31 of 426 `<label>` elements have `for=`. Sibling-label pattern across `walkthrough.astro`, `contact.astro`, ~50 tool pages | Accessibility | M | Some Y | Form accessibility across the site |
| A11Y-005 / A11Y-007 | Hero address input on `/`, all `/lp/*` LP address inputs, and tools-index search have no accessible name (placeholder only) | Accessibility | S | Y | Screen-reader fix on highest-conversion form |
| A11Y-011 | Cream-on-charcoal text at rgba(240,236,228,0.35) (~3.0:1) and 0.45 (~4.2:1) used widely; both fail AA for normal text | Accessibility | M | Y (some) | WCAG AA |
| MOBI-007 / MOBI-008 | Tool radio cards (~36-40px) and filter pills (~28-32px) under WCAG 2.5.8 minimum touch target on mobile | Mobile | M | Y | Reduces mistap rate on tools |
| TOOL-003 | `first-home-buyer.astro` calculation correct but explanatory copy still references old $500k/$550k thresholds; missing No-Cap First Home (New Home) Concession from 1 May 2025 | Tools | S | Y | Fixes copy contradiction with QRO current rules |
| TOOL-004 | `negative-gearing.astro` table label "(2024-25)" but uses 2025-26 brackets | Tools | S | Y | Year label fix |

---

## Layer 1.5: P2/P3 cleanups (group as batches)

| ID | Finding | Area | Effort |
|---|---|---|---|
| OSEO-009/010/011/012/013 | Internal linking gaps: insights to /property-worth (0), to /get-an-appraisal (14), resource to resource cross-links (0), suburb to insights, suburb to tools | On-page SEO | L |
| TSEO-010 | All 47 suburb LocalBusiness JSON-LD missing `@id` link to canonical RealEstateAgent | Tech SEO | S |
| TSEO-015 | ~440 insights pages missing `Article.datePublished` schema | Tech SEO | M |
| TSEO-019 | Hub page CollectionPage `url` fields missing trailing slash | Tech SEO | S |
| OSEO-007 | Lowercase H1 anti-pattern on some suburb pages | On-page SEO | S |
| OSEO-014 | OG image used sitewide on 716 pages — page-specific OG would lift social CTR | On-page SEO | L |
| LSEO-006 | No per-suburb `geo` block (lat/lng) | Local SEO | M |
| TRUST-003 | AggregateRating fires only on `/reviews`, not site-wide | Trust | S |
| TRUST-004 / TRUST-007 | Only 2 anonymised reviews ("Seller", "Buyer"); realestate.com.au profile not in any sameAs | Trust | S |
| CODE-002 | Google Maps API key hardcoded in 7 files (per CLAUDE.md this is intentional, but document the constraint) | Code | S |
| PERF-008 | 805 KB dead preview HTML + 377 KB unused JPG in `/public/preview/` | Performance | S |
| PERF-009 | `will-change` on five `.reveal*` selectors creates dozens of permanent compositor layers | Performance | S |
| PERF-010 | `globalSchema` re-serialised per page render (~4.9 MB duplicate JSON pre-compression) | Performance | S |
| PERF-011 | `@astrojs/node` declared but `output: 'static'` — dead dep | Code | S |
| PERF-012 | Macos quarantine artefact `public/.!9236!favicon.ico` shipped | Code | S |
| SEC-005 | No SRI on third-party scripts (acceptable given CDN versioning) | Security | S |
| SEC-006 (cross-ref ANLY-001) | Two distinct Meta Pixel IDs in production | Security | S |
| SEC-007 | No captcha or honeypot on Formspree forms | Security | S |
| SEC-008 | Deprecated `X-XSS-Protection` header (cosmetic, safe to keep or remove) | Security | S |
| ANLY-003 | No tracking on tool→/walkthrough CTAs (high-intent funnel signal invisible) | Analytics | S |
| ANLY-004 | Privacy Policy doesn't name GA4, Meta Pixel, Tawk.to, Formspree (APP 1.4) | Analytics | M |
| CONT-003 | 49 duplicate clusters across 571 insights, 130-160 deletion candidates | Content | L |
| CONT-004 | 27 suburb articles outside Daniel's stated inner-east focus | Content | L |
| CONT-005 | ~95 insight files with banned vocabulary in body copy | Content | M |
| CONT-006 | 5 articles open CTAs with banned word "Navigating" | Content | S |
| CONT-007 | 91 articles with hard-coded years (likely to be 2024 or 2025) | Content | M |

---

## Verification needed (cannot confirm from code alone)

These items need live tools or external accounts; flagged for follow-up.

- Lighthouse CI per template (LCP, CLS, INP)
- WebPageTest for waterfall and render-blocking analysis
- securityheaders.com scan to confirm header score
- Mozilla Observatory scan
- ssllabs.com scan to confirm TLS posture
- hstspreload.org check to confirm HSTS preload status
- npm audit for dependency vulnerabilities
- Google Cloud Console: confirm Google Maps API key has HTTP referrer restriction to *.danielgierach.com
- Google Search Console: index coverage, sitemap submission, Core Web Vitals report
- Google Business Profile: NAP and category alignment
- QLD OFT register: confirm the canonical agency name and licence number
- LinkedIn: confirm the canonical profile URL (hyphen or not)
- Instagram: confirm `dgierach` vs `danielgierach` is the canonical handle
- Facebook: confirm `facebook.com/danielgierachproperty` is owned by Daniel
- realestate.com.au: confirm agent profile URL (currently linked but not in sameAs)
- Formspree dashboard: confirm rate limiting and spam settings
- axe DevTools or WAVE: full WCAG 2.2 AA scan with Daniel using a screen reader and keyboard

---

## Where to read more

| File | Area |
|---|---|
| `01-technical-seo.md` | Sitemaps, robots, redirects, canonicals, schema |
| `02-on-page-seo.md` | Titles, descriptions, headings, internal linking, OG |
| `03-content-quality-insights.md` | 571 insights deep-dive; consolidation plan |
| `04-performance-code-health.md` | Core Web Vitals contributors, build size, dead code |
| `05-accessibility-mobile.md` | WCAG 2.2 AA findings, mobile UX, touch targets |
| `06-security.md` | Headers, secrets, dashboard exposure, mixed content |
| `07-local-seo-trust.md` | NAP consistency, agency name, schema, reviews |
| `08-tools-analytics.md` | Calculator correctness vs 2026 QLD data; Pixel/GA4 coverage |
| `99-tasks.md` | Layer 3 ready-to-run task blocks for P0 + P1 (in scope only) |
