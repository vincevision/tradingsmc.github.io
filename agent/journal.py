"""Journal: every observation appended, skips included — the skips are the strategy."""
from __future__ import annotations

import datetime

from . import config

PATH = config.HERE / "journal.md"


def write(obs: dict, prop: dict, verdict: dict, acted: list[str]) -> None:
    now = datetime.datetime.now().strftime("%Y-%m-%d %H:%M")
    if not PATH.exists():
        PATH.write_text("# SMC agent journal\n\n_Every cycle, passes and skips alike._\n")
    lines = [f"\n## {now} · {obs.get('symbol','?')} {obs.get('timeframe','?')} · {verdict['verdict'].upper()}\n"]
    if verdict.get("checks"):
        lines.append("- checks: " + ", ".join(f"{k}={v}" for k, v in verdict["checks"].items()))
    if verdict.get("reasons"):
        for r in verdict["reasons"]:
            lines.append(f"- {r}")
    if prop.get("side", "none") != "none":
        lines.append(
            f"- proposal: {prop.get('side')} zone {prop.get('zone')} entry "
            f"{prop.get('entry')} stop {prop.get('stop')} target {prop.get('target')} "
            f"— {prop.get('reason','')}"
        )
    else:
        lines.append("- proposal: none")
    if acted:
        lines.append("- acted: " + "; ".join(acted))
    with PATH.open("a") as f:
        f.write("\n".join(lines) + "\n")
