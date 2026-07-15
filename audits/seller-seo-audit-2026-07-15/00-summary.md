# Seller SEO + AI SEO audit: danielgierach.com

**Audit date:** 2026-07-15
**Goal:** rank #1 for everything related to selling property in the 13 core inner-east suburbs (Bulimba, Hawthorne, Balmoral, Morningside, Cannon Hill, Camp Hill, Norman Park, Coorparoo, East Brisbane, Seven Hills, Murarrie, Tingalpa, Hemmant).
**Method:** live SERP checks on 12 seller queries, full repo content inventory (774 insight pages), live technical crawl, entity/citation checks (Wikidata, external mentions).

---

## Headline diagnosis

**The site does not have a content problem. It has an authority problem.**

On-site work is close to saturated: 164 selling guides (all 13 core suburbs covered), 300+ seller-topic articles covering every seller query pattern tested, complete schema graph (RealEstateAgent + Person + FAQPage + 62 areaServed suburbs), llms.txt, AI-crawler robots rules, clean sitemap (1,043 URLs), correct redirects, Google indexation confirmed.

Despite that, danielgierach.com appears in the top 10 for **zero** of the 10 generic seller queries tested. It only surfaces on name queries, where LinkedIn outranks the site itself. The domains that win are: portals (Domain, Homely, RateMyAgent), competing agency/agent sites (Place, Belle, paulapearce.com.au), and niche calculator publishers (OpenAgent, WhichRealEstateAgent).

Root causes, in order:
1. **Near-zero external citations.** A web search for danielgierach.com mentions off-site finds only LinkedIn plus namesake noise. The domain registered July 2025, so it is roughly one year old with almost no backlink profile. No amount of on-site content fixes this.
2. **No entity presence.** No Wikidata item (flagged as the #1 lever in the May audit, still not done). Namesakes (Daniel Giersch of TMZ fame, two Wisconsin Daniel Gierachs) pollute the entity space that AI systems read.
3. **Signal dilution on-site.** The insights library has grown to 774 pages with clusters of near-identical articles competing for the same query (3 to 4 versions each of deceased estate, tenanted sale, divorce sale, auction vs private treaty, settlement day, contract clauses, cost of selling, choosing an agent). Five overlapping appraisal money pages split conversion equity. This got worse since the May audit recommended consolidation (571 pages then, 774 now).
4. **The money query has no target.** Nothing on the site titles for "real estate agent {suburb}", the single highest-commercial-intent seller query. Suburb pages title "Selling in {Suburb}", the same query the selling guides chase.

## Strategy in one line

Stop adding content. Consolidate what exists, point every external signal you can create at the domain, and build the entity graph AI systems read.

## Priority actions

Effort: S = under 1hr, M = 1 to 4hr, L = half day+. Owner: D = Daniel personally, C = Claude can execute.

### P0: authority and entity (the actual bottleneck)

| ID | Action | Owner | Effort |
|---|---|---|---|
| AUTH-01 | Create Google Business Profile as an individual agent ("Daniel Gierach, Ray White Collective") if agency rules permit. The local pack is how "real estate agent bulimba" is actually won. Confirm office address usage with Ray White first | D | M |
| AUTH-02 | Create the Wikidata item for Daniel Gierach (human, real estate agent, Ray White, Brisbane, official website danielgierach.com, sameAs LinkedIn/REA/RateMyAgent). Carried over from May audit, still open, still the biggest single AI-citation lever | D (C can draft) | S |
| AUTH-03 | Claim and complete every agent directory profile with a link to danielgierach.com: RateMyAgent (personal, not office), OpenAgent, LocalAgentFinder, WhichRealEstateAgent, Homely agent profile, Domain agent profile. These directories already own page one for "best agent {suburb}" queries. Being listed in them is the fastest page-one presence available | D | M |
| AUTH-04 | Press and citation program: sign up to SourceBottle (AU journalist requests), pitch commentary to Elite Agent, REB, Courier-Mail property desk. One earned mention naming "Daniel Gierach, real estate agent, Brisbane inner east" with a link beats months of content | D | ongoing |
| AUTH-05 | LinkedIn About must open with the literal sentence "Daniel Gierach is a real estate agent at Ray White Collective in Brisbane's inner east, specialising in Bulimba, Hawthorne and surrounding suburbs." LinkedIn currently outranks the site for his own name, so make it route intent correctly | D | S |

### P1: on-site consolidation (protect the signal)

| ID | Action | Owner | Effort |
|---|---|---|---|
| SITE-01 | Duplicate-cluster consolidation pass: merge each near-duplicate article set into one canonical URL with 301s from the rest. Known clusters listed in 02-onsite-content.md. Roughly 30 to 50 URLs retired | C | L |
| SITE-02 | Money-page consolidation: 5 appraisal-intent pages (walkthrough, property-worth, get-an-appraisal, property-report, report) → pick one canonical target per intent, 301 or clearly differentiate the rest | C (D picks canonical) | M |
| SITE-03 | Retitle suburb pages to target "Real Estate Agent {Suburb}": e.g. "Real Estate Agent Bulimba | Daniel Gierach, Ray White Collective". Selling guides keep the selling query. This ends the two-page-types-one-query overlap and finally targets the money query. Title-only change, no visual impact | C | M |
| SITE-04 | Standardise selling-guide titles on Template A ("How to Sell a House in {Suburb}, Brisbane (2026 Guide)"), currently split across two templates | C | S |
| SITE-05 | Homepage: add a "Selling guides" section linking the 13 core selling-in guides directly (currently zero homepage links to any insight page). Visual change, needs Daniel's sign-off on placement | C (D approves) | M |
| SITE-06 | Fix orphaned buying-in-* guides (zero internal links site-wide): link each from its suburb page. Add the two missing guides (Tingalpa, Hemmant) or skip, low priority for seller goal | C | S |

### P2: monitoring and hygiene

| ID | Action | Owner | Effort |
|---|---|---|---|
| MON-01 | Google Search Console: confirm property is verified, then monthly query-level check on "selling in {suburb}" and "real estate agent {suburb}" impressions to measure movement | D + C | S |
| MON-02 | Re-run this SERP battery monthly (queries listed in 01-ranking-reality.md) to track visibility | C | S |
| HYG-01 | Add Article schema to the insight pages flagged NO_SCHEMA by the repo scanner (18+ seller articles) | C | M |
| HYG-02 | Once Wikidata exists, add its URL to sameAs in site-schema.js and llms.txt | C | S |

## Expectations

The on-site P1 work protects and concentrates ranking signal but will not by itself put a one-year-old domain above Domain, RateMyAgent and established agency sites. The realistic sequence: directory profiles get him onto page one inside weeks (via their pages), GBP gets him into the local pack, citations and time move the domain itself. Suburb-level queries ("selling in murarrie") are winnable this year; generic Brisbane-wide fee queries are a long game against entrenched calculator sites.
