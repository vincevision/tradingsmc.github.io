# TrendForge.FX archive — insurance copy

The site quotes TrendForge.FX throughout: twelve of the case studies are his
posted breakdowns, the concept pages reuse his slides, and seven of his reels
are embedded in the video sections. If his account ever disappears, the site
keeps working (the slides already live in `assets/img/…`), but everything
*else* — the full profile, the reels as video, the captions — would be gone.
This folder is the plan for keeping a copy.

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

### If the profile comes back empty (the usual case)

Instagram blocks most *anonymous* profile scrapes — reels often still work.
The script warns when `profile/` ends up empty. Re-run with your own login,
either knob:

```bash
TF_LOGIN=yourhandle   ./archive_trendforge.sh   # instaloader asks for your password,
                                                # stores a session for future runs
TF_BROWSER=firefox    ./archive_trendforge.sh   # gallery-dl + yt-dlp reuse your
                                                # browser's IG cookies (you must be
                                                # logged into IG in that browser)
```

`TF_BROWSER` also accepts chrome, chromium, brave, edge, safari. Use **your**
account only, never the artist's credentials.

### What each tool contributes

- **instaloader** — the whole profile: every post's images and videos, the
  caption as a text file, and JSON metadata (date, likes, comments).
- **gallery-dl** — fallback full-profile pass whenever `profile/` is still
  empty (instaloader missing *or* blocked by the login wall).
- **yt-dlp** — each reel listed in [`known-reels.txt`](known-reels.txt)
  (the exact reels the site embeds) as video + description + info json. This
  list is also built into the script, so a standalone copy still fetches them.
- Writes `manifest.txt` (everything fetched) and `failed.txt` (anything that
  errored), so you can see at a glance whether the copy is complete.

## Checking the copy is real

The script ends with a `== Result ==` block:

```
files total        : 412
profile/ files     : 380 (new this run: 380)
reels/ files       : 21  (new this run: 21)
```

Compare `profile/ files` against the post count shown on
<https://www.instagram.com/trendforge.fx> — a handful of files per post
(image/video + caption txt + metadata json) is normal, so the file count
should be *more* than his post count. If `profile/ files` is `0`, the run was
blocked: use the `TF_LOGIN` / `TF_BROWSER` knobs above and re-run. Re-runs
skip what you already have, so repeating is safe and cheap.

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
