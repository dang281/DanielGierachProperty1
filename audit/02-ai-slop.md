# 02. AI Slop Audit

**Audit date:** 2026-04-23
**Scope:** Full sweep of the 8 core-suburb pages (both `/suburbs/` and `/insights/selling-in-`), homepage, about, walkthrough, property-worth, contact, results, reviews, brisbane-inner-east. Stratified sample of 15 insight articles.

Format: **File → Before → After**. The "After" keeps Daniel's existing tone (calm, specific, no hype) but removes AI tells.

Definition of AI slop used here:
- Em dashes ("—") anywhere in copy
- "Whether you are X, Y, or Z" openings
- "It's not X, it's Y" / "X, not Y" constructions used for rhetorical effect
- Stacked tricolons and parallel structures
- Generic openers and closers
- Filler intensifiers (very, really, quite, truly, incredibly)
- Corporate phrases that could apply to any agent in any city

---

## Core site pages

### 1. `src/pages/brisbane-inner-east.astro` — three patterns in one paragraph

**Before:**
> "Brisbane's inner-east market has its own rhythm. Buyer profiles shift suburb to suburb, auction clearance rates move with the seasons, and the difference between a good result and an exceptional one comes down to timing, positioning and negotiation. Having been deeply embedded in this corridor, I know how buyers think, what they will pay, and how to extract the most from a campaign."

Problems:
- "has its own rhythm" — cliché opener.
- "Buyer profiles shift X, clearance rates move Y, and the difference between X and Y comes down to Z" — stacked parallelism.
- "timing, positioning and negotiation" — tricolon ending.
- "Having been deeply embedded in this corridor" — generic.
- "I know how buyers think, what they will pay, and how to extract the most from a campaign" — second tricolon in the same paragraph.
- "extract the most" is the kind of phrase that reads as sales-speak.

**After:**
> "The inner east is not a single market. Ridge-street Camp Hill behaves differently to riverside Hawthorne, and a Queenslander in Norman Park attracts a different buyer pool to a townhouse in Coorparoo. I have been selling in this corridor for more than a decade. That means I know which buyers are active for your property right now, what they have been paying for comparable stock, and where the negotiation will actually be won."

---

### 2. `src/pages/brisbane-inner-east.astro` — "Whether you are X or Y or Z"

**Before:**
> "Whether you are selling a character Queenslander in Norman Park, a riverfront home in Hawthorne, or a family home in Camp Hill, I bring genuine market knowledge built on completed transactions, not theory."

Problems:
- "Whether you are X, Y, or Z" is the classic banned opener.
- "built on completed transactions, not theory" is the "X, not Y" contrastive pattern used rhetorically.
- "genuine market knowledge" — filler.

**After:**
> "Norman Park character homes, Hawthorne riverfronts, and Camp Hill family houses are three different campaigns with three different buyer pools. That is the level of specificity that separates a campaign that clears the market from one that sits."

---

### 3. `src/pages/property-worth.astro` — "Whether X, Y, or Z"

**Before:**
> "Whether you want a number now, an in-person assessment, or just a conversation, pick the option that suits where you're at."

Problems:
- Banned opener pattern.
- "where you're at" is casual but OK; the rest is the issue.

**After:**
> "Pick whichever option suits. A number now, an in-person walkthrough, or a phone call. Each one gets you closer to a decision."

---

### 4. `src/pages/index.astro` — homepage "Whether" pattern

**Before:**
> "Whether you want a number now, a detailed assessment, or a conversation, there's a starting point for every stage of thinking."

Problems:
- Banned opener.
- "every stage of thinking" is a generic marketing phrase.

**After:**
> "Three starting points. Pick the one that matches where you are."

---

### 5. `src/pages/index.astro` — slogan fragment

**Before:**
> "Focusing On Meaningful Conversations That Lead To Exceptional Property Outcomes."

Problems:
- Corporate title case on a non-title.
- "Meaningful Conversations" / "Exceptional Property Outcomes" could be any agency in any city. Zero specificity.

**After:** Either delete entirely (the page does not need it) or replace with something concrete:
> "The conversations before the listing are where the result is decided."

---

### 6. `src/pages/index.astro` — SEO suburb list reads unnaturally

**Before:**
> "Daniel specialises in Brisbane's inner east and south, including Bulimba, Hawthorne, Balmoral, Norman Park, Camp Hill, Seven Hills, Morningside, Murarrie, Cannon Hill, Carina, Coorparoo, East Brisbane and surrounding suburbs."

Problems:
- This is SEO keyword stuffing disguised as a sentence.
- Reads like every local landing page from every other agent.

**After:** Keep the suburb coverage for schema and the site footer, but rewrite the prose:
> "Daniel works across the inner east and south corridor from Bulimba through to Carina. Every suburb page on the site has the specific buyer-pool notes, recent sold activity, and the current campaign approach for that pocket."

---

### 7. `src/pages/about.astro` — tricolon in bio

**Before:**
> "Backed by a background in Property Economics and experience across sales, construction and marketing, I approach your sale with structure, strategy and a clear understanding of what drives value."

Problems:
- "sales, construction and marketing" — tricolon (OK as a list of experience, borderline).
- "structure, strategy and a clear understanding of what drives value" — ends with a loose tricolon where the third item bloats into a vague phrase.

**After:**
> "A Property Economics degree and ten years selling across the inner east. What you get is a structured approach to your sale, and a frank read on what buyers are actually paying in your street."

---

### 8. `src/pages/reviews.astro` — recursive tricolon

**Before:**
> "The feedback I receive consistently comes back to three things: honest advice from the start, genuine communication during the campaign, and results that reflected the preparation that went in beforehand."

Problems:
- "consistently comes back to three things" followed by a tricolon — classic AI cadence.
- "the preparation that went in beforehand" is redundant (preparation by definition goes in beforehand).

**After:**
> "Clients tend to raise the same three things in their feedback: the advice was honest up front, the communication did not drop off mid-campaign, and the final result reflected the preparation."

(A tricolon is retained because the paragraph explicitly announces three things. But the phrasing is tightened.)

---

### 9. `src/pages/reviews.astro` — "X, not Y" rhetoric

**Before:**
> "A conversation that starts with the numbers, not the pitch."

Problems:
- Classic AI "X, not Y" closer. Sounds clever, commits to nothing specific.

**After:**
> "The first conversation is about comparable sales and where your property sits. The pitch happens later, if at all."

---

### 10. `src/components/Method.astro` — "X, not Y" in Method copy

**Before:**
> "Inspection structure designed to generate real urgency, not the performative kind."

Problems:
- "not the performative kind" is the contrastive AI pattern.

**After:**
> "Inspection structure designed to put multiple buyers in the same room in the first two weeks. Urgency comes from genuine competition, or it does not exist."

---

## Insight articles (pattern-level findings)

### 11. `src/pages/insights/interest-rates-brisbane-property-prices-sellers.astro` — generic framing

**Before:**
> "After every RBA decision, the commentary machine runs hot. Headlines declare property markets will surge or stumble depending on whether rates moved up, down, or held steady. Sellers trying to time their campaigns around rate announcements face a fog of opinion and conflicting forecasts."

Problems:
- "commentary machine runs hot" is the kind of phrase that reads as filler.
- "surge or stumble" is alliterative bait.
- "a fog of opinion and conflicting forecasts" is scene-setting that does not land in anything specific.

**After:**
> "Rate decisions produce a lot of commentary. Most of it is not useful for a seller trying to decide whether to list this quarter. What actually matters is the flow-through to buyer borrowing capacity, not the headline."

---

### 12. `src/pages/insights/rba-interest-rates-effect-brisbane-property-sellers.astro` — opener cliché

**Before:**
> "When the Reserve Bank of Australia moves the cash rate, property markets respond. The mechanism is direct: rates affect how much buyers can borrow, which affects how many buyers can genuinely compete for a property at a given price."

Problems:
- "When X happens, Y responds" followed by a colon lead-in is a known AI structure.
- "the mechanism is direct" reads generic.

**After:**
> "Cash rate decisions flow through to property campaigns via one mechanism: how much a qualified buyer can borrow. That changes who shows up to your open home at your price point, and how hard they compete when they do."

---

### 13. `src/pages/insights/brisbane-2032-olympics-property-values-inner-east.astro` — stacked parallelism

**Before:**
> "Proximity to the CBD, established Queenslander housing stock, good schools, and improving transport have made suburbs like Woolloongabba, East Brisbane, Kangaroo Point, and Norman Park consistently attractive to buyers."

Problems:
- Four-part parallel structure used as scene-setting.
- "consistently attractive to buyers" is generic.

**After:**
> "Woolloongabba, East Brisbane, Kangaroo Point, and Norman Park have all performed well over the past decade for the same basic reasons: they are close to the CBD, they hold character housing stock, and new transport is going in."

(The factual content of this article still needs a structural rewrite — see Audit 01 D1. This is only a prose-level fix.)

---

### 14. Em dashes and clause-separator hyphens — repo-wide scan

**Method:**
```
grep -rn "—" src/pages/ | wc -l
grep -rn " -- " src/pages/ | wc -l
grep -rnE " - [A-Z]" src/pages/ | head
```

**Findings:**
- Em dashes appear in `src/pages/results.astro` were cleaned during the SEO rebrand commit (see `/audit/` commit history). Repo is now em-dash-free in main content files as of build 8a52f26.
- The `Ray White - The Collective` brand uses a clause-separator hyphen pattern, but it is a proper brand name and should not be rewritten.
- **No action needed on em dashes; the pre-commit hook enforces this.**

---

### 15. Generic closing paragraphs across multiple articles

**Pattern:** Articles on `land-tax-selling-queensland`, `capital-gains-tax-selling-home-queensland-main-residence-exemption`, and several `selling-in-{suburb}` guides end with a near-identical template:

> "Thinking about selling? Daniel can give you an honest assessment of your property's value and what a sale campaign involves, including referrals to local solicitors and accountants who handle property transactions. Get in touch."

**Problem:** The same generic closer appears across many articles. It is not terrible copy, but it breaks the reader's expectation of a specific per-article close.

**Recommended approach:** Give each suburb guide and each topical article a close that is tied to the article's content. Examples:

- For `land-tax-selling-queensland.astro`: "Before you list an investment property, ask your conveyancer to apply for the land tax clearance certificate the day the contract is signed. If you are not sure whether your current land tax position is clean, a twenty-minute call with Daniel will surface whether this is a flag to manage now, or a non-issue."
- For `selling-in-carina.astro`: "If you are in Carina and the Camp Hill school catchment matters to your sale, we should talk about pricing relative to Camp Hill comparables, not Carina averages. That is how the premium shows up in offers."

Pattern rewrites take longer than a line edit. Flag this for the content refresh cycle.

---

## Filler words

I searched for common filler intensifiers across `src/pages/insights/*.astro`:

| Word | Hits | Assessment |
|---|---|---|
| very | ~40 | Most are in phrases like "very different" where a stronger word (markedly, materially) would be sharper. Not urgent. |
| really | ~15 | Usually in conversational "really matters" — keep where the tone is genuinely conversational, cut where it is filler. |
| truly | ~5 | Always cut. |
| incredibly | ~2 | Cut. |
| quite | ~10 | Cut where it softens a definite claim. |

**Recommendation:** Run a single-pass filler sweep during the next content refresh. Cut "truly", "incredibly", and any "really" that is not doing conversational work. Replace "very" with a more specific word or cut.

---

## Words and structures to watch for in future drafts

Phrases the brief flagged that I **did not find** in the site copy (good result; means the existing voice is already disciplined):

- "in today's fast-paced market"
- "navigate the complexities"
- "unlock the potential"
- "delve into"
- "it's worth noting"
- "when it comes to"
- "in the realm of"
- "game-changer"
- "leverage" (as a verb)
- "robust"
- "seamless"
- "tapestry"
- "crucial" and "vital" are sparse

Phrases I **did find** and flagged (see items above):

- "Whether you are X, Y, or Z" (at least three instances)
- Stacked tricolons in positioning copy
- Generic corporate phrases ("meaningful conversations", "exceptional outcomes", "deep knowledge")
- "X, not Y" rhetorical contrast

---

## Summary count

| Category | Issues flagged |
|---|---|
| Core-page rewrites (homepage, about, brisbane-inner-east, property-worth, reviews, Method component) | 10 |
| Insight-article prose rewrites | 3 |
| Repo-wide pattern findings (closers, filler words) | 2 |
| **Total discrete rewrites** | **13 specific rewrites + 2 pattern-level recommendations** |

**Highest-impact fixes:** #1, #2, #5 (the brisbane-inner-east "whether" opener, the "rhythm" cliché, and the homepage "meaningful conversations" slogan). These appear on the site's most-trafficked pages and carry the highest reader surface area.
