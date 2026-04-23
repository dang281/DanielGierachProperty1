# 01. Article Accuracy Audit

**Audit date:** 2026-04-23
**Scope reviewed in detail:** ~15 high-risk articles across tax, grants, rates, legislation, and major infrastructure claims. Remainder flagged as "not individually reviewed" (see end of file).
**Out of scope:** Suburb-profile subjective copy that cannot be fact-checked (e.g. "quiet streets and a strong sense of community").

Every issue below records: the exact quote, the file path, the live URL, why it is wrong, the correct current information with source and date, and a suggested rewrite.

---

## A. Transfer duty (stamp duty)

### A1. Wrong year for first home concession changes

**Quote:** "Following changes that took effect from 9 June 2023, eligible first home buyers pay no transfer duty at all on properties valued up to $800,000."
**File:** `src/pages/insights/stamp-duty-queensland.astro`
**Live URL:** `https://danielgierach.com/insights/stamp-duty-queensland/`
**Why it is wrong:** The uplift to the current first home concession took effect **9 June 2024**, not 2023. The statement also misstates the threshold (see A2).
**Correct information:** The current Queensland First Home Concession schedule for existing homes applies to contracts signed on or after **9 June 2024**.
**Source:** Queensland Revenue Office, "Home concession rates", last updated 30 April 2025. [qro.qld.gov.au/duties/transfer-duty/calculate/concession-rates/](https://qro.qld.gov.au/duties/transfer-duty/calculate/concession-rates/)
**Suggested rewrite:** "Under changes that took effect on 9 June 2024, eligible first home buyers of existing homes pay no transfer duty at all on properties valued up to $709,999. Between $710,000 and $800,000 the concession tapers, and above $800,000 the standard home-concession rate applies."

---

### A2. Wrong first-home concession thresholds

**Quote:** "Eligible first home buyers pay no transfer duty at all on properties valued up to $800,000. The concession phases out progressively between $800,000 and $1,000,000, and above $1,000,000 the standard rate applies in full."
**File:** `src/pages/insights/stamp-duty-queensland.astro`
**Live URL:** `https://danielgierach.com/insights/stamp-duty-queensland/`
**Why it is wrong:** Both ends of the taper are wrong.
- Full concession (nil duty) applies up to **$709,999**, not $800,000.
- The taper runs **$710,000 to $799,999**, not $800,000 to $1,000,000.
- Above **$800,000**, no first home concession applies. The home concession (a separate concession for owner-occupiers) applies instead.

**Correct information:** From QRO: at $709,999.99 or less, the first home concession is $17,350 off. Between $710,000 and $799,999.99 the concession tapers from $15,615 down. At $800,000+, nil first home concession.
**Source:** Queensland Revenue Office, "Home concession rates", last updated 30 April 2025.
**Suggested rewrite:** "The first home concession for existing homes fully exempts eligible buyers from transfer duty up to $709,999. Between $710,000 and $799,999 the concession tapers. At $800,000 and above, the first home concession is nil, and the general home concession (for owner-occupiers) applies."

---

### A3. Wrong first-home vacant land concession

**Quote:** "A separate First Home Vacant Land Concession applies to purchases of vacant land intended for the construction of a first home, with the concession applying on land valued up to $400,000."
**File:** `src/pages/insights/stamp-duty-queensland.astro`
**Live URL:** `https://danielgierach.com/insights/stamp-duty-queensland/`
**Why it is wrong:** From 1 May 2025, the First Home Vacant Land Concession has **no cap** on land value. A full transfer duty concession is available for eligible first-home vacant land buyers regardless of land value.
**Source:** Queensland Revenue Office, "Home concession rates", last updated 30 April 2025. [qro.qld.gov.au/duties/transfer-duty/calculate/concession-rates/](https://qro.qld.gov.au/duties/transfer-duty/calculate/concession-rates/)
**Suggested rewrite:** "From 1 May 2025, the First Home Vacant Land Concession provides a full transfer duty concession for eligible first-home buyers of residential vacant land, with no cap on the land value. The eligibility conditions mirror those for the existing-home concession."

---

### A4. Incorrect duty figures at $1.5M and $2M

**Quote:** "$1,500,000 purchase → approx. $60,525" and "$2,000,000 purchase → approx. $85,025"
**File:** `src/pages/insights/stamp-duty-queensland.astro`
**Live URL:** `https://danielgierach.com/insights/stamp-duty-queensland/`
**Why it is wrong:** The figures appear to apply the $540k-$1M bracket rate ($4.50 per $100) across the entire portion above $540k. The correct standard rate above $1M is $5.75 per $100.
**Correct figures:**
- $1,500,000: $38,025 + (500,000 ÷ 100 × $5.75) = **$66,775**
- $2,000,000: $38,025 + (1,000,000 ÷ 100 × $5.75) = **$95,525**
**Source:** Queensland Revenue Office, "Transfer duty rates" (standard), last updated 12 March 2026. [qro.qld.gov.au/property-concessions-rebates/transfer-duty/rates/](https://qro.qld.gov.au/property-concessions-rebates/transfer-duty/rates/)
**Suggested rewrite:** Replace both lines with the corrected figures above. The other figures ($500k ≈ $15,925; $750k ≈ $26,775; $1M ≈ $38,025) should also be recalculated for consistency (the $750k figure is currently stated as $27,675 but should be $26,775).

---

### A5. Same concession-threshold error repeated

**Quote (FHOG seller guide):** "Queensland's transfer duty (stamp duty) concession for first home buyers of established homes applies to properties with a dutiable value up to $700,000. Below this threshold, eligible first home buyers pay reduced or no transfer duty. Above $700,000, the full transfer duty rate applies and no concession is available."
**File:** `src/pages/insights/queensland-first-home-owner-grant-fhog-seller-guide.astro`
**Live URL:** `https://danielgierach.com/insights/queensland-first-home-owner-grant-fhog-seller-guide/`
**Why it is wrong:** Threshold is **$709,999 / $800,000**, not $700,000. See A2.
**Suggested rewrite:** "Queensland's first home concession fully exempts eligible first home buyers from transfer duty on existing homes up to $709,999, tapers between $710,000 and $799,999, and is nil at $800,000 and above. At $800,000 and above, the general home concession may still apply for owner-occupiers."

---

### A6. Same wrong threshold in seller-cost article

**Quote:** "First home buyers may qualify for a full exemption on properties up to $800,000 or a partial concession up to $1,000,000."
**File:** `src/pages/insights/does-seller-pay-stamp-duty-transfer-duty-brisbane.astro`
**Live URL:** `https://danielgierach.com/insights/does-seller-pay-stamp-duty-transfer-duty-brisbane/`
**Why it is wrong:** Same threshold errors as A2. Full exemption is up to $709,999, taper ends at $800,000.
**Suggested rewrite:** See A2/A5.

---

### A7. $1.5M duty figure wrong in seller-cost article

**Quote:** "On a $1.5 million sale, that figure rises to approximately $62,525."
**File:** `src/pages/insights/does-seller-pay-stamp-duty-transfer-duty-brisbane.astro`
**Live URL:** `https://danielgierach.com/insights/does-seller-pay-stamp-duty-transfer-duty-brisbane/`
**Why it is wrong:** Correct standard-buyer duty at $1.5M is **$66,775** (see A4 working). The article's $62,525 does not reconcile to the QRO rate schedule.
**Suggested rewrite:** "On a $1.5 million sale, transfer duty for a standard buyer is approximately $66,775."

---

## B. First Home Guarantee (federal)

### B1. Scheme has changed fundamentally since 1 Oct 2025

**Quote:** "Places in the scheme are limited and are allocated on a first-in-first-served basis across approved lenders."
**File:** `src/pages/insights/first-home-guarantee-property-sale-brisbane-seller.astro`
**Live URL:** `https://danielgierach.com/insights/first-home-guarantee-property-sale-brisbane-seller/`
**Why it is wrong:** From **1 October 2025**, the Australian Government removed the cap on places (previously 35,000 per year) and removed scheme income caps. Buyers no longer compete for a limited allocation.
**Source:** Ensure Legal, "First Homebuyer Guarantee Scheme Expanded From 1 October 2025", 2025. [ensurelegal.com.au](https://ensurelegal.com.au/first-homebuyer-guarantee-scheme-relaunching-1-january-2026-legal-insights-for-buyers/)
**Suggested rewrite:** "From 1 October 2025 the scheme was materially expanded. The cap on the number of places has been removed, income caps have been removed, and price caps have been increased. Buyers no longer compete for a limited allocation, though lender conditions and eligibility criteria still apply."

---

### B2. Price caps badly outdated

**Quote:** "For Brisbane at various points in the scheme's history, the caps have ranged from around $500,000 to $700,000 depending on the iteration of the scheme."
**File:** `src/pages/insights/first-home-guarantee-property-sale-brisbane-seller.astro`
**Live URL:** `https://danielgierach.com/insights/first-home-guarantee-property-sale-brisbane-seller/`
**Why it is wrong:** As of 1 October 2025, the Brisbane price cap is **$1,000,000** (Brisbane capital city and regional QLD). The article's "$500,000 to $700,000" is several cycles out of date and materially understates the pool of qualifying properties.
**Source:** Housing Australia, 2025-26 price caps. Confirmed by Tora Finance, "First Home Buyer Guarantee 2026: $1M Brisbane Income Cap", 2026. [torafinance.com.au](https://torafinance.com.au/first-home-buyer-guarantee-2026/)
**Suggested rewrite:** "The current Brisbane price cap for the First Home Guarantee is $1,000,000 (from 1 October 2025), covering both Brisbane capital city and regional Queensland. Many inner-east units, townhouses, and outer-ring houses fall inside the cap that would have been excluded under earlier iterations of the scheme."

---

### B3. "Scheme largely irrelevant" claim now reads wrong

**Quote:** "A substantial proportion of homes in suburbs such as Camp Hill, Morningside, Hawthorne, Bulimba, and Norman Park are priced above the scheme's threshold, particularly for houses. This means the First Home Guarantee is more likely to be relevant for unit and townhouse sales..."
**File:** `src/pages/insights/first-home-guarantee-property-sale-brisbane-seller.astro`
**Live URL:** `https://danielgierach.com/insights/first-home-guarantee-property-sale-brisbane-seller/`
**Why it is wrong:** Under the old $600k-$700k cap this was correct. Under the current $1M cap, many entry-level houses in Morningside, Cannon Hill, Murarrie, and Carina fall inside the cap. The article's buyer-pool reasoning therefore overstates how "largely irrelevant" the scheme is to inner-east house campaigns.
**Suggested rewrite:** "At the current $1,000,000 Brisbane cap, the scheme is relevant to entry-level houses in Murarrie, Cannon Hill, Seven Hills, Coorparoo and Carina, plus most units and townhouses across the inner east. For prestige houses above $1M it is still not a factor."

---

## C. First Home Owner Grant (Queensland)

### C1. FHOG current amount and sunset date not stated

**Quote:** "The grant amount and any applicable value cap are set by the Queensland government and are periodically reviewed. ... Buyers and sellers should check the current grant amount and value cap on the Queensland Revenue Office website, as these figures can change."
**File:** `src/pages/insights/queensland-first-home-owner-grant-fhog-seller-guide.astro`
**Live URL:** `https://danielgierach.com/insights/queensland-first-home-owner-grant-fhog-seller-guide/`
**Why it is a gap:** The article is deliberately vague about the dollar amount. A current, time-specific version is more useful and accurate.
**Correct information:** FHOG is **$30,000** for eligible new-home transactions with contracts signed between **20 November 2023 and 30 June 2026**. After 30 June 2026 it reverts to $15,000. Maximum property value (including land) is $750,000.
**Source:** Queensland Government, "Extending the $30,000 first home owner grant." Confirmed by Stanford Financial, W&G Lawyers, Edwards & Smith (all accessed 2026). [qld.gov.au](https://aplacetocallhome.initiatives.qld.gov.au/initiatives/extending-the-$30,000-first-home-owner-grant)
**Suggested rewrite:** "The Queensland FHOG is currently $30,000 for eligible first-home buyers of new homes on contracts signed between 20 November 2023 and 30 June 2026. After 30 June 2026 it reverts to $15,000. The maximum eligible property value (including land) is $750,000. Check the Queensland Revenue Office site before assuming eligibility because these figures are reviewed periodically."

---

## D. Brisbane 2032 Olympics (major inaccuracy)

### D1. Wrong primary stadium throughout the article

**Quote:** "The centre of Brisbane's 2032 Olympic story is the Gabba stadium precinct in Woolloongabba. The Gabba is the primary Olympic stadium..."
**File:** `src/pages/insights/brisbane-2032-olympics-property-values-inner-east.astro`
**Live URL:** `https://danielgierach.com/insights/brisbane-2032-olympics-property-values-inner-east/`
**Why it is wrong:** The Gabba stadium redevelopment was abandoned. On 5 January 2026, the Queensland Government confirmed a new **$3.8 billion, 63,000-seat Olympic stadium at Victoria Park** (adjacent to Herston, Kelvin Grove and Fortitude Valley) as the primary Olympic stadium. Victoria Park will host the opening and closing ceremonies and athletics. The Gabba is no longer the main Olympic venue. Construction at Victoria Park is scheduled to commence from **1 June 2026**, with completion targeted for **2031**.
**Sources:**
- Brisbane Development, "Work set to commence on Brisbane's 63,000-seat Olympic Stadium", 2026. [brisbanedevelopment.com.au](https://brisbanedevelopment.com.au/work-set-to-commence-on-brisbanes-63000-seat-olympic-stadium/)
- CNN, "Plans for $2.3 billion stadium ignite debate in 2032 Olympics host city", 7 January 2026. [cnn.com](https://www.cnn.com/2026/01/07/style/australia-brisbane-olympic-stadium-victoria-park-hnk-intl)
- Queensland Government, "The 2032 Delivery Plan — Venues." [delivering2032.com.au](https://www.delivering2032.com.au/legacy-for-queensland/venues)

**Suggested rewrite — whole-article level:** This is a structural rewrite, not a line edit. The venues thesis, the "most exposed suburb" claim, the property-market argument, and the Woolloongabba-centric framing all need to be rebuilt around Victoria Park.

A corrected structure:
- Primary stadium: Victoria Park (63,000 seats, $3.8bn, construction Jun 2026 – 2031).
- Most exposed residential suburbs: **Herston, Kelvin Grove, Fortitude Valley, Bowen Hills, Spring Hill**. Note Herston and Fortitude Valley are not in Daniel's core inner-east catchment, so be honest about that.
- Secondary venues: Woolloongabba retains the Cross River Rail station and Knowledge, Innovation, Science and Health (KISH) precinct; the Gabba will continue as a major Brisbane venue but is no longer the main Olympic one.
- Inner-east corridor: Olympic-linked infrastructure spillover (transport, precinct upgrades) matters for Norman Park, Cannon Hill, Morningside, etc., but not because any of those suburbs sit next to the main stadium.

Until rewritten, the article is materially misleading and should not be promoted.

---

## E. Interest rates

### E1. "Rates have stabilised" is wrong as of Q2 2026

**Quote:** "The interest rate environment has stabilised relative to the sharp increases of 2022-23."
**File:** `src/pages/insights/brisbane-inner-east-market-update-q2-2026.astro`
**Live URL:** `https://danielgierach.com/insights/brisbane-inner-east-market-update-q2-2026/`
**Why it is wrong:** The RBA cash rate moved from **3.60% (Dec 2025) → 3.85% (4 Feb 2026) → 4.10% (18 Mar 2026)**. Two consecutive rises in the quarter the article is titled after. "Stabilised" is not accurate.
**Source:** Reserve Bank of Australia, "Cash Rate Target", accessed 23 April 2026. [rba.gov.au/statistics/cash-rate/](https://www.rba.gov.au/statistics/cash-rate/)
**Suggested rewrite:** "The RBA cash rate rose twice in Q1 2026, from 3.60% in December 2025 to 4.10% by mid-March 2026. This has tightened buyer borrowing capacity in the $800,000–$1.2m range in particular, and is showing up in longer finance-condition periods and slightly thinner first-round offer activity."

### E2. Rate articles lack a current anchor

**Quote:** Both `rba-interest-rates-effect-brisbane-property-sellers.astro` and `interest-rates-brisbane-property-prices-sellers.astro` discuss rate mechanics hypothetically ("when rates fall", "if a buyer could borrow $1.1m at 3% and $950k at 4.5%") without stating the current cash rate.
**Why it is a gap:** An article published on a dated site is expected to ground abstract commentary in current conditions. Readers who know the current rate is 4.10% will notice. Readers who do not may assume the hypothetical rates are current.
**Suggested rewrite:** Add a 1–2 sentence current-conditions note to each article, e.g. "As at April 2026 the RBA cash rate is 4.10%, following rises of 0.25 percentage points in February and March 2026." This is a small addition that gives the analysis anchoring and can be updated quarterly.

---

## F. Smoke alarms

### F1. Form 24 labelled incorrectly

**Quote:** "You are required to include smoke alarm compliance information in the Form 24 (Transfer of Land document). Your solicitor includes this as part of the settlement documentation."
**File:** `src/pages/insights/smoke-alarm-compliance-selling-queensland-property.astro`
**Live URL:** `https://danielgierach.com/insights/smoke-alarm-compliance-selling-queensland-property/`
**Why it is wrong:** Form 24 in Queensland is the **Property Information (Transfer)** form, not a "Transfer of Land document". (The Transfer is Form 1.) The smoke alarm declaration is made by the seller to the buyer via the **Property Information form (Form 24) Part B**.
**Source:** Queensland Fire Department, "Smoke alarms"; SMR Law, "Selling a house in QLD" (both published and maintained current).
**Suggested rewrite:** "When selling, the seller makes a smoke alarm declaration on the Form 24 Property Information (Transfer) form, which the buyer lodges with Titles Queensland at settlement. The solicitor arranges this as part of the settlement documentation."

### F2. Certificate claim too broad elsewhere

**Quote:** "Queensland requires sellers to provide a pool safety certificate if the property has a swimming pool. A smoke alarm compliance certificate is also required."
**File:** `src/pages/insights/does-seller-pay-stamp-duty-transfer-duty-brisbane.astro`
**Live URL:** `https://danielgierach.com/insights/does-seller-pay-stamp-duty-transfer-duty-brisbane/`
**Why it is wrong:** A smoke alarm compliance certificate is **not legally required** for wireless 10-year sealed-battery photoelectric alarms, which is what most homes are upgraded to. A Certificate of Testing and Compliance is required for hardwired 240V systems under AS 3786:2014. The seller's legal obligation is the Form 24 declaration, not a universal "compliance certificate".
**Source:** Queensland Fire Department, accessed April 2026.
**Suggested rewrite:** "Queensland requires sellers to install interconnected photoelectric smoke alarms that comply with AS 3786:2014 in every bedroom, in hallways connecting bedrooms, and on each level. Compliance is declared on the Form 24. A Certificate of Testing and Compliance is required specifically for hardwired 240V systems; wireless 10-year sealed-battery alarms do not require a certificate."

---

## G. Terminology

### G1. "Office of State Revenue" is the old name

**Quote:** Multiple uses of "Queensland Office of State Revenue" throughout the land tax article.
**File:** `src/pages/insights/land-tax-selling-queensland.astro` (and likely others not individually reviewed)
**Live URL:** `https://danielgierach.com/insights/land-tax-selling-queensland/`
**Why it is wrong:** The body was rebranded to **Queensland Revenue Office (QRO)** in 2020. The article uses an outdated name multiple times.
**Source:** QRO website, [qro.qld.gov.au](https://qro.qld.gov.au/)
**Suggested rewrite:** Replace every instance of "Queensland Office of State Revenue" and "Office of State Revenue" with "Queensland Revenue Office (QRO)". Also run a repo-wide find-replace across insights: `grep -rn "Office of State Revenue" src/pages/insights/ | wc -l` will surface the rest.

### G2. "CrossRiver Rail" misspelling

**Quote:** Multiple uses of "CrossRiver Rail" as one word.
**File:** `src/pages/insights/crossriver-rail-property-values-brisbane-inner-east.astro`, `src/pages/insights/brisbane-2032-olympics-property-values-inner-east.astro`
**Why it is wrong:** The official brand is **"Cross River Rail"** with a space. URL filename `crossriver-rail-...` is fine; body text should match the brand.
**Source:** [crossriverrail.qld.gov.au](https://crossriverrail.qld.gov.au/)
**Suggested rewrite:** Find-replace `CrossRiver Rail` → `Cross River Rail` across the insights folder.

---

## H. Cross River Rail

### H1. No explicit opening date in article

**Quote:** No specific opening date given in the article body.
**File:** `src/pages/insights/crossriver-rail-property-values-brisbane-inner-east.astro`
**Why it is a gap (not wrong):** A long-form article on Cross River Rail's effect on property values should state the expected opening date, because buyer pricing behaviour is anchored to that timeline. The current official timeline is **first passenger services by 2029** (this was confirmed following the December 2024 announcement of a 3-year delay and cost blowout to about $17bn).
**Source:** Cross River Rail Delivery Authority project FAQ, accessed April 2026. [crossriverrail.qld.gov.au/about/project-overview/](https://crossriverrail.qld.gov.au/about/project-overview/)
**Suggested rewrite:** Add a paragraph near the top: "First passenger services are expected by 2029, following the three-year schedule revision announced in December 2024. The four new underground stations (Boggo Road, Woolloongabba, Albert Street, Roma Street) are complete or substantially complete; the remaining work is tunnel fit-out, systems integration, and rolling-stock delivery."

---

## I. Pool safety

The pool-safety article `pool-safety-certificate-selling-queensland-property.astro` is substantively accurate. Building Act 1975 reference is correct. Building Regulation 2021 is correct. Certificate validity periods (2 years non-shared, 1 year shared) are correct. Form 36 / Form 23 descriptions are correct. **90-day post-settlement obligation on the buyer** is correctly described.

One minor note: inspection cost range of **$150 to $300** is plausible for Brisbane but could be updated against actual 2026 quotes from a local QBCC-licensed inspector to be precise.

---

## J. Claims I could not verify

The following claims appear in articles and could not be verified against a public source within the audit window. They are not necessarily wrong, but they should be either cited, rewritten as clearly observational ("In my campaigns..."), or removed.

- "Median prices for family homes regularly sit above $1.5 million" (inner east Brisbane). File: `interest-rates-brisbane-property-prices-sellers.astro`. Needs CoreLogic or Domain suburb-level source or rephrase as "median for freestanding character houses in premium pockets".
- "A 12-month wait costs roughly $60,000 to $80,000 in holding costs on a $1.5 million property." File: `interest-rates-brisbane-property-prices-sellers.astro`. The 4-5% annual holding cost assumption is plausible but would benefit from itemisation.
- "Carina homes typically sell in 28 to 40 days." File: `insights/selling-in-carina.astro`. Plausible but unsourced. Could be cited from CoreLogic or stated as "Ray White Bulimba office data."
- "5-Star Client Reviews" statistic in homepage hero. Only 2 reviews appear in schema. Either keep as a qualitative marker or embed a live RateMyAgent / Google count.

---

## K. Not individually reviewed in this pass

416 insights files exist. This audit reviewed ~15 of the highest-risk articles (tax, grants, rates, legislation, major infrastructure). The following categories are **not individually reviewed** and may contain similar errors:

1. The other ~35 insight articles on commission, contracts, auction strategy, disclosure, body corporate, tenant rights, CGT-related topics, and legal/process pieces.
2. The 39 `selling-in-{suburb}` guides (buyer profile and suburb-character claims).
3. The 39 `/suburbs/{slug}` profile pages (suburb-character claims).
4. The 33 calculator tools (Task 3 covers these separately).

**Expected issue rate:** Given the dense error concentration in the articles sampled (stamp duty article alone has 4 distinct factual errors), I estimate a further **30 to 60** accuracy issues exist across unreviewed articles. A full sweep should be scheduled.

---

## Summary count

| Category | Issues flagged |
|---|---|
| Transfer duty (stamp duty) | 7 |
| First Home Guarantee | 3 |
| FHOG gap | 1 |
| 2032 Olympics (stadium) | 1 (but structural) |
| Interest rates | 2 |
| Smoke alarms | 2 |
| Terminology | 2 |
| Cross River Rail | 1 |
| Unverifiable claims | 4 |
| **Total discrete issues** | **23** |

The single highest-priority fix is **D1 (Olympics stadium)** because the article is materially misleading and the correction is easy to verify. The second highest-priority fix is the **stamp duty thresholds** cluster (A1, A2, A3, A5, A6) because the same wrong thresholds appear in three places, and the error is specific and will be noticed by any seller who has spoken to their broker.
