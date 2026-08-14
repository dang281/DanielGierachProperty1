#!/bin/bash
# Property Alerts runner: executes the Property Alerts Agent instructions
# (REA saved-search emails -> property_alerts in Supabase -> outreach matches)
# twice daily via cron. Replaces Paperclip's claude_local adapter, which broke
# when Paperclip moved to Fly.io (July 2026): the Fly VM has no Claude CLI and
# no access to this Mac's Gmail/paths, so agent triggers piled up "blocked"
# and the table silently stopped updating after 2026-06-09.

set -e

LOG="$HOME/Library/Logs/property-alerts.log"
LOCK="/tmp/property-alerts.lock"
INSTRUCTIONS="$HOME/.paperclip/instances/default/companies/e01db3e8-fb70-4c7a-b7a7-495c1df05882/agents/3e81a60f-57f1-49e9-8b15-8f1685060d4f/instructions/AGENTS.md"

# cron's PATH has no nvm node; resolve claude from the newest nvm install
# (same pattern as run-social-agent.sh / quarterly-nightly.sh).
NVM_NODE_BIN="$(ls -td "$HOME"/.nvm/versions/node/*/bin 2>/dev/null | head -1 || true)"
export PATH="${NVM_NODE_BIN:+$NVM_NODE_BIN:}/opt/homebrew/bin:/usr/local/bin:$PATH"
CLAUDE="$(command -v claude || echo "$HOME/.local/bin/claude")"

exec >> "$LOG" 2>&1
echo "=== Property Alerts run: $(date) ==="

if [ -e "$LOCK" ]; then echo "lock present, skipping"; exit 0; fi
touch "$LOCK"
trap 'rm -f "$LOCK"' EXIT

if [ ! -f "$INSTRUCTIONS" ]; then
  echo "FATAL: instructions file missing: $INSTRUCTIONS"
  exit 1
fi

PAPERCLIP_KEY="$(grep '^PAPERCLIP_API_KEY' "$HOME/dg-dashboard/.env.local" | cut -d= -f2)"

"$CLAUDE" --print --dangerously-skip-permissions -p "
You are the Property Alerts Agent running headless on Daniel's Mac via cron.

Read and follow these instructions exactly: $INSTRUCTIONS

Overrides to those instructions (the deployment changed since they were written):
1. Paperclip now lives at https://dg-paperclip.fly.dev (NOT 127.0.0.1:3100). Every Paperclip API request needs the header: Authorization: Bearer $PAPERCLIP_KEY
2. Use the claude.ai Gmail MCP tools (load them via ToolSearch) for the Gmail searches.
3. After completing the run and posting the daily report issue, find any open Paperclip issues titled 'Property Alerts — twice-daily Gmail check + Supabase sync' (GET /api/companies/{companyId}/issues?status=todo,in_progress,blocked, companyId is in the instructions' Paperclip URLs or use the one on the report you post) and mark each done via PATCH /api/issues/{id} with {\"status\": \"done\"} — they are stale scheduler triggers from the broken claude_local era.
4. Never send email or SMS. Draft only, per the safety rules in the instructions.
"

echo "=== done: $(date) ==="
