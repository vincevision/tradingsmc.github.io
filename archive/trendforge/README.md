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
runs on **your machine** (the Arena sandbox cannot reach Instagram):

```bash
pip install instaloader gallery-dl yt-dlp     # or: brew install yt-dlp
./tools/archive_trendforge.sh                  # -> archive/trendforge/downloads/
./tools/archive_trendforge.sh /Volumes/Backup/tf trendforge.fx   # custom dir / handle
```

- **instaloader** — the whole profile: every post's images and videos, the
  caption as a text file, and JSON metadata (date, likes, comments).
- **gallery-dl** — fallback full-profile pass if instaloader is missing.
- **yt-dlp** — each reel listed in [`known-reels.txt`](known-reels.txt)
  (the exact reels the site embeds) as video + description + info json.
- Writes `manifest.txt` (everything fetched) and `failed.txt` (anything that
  errored), so you can see at a glance whether the copy is complete.

Instagram throttles anonymous scraping; if a run comes back empty or errors,
log in once with **your own** account (`instaloader --login=yourhandle`,
which stores a session file) and re-run. Never use the artist's credentials.

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
