#!/usr/bin/env python3
"""Build assets/chat/knowledge.json, the text the site chatbot answers from.

Run from the repository root after adding or editing a page:

    python3 tools/build_knowledge.py

Each <section> of each page becomes one entry: page title, section heading,
link and plain text. Redirect stubs are skipped. The "meta" block of an
existing knowledge.json is kept as it is.
"""
import json, os, re
from html.parser import HTMLParser

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "assets", "chat", "knowledge.json")
SKIP = {"script", "style", "svg", "header", "footer", "button"}
BLOCK = {"p", "li", "h1", "h2", "h3", "h4", "tr", "figcaption", "div", "ul", "ol", "table", "section"}


class Page(HTMLParser):
    def __init__(self):
        super().__init__()
        self.title, self.chunks = "", []
        self.cur = None            # current chunk
        self.skip = 0
        self.tag = None
        self.h1 = ""

    def start_chunk(self, anchor):
        self.cur = {"id": anchor, "h": "", "t": []}
        self.chunks.append(self.cur)

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag in SKIP:
            # Keep the alt text of screenshots: it describes the chart.
            self.skip += 1
            return
        if self.skip:
            if tag == "img" and a.get("alt") and self.cur:
                self.cur["t"].append("\nChart: " + a["alt"] + "\n")
            return
        if tag == "main" and self.cur is None:
            self.start_chunk("")
        if tag == "section":
            self.start_chunk(a.get("id", ""))
        self.tag = tag
        if self.cur and tag in BLOCK:
            self.cur["t"].append("\n")
        if self.cur and tag in ("td", "th"):
            self.cur["t"].append(" | ")

    def handle_endtag(self, tag):
        if tag in SKIP:
            self.skip = max(0, self.skip - 1)
            return
        if self.cur and tag in BLOCK:
            self.cur["t"].append("\n")
        self.tag = None

    def handle_data(self, data):
        if self.tag == "title":
            self.title += data
            return
        if self.skip or not self.cur:
            return
        if self.tag == "h1":
            self.h1 += data
        if self.tag == "h2" and not self.cur["h"]:
            self.cur["h"] = data.strip()
        self.cur["t"].append(data)


def clean(parts):
    s = "".join(parts)
    s = re.sub(r"[ \t\r\f\v]+", " ", s)
    s = re.sub(r" ?\n ?", "\n", s)
    s = re.sub(r"\n{2,}", "\n", s)
    return s.strip()


def main():
    pages = []
    for d, _, files in os.walk(ROOT):
        rel = os.path.relpath(d, ROOT).split(os.sep)
        if ".git" in rel or "node_modules" in rel:
            continue
        for f in sorted(files):
            if f.endswith(".html"):
                pages.append(os.path.relpath(os.path.join(d, f), ROOT).replace(os.sep, "/"))
    order = lambda p: (p.startswith("cases/"), p not in ("index.html", "playbook.html"), p)
    entries = []
    for p in sorted(pages, key=order):
        html = open(os.path.join(ROOT, p), encoding="utf-8").read()
        if "<main" not in html:          # redirect stub
            continue
        pg = Page()
        pg.feed(html)
        title = (pg.title.split(" — ")[0] or pg.h1).strip()
        if p == "index.html":
            title = "Home"
        for c in pg.chunks:
            text = clean(c["t"])
            if len(text) < 80:
                continue
            entries.append({
                "u": p + ("#" + c["id"] if c["id"] else ""),
                "p": title,
                "h": c["h"] or ("Introduction" if not c["id"] else c["id"]),
                "t": text,
            })
    meta = {}
    if os.path.exists(OUT):
        try:
            meta = json.load(open(OUT, encoding="utf-8")).get("meta", {})
        except Exception:
            meta = {}
    json.dump({"meta": meta, "entries": entries}, open(OUT, "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
    print(len(entries), "entries,", sum(len(e["t"]) for e in entries), "characters ->", os.path.relpath(OUT, ROOT))


if __name__ == "__main__":
    main()
