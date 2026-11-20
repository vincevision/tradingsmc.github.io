# TrendForge.FX archive — insurance copy

The site quotes TrendForge.FX throughout: twelve of the case studies are his
posted breakdowns, the concept pages reuse his slides, and seven of his reels
are embedded in the video sections. If his account ever disappears, the site
keeps working (the slides already live in `assets/img/…`), but everything
*else* — the full profile, the reels as video, the captions — would be gone.
This folder is the plan for keeping a copy.

**Status after the first real run:** ✅ all 7 embedded reels archived (21
files, no login needed) · ✅ his slides in `assets/img/…` safe in Git ·
⬜ full profile (every post, caption and all his reels) — needs one
authenticated re-run, see [below](#if-profile-comes-back-empty).

## What already exists in Git

See [`existing-copies.md`](existing-copies.md): every page that credits him
and the image folder(s) holding his slides. Those copies are safe with the
repo. They are slides only — no captions, no reels-as-video, no posts the
site never used.

## What the script fetches

[`../../tools/archive_trendforge.sh`](../../tools/archive_trendforge.sh)
runs on **your machine** (the Arena sandbox cannot reach Instagram).

### Getting the script onto your machine

It lives in this repo, so an empty folder won't have it. Either:

**A. Just the script** (lightest — it carries its own copy of the reel list):

```bash
cd ~/Videos/TRENDFORGE          # any folder you like
curl -fLO https://raw.githubusercontent.com/vincevision/tradingsmc.github.io/main/tools/archive_trendforge.sh
chmod +x archive_trendforge.sh
```

**B. The whole repo** (28 MB — also gives you `known-reels.txt`, this README
and `existing-copies.md` locally):

```bash
git clone --depth 1 https://github.com/vincevision/tradingsmc.github.io.git
cd tradingsmc.github.io
```

### Installing the tools (Kali / Debian / Ubuntu)

`pip install …` fails with *externally-managed-environment* on Kali — that's
PEP 668, not a broken install. Use a venv:

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install instaloader gallery-dl yt-dlp
```

The script also finds `./.venv/bin` on its own, so you don't have to remember
to activate it on later runs. If none of the three tools are on PATH it stops
with an error instead of quietly archiving nothing.

### Running it

```bash
./archive_trendforge.sh                       # -> ./downloads (or the repo's downloads/)
./archive_trendforge.sh /mnt/backup/tf        # custom output dir
./archive_trendforge.sh ./downloads trendforge.fx
```

Handle is confirmed: **`trendforge.fx`** →
<https://www.instagram.com/trendforge.fx>.

### What each tool contributes — and what actually works

Verified against instaloader 4.16, gallery-dl 1.32.20 and yt-dlp 2026.10.26
(the versions a fresh `pip install` gives you today), plus one real run.

- **yt-dlp** — each reel listed in [`known-reels.txt`](known-reels.txt), as
  merged mp4 + `.description` + `.info.json`. **Works with no login at all**
  (real run: 7 reels → 21 files, all clean). The list is also built into the
  script, so a standalone copy still fetches them. yt-dlp *cannot* enumerate a
  whole profile — its `InstagramUserIE` is disabled upstream (`_WORKING =
  False`) — so it only ever gets the reels we list.
- **instaloader** — the only tool that can pull the **entire profile**: every
  post's images and videos, **Reels and IGTV included** (`--reels --igtv`), the
  caption as a `.txt` per post, and pretty-printed JSON metadata (dates, likes,
  comments; `--no-compress-json` so it's readable without `xz`). This is how
  you get *all* his reels, not just the seven the site embeds.
- **gallery-dl** — a second profile pass, but **only when authenticated**: its
  Instagram extractor refuses username/password login outright ("Login with
  username & password is no longer supported. Use browser cookies instead"),
  and anonymously it just fails with `NotFoundError: Requested user could not
  be found`. The script therefore skips it unless cookies are supplied, rather
  than logging a confusing failure.
- Writes `manifest.txt` (everything fetched), `failed.txt` (anything that
  errored) and `instaloader.log` / `gallery-dl.log` (full tool output for
  diagnosis).

### If `profile/` comes back empty

Reels will already be safe. For the profile, Instagram usually wants an
account. Two routes — **your own** account only, never the artist's:

```bash
# Route A: reuse the browser you are already logged into Instagram with
pip install "instaloader[browser-cookie3]"      # required extra for instaloader
TF_BROWSER=firefox ./archive_trendforge.sh

# Route B: username + password prompt (instaloader stores a session file,
# so later runs reuse it and you type the password once)
TF_LOGIN=yourhandle ./archive_trendforge.sh
```

`TF_BROWSER` accepts brave, chrome, chromium, edge, firefox, librewolf, opera,
opera_gx, safari, vivaldi — instaloader's own supported list; anything else is
rejected up front. If the extra isn't installed the script says so and carries
on, still passing your cookies to gallery-dl and yt-dlp.

### Every knob

| Knob | Effect |
|---|---|
| `TF_BROWSER=firefox` | Cookies from that browser → instaloader (needs the `browser-cookie3` extra), gallery-dl and yt-dlp |
| `TF_LOGIN=yourhandle` | instaloader password login; session saved for re-runs |
| `TF_COOKIES=/path/cookies.txt` | Netscape cookie file → gallery-dl (`-c`) |
| `TF_FAST=1` | `--fast-update`: stop at the first post you already have — the cheap monthly refresh |
| `TF_TAGGED=1` | Also posts where he is tagged by others |
| `TF_STORIES=1` | Current stories too (ignored unless authenticated — stories need a login) |

Example refresh run:

```bash
TF_BROWSER=firefox TF_FAST=1 ./archive_trendforge.sh
```

## Checking the copy is real

The script ends with a `== Result ==` block. **The first real run (Nov 2026)
looked like this:**

```
files total        : 23
profile/ files     : 0 (new this run: 0)
reels/ files       : 21 (new this run: 21)
```

Read that as: **all seven embedded reels are archived** (3 files each — mp4,
description, info json), and the full-profile pass is still outstanding.
`profile/ files : 0` means Instagram wanted a login, not that anything broke.

A complete archive should show `profile/` with **more files than his post
count** (image/video + caption txt + metadata json per post, plus his reels and
IGTV). Compare against the number shown on
<https://www.instagram.com/trendforge.fx>. Re-runs skip what you already have,
so repeating is safe and cheap — add `TF_FAST=1` to make a refresh run stop at
the first post you've already got.

## Where the copies should live

Not in this repository. It is a **public** GitHub Pages repo: mirroring
someone's whole feed here would republish his work without asking, and media
archives bloat a Pages repo fast. `downloads/` is git-ignored on purpose.
Good homes, in order of convenience:

1. **Google Drive** — the private folder already created for this:
   ["TrendForge FX archive"](https://drive.google.com/drive/folders/14dk6_htT3-PuiGwkFcFgWJzr5jMR9ZqX).
   Sync or upload the `downloads/` dir into it. Drive keeps versions and
   survives disk death.
2. **External disk** — cold copy, refreshed after each new archive run.
3. **A private GitHub repo** — if you want history and diffs of the metadata.

Refresh rhythm: re-run the script once a month, or whenever he posts a
breakdown you know the site will quote. instaloader and yt-dlp skip files
they already have, so re-runs are cheap.

## The honest footnote

This is a personal preservation copy of public posts for study — keep it
private, credit him everywhere (the site already does), and don't republish
the feed. If he ever asks you to take copies down, he is right to, and the
answer is yes.
