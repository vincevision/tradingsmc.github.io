"""Config: .env parsing (no third-party dep) plus defaults."""
from __future__ import annotations

import os
from pathlib import Path

HERE = Path(__file__).resolve().parent


def _load_env() -> dict:
    env: dict[str, str] = {}
    path = HERE / ".env"
    if path.exists():
        for line in path.read_text().splitlines():
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            k, _, v = line.partition("=")
            env[k.strip()] = v.strip().strip('"').strip("'")
    return env


_ENV = _load_env()


def get(key: str, default: str = "") -> str:
    return os.environ.get(key) or _ENV.get(key) or default


TOKEN = get("OM_MCP_TOKEN")
GROQ_KEY = get("GROQ_API_KEY")
GROQ_MODEL = get("GROQ_MODEL", "openai/gpt-oss-120b")  # versatile was decommissioned 2026-08-16
MCP_URL = get("OM_MCP_URL", "https://mcp.openmarket.xyz/")
WORKSPACE = get("OM_WORKSPACE", "RV0MBetJ")
CADENCE_MIN = int(get("AGENT_CADENCE_MIN", "15"))
BARS = int(get("AGENT_BARS", "200"))
TRADE = get("AGENT_TRADE", "false").lower() in ("1", "true", "yes")

GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"


def missing() -> list[str]:
    out = []
    if not TOKEN:
        out.append("OM_MCP_TOKEN")
    if not GROQ_KEY:
        out.append("GROQ_API_KEY")
    return out
