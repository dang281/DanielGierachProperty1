#!/usr/bin/env bash
# Voice violation scanner for danielgierach.com
# Detects em-dashes, clause-separator hyphens, AI slop, banned phrases.
# Output format: SEVERITY  PATH:LINE  RULE  SNIPPET

set -uo pipefail

ROOT="${1:-/Users/danielgierach/DanielGierachProperty}"
cd "$ROOT" || exit 1

# Paths to scan: site source only. Skip dist, node_modules, dashboard, published social posts.
SCAN_PATHS=(
  "src/pages"
  "src/layouts"
  "src/components"
)

EXCLUDE_DIRS=(
  "node_modules"
  "dist"
  ".astro"
  ".vercel"
  "dashboard"
)

# Build exclude args for find
EXCLUDE_ARGS=()
for d in "${EXCLUDE_DIRS[@]}"; do
  EXCLUDE_ARGS+=(-not -path "*/${d}/*")
done

FILES=$(find "${SCAN_PATHS[@]}" \( -name "*.astro" -o -name "*.md" -o -name "*.mdx" -o -name "*.html" \) "${EXCLUDE_ARGS[@]}" 2>/dev/null)

# ---- BLOCK rules (hard fail) ----

echo "# Voice scan results"
echo ""

# Em-dash
echo "## BLOCK: Em-dashes"
echo "$FILES" | xargs grep -nH '—' 2>/dev/null | head -100 | while IFS= read -r line; do
  echo "BLOCK  $line  EM_DASH"
done
echo ""

# Clause-separator hyphen ( - with spaces both sides) inside text content (not in HTML/CSS)
echo "## BLOCK: Clause-separator hyphens"
echo "$FILES" | xargs grep -nHE '[a-zA-Z] - [a-zA-Z]' 2>/dev/null | grep -v 'style=' | grep -v 'class=' | grep -v 'href=' | head -100 | while IFS= read -r line; do
  echo "BLOCK  $line  HYPHEN_AS_DASH"
done
echo ""

# Whether you are... sentence starter
echo "## BLOCK: Whether-you-are openers"
echo "$FILES" | xargs grep -nHEi '(^|[>.!?] )Whether you are' 2>/dev/null | head -50 | while IFS= read -r line; do
  echo "BLOCK  $line  WHETHER_YOU_ARE"
done
echo ""

# ---- WARN rules ----

echo "## WARN: AI slop opener phrases"
BANNED_OPENERS=(
  "I have been thinking"
  "I've been thinking"
  "Let's be honest"
  "Here's the thing"
  "It's no secret"
  "In today's market"
  "As we navigate"
  "I wanted to share"
  "This one is important"
  "Navigating"
)
for phrase in "${BANNED_OPENERS[@]}"; do
  echo "$FILES" | xargs grep -niH "$phrase" 2>/dev/null | head -20 | while IFS= read -r line; do
    echo "WARN   $line  OPENER: $phrase"
  done
done
echo ""

echo "## WARN: Hype and filler words"
HYPE_WORDS=(
  " exciting "
  " thrilled "
  " delighted "
  " honoured "
  " humbled "
  " game-changer"
  " game-changing"
  " incredible "
  " amazing "
  " phenomenal "
  " hidden gem"
  " tightly held"
  " seamless"
  " robust"
  " holistic"
  " bespoke"
  " curated"
  " elevate "
  " transformative"
  " impactful"
  " disruptive"
)
for word in "${HYPE_WORDS[@]}"; do
  echo "$FILES" | xargs grep -niH "$word" 2>/dev/null | head -10 | while IFS= read -r line; do
    echo "WARN   $line  HYPE: $word"
  done
done
echo ""

echo "## WARN: Agent clichés"
CLICHES=(
  "I am pleased to announce"
  "It is with great pleasure"
  "Results speak for themselves"
  "The market is always changing"
  "Every property is unique"
  "Now more than ever"
  "In a competitive market"
  "feel free to reach out"
)
for phrase in "${CLICHES[@]}"; do
  echo "$FILES" | xargs grep -niH "$phrase" 2>/dev/null | head -10 | while IFS= read -r line; do
    echo "WARN   $line  CLICHE: $phrase"
  done
done
echo ""

echo "## WARN: Wrong agency name (should be Ray White Collective)"
echo "$FILES" | xargs grep -nH 'Ray White Bulimba' 2>/dev/null | head -20 | while IFS= read -r line; do
  echo "WARN   $line  WRONG_AGENCY"
done
echo ""

echo "## INFO: Multiple exclamation marks"
echo "$FILES" | xargs grep -nHE '!!' 2>/dev/null | head -20 | while IFS= read -r line; do
  echo "INFO   $line  MULTI_EXCLAIM"
done
echo ""

echo "## Done."
