/* SMC Case Studies — shared header, case-study menu and lightbox.
 *
 * TO ADD A NEW CASE STUDY:
 *   1. Put the screenshots in assets/img/<slug>/
 *   2. Copy cases/usdjpy-confirmation-entry.html to cases/<slug>.html and edit it
 *   3. Add one entry to CASES below — the menu and the home page update themselves.
 */
const CASES = [
  {
    pair: "USD/JPY",
    title: "Confirmation Entry",
    href: "cases/usdjpy-confirmation-entry.html",
    thumb: "assets/img/usdjpy-confirmation-entry/00-cover.png",
    direction: "Long",
    model: "4H demand → 30m MSS → 15m OB",
    result: "TP hit · ≈ 1:3",
    summary:
      "Price returns to a 4H demand zone, sweeps the last low, shifts structure on the 30m, and offers a 15m order-block entry targeting the opposing 30m supply."
  },
  {
    pair: "USD/JPY",
    title: "Case Study Breakdown",
    href: "cases/usdjpy-case-study-breakdown.html",
    thumb: "assets/img/usdjpy-case-study-breakdown/00-cover.png",
    direction: "Long",
    model: "1H MSS → 30m demand → 15m demand",
    result: "TP hit · ≈ 1:3.3",
    summary:
      "The 1H sweeps a low and shifts bullish. Price returns to the 30m demand through the inducement low. The 15m sweeps and shifts at the zone, and the long is taken at the 15m demand toward the high above."
  },
  {
    pair: "XAU/USD",
    title: "Textbook Institutional Flow",
    href: "cases/xauusd-institutional-flow.html",
    thumb: "assets/img/xauusd-institutional-flow/00-cover.png",
    direction: "Short",
    model: "4H sweep + MSS → 1H sweep → 15m OB",
    result: "TP hit · ≈ 1:3.8",
    summary:
      "The 4H sweeps a high and shifts bearish. The pullback runs the 1H internal highs, the 15m shifts down, and the short is taken from the order block to the demand zone below."
  },
  {
    pair: "GBP/JPY",
    title: "Strong Structure Starts With a Sweep",
    href: "cases/gbpjpy-sweep-before-structure.html",
    thumb: "assets/img/gbpjpy-sweep-before-structure/00-cover.png",
    direction: "Long",
    model: "HTF sweep → 15m MSS → 15m OB",
    result: "TP hit · ≈ 1:3.8",
    summary:
      "The higher timeframe sweeps its low and recovers. The 15m then breaks structure up, and the long is taken from the order block, after the lows above it are cleared, to the buy-side liquidity overhead."
  },
  {
    pair: "BTC/USD",
    title: "What Happens After the Sweep",
    href: "cases/btcusd-after-the-sweep.html",
    thumb: "assets/img/btcusd-after-the-sweep/00-cover.png",
    direction: "Long",
    model: "Sweep → 15m MSS → wait for OB",
    result: "TP hit · ≈ 1:3.5",
    summary:
      "Price sweeps a low and shifts up on the 15m, then rallies without filling the order. About nine hours later it returns deep into the order block, fills the long and runs to the highs."
  },
  {
    pair: "BTC/USD",
    title: "Sweep, Shift and Zone",
    href: "cases/btcusd-sweep-shift-zone.html",
    thumb: "assets/img/btcusd-sweep-shift-zone/00-cover.png",
    direction: "Long",
    model: "4H sweep + MSS → 1H MSS → 1H demand",
    result: "TP hit · ≈ 1:3.4",
    summary:
      "The 4H sweeps its range lows and shifts up. On the 1H, equal lows are run into demand, structure shifts, and the long is taken from the 1H demand the shift leaves behind."
  },
  {
    pair: "AUD/USD",
    title: "Waiting for the Real Zone",
    href: "cases/audusd-real-zone.html",
    thumb: "assets/img/audusd-real-zone/04-result.png",
    direction: "Long",
    model: "H4 demand → M15 MSS → M15 demand",
    result: "TP hit · ≈ 1:3.2",
    summary:
      "H4 is bullish and price reaches demand. The M15 shifts up, then offers two entries that are early. The long is taken at the M15 demand at the origin of the shift, after the inducement and the lows above the zone are cleared."
  },
  {
    pair: "GBP/AUD",
    title: "Trade Breakdown",
    href: "cases/gbpaud-trade-breakdown.html",
    thumb: "assets/img/gbpaud-trade-breakdown/00-cover.png",
    direction: "Long",
    model: "1H demand → 15m MSS → 15m demand",
    result: "TP hit · ≈ 1:2.9",
    summary:
      "A 1H demand that broke structure is tapped. The 15m ranges, sweeps the range low and shifts on one candle. The long is taken at the 15m demand after the inducement low is cleared, targeting the high above."
  }
];

(function () {
  const root = document.documentElement.dataset.root || "";
  const here = location.pathname.split("/").pop() || "index.html";
  const isCurrent = (href) => href.split("/").pop() === here;

  // Group cases by pair, keeping first-seen order.
  const byPair = [];
  CASES.forEach((c) => {
    let g = byPair.find((x) => x.pair === c.pair);
    if (!g) byPair.push((g = { pair: c.pair, items: [] }));
    g.items.push(c);
  });

  const esc = (s) => String(s).replace(/[&<>"]/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[ch]));
  const cur = (href) => (isCurrent(href) ? ' aria-current="page"' : "");

  // ----- Header -----
  const header = document.getElementById("site-header");
  if (header) {
    const menu = byPair
      .map(
        (g) =>
          `<div class="pair">${esc(g.pair)}</div>` +
          g.items
            .map((c) => `<a href="${root}${c.href}"${cur(c.href)}>${esc(c.title)}<small>${esc(c.model)}</small></a>`)
            .join("")
      )
      .join("");
    header.className = "site-header";
    header.innerHTML = `
      <div class="wrap">
        <a class="brand" href="${root}index.html">SMC <span>Case Studies</span></a>
        <nav class="nav" aria-label="Main">
          <a class="hide-sm" href="${root}index.html"${cur("index.html")}>Home</a>
          <a href="${root}playbook.html"${cur("playbook.html")}>Playbook</a>
          <details>
            <summary>Concepts</summary>
            <div class="menu">
              <a href="${root}entry-models.html"${cur("entry-models.html")}>Entry models<small>Aggressive vs confirmation entry</small></a>
              <a href="${root}liquidity.html"${cur("liquidity.html")}>Types of liquidity<small>Trendlines, ranges and session highs and lows</small></a>
              <a href="${root}inducement.html"${cur("inducement.html")}>Inducement<small>The liquidity trap before the real zone</small></a>
            </div>
          </details>
          <details>
            <summary>Case studies</summary>
            <div class="menu">${menu}</div>
          </details>
        </nav>
      </div>`;
    const allDetails = header.querySelectorAll("details");
    document.addEventListener("click", (e) => {
      allDetails.forEach((d) => {
        if (!d.contains(e.target)) d.removeAttribute("open");
      });
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") allDetails.forEach((d) => d.removeAttribute("open"));
    });
  }

  // ----- Home page case list -----
  const list = document.getElementById("case-list");
  if (list) {
    list.innerHTML = byPair
      .map(
        (g) => `
        <div class="pair-heading"><h3>${esc(g.pair)}</h3><span>${g.items.length} case ${g.items.length === 1 ? "study" : "studies"}</span></div>
        <div class="grid c2">
          ${g.items
            .map(
              (c) => `
            <a class="card case-card" href="${root}${c.href}">
              <div class="thumb"><img src="${root}${c.thumb}" alt="" loading="lazy"></div>
              <div>
                <h3>${esc(c.pair)} — ${esc(c.title)}</h3>
                <p>${esc(c.summary)}</p>
                <ul class="chips">
                  <li class="chip ${c.direction === "Short" ? "supply" : "demand"}">${esc(c.direction)}</li>
                  <li class="chip">${esc(c.model)}</li>
                  <li class="chip target">${esc(c.result)}</li>
                </ul>
              </div>
            </a>`
            )
            .join("")}
        </div>`
      )
      .join("");
  }

  // ----- Lightbox for screenshots -----
  const shots = document.querySelectorAll(".shot");
  if (shots.length) {
    const box = document.createElement("div");
    box.className = "lightbox";
    box.setAttribute("role", "dialog");
    box.setAttribute("aria-label", "Enlarged chart");
    box.innerHTML = "<img alt=''>";
    document.body.appendChild(box);
    const close = () => box.classList.remove("open");
    shots.forEach((s) =>
      s.addEventListener("click", () => {
        const img = s.querySelector("img");
        box.firstChild.src = img.src;
        box.firstChild.alt = img.alt;
        box.classList.add("open");
      })
    );
    box.addEventListener("click", close);
    document.addEventListener("keydown", (e) => e.key === "Escape" && close());
  }
})();
