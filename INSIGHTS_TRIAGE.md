# Insights Folder Triage Report

Generated as part of the SEO strategy execution. 414 insight `.astro` files live on disk. The live sitemap-index lists most of them, but many are duplicates or near-duplicates that should be consolidated.

## Obvious duplicate pairs (same topic, two files)

Pick one file to keep and 301-redirect the other in `vercel.json`.

| Topic | File A | File B | Recommendation |
|---|---|---|---|
| Auction reserve price | `auction-reserve-price-brisbane-sellers.astro` | `auction-reserve-price-queensland.astro` | Keep the Brisbane version (tighter geo target). Redirect the QLD slug. |
| Auction vs private treaty | `auction-vs-private-treaty-brisbane-seller.astro` | `auction-vs-private-treaty-brisbane-sellers.astro` | Keep whichever is longer. Redirect the other. |
| How to choose a real estate agent | `how-to-choose-a-real-estate-agent.astro` | `how-to-choose-a-real-estate-agent-brisbane.astro` | Keep the Brisbane version. Redirect the generic. |
| Pre-auction offers | `pre-auction-offers-brisbane.astro` | `pre-auction-offers-brisbane-sellers.astro` | Keep whichever is longer. |
| Property disclosure obligations | `property-disclosure-obligations-queensland.astro` | `property-disclosure-obligations-queensland-sellers.astro` | Keep the seller version. |
| QLD contract of sale key clauses | `queensland-contract-of-sale-key-clauses-seller.astro` | `queensland-contract-of-sale-key-clauses-seller-guide.astro` | Keep whichever is longer. |
| Selling a deceased estate | `selling-deceased-estate-brisbane.astro` | `selling-deceased-estate-queensland.astro` | Keep one. Merge unique content. |
| Unconditional offer | `unconditional-offer.astro` | `unconditional-offer-brisbane.astro` | Keep the Brisbane version. |
| When to reduce asking price | `when-to-reduce-asking-price-brisbane.astro` | `when-to-reduce-asking-price-brisbane-seller.astro` | Keep the seller version. |
| When to sell | `when-to-sell.astro` | `when-to-sell-brisbane.astro` | Keep the Brisbane version. |

## Near-duplicate triples

The cost-of-selling topic has three files. Consolidate to one authoritative article.

- `cost-of-selling-house-brisbane.astro`
- `cost-of-selling-property-brisbane.astro`
- `costs-selling-house-brisbane.astro`

Similar pattern for:
- `how-to-price-property-for-sale-brisbane.astro`
- `how-to-price-your-property-for-sale-brisbane.astro`
- `how-to-price-your-property.astro`

## Shortest files (likely stubs or placeholders)

Open and review any file under 80 lines. These are very likely draft placeholders that should either be finished or deleted.

Top 15 shortest by line count:
- 63 lines: building-pest-report.astro, buyers-agent.astro, what-happens-at-settlement.astro
- 64 lines: building-management-statement-queensland-seller-guide.astro, rental-bond-selling-tenanted-property-brisbane-queensland.astro
- 65 lines: bridging-finance-brisbane.astro, rental-appraisal-investment-property-sale-brisbane.astro, selling-property-secondary-dwelling-brisbane.astro
- 66 lines: buyers-borrowing-capacity-effect-brisbane-property-sellers.astro, home-insurance-during-sale-campaign-brisbane-seller.astro, mortgage-broker.astro, pre-sale-building-pest-inspection-brisbane-seller.astro, styling-your-home-for-sale-brisbane.astro, understanding-the-contract.astro

Full list in `/tmp/insights-by-length.txt`.

## Estimated end state

If every duplicate pair collapses to one file and every stub under 100 lines is either finished or deleted, the insights folder drops from 414 to approximately 250 articles. That is still very deep coverage for a single-agent site, and crawl authority consolidates.

## Next step

None of this has been actioned. Daniel to review and call which pairs to keep/delete. Once called, I can do the deletes, add the 301 redirects in `vercel.json`, and rerun the build.
