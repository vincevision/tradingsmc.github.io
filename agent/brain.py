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
    body = {
        "model": config.GROQ_MODEL,
        "temperature": 0.1,
        "messages": [
            {"role": "system", "content": pack + "\n\n" + SCHEMA},
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
        r.raise_for_status()
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
