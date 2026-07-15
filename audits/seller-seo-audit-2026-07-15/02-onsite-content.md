# On-site content findings: 2026-07-15

Source: full repo inventory of src/pages (774 insight pages, 162 suburb pages) plus live page checks.

## What is already strong

- All 13 core suburbs have both a suburb page and a dedicated selling guide. Selling guides extend to 162 suburbs total.
- Seller topic coverage is saturated: fees/commission (5 articles), cost of selling (4), auction vs private treaty (3), best time to sell (2), appraisal vs valuation (3), choosing an agent (4), selling before buying (3), contract of sale (19), settlement (32), tenanted/investment sales (30), downsizing (3+), deceased estates (4), divorce sales (3).
- Suburb pages are 100% seller-angled: appraisal hero, lead form, seller FAQ schema, LocalBusiness schema with areaServed and knowsAbout, links to the selling guide and seller tools.
- Titles lead with real query phrasing ("Selling in X", "How to Sell a House in X").
- site-schema.js: areaServed (62 Places) and knowsAbout both include all 13 core suburbs. No schema gap.

## Finding 1: near-duplicate clusters splitting ranking signal (SITE-01)

The May 2026 audit recommended consolidating 571 insights to ~360. The library instead grew to 774. Confirmed cannibalizing clusters (one canonical should survive per cluster, rest 301):

- auction-vs-private-treaty-brisbane-seller / auction-vs-private-treaty-brisbane-sellers (+1 more variant)
- selling-deceased-estate-queensland / selling-deceased-estate-queensland-executor / selling-deceased-estate-brisbane
- selling-tenanted-property-queensland / tenanted-property-selling-queensland / selling-tenanted-investment-property-queensland / selling-tenanted-investment-property-queensland-guide
- what-happens-at-settlement / what-happens-on-settlement-day-queensland / settlement-day-queensland-seller-guide
- queensland-contract-of-sale-key-clauses-seller-guide / queensland-contract-of-sale-key-clauses-seller
- selling-during-divorce-separation-queensland-process / selling-property-during-separation-divorce-queensland / selling-property-separation-divorce-queensland
- cost-of-selling-house-brisbane / cost-of-selling-property-brisbane / costs-selling-house-brisbane
- how-to-choose-a-real-estate-agent-brisbane / how-to-choose-a-real-estate-agent / how-to-choose-real-estate-agent-brisbane-beyond-the-pitch / how-to-choose-real-estate-agent-brisbane-seller

This list is indicative, not exhaustive. A full pass should grep slug stems across src/pages/insights and dedupe by target query. Estimated 30 to 50 URLs retired. For each cluster: keep the strongest URL (traffic via GA4, most inlinks), merge unique content in, 301 the others in vercel.json, update internal links.

## Finding 2: five overlapping money pages (SITE-02)

walkthrough, property-worth, get-an-appraisal, property-report, report all target the same appraisal action. Internal links: property-worth (379 inlinks), walkthrough (94). Recommendation: property-worth stays the "what is my home worth" content/SEO surface, walkthrough stays the booking conversion page, and get-an-appraisal / property-report / report get 301'd or noindexed unless a campaign depends on them (check GA4 + ad links first before touching, some are funnel endpoints).

## Finding 3: the money query has no page (SITE-03)

Every suburb page titles "Selling in {Suburb} | Daniel Gierach Property", the same query as the selling guides. Nothing titles for "real estate agent {suburb}". The SERP check shows that query is won by agency pages and directories, exactly the page type a suburb page could be.

Recommendation: retitle suburb pages "Real Estate Agent {Suburb} | Daniel Gierach, Ray White Collective" (H1 can stay as-is; title/meta only, so no visual change), leaving the "selling in {suburb}" query to the guides. One page type per query.

## Finding 4: internal link equity misrouted

- Homepage → any /insights/ page: 0 links. The strongest page on the site passes nothing directly to the 774-page library. (SITE-05: add a selling-guides section, needs visual sign-off.)
- buying-in-* guides: 0 internal inlinks anywhere in src/. Fully orphaned. (SITE-06.)
- selling-in-* guides get 477 inlinks but only via suburb pages and cross-links, never from the homepage.
- Nav has 3 links (home, contact, tel), footer 6. Deliberate minimalism, fine, but it makes homepage body links the only equity channel.

## Finding 5: title template inconsistency (SITE-04)

Selling guides split across two templates:
- A: "How to Sell a House in {Suburb}, Brisbane (2026 Guide)" (e.g. Murarrie, Cannon Hill, Camp Hill)
- B: "What to Expect When Selling in {Suburb} 2026 | Daniel Gierach Property" (e.g. Bulimba, Hemmant)

Standardise on A: action + location + year front-loaded, better snippet CTR.

## Finding 6: schema hygiene (HYG-01)

Repo seo-scan flags 18+ seller-relevant insight pages with no Article/FAQ schema (form-6-agency-agreement-queensland, strata-title-selling-brisbane, simultaneous-settlement-buying-selling-queensland, etc). Low individual impact, cheap to fix in bulk.

## Explicitly NOT recommended

- Writing more seller articles. Coverage is saturated; new near-variants make cannibalization worse.
- Chasing "what is my home worth Brisbane" (valuer-intent query) or portal-dominated listing queries head-on.
