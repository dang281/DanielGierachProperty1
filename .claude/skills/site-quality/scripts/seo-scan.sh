#!/usr/bin/env bash
# SEO meta hygiene scan for danielgierach.com
# Detects: missing title, missing description, weak description (<60 chars), missing schema on insights articles.

set -uo pipefail

ROOT="${1:-/Users/danielgierach/DanielGierachProperty}"
cd "$ROOT" || exit 1

echo "# SEO meta scan results"
echo ""

PAGES=$(find src/pages -name "*.astro" -not -path "*/lp/*" 2>/dev/null)

echo "## BLOCK: Pages missing <Layout title>"
echo "$PAGES" | while IFS= read -r f; do
  if ! grep -qE '<Layout[^>]*title=' "$f"; then
    # Skip files that are sitemap/route generators or thank-you/dynamic pages
    if grep -qE '^(import|export)' "$f" && ! grep -qE '<Layout' "$f"; then
      continue
    fi
    if grep -qE '<Layout' "$f"; then
      echo "BLOCK  $f:1  MISSING_TITLE"
    fi
  fi
done
echo ""

echo "## BLOCK: Pages missing description"
echo "$PAGES" | while IFS= read -r f; do
  if grep -qE '<Layout' "$f" && ! grep -qE 'description=' "$f"; then
    echo "BLOCK  $f:1  MISSING_DESCRIPTION"
  fi
done
echo ""

echo "## WARN: Weak descriptions (<60 chars)"
echo "$PAGES" | while IFS= read -r f; do
  desc=$(grep -oE 'description="[^"]+"' "$f" | head -1 | sed -E 's/description="([^"]+)"/\1/')
  if [ -n "$desc" ]; then
    len=${#desc}
    if [ "$len" -lt 60 ]; then
      echo "WARN   $f:1  WEAK_DESC ($len chars): $desc"
    fi
  fi
done
echo ""

echo "## INFO: Insights articles missing FAQPage or Article schema"
find src/pages/insights -name "*.astro" 2>/dev/null | while IFS= read -r f; do
  if ! grep -qE '@type":\s*"(FAQPage|Article|HowTo|BreadcrumbList)"' "$f"; then
    echo "INFO   $f:1  NO_SCHEMA"
  fi
done | head -50
echo ""

echo "## Done."
