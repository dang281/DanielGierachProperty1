#!/bin/bash
# Property Alerts runner: executes the Property Alerts Agent instructions
# (REA saved-search emails -> property_alerts in Supabase -> outreach matches)
# twice daily via cron. Replaces Paperclip's claude_local adapter, which broke
# when Paperclip moved to Fly.io (July 2026): the Fly VM has no Claude CLI and
# no access to this Mac's Gmail/paths, so agent triggers piled up "blocked"
# and the table silently stopped updating after 2026-06-09.

set -e

# SUPERSEDED 15 Aug 2026: the REA updates now run as the claude.ai cloud
# routine "Property Alerts (REA updates) - twice daily" (has Gmail access,
# runs even when this Mac sleeps). Headless local runs can't load the Gmail
# connector, so scheduled invocations here are no-ops. FORCE=1 runs anyway
# (in-session manual use, where Gmail works).
if [ "${FORCE:-0}" != "1" ]; then
  echo "superseded by cloud routine trig_01FQ2W6yHVDg6hEaiN8CBBwE; FORCE=1 to run locally ($(date))" >> "$HOME/Library/Logs/property-alerts.log"
  exit 0
fi

LOG="$HOME/Library/Logs/property-alerts.log"
LOCK="/tmp/property-alerts.lock"
INSTRUCTIONS="$HOME/.paperclip/instances/default/companies/e01db3e8-fb70-4c7a-b7a7-495c1df05882/agents/3e81a60f-57f1-49e9-8b15-8f1685060d4f/instructions/AGENTS.md"

# cron's PATH has no nvm node; resolve claude from the newest nvm install
# (same pattern as run-social-agent.sh / quarterly-nightly.sh).
NVM_NODE_BIN="$(ls -td "$HOME"/.nvm/versions/node/*/bin 2>/dev/null | head -1 || true)"
export PATH="${NVM_NODE_BIN:+$NVM_NODE_BIN:}/opt/homebrew/bin:/usr/local/bin:$PATH"
CLAUDE="$(command -v claude || echo "$HOME/.local/bin/claude")"

# Headless auth: cron/launchd can't reach the unlocked keychain, so interactive
# login doesn't carry over ("Not logged in" failures, Aug 2026). A long-lived
# token from `claude setup-token` lives in this root-of-trust file instead.
TOKEN_FILE="$HOME/.config/claude-headless-token"
if [ -f "$TOKEN_FILE" ]; then
  export CLAUDE_CODE_OAUTH_TOKEN="$(cat "$TOKEN_FILE")"
else
  echo "FATAL: $TOKEN_FILE missing. Run 'claude setup-token' and save the token there (chmod 600)."
  exit 1
fi

exec >> "$LOG" 2>&1
echo "=== Property Alerts run: $(date) ==="

# Atomic: cron AND launchd both fire at 7:43/15:43 (macOS TCC currently blocks
# removing the redundant cron lines), so whoever wins mkdir runs; the other
# skips. mkdir is atomic where a -e check + touch races. A lock older than two
# hours is from a killed run: clear it rather than skipping forever.
if [ -e "$LOCK" ] && [ -n "$(find "$LOCK" -maxdepth 0 -mmin +120 2>/dev/null)" ]; then
  echo "clearing stale lock"
  rm -rf "$LOCK"
fi
if ! mkdir "$LOCK" 2>/dev/null; then echo "lock present, skipping"; exit 0; fi
trap 'rmdir "$LOCK" 2>/dev/null' EXIT

if [ ! -f "$INSTRUCTIONS" ]; then
  echo "FATAL: instructions file missing: $INSTRUCTIONS"
  exit 1
fi

PAPERCLIP_KEY="$(grep '^PAPERCLIP_API_KEY' "$HOME/dg-dashboard/.env.local" | cut -d= -f2)"
# RLS hardening (Aug 2026) locked the anon key out of the job tables; the sync
# now needs the service role. Same source of truth as the dashboard.
SUPABASE_SERVICE_KEY="$(grep '^SUPABASE_SERVICE_ROLE_KEY' "$HOME/dg-dashboard/.env.local" | cut -d= -f2)"

"$CLAUDE" --print --dangerously-skip-permissions -p "
You are the Property Alerts Agent running headless on Daniel's Mac via cron.

Read and follow these instructions exactly: $INSTRUCTIONS

Overrides to those instructions (the deployment changed since they were written):
1. Paperclip now lives at https://dg-paperclip.fly.dev (NOT 127.0.0.1:3100). Every Paperclip API request needs the header: Authorization: Bearer $PAPERCLIP_KEY
2. Use the claude.ai Gmail MCP tools (load them via ToolSearch) for the Gmail searches.
3. After completing the run and posting the daily report issue, find any open Paperclip issues titled 'Property Alerts — twice-daily Gmail check + Supabase sync' (GET /api/companies/{companyId}/issues?status=todo,in_progress,blocked, companyId is in the instructions' Paperclip URLs or use the one on the report you post) and mark each done via PATCH /api/issues/{id} with {\"status\": \"done\"} — they are stale scheduler triggers from the broken claude_local era.
4. Never send email or SMS. Draft only, per the safety rules in the instructions.
5. The anon Supabase key in the instructions is now blocked by RLS (reads return 0 rows). For EVERY Supabase REST call use the service-role key instead, sent as BOTH headers: apikey: $SUPABASE_SERVICE_KEY and Authorization: Bearer $SUPABASE_SERVICE_KEY. Never print this key anywhere.
6. Paperclip is a reporting channel, not a dependency: if any Paperclip request fails or times out, log the outage, SKIP the report and stale-issue steps, and still complete the full Gmail to Supabase sync. Only escalate via Gmail draft if the SYNC ITSELF cannot complete.
"

echo "=== done: $(date) ==="
