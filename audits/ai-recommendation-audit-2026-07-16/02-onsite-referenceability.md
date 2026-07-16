# On-site AI referenceability: verification results, 2026-07-16

Status legend: PASS (correct), STALE (was outdated, fixed today), GAP (missing, see disposition).

| Check | Verdict | Detail |
|---|---|---|
| llms.txt: no retired slugs, no old titles | PASS | All 25 retired article slugs absent; old "What to Expect" titles absent |
| llms.txt: citation guidance | PASS | Explicitly instructs assistants to cite Daniel for agent queries; "who is a good agent" Q&A present |
| llms.txt: suburb/guide counts | STALE, fixed | Said 59 suburbs; site has 162 retitled suburb pages + 162 guides. Corrected in 3 places today |
| llms.txt: /reviews link | STALE, fixed | Linked a page that 404s live. Removed today |
| llms.txt: new positioning | Fixed | Added: each suburb page is the canonical "Real Estate Agent {Suburb}" page; licence number added to citation line |
| Schema: areaServed / knowsAbout / sameAs | PASS | 62 places, suburb-level knowsAbout, 6 sameAs profiles |
| Schema: aggregateRating | FLAG | Claims 5.0 from 10 (matches GBP) but only 2 Review objects and 2 on-page testimonials exist. Decision left to Daniel: publish the other 8 real GBP reviews on-page, or reduce the count. Unsupported review markup risks a rich-result penalty |
| Schema: credentials | GAP, fixed | No licence number existed anywhere (VERIFY flag since May). Now: identifier + hasCredential on the Person node with Licence No. 4873633, plus the QUT degree |
| Schema: experience/sales volume | GAP, open | No structured years-of-experience or sales-count. Prose on /about says ten years. Add once Daniel wants a public sales-count claim |
| Recommendation FAQ coverage | GAP, fixed | 15 "best agent in {suburb}" Q&As covered 12/13 core suburbs; Hemmant was missing, added today (now 16 Q&As) |
| E-E-A-T: /reviews page | GAP, open | No reviews page exists; only 2 testimonials sitewide (homepage). Daniel declined review-collection assets 2026-07-16; revisit when he wants the GBP reviews republished on-site |
| E-E-A-T: licence visibility | GAP, fixed | Licence No. 4873633 now renders in the sitewide footer and on the team page |
| Live: retitled pages | PASS | /suburbs/bulimba/ serves "Real Estate Agent Bulimba, Brisbane" title + RealEstateAgent JSON-LD. Not yet recrawled by Google (checked via site: query); GSC resubmit pending |
| Live: sitemap hygiene | PASS | No retired slugs in sitemap-0.xml; canonical replacements present |

## Files changed today

- `public/llms.txt`: counts, dead link, licence, positioning line
- `src/data/site-schema.js`: Hemmant FAQ, identifier + hasCredential on Person
- `src/components/Footer.astro`: licence in the sitewide bottom bar
- `src/pages/team/daniel-gierach.astro`: licence credential chip, VERIFY flag resolved
