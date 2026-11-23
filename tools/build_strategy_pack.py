#!/usr/bin/env python3
"""Export the site's rules into agent/strategy.md — the site stays the source
of truth; the agent reads the export. Run from the repo root:

    python3 tools/build_strategy_pack.py
"""
import pathlib
import re

ROOT = pathlib.Path(__file__).resolve().parent.parent


def strip(html: str) -> str:
    html = re.sub(r"<(script|style)[\s\S]*?</\1>", " ", html)
    html = re.sub(r"<svg[\s\S]*?</svg>", " ", html)
    html = re.sub(r"<(li|p|div|h[1-6]|figcaption)[^>]*>", "\n", html)
    html = re.sub(r"<br[^>]*>", "\n", html)
    html = re.sub(r"<[^>]+>", "", html)
    html = html.replace("&amp;", "&").replace("&nbsp;", " ").replace("&#39;", "'")
    html = html.replace("&lt;", "<").replace("&gt;", ">").replace("&rdquo;", '"').replace("&ldquo;", '"')
    lines = [re.sub(r"\s+", " ", ln).strip() for ln in html.splitlines()]
    return "\n".join(ln for ln in lines if ln)


def section(html: str, sid: str) -> str:
    i = html.find(f'<section id="{sid}"')
    if i < 0:
        return ""
    j = html.find("</section>", i)
    return strip(html[i:j])


def cut(text: str, n: int = 1700) -> str:
    return text if len(text) <= n else text[:n].rsplit(" ", 1)[0] + " […]"


kp = (ROOT / "key-points.html").read_text()
notes = (ROOT / "notes.html").read_text()
play = (ROOT / "playbook.html").read_text()
em = (ROOT / "entry-models.html").read_text()

out = ["# VinceVision SMC strategy pack", "",
       "_Exported from the live site by tools/build_strategy_pack.py. Do not edit_",
       "_by hand: edit the site and re-run._", ""]

for sid, title in [
    ("sequence", "The only sequence"),
    ("origin", "Origin decides the target"),
    ("routine", "The routine in four steps"),
    ("mirror", "Exhibit D and the memorised probability note"),
    ("risk", "Risk"),
    ("skips", "The skips are the strategy"),
]:
    body = section(kp, sid)
    if body:
        out += [f"## {title}  _(key-points.html#{sid})_", "", cut(body), ""]

titles = re.findall(r'<section id="n\d+">[\s\S]*?<h2>(.*?)</h2>', notes)
pinned = re.findall(r'<span class="sn-title">(.*?)</span>\s*<p>(.*?)</p>', notes)
out += ["## The thirteen notes, pinned  _(notes.html)_", ""]
out += [f"- {re.sub(r'<[^>]+>', '', t)}" for t in titles]
out += [""]
for name, body in pinned:
    out += [f"**{name}** — {re.sub(r'<[^>]+>', '', body)}", ""]

i = play.find("have in common")
if i > 0:
    j = play.find("</section>", i)
    out += ["## What the cases have in common  _(playbook.html)_", "",
            cut(section(play[:j], "") or strip(play[i - 200 : j]), 1200), ""]

i = em.find('<section id="confirmation"')
if i > 0:
    j = em.find("</section>", i)
    out += ["## Confirmation vs aggressive entry  _(entry-models.html#confirmation)_", "",
            cut(strip(em[i:j]), 1200), ""]

dest = ROOT / "agent" / "strategy.md"
dest.write_text("\n".join(out) + "\n")
print(f"wrote {dest} — {len(dest.read_text())} chars")
