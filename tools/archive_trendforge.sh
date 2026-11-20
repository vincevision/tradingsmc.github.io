#!/usr/bin/env bash
# Archive TrendForge.FX's public posts to a local folder.
#
# Run this on YOUR machine (not in the Arena sandbox — the sandbox has no
# Instagram access). Needs at least one of: instaloader, gallery-dl, yt-dlp.
#
# Quick start (Kali/Debian block system-wide pip, so use a venv):
#   python3 -m venv .venv && source .venv/bin/activate
#   pip install instaloader gallery-dl yt-dlp
#   ./archive_trendforge.sh
# The script also finds ./.venv/bin automatically, so activation is optional.
#
# Usage:
#   ./archive_trendforge.sh [output-dir] [profile]
#     output-dir  default: archive/trendforge/downloads inside the repo,
#                 otherwise ./downloads in the current folder
#     profile     default: trendforge.fx   (https://www.instagram.com/trendforge.fx)
#
# Optional environment knobs — Instagram usually demands a login for a full
# anonymous profile scrape, so one of these is often what makes it work:
#   TF_LOGIN=yourhandle    instaloader logs in with YOUR account (prompts for
#                          your password; stores a session file for re-runs)
#   TF_BROWSER=firefox     gallery-dl and yt-dlp reuse your browser's IG
#                          cookies instead of scraping anonymously
#                          (firefox | chrome | chromium | brave | edge | safari)
# Never use the artist's credentials — only your own.
#
# What it does:
#   1. instaloader  — whole profile: every post's images/videos, caption text
#                     and JSON metadata (dates, likes, comments).
#   2. gallery-dl   — fallback full-profile pass if instaloader got nothing.
#   3. yt-dlp       — downloads each reel the site embeds as video +
#                     description + info json, so the reels the case studies
#                     quote survive even if the profile does not.
#   4. Writes manifest.txt (file list) and failed.txt (anything that errored).
#
# Exit codes: 0 = something was archived, 1 = nothing to show for it.

set -uo pipefail

HERE="$(cd "$(dirname "$0")/.." && pwd)"          # repo root, or script's parent
IN_REPO=0
[ -d "$HERE/archive/trendforge" ] && IN_REPO=1

# Pick up a local venv without requiring `source .venv/bin/activate`
for v in "$PWD/.venv/bin" "$HERE/.venv/bin"; do
  [ -d "$v" ] && PATH="$v:$PATH"
done
export PATH

if [ "$IN_REPO" = 1 ]; then
  DEFAULT_OUT="$HERE/archive/trendforge/downloads"
else
  DEFAULT_OUT="$PWD/downloads"
fi

OUT="${1:-$DEFAULT_OUT}"
PROFILE="${2:-trendforge.fx}"
LIST="$HERE/archive/trendforge/known-reels.txt"

# If run standalone (script copied out of the repo), use the reel list built in
# below so the site's embedded reels still get fetched.
if [ ! -f "$LIST" ]; then
  LIST="$(mktemp)"
  cat > "$LIST" <<'REELS'
https://www.instagram.com/reel/DfTCopEyIMP
https://www.instagram.com/reel/DfawXkcvfR-
https://www.instagram.com/reel/DfdNEBBpp_W
https://www.instagram.com/reel/Dff4yOWpaTn
https://www.instagram.com/reel/DfiefJWSTkc
https://www.instagram.com/reel/DfmbC0eJNYF
https://www.instagram.com/reel/Dfs6fKfyCIb
REELS
fi

HAVE_IL=0; HAVE_GD=0; HAVE_YT=0
command -v instaloader >/dev/null 2>&1 && HAVE_IL=1
command -v gallery-dl  >/dev/null 2>&1 && HAVE_GD=1
command -v yt-dlp      >/dev/null 2>&1 && HAVE_YT=1

if [ "$HAVE_IL" = 0 ] && [ "$HAVE_GD" = 0 ] && [ "$HAVE_YT" = 0 ]; then
  echo "ERROR: none of instaloader, gallery-dl or yt-dlp are on PATH." >&2
  echo "" >&2
  echo "Install them into a venv first (Kali/Debian refuse system-wide pip):" >&2
  echo "  python3 -m venv .venv && source .venv/bin/activate" >&2
  echo "  pip install instaloader gallery-dl yt-dlp" >&2
  echo "  ./archive_trendforge.sh" >&2
  exit 1
fi

mkdir -p "$OUT/profile" "$OUT/reels"
: > "$OUT/failed.txt"

IL_OPTS=()
[ -n "${TF_LOGIN:-}" ] && IL_OPTS+=(--login="$TF_LOGIN")
GD_OPTS=(--write-metadata)
YT_OPTS=()
if [ -n "${TF_BROWSER:-}" ]; then
  GD_OPTS+=(--cookies-from-browser "$TF_BROWSER")
  YT_OPTS+=(--cookies-from-browser "$TF_BROWSER")
fi

echo "== TrendForge archive =="
echo "profile  : $PROFILE  (https://www.instagram.com/$PROFILE)"
echo "output   : $OUT"
echo "tools    : instaloader=$HAVE_IL gallery-dl=$HAVE_GD yt-dlp=$HAVE_YT"
[ -n "${TF_LOGIN:-}" ]   && echo "login    : instaloader as $TF_LOGIN"
[ -n "${TF_BROWSER:-}" ] && echo "cookies  : from $TF_BROWSER"
echo

BEFORE_PROFILE=$(find "$OUT/profile" -type f 2>/dev/null | wc -l | tr -d ' ')
BEFORE_REELS=$(find "$OUT/reels" -type f 2>/dev/null | wc -l | tr -d ' ')

# 1) Full profile via instaloader (posts + captions + metadata)
if [ "$HAVE_IL" = 1 ]; then
  echo "-- instaloader: full profile --"
  instaloader ${IL_OPTS[@]+"${IL_OPTS[@]}"} \
    --dirname-pattern="$OUT/profile/{date_utc:%Y-%m-%d}_{shortcode}" \
    --filename-pattern="{shortcode}_{typename}" \
    --no-pictures-check \
    -- "$PROFILE" || echo "instaloader exited nonzero — see its output above" >> "$OUT/failed.txt"
else
  echo "instaloader not found — skipping full-profile pass (gallery-dl may cover it)."
fi

# 2) Fallback full profile via gallery-dl
if [ "$HAVE_GD" = 1 ]; then
  if [ -z "$(ls -A "$OUT/profile" 2>/dev/null)" ]; then
    echo "-- gallery-dl: full profile (fallback) --"
    gallery-dl --directory "$OUT/profile" ${GD_OPTS[@]+"${GD_OPTS[@]}"} \
      "https://www.instagram.com/$PROFILE/" \
      || echo "gallery-dl failed" >> "$OUT/failed.txt"
  else
    echo "-- gallery-dl: skipped, instaloader already filled profile/ --"
  fi
else
  echo "gallery-dl not found — skipping fallback pass."
fi

# 3) The reels the site embeds, as video + description
if [ "$HAVE_YT" = 1 ]; then
  echo "-- yt-dlp: known reels from the site --"
  while read -r url; do
    [ -z "$url" ] && continue
    echo "   $url"
    yt-dlp --no-playlist ${YT_OPTS[@]+"${YT_OPTS[@]}"} \
      -o "$OUT/reels/%(id)s.%(ext)s" \
      --write-description --write-info-json \
      "$url" || echo "$url" >> "$OUT/failed.txt"
  done < "$LIST"
else
  echo "yt-dlp not found — reels not downloaded. Install yt-dlp and re-run."
fi

# 4) Manifest + report
( cd "$OUT" && find . -type f | sort > manifest.txt )
TOTAL=$(wc -l < "$OUT/manifest.txt" | tr -d ' ')
AFTER_PROFILE=$(find "$OUT/profile" -type f 2>/dev/null | wc -l | tr -d ' ')
AFTER_REELS=$(find "$OUT/reels" -type f 2>/dev/null | wc -l | tr -d ' ')

echo
echo "== Result =="
echo "files total        : $TOTAL"
echo "profile/ files     : $AFTER_PROFILE (new this run: $((AFTER_PROFILE - BEFORE_PROFILE)))"
echo "reels/ files       : $AFTER_REELS (new this run: $((AFTER_REELS - BEFORE_REELS)))"

if [ "$AFTER_PROFILE" -eq 0 ]; then
  echo
  echo "WARNING: the profile pass produced nothing. Instagram blocks most"
  echo "anonymous scrapes. Re-run with your own login, either of:"
  echo "  TF_LOGIN=yourhandle      ./archive_trendforge.sh"
  echo "  TF_BROWSER=firefox       ./archive_trendforge.sh"
fi

if [ -s "$OUT/failed.txt" ]; then
  echo
  echo "Failures logged in $OUT/failed.txt:"
  cat "$OUT/failed.txt"
fi

echo
echo "Next: copy $OUT somewhere safe — the private Google Drive folder"
echo "'TrendForge FX archive' (link in archive/trendforge/README.md), an external"
echo "disk, or a private repo."
if [ "$IN_REPO" = 1 ]; then
  echo "This repo is PUBLIC — never commit downloads/ here; it is git-ignored."
fi

if [ "$TOTAL" -eq 0 ]; then exit 1; fi
exit 0
