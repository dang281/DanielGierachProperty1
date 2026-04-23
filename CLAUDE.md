# Global Rules — Daniel Gierach Property

These rules apply to every agent, every file, every piece of copy produced in this repository.
No exceptions. No overrides.

---

## 🔴 CHANGE REQUESTS — ALWAYS FIRST

**Any open change request from Daniel takes priority over all scheduled or planned work. No exceptions.**

Every agent that runs must:

1. Check **both** inbox endpoints at the start of every run:
   - `GET /api/agents/me/inbox-lite` (agent-assigned items)
   - `GET /api/companies/{companyId}/issues?status=todo,in_progress,blocked` (full project board — catches change requests assigned to Daniel directly)
2. If any change request is open, stop all other work and action it first.
3. If the change request has `assigneeAgentId: null`, self-assign immediately: `PATCH /api/issues/{issueId}` with `{"assigneeAgentId": "{your-id}", "status": "in_progress"}`. **Note: the correct endpoint is `/api/issues/{id}` — NOT `/api/companies/{companyId}/issues/{id}`.**
4. If the change request has no description, derive the action from the issue title: find the matching file in the repo, read it, and fix what is obviously wrong (past publish date, wrong branding, stale stats, draft visual on a text-only post).
5. After making the change: commit, push (`git push dang281 main`), mark the issue done (`PATCH /api/issues/{id}` with `{"status": "done"}`).
6. Do not mark a change request as complete until the change has been made, pushed, and Supabase sync confirmed via `/tmp/supabase-sync.log`.
7. Only proceed with scheduled work once the change request queue is empty.

**Why this rule exists:** Agents checking only `/api/agents/me/inbox-lite` miss change requests assigned to Daniel directly (these have `assigneeAgentId: null`). This caused open requests to sit ignored for days. Both calls are mandatory on every run. The full board scan is what catches Daniel's directly-created change requests.

---

## SOCIAL MEDIA CONTENT

Suspension lifted by Daniel on 2026-04-23. Social media content creation is permitted again under the rules below.

- New LinkedIn and Facebook post files may be created in `content/social/` (and `content/social/facebook/` for Facebook).
- The content calendar may be extended into 2027 and beyond.
- The LinkedIn daily scout and weekly planner may run.
- All existing rules on writing style, voice, brand, banned phrases, em-dashes, visual generation, hashtag count, and template selection by day still apply (see the rest of this file).

If you are creating a scheduled post, confirm the day of the week against the template rules in "TEMPLATE SELECTION BY DAY — MANDATORY" below. Do not infer the template from the title alone.

---

## WRITING — WHAT IS BANNED

### Em-dashes and clause-separator hyphens
**Never use an em-dash (—).** Not in captions, article copy, visual body text, notes, headlines, or any output written for Daniel. Em-dashes are the single most common AI writing tell. They are never used in good Australian property writing.

**Never use a hyphen as a clause separator (` - ` with spaces).** This is the same pattern as an em-dash, just with a different character. It is equally an AI tell.

❌ "Selling a home in Bulimba - the timing matters"
❌ "It is not just financial - the decision is emotional"

If you are tempted to write either, rewrite the sentence instead:
- Use a full stop and start a new sentence
- Use a colon
- Use a comma
- Cut the clause entirely if it is not earning its place

**Hyphens in compound words are correct and should be kept:** owner-occupier, first-home buyer, well-maintained, off-market, long-term, etc.

This also applies to all arguments passed to `scripts/screenshot-linkedin.mjs`. The script strips em-dashes automatically at render time, but do not rely on that. Write clean copy from the start.

### AI Slop — Banned phrases and patterns

The following are prohibited in any output:

**Opener clichés:**
- "I've been thinking about..."
- "Something I've noticed..."
- "Let's be honest..."
- "Here's the thing..."
- "It's no secret that..."
- "In today's market..."
- "As we navigate..."
- Starting any sentence with "Navigating"
- "I wanted to share..."
- "This one is important..."

**Hype and filler words:**
- exciting, thrilled, proud, delighted, honoured, humbled
- game-changer, game-changing
- incredible, amazing, phenomenal
- opportunity knocks, don't miss out, act fast, act now
- hidden gem, tightly held, rarely available
- seamless, robust, holistic, bespoke, curated, elevate, leverage
- transformative, impactful, innovative, disruptive

**Agent clichés:**
- "I am pleased to announce..."
- "It is with great pleasure..."
- "Results speak for themselves"
- "The market is always changing"
- "Every property is unique"
- "Now more than ever..."
- "In a competitive market..."

**Structural AI tells:**
- Three-part lists where every item has the same rhythm (especially if they end with the same word)
- Sentences that start with "Whether you are..."
- Closing with "If you have any questions, feel free to reach out"
- Using bullet points in LinkedIn captions (prose only — no exceptions)
- Paragraphs that open with a bold summary sentence followed by explanation

**Punctuation and formatting tells:**
- Bold text mid-sentence for emphasis in captions or article copy
- Multiple exclamation marks
- Unnecessary capitalisation of common nouns
- Semicolons in casual copy
- Ellipses (...) used for dramatic effect

---

## CAPTION RULES (LinkedIn and Facebook)

**Do:**
- Open with a specific fact, observation, or data point — not a question, not "I've been thinking"
- Write in short paragraphs (2 to 4 sentences maximum each)
- Be suburb-specific where possible: name streets, schools, landmarks
- End with one low-pressure CTA: `danielgierach.com` or a direct question to the reader
- Write like the smartest, most honest agent in the room

**Do not:**
- Write more than 300 words (LinkedIn) or 260 words (Facebook)
- Use more than 5 hashtags on LinkedIn (LinkedIn penalises posts with 6 or more)
- Use more than 5 hashtags on Facebook
- Always include #DanielGierach
- Always include one geographic tag
- Sound salesy. Ever.

---

## FACTS AND ACCURACY

- Every external statistic must have a source URL in Notes for Daniel
- Every unverified claim must carry a ⚠️ VERIFY flag before it reaches Daniel
- No invented sales prices, median figures, or growth percentages
- If a credible source cannot be found, omit the stat entirely and note why

---

## TONE

Daniel is calm, precise, and direct. He is never performative. He is the most knowledgeable person in the room and does not need to prove it.

Good copy sounds like it was written by a sharp person who happens to know a lot about Brisbane property. Bad copy sounds like it was written by software trying to sound like a sharp person.

When in doubt: shorter sentences, plainer words, one idea per paragraph.

---

## FIELD GUIDE SERIES — ISSUE NUMBERING

The Field Guide is Daniel's article series. Each article-cover visual has a large issue number (01, 02, 03...). The number must be sequential — no gaps, no repeats.

**Before generating any article-cover visual, you must find the current highest issue number:**

```bash
grep -r "Field Guide Issue" /Users/danielgierach/DanielGierachProperty/content/social/ \
  --include="*.md" -h | grep -oE '[0-9]+' | sort -n | tail -1
```

The next issue number is that result plus one, zero-padded to two digits (e.g. 03 → 04).

Then pass it to the screenshot script:
```bash
node /Users/danielgierach/DanielGierachProperty/scripts/screenshot-linkedin.mjs \
  --type article-cover \
  --issue "04" \
  --headline "..." \
  --tagline "..." \
  --readtime "5 MIN READ" \
  --date "YYYY-MM-DD" \
  --out /Users/danielgierach/DanielGierachProperty/content/social/images/YYYY-MM-DD-article-cover.png
```

After generating, add `**Series:** Field Guide Issue 04` to the post markdown file so the next agent can find it.

**If the grep returns nothing:** the first issue is 01.

---

## VISUAL GENERATION — RULES

- All LinkedIn and Facebook visuals are generated via `scripts/screenshot-linkedin.mjs`. Do not use Canva.
- Never pass em-dashes, markdown formatting, or HTML tags to the screenshot script arguments.
- Body text passed to `--body` or `--excerpt` must be plain prose, maximum 220 characters for `--body` and 180 characters for `--excerpt`.
- For `--type market` posts, always pass `--keyword` with one important word from the headline (a noun or adjective, not a stop word). That word will render in gold italic in the visual. Choose the most specific or meaningful word — e.g. `--keyword "unconditional"` or `--keyword "settlement"`. Never pass a short or generic word like "the", "what", or "how".
- After generating a PNG, confirm the file exists before updating the markdown file.
- Set `**Visual status:** Ready` and `**Image:** content/social/images/[filename].png` in the post file.
- Remove any `**Canva URL:**` field from post files.

### TEMPLATE SELECTION BY DAY — MANDATORY

The post's scheduled day determines the template. The title alone does not override this.

| Day       | Template       | Script flag              |
|-----------|----------------|--------------------------|
| Tuesday   | `market`       | `--type market`          |
| Wednesday | (poll — no visual needed) | —           |
| Thursday  | `article-cover` (first run) then `article` | `--type article-cover` or `--type article` |

**Tuesday posts ALWAYS use `--type market`.** This is a hard rule. Even if the title contains "Field Guide" or "Article Feature", Tuesday is a market/authority post. The article-cover template (with the issue number) is reserved for Thursday article features only.

**Thursday posts ALWAYS use an article template** (`article-cover` for the primary visual, `article` for the alternate). Do not use `market` on a Thursday.

Agents must check `**Publish date:**` and derive the day of week before selecting a template. Never infer the template from the title alone.

---

## BRAND

- Colours: Charcoal `#0a0806` · Cream `#f0ece4` · Gold `#c4912a`
- No red anywhere
- No Ray White corporate colours in any visual
- Footer text: "Ray White Collective" (not "Ray White Bulimba", not "Licensed Real Estate Agent · Ray White Bulimba")
- Website: `danielgierach.com` (no trailing slash, no www)
- Always post from Daniel's personal LinkedIn profile, not the agency page

---

## BEFORE YOU COMMIT

Run through this check mentally on every file you write or edit:

- [ ] No em-dashes anywhere in the copy
- [ ] No banned phrases from the AI slop list above
- [ ] No unverified stats without a ⚠️ VERIFY flag
- [ ] Tone matches Daniel: calm, specific, no hype
- [ ] Footer says "Ray White Collective"
- [ ] Article-cover visuals use the correct next issue number (run the grep first)
- [ ] PNG file confirmed to exist before marking Visual status as Ready
- [ ] `content/polls.md` updated if a poll was used
- [ ] `content/suburb-queue.md` updated if a suburb spotlight was written
