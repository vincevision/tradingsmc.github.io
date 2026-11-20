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
# Optional environment knobs
# --------------------------
#   TF_BROWSER=firefox   authenticate from your browser's Instagram cookies.
#                        You must be logged into Instagram in that browser.
#                        Supported: brave chrome chromium edge firefox
#                        librewolf opera opera_gx safari vivaldi
#                        instaloader needs the extra package for this:
#                          pip install "instaloader[browser-cookie3]"
#   TF_LOGIN=yourhandle  instaloader logs in with YOUR account instead
#                        (prompts for your password, stores a session file
#                        so later runs reuse it)
#   TF_COOKIES=/path/cookies.txt   Netscape cookie file for gallery-dl
#   TF_FAST=1            add --fast-update: stop at the first post you already
#                        have. Best for monthly refresh runs.
#   TF_TAGGED=1          also grab posts where he is tagged by others
#   TF_STORIES=1         also grab current stories (needs a login)
#
# Only ever use YOUR OWN account/cookies — never the artist's credentials.
#
# What it does:
#   1. instaloader  — the whole profile: every post's images and videos,
#                     Reels and IGTV included, caption text per post, and JSON
#                     metadata (dates, likes, comments).
#   2. gallery-dl   — second full-profile pass. Only runs when authenticated:
#                     its Instagram extractor requires browser cookies
#                     (password login was removed upstream), and anonymously it
#                     just reports "Requested user could not be found".
#   3. yt-dlp       — each reel the site embeds, as video + description +
#                     info json. This works WITHOUT any login, so the reels the
#                     case studies quote are preserved even anonymously.
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

# Which python runs instaloader? (for checking optional extras)
il_python() {
  local exe shebang
  exe="$(command -v instaloader 2>/dev/null)" || { command -v python3; return; }
  shebang="$(head -1 "$exe" 2>/dev/null)"
  case "$shebang" in
    '#!'*) echo "${shebang#\#!}" ;;
    *)     command -v python3 ;;
  esac
}

# ---- authentication -------------------------------------------------------
AUTH="none"
BROWSER_OK=1
if [ -n "${TF_BROWSER:-}" ]; then
  case " brave chrome chromium edge firefox librewolf opera opera_gx safari vivaldi " in
    *" ${TF_BROWSER} "*) : ;;
    *) echo "ERROR: TF_BROWSER='$TF_BROWSER' is not supported by instaloader." >&2
       echo "Use one of: brave chrome chromium edge firefox librewolf opera opera_gx safari vivaldi" >&2
       exit 1 ;;
  esac
  if [ "$HAVE_IL" = 1 ] && ! "$(il_python)" -c 'import browser_cookie3' >/dev/null 2>&1; then
    BROWSER_OK=0
    echo "NOTE: instaloader cannot read browser cookies yet — browser_cookie3 is an"
    echo "      optional extra. Install it to use TF_BROWSER for the profile pass:"
    echo "        pip install \"instaloader[browser-cookie3]\""
    echo "      Continuing; gallery-dl/yt-dlp can still use those cookies."
    echo
  fi
fi
if [ -n "${TF_BROWSER:-}" ]; then
  if [ "$BROWSER_OK" = 1 ]; then
    AUTH="browser:$TF_BROWSER (all three tools)"
  else
    AUTH="browser:$TF_BROWSER (gallery-dl + yt-dlp; instaloader needs browser_cookie3)"
  fi
elif [ -n "${TF_LOGIN:-}" ];   then AUTH="login:$TF_LOGIN (instaloader)"
elif [ -n "${TF_COOKIES:-}" ]; then AUTH="cookiefile:$TF_COOKIES (gallery-dl)"
fi

mkdir -p "$OUT/profile" "$OUT/reels"
: > "$OUT/failed.txt"

# ---- instaloader options (all verified against instaloader 4.16's parser) --
IL_OPTS=(--reels --igtv --no-compress-json)
IL_AUTHED=0
if [ -n "${TF_BROWSER:-}" ] && [ "$BROWSER_OK" = 1 ]; then
  IL_OPTS+=(--load-cookies "$TF_BROWSER"); IL_AUTHED=1
elif [ -n "${TF_LOGIN:-}" ]; then
  IL_OPTS+=(--login "$TF_LOGIN"); IL_AUTHED=1
fi
[ "${TF_FAST:-0}" = 1 ]    && IL_OPTS+=(--fast-update)
[ "${TF_TAGGED:-0}" = 1 ]  && IL_OPTS+=(--tagged)
if [ "${TF_STORIES:-0}" = 1 ]; then
  if [ "$IL_AUTHED" = 0 ]; then
    [ "$HAVE_IL" = 1 ] && echo "NOTE: TF_STORIES=1 ignored — stories require a login (TF_BROWSER or TF_LOGIN)."
  else
    IL_OPTS+=(--stories)
  fi
fi

# ---- gallery-dl options (cookies are mandatory for Instagram there) -------
GD_OPTS=(--write-metadata)
GD_AUTHED=0
if [ -n "${TF_BROWSER:-}" ]; then
  GD_OPTS+=(--cookies-from-browser "$TF_BROWSER"); GD_AUTHED=1
fi
if [ -n "${TF_COOKIES:-}" ] && [ -f "${TF_COOKIES}" ]; then
  GD_OPTS+=(-c "$TF_COOKIES"); GD_AUTHED=1
fi

# ---- yt-dlp options (reels work anonymously) ------------------------------
YT_OPTS=()
[ -n "${TF_BROWSER:-}" ] && YT_OPTS+=(--cookies-from-browser "$TF_BROWSER")

echo "== TrendForge archive =="
echo "profile  : $PROFILE  (https://www.instagram.com/$PROFILE)"
echo "output   : $OUT"
echo "tools    : instaloader=$HAVE_IL gallery-dl=$HAVE_GD yt-dlp=$HAVE_YT"
echo "auth     : $AUTH"
echo

BEFORE_PROFILE=$(find "$OUT/profile" -type f 2>/dev/null | wc -l | tr -d ' ')
BEFORE_REELS=$(find "$OUT/reels" -type f 2>/dev/null | wc -l | tr -d ' ')

# 1) Full profile via instaloader (posts + reels + igtv + captions + metadata)
if [ "$HAVE_IL" = 1 ]; then
  echo "-- instaloader: full profile --"
  instaloader ${IL_OPTS[@]+"${IL_OPTS[@]}"} \
    --dirname-pattern="$OUT/profile/{date_utc:%Y-%m-%d}_{shortcode}" \
    --filename-pattern="{shortcode}_{typename}" \
    -- "$PROFILE" 2>&1 | tee -a "$OUT/instaloader.log"
  [ "${PIPESTATUS[0]}" -eq 0 ] || echo "instaloader exited nonzero — see instaloader.log" >> "$OUT/failed.txt"
else
  echo "instaloader not found — skipping full-profile pass."
fi

# 2) Second full-profile pass via gallery-dl (only when authenticated)
if [ "$HAVE_GD" = 1 ]; then
  if [ "$GD_AUTHED" = 0 ]; then
    echo "-- gallery-dl: skipped (no cookies). Its Instagram extractor requires"
    echo "   browser cookies — password login was removed upstream, and an"
    echo "   anonymous pass only reports 'Requested user could not be found'."
    echo "   Set TF_BROWSER=firefox (or TF_COOKIES=/path/cookies.txt) to use it."
  elif [ -z "$(ls -A "$OUT/profile" 2>/dev/null)" ]; then
    echo "-- gallery-dl: full profile --"
    gallery-dl --directory "$OUT/profile" ${GD_OPTS[@]+"${GD_OPTS[@]}"} \
      "https://www.instagram.com/$PROFILE/" 2>&1 | tee -a "$OUT/gallery-dl.log"
    [ "${PIPESTATUS[0]}" -eq 0 ] || echo "gallery-dl exited nonzero — see gallery-dl.log" >> "$OUT/failed.txt"
  else
    echo "-- gallery-dl: skipped, instaloader already filled profile/ --"
  fi
else
  echo "gallery-dl not found — skipping second profile pass."
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
  echo "The profile pass produced nothing. If the log says 'login required' or"
  echo "'Requested user could not be found', Instagram wants an account. Then:"
  echo "  1) log into instagram.com in Firefox,"
  echo "  2) pip install \"instaloader[browser-cookie3]\","
  echo "  3) TF_BROWSER=firefox ./archive_trendforge.sh"
  echo "Or with a username/password prompt instead: TF_LOGIN=yourhandle"
  echo "Reels do not need any of this — they are already in reels/."
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
