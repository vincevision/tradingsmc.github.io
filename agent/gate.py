"""The gate: the LLM proposes, the checklist disposes.

Rules are the site's rules (key-points #sequence, #origin, the memorised
probability note, #risk). Numbers are re-checked against the pulled bars
wherever bars exist; without bars nothing passes, only 'watch'.
"""
from __future__ import annotations

TOL = 0.15  # fraction of zone height a sweep may miss the zone by


def _idx_by_time(bars, t):
    if t is None:
        return None
    for i, b in enumerate(bars):
        if str(b.get("t")) == str(t):
            return i
    return None


def check(prop: dict, bars) -> dict:
    """prop = brain's proposal. Returns {verdict, reasons[], checks{}}."""
    reasons: list[str] = []
    done: dict[str, str] = {}
    side = str(prop.get("side", "")).lower()
    if side not in ("long", "short"):
        return {"verdict": "none", "reasons": ["no setup proposed"], "checks": done}

    zone = prop.get("zone") or []
    try:
        zlo, zhi = float(zone[0]), float(zone[1])
    except Exception:
        zlo = zhi = None
    if zlo is None or zhi <= zlo:
        reasons.append("zone missing or inverted")
    height = (zhi - zlo) if zhi and zlo else 0.0
    tol = height * TOL if height else 0.0

    entry = _f(prop.get("entry"))
    stop = _f(prop.get("stop"))
    target = _f(prop.get("target"))
    if None in (entry, stop, target):
        reasons.append("entry/stop/target not all numeric")

    if entry is not None and stop is not None and target is not None:
        risk = abs(stop - entry)
        reward = abs(target - entry)
        if risk <= 0:
            reasons.append("zero risk")
        else:
            rr = reward / risk
            done["rr"] = f"{rr:.2f}"
            if rr < 2.0:
                reasons.append(f"R:R {rr:.2f} below the site minimum of 1:2")
        if side == "short":
            if stop <= entry:
                reasons.append("short stop not above entry")
            if target >= entry:
                reasons.append("short target not below entry")
            if zhi and stop < zhi:
                reasons.append("short stop inside the zone (must sit above its top)")
            if zlo and not (zlo - tol <= entry <= zhi + tol):
                reasons.append("short entry outside the zone band")
        else:
            if stop >= entry:
                reasons.append("long stop not below entry")
            if target <= entry:
                reasons.append("long target not above entry")
            if zlo and stop > zlo:
                reasons.append("long stop inside the zone (must sit below its floor)")
            if zlo and not (zlo - tol <= entry <= zhi + tol):
                reasons.append("long entry outside the zone band")

    # --- evidence cross-checks against bars ---
    sweep = prop.get("sweep") or {}
    shift = prop.get("shift") or {}
    s_idx = _idx_by_time(bars, sweep.get("time")) if bars else None
    h_idx = _idx_by_time(bars, shift.get("time")) if bars else None
    if bars:
        if s_idx is None:
            reasons.append("sweep time not found in pulled bars (unverified)")
        else:
            lvl = _f(sweep.get("level")) or bars[s_idx]["h" if side == "short" else "l"]
            if zlo is not None:
                inside = (zlo - tol) <= lvl <= (zhi + tol)
                done["sweep_at_zone"] = "yes" if inside else "no"
                if not inside:
                    reasons.append(
                        "sweep not at the zone: gate still allows it (a sweep + "
                        "shift is enough) but the extra probability is absent"
                    )
        if h_idx is None:
            reasons.append("shift time not found in pulled bars (unverified)")
        elif s_idx is not None and h_idx > s_idx:
            window = bars[s_idx:h_idx]
            if window:
                if side == "short":
                    pull_low = min(b["l"] for b in window)
                    ok = bars[h_idx]["c"] < pull_low
                    done["mss_down"] = "yes" if ok else "no"
                    if not ok:
                        reasons.append("no close below the pullback low at the shift bar")
                else:
                    pull_high = max(b["h"] for b in window)
                    ok = bars[h_idx]["c"] > pull_high
                    done["mss_up"] = "yes" if ok else "no"
                    if not ok:
                        reasons.append("no close above the pullback high at the shift bar")
        elif s_idx is not None:
            reasons.append("shift bar not after sweep bar")
        unverified = any("unverified" in r for r in reasons)
        if unverified:
            return {"verdict": "watch", "reasons": reasons, "checks": done}
    else:
        reasons.append("no candles available: cannot verify, watch only")
        return {"verdict": "watch", "reasons": reasons, "checks": done}

    hard = [r for r in reasons if "extra probability" not in r and "unverified" not in r]
    if hard:
        return {"verdict": "skip", "reasons": hard, "checks": done}
    return {"verdict": "pass", "reasons": reasons, "checks": done}


def _f(v):
    try:
        return float(v)
    except Exception:
        return None
