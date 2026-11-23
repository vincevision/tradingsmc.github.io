"""Observe: turn the live chart into a compact, token-cheap packet."""
from __future__ import annotations

import json
import re

from . import config
from .mcp_client import Conn


async def select_workspace(conn: Conn) -> str:
    name = conn.find("chart_workspace_select", "workspace_select")
    if not name:
        return "no chart_workspace_select tool offered"
    return await conn.text(name, {"workspaceId": config.WORKSPACE})


async def status(conn: Conn) -> str:
    name = conn.find("chart_status")
    return await conn.text(name, {}) if name else "no chart_status tool"


async def refresh(conn: Conn) -> str:
    name = conn.find("chart_refresh")
    return await conn.text(name, {}) if name else "no chart_refresh tool"


async def read(conn: Conn, bars: int = 0) -> str:
    name = conn.find("chart_read")
    if not name:
        return "no chart_read tool"
    args = {"bars": bars} if bars else {}
    return await conn.text(name, args)


async def candles(conn: Conn, symbol: str, timeframe: str, count: int):
    """Per-bar OHLC via `points` (works with no tab open). Returns list|None."""
    name = conn.find("points")
    if not name:
        return None
    schema = conn.schema(name)
    props = schema.get("properties", {})
    args: dict = {}
    for key in ("symbol", "ticker", "market"):
        if key in props:
            args[key] = symbol
            break
    for key in ("timeframe", "interval", "resolution"):
        if key in props:
            args[key] = timeframe
            break
    for key in ("limit", "count", "bars"):
        if key in props:
            args[key] = count
            break
    try:
        raw = await conn.text(name, args)
    except Exception:
        return None
    return parse_candles(raw)


def parse_candles(raw: str):
    """Accept a JSON blob or a list of {t,o,h,l,c} objects embedded in text."""
    try:
        data = json.loads(raw)
    except Exception:
        start = raw.find("[")
        end = raw.rfind("]")
        if start < 0 or end <= start:
            return None
        try:
            data = json.loads(raw[start : end + 1])
        except Exception:
            return None
    if isinstance(data, dict):
        for key in ("bars", "candles", "points", "data"):
            if isinstance(data.get(key), list):
                data = data[key]
                break
        else:
            inner = data.get("chart")
            if isinstance(inner, dict):
                for key in ("bars", "candles", "points", "data"):
                    if isinstance(inner.get(key), list):
                        data = inner[key]
                        break
    if not isinstance(data, list):
        return None
    out = []
    for row in data:
        if not isinstance(row, dict):
            continue
        low = {k.lower(): v for k, v in row.items()}
        o = low.get("o", low.get("open"))
        h = low.get("h", low.get("high"))
        l = low.get("l", low.get("low"))
        c = low.get("c", low.get("close"))
        t = low.get("t", low.get("time", low.get("open_time")))
        if None in (h, l, c):
            continue
        out.append({"t": t, "o": o, "h": float(h), "l": float(l), "c": float(c)})
    return out or None


def packet_lines(bars) -> list[str]:
    """Compact bar lines for the brain: t,o,h,l,c — last N only."""
    if not bars:
        return []
    lines = []
    for b in bars[-90:]:
        lines.append(
            f"{b.get('t','?')},{b['o']:.5f},{b['h']:.5f},{b['l']:.5f},{b['c']:.5f}"
        )
    return lines


async def observe(conn: Conn) -> dict:
    """One observation: status, read (with bars), candles fallback."""
    read_txt = await read(conn, bars=min(config.BARS, 300))
    head: dict = {}
    for candidate in (read_txt or "", (read_txt or "").splitlines()[0]):
        try:
            parsed = json.loads(candidate)
        except Exception:
            continue
        if isinstance(parsed, dict):
            head = parsed
            break
    chart = head.get("chart") if isinstance(head.get("chart"), dict) else {}
    symbol = str(chart.get("symbol") or head.get("symbol") or "")
    timeframe = str(
        chart.get("interval") or chart.get("timeframe")
        or head.get("interval") or head.get("timeframe") or ""
    )
    if not symbol:
        m = re.search(r'"symbol"\s*:\s*"([^"]+)"', read_txt or "")
        symbol = m.group(1) if m else ""
    if not timeframe:
        m = re.search(r'"interval"\s*:\s*"([^"]+)"', read_txt or "")
        timeframe = m.group(1) if m else ""
    bars = parse_candles(read_txt)
    src = "chart_read" if bars else ""
    if not bars and symbol and timeframe:
        bars = await candles(conn, symbol, timeframe, config.BARS)
        src = "points" if bars else "points-empty"
    if not bars and not src:
        src = "no-symbol"
    diag = "" if bars else (read_txt or "")[:200].replace("\n", " ")
    return {
        "status": await status(conn),
        "refresh": await refresh(conn),
        "read": read_txt,
        "bars": bars,
        "symbol": symbol,
        "timeframe": timeframe,
        "src": src,
        "diag": diag,
    }
