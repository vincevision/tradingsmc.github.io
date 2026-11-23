"""Brain: Groq proposes, in strict JSON. The gate decides, never the brain."""
from __future__ import annotations

import json

import httpx

from . import config

SCHEMA = """Answer with ONE JSON object, no prose, no markdown fences:
{"side":"short"|"long"|"none",
 "zone":[zone_low,zone_high],"zone_tf":"the timeframe the zone is drawn on",
 "sweep":{"time":"bar time as given","level":price},
 "shift":{"time":"bar time as given","level":price},
 "entry":price,"stop":price,"target":price,
 "reason":"one sentence: sweep, shift, zone, pool",
 "confidence":0.0-1.0}
If the chart does not offer the full gate (sweep, then shift, then a zone to
sell/buy at, then a pool beyond), answer with "side":"none" and zeros."""


async def propose(obs: dict, pack: str) -> dict:
    bars_txt = "\n".join(obs.get("bar_lines", [])) or "(no candles)"
    user = (
        f"Chart: {obs.get('symbol','?')} {obs.get('timeframe','?')}\n"
        f"chart_read says:\n{obs.get('read','')[:2500]}\n\n"
        f"Last bars (t,o,h,l,c):\n{bars_txt}\n\n"
        "Apply the strategy pack. Propose at most one setup. Use ONLY bar times "
        "that appear in the list for sweep.time and shift.time."
    )
    return await _ask(pack + "\n\n" + SCHEMA, user)


SCHEMA_MTF = """Answer with ONE JSON object, no prose, no markdown fences:
{"bias":"bullish"|"bearish"|"range",
 "htf_zone":[low,high] or null,
 "side":"short"|"long"|"none",
 "zone":[zone_low,zone_high],"zone_tf":"the timeframe the entry zone is on",
 "sweep":{"time":"bar time as given","level":price},
 "shift":{"time":"bar time as given","level":price},
 "entry":price,"stop":price,"target":price,
 "reason":"one sentence: HTF bias, sweep, shift, zone, pool",
 "narrative":"three to four sentences: the top-down read across the timeframes",
 "confidence":0.0-1.0}
Take bias and htf_zone from the HIGHEST timeframe that has candles. Take the
entry setup (sweep, shift, zone, entry, stop, target) from the entry
timeframe only, using ONLY bar times that appear in its list. If the entry
timeframe does not offer the full gate, answer "side":"none" and zeros —
bias and narrative are still required."""


async def propose_mtf(meta: dict, packets: dict, pack: str) -> dict:
    sections = []
    for tf, lines in packets.items():
        sections.append(
            f"=== {tf} bars (t,o,h,l,c) ===\n" + ("\n".join(lines) or "(no candles)")
        )
    user = (
        f"Chart: {meta.get('symbol','?')} · live pane: {meta.get('timeframe','?')}\n"
        f"Timeframes given: {', '.join(packets)} · entry timeframe: "
        f"{meta.get('entry_tf','?')}\n\n" + "\n\n".join(sections) + "\n\n"
        "Apply the strategy pack top-down: highest-timeframe bias and zone "
        "first, then the entry setup on the entry timeframe."
    )
    return await _ask(pack + "\n\n" + SCHEMA_MTF, user)


async def _ask(system: str, user: str) -> dict:
    body = {
        "model": config.GROQ_MODEL,
        "temperature": 0.1,
        "messages": [
            {"role": "system", "content": system},
            {"role": "user", "content": user},
        ],
    }
    if not config.GROQ_KEY:
        raise SystemExit("GROQ_API_KEY is empty. Put it in agent/.env.")
    async with httpx.AsyncClient(timeout=90) as cx:
        r = await cx.post(
            config.GROQ_URL,
            headers={"Authorization": f"Bearer {config.GROQ_KEY}"},
            json=body,
        )
        if r.status_code != 200:
            raise SystemExit(
                f"Groq HTTP {r.status_code}: {r.text[:400]}\n"
                "model_not_found / decommissioned? Set GROQ_MODEL in agent/.env to a "
                "model your key serves (console.groq.com/docs/models)."
            )
        txt = r.json()["choices"][0]["message"]["content"]
    return parse(txt)


def parse(txt: str) -> dict:
    txt = txt.strip()
    if txt.startswith("```"):
        txt = txt.strip("`")
        if txt.startswith("json"):
            txt = txt[4:]
    start, end = txt.find("{"), txt.rfind("}")
    if start < 0 or end <= start:
        return {"side": "none", "raw": txt}
    try:
        return json.loads(txt[start : end + 1])
    except Exception:
        return {"side": "none", "raw": txt}
