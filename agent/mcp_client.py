"""MCP client wrapper: connect, inventory tools, call with courtesy retries.

No tool names are hardcoded anywhere in the agent: we inventory what the
server offers at boot (list_tools) and pick candidates by name/schema at
use time. That is what keeps this working when the connector evolves.
"""
from __future__ import annotations

import json
import time
from contextlib import asynccontextmanager

import httpx

from mcp import ClientSession
from mcp.client.streamable_http import streamable_http_client

from . import config


class Conn:
    """Holds a live session plus the tool inventory."""

    def __init__(self, session: ClientSession, tools: list):
        self.s = session
        self.tools = {t.name: t for t in tools}

    def names(self) -> list[str]:
        return sorted(self.tools)

    def find(self, *needles: str) -> str | None:
        """First tool whose name contains any needle, preferring exact-ish hits."""
        for n in needles:
            for name in sorted(self.tools):
                if name == n:
                    return name
        for n in needles:
            for name in sorted(self.tools):
                if n in name:
                    return name
        return None

    def schema(self, name: str) -> dict:
        t = self.tools.get(name)
        return dict(getattr(t, "inputSchema", {}) or {}) if t else {}

    async def call(self, name: str, args: dict | None = None, tries: int = 3):
        last = None
        for i in range(tries):
            try:
                res = await self.s.call_tool(name, args or {})
                return res
            except Exception as e:  # rate_limited / relay hiccups
                last = e
                msg = str(e).lower()
                wait = 8 * (i + 1)
                if "rate" in msg:
                    wait = 15 * (i + 1)
                time.sleep(wait)
        raise RuntimeError(f"tool {name} failed after {tries} tries: {last}")

    async def text(self, name: str, args: dict | None = None) -> str:
        res = await self.call(name, args)
        parts = []
        for c in getattr(res, "content", []) or []:
            parts.append(getattr(c, "text", "") or "")
        return "\n".join(p for p in parts if p)


@asynccontextmanager
async def connect():
    if not config.TOKEN:
        raise SystemExit(
            "OM_MCP_TOKEN is empty. Create an agent token at "
            "https://openmarket.xyz/chart/console/agents (scopes: read + chart), "
            "put it in agent/.env, then re-run."
        )
    headers = {"Authorization": f"Bearer {config.TOKEN}"}
    # Newer mcp SDKs take auth via a custom httpx client, not a headers kwarg.
    async with httpx.AsyncClient(
        headers=headers, timeout=httpx.Timeout(30.0, read=120.0)
    ) as http:
        async with streamable_http_client(config.MCP_URL, http_client=http) as streams:
            # SDK arity changed across versions: older yields
            # (read, write, get_session_id), current yields (read, write).
            read_stream, write_stream = streams[0], streams[1]
            async with ClientSession(read_stream, write_stream) as session:
                await session.initialize()
                listed = await session.list_tools()
                conn = Conn(session, listed.tools)
                # keep a local inventory for offline debugging
                try:
                    inv = {n: conn.schema(n) for n in conn.names()}
                    (config.HERE / ".tools.json").write_text(
                        json.dumps(inv, indent=1, default=str)
                    )
                except Exception:
                    pass
                yield conn
