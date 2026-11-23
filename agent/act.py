"""Act: draw the marks, arm the tap-alert, and (four locks deep) place orders.

Everything here is schema-driven: tool names and argument shapes are read
from the live inventory at runtime, never hardcoded, because the connector's
tool surface is not ours to freeze. When a shape cannot be understood the
action is skipped and journaled — silence is never an option.
"""
from __future__ import annotations

import json
import uuid

from . import config
from .mcp_client import Conn


def _fill(schema: dict, want: dict) -> dict:
    """Map our canonical keys onto whatever the tool's schema calls them."""
    props = schema.get("properties", {})
    args: dict = {}
    for canon, value in want.items():
        if value is None:
            continue
        for alias in (canon, *want_aliases(canon)):
            if alias in props:
                args[alias] = value
                break
    return args


def want_aliases(canon: str) -> tuple:
    return {
        "price": ("value", "level", "price1", "y"),
        "price2": ("level2", "y2"),
        "time": ("t", "x", "bar_time", "timestamp"),
        "time2": ("t2", "x2"),
        "symbol": ("ticker", "market", "pair"),
        "condition": ("op", "type"),
        "text": ("label", "name", "note"),
    }.get(canon, ())


DRAW_ADD = ("chart_drawing_add", "drawing_add", "draw_add", "drawing_create")


def _enum_pick(schema: dict, keys: tuple, *subs: str):
    """First enum member (of any of `keys`) whose name contains any of `subs`."""
    props = schema.get("properties", {})
    for key in keys:
        e = (props.get(key) or {}).get("enum") or []
        for sub in subs:
            for v in e:
                if sub in str(v).lower():
                    return key, v
        if e and key == "shape":
            return key, e[0]
    return None, None


def _fill_nested(schema: dict, want: dict) -> dict:
    """_fill, plus the single-nested-object payload shape some schemas use."""
    args = _fill(schema, want)
    if args:
        return args
    props = schema.get("properties", {})
    objs = [k for k, v in props.items() if isinstance(v, dict) and v.get("type") == "object"]
    if len(objs) == 1:
        inner = _fill(props[objs[0]], want)
        if inner:
            return {objs[0]: inner}
    return {}


async def draw_marks(conn: Conn, prop: dict) -> list[str]:
    """Zone rectangle + entry/stop/target lines via the live drawing family."""
    add = conn.find(*DRAW_ADD)
    if not add:
        return ["no drawing tool on this token; marks stay in the journal"]
    schema = conn.schema(add)
    acted: list[str] = []
    zone = prop.get("zone") or []
    marks = [("zone", zone[0], zone[1])] if len(zone) == 2 else []
    marks += [(k, prop[k], None) for k in ("entry", "stop", "target")
              if prop.get(k) is not None]
    for kind, p1, p2 in marks:
        want = {"price": p1, "text": f"SMC {kind}"}
        if p2 is not None:
            want["price2"] = p2
        args = _fill_nested(schema, want)
        key, val = _enum_pick(
            schema, ("shape", "type", "kind", "tool"),
            *(("rect", "box") if p2 is not None else ("line", "hline", "ray")),
        )
        if key:
            args[key] = val
        if not args:
            acted.append(f"{kind}: payload shape not understood by {add}; left in journal")
            continue
        try:
            await conn.call(add, args)
            span = f"-{p2}" if p2 is not None else ""
            acted.append(f"drew {kind} {p1}{span} via {add}")
        except Exception as e:
            acted.append(f"{kind} draw refused: {e}")
    if not acted:
        acted.append("nothing drawable this cycle; marks stay in the journal")
    return acted


async def tap_alert(conn: Conn, obs: dict, prop: dict) -> list[str]:
    """One price alert at the zone edge so the tap wakes the agent."""
    zone = prop.get("zone") or []
    name = conn.find("alert_create")
    if not name:
        return (["no alert tool on this token (mcp:alerts not ticked at creation); "
                 "tap-alert skipped"] if len(zone) == 2 else [])
    if len(zone) != 2:
        return []
    edge = zone[1] if prop.get("side") == "short" else zone[0]
    args = _fill(
        conn.schema(name),
        {
            "symbol": obs.get("symbol"),
            "price": edge,
            "condition": "cross_up" if prop.get("side") == "short" else "cross_down",
            "text": f"SMC agent: tap of {zone[0]}-{zone[1]} ({prop.get('side')})",
        },
    )
    if not args:
        return []
    try:
        await conn.call(name, args)
        return [f"alert armed at zone edge {edge}"]
    except Exception as e:
        return [f"alert refused: {e}"]


async def trade(conn: Conn, obs: dict, prop: dict, confirm: bool) -> list[str]:
    """Four locks: AGENT_TRADE=true, --confirm, tab armed, human y at prompt."""
    if not config.TRADE:
        return ["trade path off (AGENT_TRADE=false)"]
    if not confirm:
        return ["trade path needs --confirm"]
    name = conn.find("order_place")
    if not name:
        return ["no order_place tool on this key"]
    side = prop.get("side")
    print(
        f"\nORDER PROPOSAL: {side} {obs.get('symbol')} entry {prop.get('entry')} "
        f"stop {prop.get('stop')} target {prop.get('target')}"
    )
    print("Your tab must have armed this agent (search 'Agent trading').")
    ans = input("Place it? y/N: ").strip().lower()
    if ans != "y":
        return ["human declined at the prompt"]
    idem = uuid.uuid4().hex
    args = _fill(
        conn.schema(name),
        {
            "symbol": obs.get("symbol"),
            "side": side,
            "price": prop.get("entry"),
            "stop": prop.get("stop"),
            "target": prop.get("target"),
        },
    )
    args["idempotency_key"] = idem
    try:
        res = await conn.text(name, args)
        return [f"order sent (idempotency {idem}): {res[:300]}"]
    except Exception as e:
        return [f"order refused: {e} (read account_orders before any retry)"]


def setup_hash(prop: dict) -> str:
    z = prop.get("zone") or [0, 0]
    return f"{prop.get('side')}:{round(float(z[0]), 5)}:{round(float(z[1]), 5)}"


def already_acted(prop: dict) -> bool:
    p = config.HERE / "last-setup.json"
    if not p.exists():
        return False
    try:
        return json.loads(p.read_text()).get("hash") == setup_hash(prop)
    except Exception:
        return False


def remember(prop: dict) -> None:
    (config.HERE / "last-setup.json").write_text(json.dumps({"hash": setup_hash(prop)}))
