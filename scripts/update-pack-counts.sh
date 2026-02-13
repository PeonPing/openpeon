#!/usr/bin/env bash
# update-pack-counts.sh — Update hardcoded pack count references across all PeonPing repos.
#
# Usage: bash scripts/update-pack-counts.sh
#
# Assumes sibling repo layout:
#   ../peon-ping/    ../og-packs/    ../registry/    ../homebrew-tap/
#
# Reads the registry index.json to get the total pack count, then updates
# all known files that reference pack counts.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
OPENPEON_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
BASE_DIR="$(cd "$OPENPEON_DIR/.." && pwd)"

PEON_PING="$BASE_DIR/peon-ping"
OG_PACKS="$BASE_DIR/og-packs"
REGISTRY="$BASE_DIR/registry"
HOMEBREW_TAP="$BASE_DIR/homebrew-tap"

# ── Get counts ────────────────────────────────────────────────────────────────

# Total packs from registry
if [[ -f "$REGISTRY/index.json" ]]; then
  TOTAL=$(python3 -c "import json; d=json.load(open('$REGISTRY/index.json')); print(len(d.get('packs', d)) if isinstance(d, dict) else len(d))")
else
  echo "Registry index.json not found at $REGISTRY/index.json"
  echo "Fetching from GitHub Pages..."
  TOTAL=$(curl -fsSL https://peonping.github.io/registry/index.json | python3 -c "import json,sys; d=json.load(sys.stdin); print(len(d.get('packs', d)) if isinstance(d, dict) else len(d))")
fi

# Official packs from og-packs
if [[ -d "$OG_PACKS" ]]; then
  OFFICIAL=$(find "$OG_PACKS" -maxdepth 2 -name "openpeon.json" | wc -l | tr -d ' ')
else
  OFFICIAL="?"
fi

echo "Pack counts: $TOTAL total (registry), $OFFICIAL official (og-packs)"
echo ""

CHANGED=0

# ── Helper ────────────────────────────────────────────────────────────────────
# Uses # as sed delimiter to avoid conflicts with | in markdown tables.
# Uses -E for extended regex (BSD sed on macOS).

update_file() {
  local file="$1"
  local pattern="$2"
  local replacement="$3"

  if [[ ! -f "$file" ]]; then
    echo "  SKIP: $file (not found)"
    return
  fi

  if grep -qE "$pattern" "$file" 2>/dev/null; then
    sed -i '' -E "s#$pattern#$replacement#g" "$file"
    echo "  UPDATED: $file"
    CHANGED=$((CHANGED + 1))
  else
    echo "  OK: $file (already up to date)"
  fi
}

# ── peon-ping ─────────────────────────────────────────────────────────────────

echo "=== peon-ping ==="

# README.md: "43+ packs across..."
update_file "$PEON_PING/README.md" \
  '[0-9]+\+ packs across' \
  "${TOTAL}+ packs across"

# CLAUDE.md: "40+ packs, tagged releases"
update_file "$PEON_PING/CLAUDE.md" \
  '\([0-9]+ packs' \
  "(${OFFICIAL}+ packs"

# docs/index.html: fallback pack-count spans
update_file "$PEON_PING/docs/index.html" \
  'class="pack-count">[0-9]+' \
  "class=\"pack-count\">${TOTAL}"

echo ""

# ── openpeon ──────────────────────────────────────────────────────────────────

echo "=== openpeon ==="

# README.md: "43+ packs" in implementations table
update_file "$OPENPEON_DIR/README.md" \
  '[0-9]+\+ packs \|' \
  "${TOTAL}+ packs |"

# README.md: "currently lists N packs"
update_file "$OPENPEON_DIR/README.md" \
  'currently lists [0-9]+ packs' \
  "currently lists ${TOTAL} packs"

# README.md: official count "All N official packs"
update_file "$OPENPEON_DIR/README.md" \
  'All [0-9]+ official packs' \
  "All ${OFFICIAL} official packs"

# README.md: "N official + M community"
COMMUNITY=$((TOTAL - OFFICIAL))
update_file "$OPENPEON_DIR/README.md" \
  '[0-9]+ official \+ [0-9]+ community' \
  "${OFFICIAL} official + ${COMMUNITY} community"

echo ""

# ── homebrew-tap ──────────────────────────────────────────────────────────────

echo "=== homebrew-tap ==="

update_file "$HOMEBREW_TAP/README.md" \
  'all [0-9]+\+ packs' \
  "all ${TOTAL}+ packs"

echo ""

# ── Summary ───────────────────────────────────────────────────────────────────

echo "Done. $CHANGED file(s) updated."
echo ""
echo "Next steps:"
echo "  1. Review changes: cd each repo and run 'git diff'"
echo "  2. Rebuild openpeon site: cd $OPENPEON_DIR/site && npm run build"
echo "  3. Commit changes in each repo"
