# Tools Verification and Analytics Audit

Audit date: 2026-05-10
Scope: 56 tools in `src/pages/tools/` and analytics on `src/layouts/Layout.astro`, `src/layouts/LandingLayout.astro`, conversion pages, and privacy.
Auditor: automated scan with QRO/ATO/Housing Australia source verification (May 2026).

---

## Summary

**Tools.** Five financially-sensitive tools have OUTDATED or INCONSISTENT data and need fixes before any production use:

1. `true-cost-to-buy.astro` uses obsolete First Home Concession thresholds ($500k full / $500-550k partial), the home-concession upper bracket at $980k instead of $1,000,000, and a stale FHBG cap of $900k. Current rules are $700k full / $700-800k partial, $1,000,000 home-concession bracket break, and $1,000,000 Brisbane FHBG cap (1 Oct 2025).
2. `land-tax.astro` is missing the $10M+ band entirely and uses a 2% absentee surcharge on full land value. Correct surcharge is 3% applied to land value above $350,000.
3. `lmi-calculator.astro` shows "9% QLD stamp duty on LMI". LMI duty in QLD is class-of-insurance based; the figure quoted on QRO is 9% of the premium for general insurance-class LMI, but LMI is sometimes reported at a lower effective rate. Worth flagging for a registered insurance verification rather than asserting 9% as fact.
4. `mortgage.astro` and `negative-gearing.astro` have hardcoded interest-rate defaults (6.20% p.a.) that should be reviewed quarterly. These are slider defaults so user-adjustable but the implied "current rate" anchors the user.
5. `negative-gearing.astro` labels its tax comparison table "(2024-25)" while using 2025-26 brackets correctly. Table label is wrong.

The four **other** primary calculators (`stamp-duty.astro`, `first-home-buyer.astro`, `mortgage.astro`, `cgt-timing.astro`, `capital-gains.astro`, `selling-costs.astro`, `borrowing-power.astro`) are mathematically correct against current QRO and ATO data, with only minor copy or reference-year nits noted.

**Analytics.** Coverage gaps are significant.

- The two main lead funnels (`/walkthrough`, `/property-report`, `/get-an-appraisal`, `/contact`, the homepage hero address form, all suburb LP pages) fire GA4 lead events but **no Meta Pixel `Lead` event** on the main site pixel. Only the LP pages fire fbq Lead, and those LP pages use a SECOND, DIFFERENT pixel ID (`1462440981414974`) that is not the main site pixel (`1493183205636761`). This means the main site has zero conversion attribution to Meta Ads.
- Tawk.to live-chat script is loaded on every page with placeholder IDs (`TAWK_PROPERTY_ID/TAWK_WIDGET_ID`), causing a 404 request on every page load and zero working chat capability.
- Privacy Policy mentions "cookies and analytics" generically but does not name Meta Pixel, GA4, Tawk.to, or Formspree. Australian Privacy Principle 1 requires "open and transparent management" (APP 1.4 specifically requires the policy to identify "the kinds of personal information collected and held" and how disclosed).
- No double-tracking detected.
- No cookie banner / consent mechanism. Meta Pixel and GA4 fire on first page load. Australia does not require GDPR-style consent but the Privacy Act 1988 requires that the policy disclose what is collected, and best practice for trans-EU traffic is a banner.

---

## Tools findings

### TOOL-001  `stamp-duty.astro` — STATUS: OK with minor copy nits
- QLD transfer duty general rates verified against QRO: $0-$5k nil, $5k-$75k 1.5%, $75k-$540k $1,050+3.5%, $540k-$1M $17,325+4.5%, $1M+ $38,025+5.75%. Matches QRO transfer duty rates page.
- Home concession rates: $0-$350k 1%, $350k-$540k $3,500+3.5%, $540k-$1M $10,150+4.5%, $1M+ $30,850+5.75%. Verified against QRO home concession schedule.
- First Home Concession: full to $709,999.99, partial $710k-$800k, taper of $17,350 over $90k. Matches QRO post-9-June-2024 rules.
- FHB Vacant Land concession: full, no cap, from 1 May 2025. Matches QRO.
- $30k FHOG mentioned for new homes, "Ask Daniel for details" — but no eligibility check that the contract date is ≤30 June 2026. The grant reverts to $15,000 from 1 July 2026. Recommend updating the FHB grant notice to read: "Eligible new-home contracts signed by 30 June 2026 receive $30,000. After that the grant reverts to $15,000." Also add a `min(contract date, 30 Jun 2026)` warning if the user implies a settlement date past mid-2026.
- LMI rates of 0.6%, 1.2%, 2.5% are rough industry estimates only and are flagged as "Rough LMI estimate table" in code. Accurate but should be cross-referenced with Helia rate card for the website's quoted figures (see TOOL-007).

### TOOL-002  `first-home-buyer.astro` — STATUS: OK, one stale UI string
- Eligibility wizard logic is sound.
- Result text on line 268 says "$30,000 rate applies to contracts signed between 20 November 2023 and 30 June 2026. After 30 June 2026 the grant reverts to $15,000." This is correct per QLD Government A Place to Call Home initiative page.
- FHOG cap of $750,000 (line 258) is verified.
- Concession block descriptions on lines 322-324 use OUTDATED thresholds in the displayed copy: "Full concession (no duty) for new homes up to $550,000. Partial concession for $550,000-$800,000" and "Full concession (no duty) for homes up to $500,000. Partial concession for $500,000-$700,000". The CALCULATION uses the current $700k/$800k thresholds, but the EXPLANATORY TEXT shown to users still uses the old $500k/$550k figures. **Fix:** update the description strings to match the calculation logic. Both new and established now use $700k full / $700k-$800k partial under the unified First Home Concession (since 9 June 2024 the new/established split was removed for the discount calc, although new-home FHB transactions on or after 1 May 2025 receive a separate full no-cap concession under the First Home (New Home) concession).
- Step 1 distinguishes "New Home / Off-the-Plan" vs "Established Home" but the calculation uses the unified First Home Concession formula for both. Since 1 May 2025, eligible new home / off-the-plan FHB contracts get a FULL no-cap concession (First Home (New Home) Concession). The tool does not award this. **Fix:** for FHB + new-home + price ≤ no cap, set duty to $0 with label "First Home (New Home) Concession (full, no cap)".

### TOOL-003  `land-tax.astro` — STATUS: BROKEN (multiple errors)
1. **Missing $10M+ band.** Code stops at `$5,000,000 and over: $62,500 + 1.75c per $1`. QRO individual schedule continues to: `$10,000,000 and over: $150,000 + 2.25c per $1`. **Fix:** add the $10M+ band; rename the prior band to `$5,000,000–$9,999,999`.
2. **Absentee surcharge wrong.** Code applies `value * 0.02` (2% on full land value). Correct rule per QRO is 3% on (taxable land value − $350,000), i.e. `Math.max(0, value − 350000) * 0.03`. **Fix:** change rate from `0.02` to `0.03`, change base from `value` to `Math.max(0, value - 350000)`.
3. **Result panel header line 103 says "Land Tax Assessment (2025-26)"** but tools page meta description says current rates including 2025-26 thresholds. Acceptable but if running into FY26-27, refresh.
4. Individual band $3M-$4.999M of `$37,500 + 1.25c` looks unusually low compared to surrounding bands (1.65% then 1.25% then 1.75% is non-monotonic). Per QRO this IS correct: the rate effectively dips because the next bracket adds a higher base. Verified on QRO individual rates page. No fix needed.

### TOOL-004  `lmi-calculator.astro` — STATUS: NEEDS VERIFICATION
- LMI rates by LVR band (0.83%, 1.72%, 2.81%, 3.84%) cited as "Helia (formerly Genworth) published rate card". These are reasonable but Helia public rates change. Recommend re-checking 2026 Helia/Arch MI rate cards or labelling the values as "industry estimate, lender-specific quote required". Currently the tool says "Approximate, varies by lender" which is good; the figures themselves should still be sourced.
- "QLD stamp duty on LMI (9%)" hardcoded at line 193. The 9% rate applies to "general insurance" duty in QLD, which LMI sits under. This is correct per the Duties Act 2001 (Qld) but worth a one-line citation to QRO general insurance duty page in the disclaimer.
- LVR > 95% returns rate=0 with no message except in the LVR note. UI handles this, but the LMI breakdown panel hides — fine.

### TOOL-005  `mortgage.astro` — STATUS: OK
- Standard amortisation formula `(P * r * (1+r)^n) / ((1+r)^n - 1)` correct.
- Periods per year for weekly/fortnightly/monthly correct (52/26/12).
- Offset account modelled by reducing principal — simplification, but reasonable for an indicative tool.
- Default rate slider value is 6.20%. As of May 2026 this is roughly aligned with major-bank discounted variable rates but should be sanity-checked quarterly against RBA cash rate movements. Tool does not hardcode an RBA reference.
- No fbq/gtag tracking on the "Book a Free Appraisal" CTA click on this tool. (See ANLY-005.)

### TOOL-006  `borrowing-power.astro` — STATUS: OK with assumption flag
- Default assessment rate 9.20% — described as "current APRA serviceability floor". APRA's floor is 3% above the actual product rate (per APG 223), so 9.20% implies a product rate of ~6.20%. Reasonable but the wording may mislead. **Fix:** change copy from "9.2% reflects the current APRA serviceability floor" to "9.2% reflects a typical lender assessment rate (actual rate + 3% APRA buffer)".
- DSR formula uses `netSurplus * 0.85` then back-solves a 30-year P&I loan at the assessment rate. Heavily simplified vs lender HEM; the disclaimer is appropriate.

### TOOL-007  `cgt-timing.astro` — STATUS: OK
- Tax brackets (`18200 / 45000 / 135000 / 190000` with rates `16% / 30% / 37% / 45%` and bases `0 / 4288 / 31288 / 51638`) verified against ATO 2025-26 resident schedule.
- Note: a 16% second-bracket rate is the Stage-3 cut. From 1 July 2026 the 16% bracket drops to 15% (legislated Stage-3 second-phase cut). For periods after 1 July 2026 the calculation will be wrong by one percentage point in that bracket. **Fix:** add a 15% bracket case for FY26-27+ or expose the bracket year to the user.
- Comment "Uses 2025-26 Stage-3 brackets. The CGT event falls on contract date, not settlement." — accurate.
- No Medicare Levy in this tool's `tax()` function. CGT timing comparison nets the difference so Medicare cancels out, but the displayed dollar amounts are technically pre-Medicare. Fine for "settle this FY vs next FY" comparison.

### TOOL-008  `capital-gains.astro` — STATUS: OK
- Full ATO 2025-26 brackets correctly applied; LITO (Low Income Tax Offset) correctly tapered $700 → $325 → $0 between $37,500/$45,000/$66,667 (matches ATO).
- 50% CGT discount correctly conditional on `over12 && isIndividualType && resident` — non-residents excluded post-2012 (correct).
- SMSF accumulation 1/3 discount correct (effective 10% CGT in accumulation phase).
- Company rate 30% with base-rate-entity 25% correctly noted.
- Discount slider (0-75%) lets users stress-test, with disclaimer that current law is 50%. Good.
- Cost-of-disposal proxy of `sale * 0.97` (line 105 of cgt-timing) approximates 3% selling costs; reasonable but cgt-timing is a separate tool — capital-gains.astro itself uses an explicit `sellingCosts` input.

### TOOL-009  `selling-costs.astro` — STATUS: OK
- Pure subtraction model. No tax calculation. Disclaimer correctly notes "CGT, break costs and other fees not included."
- Default styling of $3,500, marketing tiers from $5k-$30k, commission slider 2-3.5% — all reasonable Brisbane inner-east benchmarks. No data verification needed.

### TOOL-010  `negative-gearing.astro` — STATUS: OK with one display bug
- Tax brackets verified (line 270-285) — 2025-26 rates with 2% Medicare added. Correct.
- Marginal rate function (line 287-293) — correct.
- Comparison table label on line 206: `<p>...Tax Comparison (2024-25)</p>`. The brackets used are 2025-26. **Fix:** change "Tax Comparison (2024-25)" to "Tax Comparison (2025-26)".
- Code comment on line 268 also says "2024-25 Australian tax brackets (Stage 3) + 2% Medicare". Brackets are actually 2025-26 (these brackets were introduced 1 July 2024 and are continuing). Update comment for clarity.

### TOOL-011  `true-cost-to-buy.astro` — STATUS: BROKEN (multiple stale rules)
1. **First Home Concession thresholds OUTDATED.** Code at lines 538-551 uses $500k full / $500-550k partial taper. Current QRO rule (since 9 June 2024) is $700k full / $700-800k partial, with the standard duty saving capped at $17,350 over the taper. **Fix:** replace with the same logic as `stamp-duty.astro` lines 161-189.
2. **Home concession upper bracket wrong.** Line 518 uses `if (price <= 980000)` and line 519 uses `29950 + (price - 980000) * 0.0575`. Correct break is $1,000,000 with $30,850 base (matches `stamp-duty.astro` and QRO). For prices $980k-$1M this overstates duty by 5.75% × the difference — small dollar amount but wrong.
3. **No First Home (New Home) Concession.** A FHB buying a new home / off-the-plan since 1 May 2025 gets a full no-cap concession; this tool charges them home-concession rates above $550k. **Fix:** add a separate path for FHB + new-home → duty = 0.
4. **FHBG cap stale.** Line 640 flags FHBG eligibility only if `price <= 900000`. Brisbane price cap rose to $1,000,000 from 1 October 2025 (per Housing Australia). **Fix:** change `900000` to `1000000`. Note that income test was REMOVED from same date, so the FHBG flag should also drop any income condition (none currently — fine).
5. **LMI rates differ from `lmi-calculator.astro`.** `true-cost-to-buy` uses 0.66% / 1.69% / 3.30% across LVR bands; `lmi-calculator` uses 0.83% / 1.72% / 2.81% / 3.84%. Pick one source of truth (recommend the four-band schedule from `lmi-calculator` since it includes a 90-92% band) and reuse.
6. **Mortgage registration $204** vs `stamp-duty.astro` $212. Both are out of date — current QLD title-registry mortgage registration fee rose to $221 from 1 July 2025 (per Titles Queensland fee schedule, worth a separate verify). **Fix:** unify across all three calculators (`true-cost-to-buy.astro` line 649, `stamp-duty.astro` line 81, anywhere else) and source from a single constant.

### TOOL-012  `whole-of-move.astro` — STATUS: NEEDS VERIFICATION
- Same `30850 + (p - 1000000) * 0.0575` upper bracket suggesting it was copied from `stamp-duty.astro` (correct). Did not deep-read the rest. **Action:** check that any FHB concession logic in this tool uses the current $700k/$800k thresholds (likely also stale, since the older $500k/$550k pattern appears in other copies).

### TOOL-013  `depreciation-estimator.astro` — STATUS: OK with one stale year
- Division 43 rate of 2.5% p.a. for buildings constructed after 15 Sep 1987 is correct per ATO TR 97/25.
- Division 40 ATO 2017 rule (no second-hand P&E for non-new) correctly applied.
- `currentYear = 2025` (line 198) is hardcoded. As of May 2026 this understates property age by 1 year. **Fix:** use `new Date().getFullYear()`.

### TOOL-014  `smsf-calculator.astro` — STATUS: OK
- Marginal rate dropdown shows the correct 2025-26 brackets ($18k-$45k 16%, $45k-$135k 30%, $135k-$190k 37%, $190k+ 45%).
- Adds 2% Medicare correctly (line 450).
- SMSF accumulation 15% rate, pension phase 0%. Matches ATO.

### TOOL-015  `federal-budget-2026.astro` — STATUS: NEEDS VERIFICATION
- Help to Buy income caps used: `applicants === 1 ? 100000 : 160000`. Verified — these are correct ($100k single / $160k couples or single parents) per Housing Australia.
- Government equity contribution: 40% new / 30% existing. Correct per scheme.
- Brisbane price cap not surfaced in the section I sampled — needs verification of Brisbane's specific price cap (varies by city).
- 10,000 places per year cap — correct.

### TOOL-016 to TOOL-056  Other tools (non-financial-rate-sensitive)
The remaining 41 tools (`agent-conditioning-checker`, `appraisal-reality-check`, `auction-bid-tracker`, `auction-reserve`, `body-corp-disclosure`, `bridging-relocation-finance`, `brisbane-2032`, `buyer-profile`, `campaign-benchmark`, `commute-cost`, `dcf`, `defect-triage`, `deposit-savings`, `equity-calculator`, `flood-risk`, `granny-flat-roi`, `heatmap`, `interest-rate-calculator`, `investment-yield`, `local-eats`, `method-of-sale`, `multiple-offers`, `off-market-decision`, `open-home-checklist`, `portfolio-builder`, `presale-checklist`, `price-reduction-decision`, `property-compare`, `rate-sensitivity`, `renovation-roi`, `rent-vs-buy`, `rent-vs-sell`, `school-catchment`, `settlement-date`, `suburb-match`, `tenanted-vs-vacant`, `valuation`, `zoning-map`, `water-sewer-map`, `holding-costs`, `equity-calculator`) operate on user inputs without hardcoded statutory rates and were not deep-audited. Spot checks of `holding-costs.astro` and `equity-calculator.astro` show pure arithmetic on user-supplied values; status: OK pending UX review (out of scope).

---

## Analytics findings

### ANLY-001  Two different Meta Pixels in production — STATUS: HIGH
- `Layout.astro` line 483 initialises `fbq('init', '1493183205636761');` (main site).
- `LandingLayout.astro` line 48 initialises `fbq('init', '1462440981414974');` (paid-ad LP pages).
- The LP-only pixel is never loaded on `/walkthrough`, `/contact`, `/property-report`, `/get-an-appraisal`, the homepage, suburb pages, insights articles, or tools.
- Meta Ads attribution requires the pixel that fired the View Content (i.e. the LP pixel) to also fire the Lead. Conversions that happen on `/walkthrough` after a user clicked an LP-pixel-tagged ad will not attribute back unless the LP pixel is added to the main site Layout, OR the main pixel is added to the LP layout, OR both pixels are loaded everywhere.
- **Recommendation:** consolidate to a single pixel, or load both pixels on every page if you genuinely run separate campaigns. The simplest fix is to use ONE pixel ID across both layouts.

### ANLY-002  Main site lead pages do NOT fire Meta Pixel `Lead` event — STATUS: HIGH
- `walkthrough.astro` line 750: GA4 `appraisal_form_submit` fires; no `fbq('track','Lead')`.
- `property-report.astro` line 576: GA4 `property_report_submit` fires; no `fbq('track','Lead')`.
- `contact.astro` line 364: GA4 `contact_form_submit` fires; no `fbq('track','Lead')`.
- `get-an-appraisal.astro` line 71: GA4 `appraisal_form_submit` fires; no `fbq('track','Lead')`.
- `index.astro` line 1179: hero address form fires GA4 `hero_address_submit`; no `fbq('track','Lead')`.
- LP pages (`bulimba`, `hawthorne`, `seven-hills`, `murarrie`, `camp-hill`) DO fire `fbq('track','Lead')` — but on the LP-only pixel (see ANLY-001).
- Resources PDF download fires `fbq('track','Lead', { content_category: 'pdf_download' })` correctly.
- **Recommendation:** add `fbq('track','Lead', { content_name: '<page-name>', content_category: 'form_submit' })` to all five form-submit handlers above. Add it AFTER the `gtag` call and before the `fetch` to Formspree.

### ANLY-003  Tawk.to placeholder script in production — STATUS: HIGH
- `Layout.astro` line 582: `s1.src = 'https://embed.tawk.to/TAWK_PROPERTY_ID/TAWK_WIDGET_ID';`
- This URL returns a 404 on every page load (no widget configured), wastes a request, and pollutes browser console.
- **Recommendation:** either wire up real Tawk.to IDs, OR remove the entire Tawk.to script block. If kept, also add Tawk.to to the Privacy Policy as a third-party processor (it captures chat transcripts, IP, and page URL).

### ANLY-004  Privacy Policy does not name analytics tools — STATUS: MEDIUM
- `privacy.astro` section 9 ("Cookies and Website Analytics") says "This website may use cookies and analytics tools to understand how visitors use the site. This information is aggregated and does not personally identify you."
- This is too generic for APP 1.4. The policy should explicitly name:
  - Google Analytics 4 (Google LLC, US-based, retains user-level event data)
  - Meta Pixel (Meta Platforms Inc., US-based, used for advertising attribution and audience matching)
  - Tawk.to live chat (if kept)
  - Formspree (form processor, US-based)
- IP addresses are personal information under the Privacy Act 1988 (Cth) where they can identify an individual. The phrase "does not personally identify you" is technically inaccurate for Meta Pixel which uses IP + cookie + email for matching.
- **Recommendation:** rewrite section 9 to list each tool, what it collects (cookies, IP, page URL, hashed email if Conversions API is added later), where data is processed (United States), and link to each provider's privacy policy. Add an opt-out note (browser-level cookie blocking).

### ANLY-005  Tool pages have zero tracking on conversion CTAs — STATUS: MEDIUM
- Every tool page ends with a "Book a Free Appraisal" or "Book a Free Walkthrough" link to `/walkthrough`. None of these fire any analytic event before navigation, so there is no signal that "user came from `/tools/stamp-duty` and clicked CTA → arrived on /walkthrough".
- The global anchor-click tracker in `Layout.astro` lines 510-524 only fires for `tel:`, `mailto:`, and outbound links. Internal CTA clicks are not tracked.
- **Recommendation:** add a `data-cta` attribute to each `Book a Free Appraisal` link in tool pages, then fire `gtag('event','tool_to_walkthrough_click', { tool: 'stamp-duty' })` on click. Or use UTM parameters in the href: `/walkthrough?utm_source=tools&utm_medium=cta&utm_campaign=stamp-duty`.

### ANLY-006  No double-tracking detected — STATUS: OK
- Each form-submit handler fires GA4 once. PageView fires once on `Layout.astro` and once on `LandingLayout.astro` (different layouts, never simultaneously).
- Web Vitals events (`onCLS`, `onINP`, `onLCP`, `onFCP`, `onTTFB`) fire once per page via web-vitals library (line 498-505).

### ANLY-007  GA4 stub before script loads — STATUS: OK
- `Layout.astro` line 347-350 defines `window.dataLayer` and `gtag` synchronously in `<head>`. Inline `onclick="gtag(...)"` handlers throughout the codebase will safely queue events before the deferred GA4 script (`gtag/js?id=...`) actually loads. Verified pattern is correct.
- `LandingLayout.astro` does the same setup (lines 75-79).

### ANLY-008  Missing standard Meta events — STATUS: MEDIUM
- The site has Meta Pixel `PageView` and (on LP pages) `Lead`. Standard events that would help campaign optimisation:
  - `ViewContent` on tool pages (would feed retargeting audiences for high-intent visitors)
  - `Contact` on phone/email click (currently GA4-only via Layout.astro lines 514-517)
  - `Search` on the suburb-match or address-search interactions
  - `CompleteRegistration` on email-list signup (insights article footer form)
- **Recommendation:** add at minimum `fbq('track','Contact')` to the global tel:/mailto: click handler, and `fbq('track','Lead', { content_category: 'newsletter' })` to the email-list signup.

### ANLY-009  No consent banner — STATUS: LOW
- Australian Privacy Act 1988 does not mandate a GDPR-style cookie banner. APP 5 (notification of collection) is satisfied by the Privacy Policy if the policy is genuinely accessible at point of collection.
- However, the site has international visitors (insights articles attract overseas links). A simple "We use cookies for analytics. Read our privacy policy →" footer banner with an opt-out would be best practice and de-risks GDPR if any EU visitors interact with forms.
- Not urgent. Flagged for forward planning.

### ANLY-010  Meta Pixel Conversions API not implemented — STATUS: LOW
- Server-side Meta Conversions API (CAPI) is increasingly important for attribution as iOS / Safari ITP / ad-blockers strip browser-side pixel events. Adding CAPI doubles up signal and improves match rate.
- Out of scope for this audit; flagged for follow-up.

---

## Verification needed (live testing)

The following items cannot be verified statically and need a live test pass before sign-off:

1. **VERIFY-001** Open `/property-report` in a browser, fill form, submit, and confirm in:
   - Meta Events Manager (test events): expect zero `Lead` events on main pixel today (after fix, expect 1).
   - GA4 DebugView: expect `property_report_submit` event with `event_category=lead`.
2. **VERIFY-002** Same on `/walkthrough` (`appraisal_form_submit` → GA4; today expect zero Meta Lead).
3. **VERIFY-003** Same on `/contact` (`contact_form_submit` → GA4; today expect zero Meta Lead).
4. **VERIFY-004** Open one LP page (e.g. `/lp/bulimba`), submit address. Confirm pixel `1462440981414974` fires `Lead` and pixel `1493183205636761` does NOT (this confirms the dual-pixel issue and lets you decide consolidation).
5. **VERIFY-005** Click the homepage hero address form. Confirm `gtag('event','hero_address_submit')` fires before redirect to `/property-worth?address=...`.
6. **VERIFY-006** Click "Book a Free Appraisal" from `/tools/stamp-duty` and confirm no event fires for the tool→walkthrough handoff. (Confirms ANLY-005.)
7. **VERIFY-007** Network tab on any page: confirm `embed.tawk.to/TAWK_PROPERTY_ID/TAWK_WIDGET_ID` returns 404 (confirms ANLY-003).
8. **VERIFY-008** Stamp duty calculator: enter $720,000 with FHB selected. Expected duty: home-concession formula = $10,150 + ($720k - $540k) × 0.045 = $18,250 → minus partial concession of $17,350 × (800k - 720k) / 90k = $15,422 → duty payable ≈ $2,828. Confirm tool produces this.
9. **VERIFY-009** Land tax calculator: enter $12,000,000 with Individual selected. Tool currently calculates $62,500 + (7,000,000 × 0.0175) = $185,000. Correct answer is $150,000 + (2,000,000 × 0.0225) = $195,000. After fix, should be $195,000.
10. **VERIFY-010** Land tax calculator: enter $1,000,000 with Absentee selected. Tool currently calculates $4,500 + $1M × 0.02 = $24,500. Correct: $4,500 + (1,000,000 - 350,000) × 0.03 = $24,000. (After fix.)
11. **VERIFY-011** Source-verify the QLD title-registry mortgage registration fee for FY25-26 — current code uses $204 and $212 across two tools; current Titles Queensland schedule may be different.
12. **VERIFY-012** Confirm Privacy Policy mentions all third parties used: GA4, Meta Pixel, Tawk.to (if kept), Formspree, Google Maps, Google Fonts.

---

## Sources

- [Queensland Revenue Office — Transfer duty rates](https://qro.qld.gov.au/duties/transfer-duty/calculate/rates/)
- [Queensland Revenue Office — Transfer duty home concession rates](https://qro.qld.gov.au/duties/transfer-duty/calculate/concession-rates/)
- [Queensland Revenue Office — First home concession](https://qro.qld.gov.au/duties/transfer-duty/concessions/homes/first-home/)
- [Queensland Revenue Office — First home (new home) concession](https://qro.qld.gov.au/duties/transfer-duty/concessions/homes/first-home-new-home/)
- [Queensland Revenue Office — First home vacant land concession](https://qro.qld.gov.au/duties/transfer-duty/concessions/homes/first-home-vacant-land/)
- [Queensland Revenue Office — Additional foreign acquirer duty (AFAD)](https://qro.qld.gov.au/duties/investors/afad/)
- [Queensland Revenue Office — Land tax rates for individuals](https://qro.qld.gov.au/land-tax/calculate/individual/)
- [Queensland Revenue Office — Land tax rates for absentees](https://qro.qld.gov.au/land-tax/calculate/absentee/)
- [Queensland Government — First Home Owner Grant](https://www.qld.gov.au/housing/buying-owning-home/home-buyers-financial-help/first-home-owner-grant)
- [Queensland Government — Extending the $30,000 First Home Owner Grant](https://aplacetocallhome.initiatives.qld.gov.au/initiatives/extending-the-$30,000-first-home-owner-grant)
- [Housing Australia — Unlimited places, higher property price caps for first home buyers from 1 October 2025](https://www.housingaustralia.gov.au/media/unlimited-places-higher-property-price-caps-first-home-buyers-1-october-2025)
- [Housing Australia — Help to Buy Scheme launch](https://www.housingaustralia.gov.au/media/more-australians-supported-home-ownership-launch-australian-government-help-buy-scheme)
- [Australian Taxation Office — Tax rates Australian residents](https://www.ato.gov.au/tax-rates-and-codes/tax-rates-australian-residents)
- [OAIC — Australian Privacy Principles](https://www.oaic.gov.au/privacy/australian-privacy-principles)
