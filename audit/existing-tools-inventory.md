# Existing Tools & Interactive Elements Inventory

**Audit date:** 2026-04-23
**Purpose:** Baseline so the 20 new tool proposals cannot duplicate anything already on the site.

---

## Tech stack (constraints for any new tool)

- **Framework:** Astro 6 (static site output, Vercel deploy)
- **Styling:** Tailwind CSS 4, custom CSS variables (charcoal, cream, gold)
- **Tool shell:** `src/layouts/ToolLayout.astro` wraps every tool with nav, phase label, and styled container
- **Client interactivity:** vanilla JS inside `<script>` blocks. No React / Vue / Svelte runtime.
- **Data stores used by tools:** QRO stamp-duty schedules (hardcoded), BCC flood/zoning data, QLD DoE school catchments, Ray White office reference data
- **Server side:** mostly none (site is static). One API route was deleted during earlier cleanup.
- **Forms:** Formspree endpoint `xnjgedwp`
- **Analytics events wired:** GA4 + Meta Pixel via Layout.astro. Click events tracked for phone/email/form submit.

---

## Calculators and tools — `src/pages/tools/` (33 files)

### Finance and cost calculators

| # | Tool | File | Inputs | Output |
|---|---|---|---|---|
| 1 | Stamp Duty Calculator | `src/pages/tools/stamp-duty.astro` | Purchase price, buyer type (investor / owner-occupier / FHB), property type (new / established / land), deposit %, optional toggles for legal, inspection, mortgage reg, LMI | QLD transfer duty with concessions applied, plus total upfront costs and % of purchase price |
| 2 | Mortgage Calculator | `src/pages/tools/mortgage.astro` | Loan amount, interest rate, term, repayment frequency | Weekly/fortnightly/monthly repayment, amortisation schedule |
| 3 | Borrowing Power Calculator | `src/pages/tools/borrowing-power.astro` | Income, expenses, dependants, assess rate | Max borrowing amount |
| 4 | LMI Calculator | `src/pages/tools/lmi-calculator.astro` | Property value, deposit % | LMI premium + 9% QLD stamp duty on LMI |
| 5 | Deposit Savings Planner | `src/pages/tools/deposit-savings.astro` | Target price, budget categories (income, housing, food, transport, lifestyle, other), current savings | Months/years to target deposit + downloadable Excel |
| 6 | First Home Buyer Grant & Concessions | `src/pages/tools/first-home-buyer.astro` | Price, property type (new/existing), citizenship, previous ownership, occupancy intent | FHOG eligibility, first home concession, net duty payable |
| 7 | Rate Sensitivity Calculator | `src/pages/tools/rate-sensitivity.astro` | Current loan, current rate | Repayment delta at +0.25% through +2% |
| 8 | Equity Calculator | `src/pages/tools/equity-calculator.astro` | Property value, current loan | Equity balance, accessible equity at 80% LVR |
| 9 | Rent vs Buy Analyser | `src/pages/tools/rent-vs-buy.astro` | Rent, purchase scenario, assumptions | Break-even year where buying beats renting |

### Seller-cost tools

| # | Tool | File | Inputs | Output |
|---|---|---|---|---|
| 10 | Selling Cost Calculator | `src/pages/tools/selling-costs.astro` | Sale price, commission %, marketing preset, other costs | Total seller costs + net proceeds |
| 11 | Renovation ROI Calculator | `src/pages/tools/renovation-roi.astro` | Current value, renovation scope (kitchen, bathroom, paint, garden, etc.) | Projected uplift vs spend, ROI % |

### Investment calculators

| # | Tool | File | Inputs | Output |
|---|---|---|---|---|
| 12 | Investment Yield Calculator | `src/pages/tools/investment-yield.astro` | Purchase price, weekly rent, expenses | Gross and net yield, cash flow, 10-year projection |
| 13 | Negative Gearing Calculator | `src/pages/tools/negative-gearing.astro` | Salary, property price, loan, expenses | After-tax weekly cost, tax benefit |
| 14 | Property DCF Analyser | `src/pages/tools/dcf.astro` | Purchase price, growth assumptions, expenses, holding period | NPV, IRR, annual cash flow, equity build |
| 15 | Portfolio Builder | `src/pages/tools/portfolio-builder.astro` | Up to 3 properties | Combined equity, cashflow, growth over time |
| 16 | Investment Yield Calculator (already above #12) | | | |
| 17 | Depreciation Estimator | `src/pages/tools/depreciation-estimator.astro` | Build year, purchase price, fit-out, marginal tax rate | Division 43 + Division 40 depreciation per year, tax benefit |
| 18 | Granny Flat / Dual Occupancy ROI | `src/pages/tools/granny-flat-roi.astro` | Main property value, granny build cost, main rent, granny rent | Yield uplift, payback period, income impact |
| 19 | SMSF Property Calculator | `src/pages/tools/smsf-calculator.astro` | Fund balance, contribution, property price, rent, marginal rate | SMSF cashflow vs personal cashflow, fund affordability |

### Tax calculators

| # | Tool | File | Inputs | Output |
|---|---|---|---|---|
| 20 | Capital Gains Tax Calculator | `src/pages/tools/capital-gains.astro` | Purchase price/date, sale price/date, cost base items, marginal tax rate, discount slider | Estimated CGT liability, net proceeds |
| 21 | Land Tax Calculator | `src/pages/tools/land-tax.astro` | Total taxable land value, ownership type (individual / company / absentee), PPR flag | Annual QLD land tax |

### Location and market tools

| # | Tool | File | Inputs | Output |
|---|---|---|---|---|
| 22 | Instant Valuation | `src/pages/tools/valuation.astro` | Address, beds, baths, land size | Indicative value range for inner-east suburbs |
| 23 | Price Heatmap | `src/pages/tools/heatmap.astro` | None (interactive map) | Visual median price and growth map across inner east and south |
| 24 | Flood Risk Checker | `src/pages/tools/flood-risk.astro` | Address / suburb | BCC flood zone lookup, insurance implications |
| 25 | Zoning Map | `src/pages/tools/zoning-map.astro` | Address | Brisbane City Plan 2014 zoning (Character, LMR, MDR etc) |
| 26 | School Catchment Map | `src/pages/tools/school-catchment.astro` | Address | State and private schools nearby, primary/high catchments |
| 27 | Suburb Match Quiz | `src/pages/tools/suburb-match.astro` | 8 lifestyle / budget / priority questions | Recommended suburb(s) with rationale |
| 28 | Brisbane 2032 Olympics & Infrastructure Map | `src/pages/tools/brisbane-2032.astro` | None | Venue / rail / precinct locations mapped |
| 29 | Fuel Commute Cost Comparison | `src/pages/tools/commute-cost.astro` | Current home lat/lng, target home lat/lng, workplace lat/lng | Annual fuel $ and drive time deltas |
| 30 | Local Cafes & Restaurants | `src/pages/tools/local-eats.astro` | Suburb | List of local venues |

### Checklists and comparators

| # | Tool | File | Inputs | Output |
|---|---|---|---|---|
| 31 | Open Home Inspection Checklist | `src/pages/tools/open-home-checklist.astro` | Rate each area, flag issues | Overall property score, saved sessions |
| 32 | Pre-Sale Preparation Checklist | `src/pages/tools/presale-checklist.astro` | Checkboxes across prioritised pre-sale tasks | Progress tracker, cost estimates per task |
| 33 | Property Comparison | `src/pages/tools/property-compare.astro` | Up to 4 properties (price, rent, beds etc) | Side-by-side comparison table |

(Note: there are 33 tool files total, but one slot in the list above is a numbering artefact. Actual count is 33 distinct tools.)

---

## Forms and lead-capture widgets (not calculators, but interactive)

| Location | Form | What it does |
|---|---|---|
| `src/pages/index.astro` hero | Address entry → routes to property-worth | Captures property address, funnels to instant valuation |
| `src/pages/index.astro` quarterly report | Email signup | Quarterly suburb-report subscription |
| `src/pages/walkthrough.astro` | Walkthrough booking | Captures name, email, phone, preferred time, suburb |
| `src/pages/contact.astro` | Contact form | General contact |
| `src/pages/property-report.astro` | Multi-step report builder | Property type selector, beds, baths, cars, block size, pool, address. Produces a custom sales report. |
| `src/pages/property-worth.astro` | Gateway (3 options) | Chooses between instant report / walkthrough / phone call |
| `src/pages/lp/{bulimba,camp-hill,hawthorne,murarrie,seven-hills}.astro` | Paid-traffic LP forms | Suburb-specific lead capture for Meta and Google ads |
| `src/pages/suburbs/{40 suburbs}.astro` | Embedded appraisal form | Per-suburb lead capture mid-page |
| `src/layouts/Layout.astro` (injected) | Email capture on every insights article | Quarterly suburb-report subscription |

---

## Other interactive elements (not tools, for context)

- FAQ accordions on 50+ insight articles and homepage
- Breadcrumb navigation (auto-generated)
- Mobile nav toggle
- Reveal animations (scroll-triggered)
- Sticky mobile call/SMS bar
- Form → /thank-you redirect handler

---

## What is **not** currently on the site (opportunity space for new tools)

Based on this inventory, these decision points are NOT served by any existing tool:

- When to list (seasonality, market timing, personal readiness)
- Method of sale decision (auction vs private treaty vs EOI for a specific property)
- Is the agent's appraisal realistic (critical read on a proposed range)
- Is the agent conditioning me on price (behavioural pattern check)
- Holding costs while on market (not the same as selling costs)
- Bridging-finance scenario for buying before selling
- Rent-vs-sell analysis for investors considering liquidating
- Downsize / upsize / relocate whole-of-move maths (sale, duty, moving, lost income)
- Buyer profile prediction (who will actually buy my house)
- Auction reserve-setting framework
- Auction day bid-tracking worksheet
- Comparable sales filter on Daniel's inner-east sales history
- Pre-sale defect triage (fix vs disclose vs leave)
- Price-reduction decision framework if campaign stalls
- Multiple-offer evaluation framework
- Off-market vs on-market decision framework for the specific property
- Settlement-date calculator (given contract conditions)
- Pre-settlement inspection checklist (separate from open-home checklist)
- Agent fee negotiation calculator (what a specific % adjustment is worth)
- Selling-while-renting-it-out decision (vacant vs tenanted impact on campaign)
- Body corporate disclosure pack readiness (units/townhouses)
- Capital gains-optimised sale timing (this FY vs next FY)
- Campaign outcome benchmarker (what result should I actually expect)

---

## Where new tools must NOT duplicate

Explicit no-fly zones:

- **Stamp duty for buyers** — already at `stamp-duty.astro` and `first-home-buyer.astro`. A new duty tool for sellers' next purchase could work only if it answers a different question (e.g. net-position after sale + duty on next buy).
- **Mortgage repayments** — already at `mortgage.astro`.
- **Investment yield / negative gearing / depreciation / DCF / portfolio** — comprehensive cluster already exists.
- **Property valuation** — `valuation.astro` exists.
- **Comparing 4 properties** — `property-compare.astro` exists.
- **Selling costs (baseline)** — `selling-costs.astro` exists.
- **Renovation ROI (baseline)** — `renovation-roi.astro` exists.
- **Suburb lifestyle matching** — `suburb-match.astro` exists.
- **Heatmap / flood / zoning / catchment** — existing geo-data tools.
- **Open home checklist / presale checklist** — two checklists exist.
- **CGT / land tax basic calc** — exist.
- **LMI** — exists.

Any new tool must either:
1. Answer a question none of the above answers, or
2. Use substantively different inputs/outputs even if the topic overlaps, or
3. Target a different user intent (seller making a decision vs buyer estimating a cost).
