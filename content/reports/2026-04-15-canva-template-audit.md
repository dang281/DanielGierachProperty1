# Agent Report - Canva Template Audit

**Agent:** social-media
**Date:** 2026-04-15
**Run time:** 21:57 AEST (Wednesday, off-peak)
**Type:** Maintenance audit

---

## Summary

This run found a critical issue with the Canva design workflow. The master template design `DAHGjv8sW3w` has been overwritten with Morningside suburb spotlight content and is no longer a blank brand template.

---

## What Was Found

### 1. Master Template Corrupted

Design ID `DAHGjv8sW3w` (referenced throughout AGENTS.md as the master brand template) now contains:

- Title: "2028-05-27 morningside-suburb-spotlight"
- Content: MORNINGSIDE suburb spotlight text, Morningside-specific stats, wrong CTA URL

**Current state confirmed via `get-design-content`:**
> "MORNINGSIDE / Daniel Gierach Ray White Bulimba danielgierach.com / Suburb Spotlight / Median house ~$1.65M / Strong auctions, inner-east lifestyle / danielgierach.com/suburbs/morningside"

This is NOT the blank dark-charcoal brand template it should be.

### 2. Why This Happened

The AGENTS.md workflow instructs the agent to call `commit-editing-transaction` with a `title` parameter to "save as a new design". However, the actual `commit-editing-transaction` tool **does not have a `title` parameter**. It only accepts `transaction_id`.

This means every time a previous run "created a new design from the template", it was actually:
- Starting a transaction on the master template `DAHGjv8sW3w`
- Replacing the text
- Saving those changes back to `DAHGjv8sW3w` (overwriting it)
- Not creating any separate design

The shortlink URLs stored in each post's markdown file (e.g. `https://www.canva.com/d/hob6L7CE74XSDe8`) could not be verified - the API returned 307 redirects. It is unclear whether these shortlinks point to genuinely separate designs or all resolve to the same master template.

### 3. What Needs to Happen (for Daniel)

**Immediate:** Open Canva and check the design at:
https://www.canva.com/design/DAHGjv8sW3w/edit

If it shows Morningside content (not a blank template), the master template is gone.

**To restore:** Duplicate one of the existing correctly-branded social post designs before it gets overwritten, and save the new design ID as the master template. Update AGENTS.md with the new design ID.

**For each upcoming post with a Canva URL:** Open the linked design to confirm it shows the correct content (not Morningside). If any post's Canva link shows the wrong content, a replacement design will need to be made before that post goes live.

### 4. Correct Canva Workflow Going Forward

To create separate designs (not overwrite the master), the agent should NOT use `start-editing-transaction` on the master template. Instead:

**Option A - Canva manual duplicate:** Daniel duplicates the master template in Canva manually and gives the agent the new duplicate's design ID. The agent then edits the duplicate.

**Option B - Use `generate-design-structured`:** Generate AI-produced designs with brand specs rather than template-based editing. Less reliable for brand consistency but creates genuinely separate designs.

Until this is resolved, this agent will NOT attempt Canva design creation to avoid further corruption.

---

## Calendar Health Check (Separate Finding)

The LinkedIn content calendar is fully populated through **31 December 2026**, with all posts correctly placed on Tuesday (authority/market), Wednesday (poll), Thursday (article). No gaps found in the next 3 weeks.

Posts ready for next week:
- Tue 21 Apr: Two rate hikes and Brisbane's resilience (has design)
- Wed 22 Apr: Poll - Brisbane property still running? (no design needed)
- Thu 23 Apr: Article - Auction vs Private Treaty (has design)

One issue noted for the May 5 Tuesday post (`2026-05-05-linkedin-market-timing.md`): marked "Visual status: Not needed" but Tuesday authority posts should have a Canva visual. This should be addressed once the template situation is resolved.

The May 7 Thursday post (`2026-05-07-linkedin-article-settlement-day.md`) has an expired S3 thumbnail URL. Daniel's dashboard preview for this post may be broken. The Canva design link (`https://www.canva.com/d/LhR--aTKQ9QQ1Dw`) should still work for his review.

---

## Action Required From Daniel

1. Check the master template design (link above) and confirm whether it shows Morningside content or the blank brand template.
2. If corrupted: restore or recreate the master template and provide the new design ID.
3. Spot-check 2-3 upcoming post Canva links to confirm they show correct designs.
4. Once design ID is confirmed, update AGENTS.md with the correct workflow.
