"""Strategy pack loader: the site is the curriculum, strategy.md is the cache.

Regenerate with:  python tools/build_strategy_pack.py   (from the repo root)
"""
from __future__ import annotations

from . import config

HEADER = (
    "You are the proposal engine of VinceVision SMC, a local trading agent. "
    "You trade nothing and decide nothing: you name at most one setup per "
    "observation, in the JSON schema given, and a separate hard-coded gate "
    "accepts or refuses it. The rules below are the owner's own site, "
    "exported verbatim where marked. Where the site and your instinct "
    "disagree, the site wins.\n\n"
)


def load() -> str:
    p = config.HERE / "strategy.md"
    if not p.exists():
        return HEADER + "(strategy.md missing — run tools/build_strategy_pack.py)"
    return HEADER + p.read_text()
