#!/usr/bin/env bash
# Internal link integrity scan for danielgierach.com
# Detects href="/insights/<slug>" where the target file does not exist.
# Output: SEVERITY  PATH:LINE  RULE  HREF

set -uo pipefail

ROOT="${1:-/Users/danielgierach/DanielGierachProperty}"
cd "$ROOT" || exit 1

echo "# Internal links scan results"
echo ""

# Build a list of valid slugs for each section.
INSIGHTS_SLUGS=$(ls src/pages/insights/*.astro 2>/dev/null | xargs -n1 basename | sed 's/\.astro$//' | sort -u)
SUBURB_SLUGS=$(ls src/pages/suburbs/*.astro 2>/dev/null | xargs -n1 basename | sed 's/\.astro$//' | sort -u)
TOOL_SLUGS=$(ls src/pages/tools/*.astro 2>/dev/null | xargs -n1 basename | sed 's/\.astro$//' | sort -u)
TOP_SLUGS=$(ls src/pages/*.astro 2>/dev/null | xargs -n1 basename | sed 's/\.astro$//' | sort -u)

check_section() {
  local section="$1"
  local valid_slugs="$2"
  echo "## BLOCK: Broken /${section}/ links"
  # Find all hrefs to /<section>/<slug>
  grep -rnHE "href=\"/${section}/[a-z0-9-]+\"" src/pages src/components src/layouts 2>/dev/null | while IFS= read -r line; do
    href=$(echo "$line" | grep -oE "href=\"/${section}/[a-z0-9-]+\"" | head -1 | sed -E "s|href=\"/${section}/([a-z0-9-]+)\"|\1|")
    if [ -n "$href" ] && ! echo "$valid_slugs" | grep -qx "$href"; then
      echo "BLOCK  $line  DEAD_LINK: /${section}/${href}"
    fi
  done
  echo ""
}

check_section "insights" "$INSIGHTS_SLUGS"
check_section "suburbs" "$SUBURB_SLUGS"
check_section "tools" "$TOOL_SLUGS"

# Top-level page links
echo "## BLOCK: Broken top-level links"
grep -rnHE 'href="/[a-z0-9-]+"' src/pages src/components src/layouts 2>/dev/null | grep -vE '/(insights|suburbs|tools|lp|api)/' | while IFS= read -r line; do
  href=$(echo "$line" | grep -oE 'href="/[a-z0-9-]+"' | head -1 | sed -E 's|href="/([a-z0-9-]+)"|\1|')
  if [ -n "$href" ] && ! echo "$TOP_SLUGS" | grep -qx "$href"; then
    # Allowlist common runtime paths that aren't pages
    case "$href" in
      "" | "rss.xml" | "sitemap.xml" | "robots.txt") continue ;;
      *)
        if [ ! -d "src/pages/$href" ] && [ ! -f "src/pages/${href}.astro" ]; then
          echo "BLOCK  $line  DEAD_LINK: /${href}"
        fi
        ;;
    esac
  fi
done
echo ""

# http:// instead of https://
echo "## WARN: Insecure http:// links"
grep -rnHE 'href="http://' src/pages src/components src/layouts 2>/dev/null | head -50 | while IFS= read -r line; do
  echo "WARN   $line  INSECURE_LINK"
done
echo ""

echo "## Done."
