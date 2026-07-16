# AI recommendation audit: danielgierach.com, 2026-07-16

**Goal:** search engines and AI assistants (ChatGPT, Claude, Perplexity, Google AI Overviews) should recommend Daniel Gierach when consumers ask for a real estate agent in his suburbs.
**Method:** 10 recommendation-shaped live queries plus targeted directory checks; full on-site AI-referenceability verification; entity checks (Wikidata, licence, reviews). Builds on the 2026-07-15 seller SEO audit; does not repeat it.

## Headline diagnosis

**The site is ready to be cited. Daniel is not yet present where recommendations are sourced from.**

Two proof points from today's live checks:

1. When asked about Daniel by name, AI-backed search already answers with his own site's language ("registered agent with Ray White Bulimba, specialising in Brisbane's inner east"). The on-site plumbing (llms.txt, schema graph, retitled suburb pages) is working: retrieval trusts and repeats it.
2. When asked "who is the best agent in Bulimba/Camp Hill/Morningside" (10 query variants), Daniel appears in **zero** results. The sources that dominate those answers are RateMyAgent suburb rankings, agent listicles, and office rosters, and he is absent from every one of them. The same check found he is not even surfaced on his own office's public roster, while two Ray White Bulimba colleagues (Scott Darwon, Alex Donnan) rank in Bulimba's crawlable top-10 listicle.

The benchmark he is competing against: Tony O'Doherty (Bulimba) holds RateMyAgent's #1 spot for 4171 with 4.9 stars from 574 reviews, a franchise bio page, and a personal domain. AI assistants recommending Bulimba agents will assemble their answer largely from exactly that kind of footprint.

One warm lead discovered: Daniel already exists inside RateMyAgent's data as the credited agent on a settled sale (81 Clara Street, Camp Hill, $1.58M, Sept 2025). The profile exists to be claimed; it has no reviews attached.

## What was fixed on-site today (shipped with this audit)

- **Licence No. 4873633 wired sitewide** (Daniel supplied it during the audit): footer on every page, Person schema (identifier + hasCredential incl. the QUT Property Economics degree), team page credential (resolving a VERIFY flag open since May), llms.txt citation line.
- **llms.txt refreshed:** suburb counts corrected from 59 to 162, dead /reviews link removed, new line telling AI systems each suburb page is the canonical "Real Estate Agent {Suburb}" page.
- **Hemmant added** to the "best agent in {suburb}" FAQ schema (was the one missing core suburb; now 13/13).

## What remains: the recommendation checklist (Daniel, external)

Ranked by expected impact on being recommended:

| # | Action | Why it wins |
|---|---|---|
| 1 | **Claim the RateMyAgent profile** (the 81 Clara St sale proves it exists) and ask recent vendors to review him by name. RMA verifies reviews against settled sales, so each past sale is a review opportunity | RateMyAgent dominated more recommendation queries than any other source; review count is the ranking currency |
| 2 | **Ask the office to publish his agent page on raywhitebulimba.com.au** with a link to danielgierach.com. Scott Darwon has one; Daniel does not appear on the roster search surfaces at all | Cheapest fix on the list; an AI answering "Ray White Bulimba agents" currently cannot find him |
| 3 | **Grow GBP reviews** (currently 5.0 stars from 10; competitors carry hundreds). Every settled sale should generate a Google review ask | The local pack and GBP reviews feed both Maps and AI Overviews |
| 4 | **Wikidata entry** (third audit in a row confirming it is missing; field spec in the 07-15 audit) | The knowledge graph AI assistants consult for who-is-X grounding |
| 5 | **Claim OpenAgent, LocalAgentFinder, WordOfMouth profiles** with danielgierach.com links | Each owns page-one slots for suburb agent queries |
| 6 | **GSC sitemap resubmit** (still pending from 07-15; the retitled pages are not yet recrawled, confirmed today) | Accelerates the "Real Estate Agent {Suburb}" titles entering the index |

Daniel declined review-collection assets on-site (2026-07-16); items 1 and 3 are handled his own way.

## Open decision for Daniel

**Schema review-count mismatch.** The site's aggregateRating claims 5.0 from 10 reviews (matching GBP), but only 2 testimonials exist anywhere on the site. Search engines can treat unsupported review markup as a violation. Two clean options: (a) supply the other 8 GBP review texts and I publish them on-page with proper Review schema, or (b) I reduce the claimed count to match what is visible. Option (a) is better for recommendation strength.

## Measurement

Monthly, alongside the 07-15 SERP battery: re-run "who is the best real estate agent in {Bulimba, Camp Hill, Morningside}", check whether any AI-backed answer names him, and track RateMyAgent/GBP review counts.
