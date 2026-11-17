# VinceVision SMC — Pine Script indicator

`vincevision-smc.pine` is the site's method written as a TradingView indicator (Pine v5).
It codifies the **sweep model** (sweep-model.html, steps 1–6) end to end, and enforces the
**zone model's gates** (strategy.html) without trying to draw higher-timeframe zones —
those stay a human judgement, exactly as the site teaches.

## Install

1. TradingView → Pine Editor (bottom panel).
2. Paste the whole file, or open it and copy it in.
3. "Add to chart". Save it to your account if you want alerts on your phone.

## What it does, mapped to the site

| Site rule | Where it lives here | Indicator behaviour |
|---|---|---|
| Pair table (top-down.html#pairs) | `Auto pair from chart TF` | 1m→15m, 5m→1H, 15m→4H, 1H→D, 4H→W; direction = a close above/below the last HTF swing. Counter-trend off by default. |
| Note 2 / step 2 — mark liquidity | swing pivots + previous day high/low | Dotted `$$$` lines; a pool dies once swept or once closed through for 2 bars. |
| Note 2 / step 3 — sweep before the break | wick through a pool, close back within 2 bars | `X $$$` label + dashed **protected level** at the sweep extreme. |
| Note 3 — protected level | sweep extreme | A close beyond it kills the setup and says so (`invalidated`). |
| Note 8 / step 4 — shift with imbalance | close through the last swing + a 3-candle FVG in the leg | Blue IMB box; a break with no imbalance is refused (`no trade` label). |
| Note 4 / step 5 — the zone | last opposite candle before the shift leg | Zone box; refused if it was already tapped (`zone already tapped`). |
| Step 5 — the order | limit at the zone edge, stop beyond the sweep + buffer, target = nearest untouched opposite liquidity | Dashed entry/target lines, solid stop line, `limit … · RR …` label. |
| Note 5 / checklist — room for 1:2 | `Minimum reward : risk` | Below it: `skip: RR …` and no order lines. The skip is labelled, not silent. |
| Note 11 — 75% retracement | `Entry trigger` = zone / 50 / 75 | Both doors from the site: 50% equilibrium and the deeper 75%, your choice, your log decides. |
| Notes short version — the morning read | top-right panel | Live checklist: HTF stance, sweep, protected level, limit, RR, state — long and short columns. |
| Exit, record, review (step 6) | fill → target or stop | `filled`, `target`, `stopped −1R` labels; alerts remind you to record and stand down. |

Colours are the site's drawing palette: olive zones, blue imbalance/entry/target,
grey stop, rust sweeps.

## Chart reading (v3 of the script)

- **Swing ticks** — a three-bar tick at every confirmed swing high/low: the structure
  skeleton, without full-width lines.
- **BoS / MSS labels** — a close through the last swing prints `BoS`; the shift inside a
  setup prints `MSS` beside its imbalance box, exactly like the site diagrams.
- **Trend tint** — the chart background is faintly olive while the analysis rung favours
  longs, rust while it favours shorts, with a label where the stance flips.
- **Bounded lines** — liquidity pools are invisible until swept; the swept pool becomes a
  short dotted segment; every protective, entry, stop and target line is truncated at the
  bar where the idea ends (invalidated, skipped, stopped or target). History stays readable.

## Alerts

- **Sweep** — liquidity taken; wait for the shift, do not trade the wick.
- **Setup ready** — sweep + shift + imbalance done; limit, stop, target drawn, RR shown.
- **Invalidated** — close beyond the protected level; delete the order.
- Rich `alert()` messages on ready / win / loss carry the actual prices.

## What it deliberately does not do

- It does not draw higher-timeframe demand/supply zones (zone model entries). Read the
  HTF yourself, or turn `Auto pair` off and set the analysis rung by hand.
- It does not size positions. The site's 0.5–1% rule is yours to apply.
- It does not trade for you. Every label is a reminder of a checklist line, not a signal.
