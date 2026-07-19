# Round-3 SERP deltas + competitor teardown, 2026-07-19

Caveat: checks ran from a US search endpoint. Queries without "Brisbane" attracted US homonyms (Norman Park GA, US data brokers on the name query). Treat absolute positions as directional; AU users see a more local mix.

## SERP deltas vs 07-15/16 baseline

| Query | danielgierach.com | Notes |
|---|---|---|
| real estate agent Seven Hills Brisbane | Absent | Portal-dominated; no solo agent sites rank here |
| real estate agent Norman Park | Absent | Query resolved to Norman Park, Georgia (US skew) |
| selling in Morningside Brisbane | Absent | timaltass.com ranks TWICE (recent-sales page + suburb editorial) |
| best real estate agent Cannon Hill | Absent | Mostly US homonyms + WhichRealEstateAgent |
| Daniel Gierach (name) | Absent from visible top 10 | US data brokers + namesakes; LinkedIn only correct result. US-skew caveat applies; Wikidata entity (created 07-19) is the durable counter |
| site:danielgierach.com Seven Hills | Page not surfaced | Page live with correct new title; not yet crawled |

## Indexation coverage (the round-3 discovery)

- site:/suburbs → only Murarrie, Greenslopes, Norman Park surfaced, all with OLD titles
- Focus five: only Norman Park visibly indexed under its own URL
- site:/insights → 3 pages surfaced; site:/tools → 1 page
- New titles confirmed live on-page (Seven Hills, Norman Park, Cannon Hill verified by direct fetch); this is recrawl lag PLUS thin index coverage
- True number lives in GSC → Pages report (Daniel: read it)

## Competitor teardown

### timaltass.com (boutique agency, outranks Daniel on his own query pattern)
- Three nested suburb tiers: /suburb-profiles/{suburb}, /recent-sales/{suburb}, /property/{address-slug} (one page per sold property, address in URL + title)
- Also: separate /reviews/ + /testimonials/ pages, per-office pages, articles
- Trust: Trustindex 4.5 stars / 349 reviews; Jenman Approved badge; 35-year brand
- The suburb editorial ("Morningside - no longer an inner city secret") independently earns a SERP slot

### paulapearce.com.au (solo agent, ~10 pages, still ranks)
- No suburb pages, no sold database on-domain
- Weapon: RateMyAgent 4.9 stars / 340 reviews spread across 17 RMA suburb pages; REIQ award; "top 1% QLD agents"; 40,000-contact database claim
- Lesson: review mass on a directory can substitute for site structure entirely

### Tony O'Doherty (GBP/trust benchmark)
- Sales figures + awards repeated consistently across RateMyAgent, Facebook (21 reviews, 100% recommend), McGrath site, EliteAgent trade press
- Multi-source corroboration is why search surfaces his numbers confidently

## GBP surface check

- "Daniel Gierach real estate agent Bulimba": no GBP card data surfaced (no rating, no review count)
- "Daniel Gierach Ray White reviews": only national Ray White brand reviews (Trustpilot/Glassdoor), nothing agent-specific
- Action: confirm the GBP is public, categorised, and linked; grow reviews

## What the ranking solo agents have that Daniel lacks

1. One indexable page per sold property (address in URL/title)
2. A visible non-zero review count anywhere public (340 / 349 / 21 vs Daniel's 0 on RMA)
3. Multi-platform corroboration of the same trust claims
4. Nested suburb content depth (profile → recent sales → sold permalinks)
5. Suburb-specific editorial that ranks independently of the suburb landing page
6. Personal awards attributed by name in third-party press
7. Stated proof numbers (sales volume, database size) echoed off-site
8. Name-query dominance (their name searches return only them)
