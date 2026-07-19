# Growth audit: danielgierach.com, 2026-07-19

**Goal:** appear more in searches and rankings as a real estate agent.
**Method:** round-3 audit. Fresh SERP deltas, structural teardown of the two solo-agent sites that DO rank (paulapearce.com.au, timaltass.com), GBP surface check, full technical crawl of the built site (all 1,029 pages), live performance measurement.
**Prior audits:** 07-15 (seller queries: authority problem), 07-16 (AI recommendation: presence problem). Both sets of on-site fixes have shipped; external items partially done (Wikidata created, RateMyAgent profile exists at zero reviews, GSC resubmitted 07-19, LinkedIn overhauled).

## Headline: this round found the technical brake nobody knew was on

Previous audits concluded indexation was fine because pages appeared in site: searches. Round 3 checked at scale and found the opposite: **only 3 of 162 suburb pages visibly surface in Google**, none of the focus five except Norman Park. The technical pass then found why. Three self-inflicted crawl problems:

1. **The sitemap submits 375 noindexed pages to Google** (97% of all noindexed content, mostly the 373 staged draft articles). The sitemap filter in astro.config.mjs is a path blocklist that knows nothing about the draft flag. Google is told "index these 1,018 URLs" while 375 of them answer "do not index me". Search engines demote sitemap trust and crawl allocation over exactly this contradiction. For a 1-year-old domain with limited crawl budget, this is the brake.
2. **292 of 747 insight articles (39%) have zero internal links** pointing to them from anywhere. The insights hub lists only 405 of 747 slugs. Orphaned pages receive no PageRank and signal low value.
3. **29 articles are past their scheduled publish date but still hardcoded noindex** (stale `const draft = true` never removed; 2 of them even say draft: false in the schedule JSON). Content meant to be live since as far back as May is silently invisible.

Plus one weight problem: **a 303KB inline SVG map is duplicated verbatim on every suburb page** (~59% of each page's bytes, ~49MB duplicated site-wide). It should be one cacheable external asset.

Fixing these is not optional polish. Combined with the just-triggered GSC recrawl, it is the difference between Google indexing the site's best pages or continuing to sample 3 of 162.

## What the ranking solo agents have (competitor teardown)

- **Tim Altass** (outranks Daniel for "selling in Morningside" with Daniel's own title pattern): three nested tiers of suburb content: suburb profile, suburb recent-sales page, and **one page per sold property with the address in the URL and title** ("28 Hall Avenue, Norman Park QLD 4170 - House Sold"). Every settled sale becomes an indexable long-tail page. Trust: 4.5 stars from 349 reviews via Trustindex.
- **Paula Pearce** ranks with only ~10 site pages. Her weapon is entirely off-domain: **4.9 stars from 340 RateMyAgent reviews across 17 suburb pages on RMA's domain**. Reviews, not site structure.
- **Tony O'Doherty** (GBP benchmark): sales figures and awards corroborated across RateMyAgent, Facebook, franchise site and trade press. Multi-platform echo is what makes trust claims surface confidently.

Daniel's /results page says "sold" 17 times and shows zero prices. His own settled sales are public record via the portals; the site-wide no-prices rule was about suburb medians (licensing), not his own results.

## What is fine (verified, stop worrying about)

- Performance: LCP 2.44s throttled mobile, CLS 0. Not a blocker (though the SVG fix improves suburb-page LCP further).
- Structured data: every sampled page's JSON-LD parses clean; licence + Wikidata render on 1,021/1,029 pages (8 misses are correctly-noindexed utility pages).
- Alt text, heading discipline (1,028/1,029 exactly one h1), canonical/trailing-slash consistency, broken links (0/30 sample), robots.txt.
- SERP caveat: several round-3 queries returned US-geo results (Norman Park, Georgia; US data brokers for the name query). The US-based check endpoint overstates name-query noise for Australian users; directionally the entity work (Wikidata) remains the fix.

## Priority actions

### P0: release the technical brake (Claude, on approval)
| ID | Fix | Effort |
|---|---|---|
| TECH-01 | Sitemap filter excludes draft/noindexed pages (astro.config.mjs reads the draft state instead of a path blocklist) | S |
| TECH-02 | Un-stage the 29 past-publish-date articles (remove stale draft flags; verify each against seo-schedule.json). Publishing decision confirmed with Daniel first | M |
| TECH-03 | Insights hub lists every live article (generate the array from the filesystem/schedule instead of a hand-list); add contextual links for the 292 orphans | M |
| TECH-04 | Extract the 303KB suburb-map SVG to one external cacheable asset (162 pages, ~59% weight cut each) | M |
| TECH-05 | Trim meta descriptions >165 chars (53% of sample) | M, bulk |

### P1: the proof layer (the competitor lesson)
| ID | Action | Owner |
|---|---|---|
| PROOF-01 | Sold-results upgrade: real prices + addresses on /results, and one page per settled sale (address in URL and title), Tim Altass pattern. Needs Daniel's sold list | Claude builds, Daniel supplies sales |
| PROOF-02 | Reviews: RMA profile still at zero. Every settled sale = one ask. Multi-platform (Google + RMA + Facebook) echo is what surfaces | Daniel |
| PROOF-03 | GBP check: no rating/review card surfaced for Daniel in search this round; confirm the profile is public, categorised as Real Estate Agent, and linked to danielgierach.com | Daniel |

### P2: measurement
- GSC → Pages report: read the true indexed count (30 seconds, answers how deep the problem runs)
- Monthly monitor already armed (Aug 1) and will capture recrawl progress

## The one-line strategy after three audits

Content: saturated. Site hygiene: done after P0. Speed: fine. What moves rankings now is (1) letting Google actually index the site (P0), (2) proof: reviews and sold results (P1), (3) time on a 1-year-old domain.
