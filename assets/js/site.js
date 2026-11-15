/* VinceVision SMC — shared header, case-study menu and lightbox.
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
    pair: "USD/JPY",
    title: "Weekly, Daily and 4H Swing Long",
    href: "cases/usdjpy-weekly-daily-4h.html",
    thumb: "assets/img/usdjpy-weekly-daily-4h/09-result.png",
    direction: "Long",
    model: "Weekly BoS → Daily demand → 4H demand",
    result: "TP hit · ≈ 1:2.25",
    summary:
      "The weekly breaks a two-year high. The daily returns to demand and shifts up. On the 4H a range low is swept into the zone, structure shifts, and the long is taken at the 4H demand toward the daily supply above."
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
    pair: "GBP/JPY",
    title: "Three Timeframes: 1H, 15m, 5m",
    href: "cases/gbpjpy-1h-15m-5m.html",
    thumb: "assets/img/gbpjpy-1h-15m-5m/00-cover.png",
    direction: "Long",
    model: "1H OB → 15m OB → 5m OB",
    result: "TP hit · ≈ 1:2.5",
    summary:
      "The 1H uptrend pulls back into its order block with a sweep. The 15m shifts up and leaves an order block. Price returns, the 5m sweeps and shifts inside it, and the long is taken at the 5m order block toward the high above."
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
    pair: "AUD/USD",
    title: "Short From the 1H Order Block",
    href: "cases/audusd-1h-ob-short.html",
    thumb: "assets/img/audusd-1h-ob-short/00-cover.png",
    direction: "Short",
    model: "1H MSS → 1H OB → 15m OB",
    result: "TP hit · ≈ 1:2.5",
    summary:
      "The 1H takes an old high and shifts down. Price returns to the 1H order block, the 15m sweeps and shifts there, and the short is taken at the 15m order block after the inducement high is cleared, targeting the low."
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
  },
  {
    pair: "GBP/USD",
    title: "Simple Confirmation Entry",
    href: "cases/gbpusd-simple-confirmation-entry.html",
    thumb: "assets/img/gbpusd-simple-confirmation-entry/00-cover.png",
    direction: "Short",
    model: "1H BoS → 15m supply → 15m MSS",
    result: "TP hit · ≈ 1:3.8",
    summary:
      "The 1H breaks structure down and bounces. The 15m rallies into supply, takes two highs and shifts down. The short is taken at the new supply the shift leaves, targeting the low."
  },
  {
    pair: "Volatility 75 (1s)",
    title: "1H Supply Short",
    href: "cases/v75-1h-supply-short.html",
    thumb: "assets/img/v75-1h-supply-short/01-1h.png",
    direction: "Short",
    model: "1H sweep → BoS → 1H supply",
    result: "Target reached · ≈ 1:4.9",
    summary:
      "Price sweeps a high and breaks two 1H lows. Two days later it returns to the supply that caused the break, taking a lower high on the way. The short is taken at the zone edge toward the demand below. A synthetic index, kept separate from the other cases."
  }
];

/*
 * Videos. To add a video to a page, paste its link between the quotes.
 * YouTube, Vimeo and Google Drive links are accepted as they appear in the
 * address bar or the Share button. Leave the quotes empty for no video.
 * For a case study use its path, for example "cases/usdjpy-confirmation-entry.html".
 */
const VIDEOS = {
  "structure-entries.html": "",
  "internal-external.html": "",
  "liquidity.html": "",
  "inducement.html": "",
  "bos-quality.html": "",
  "supply-demand.html": "",
  "entry-models.html": "",
  "top-down.html": "",
  "full-sequence.html": "",
  "failed-trade.html": "",
  "notes.html": "",
  "strategy.html": "",
  "sweep-model.html": "",
  "playbook.html": "",
  "checklist.html": "",
};

const STUDY_PATH = [
 {
  "href": "structure-entries.html",
  "title": "Structure and entry models",
  "part": "Part 1 · Concepts",
  "q": "Which low is strong, which high is weak, and why?"
 },
 {
  "href": "internal-external.html",
  "title": "Internal and external structure",
  "part": "Part 1 · Concepts",
  "q": "Is a break of a small low inside a pullback a trend change?"
 },
 {
  "href": "liquidity.html",
  "title": "Types of liquidity",
  "part": "Part 1 · Concepts",
  "q": "Name three places where stops collect."
 },
 {
  "href": "inducement.html",
  "title": "Inducement",
  "part": "Part 1 · Concepts",
  "q": "Why is the first zone price reaches often not the one to trade?"
 },
 {
  "href": "bos-quality.html",
  "title": "Good and bad break of structure",
  "part": "Part 1 · Concepts",
  "q": "What makes a low protected?"
 },
 {
  "href": "supply-demand.html",
  "title": "Imbalance, supply and demand",
  "part": "Part 1 · Concepts",
  "q": "What three things must a zone have?"
 },
 {
  "href": "entry-models.html",
  "title": "Entry models",
  "part": "Part 1 · Concepts",
  "q": "What do you wait for in a confirmation entry?"
 },
 {
  "href": "top-down.html",
  "title": "Top-down analysis",
  "part": "Part 1 · Concepts",
  "q": "Which timeframe gives the direction and which gives the entry?"
 },
 {
  "href": "full-sequence.html",
  "title": "The full sequence",
  "part": "Part 1 · Concepts",
  "q": "Put these in order: zone, sweep, shift."
 },
 {
  "href": "failed-trade.html",
  "title": "Why a trade failed: context before the signal",
  "part": "Part 1 · Concepts",
  "q": "Name two things that were wrong with the long before the entry."
 },
 {
  "href": "notes.html",
  "title": "Trading notes: the routine in order",
  "part": "Part 2 · The method",
  "q": "Can you say the ten notes from memory?"
 },
 {
  "href": "strategy.html",
  "title": "The zone model, step by step",
  "part": "Part 2 · The method",
  "q": "Where does the stop go, and what is the minimum reward to risk?"
 },
 {
  "href": "sweep-model.html",
  "title": "The sweep model, step by step",
  "part": "Part 2 · The method",
  "q": "When do you use the sweep model and not the zone model?"
 },
 {
  "href": "playbook.html",
  "title": "The playbook",
  "part": "Part 2 · The method",
  "q": "How much of the account do you risk on one trade?"
 },
 {
  "href": "cases/usdjpy-confirmation-entry.html",
  "title": "USD/JPY: Confirmation Entry",
  "part": "Part 3 · Case studies",
  "q": "Where was the stop and why there?"
 },
 {
  "href": "cases/gbpjpy-sweep-before-structure.html",
  "title": "GBP/JPY: Strong Structure Starts With a Sweep",
  "part": "Part 3 · Case studies",
  "q": "Which low was swept before the shift?"
 },
 {
  "href": "cases/btcusd-after-the-sweep.html",
  "title": "BTC/USD: What Happens After the Sweep",
  "part": "Part 3 · Case studies",
  "q": "How deep did price go into the zone before turning?"
 },
 {
  "href": "cases/audusd-real-zone.html",
  "title": "AUD/USD: Waiting for the Real Zone",
  "part": "Part 3 · Case studies",
  "q": "What told you the first reaction was not the entry?"
 },
 {
  "href": "cases/btcusd-sweep-shift-zone.html",
  "title": "BTC/USD: Sweep, Shift and Zone",
  "part": "Part 3 · Case studies",
  "q": "What is the order of the three events?"
 },
 {
  "href": "cases/gbpaud-trade-breakdown.html",
  "title": "GBP/AUD: Trade Breakdown",
  "part": "Part 3 · Case studies",
  "q": "Which level was the inducement?"
 },
 {
  "href": "cases/usdjpy-case-study-breakdown.html",
  "title": "USD/JPY: Case Study Breakdown",
  "part": "Part 3 · Case studies",
  "q": "What did each timeframe add?"
 },
 {
  "href": "cases/gbpjpy-1h-15m-5m.html",
  "title": "GBP/JPY: Three Timeframes",
  "part": "Part 3 · Case studies",
  "q": "Why did the 5m entry allow a smaller stop?"
 },
 {
  "href": "cases/xauusd-institutional-flow.html",
  "title": "XAU/USD: Textbook Institutional Flow",
  "part": "Part 3 · Case studies",
  "q": "Which edge of a supply zone takes the sell limit?"
 },
 {
  "href": "cases/gbpusd-simple-confirmation-entry.html",
  "title": "GBP/USD: Simple Confirmation Entry",
  "part": "Part 3 · Case studies",
  "q": "Where does the stop go on a short, and what is added to it?"
 },
 {
  "href": "cases/audusd-1h-ob-short.html",
  "title": "AUD/USD: Short From the 1H Order Block",
  "part": "Part 3 · Case studies",
  "q": "Would a deeper order have been filled?"
 },
 {
  "href": "cases/usdjpy-weekly-daily-4h.html",
  "title": "USD/JPY: Weekly, Daily and 4H Swing Long",
  "part": "Part 3 · Case studies",
  "q": "How does a wide stop change the position size?"
 },
 {
  "href": "cases/v75-1h-supply-short.html",
  "title": "Volatility 75 (1s): 1H Supply Short",
  "part": "Part 3 · Case studies",
  "q": "Why is this case kept apart from the others?"
 },
 {
  "href": "checklist.html",
  "title": "Live checklist",
  "part": "Part 4 · Practice",
  "q": "Did every step pass before you placed the order?"
 }
];

window.SMC_SITE = { k: "VERiQm1vQ2Uzbm16S1Q=" };
window.SMC_CHAT = window.SMC_CHAT || { v: "34" };

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
        <a class="brand" href="${root}index.html">VinceVision <span>SMC</span></a>
        <nav class="nav" aria-label="Main">
          <a class="hide-sm" href="${root}index.html"${cur("index.html")}>Home</a>
          <a href="${root}guide.html"${cur("guide.html")}>Start here</a>
          <details>
            <summary>Strategy</summary>
            <div class="menu">
              <a href="${root}notes.html"${cur("notes.html")}>Notes<small>The routine in ten short notes</small></a>
              <a href="${root}strategy.html"${cur("strategy.html")}>Zone model<small>Step by step: from a demand or supply zone</small></a>
              <a href="${root}sweep-model.html"${cur("sweep-model.html")}>Sweep model<small>Step by step: a swept low or high, then a shift</small></a>
            </div>
          </details>
          <a href="${root}checklist.html"${cur("checklist.html")}>Checklist</a>
          <a href="${root}playbook.html"${cur("playbook.html")}>Playbook</a>
          <details>
            <summary>Concepts</summary>
            <div class="menu">
              <a href="${root}entry-models.html"${cur("entry-models.html")}>Entry models<small>Aggressive vs confirmation entry</small></a>
              <a href="${root}structure-entries.html"${cur("structure-entries.html")}>Structure &amp; entry models<small>Strong and weak points, four ways to enter</small></a>
              <a href="${root}internal-external.html"${cur("internal-external.html")}>Internal &amp; external structure<small>Two structures, two kinds of liquidity, four sweeps</small></a>
              <a href="${root}supply-demand.html"${cur("supply-demand.html")}>Imbalance, supply &amp; demand<small>How zones form and which ones to trade</small></a>
              <a href="${root}top-down.html"${cur("top-down.html")}>Top-down analysis<small>4H, 1H, 30m and 5m on one trade</small></a>
              <a href="${root}failed-trade.html"${cur("failed-trade.html")}>Why a trade failed<small>A 5m signal against a bearish 1H</small></a>
              <a href="${root}full-sequence.html"${cur("full-sequence.html")}>The full sequence<small>Structure, sweep, MSS, IMB and OB in one trade</small></a>
              <a href="${root}bos-quality.html"${cur("bos-quality.html")}>Good vs bad BoS<small>Protected and unprotected lows</small></a>
              <a href="${root}liquidity.html"${cur("liquidity.html")}>Types of liquidity<small>Swings, equal highs and lows, trendlines, ranges, sessions</small></a>
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
    // Only one dropdown open at a time; show the current page when a menu opens.
    allDetails.forEach((d) => {
      d.addEventListener("toggle", () => {
        if (!d.open) return;
        allDetails.forEach((o) => { if (o !== d) o.removeAttribute("open"); });
        const m = d.querySelector(".menu");
        const active = m && m.querySelector('[aria-current="page"]');
        if (m) m.scrollTop = active ? Math.max(0, active.offsetTop - m.clientHeight / 2) : 0;
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

  // ----- Video for this page -----
  (function () {
    const toEmbed = (u) => {
      u = String(u || "").trim();
      if (!/^https:\/\//i.test(u)) return "";
      let m;
      if ((m = u.match(/(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([\w-]{6,})/i))) {
        const t = u.match(/[?&](?:t|start)=(\d+)/);
        return "https://www.youtube-nocookie.com/embed/" + m[1] + "?rel=0" + (t ? "&start=" + t[1] : "");
      }
      if ((m = u.match(/vimeo\.com\/(?:video\/)?(\d+)/i))) return "https://player.vimeo.com/video/" + m[1];
      if ((m = u.match(/drive\.google\.com\/file\/d\/([\w-]+)/i))) return "https://drive.google.com/file/d/" + m[1] + "/preview";
      return u;
    };
    const inCases = /\/cases\/[^/]*$/.test(location.pathname);
    const key = (inCases ? "cases/" : "") + here;
    const src = toEmbed(VIDEOS[key]);
    const hero = document.querySelector("main .hero");
    if (!src || !hero) return;
    const h1 = document.querySelector("main h1");
    const sec = document.createElement("section");
    sec.id = "video";
    sec.className = "video-section";
    sec.innerHTML = `
      <div class="wrap narrow">
        <p class="eyebrow">Watch first</p>
        <h2>Video: ${esc(h1 ? h1.textContent.trim() : "this page")}</h2>
        <div class="video-frame">
          <iframe src="${esc(src)}" title="Video: ${esc(h1 ? h1.textContent.trim() : "this page")}" loading="lazy" allow="accelerometer; encrypted-media; gyroscope; picture-in-picture; fullscreen; web-share" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe>
        </div>
        <p class="small muted">Watch the video, then read the page below. The written steps are the reference.</p>
      </div>`;
    hero.insertAdjacentElement("afterend", sec);
    const toc = hero.querySelector(".toc");
    if (toc) toc.insertAdjacentHTML("afterbegin", '<li><a href="#video">Video</a></li>');
  })();

  // ----- Study path: next / previous bar on every page, progress on the guide -----
  (function () {
    const KEY = "smc-path-v1";
    let done = [];
    try { done = JSON.parse(localStorage.getItem(KEY) || "[]"); } catch (e) { done = []; }
    if (!Array.isArray(done)) done = [];
    const save = () => { try { localStorage.setItem(KEY, JSON.stringify(done)); } catch (e) {} };
    const total = STUDY_PATH.length;
    const firstOpen = () => STUDY_PATH.findIndex((s) => done.indexOf(s.href) < 0);
    const inCases = /\/cases\/[^/]*$/.test(location.pathname);
    const idx = STUDY_PATH.findIndex((s) => isCurrent(s.href) && (s.href.indexOf("cases/") === 0) === inCases);

    // Guide page
    const cont = document.getElementById("path-continue");
    if (cont) {
      document.querySelectorAll(".path-list li[data-step]").forEach((li) => {
        if (done.indexOf(li.dataset.step) >= 0) {
          li.classList.add("done");
          const st = li.querySelector(".path-state");
          if (st) st.textContent = "Studied";
        }
      });
      const f = firstOpen();
      const prog = document.getElementById("path-progress");
      if (prog) prog.textContent = done.length ? Math.min(done.length, total) + " of " + total + " studied" : "";
      if (f < 0) { cont.textContent = "All steps studied: what to do next"; cont.setAttribute("href", "#after"); }
      else if (f > 0 || done.length) { cont.textContent = "Continue with step " + (f + 1) + ": " + STUDY_PATH[f].title; cont.setAttribute("href", root + STUDY_PATH[f].href); }
    }

    if (idx < 0) return;
    const step = STUDY_PATH[idx];
    const prev = STUDY_PATH[idx - 1];
    const next = STUDY_PATH[idx + 1];
    const bar = document.createElement("aside");
    bar.className = "path-bar";
    bar.setAttribute("aria-label", "Study path");
    const render = () => {
      const f = firstOpen();
      const isDone = done.indexOf(step.href) >= 0;
      const behind = f >= 0 && f < idx;
      bar.innerHTML = `
        <div class="wrap">
          <p class="path-where"><a href="${root}guide.html">Study path</a> · Step ${idx + 1} of ${total} · ${esc(step.part)}</p>
          ${behind ? `<p class="path-warn">You have not ticked step ${f + 1} yet: <a href="${root}${STUDY_PATH[f].href}">${esc(STUDY_PATH[f].title)}</a>. The pages build on each other, so it is best to go back to it first.</p>` : ""}
          <p class="path-q"><strong>Before you go on:</strong> ${esc(step.q)}</p>
          <label class="path-tick"><input type="checkbox" id="path-done"${isDone ? " checked" : ""}> I have studied this page</label>
          <div class="path-links">
            ${prev ? `<a class="btn ghost" href="${root}${prev.href}">← Step ${idx}: ${esc(prev.title)}</a>` : `<a class="btn ghost" href="${root}guide.html">← Start here</a>`}
            ${next ? `<a class="btn" href="${root}${next.href}">Next, step ${idx + 2}: ${esc(next.title)} →</a>` : `<a class="btn" href="${root}guide.html#after">Finished: what to do next →</a>`}
          </div>
        </div>`;
      bar.querySelector("#path-done").addEventListener("change", (e) => {
        done = done.filter((h) => h !== step.href);
        if (e.target.checked) done.push(step.href);
        save();
        render();
      });
    };
    render();
    const footer = document.querySelector("footer.site-footer");
    if (footer && footer.parentNode) footer.parentNode.insertBefore(bar, footer);
    else document.body.appendChild(bar);
  })();

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

  // ----- Site assistant (loaded after the page so it never blocks reading) -----
  const chat = document.createElement("script");
  chat.src = root + "assets/js/chat.js?v=" + window.SMC_CHAT.v;
  chat.defer = true;
  document.body.appendChild(chat);
})();
