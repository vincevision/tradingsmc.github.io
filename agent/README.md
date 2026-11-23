# SMC agent — your local runner

A small Python service for **your own machine** (Kali-tested instructions
below). It connects to your OpenMarket chart through the OpenMarket chart
MCP, reads it the way you do, proposes at most one setup per cycle through a
Groq model trained on nothing but **this site**, and then a hard-coded gate
— the site's own checklist — accepts or refuses the proposal. Passes get
their marks drawn on your chart and a tap-alert armed; everything, passes
and skips alike, lands in `journal.md`.

> The agent watches the **OpenMarket** chart tab you keep open. It does not
> see your TradingView replays. Your replay practice keeps feeding the site;
> the agent works the live chart.

## The four opinions, in order

1. **The site is the curriculum.** `strategy.md` is exported from the live
   pages (`python3 tools/build_strategy_pack.py` from the repo root). Edit
   the site, re-run the exporter, the agent follows.
2. **The brain proposes, the gate disposes.** Groq names a setup in strict
   JSON; `gate.py` re-checks every number against the pulled candles —
   sweep at the zone, shift on a close, stop beyond the structure, target
   beyond entry, R:R ≥ 1:2. Without candles nothing passes, only *watch*.
3. **The skips are the strategy.** Every cycle appends to `journal.md`,
   including the refusals and their reasons.
4. **Trade execution is four locks deep:** `AGENT_TRADE=true` in `.env`,
   `--confirm` on the command line, your browser tab having armed the agent
   for the session, and a `y` at the prompt. Miss any lock and the order
   path stays shut.

## Get the folder on Kali

The agent lives in this public repo. Pull only the two folders you need
(sparse clone — skips every chart image in the repo):

```bash
cd ~                                        # or any dir; quote paths with spaces
git clone --depth 1 --filter=blob:none --sparse \
  https://github.com/vincevision/tradingsmc.github.io.git
cd tradingsmc.github.io
git sparse-checkout set agent tools         # the agent + the pack exporter
```

Already have the full repo somewhere? Skip the clone and `cd` straight into
its `agent/` folder.

## Install on Kali

```bash
sudo apt install -y python3-venv            # Kali is PEP 668: never pip to system
cd tradingsmc.github.io/agent
python3 -m venv .venv || python3.13 -m venv .venv   # if the default 3.14 is too new for the mcp SDK
.venv/bin/pip install -r requirements.txt
cp .env.example .env                        # then edit .env
```

### The two keys (both stay on your machine)

- `OM_MCP_TOKEN` — create an agent token at
  <https://openmarket.xyz/chart/console/agents>: the token creator is on
  that page **below the "Try a prompt" cards** (if your console hides it,
  use **API Keys** in the sidebar). Do **not** use the "paste one
  sentence" box at the top — that flow is for command-running agents
  (Claude Code, Codex, Cursor) that sign in through your browser; a
  headless service like this one authenticates with the token instead.
  Scopes: **read** + **chart** for v1 (drawings and indicators need
  `chart`); tick the alerts box if you want tap-alerts; add **trade** only
  after reading the trade section below. The token is shown once — paste
  it straight into `.env`. Never paste it into a chat or commit it.
  After the agent's first successful `intro`, your token appears under
  **Connected agents** on that same page: that list is your audit trail.
- `GROQ_API_KEY` — your Groq key, same provider the site chat uses. Any
  chat model on the key works; `GROQ_MODEL` picks it.

`OM_WORKSPACE` is already set to your chart `RV0MBetJ`.

## Run

```bash
.venv/bin/python -m agent intro     # handshake: tool inventory, workspace, what the chart shows
.venv/bin/python -m agent once      # one observe → propose → gate → act cycle
.venv/bin/python -m agent watch     # loop every AGENT_CADENCE_MIN minutes
.venv/bin/python -m agent watch --confirm   # only if AGENT_TRADE=true and you mean it
```

`intro` prints every tool the connector offers and writes the inventory to
`.tools.json` — that is how you see exactly what your token can touch.
Run it under `tmux` or a systemd user unit for `watch`.

## What a passing cycle does on your chart

Draws the zone rectangle and the entry/stop/target lines (schema-driven:
tool names and argument shapes are read from the live inventory, never
hardcoded), arms one price alert at the zone edge so the tap wakes the next
cycle, and journals the lot. If a drawing tool's shape cannot be understood
the agent says so in the journal instead of guessing — silence is not an
option, and neither is a blind draw.

## Reading the verdicts

- **PASS** — every hard rule verified against candles; marks drawn, alert armed.
- **WATCH** — the idea is there but candles could not verify it (no tab,
  rate limit, missing bars). Nothing is drawn; the journal keeps the idea.
- **SKIP** — a hard rule failed, with the reason: stop inside the zone,
  R:R under 1:2, no close beyond the pullback at the shift bar, and so on.
- **NONE** — no setup; also journaled, because the quiet cycles are the
  discipline.

A sweep that did *not* come from a zone never blocks a pass — the site's
memorised note says sweep + shift is enough — but the gate records
`sweep_at_zone=no`, and the journal line shows the missing probability.

## Connector behaviours worth knowing

- `no_tab` — the chart tab is not open on the selected workspace; open it,
  or the agent falls back to `points` candles where offered.
- `rate_limited` — 60 reads a minute per key; the client backs off and retries.
- `unverified_market` on FX pairs — the directory cannot vouch for some FX
  listings; the pair still applies, the warning is journaled.
- `exchange_license` — some feeds withhold indicator values from agents;
  prices and drawings still work.
- Free-plan candle history is about 30 days: plenty for 15m–2h work; the
  higher-timeframe view lives in the strategy pack, not in the candles.

## Trade section (read before arming anything)

Orders execute **through your own browser tab**, inside the daily ceiling
you set there, only while the tab has armed the agent for the session
(search “Agent trading” in the tab). The agent sends an idempotency key and
journals it; on any `relay_uncertain` or transport error it reads
`account_orders` before anything else, and never retries blind. v1 ships
with `AGENT_TRADE=false`: the recommended path is weeks of journalled
passes and skips before the fourth lock ever opens.

## Files

| file | role |
| --- | --- |
| `__main__.py` | CLI: intro / once / watch |
| `mcp_client.py` | connect, live tool inventory, courteous retries |
| `observe.py` | chart_read + candles into a token-cheap packet |
| `brain.py` | Groq proposal in strict JSON |
| `gate.py` | the hard checklist, re-checked against candles |
| `act.py` | draws, alerts, the four-lock trade path |
| `journal.py` | every cycle, passes and skips |
| `strategy.md` | exported curriculum (regenerate, don't edit) |
| `.env.example` | the keys and the knobs |
