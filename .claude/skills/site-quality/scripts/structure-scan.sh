#!/usr/bin/env bash
# Article/page structure scan for danielgierach.com
# Detects: insights articles missing AuthorBio, missing hero, articles with no body content.

set -uo pipefail

ROOT="${1:-/Users/danielgierach/DanielGierachProperty}"
cd "$ROOT" || exit 1

echo "# Structure scan results"
echo ""

INSIGHTS=$(find src/pages/insights -name "*.astro" 2>/dev/null)

echo "## WARN: Insights articles missing <AuthorBio />"
echo "$INSIGHTS" | while IFS= read -r f; do
  if ! grep -q 'AuthorBio' "$f"; then
    echo "WARN   $f:1  NO_AUTHOR_BIO"
  fi
done | head -50
echo ""

echo "## WARN: Insights articles missing hero block (eyebrow)"
echo "$INSIGHTS" | while IFS= read -r f; do
  if ! grep -qE '(min read|min-read)' "$f"; then
    echo "WARN   $f:1  NO_HERO_EYEBROW"
  fi
done | head -50
echo ""

echo "## INFO: Pages with no <h1>"
find src/pages -name "*.astro" 2>/dev/null | while IFS= read -r f; do
  if ! grep -qE '<h1[^>]*>' "$f"; then
    echo "INFO   $f:1  NO_H1"
  fi
done | head -50
echo ""

echo "## INFO: Images without alt attribute"
grep -rnHE '<img [^>]*src=' src/pages src/components src/layouts 2>/dev/null | grep -v 'alt=' | head -30 | while IFS= read -r line; do
  echo "INFO   $line  IMG_NO_ALT"
done
echo ""

echo "## Done."
