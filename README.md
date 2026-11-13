# tradingsmc.github.io

SMC trade case studies: why each trade was taken, where the stop and target go, and a repeatable checklist.

- `index.html` — home page and case-study menu
- `playbook.html` — the combined daily routine, order rules, risk rules and glossary
- `entry-models.html` — aggressive vs confirmation entry models
- `cases/` — one page per case study
- `assets/img/<slug>/` — screenshots for each case
- `assets/js/site.js` — header, menu and home-page list (driven by the `CASES` array)

## Adding a case study

1. Put the screenshots in `assets/img/<slug>/`.
2. Copy `cases/usdjpy-confirmation-entry.html` to `cases/<slug>.html` and edit the content.
3. Add an entry to `CASES` in `assets/js/site.js`. The nav menu (grouped by pair) and the home page update automatically.
4. Add the same card to the static list inside `#case-list` in `index.html` (fallback for when the script is cached or blocked).
5. Bump the `?v=` number on the `site.js` and `style.css` links in every page so browsers fetch the new files.

Plain static HTML, no build step. Preview locally with `python3 -m http.server`.

The root-level `<slug>.html` files are redirects to `cases/<slug>.html`, so the short address works too. Add one for each new case.
