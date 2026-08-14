#!/bin/bash
# Daily social media agent run
# Checks Paperclip inbox, actions change requests, then does scheduled content work

set -e

LOG="/tmp/social-agent-$(date +%Y-%m-%d).log"
REPO="/Users/danielgierach/DanielGierachProperty"

# cron's PATH has no nvm node, and the native ~/.local/bin/claude install was
# removed (Jul 2026), which silently killed every run with "No such file or
# directory". Resolve claude from the newest nvm node install instead, and put
# that bin dir on PATH so node itself resolves too.
NVM_NODE_BIN="$(ls -td "$HOME"/.nvm/versions/node/*/bin 2>/dev/null | head -1 || true)"
export PATH="${NVM_NODE_BIN:+$NVM_NODE_BIN:}/opt/homebrew/bin:/usr/local/bin:$PATH"
CLAUDE="$(command -v claude || echo "$HOME/.local/bin/claude")"

echo "=== Social agent run: $(date) ===" >> "$LOG"

cd "$REPO"

"$CLAUDE" --print -p "
You are the social media content agent for Daniel Gierach Property. Run your full daily workflow now.

IMPORTANT: Start by reading CLAUDE.md and content/daniel-voice-calibration.md before doing anything else.

## Step 1 — Change requests (mandatory, do first)
Check BOTH Paperclip endpoints:
- GET http://127.0.0.1:3100/api/agents/me/inbox-lite
- GET http://127.0.0.1:3100/api/companies/e01db3e8-fb70-4c7a-b7a7-495c1df05882/issues?status=todo,in_progress,blocked

For every open issue:
1. Self-assign it (PATCH /api/issues/{id} with assigneeAgentId and status in_progress)
2. Find the matching post in Supabase by title (URL: https://hmwulvvwsksuyqozuxvw.supabase.co, Key: from .env SUPABASE_KEY)
3. Read the visual_feedback field for the change request text
4. Apply the changes to the caption — follow CLAUDE.md and daniel-voice-calibration.md
5. PATCH Supabase: update caption, set visual_feedback to null
6. Mark the Paperclip issue done (PATCH /api/issues/{id} with status done)

If there are no open issues, proceed to Step 2.

## Step 2 — Daily scout
Check today's date. If any posts are scheduled for the next 7 days and do not yet have a visual (visual_thumbnail is null), generate one using scripts/screenshot-linkedin.mjs following the template rules in CLAUDE.md.

## Step 3 — Content pipeline
Check the content calendar. If fewer than 14 days of posts are scheduled ahead, write the next batch of posts following the Tue/Wed/Thu schedule, reading content/polls.md and content/suburb-queue.md for the next items in rotation.

Log a summary of what was done at the end.
" >> "$LOG" 2>&1

echo "=== Done: $(date) ===" >> "$LOG"
