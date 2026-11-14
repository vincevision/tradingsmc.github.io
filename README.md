# VinceVision SMC

Site: https://vincevision.github.io/tradingsmc.github.io/

SMC trade case studies: why each trade was taken, where the stop and target go, and a repeatable checklist.

- `index.html` — home page and case-study menu
- `notes.html` — the routine as ten short notes (first item in the Strategy menu)
- `strategy.html` — the strategy step by step, from direction to journal, with inline SVG diagrams (top-level menu item)
- `sweep-model.html` — the sweep model step by step (second item in the Strategy menu)
- `checklist.html` + `assets/js/checklist.js` — live interactive checklist with an optional AI screenshot check per step (top-level menu item; progress is kept in the browser)
- `playbook.html` — the combined daily routine, order rules, risk rules and glossary
- `entry-models.html` — aggressive vs confirmation entry models
- `inducement.html` — inducement (liquidity trap) concept page
- `structure-entries.html` — market structure (strong/weak points) and four entry models concept page
- `internal-external.html` — internal and external structure, liquidity and sweeps concept page (diagrams are inline SVG)
- `supply-demand.html` — imbalance, supply and demand concept page (diagrams are inline SVG)
- `top-down.html` — top-down analysis (4H, 1H, 30m, 5m) concept page
- `full-sequence.html` — the five-part sequence (structure, sweep, MSS, IMB, OB) concept page
- `bos-quality.html` — good vs bad break of structure (protected and unprotected lows) concept page
- `liquidity.html` — types of liquidity (swings, equal highs/lows, trendlines, ranges, sessions) concept page
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

## Site assistant (chatbot)

- `assets/js/chat.js` — the chat button and panel, loaded by `site.js` on every page.
- `assets/chat/knowledge.json` — the page text the assistant answers from first. It may add general SMC and trading knowledge, marked "Beyond the site:", and declines other topics. After adding or editing a page, run `python3 tools/build_knowledge.py` and bump the `v` value of `SMC_CHAT` in `site.js`.
- The assistant calls the Groq API from the browser. The key is split across files, which only keeps it out of plain sight; anyone can read it from the browser's network requests. To hide it properly, put a small proxy in front of the API and set `window.SMC_CHAT = { endpoint: "<proxy URL>" }` before `site.js` loads.
