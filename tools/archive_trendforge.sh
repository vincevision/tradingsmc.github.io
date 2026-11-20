#!/usr/bin/env bash
# Archive TrendForge.FX's public posts to a local folder.
#
# Run this on YOUR machine (not in the Arena sandbox — the sandbox has no
# Instagram access). It needs at least one of: instaloader, gallery-dl, yt-dlp.
#   pip install instaloader gallery-dl yt-dlp     # or brew install yt-dl-gallery... see README
#
# Usage:
#   ./tools/archive_trendforge.sh [output-dir] [profile]
#     output-dir  default: archive/trendforge/downloads   (git-ignored)
#     profile     default: trendforge.fx                  (Instagram handle)
#
# What it does:
#   1. instaloader  — whole profile: every post's images/videos, caption text
#                     and JSON metadata (dates, likes, comments).
#   2. gallery-dl   — fallback full-profile pass if instaloader is missing.
#   3. yt-dlp       — downloads each reel the site embeds (known-reels.txt)
#                     as video + description + info json, so the reels the
#                     case studies quote survive even if the profile does not.
#   4. Writes manifest.txt (file list) and failed.txt (anything that errored).
#
# Instagram rate-limits and sometimes demands a login for anonymous scrapes.
# If anonymous runs fail or come back empty, log in once:
#   instaloader --login=YOUR OWN ACCOUNT          # stores a session file
# and re-run. Use your own account, never the artist's credentials.

set -uo pipefail

HERE="$(cd "$(dirname "$0")/.." && pwd)"
OUT="${1:-$HERE/archive/trendforge/downloads}"
PROFILE="${2:-trendforge.fx}"
LIST="$HERE/archive/trendforge/known-reels.txt"

mkdir -p "$OUT/profile" "$OUT/reels"
: > "$OUT/failed.txt"

echo "== TrendForge archive =="
echo "profile : $PROFILE"
echo "output  : $OUT"
echo

# 1) Full profile via instaloader (posts + captions + metadata)
if command -v instaloader >/dev/null 2>&1; then
  echo "-- instaloader: full profile --"
  instaloader \
    --dirname-pattern="$OUT/profile/{date_utc:%Y-%m-%d}_{shortcode}" \
    --filename-pattern="{shortcode}_{typename}" \
    --no-pictures-check \
    -- "$PROFILE" || echo "instaloader exited nonzero — see its output above" >> "$OUT/failed.txt"
else
  echo "instaloader not found — skipping full-profile pass (install it, or rely on gallery-dl)."
fi

# 2) Fallback full profile via gallery-dl
if command -v gallery-dl >/dev/null 2>&1; then
  if [ -z "$(ls -A "$OUT/profile" 2>/dev/null)" ]; then
    echo "-- gallery-dl: full profile (fallback) --"
    gallery-dl --directory "$OUT/profile" \
      --write-metadata \
      "https://www.instagram.com/$PROFILE/" || echo "gallery-dl failed" >> "$OUT/failed.txt"
  else
    echo "-- gallery-dl: skipped, instaloader already filled profile/ --"
  fi
else
  echo "gallery-dl not found — skipping fallback pass."
fi

# 3) The reels the site embeds, as video + description
if command -v yt-dlp >/dev/null 2>&1; then
  echo "-- yt-dlp: known reels from the site --"
  while read -r url; do
    [ -z "$url" ] && continue
    echo "   $url"
    yt-dlp --no-playlist \
      -o "$OUT/reels/%(id)s.%(ext)s" \
      --write-description --write-info-json \
      "$url" || echo "$url" >> "$OUT/failed.txt"
  done < "$LIST"
else
  echo "yt-dlp not found — reels not downloaded. Install yt-dlp and re-run."
fi

# 4) Manifest
( cd "$OUT" && find . -type f | sort > manifest.txt )
echo
echo "Done. $(wc -l < "$OUT/manifest.txt") files under $OUT"
if [ -s "$OUT/failed.txt" ]; then
  echo "Failures logged in $OUT/failed.txt:"
  cat "$OUT/failed.txt"
fi
echo
echo "Next: copy $OUT somewhere safe (Google Drive folder, external disk, private repo)."
echo "This repo is PUBLIC — never commit downloads/ here; it is git-ignored for that reason."
