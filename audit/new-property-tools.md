# New Property Tools + Education Articles

**Design date:** 2026-04-23
**Scope:** 20 new tools (all 13-field design specs) plus 10 educational articles on builds, materials, property types, anatomy, professionals, and planning codes.
**Inventory baseline:** `/audit/existing-tools-inventory.md`
**Hard rules applied:**
- "When to List" swapped out. Replaced with a net-proceeds-focused seller cost tool.
- Bridging tool labelled "Bridging / Relocation Finance."
- Agent-Fee-Negotiation tool dropped.
- Articles must not compromise selling services or undermine Daniel's process.

---

## PART A — 20 new tools

Ordered by (seller usefulness × likely lead quality). Strongest first.

### Reasoning for the top three

**#1 Appraisal Reality Check** is the single moment in every sale where the seller feels most exposed. Three agents walk through, three different numbers. The seller needs a way to test which range is honest. Nothing else on the internet does this well. This tool is a magnet for sellers already in the appraisal phase, which is the highest-intent moment for booking a walkthrough.

**#2 Method-of-Sale Recommender** replaces the single most common vendor question ("should I auction or private treaty?") with an answer tied to their specific property. Agents treat this like a black box. A structured public tool changes the conversation.

**#3 Buyer Profile Predictor** is unique on the Australian market. Sellers think about their house. They rarely think about the person who will buy it. A tool that shows them the realistic buyer archetype for their property reframes preparation, pricing, and campaign decisions. It also demonstrates Daniel's specific inner-east buyer knowledge in a way no other tool does.

---

### 1. Net Proceeds Deep Dive

1. **Tool name:** Net Proceeds Deep Dive
2. **Question it answers:** "After all the costs, what actually lands in my bank account the day of settlement?"
3. **One-line description:** A line-by-line cost breakdown showing the real money you walk away with, including the costs most basic selling-cost calculators miss.
4. **Why it's more useful than what exists:** The existing `selling-costs.astro` does a base calculation (commission + marketing + legal). This tool layers in the hidden line items: remaining mortgage payout, break-cost on a fixed-rate loan, CGT where applicable, agent performance bonuses, styling and staging paid up front, campaign withdrawal exposure, pool safety certificate, smoke alarm upgrade, body corporate disclosure pack fees on units, trust-account interest clawback, and the pro-rata council rates adjustment at settlement.
5. **Why it's not a duplicate:**
   - Closest existing: `selling-costs.astro`.
   - Closest sibling in this list: Holding Costs While On Market (#5).
   - Distinct because: existing calculator is a generic estimate. This one goes line by line on items a sophisticated seller asks about, including loan break-cost and pro-rata rates, and produces a settlement-statement-style summary.
6. **Inputs:** Expected sale price, commission rate, marketing budget, loan balance, loan type (variable / fixed), fixed-rate remaining term if applicable, CGT flag (main residence / investment / part-rented), property type (house / unit), pool / no pool, existing smoke alarm compliance flag.
7. **Output:** A settlement-style statement with every line item. Total costs, total at-settlement adjustments, net proceeds, cents-in-the-dollar yield from the sale. Export to PDF.
8. **Logic and sources:**
   - Commission + GST standard formula.
   - Fixed-rate break-cost: use the simplified bank disclosure formula (remaining balance × rate differential × remaining term ÷ 2). Disclosure that this is an estimate and lender-specific.
   - CGT: reuse capital-gains calculator internals.
   - Rates pro-rata: use the QLD standard settlement adjustment formula (daily rate × days remaining in the billing period).
   - Source citations: QRO, QBCC, QLD Standard Settlement Adjustments (REIQ contract).
9. **Assumptions shown to user:** Fixed-rate break cost is flagged as estimate only. CGT inputs assume post-June 2024 Stage-3 brackets. Rates adjustment uses current BCC per-quarter average unless overridden.
10. **"Aha" moment:** Seeing that a sale they thought would net $1.1m actually nets $1.04m once the fixed-rate break cost and CGT are included. Most sellers have never seen this line-by-line.
11. **Natural path to appraisal:** "The biggest swing in this number is the sale price. A free walkthrough gives you an evidence-based launch price, not an estimate." Also: "If you are within a year of settling on the next property, the break-cost line should be discussed before you sign an agency authority. Daniel can introduce you to a broker who runs these scenarios."
12. **Build complexity:** Medium. Single Astro page, vanilla JS, re-uses stamp-duty formulas already in the codebase. Add PDF export via `html2pdf.js` CDN or server-side via a simple Vercel function.
13. **What could make it fail:** If the fixed-rate break-cost formula produces a number far from what lenders actually charge, credibility collapses. Mitigation: label as "indicative break-cost estimate — ask your lender for the precise figure" and cite the source of the simplified formula.

---

### 2. Appraisal Reality Check

1. **Tool name:** Appraisal Reality Check
2. **Question it answers:** "Three agents gave me three different numbers. Which range is honest and which one is just trying to win my listing?"
3. **One-line description:** Upload or type three agent appraisal ranges and get a structured check showing which is anchored to evidence, which looks inflated, and which looks low.
4. **Why it's more useful than what exists:** Nothing on the public internet does this. CoreLogic estimates are automated and generic. Domain and realestate.com.au show a range with no explanation. This tool forces each appraisal through the same evidence lens: comparable sales in the last 90 days, days on market for those comps, configuration match, position match. The output calls out which appraisal is inside the evidence band and which is outside.
5. **Why it's not a duplicate:**
   - Closest existing: `valuation.astro` (produces a value estimate, does not evaluate agent appraisals).
   - Closest sibling in this list: Agent-Conditioning Pattern Checker (#4).
   - Distinct because: this tool evaluates numbers from three agents, not a single property value. It compares each proposed range against comparable-sale evidence. The output is a three-column verdict, not a single number.
6. **Inputs:** Property address, beds, baths, cars, land size, approximate internal size, renovation level (unrenovated / partial / full), position (main road / quiet / elevated / flat / corner / mid-block). Three agent appraisal ranges. Optionally, which agency each appraisal came from.
7. **Output:** Three verdicts ("Anchored to recent evidence," "Above recent evidence — ask how it's justified," "Below recent evidence — ask why"), and a "most credible range" band that is the intersection of the evidence and the three appraisals. A list of 3–6 comparable sales that support the verdict.
8. **Logic and sources:**
   - Address-level geocoding, comp pull from office data or CoreLogic data feed.
   - Filter comps: ±20% on land size, ±1 on beds, same suburb or adjacent, sold in last 90 days.
   - Position matching from user-entered dropdowns.
   - Verdict rule: if appraisal range midpoint is more than ~8% above or below the comp median, flag accordingly.
9. **Assumptions shown:** Lists which comp feed was used (CoreLogic / PriceFinder / Ray White office) and the filter rules. Users can click "see the comps" to audit the logic.
10. **"Aha" moment:** Seeing the middle agent's "we can get $1.65m" range flagged as above-evidence with the specific comps that contradict it. Or seeing that the lowest appraisal is actually the one that matches the comps.
11. **Natural path to appraisal:** "Want a fourth data point? Daniel will walk through and give you a written appraisal that shows each comparable and the adjustment made for it." The tool positions the written-appraisal process as the next logical step, rather than a generic "book now" pitch.
12. **Build complexity:** High. Requires access to a comparable-sales feed. Could start with office-curated comp data for Daniel's 8 core suburbs.
13. **What could make it fail:** Thin or stale comp data produces unreliable verdicts. Mitigation: only offer the tool in the 8 core suburbs for launch, and show the number of comps used. If fewer than 3 comps, return "insufficient evidence — book a walkthrough" rather than a verdict.

---

### 3. Method-of-Sale Recommender

1. **Tool name:** Method-of-Sale Recommender
2. **Question it answers:** "Should I auction, go private treaty, or run an expressions-of-interest campaign?"
3. **One-line description:** A 6-question decision tool that recommends auction, private treaty, or EOI for your specific property and situation, with the reasoning made visible.
4. **Why it's more useful than what exists:** Almost every other resource treats this as an abstract article ("auction creates urgency, private treaty is steadier"). This tool applies the actual decision factors to your property: buyer depth in your price band, property uniqueness, your timeline, your risk tolerance, the current auction clearance rate in your suburb, and whether you need conditional or unconditional offers. It recommends a specific method and explains which factors drove it.
5. **Why it's not a duplicate:**
   - Closest existing: none.
   - Closest sibling in this list: Reserve-Setting Framework (#10).
   - Distinct because: that tool is for setting an auction reserve *after* auction is chosen. This tool is the one-step-earlier decision of whether to go to auction at all.
6. **Inputs:** Property type (house / unit / townhouse / land), suburb, indicative price, how unique the property is (1–5), seller timeline (need to settle by date), finance flexibility, need for unconditional offer (yes / unsure / no), risk tolerance (need certainty / comfortable with auction risk), market stage (rising / stable / softening).
7. **Output:** Recommended method (auction / private treaty / EOI), confidence (high / medium / low), top three reasons the recommendation was made, one reason the other methods were not chosen. Plus a campaign-length recommendation (3 / 4 / 5 weeks) and a launch-day suggestion (Tue / Wed / Thu).
8. **Logic and sources:**
   - Decision tree tuned to Brisbane inner-east patterns.
   - Suburb-level auction clearance rates from APM/CoreLogic.
   - Property-uniqueness threshold: 4+ → auction or EOI preferred.
   - Tight timeline + finance flexibility → auction.
   - Soft market + plain-vanilla property → private treaty.
9. **Assumptions shown:** The tool states "This recommendation is based on how campaigns in your suburb have performed in the last 12 months. The choice of method is one input to a successful campaign, not the whole story."
10. **"Aha" moment:** Seller expecting "auction everywhere" advice instead gets a private-treaty recommendation with clear reasoning about why a character home on a quiet mid-block street in Norman Park is better served by private treaty than auction.
11. **Natural path to appraisal:** "Your recommended method is X. A free walkthrough lets Daniel stress-test that recommendation against the specific quirks of your property and buyer pool in your street." Not generic "book now."
12. **Build complexity:** Medium. Decision tree in vanilla JS. Suburb clearance data as a static JSON file updated quarterly.
13. **What could make it fail:** The recommendation has to respect the property's specifics, not just average suburb behaviour. Mitigation: include the property-uniqueness question and weight it heavily, and include a clear "why we did not recommend the other methods" section so the user sees the logic, not just the output.

---

### 4. Buyer Profile Predictor

1. **Tool name:** Buyer Profile Predictor
2. **Question it answers:** "Who is actually going to buy my house, and how should I present it for them?"
3. **One-line description:** Input your property's type, position, and price band. The tool returns the realistic buyer archetype, where they are searching from, what they prioritise, and the three things they will care about most at an open home.
4. **Why it's more useful than what exists:** Most sellers fixate on their house. The buyer who actually transacts is a specific archetype with specific priorities. No other public tool describes the archetype for a specific property. Typical output might be "this property will most likely sell to a 35-to-45 family upgrading from a Coorparoo unit, searching since January, who will weigh the school catchment heaviest and the kitchen condition second."
5. **Why it's not a duplicate:**
   - Closest existing: `suburb-match.astro` (matches a buyer to a suburb based on lifestyle, goes in the opposite direction).
   - Closest sibling in this list: Tenanted vs Vacant Campaign Impact (#16).
   - Distinct because: this tool predicts the buyer archetype for *your* property and tells you how to present for them. Suburb-match predicts the suburb for a buyer.
6. **Inputs:** Property type, suburb, indicative price, beds, baths, block size, land or apartment, school catchment (auto-filled), position (quiet / main / elevated / flat), renovation level.
7. **Output:** One-paragraph archetype description. Three buyer priorities ranked. Three presentation implications. Expected origin suburbs (where similar buyers are upgrading from). Where they will be searching first.
8. **Logic and sources:** Rule-set built from Daniel's inner-east buyer experience. Example rule: price $900k–$1.1m, 3-bed house, Coorparoo catchment → archetype = "35-45 family upgrading from a unit." $1.6m+ elevated Balmoral → "downsizer from Hawthorne/Bulimba or interstate executive." Each rule has a justifying note visible on the output.
9. **Assumptions shown:** "This is a pattern-based prediction, not a guarantee. Real buyer pools include the expected archetype plus adjacent buyer types. The presentation advice optimises for the most likely buyer."
10. **"Aha" moment:** Realising the buyer for their Carina house is a family with primary-age kids who cares more about the school catchment than the kitchen they were about to spend $60k on.
11. **Natural path to appraisal:** "Your predicted buyer profile is X. Daniel will walk through with that buyer in mind and tell you specifically which preparation items will pay off and which will not." Ties directly into the Pre-Sale Defect Triage tool too.
12. **Build complexity:** Medium. Rule-set in JS. Needs about 20–30 well-defined archetype rules to cover the 8 core suburbs cleanly.
13. **What could make it fail:** If the archetypes are too generic, it reads like a horoscope. Mitigation: each archetype output must reference at least two specific Brisbane locations (origin suburb + search suburb) and a specific priority ranking, not abstract language.

---

### 5. Holding Costs While On Market Calculator

1. **Tool name:** Holding Costs While On Market Calculator
2. **Question it answers:** "Every extra week on market is costing me something. How much?"
3. **One-line description:** Shows the dollar cost of every week a property sits unsold, covering mortgage interest, rates, insurance, water, body corporate, and opportunity cost on capital.
4. **Why it's more useful than what exists:** No existing tool isolates this. Sellers hear "days on market" and don't translate it into dollars. This tool converts a stall into a number.
5. **Why it's not a duplicate:**
   - Closest existing: none.
   - Closest sibling in this list: Price-Reduction Decision Tool (#13).
   - Distinct because: Holding Costs outputs the running dollar cost of being on market. Price-Reduction decides whether to drop price. This one feeds the other.
6. **Inputs:** Property value, mortgage balance, interest rate, annual rates, annual insurance, body corporate levies (unit), water estimate, presentation / staging monthly cost (if furnished styling), alternative-investment rate (default 5%).
7. **Output:** Weekly cost, monthly cost, and cumulative running total at 2, 4, 8, 12, 16 weeks. Comparison to a typical sale-time benchmark for the suburb.
8. **Logic and sources:** Straightforward sum. Suburb-level DOM benchmark from office data.
9. **Assumptions shown:** Opportunity-cost rate is editable. Default is a conservative 5% annual on equity.
10. **"Aha" moment:** "Each extra week on market is costing me $1,340." Sellers who were inclined to hold out for an extra $20k realise the extra six weeks costs $8k, leaving a $12k gain.
11. **Natural path to appraisal:** Pair with the Price-Reduction Decision Tool. "If your campaign has sat for more than the suburb average, Daniel can give a frank read on whether the price needs to move, and by how much."
12. **Build complexity:** Low. Single Astro page.
13. **What could make it fail:** If the opportunity-cost line is disputed it erodes credibility. Mitigation: make that input optional and editable, label it as "a conservative return on capital you could otherwise deploy."

---

### 6. Bridging / Relocation Finance Scenario Modeller

1. **Tool name:** Bridging / Relocation Finance Scenario Modeller
2. **Question it answers:** "If I buy before I sell, what will bridging finance actually cost me, and is it worth it versus selling first?"
3. **One-line description:** Models three scenarios side by side: buy first with bridging, sell first and rent, or settle simultaneously. Shows the financial cost and the risk profile of each.
4. **Why it's more useful than what exists:** Bank calculators show bridging repayments only. This tool compares three options end-to-end: fees, interest, rent cost, moving-twice cost, risk of selling into a softer market, risk of buying then stalling.
5. **Why it's not a duplicate:**
   - Closest existing: none (mortgage calculator is unrelated, deposit savings is unrelated).
   - Closest sibling in this list: Whole-of-Move Maths (#8).
   - Distinct because: Whole-of-Move covers the pure transaction maths. This one models the *timing strategy*: buy-before-sell vs sell-then-rent vs simultaneous. Different decision.
6. **Inputs:** Current property value, current mortgage, expected sale price, expected next-purchase price, deposit from sale proceeds, likely sale-time-on-market, bridging rate, rental cost if sold first, moving cost per move.
7. **Output:** Three-column comparison: total cost, total risk rating, recommended option with reasoning. Break-even line: "if your property sells in X weeks, bridging wins. Beyond that, sell first and rent."
8. **Logic and sources:** Standard bridging formula: peak debt = existing mortgage + new purchase − sale net. Interest charged on peak debt at bridging rate for expected months to sale. Rent-first option: rent × months + moving × 2. Simultaneous settlement option: risk-rated, lowest pure cost, highest coordination risk.
9. **Assumptions shown:** Bridging rates editable. Default 7.0% for April 2026. Assumed 12 months' bridging tenure cap per standard lender terms.
10. **"Aha" moment:** Realising that the "buy first and bridge" route costs $18k more over an 8-week sale window, but also carries the risk of a soft-market sale at a discount.
11. **Natural path to appraisal:** "An accurate sale timeframe and an honest sale-price range are what this calculation hinges on. A free walkthrough gives you those two inputs."
12. **Build complexity:** Medium. Pure calculation, no external data.
13. **What could make it fail:** Oversimplifying the risk side. Mitigation: include a qualitative risk rating per scenario, not just a dollar number.

---

### 7. Rent vs Sell Decision Tool

1. **Tool name:** Rent vs Sell Decision Tool
2. **Question it answers:** "I own this as an investment. Should I sell and redeploy the capital, or hold and keep renting?"
3. **One-line description:** Models holding versus selling your current investment property over 5 and 10 years, including CGT, loan costs, opportunity cost, and expected Brisbane inner-east capital growth.
4. **Why it's more useful than what exists:** `rent-vs-buy.astro` exists but is for first-home buyers deciding whether to buy. No tool exists for investors deciding whether to sell an existing rental.
5. **Why it's not a duplicate:**
   - Closest existing: `rent-vs-buy.astro` (opposite decision).
   - Closest sibling in this list: CGT-Optimised Sale Timing (#17).
   - Distinct because: rent-vs-buy is for a prospective purchase. This is for an existing holding. CGT-Timing is a sub-question about *when* to sell. Rent-vs-Sell is whether to sell at all.
6. **Inputs:** Current property value, current loan, current rent, expenses (rates, insurance, maintenance, PM, body corp), marginal tax rate, cost base, purchase date, holding horizon (5 / 10 years), alternative investment return assumption.
7. **Output:** Net-position comparison at 5 and 10 years under both scenarios. CGT consequence of selling now. Annual after-tax cash flow of holding. Recommended action with reasoning.
8. **Logic and sources:** Standard property hold-vs-sell formulas. CGT reuses capital-gains calculator internals. Default Brisbane inner-east capital growth assumption 4.5% p.a. (editable, with sourced justification).
9. **Assumptions shown:** Growth rate and alternative return are editable. Calculation assumes the alternative return is deployed from the net sale proceeds after CGT, with the same loan position closed.
10. **"Aha" moment:** Seeing that holding wins by $120k over 10 years for a CGT-heavy older property, or that selling and redeploying wins by $85k for a high-yield portfolio-rebalance scenario.
11. **Natural path to appraisal:** "The result depends heavily on your current sale price. Daniel can give you a written appraisal that sharpens this calculation."
12. **Build complexity:** Medium. Reuses CGT logic from existing tool.
13. **What could make it fail:** If the capital growth assumption looks like a guess, the whole output is suspect. Mitigation: default rate cited to a named source and editable.

---

### 8. Whole-of-Move Maths

1. **Tool name:** Whole-of-Move Maths
2. **Question it answers:** "If I sell this and buy the next one, how much will I actually have left after all the costs of the move?"
3. **One-line description:** End-to-end maths for a sale + next purchase: sale net, duty on new purchase, loan costs, moving, lost income, renovation costs on the new place.
4. **Why it's more useful than what exists:** Sellers think in two separate calculations (sale costs / duty on purchase). This tool ties them into one picture. Adds the non-financial items (moving twice, two weeks off work for settlement) that most calculators ignore.
5. **Why it's not a duplicate:**
   - Closest existing: `selling-costs.astro` (sale side only), `stamp-duty.astro` (purchase side only).
   - Closest sibling in this list: Net Proceeds Deep Dive (#1).
   - Distinct because: Net Proceeds stops at the settlement statement. This tool picks up from there and runs through to "how much am I left with after I have moved into the next home."
6. **Inputs:** Sale price, sale costs (auto-imported from Net Proceeds), next-purchase price, owner-occupier or investor, moving-twice cost, interim renting cost if any, lost-income estimate, renovation / settling-in budget on the new place.
7. **Output:** Total whole-of-move outlay, net position at the end, difference from "just selling" scenario.
8. **Logic and sources:** Sale net − (duty on new purchase + conveyancing on new purchase + moving × 2 + interim rent + lost income + renovation).
9. **Assumptions shown:** Moving cost default $4,000 per move (editable), lost income default 3 days (editable).
10. **"Aha" moment:** "I thought I was moving to an equivalent house and ending square. I'm actually $47k behind once everything is counted."
11. **Natural path to appraisal:** "The sale-price input here is the biggest lever in this calculation. A walkthrough with Daniel tightens it up."
12. **Build complexity:** Low to medium.
13. **What could make it fail:** The "lost income" input is subjective. Mitigation: optional with clear defaults; allow zero.

---

### 9. Tenanted vs Vacant Campaign Impact Estimator

1. **Tool name:** Tenanted vs Vacant Campaign Impact Estimator
2. **Question it answers:** "Should I end the tenancy before I sell, or leave the tenants in place through the campaign?"
3. **One-line description:** Shows the trade-off between continued rental income and the likely price impact of selling with tenants still in the home.
4. **Why it's more useful than what exists:** A real decision every Brisbane landlord faces. No public tool addresses it numerically. The trade-off is usually pitched vaguely ("vacant tends to achieve more"). This tool puts a number on it.
5. **Why it's not a duplicate:**
   - Closest existing: none.
   - Closest sibling in this list: Rent vs Sell (#7).
   - Distinct because: Rent vs Sell is "hold or liquidate." This is "since I am selling, what condition do I sell it in."
6. **Inputs:** Current rent, lease end date, expected campaign length, expected price range tenanted vs vacant (defaults from suburb data), access restrictions in the current lease, tenant cooperation (cooperative / uncooperative / hostile), period of vacancy (weeks) needed to prepare.
7. **Output:** Side-by-side: tenanted scenario (retained rent, likely price impact, access risk, presentation risk), vacant scenario (lost rent, likely price uplift, presentation control, holding cost). Recommended action.
8. **Logic and sources:** Suburb-level reference data: average tenanted-vs-vacant sale price differential from Daniel's office data. Tenant-cooperation factor adjusts presentation-risk multiplier.
9. **Assumptions shown:** The default differential (stated as a range, e.g. 2–5% below for uncooperative tenants, 0–2% for cooperative) is editable. Sources cited.
10. **"Aha" moment:** "Keeping the tenants is saving me $6,800 in rent but likely costing me $45,000 in sale price."
11. **Natural path to appraisal:** "The tenanted-vs-vacant price differential is suburb-specific. Daniel can give you the actual pattern in your street."
12. **Build complexity:** Low to medium.
13. **What could make it fail:** The tenanted-vs-vacant differential varies widely. Mitigation: show as a range with editable default.

---

### 10. Auction Reserve-Setting Framework

1. **Tool name:** Auction Reserve-Setting Framework
2. **Question it answers:** "I am going to auction on Saturday. What should my reserve actually be?"
3. **One-line description:** Walks through the reserve decision using registered-bidder count, pre-auction offer activity, buyer-feedback signals, and the current comp median. Outputs a recommended reserve and the rationale.
4. **Why it's more useful than what exists:** Reserve-setting is one of the highest-stakes moments in a campaign and is done in a hotel room on auction morning with the agent. Most sellers have no structured framework for the decision. This tool gives them one.
5. **Why it's not a duplicate:**
   - Closest existing: none.
   - Closest sibling in this list: Method-of-Sale (#3).
   - Distinct because: Method-of-Sale is the pre-campaign decision. Reserve-Setting is the auction-morning decision.
6. **Inputs:** Agent's price guide, campaign weeks, total inspections, total building-and-pest reports, registered-bidder count (as at auction morning), highest pre-auction offer (if any), number of callbacks in the final week, comp median in the last 90 days.
7. **Output:** Recommended reserve (single number) with explanation. Floor of realistic outcome, stretch result, and "pass in" threshold.
8. **Logic and sources:** Evidence-weighted decision model. Four or more registered bidders + active pre-auction offers → reserve at low end of guide. Fewer bidders, minimal callback activity → reserve at lower end or below, with accept-passed-in strategy noted.
9. **Assumptions shown:** "The reserve decision should ultimately be made with your agent in the room. This tool is a structured checklist that makes sure nothing is missed."
10. **"Aha" moment:** Seeing that with only 2 registered bidders and no pre-auction offers, a reserve at the top of the guide will pass the property in, and a reserve at the bottom of the guide is the play that holds the room.
11. **Natural path to appraisal:** "Auction-morning conversations go better when the seller has spent time in the tool beforehand. Daniel uses a version of this framework with every auction vendor."
12. **Build complexity:** Low to medium.
13. **What could make it fail:** If the rule base is too mechanistic, vendors will second-guess their agent. Mitigation: output states clearly that the tool supports the conversation, not replaces it.

---

### 11. Pre-Sale Defect Triage

1. **Tool name:** Pre-Sale Defect Triage (Fix / Disclose / Leave)
2. **Question it answers:** "The pre-sale inspection flagged seven issues. Which do I fix, which do I disclose, which do I leave alone?"
3. **One-line description:** For each defect, classifies it as Fix, Disclose, or Leave based on cost, buyer-impact, inspection-visibility, and disclosure obligation under QLD law.
4. **Why it's more useful than what exists:** Most sellers treat this as an all-or-nothing decision (fix everything, or hope). This tool gives item-by-item triage. Reduces over-spending and also reduces nasty renegotiation surprises.
5. **Why it's not a duplicate:**
   - Closest existing: `renovation-roi.astro` (full-room renovations) and `presale-checklist.astro` (general preparation tasks).
   - Closest sibling in this list: none.
   - Distinct because: triage is item-level, not a renovation or a checklist. It outputs a classification per defect and the reasoning.
6. **Inputs:** Per defect — category (structural, moisture, pest, electrical, plumbing, cosmetic, safety), estimated remediation cost, whether a building-and-pest inspector would flag it, whether it is a safety or disclosure obligation (smoke alarms, pool, asbestos, pool fence etc).
7. **Output:** Per defect — a Fix / Disclose / Leave call with one-sentence reason. Cumulative spend if all Fix items are actioned.
8. **Logic and sources:** Decision matrix:
   - Safety/statutory disclosure (smoke alarm, pool fence, asbestos, pool safety cert) → Fix or disclose per QLD law.
   - Major structural or active pest → Fix (or price-adjust with full disclosure).
   - Cosmetic + cheap → Fix.
   - Cosmetic + expensive → Leave, expect buyer discount.
   - Mid-cost + inspection-visible → case-by-case with a rule.
   - Source citations: Building Act 1975 (Qld), QLD smoke alarm legislation, QBCC pool safety guidelines.
9. **Assumptions shown:** Each call is annotated with the rule applied.
10. **"Aha" moment:** Saving $4,000 by realising the shed termite damage should be disclosed at $500 rather than rebuilt at $4,500.
11. **Natural path to appraisal:** Pairs with the Pre-Sale Preparation Checklist already on the site, and with a free walkthrough where Daniel goes item by item with the defect list.
12. **Build complexity:** Medium.
13. **What could make it fail:** If it tells a seller to "Leave" a statutory safety item, that is a legal problem. Mitigation: hardcode statutory items as Fix, and cite the law on each.

---

### 12. Off-Market vs On-Market Decision

1. **Tool name:** Off-Market vs On-Market Decision
2. **Question it answers:** "An agent says they have a buyer ready off-market. Should I take it, or run a proper campaign?"
3. **One-line description:** Structured decision tool weighing the convenience of off-market against the likely price impact of running a campaign with real buyer competition.
4. **Why it's more useful than what exists:** Paperclip posts and Daniel's articles cover this topic. No public tool runs the decision with the seller's inputs.
5. **Why it's not a duplicate:**
   - Closest existing: none.
   - Closest sibling in this list: Method-of-Sale Recommender (#3).
   - Distinct because: Method-of-Sale assumes you are going to market. This tool is the earlier question: should you go to market at all.
6. **Inputs:** Off-market offer dollar figure, your suburb, property type, privacy-sensitivity level, time pressure, number of nearby comps that beat the off-market offer.
7. **Output:** Recommended action (accept off-market / counter-offer off-market / go to full campaign / decline). Expected campaign result range if you go to market.
8. **Logic and sources:** Rule base weighting time pressure and privacy against expected uplift.
9. **Assumptions shown:** Expected uplift range cited to suburb data.
10. **"Aha" moment:** Seeing that the off-market offer is $75k below the suburb's last three comparable sales, which justifies running a campaign even though the off-market is convenient.
11. **Natural path to appraisal:** "Before accepting an off-market, have Daniel give you the honest read on the campaigned result. No obligation, 20 minutes."
12. **Build complexity:** Low to medium.
13. **What could make it fail:** Mitigation: include the real exception scenarios where off-market is the right call (privacy, neighbour relationships, hard-to-market stock).

---

### 13. Price-Reduction Decision Tool

1. **Tool name:** Price-Reduction Decision Tool
2. **Question it answers:** "Week four of the campaign, no offers. Drop the price, hold firm, or relaunch?"
3. **One-line description:** Evaluates campaign signals (inspection count, callbacks, offers, feedback) and recommends hold, reduce, or relaunch, with the size of the move if reducing.
4. **Why it's more useful than what exists:** Price reductions are usually discussed in the agent-vendor meeting on Monday morning. There is no structured framework most vendors can use. This tool produces a reasoned recommendation.
5. **Why it's not a duplicate:**
   - Closest existing: none.
   - Closest sibling in this list: Holding Costs (#5).
   - Distinct because: Holding Costs shows the cost of waiting. This one decides whether waiting is the right call.
6. **Inputs:** Current price guide, weeks on market, total inspection attendance, number of return inspections, total written and verbal offers, highest offer received, comp median change since launch.
7. **Output:** Recommendation (hold / reduce 2–3% / reduce 5–7% / relaunch). Rationale. Expected response window.
8. **Logic and sources:** Rule base. Low inspection count + no callbacks after week 3 → price is the issue. High inspection count + multiple callbacks + no offers → presentation or condition is the issue. Falling comp median → market-wide reduction needed.
9. **Assumptions shown:** Each rule cited.
10. **"Aha" moment:** "My campaign has had 84 inspections and 12 callbacks but zero offers. The tool is telling me the issue is the price guide, not the market."
11. **Natural path to appraisal:** If the tool recommends a reduction, "Daniel can give you a second opinion on the exact size of the reduction and how to brief your current agent."
12. **Build complexity:** Low to medium.
13. **What could make it fail:** If the output feels like a hostile takeover from the current agent, sellers will distrust it. Mitigation: frame as "a structured discussion with your agent, not a replacement for it."

---

### 14. Multiple-Offer Evaluation Tool

1. **Tool name:** Multiple-Offer Evaluation Tool
2. **Question it answers:** "I have three offers on the table. The highest is the most conditional. Which one should I actually take?"
3. **One-line description:** Scores each offer on price, conditionality, finance risk, settlement fit, and buyer profile, then recommends the strongest net offer.
4. **Why it's more useful than what exists:** Sellers fixate on the dollar number. The strongest offer is often not the highest-priced. This tool makes the full picture explicit.
5. **Why it's not a duplicate:**
   - Closest existing: `property-compare.astro` (compares properties, not offers).
   - Closest sibling in this list: Off-Market vs On-Market (#12).
   - Distinct because: the comparison object is different (offers, not properties) and the scoring is tuned to vendor-side priorities.
6. **Inputs:** For each offer — price, conditionality (finance / building-pest / sale of other), deposit size, requested settlement date, buyer type (first home / upgrader / investor / cash / bridging), buyer's broker / bank, previous contract history if known.
7. **Output:** Each offer scored out of 100. Recommended offer with reasoning. Top two risks per offer.
8. **Logic and sources:** Weighted scoring: price 50%, finance risk 20%, conditionality 15%, settlement fit 10%, deposit size 5%.
9. **Assumptions shown:** Weights editable. Defaults shown and defended.
10. **"Aha" moment:** The highest offer is 4% more but has a 28-day subject-to-sale-of-existing-home condition that is realistically 30% likely to fall over. The second-highest offer is cleaner and worth taking.
11. **Natural path to appraisal:** This tool is most valuable when a campaign is already running. Link to a walkthrough for sellers who are still pre-campaign.
12. **Build complexity:** Low.
13. **What could make it fail:** If the scoring is opaque, vendors will not trust it. Mitigation: show every input weight on the output.

---

### 15. Campaign Outcome Benchmarker

1. **Tool name:** Campaign Outcome Benchmarker
2. **Question it answers:** "What result should I actually expect for my property type, suburb, and price band?"
3. **One-line description:** Shows the typical campaign outcome profile (days on market, offers received, price as % of guide, passed-in rate) for properties like yours in the last 12 months.
4. **Why it's more useful than what exists:** Domain and realestate.com.au show data at the macro level. This tool shows it for the specific "class" of property the user owns, in their suburb.
5. **Why it's not a duplicate:**
   - Closest existing: `heatmap.astro` (shows median price and growth).
   - Closest sibling in this list: Appraisal Reality Check (#2).
   - Distinct because: heatmap shows price data. This tool shows *campaign outcome* data.
6. **Inputs:** Suburb, property type (house / unit / townhouse), price band ($100k buckets), method of sale.
7. **Output:** Median DOM, offer count distribution, % achieving above guide, % passed in at auction, days-to-first-offer median.
8. **Logic and sources:** Office data or CoreLogic.
9. **Assumptions shown:** Sample size displayed per chart. If fewer than 10 comps, replaced with "insufficient data."
10. **"Aha" moment:** "75% of 3-bed houses in Carina in the $1.1m–$1.3m band sold within 30 days last year. My campaign has been running 45 days."
11. **Natural path to appraisal:** If the user's current campaign is underperforming, "Daniel can give you a second opinion on what is going wrong."
12. **Build complexity:** High (data feed dependency).
13. **What could make it fail:** Thin data undermines the confidence. Mitigation: only show benchmarks where sample size ≥ 10.

---

### 16. CGT-Optimised Sale Timing

1. **Tool name:** CGT-Optimised Sale Timing
2. **Question it answers:** "I want to sell. Does it matter whether I settle this financial year or next?"
3. **One-line description:** Shows the CGT difference between settling before 30 June versus after, including the impact of income timing.
4. **Why it's more useful than what exists:** The existing CGT calculator computes liability in a given year. It does not help the user decide which financial year to settle in.
5. **Why it's not a duplicate:**
   - Closest existing: `capital-gains.astro` (computes liability for a single year).
   - Closest sibling in this list: Rent vs Sell (#7).
   - Distinct because: this tool is the *timing* decision — which financial year — not the liability calculation.
6. **Inputs:** Expected sale price, cost base, this year's income, next year's income estimate, settlement date options.
7. **Output:** Total tax liability under each settlement-year option, difference in dollars, recommended year to settle in.
8. **Logic and sources:** Uses existing CGT engine with two sets of income assumptions.
9. **Assumptions shown:** Marginal rates labelled as 2025-26 Stage-3.
10. **"Aha" moment:** Settling in July instead of June saves $27,000 in CGT because next year's income is forecast to drop.
11. **Natural path to appraisal:** "The sale price is the biggest lever here. A walkthrough gives you that input with confidence."
12. **Build complexity:** Low. Extends existing CGT tool.
13. **What could make it fail:** Complex multi-entity or trust structures. Mitigation: tool clearly states individual taxpayer only, and recommends an accountant for anything else.

---

### 17. Agent-Conditioning Pattern Checker

1. **Tool name:** Agent-Conditioning Pattern Checker
2. **Question it answers:** "Is my agent gradually conditioning me on a lower price than what they originally quoted?"
3. **One-line description:** A behavioural check that compares the agent's initial appraisal, their price guide, their post-inspection commentary, and their reserve suggestion to identify whether the framing is trending down.
4. **Why it's more useful than what exists:** Pattern exists but is rarely surfaced to vendors. No public tool names it.
5. **Why it's not a duplicate:**
   - Closest existing: none.
   - Closest sibling in this list: Appraisal Reality Check (#2).
   - Distinct because: Appraisal Reality Check is about choosing an agent. This tool is about auditing the agent you have chosen.
6. **Inputs:** Initial verbal appraisal range, written appraisal range, campaign price guide, post-inspection commentary at weeks 2 and 4, suggested reserve, current market shift (rising / flat / softening).
7. **Output:** Conditioning-trend score: none / mild / strong. Specific pattern flags.
8. **Logic and sources:** Rule base.
9. **Assumptions shown:** Each flag references the pattern (e.g., "price guide 7% below written appraisal with no external market shift").
10. **"Aha" moment:** Seeing that the agent's language has moved from "confident of $1.55m" to "might be $1.45m to $1.55m" over four weeks with no market change, which is classic conditioning.
11. **Natural path to appraisal:** "If you are in the middle of a campaign and the read is that you are being conditioned, Daniel can give you an independent opinion on whether the market shift the agent is citing is real."
12. **Build complexity:** Low.
13. **What could make it fail:** Risk of defamation if it calls legitimate market feedback "conditioning." Mitigation: tool phrased as "patterns consistent with conditioning" with caveats.

---

### 18. Settlement-Date Calculator

1. **Tool name:** Settlement-Date Calculator
2. **Question it answers:** "Given my contract date and the conditions, when will settlement actually land?"
3. **One-line description:** Calculates the expected settlement date given the contract date, finance condition days, building-and-pest condition days, and standard QLD contract timelines.
4. **Why it's more useful than what exists:** Nowhere public has a QLD-specific settlement-date calculator.
5. **Why it's not a duplicate:**
   - Closest existing: none.
   - Closest sibling in this list: Bridging Finance (#6).
   - Distinct because: pure timeline calculation for a specific contract.
6. **Inputs:** Contract date, finance days (default 21), building-and-pest days (default 14), standard settlement days (default 30), public holiday calendar (QLD / national).
7. **Output:** Unconditional date, settlement date, milestone dates.
8. **Logic and sources:** Standard REIQ contract timelines. Business-day exclusion using QLD public holiday calendar.
9. **Assumptions shown:** Default condition lengths are editable.
10. **"Aha" moment:** "If I sign Saturday the 12th, settlement lands on the 18th of the following month — one day before my settlement on the next property. I need to adjust."
11. **Natural path to appraisal:** Pairs with Bridging / Relocation Finance tool and the Whole-of-Move Maths tool.
12. **Build complexity:** Low.
13. **What could make it fail:** If the QLD holiday calendar is out of date. Mitigation: reload the calendar annually from the QLD Government source.

---

### 19. Auction Day Bid Tracker

1. **Tool name:** Auction Day Bid Tracker
2. **Question it answers:** "How do I stay in control of the numbers during my auction?"
3. **One-line description:** A simple vendor-side companion: enter each bid live, see whether the trajectory is tracking to reserve, and trigger a "call the auction" prompt if the bidding stalls.
4. **Why it's more useful than what exists:** Nothing like this exists publicly. Vendors at auction are typically passive spectators. Having a structured tool makes the reserve conversation sharper.
5. **Why it's not a duplicate:**
   - Closest existing: none.
   - Closest sibling in this list: Reserve-Setting Framework (#10).
   - Distinct because: pre-auction tool vs during-auction tool.
6. **Inputs:** Reserve, price guide low, price guide high. During auction: bid amounts entered live.
7. **Output:** Bid trajectory chart, gap to reserve, indicator when bidding stalls, suggested vendor conversation prompts.
8. **Logic and sources:** Simple tracker. No external data.
9. **Assumptions shown:** Reserve can be dropped mid-auction from the tool's guidance.
10. **"Aha" moment:** Realising the bidding has plateaued at $1.48m when reserve is $1.5m, and the tool prompts "pause the auction, consult the agent, consider dropping reserve by $20k to meet the market."
11. **Natural path to appraisal:** This is a companion tool for existing Daniel auction clients. A subtle "want Daniel running your next auction" link at the foot of the result.
12. **Build complexity:** Low.
13. **What could make it fail:** If it distracts the vendor from the auctioneer. Mitigation: simple UI, reads clearly from the back of the crowd.

---

### 20. Body Corporate Disclosure Readiness

1. **Tool name:** Body Corporate Disclosure Readiness
2. **Question it answers:** "I am selling my unit. Is my body corporate disclosure pack complete, and what is missing?"
3. **One-line description:** Checklist-style review of the standard disclosures required for unit and townhouse sales in QLD, flagging missing items and estimating the cost and time to obtain them.
4. **Why it's more useful than what exists:** Unit sellers often discover disclosure gaps days before settlement. This tool catches them before listing.
5. **Why it's not a duplicate:**
   - Closest existing: `presale-checklist.astro` (general preparation).
   - Closest sibling in this list: Pre-Sale Defect Triage (#11).
   - Distinct because: specific to body-corporate disclosure requirements, which the general checklist does not cover.
6. **Inputs:** Building size (number of lots), management structure (committee-only / professional manager), lot type (unit / townhouse / duplex), current ownership period, known defects or levies.
7. **Output:** Per disclosure item — Ready / Missing / Unknown — with cost estimate to obtain each missing item, and typical lead time.
8. **Logic and sources:** Body Corporate and Community Management Act 1997 (Qld). Accredited Body Corporate Manager industry standards.
9. **Assumptions shown:** Checklist cited to the Act.
10. **"Aha" moment:** Seeing that the sinking-fund forecast and the insurance certificate of currency are both missing, with a 3-week lead time to obtain — which would stall a campaign launch if not resolved now.
11. **Natural path to appraisal:** "Let's make sure the disclosure pack is ready before you talk to any agent, then we can plan the campaign properly."
12. **Build complexity:** Low.
13. **What could make it fail:** If the checklist is incomplete and misses a QLD-specific disclosure. Mitigation: cite the Act and cross-check with a conveyancer before launch.

---

## PART B — 10 educational articles

Constraint check applied: none of the articles cover agent selection, pricing strategy, commission, off-market decisions, or any other area where content could compete with Daniel's advisory role. All ten are physical-property / professional / planning education.

### 1. Types of Residential Property in Australia

- **Covers:** Detached house, semi-detached / duplex, terrace, townhouse, villa, low-rise unit, high-rise apartment, studio, granny flat / secondary dwelling, dual-occupancy, house-and-land.
- **For each:** Typical lot size, construction method, body-corporate implications, common buyer type in Brisbane.
- **Why useful:** Sellers and buyers use these terms interchangeably and get pricing wrong. Clear definitions help them calibrate.

### 2. Brisbane House Styles and Architectural Periods

- **Covers:** Prewar cottage, Queenslander (lowset, highset, workers', Ashgrovian), post-war brick, mid-century, split-level, modern contemporary.
- **For each:** Visual identifiers, construction materials, typical era, renovation potential, inner-east suburbs where each is most common.
- **Why useful:** Inner-east buyers talk in these labels. Sellers who can't identify their own home's style tend to get preparation wrong.
- **Visual treatment:** Period-accurate photography or line-art diagrams of each.

### 3. House Anatomy: Eaves, Soffits, Fascia, Slabs, Bearers, Joists

- **Covers:** Roof components (ridge, hip, valley, eave, fascia, soffit, gutter, barge board, flashing). Wall components (cladding, studs, weatherboards, noggings). Floor components (slab, bearers, joists, subfloor, stumps, ant caps). Every term named, visually labelled, and explained.
- **Why useful:** Sellers get quotes from tradies and do not know what items mean. Buyers read inspection reports and do not know what "fascia replacement $4,800" refers to. This article is the glossary and the diagram.
- **Visual treatment:** Labelled exploded diagram of a typical Queenslander and a typical post-war brick.

### 4. Building Materials Explained (Timber, Brick, Chamferboard, Render, Weatherboard, Cladding)

- **Covers:** Each common Brisbane material, how to identify it, typical life, typical maintenance, typical cost to repair or replace, heritage implications if character-overlay applies.
- **Why useful:** Buyers and sellers routinely mis-identify materials (calling chamferboard "weatherboard," calling bagged brick "render"). This article settles the terminology.

### 5. Slab Design Types: Waffle, Raft, Conventional, Suspended

- **Covers:** Each slab type, typical cost, soil class suitability, signs of movement or failure, what an inspector looks for.
- **Why useful:** Queenslanders often have a mix of slab types across original and extension sections. Buyers read reports and misunderstand what a slab's age or movement actually means.

### 6. Cladding and Facade Types with Design Examples

- **Covers:** Face brick, rendered brick, chamferboard, weatherboard, fibre cement sheet, Hardiflex, weatherboard profiles, metal cladding, stone, composite. For each: visual example, typical Brisbane era, heritage compatibility, cost to maintain.
- **Why useful:** Sellers preparing a facade refresh need to know what is worth repainting, recladding, or leaving alone. Character-overlay rules constrain choices.

### 7. Building Professionals: Architect vs Building Designer vs Draftsperson vs Engineer vs Surveyor vs Town Planner

- **Covers:** Each role, what work they are licensed to do, typical fee range, when to engage each.
- **Why useful:** Clients hire the wrong professional constantly. A homeowner asking "an architect" to do a simple drafting job pays architectural fees. Another asking "a draftsperson" for a complex site pays for redraws.
- **Includes:** STCA, DA, CC acronyms and which professional owns each.

### 8. The Build Process with an Architect, Step by Step

- **Covers:** Brief → site analysis → concept design → developed design → DA lodgement → approval → construction documentation → tender → builder selection → construction → PC/defects period.
- **For each step:** Who does what, typical duration, typical fee portion, decision points, common delays.
- **Why useful:** Every prospective knockdown-rebuild owner underestimates this timeline and budget. A clear article becomes a reference.
- **Visual:** Gantt-style timeline with typical 18 to 30 month duration.

### 9. Queensland / Brisbane Zoning Explained (LMR, MDR, HDR, Character, CR, NC, MC)

- **Covers:** Each Brisbane City Plan 2014 zone code, what it permits, typical density, demolition controls, character overlay mechanics, neighbourhood plans. Includes plain-English definitions of acronyms: DA, CC, STCA, BCC, BCA, NCC, NC (Neighbourhood Centre), MC (Mixed Use).
- **Why useful:** Zoning is the single most mis-understood field on a property listing. Buyers and sellers both need to read it correctly.
- **Visual:** Colour-coded zoning overlay over an example Brisbane inner-east street grid.

### 10. Types of Build: Project Home vs Custom vs Modular vs Prefab vs Renovation vs Knockdown-Rebuild

- **Covers:** Each build path, typical cost per square metre, typical duration, who it suits, trade-offs. Specific Brisbane builder categories and when each makes sense.
- **Why useful:** Sellers considering a knockdown-rebuild on their own block, or buyers deciding between an existing home and a new build, need this head-to-head view.

---

## Safeguards on content

Every article above is a **physical / structural / planning / professional-role** explainer. None of them covers:

- How to choose an agent
- How to price for sale
- How to negotiate with an agent
- How to DIY a campaign
- How to bypass agent commission
- Off-market strategies
- Reading the market

The topics Daniel sells on are protected. The articles make readers more informed property owners without giving them a reason to skip the agent conversation.

---

## Terminal summary

**20 TOOLS (strongest first):**

 1. Appraisal Reality Check — evaluates three agent appraisals against comparable evidence, flags which is honest
 2. Method-of-Sale Recommender — auction / private treaty / EOI recommendation for the specific property
 3. Buyer Profile Predictor — returns the realistic buyer archetype for a property and how to present for them
 4. Agent-Conditioning Pattern Checker — detects whether the seller is being gradually talked down on price
 5. Net Proceeds Deep Dive — settlement-statement-style breakdown including fixed-rate break cost and CGT
 6. Holding Costs While On Market — weekly dollar cost of every extra week a listing sits
 7. Price-Reduction Decision Tool — hold / reduce / relaunch call from campaign signals
 8. Multiple-Offer Evaluation Tool — scores offers on price plus conditionality plus finance risk
 9. Whole-of-Move Maths — sale + next purchase + moving + lost income end-to-end
10. Bridging / Relocation Finance Scenario Modeller — buy first vs sell first vs simultaneous side-by-side
11. Rent vs Sell Decision Tool — hold a Brisbane investment vs liquidate over 5 and 10 years
12. Tenanted vs Vacant Campaign Impact Estimator — trade-off between retained rent and likely price uplift
13. Auction Reserve-Setting Framework — auction-morning reserve recommendation with reasoning
14. Auction Day Bid Tracker — live vendor companion during auction, prompts when bidding stalls
15. Pre-Sale Defect Triage — Fix / Disclose / Leave per defect, QLD-law aligned
16. Off-Market vs On-Market Decision — should you even go to market given this off-market offer
17. Campaign Outcome Benchmarker — realistic DOM / offer count / above-guide rate for your property class
18. CGT-Optimised Sale Timing — this financial year vs next, how much tax it saves or costs
19. Settlement-Date Calculator — expected settlement given QLD contract conditions and holidays
20. Body Corporate Disclosure Readiness — checklist of required unit / townhouse disclosures, flags gaps

**10 ARTICLES:**

 1. Types of Residential Property in Australia
 2. Brisbane House Styles and Architectural Periods
 3. House Anatomy (eaves, soffits, fascia, slabs, bearers, joists) — glossary with diagrams
 4. Building Materials Explained (timber, brick, chamferboard, render, weatherboard, cladding)
 5. Slab Design Types (waffle, raft, conventional, suspended)
 6. Cladding and Facade Types with Design Examples
 7. Building Professionals (architect, building designer, draftsperson, engineer, surveyor, town planner)
 8. The Build Process with an Architect, Step by Step
 9. Queensland / Brisbane Zoning Explained (LMR, MDR, HDR, Character, CR, NC, MC plus STCA, DA, CC acronyms)
10. Types of Build (project home, custom, modular, prefab, renovation, knockdown-rebuild)
