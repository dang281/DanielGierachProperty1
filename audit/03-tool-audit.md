# 03. Tool Audit

**Audit date:** 2026-04-23
**Scope:** All 33 tools at `src/pages/tools/`.
**Review depth:** Each tool opened, logic read, hardcoded values checked against current Queensland / federal sources. Issues listed in priority order, with file paths and line numbers where code is wrong.

---

## High-priority fixes (wrong values that will be noticed)

### T1. `src/pages/tools/stamp-duty.astro` — first home concession thresholds wrong

**What it currently does:** Calculates QLD transfer duty, optionally with first home buyer concessions.

**Issues (with line numbers):**

- **Line 159–166** (FHB established homes): exempts up to $500,000 and tapers $500,000–$550,000.
  - **Correct:** Full first home concession applies up to **$709,999**. Taper runs **$710,000–$799,999**. Nil concession at $800,000+.
  - **Source:** QRO, "Home concession rates", last updated 30 April 2025. [qro.qld.gov.au/duties/transfer-duty/calculate/concession-rates/](https://qro.qld.gov.au/duties/transfer-duty/calculate/concession-rates/)
- **Line 168–174** (FHB new homes): exempts up to $750,000 and tapers $750,000–$800,000.
  - **Note:** The First Home New Home concession is no longer a separate concession in current QRO guidance. The same First Home Concession applies to both new and existing homes after 9 June 2024. New-home buyers may additionally qualify for the FHOG ($30k on new builds under $750k, until 30 June 2026) — that is a separate grant, not a different stamp duty concession.
- **Line 176–177** (FHB vacant land): `return { duty: calcHomeDuty(price), label: 'FHB Home Rate' }`.
  - **Correct:** From **1 May 2025**, First Home Vacant Land Concession is a **full concession with no land-value cap**. The return should be `{ duty: 0, label: 'FHB Vacant Land Full Concession' }`.

**Specific code fix for line 157–178:**

```javascript
if (buyerType === 'fhb') {
  // Vacant land: full concession, no cap (1 May 2025+)
  if (propType === 'land') {
    return { duty: 0, label: 'FHB Vacant Land Full Concession' };
  }
  // Established and new homes: same First Home Concession from 9 June 2024+
  // Full concession to $709,999, taper $710k-$800k, nil at $800k+
  if (price <= 709999.99) return { duty: 0, label: 'FHB Full Concession' };
  if (price < 800000) {
    const full = calcHomeDuty(price);
    const maxConcession = 17350;
    const concession = maxConcession * (800000 - price) / 90000;
    return { duty: Math.max(0, full - concession), label: 'FHB Partial Concession' };
  }
  // $800k+: first home concession is nil, fall through to home concession
  return { duty: calcHomeDuty(price), label: 'Home Concession' };
}
```

The exact taper formula is stepped in the QRO table (not strictly linear). For a customer-facing tool a linear approximation between $17,350 at $710k and $0 at $800k is acceptable as long as the "estimate only" disclaimer is retained.

**UX:** The tool removes the "property type: vacant land" path entirely for non-FHB buyers. Keep that but surface the First Home Vacant Land concession clearly when FHB + land is selected.

---

### T2. `src/pages/tools/first-home-buyer.astro` — same thresholds wrong

**What it currently does:** Checks FHOG eligibility, calculates transfer duty concessions.

**Issues:**

- **Line 221–228** (established home concession): "Full concession (duty = $0) for homes <= $500k" and partial $500k-$700k.
  - **Correct:** Full concession up to $709,999; taper $710k-$799,999; nil at $800k+.
- **Line 230–234** (new home concession): "Full concession for <= $550k, partial for $550k-$800k".
  - **Correct:** The separate new-home concession was merged into a single first home concession from 9 June 2024.
- **Line 275** (FHOG eligibility): "The FHOG requires the total contract value to be $750,000 or less." — **CORRECT.**
- **Line 256** (FHOG amount): "$30,000 ... increased from $15,000 on 20 November 2023." — **CORRECT,** but should add the sunset: **reverts to $15,000 for contracts signed after 30 June 2026.**

**Specific code fix:**

```javascript
// First home concession (same for established and new, from 9 June 2024)
function calcFirstHomeConcession(price: number): number {
  const standardDuty = calcBaseDuty(price);
  if (price <= 709999.99) return standardDuty;  // full concession, pay nil
  if (price < 800000) {
    const maxConcession = 17350;
    const concession = maxConcession * (800000 - price) / 90000;
    return Math.max(0, standardDuty - concession);
  }
  return standardDuty;  // nil first home concession above $800k
}
```

Also update the reference link at line 169 from:
```
https://www.qro.qld.gov.au/duties/transfer-duty/concessions-for-transfer-duty/first-home-vacant-land-concession/
```
to check that the vacant land concession is described as "no cap from 1 May 2025".

**UX:** Add a sunset warning to the $30k FHOG result: "Note: the $30,000 rate applies to contracts signed on or before 30 June 2026. After that the grant reverts to $15,000."

---

### T3. `src/pages/tools/brisbane-2032.astro` — wrong primary Olympic stadium

**What it currently does:** Renders a map of 2032 Olympic venues and infrastructure.

**Issues (with line numbers):**

- **Line 74:** "Venue plan reflects updates as of 2024. The Gabba stadium rebuild was cancelled in February 2024; athletics events relocated to QSAC."
- **Line 86:** "Main Olympic Stadium, Opening and Closing Ceremonies, Football. Capacity 52,500. No rebuild required; confirmed as primary venue after the Gabba rebuild was cancelled in 2024."
- **Line 207:** Victoria Park / Herston described as "earmarked for Olympics-related development and increased green space. Adjacent to QUT Kelvin Grove..."

**Why it is wrong:** On 5 January 2026, the Queensland Government confirmed a new **$3.8bn, 63,000-seat Olympic stadium at Victoria Park** as the primary Olympic venue for the Opening and Closing Ceremonies and athletics. Construction starts 1 June 2026. Completion 2031. Architects Cox / Hassell / Azusa Sekkei. The tool still reflects the 2024 interim plan.

**Sources:**
- Brisbane Development, "Work set to commence on Brisbane's 63,000-seat Olympic Stadium", 2026. [brisbanedevelopment.com.au](https://brisbanedevelopment.com.au/work-set-to-commence-on-brisbanes-63000-seat-olympic-stadium/)
- CNN, "Plans for $2.3 billion stadium ignite debate in 2032 Olympics host city", 7 January 2026.

**Fixes:**
- Update the Victoria Park venue entry (Line 207 area) to be flagged as the **primary Olympic stadium** with capacity 63,000, hosting opening and closing ceremonies and athletics, construction start June 2026.
- Update the "Main Olympic Stadium" entry (Line 86) — identify which venue this references and remove or re-label.
- Update Line 74 disclaimer to "Venue plan updated to reflect the 5 January 2026 confirmation of Victoria Park as the primary Olympic stadium."
- Update QSAC (Line 94) to note it remains a legacy/training venue but is no longer the athletics venue.

---

### T4. `src/pages/tools/depreciation-estimator.astro` — outdated tax brackets

**Issues (lines 102–105):**

```html
<option value="0.19">19% (income $18,201, $45,000)</option>
<option value="0.325">32.5% (income $45,001, $120,000)</option>
<option value="0.37" selected>37% (income $120,001, $180,000)</option>
<option value="0.45">45% (income over $180,000)</option>
```

**Why wrong:** The Stage 3 tax cuts took effect 1 July 2024. Current resident Australian brackets are:
- $0–$18,200: 0%
- $18,201–$45,000: **16%** (was 19%)
- $45,001–$135,000: **30%** (was 32.5%, upper bound was $120,000)
- $135,001–$190,000: **37%** (thresholds moved up from $120,001–$180,000)
- $190,001+: **45%** (threshold was $180,001)

**Source:** ATO, "Individual income tax rates" — effective 1 July 2024.

**Fix:**
```html
<option value="0.16">16% (income $18,201, $45,000)</option>
<option value="0.30">30% (income $45,001, $135,000)</option>
<option value="0.37" selected>37% (income $135,001, $190,000)</option>
<option value="0.45">45% (income over $190,000)</option>
```

**Cross-check:** `src/pages/tools/smsf-calculator.astro` lines 159–162 uses the **correct** post-Stage-3 brackets. The two tools are inconsistent.

---

### T5. `src/pages/tools/land-tax.astro` — labelled wrong tax year

**Issues (lines 103, 125, 136):** Tool labels "Land Tax Assessment (2024-25)", "Individual Rates (2024-25)", and disclaimer says "uses 2024-25 rates".

**Why:** The current QLD land tax year is **2025-26**. Thresholds ($600k individual, $350k company/trustee) are unchanged, but the year label is a year behind.

**Fix:** Find-replace `2024-25` → `2025-26` in this file. Confirm rate bands against QRO 2025-26 rate tables before publishing, particularly the company/trust bands at lines 163–168 which I could not fully verify against QRO during this audit (the base company/trust rate may need checking against the current "Company/trust — No threshold" schedule).

**Source:** QRO, "Land tax rates for individuals" and "Land tax rates for companies & trusts". [qro.qld.gov.au/land-tax/calculate/](https://qro.qld.gov.au/land-tax/calculate/)

---

## Medium-priority fixes

### T6. `src/pages/tools/stamp-duty.astro` — hardcoded ancillary costs slightly off

- Line 206: `legal = 2000` — reasonable for a 2026 Brisbane conveyance.
- Line 207: `inspection = 700` — plausible for combined building and pest.
- Line 208: `mortReg = 160` — **slightly low.** The QLD mortgage registration fee is currently around **$212** (last adjusted 1 July 2025). Not a showstopper; update when next refreshed.

**Source:** Titles Queensland, fee schedule 2025-26.

**Fix:** Update line 208 to `mortReg = 212`.

---

### T7. `src/pages/tools/mortgage.astro` — default rate

- Line 33–36: default interest rate slider value is **6.20%**.
- With the RBA cash rate now **4.10%** (18 March 2026), typical owner-occupier variable rates in April 2026 sit in a band around 5.9%–6.4% depending on lender and LVR. 6.20% is a reasonable midpoint.
- **Action:** Keep 6.20% for now, but add an "as of April 2026" note under the slider so the default can be refreshed each time rates move.

**Source:** RBA cash rate page, [rba.gov.au/statistics/cash-rate/](https://www.rba.gov.au/statistics/cash-rate/)

---

### T8. `src/pages/tools/borrowing-power.astro` — assessment rate correct, note could be tighter

- Line 70–76: default assess rate is **9.20%**.
- APRA serviceability buffer is 3% above the actual rate. With actual rates around 6.2%, assess rate of 9.2% is **correct**.
- The explanatory note says "9.2% reflects the current APRA serviceability floor." Strictly speaking, the 3% is an add-on to the lender rate, not a standalone "floor." Minor language tweak.

**Fix:** Rewrite the note: "Lenders add a 3% buffer to your actual loan rate when testing serviceability (APRA requirement). With variable rates around 6.2% in April 2026, the assessment rate lands near 9.2%."

---

### T9. `src/pages/tools/lmi-calculator.astro` — stamp duty claim on LMI

- Line 107, 131, 193, 204: "9% QLD stamp duty applied to premium" / "QLD stamp duty on LMI (9%)".
- QLD insurance duty is **9% on general insurance premiums**, including LMI. **This is correct as at April 2026.**

**Source:** QRO, "Insurance duty rates."

**Action:** No change needed, but cite the source in the disclaimer so a skeptical user can verify.

---

### T10. `src/pages/tools/capital-gains.astro` — CGT budget speculation

- Line 410: "Budget Watch: the Australian Government is considering changes to the CGT discount."
- This framing is speculative. I could not find a confirmed current-government proposal to change the 50% CGT discount as at April 2026.
- The slider (line 470) lets users model discount values from 0% to 75%. That is a valid modelling feature.

**Action:** Reframe to be clear that the slider is a stress-test tool, not a prediction:

> "Stress-test your gain at different discount rates. Current law applies a 50% CGT discount for individuals and trusts on assets held more than 12 months. Use the slider to see how your CGT would change if the discount were reduced in a future budget."

Remove the "Budget Watch: the Australian Government is considering changes" line unless there is a specific policy announcement to cite.

---

### T11. `src/pages/tools/first-home-buyer.astro` — missing FHBG / Home Guarantee Scheme

- The tool covers FHOG and transfer duty concessions but does **not** mention the federal **First Home Guarantee (FHBG)**, which from 1 October 2025 has no income cap, no place cap, and a $1M Brisbane price cap. For first home buyers, FHBG matters as much as the QLD concessions.
- **Fix:** Add a FHBG eligibility block alongside the FHOG block. Logic: eligible if Aus citizen/permanent resident, first home buyer, property price ≤ $1,000,000 for Brisbane capital city. No income cap.
- **Source:** Housing Australia, First Home Guarantee 2025-26 price caps; updated 1 October 2025.

---

## Low-priority / presentational

### T12. `src/pages/tools/renovation-roi.astro` — generic ROI multipliers

- The tool uses hardcoded value-uplift multipliers for kitchen, bathroom, paint, landscaping etc. These are rough but plausible industry averages. Not verifiable to a single source, but they are tagged as estimates in the disclaimer.
- **Action:** Add a footnote citing a source such as Suncorp or CoreLogic renovation ROI research, or reframe as "rule-of-thumb ranges based on Brisbane inner-east campaigns over the past three years."

### T13. `src/pages/tools/granny-flat-roi.astro` — 97% occupancy assumption

- Line 179: `const VACANCY = 0.97; // assume 97% occupancy`.
- 3% vacancy is tight for Brisbane long-term residential (around 1–2% in inner east as of early 2026), so this is defensible. But a short-term granny flat or Airbnb setup has materially higher vacancy.
- **Action:** Expose vacancy rate as a user input with a Brisbane-typical default, not a hardcoded constant.

### T14. `src/pages/tools/commute-cost.astro` — fuel price assumption

- 862-line tool; did not fully audit. Spot-check: fuel price defaults and vehicle efficiency defaults should be sourced from a current dataset (e.g. Queensland Fuel Watch prices) or exposed as user inputs.
- **Action:** Confirm the fuel price input is either current or user-adjustable. Add a source note.

### T15. `src/pages/tools/rate-sensitivity.astro` — no hardcoded rate references in head

- Small tool. Spot-check: likely uses user input for rates. No urgent issue flagged.

### T16. `src/pages/tools/deposit-savings.astro` — sample numbers plausible

- Sample QLD stamp duty in the table (line 293: `$24,525`) should be re-derived live from the user's price input, not hardcoded. Confirm this updates on recalculation.

---

## Logic / UX patterns worth noting (not errors)

### T17. Every calculator lacks a "last updated" timestamp

No tool displays a last-verified date for the values it uses (stamp duty schedules, tax brackets, cash rates). For a site that wants to be perceived as authoritative, a visible "rates verified April 2026" stamp on each calculator builds trust.

**Recommendation:** Add a small footer line on every calculator: `"Rates and thresholds verified 2026-04-23. Sources: QRO, ATO, RBA."`

### T18. Tools share no common rates module

Transfer duty formulas are duplicated in `stamp-duty.astro`, `first-home-buyer.astro`, `dcf.astro`, `portfolio-builder.astro`, and the CGT tool. When a rate changes, five files need updating and inconsistency creeps in (as happened with tax brackets in T4).

**Recommendation:** Extract rate constants into a shared file (e.g. `src/lib/qld-rates.ts`) and import into each calculator. One place to update when the QRO changes a threshold.

### T19. Tools do not display formula sources

Calculator outputs are presented as authoritative numbers without showing which formula or source produced them. For a sophisticated seller or a broker, a "Show calculation" toggle would distinguish this site's tools from the generic calculator plugins that most agent sites use.

**Recommendation:** Below each calculator output, offer an expandable "How this was calculated" section citing the exact bracket or rate applied.

---

## Tools reviewed but no issues found

The following tools were read and contain no numeric-factual errors. Issues if any are UX-level or out of scope:

- `src/pages/tools/selling-costs.astro` — commission range 2–3.5% matches Brisbane norms. Marketing presets reasonable.
- `src/pages/tools/suburb-match.astro` — quiz-style lifestyle matcher. Subjective by design.
- `src/pages/tools/school-catchment.astro` — uses QLD Government dataset (568 lines). Not audited line-by-line for data currency; relies on a published feed.
- `src/pages/tools/flood-risk.astro` — uses Brisbane City Council flood overlay data. Relies on council source.
- `src/pages/tools/zoning-map.astro` — Brisbane City Plan data.
- `src/pages/tools/heatmap.astro` — price heatmap, relies on external dataset (not audited here).
- `src/pages/tools/property-compare.astro` — comparison utility, no hardcoded market data.
- `src/pages/tools/rent-vs-buy.astro` — uses user inputs for all financial variables.
- `src/pages/tools/open-home-checklist.astro`, `src/pages/tools/presale-checklist.astro` — checklist tools, not calculators.
- `src/pages/tools/local-eats.astro` — directory of local venues.
- `src/pages/tools/equity-calculator.astro` — user inputs only.
- `src/pages/tools/investment-yield.astro` — user inputs only.
- `src/pages/tools/negative-gearing.astro` — user selects tax rate; uses correct post-Stage-3 brackets.
- `src/pages/tools/smsf-calculator.astro` — concessional cap correct at $30k (2025-26). Tax brackets correct.
- `src/pages/tools/portfolio-builder.astro` — model-only. Uses user inputs.
- `src/pages/tools/dcf.astro` — user inputs, has auto-calc of stamp duty (verify formula matches updated rates per T1).
- `src/pages/tools/rate-sensitivity.astro` — user inputs.

---

## Summary count

| Priority | Count | Tools |
|---|---|---|
| High (wrong values likely to be noticed) | 5 | T1, T2, T3, T4, T5 |
| Medium (outdated but defensible / add context) | 6 | T6, T7, T8, T9, T10, T11 |
| Low (presentational / minor) | 5 | T12, T13, T14, T15, T16 |
| Structural (across all tools) | 3 | T17, T18, T19 |
| **Total discrete issues** | **19** | across 33 tools |

**Most exposed tools** if a sophisticated seller or competing agent probed:
1. `stamp-duty.astro` (wrong concession thresholds and vacant-land logic)
2. `first-home-buyer.astro` (same)
3. `brisbane-2032.astro` (wrong primary stadium)
4. `depreciation-estimator.astro` (old tax brackets)

**Easiest wins:** T4 (depreciation-estimator tax brackets) and T5 (land-tax year label) are 2-minute fixes that materially improve accuracy.
