"""CLI:  python -m agent intro | once | watch [--confirm]"""
from __future__ import annotations

import asyncio
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
    elif cmd == "watch":
        asyncio.run(watch(confirm))
    else:
        raise SystemExit("usage: python -m agent intro|once|watch [--confirm]")


if __name__ == "__main__":
    main()
