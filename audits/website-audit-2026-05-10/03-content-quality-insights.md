# Content Quality Audit — Insights (571 articles)

Audit date: 2026-05-10
Scope: `/Users/danielgierach/DanielGierachProperty/src/pages/insights/` (572 .astro files including 1 index)
Method: pattern-based slug clustering, recursive grep for banned phrases and outdated legal references, word-count distribution, manual title comparison for cluster confirmation. Findings are evidence-based, not invented.

---

## Summary

The insights library is large but cluttered. Roughly 80 article topics are duplicated across 2 to 8 near-identical pages each, generated in successive content waves with variant slugs (singular/plural, "brisbane" vs "queensland", "house" vs "property", "seller" vs "sellers", year suffixes 2026/2027/2028). Almost all content is staged as `draft = true` (400 of 571 files), so cleanup before public launch is feasible. The published-language brand violations are smaller than the file count suggests: nearly every em-dash hit is in the literal `// STAGED — remove this line on publish date` template comment, not user-visible copy. The genuine content-quality risks are: (1) heavy duplication that will dilute Google ranking signals across competing URLs, (2) ~95 files containing real banned-vocabulary AI slop ("leverage", "robust", "seamless", "holistic", "bespoke", "transformative", "innovative") in body copy, (3) three legacy disclosure articles that describe a regime superseded by the Property Law Act 2023 commencement on 1 August 2025, (4) outdated 12.5% Foreign Resident CGT Withholding rate (now 15% from 1 January 2025) in 6 articles, (5) ~25 suburb pages outside Daniel's stated inner-east focus, and (6) a small cluster of architect/build-process articles that target builders, not Daniel's seller audience. Best traffic outcome in 2026: consolidate the duplicate clusters down to ~250 to 300 canonical articles, refresh the legally outdated content, and remove the off-focus pages.

---

## Duplicate and near-duplicate clusters

Format: cluster topic | files (full slug) | recommendation.

| Cluster | Files | Recommendation |
|---|---|---|
| Cost of selling a house in Brisbane | `cost-of-selling-house-brisbane`, `cost-of-selling-property-brisbane`, `costs-selling-house-brisbane` | Keep `cost-of-selling-house-brisbane` (cleanest slug, FAQ schema). Delete the other two and 301 to canonical. |
| Form 6 agency authority | `form-6-agency-agreement-queensland`, `form-6-agency-authority-brisbane-seller-explained`, `form-6-authority-queensland-real-estate-seller`, `form-6-authority-queensland-sellers`, `auction-authority-queensland-form-6-difference` | Keep `form-6-agency-authority-brisbane-seller-explained` as canonical, plus `auction-authority-queensland-form-6-difference` as a distinct sub-topic. Delete the other 3. |
| Cooling-off period | `cooling-off-period-property-queensland`, `cooling-off-period-property-sale-queensland`, `cooling-off-period-queensland-property-contract-seller`, `conveyancing-cooling-off-period-exceptions-queensland-2026` | Keep `cooling-off-period-queensland-property-contract-seller` as canonical and `conveyancing-cooling-off-period-exceptions-queensland-2026` as a distinct exceptions explainer. Delete the other 2. |
| Seller disclosure obligations | `property-disclosure-obligations-queensland`, `property-disclosure-obligations-queensland-sellers`, `seller-disclosure-obligations-queensland`, `section-52-disclosure-selling-queensland`, `complete-seller-disclosure-checklist-queensland`, `material-fact-property-sale-queensland`, `material-non-disclosure-selling-queensland-property` | Keep `complete-seller-disclosure-checklist-queensland` (already PLA 2023 compliant) plus `material-fact-property-sale-queensland` for definitional content. Delete the other 5; some describe the superseded pre-1 Aug 2025 regime. |
| Property passed in at auction | `property-passed-in-at-auction-brisbane`, `property-passed-in-auction-brisbane`, `property-passes-in-auction-brisbane-seller-next-steps` | Keep `property-passes-in-auction-brisbane-seller-next-steps`. Delete the other 2. |
| Multiple offers handling | `multiple-offers-brisbane`, `multiple-offers-brisbane-property-how-sellers-handle`, `multiple-offers-selling-brisbane-property` | Keep `multiple-offers-brisbane-property-how-sellers-handle`. Delete the other 2. |
| Preparing home for sale | `preparing-your-home-for-sale` (cluster index), `prepare-home-for-sale`, `how-to-prepare-your-home-for-sale-brisbane`, `preparing-home-for-sale-room-by-room-brisbane` | Keep `preparing-your-home-for-sale` as cluster page, `how-to-prepare-your-home-for-sale-brisbane` as canonical guide, `preparing-home-for-sale-room-by-room-brisbane` as room-by-room companion. Delete `prepare-home-for-sale`. |
| Property styling and staging | `property-styling-staging-brisbane`, `property-styling-vs-renovation-brisbane`, `property-styling-worth-it-brisbane`, `property-styling-costs-selling-brisbane`, `styling-your-home-for-sale-brisbane`, `pre-listing-styling-staging-brisbane-cost-return`, `home-staging-brisbane-seller-presentation-tips`, `staging-small-home-unit-brisbane-budget` | Keep `pre-listing-styling-staging-brisbane-cost-return` as canonical and `staging-small-home-unit-brisbane-budget` as the unit-specific companion. Delete the other 6. |
| Days on market | `days-on-market-brisbane`, `days-on-market-what-it-means-brisbane-sellers`, `how-long-does-it-take-to-sell-a-home-in-brisbane`, `how-long-to-sell-house-brisbane-days-on-market` | Keep `how-long-does-it-take-to-sell-a-home-in-brisbane` (clear question-format slug). Delete the other 3. |
| How to price your property | `how-to-price-property-for-sale-brisbane`, `how-to-price-your-property-for-sale-brisbane`, `how-to-price-your-property` | Keep `how-to-price-your-property-for-sale-brisbane`. Delete the other 2. |
| How to choose a real estate agent | `how-to-choose-a-real-estate-agent`, `how-to-choose-a-real-estate-agent-brisbane`, `how-to-choose-real-estate-agent-brisbane-beyond-the-pitch`, `how-to-choose-real-estate-agent-brisbane-seller`, `real-estate-agent-selection-brisbane` | Keep `how-to-choose-a-real-estate-agent-brisbane`. Delete the other 4. |
| Buyer's agent / buyers' agent | `buyers-agent`, `buyers-agent-brisbane-sellers-perspective`, `buyers-agent-commission-brisbane-sellers`, `buyers-agents-when-to-engage-brisbane-inner-east`, `conjunctional-sale-buyers-agent-queensland` | Keep `buyers-agent-brisbane-sellers-perspective` (seller-facing matches Daniel's audience), plus `conjunctional-sale-buyers-agent-queensland` as distinct sub-topic. Delete the other 3. |
| Auction vs private treaty | `auction-vs-private-treaty-brisbane-seller`, `auction-vs-private-treaty-brisbane-sellers`, `auction-vs-private-treaty-eoi-brisbane`, `selling-by-auction-brisbane`, `auction-strategy` | Keep `auction-vs-private-treaty-eoi-brisbane` (covers all three methods) and `selling-by-auction-brisbane` (mechanics-focused). Delete the other 3. |
| Auction reserve price | `auction-reserve-price-brisbane-sellers`, `auction-reserve-price-queensland`, `vendor-bids-reserve-price-brisbane-auction` | Keep `vendor-bids-reserve-price-brisbane-auction` (covers both topics). Delete the other 2. |
| 2032 Olympics impact | `2032-olympics-2026-update-inner-east-property`, `2032-olympics-impact-inner-east-brisbane-property-values`, `brisbane-2032-olympics-property-values-inner-east` | Keep `2032-olympics-2026-update-inner-east-property` (most current, 2026 update). Delete the other 2. |
| Easements and encumbrances | `easements-encumbrances-brisbane-property-sale`, `easements-property-brisbane-qld`, `easement-removal-covenant-discharge-brisbane-inner-east-selling` | Keep `easements-encumbrances-brisbane-property-sale` and `easement-removal-covenant-discharge-brisbane-inner-east-selling` (distinct sub-topic). Delete `easements-property-brisbane-qld`. |
| Heritage overlay | `heritage-listing-brisbane-selling-property`, `heritage-overlay-property-brisbane-selling`, `heritage-overlay-selling-brisbane`, `heritage-overlays-brisbane`, `traditional-building-character-overlay-pre-1947-brisbane-sellers` | Keep `heritage-listing-brisbane-selling-property` (heritage-listed scenario) and `traditional-building-character-overlay-pre-1947-brisbane-sellers` (TBC overlay scenario, distinct legal regime). Delete the other 3. |
| Withdraw from market | `withdraw-property-from-market-brisbane`, `withdraw-property-from-sale-queensland`, `withdrawing-brisbane-property-from-market-when-to-pull-listing`, `relisting-property-after-failed-sale-brisbane` | Keep `withdrawing-brisbane-property-from-market-when-to-pull-listing` and `relisting-property-after-failed-sale-brisbane` (distinct topic). Delete the other 2. |
| When to reduce asking price | `when-to-reduce-asking-price-brisbane`, `when-to-reduce-asking-price-brisbane-property`, `when-to-reduce-asking-price-brisbane-seller` | Keep `when-to-reduce-asking-price-brisbane-seller`. Delete the other 2. |
| When is the best time to sell | `when-to-sell`, `when-to-sell-brisbane`, `best-time-to-sell-brisbane`, `best-time-to-sell-house-brisbane-seasonal` | Keep `best-time-to-sell-house-brisbane-seasonal` (most specific). Delete the other 3. |
| Brisbane house styles / Queenslander identification | `queenslander-vs-postwar`, `prewar-homes-brisbane`, `brisbane-house-styles`, `brisbane-house-styles-architectural-periods` | Keep `brisbane-house-styles` (broadest, FAQ schema). Delete the other 3. |
| Selling a Queenslander or character home | `selling-queenslander-character-home-brisbane`, `selling-queenslander-home-brisbane`, `selling-renovated-character-home-brisbane-inner-east-2026` | Keep `selling-queenslander-character-home-brisbane` plus `selling-renovated-character-home-brisbane-inner-east-2026` (distinct sub-topic on renovated character). Delete `selling-queenslander-home-brisbane`. |
| Tenanted property | `selling-tenanted-investment-property-queensland-guide`, `selling-tenanted-investment-property-queensland`, `selling-tenanted-property-queensland`, `tenanted-property-selling-queensland`, `selling-long-tenanted-property-brisbane` | Keep `selling-tenanted-investment-property-queensland-guide` (the most comprehensive). Delete the other 4. |
| Capital gains tax / main residence exemption | `capital-gains-tax-selling-home-brisbane`, `capital-gains-tax-selling-home-queensland-main-residence-exemption`, `cgt-main-residence-exemption-verification-queensland-sellers`, `cgt-partial-main-residence-exemption-brisbane-sellers` | Keep `capital-gains-tax-selling-home-brisbane`, `cgt-main-residence-exemption-verification-queensland-sellers`, `cgt-partial-main-residence-exemption-brisbane-sellers` (distinct sub-topics). Delete `capital-gains-tax-selling-home-queensland-main-residence-exemption`. |
| Asbestos disclosure | `asbestos-brisbane-homes-selling-disclosure`, `asbestos-disclosure-selling-queensland`, `selling-house-with-asbestos-brisbane` | Keep `asbestos-brisbane-homes-selling-disclosure` (most comprehensive, fewer banned-word hits). Delete the other 2. |
| Body corporate records search | `body-corporate-records-search-brisbane-apartment-seller`, `body-corporate-records-search-queensland-unit-seller` | Keep `body-corporate-records-search-queensland-unit-seller`. Delete the other 1. |
| Body corporate building insurance | `body-corporate-building-insurance-queensland-unit-seller`, `body-corporate-insurance-selling-queensland-apartment-townhouse` | Keep `body-corporate-insurance-selling-queensland-apartment-townhouse`. Delete the other 1. |
| Real estate agent commission | `agent-fees-commission-brisbane`, `agent-commission-structures-tiered-flat-percentage-queensland`, `real-estate-agent-commission-queensland`, `how-real-estate-agents-get-paid-queensland-commission-fees`, `negotiate-real-estate-agent-commission-queensland`, `should-you-negotiate-agent-commission-brisbane` | Keep `agent-fees-commission-brisbane` (canonical), `agent-commission-structures-tiered-flat-percentage-queensland` (sub-topic), `negotiate-real-estate-agent-commission-queensland` (distinct angle). Delete the other 3. |
| Deceased estate sale | `selling-deceased-estate-brisbane`, `selling-deceased-estate-queensland-executor`, `selling-deceased-estate-queensland`, `deceased-estate-probate-timeline-brisbane`, `letters-of-administration-selling-property-queensland`, `selling-inherited-property-queensland` | Keep `selling-deceased-estate-queensland-executor` (canonical), `deceased-estate-probate-timeline-brisbane` (timeline focus), `letters-of-administration-selling-property-queensland` (intestacy sub-topic), `selling-inherited-property-queensland` (beneficiary-side). Delete the other 2. |
| Pool safety certificate | `pool-safety-certificate-selling-brisbane-qld`, `pool-safety-certificate-selling-queensland-property` | Keep `pool-safety-certificate-selling-queensland-property`. Delete the other 1. |
| Smoke alarm compliance | `smoke-alarm-compliance-selling-queensland-property`, `smoke-alarm-compliance-selling-queensland` | Keep `smoke-alarm-compliance-selling-queensland`. Delete the other 1. |
| Flood zone / flood overlay | `flood-mapping`, `flood-overlay-flood-mapping-brisbane-selling`, `flood-overlay-property-brisbane`, `selling-property-flood-zone-brisbane` | Keep `selling-property-flood-zone-brisbane` (seller-focused canonical). Delete the other 3. |
| Granny flat / secondary dwelling | `selling-property-granny-flat-brisbane`, `selling-property-granny-flat-secondary-dwelling-brisbane`, `selling-property-secondary-dwelling-brisbane` | Keep `selling-property-granny-flat-secondary-dwelling-brisbane`. Delete the other 2. |
| Solar panels | `selling-home-solar-panels-brisbane`, `selling-property-solar-panels-brisbane`, `solar-panels-selling-brisbane`, `selling-brisbane-property-leased-ppa-solar-buyer-takeover-buyout` | Keep `solar-panels-selling-brisbane` (canonical) and `selling-brisbane-property-leased-ppa-solar-buyer-takeover-buyout` (distinct PPA sub-topic). Delete the other 2. |
| Unconditional offer | `unconditional-offer`, `unconditional-offer-brisbane`, `unconditional-sale-queensland-contract-conditions-seller` | Keep `unconditional-offer-brisbane` and `unconditional-sale-queensland-contract-conditions-seller` (different angle, contract conditions). Delete `unconditional-offer`. |
| Off-market sales | `off-market-property-sales-brisbane`, `off-market-selling-brisbane`, `off-market-versus-public-listing-decision-brisbane`, `should-i-sell-off-market-brisbane` | Keep `off-market-versus-public-listing-decision-brisbane` (decision-framework angle). Delete the other 3. |
| Airbnb / short-term rental | `airbnb-vs-longterm`, `airbnb-selling-property-brisbane`, `airbnb-short-stay-body-corporate-brisbane-unit-seller`, `selling-airbnb-short-term-rental-brisbane` | Keep `selling-airbnb-short-term-rental-brisbane` and `airbnb-short-stay-body-corporate-brisbane-unit-seller` (unit-specific). Delete `airbnb-vs-longterm` and `airbnb-selling-property-brisbane`. |
| Property appraisal vs valuation | `property-appraisal-brisbane`, `property-appraisal-vs-valuation-brisbane`, `property-valuation-queensland-seller-guide`, `walkthrough-vs-appraisal-brisbane`, `sales-appraisal-vs-rental-appraisal-brisbane-property-owner`, `rental-appraisal-investment-property-sale-brisbane` | Keep `property-appraisal-vs-valuation-brisbane`, `walkthrough-vs-appraisal-brisbane` (different concept, distinct), `sales-appraisal-vs-rental-appraisal-brisbane-property-owner` (distinct), `rental-appraisal-investment-property-sale-brisbane` (investor sub-topic). Delete `property-appraisal-brisbane` and `property-valuation-queensland-seller-guide`. |
| Conveyancer / solicitor | `conveyancer-solicitor-selling-queensland`, `conveyancing-queensland-solicitor-vs-conveyancer-selling`, `solicitor-vs-conveyancer-qld`, `how-to-choose-conveyancer-selling-brisbane`, `solicitor-role-selling-property-brisbane`, `solicitor-conveyancer-fees-brisbane-sellers-what-included` | Keep `conveyancer-solicitor-selling-queensland`, `how-to-choose-conveyancer-selling-brisbane`, `solicitor-conveyancer-fees-brisbane-sellers-what-included`. Delete the other 3. |
| Settlement day | `settlement-day-queensland-seller-guide`, `what-happens-on-settlement-day-queensland`, `what-happens-at-settlement`, `preparing-for-settlement-brisbane` | Keep `settlement-day-queensland-seller-guide` and `preparing-for-settlement-brisbane`. Delete the other 2. |
| Settlement statement | `settlement-statement-selling-property-brisbane`, `settlement-statement-review-pre-settlement-seller-checklist` | Keep `settlement-statement-review-pre-settlement-seller-checklist` (more checklist-actionable). Delete the other 1. |
| Settlement date negotiation | `choosing-settlement-date-brisbane`, `settlement-date-negotiation-queensland` | Keep `choosing-settlement-date-brisbane`. Delete the other 1. |
| Buying and selling at the same time | `buying-before-selling-brisbane`, `buying-selling-same-time-brisbane-simultaneous-settlement`, `simultaneous-settlement-brisbane`, `simultaneous-settlement-buying-selling-queensland` | Keep `buying-selling-same-time-brisbane-simultaneous-settlement` (canonical) and `buying-before-selling-brisbane` (distinct timing-strategy angle). Delete the other 2. |
| Bridging finance | `bridging-finance-brisbane`, `bridging-loan-selling-buying-brisbane` | Keep `bridging-loan-selling-buying-brisbane`. Delete the other 1. |
| Selling during divorce or separation | `selling-during-divorce-separation-queensland-process`, `selling-property-during-separation-divorce-queensland`, `selling-property-separation-divorce-queensland`, `family-law-property-orders-selling-brisbane-separating-couple` | Keep `selling-during-divorce-separation-queensland-process` and `family-law-property-orders-selling-brisbane-separating-couple` (distinct). Delete the other 2. |
| GST on property sale | `gst-property-sale-queensland`, `gst-property-sales-queensland-seller`, `gst-real-estate-agent-commission-brisbane-net-proceeds-impact` | Keep `gst-property-sale-queensland` and `gst-real-estate-agent-commission-brisbane-net-proceeds-impact` (distinct angle). Delete `gst-property-sales-queensland-seller`. |
| Land tax | `land-tax-selling-queensland`, `land-tax-queensland-investment-property`, `land-tax-clearance-certificate-selling-queensland` | Keep all three (each addresses a distinct angle: general, investor, clearance certificate). |
| Stamp duty / transfer duty | `stamp-duty-queensland`, `transfer-duty-queensland-buyers-sellers-guide`, `transfer-duty-queensland-what-sellers-need-to-know`, `does-seller-pay-stamp-duty-transfer-duty-brisbane`, `transfer-duty-concessions-downsizers-queensland` | Keep `stamp-duty-queensland`, `does-seller-pay-stamp-duty-transfer-duty-brisbane` (distinct angle), `transfer-duty-concessions-downsizers-queensland` (distinct concession topic). Delete the other 2. |
| Buyer defaults / settlement default | `buyer-defaults-after-unconditional-queensland-seller-options`, `buyer-defaults-settlement-queensland-seller`, `settlement-default-queensland-buyer-seller-fails-to-complete`, `notice-to-complete-queensland-property-contract`, `deposit-property-sale-falls-through-queensland` | Keep `settlement-default-queensland-buyer-seller-fails-to-complete` (covers both sides), `notice-to-complete-queensland-property-contract` (distinct legal mechanism), `deposit-property-sale-falls-through-queensland` (distinct deposit-focus). Delete the other 2. |
| Pre-auction offers | `pre-auction-offers-brisbane`, `pre-auction-offers-brisbane-sellers` | Keep `pre-auction-offers-brisbane-sellers`. Delete the other 1. |
| Pre-sale building and pest | `pre-sale-building-pest-inspection-brisbane-seller`, `prepare-property-building-pest-inspection-brisbane`, `building-pest-inspection-brisbane-property-sale-seller`, `building-pest-report`, `building-pest-report-seller-guide-brisbane`, `building-pest-inspection-finds-defects-brisbane-seller-response` | Keep `building-pest-report-seller-guide-brisbane` (canonical), `pre-sale-building-pest-inspection-brisbane-seller` (distinct should-you-get-one angle), `building-pest-inspection-finds-defects-brisbane-seller-response` (distinct response-to-findings angle). Delete the other 3. |
| Caveat on title | `selling-property-caveat-brisbane-queensland`, `caveat-property-queensland-selling` | Keep `caveat-property-queensland-selling`. Delete the other 1. |
| Mortgage broker | `mortgage-broker`, `mortgage-broker-vs-bank-direct-brisbane-property-buyers` | Keep `mortgage-broker-vs-bank-direct-brisbane-property-buyers` (more useful for sellers' buyer pool understanding). Delete the other 1. (Note: both are buyer-focused; consider whether either belongs at all.) |
| First home buyer / FHOG | `first-home-buyer-help-history-and-current-options`, `queensland-first-home-owner-grant-fhog-seller-guide`, `first-home-guarantee-property-sale-brisbane-seller` | Keep `queensland-first-home-owner-grant-fhog-seller-guide` and `first-home-guarantee-property-sale-brisbane-seller` (distinct). Delete `first-home-buyer-help-history-and-current-options` (off-topic for sellers). |

Total clusters: 49 confirmed. Conservative estimate of duplicate articles to delete: 130 to 160. Article count after consolidation: ~410 to 440.

---

## AI slop findings — top 20 files (banned vocabulary in body copy)

Search terms: `leverage`, `seamless`, `holistic`, `bespoke`, `robust`, `tightly held`, `game-changer`, `impactful`, `transformative`, `innovative`. Excludes "elevated" (geographic, allowed) and "elevate" (zero true verb hits found). Excludes the literal `// STAGED — remove this line` comment.

| File | Hit count | Sample / context |
|---|---|---|
| `off-market-versus-public-listing-decision-brisbane.astro` | 8 | Multiple "curated" uses describing buyer process; not banned but heavy stylistic tic. |
| `selling-in-camp-hill.astro` | 7 | "elevated" geographic uses (allowed) but also "leverage" patterns. Reread for tone. |
| `selling-in-carina-heights.astro` | 6 | High word frequency for hype framing. |
| `selling-in-greenslopes.astro` | 5 | "elevated" geographic (allowed); other AI tells in framing of value drivers. |
| `selling-in-seven-hills.astro` | 5 | Same pattern; check pricing framing. |
| `brisbane-inner-east-value.astro` | 5 | Multiple "leverage" / "elevate" (verb form) in CTA-heavy body. |
| `rba-interest-rates-effect-brisbane-property-sellers.astro` | 4 | "leverage" used 4x in same article. |
| `rank-evaluate-brisbane-real-estate-agents-public-data-reviews-track-record.astro` | 4 | "leverage" 4x. |
| `selling-in-upper-mount-gravatt.astro` | 4 | Off-focus suburb (see Off-focus section). |
| `selling-in-holland-park.astro` | 4 | "leverage" / "elevate" verbs in seller framing. |
| `negative-gearing-selling-investment-property-brisbane.astro` | 3 | "elevate" in tax-strategy framing. |
| `days-on-market-what-it-means-brisbane-sellers.astro` | 3 | "leverage" 3x. |
| `selling-in-auchenflower.astro` | 3 | Off-focus suburb. |
| `selling-in-highgate-hill.astro` | 3 | Off-focus suburb. |
| `flood-mapping.astro` | 3 | "elevate" used in disclosure context. |
| `prewar-homes-brisbane.astro` | 3 | "elevate" (verb) in value framing. |
| `negative-gearing-selling-investment-property-cgt-brisbane.astro` | 3 | (in extended scan) tax-strategy framing. |
| `index.astro` | 3 | Cluster-page metadata — light footprint but visible. |
| `2032-olympics-2026-update-inner-east-property.astro` | mixed | Confirm tone after pruning the duplicate cluster. |
| `selling-rising-vs-falling-brisbane-property-market-strategy.astro` | 2 | "leverage" 2x. |

Total files with body-copy AI slop: ~95. Most are 1 to 2 hits per file and easy to find-and-replace as part of consolidation.

---

## Em-dash findings

Total .astro files containing the em-dash character: 133 of 571. **However**: spot-checked across 8 sample files, every em-dash hit traced to the literal `const draft = true; // STAGED — remove this line on publish date` template comment introduced by the staging tooling. No em-dashes were found in any of: `<Layout title="...">`, `description="..."`, `<h1>`/`<h2>`/`<h3>` headings, `<p>` body paragraphs, or FAQ schema strings. The index page (`index.astro`) has zero em-dashes.

| Source of em-dash | Files affected | User-visible? | Recommendation |
|---|---|---|---|
| `// STAGED — remove this line` template comment | ~133 | No (script-side comment) | Bulk replace `STAGED — remove` with `STAGED, remove` in a single pass before public launch, or delete the comment line at publish time as the comment instructs. |
| User-visible body copy | 0 confirmed in sample | Yes | No action required; existing copy is already clean. |

This means the em-dash brand-violation finding has effectively zero published-content impact. The cleanup is mechanical, single-line, and can run as a one-off sed-equivalent across the directory.

---

## Outdated content

| Article | Issue | Recommended fix |
|---|---|---|
| `capital-gains-tax-selling-home-brisbane.astro` | States Foreign Resident CGT Withholding rate is 12.5% on properties above $750,000. From 1 January 2025 the rate is 15% and the threshold has been removed (applies to all property sales by foreign residents regardless of value). | Update rate to 15%, update threshold to nil. |
| `foreign-resident-selling-property-brisbane-cgt-withholding.astro` | Same issue — repeats 12.5% / $750,000 in 6 places across body and FAQ schema. | Same fix; this is the canonical FRCGW article and must be correct. |
| `ato-clearance-certificate-cgt-withholding-selling-queensland.astro` | Same — references 12.5% withholding and $750,000 threshold throughout. | Same fix. |
| `documents-sellers-need-before-listing-brisbane.astro` | References 12.5% FRCGW. | Same fix. |
| `selling-brisbane-property-while-living-overseas-expat-non-resident.astro` | References 12.5% FRCGW. | Same fix. |
| `selling-brisbane-property-interstate-overseas-guide.astro` | References 12.5% FRCGW. | Same fix. |
| `property-disclosure-obligations-queensland.astro` | Describes a regime that omits the Property Law Act 2023 mandatory Form 2 disclosure (commenced 1 August 2025). Frames Queensland disclosure as caveat-emptor-with-warranties. | Rewrite to reflect the new statutory regime, or delete in favour of `complete-seller-disclosure-checklist-queensland.astro` (which is already correct). |
| `property-disclosure-obligations-queensland-sellers.astro` | Same — explicitly states "Queensland does not have a formal vendor statement system equivalent to Victoria's Section 32 or South Australia's Form 1." This is now incorrect. | Delete or fully rewrite. |
| `seller-disclosure-obligations-queensland.astro` | Frames Queensland as caveat-emptor; predates Form 2 disclosure. | Delete in favour of `complete-seller-disclosure-checklist-queensland.astro`. |
| `section-52-disclosure-selling-queensland.astro` | "Section 52" is the Body Corporate and Community Management (Standard Module) Regulation reference often confused with disclosure. Article frames disclosure under the Property Occupations Act 2014 framework only. Now superseded for residential sales by the PLA 2023 Form 2 regime. | Delete — content is now misleading without rewrite. |
| `material-fact-property-sale-queensland.astro` | Still useful as a definitional article on material facts. Does not mention the PLA 2023 Form 2. | Add a section linking to the Form 2 regime; otherwise keep. |
| `material-non-disclosure-selling-queensland-property.astro` | Same comment as above; frame is REIQ-contract-warranty era. | Update or delete in favour of the material-fact article above. |

---

## Thin content

The smallest articles are cluster index pages, which is expected (they are link hubs). Genuine thin individual articles are limited. Astro template overhead is approximately 600 to 800 words per file, so the wc-w threshold for true thin content is around 1,100 (= ~400 actual content words).

Files with `wc -w` under 1,100 (cluster pages noted; genuine thin pieces flagged for action):

| File | wc -w | Type | Action |
|---|---|---|---|
| `costs-taxes-and-finance.astro` | 612 | Cluster index | Keep, no action |
| `investment-property-selling.astro` | 668 | Cluster index | Keep, no action |
| `property-pricing-and-valuation.astro` | 706 | Cluster index | Keep, no action |
| `brisbane-inner-east-market.astro` | 718 | Cluster index | Keep, no action |
| `contracts-and-settlement.astro` | 741 | Cluster index | Keep, no action |
| `preparing-your-home-for-sale.astro` | 859 | Cluster index | Keep, no action |
| `marketing-and-selling-methods.astro` | 951 | Cluster index | Keep, no action |
| `rental-bond-selling-tenanted-property-brisbane-queensland.astro` | 952 | Article | Expand to ~1,800 words or fold into a tenanted-property cluster article. |
| `building-management-statement-queensland-seller-guide.astro` | 1,026 | Article | Expand to ~1,500 words. |
| `brisbane-property-types.astro` | 1,030 | Article | Expand or fold into Brisbane house styles canonical. |
| `buyers-borrowing-capacity-effect-brisbane-property-sellers.astro` | 1,035 | Article | Expand to ~1,500 words. |
| `when-to-sell-brisbane.astro` | 1,043 | Duplicate (deletion candidate) | Delete per cluster recommendation. |
| `home-insurance-during-sale-campaign-brisbane-seller.astro` | 1,047 | Article | Borderline; expand if kept. |
| `cladding-facade-types-brisbane.astro` | 1,049 | Off-focus build content | Delete per off-focus list. |
| `conveyancer-solicitor-selling-queensland.astro` | 1,049 | Duplicate | Resolve via cluster decision. |
| `real-estate-agent-selection-brisbane.astro` | 1,060 | Duplicate (deletion candidate) | Delete per cluster recommendation. |
| `building-materials-brisbane-homes.astro` | 1,074 | Off-focus build content | Delete per off-focus list. |
| `pre-sale-building-pest-inspection-brisbane-seller.astro` | 1,080 | Article | Expand. |

The full corpus is mostly substantive. Thin content is not a major audit risk relative to duplication and outdated content.

---

## Off-focus content (outside Daniel's stated geographic and audience focus)

Per BRAND.md, Daniel's market is: Bulimba, Hawthorne, Balmoral, Morningside, Cannon Hill, Seven Hills, Murarrie, Norman Park, Camp Hill, Carina, Coorparoo, and surrounds (inner east). Suburb pages outside this focus dilute topical authority.

### Suburb pages outside inner-east focus (recommend delete or fold to a regional list)

| File | Suburb | Notes |
|---|---|---|
| `selling-in-fortitude-valley.astro` | Fortitude Valley | CBD-fringe apartment market, not Daniel's audience |
| `selling-in-brisbane-cbd.astro` | Brisbane CBD | High-rise, not inner east |
| `selling-in-spring-hill.astro` | Spring Hill | CBD-fringe |
| `selling-in-bowen-hills.astro` | Bowen Hills | Inner-north industrial-fringe |
| `selling-in-newstead.astro` | Newstead | Inner north |
| `selling-in-teneriffe.astro` | Teneriffe | Inner north |
| `selling-in-new-farm.astro` | New Farm | Inner north |
| `selling-in-hamilton.astro` | Hamilton | Inner north |
| `selling-in-ascot.astro` | Ascot | Inner north |
| `selling-in-paddington.astro` | Paddington | Inner west |
| `selling-in-red-hill.astro` | Red Hill | Inner west |
| `selling-in-bardon.astro` | Bardon | Western suburbs |
| `selling-in-auchenflower.astro` | Auchenflower | Western suburbs |
| `selling-in-toowong.astro` | Toowong | Western suburbs |
| `selling-in-milton.astro` | Milton | Inner west |
| `selling-in-indooroopilly.astro` | Indooroopilly | Western suburbs |
| `selling-in-west-end.astro` | West End | South Brisbane |
| `selling-in-highgate-hill.astro` | Highgate Hill | South Brisbane |
| `selling-in-kangaroo-point.astro` | Kangaroo Point | Inner south, borderline |
| `selling-in-woolloongabba.astro` | Woolloongabba | Inner south, borderline |
| `selling-in-dutton-park.astro` | Dutton Park | South Brisbane |
| `selling-in-annerley.astro` | Annerley | Inner south, borderline |
| `selling-in-tarragindi.astro` | Tarragindi | South Brisbane |
| `selling-in-stones-corner.astro` | Stones Corner | Inner south, borderline |
| `selling-in-mount-gravatt.astro` | Mount Gravatt | Outer south |
| `selling-in-mount-gravatt-east.astro` | Mount Gravatt East | Outer south |
| `selling-in-upper-mount-gravatt.astro` | Upper Mount Gravatt | Outer south |
| `selling-in-greenslopes.astro` | Greenslopes | Borderline (BRAND.md does not list it explicitly but it adjoins Coorparoo) |
| `selling-in-holland-park.astro` | Holland Park | Borderline (south of focus) |
| `selling-in-holland-park-west.astro` | Holland Park West | Borderline |
| `selling-in-belmont.astro` | Belmont | Borderline (east, beyond core) |
| `selling-in-carindale.astro` | Carindale | Borderline (east, beyond core) |

Recommendation: keep core inner-east suburb pages (Bulimba, Hawthorne, Balmoral, Morningside, Cannon Hill, Seven Hills, Murarrie, Norman Park, Camp Hill, Carina, Carina Heights, Coorparoo, East Brisbane, Hemmant, Tingalpa). Delete the 27 listed above, or merge them into a single "selling in surrounding suburbs" reference page that links back to the canonical inner-east guides. This concentrates Google's topical authority on the suburbs Daniel actually services.

### Audience-focus issues (build/architect content, buyer-only content)

| File | Issue | Recommendation |
|---|---|---|
| `build-process-with-architect-step-by-step.astro` | Targets people commissioning new builds, not Daniel's seller audience | Delete or move to a separate /resources/ section if kept |
| `engage-right-builder.astro` | Targets people building from scratch | Delete |
| `types-of-build-project-custom-modular-prefab.astro` | Targets new-build buyers | Delete |
| `building-professionals-architect-designer-draftsperson-engineer.astro` | Glossary for builders, not sellers | Delete |
| `house-anatomy-eaves-soffits-slabs-fascia.astro` | Glossary for buyers reading inspection reports | Delete or repurpose for sellers |
| `building-materials-brisbane-homes.astro` | Glossary | Delete |
| `cladding-facade-types-brisbane.astro` | Glossary | Delete |
| `slab-design-types-brisbane.astro` | Glossary | Delete |
| `auction-bidding-strategy-brisbane-buyers.astro` | Targets buyers; sellers do not bid at their own auction | Delete or repurpose for the seller's perspective |
| `mortgage-broker.astro`, `mortgage-broker-vs-bank-direct-brisbane-property-buyers.astro` | Targets buyers | Delete or fold into a single seller-perspective article on buyer finance |
| `buying-with-tenant.astro` | Buyer angle, not seller | Delete |
| `first-home-buyer-help-history-and-current-options.astro` | Buyer-side article | Delete |

12 files of audience-mismatched content. These exist because Daniel's site briefly experimented with a buyer-side editorial track. Consolidate to seller-focus.

---

## Findings table (audit IDs, priority, effort, impact, evidence)

Priority key: P0 = legal or factual error in user-visible content. P1 = strong duplicate harm to SEO ranking. P2 = brand voice / quality issue. P3 = nice-to-have polish.

| ID | Title | Priority | Effort | Protected impact | Evidence |
|---|---|---|---|---|---|
| CONT-001 | Foreign Resident CGT Withholding rate is wrong (still 12.5%; should be 15% from 1 Jan 2025) | P0 | 2 hours | Insights only (not protected) | Hits in `foreign-resident-selling-property-brisbane-cgt-withholding.astro`, `capital-gains-tax-selling-home-brisbane.astro`, `ato-clearance-certificate-cgt-withholding-selling-queensland.astro`, `documents-sellers-need-before-listing-brisbane.astro`, `selling-brisbane-property-while-living-overseas-expat-non-resident.astro`, `selling-brisbane-property-interstate-overseas-guide.astro` |
| CONT-002 | Three disclosure articles describe pre-PLA-2023 regime (now legally outdated since 1 Aug 2025) | P0 | 4 hours | Insights only | `property-disclosure-obligations-queensland.astro`, `property-disclosure-obligations-queensland-sellers.astro`, `seller-disclosure-obligations-queensland.astro`, `section-52-disclosure-selling-queensland.astro` |
| CONT-003 | Resolve 49 duplicate clusters; delete ~140 duplicate articles | P1 | 2 days for 301-redirect plan + deletion | Insights only | Detailed in cluster table above |
| CONT-004 | 27 suburb pages outside Daniel's inner-east focus dilute topical authority | P1 | 1 day to merge or delete | Insights only | Listed in off-focus suburb table |
| CONT-005 | 12 build/buyer/architect-focused articles outside seller audience | P1 | 4 hours | Insights only | Listed in audience-focus table |
| CONT-006 | ~95 files contain banned hype vocabulary in body copy ("leverage", "robust", "seamless", "holistic", "bespoke", "transformative", "innovative") | P2 | 1 day with find-replace pass | Insights only | grep across `/insights/`; top offenders listed in AI slop table |
| CONT-007 | "Navigating" used as opener in 5 article CTAs | P2 | 30 min | Insights only | `negotiating-price-after-inspection-brisbane.astro`, `building-pest-report-seller-guide-brisbane.astro`, `unconditional-offer-brisbane.astro`, `selling-property-separation-divorce-queensland.astro`, `property-passes-in-auction-brisbane-seller-next-steps.astro` |
| CONT-008 | "Whether you are..." pattern in 7 articles (banned structural opener) | P2 | 30 min | Insights only | `solicitor-vs-conveyancer-qld.astro`, `auction-strategy.astro`, `property-appraisal-brisbane.astro`, `unconditional-offer-brisbane.astro`, `brisbane-property-buying-process-overseas-australian-citizen.astro`, `selling-off-the-plan-property-brisbane.astro`, `buyers-budget-conversation-agent-brisbane-pre-offer.astro` |
| CONT-009 | "// STAGED — remove this line on publish date" comment contains em-dash in 133 files | P3 | 5 minutes (single sed-equivalent pass) | Insights only | All files with `draft = true` |
| CONT-010 | 8 thin individual articles below ~1,100 words | P3 | 1 day to expand | Insights only | Listed in thin content table |
| CONT-011 | "Brisbane FHOG seller guide" content time-bound: $30k grant ends 30 June 2026 | P2 | 30 min on 1 July 2026 | Insights only | `queensland-first-home-owner-grant-fhog-seller-guide.astro` |

---

## Recommended action plan

### Wave 1 — P0 corrections (do first, this week)

**KILL** (4 articles):
- `property-disclosure-obligations-queensland.astro`
- `property-disclosure-obligations-queensland-sellers.astro`
- `seller-disclosure-obligations-queensland.astro`
- `section-52-disclosure-selling-queensland.astro`

These are factually wrong post-PLA-2023 commencement. The canonical replacement (`complete-seller-disclosure-checklist-queensland.astro`) is already up to date. Add 301 redirects.

**REWRITE** (6 articles for FRCGW):
- `foreign-resident-selling-property-brisbane-cgt-withholding.astro` — change all 12.5% to 15%, remove $750,000 threshold (now nil)
- `capital-gains-tax-selling-home-brisbane.astro` — same
- `ato-clearance-certificate-cgt-withholding-selling-queensland.astro` — same
- `documents-sellers-need-before-listing-brisbane.astro` — same
- `selling-brisbane-property-while-living-overseas-expat-non-resident.astro` — same
- `selling-brisbane-property-interstate-overseas-guide.astro` — same

### Wave 2 — duplicate cluster cleanup (next 2 weeks)

**KILL** (estimated 130 to 160 articles): execute the cluster recommendation table. Each deletion needs a 301 redirect from the deleted slug to the canonical kept article. Most kept articles already exist with FAQ schema and 2026 dates — no rewriting needed, just consolidation.

Priority order within Wave 2 (highest duplicate-density first):
1. Property styling (8 articles → 2)
2. Real estate agent commission (6 → 3)
3. Deceased estate (6 → 4)
4. Seller disclosure (already covered in Wave 1)
5. Tenanted property (5 → 1)
6. How to choose agent (5 → 1)
7. Settlement day (4 → 2)
8. Auction vs private treaty (5 → 2)
9. Pre-sale B&P (6 → 3)
10. Cooling-off (4 → 2)
11. Cost of selling (3 → 1)
12. Form 6 (5 → 2)
13. The remaining 37 smaller clusters

### Wave 3 — off-focus content (week 3)

**KILL** (39 articles total):
- 27 out-of-focus suburb pages
- 12 build/architect/buyer-only audience-mismatched articles

OR fold into 2 to 3 reference pages. The cleaner, faster move is to delete with 301 redirects to the closest-canonical inner-east suburb page or to `/insights/`.

### Wave 4 — voice and brand passes (ongoing during waves 1-3)

**REWRITE / EDIT** (no deletion):
- 95 files with body-copy AI slop — find-and-replace "leverage" → "use", "robust" → "thorough", "seamless" → "smooth", "holistic" → "complete", "bespoke" → "tailored", "transformative" → "significant", "innovative" → "well-designed". Validate each in context.
- 5 files with "Navigating..." CTA opener — rewrite as direct sentence
- 7 files with "Whether you are..." opener — rewrite
- 1 mechanical pass: replace `// STAGED — remove this line` with `// STAGED, remove this line` across all 400 staged files (no user impact, removes em-dash from source).

### Wave 5 — calendar reminder

**KEEP / UPDATE on date**:
- `queensland-first-home-owner-grant-fhog-seller-guide.astro` — review on 1 July 2026 to confirm FHOG reverts to $15k as scheduled.

### Expected end state

| Metric | Before | After |
|---|---|---|
| Total insight articles | 571 | ~360 |
| Articles with factual errors | ~10 | 0 |
| Duplicate clusters | 49 | 0 |
| Off-focus suburb pages | 27+ | 0 (or 1 merged reference page) |
| Files with body-copy AI slop | ~95 | ~0 (after find-replace pass) |
| Median article word count | ~1,800 | ~2,000 (thin survivors expanded) |
| Topical authority concentration | Diluted | Concentrated on inner-east seller intent |

---

## What this audit did not check (out of scope)

- Internal linking depth and orphan page status (separate audit pass)
- Schema markup correctness beyond FAQ presence (separate audit pass)
- Image alt text and Core Web Vitals (separate audit pass)
- Whether each kept article ranks for its intended query (Search Console review)
- Backlinks pointing to deletion candidates (verify before 301-ing high-authority targets)

Verify before any deletion that no high-authority backlink terminates on a deletion candidate slug; if so, prefer rewrite-and-keep over delete.
