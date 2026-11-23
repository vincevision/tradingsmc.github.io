"""CLI:  python -m agent intro | once | watch [--confirm]"""
from __future__ import annotations

import asyncio
import json
import sys
import time

from . import act, brain, config, gate, journal, observe, strategy
from .mcp_client import connect


async def intro() -> None:
    async with connect() as conn:
        print("tools offered:", len(conn.names()))
        for n in conn.names():
            print("  -", n)
        print("\nselect workspace:", await observe.select_workspace(conn))
        print("\nstatus:", (await observe.status(conn))[:400])
        print("\nrefresh:", (await observe.refresh(conn))[:400])
        rd = await observe.read(conn)
        print("\nchart_read:", rd[:600])


async def cycle(confirm: bool) -> None:
    pack = strategy.load()
    async with connect() as conn:
        await observe.select_workspace(conn)
        obs = await observe.observe(conn)
        obs["bar_lines"] = observe.packet_lines(obs.get("bars"))
        nb = len(obs.get("bars") or [])
        lastc = obs["bars"][-1]["c"] if nb else None
        print(
            f"obs: {obs.get('symbol') or '?'} {obs.get('timeframe') or '?'} bars={nb}"
            + (f" last={lastc}" if lastc is not None else "")
            + f" via {obs.get('src') or '?'}"
            + (f" | read: {obs['diag']}" if obs.get("diag") else "")
        )
        prop = await brain.propose(obs, pack)
        verdict = gate.check(prop, obs.get("bars"))
        acted: list[str] = []
        if verdict["verdict"] == "pass" and not act.already_acted(prop):
            acted += await act.draw_marks(conn, prop)
            acted += await act.tap_alert(conn, obs, prop)
            acted += await act.trade(conn, obs, prop, confirm)
            act.remember(prop)
        journal.write(obs, prop, verdict, acted)
        print(f"verdict: {verdict['verdict'].upper()}")
        for r in verdict["reasons"]:
            print("  -", r)
        for a in acted:
            print("  *", a)
        print("journal:", journal.PATH)


async def analyze(confirm: bool) -> None:
    """Top-down: candle ladder across timeframes, one narrative, one setup."""
    pack = strategy.load()
    async with connect() as conn:
        await observe.select_workspace(conn)
        obs = await observe.observe(conn)
        symbol = obs.get("symbol") or ""
        pane_tf = obs.get("timeframe") or ""
        if not symbol:
            print("pane blind: analyze needs a readable pane (see the obs: line)")
            return
        tfs = [t for t in config.TFS]
        if pane_tf and pane_tf not in tfs:
            tfs.append(pane_tf)
        lad = await observe.ladder(conn, symbol, tfs, min(config.BARS, 300))
        packets: dict = {}
        for tf, (b, raw) in lad.items():
            nb = len(b or [])
            lastc = b[-1]["c"] if nb else None
            print(
                f"tf {tf}: bars={nb}"
                + (f" last={lastc}" if lastc is not None
                   else f" blind ({(raw or '')[:300]})")
            )
            packets[tf] = observe.packet_lines(b)
        entry_tf = pane_tf or tfs[-1]
        prop = await brain.propose_mtf(
            {"symbol": symbol, "timeframe": pane_tf, "entry_tf": entry_tf},
            packets, pack,
        )
        prop.setdefault("zone_tf", entry_tf)
        entry_bars = (lad.get(entry_tf) or (None, ""))[0] or obs.get("bars")
        verdict = gate.check(prop, entry_bars)
        acted: list[str] = []
        if verdict["verdict"] == "pass" and not act.already_acted(prop):
            acted += await act.draw_marks(conn, prop)
            acted += await act.tap_alert(conn, obs, prop)
            acted += await act.trade(conn, obs, prop, confirm)
            act.remember(prop)
        journal.write(obs, prop, verdict, acted)
        print(f"bias: {prop.get('bias', '?')} · entry tf: {entry_tf}")
        if prop.get("narrative"):
            print("narrative:", prop["narrative"])
        print(f"verdict: {verdict['verdict'].upper()}")
        for r in verdict["reasons"]:
            print("  -", r)
        for a in acted:
            print("  *", a)
        print("journal:", journal.PATH)


async def watch(confirm: bool) -> None:
    while True:
        try:
            await cycle(confirm)
        except KeyboardInterrupt:
            raise
        except Exception as e:
            print("cycle error:", e)
        print(f"sleeping {config.CADENCE_MIN}m …")
        time.sleep(config.CADENCE_MIN * 60)


async def tools(names: list[str]) -> None:
    """Print the live input schema of connector tools (metadata, no secrets)."""
    async with connect() as conn:
        for n in (names or conn.names()):
            print(f"== {n} ==")
            print(json.dumps(conn.schema(n), indent=1))


def main() -> None:
    args = sys.argv[1:]
    cmd = args[0] if args else "intro"
    confirm = "--confirm" in args
    miss = config.missing()
    if miss and cmd != "pack":
        raise SystemExit(f"missing in agent/.env: {', '.join(miss)}")
    if cmd == "intro":
        asyncio.run(intro())
    elif cmd == "once":
        asyncio.run(cycle(confirm))
    elif cmd == "analyze":
        asyncio.run(analyze(confirm))
    elif cmd == "watch":
        asyncio.run(watch(confirm))
    elif cmd == "tools":
        asyncio.run(tools(args[1:]))
    else:
        raise SystemExit(
            "usage: python -m agent intro|once|analyze|watch [--confirm] | tools [names...]"
        )


if __name__ == "__main__":
    main()
