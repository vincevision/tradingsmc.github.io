/* VinceVision SMC — live checklist.
   Walks one trade through the nine strategy steps. Each step has boxes to
   tick and, on the chart steps, an optional screenshot that is sent to a
   vision model for a second opinion. Progress is saved in this browser. */
(function () {
  "use strict";
  const mount = document.getElementById("checklist-app");
  if (!mount) return;

  const STORE = "smc-checklist-v1";
  const VISION_MODELS = [
    "meta-llama/llama-4-scout-17b-16e-instruct",
    "meta-llama/llama-4-maverick-17b-128e-instruct",
    "llama-3.2-90b-vision-preview",
    "llama-3.2-11b-vision-preview"
  ];
  let visionModel = null;
  const shots = {}; // step id -> data URL, kept in memory only

  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const blank = () => ({ model: "zone", dir: "long", pair: "", htf: "4H", ltf: "15m", requireAi: true, steps: {}, order: {}, size: { kind: "usd", balance: "", risk: "1" }, result: {} });
  let S = blank();
  try { S = Object.assign(blank(), JSON.parse(localStorage.getItem(STORE) || "{}")); } catch (e) { S = blank(); }
  const save = () => { try { localStorage.setItem(STORE, JSON.stringify(S)); } catch (e) { /* storage unavailable */ } };
  const st = (id) => (S.steps[id] = S.steps[id] || { checks: [], ai: null, override: false });

  // ---------- step definitions ----------
  // Each text is written for a long and for a short.
  function steps() {
    const L = S.dir === "long";
    const d = (a, b) => (L ? a : b);
    const zone = S.model === "zone";
    const z = d("demand", "supply");
    const lowhigh = d("low", "high"), highlow = d("high", "low");
    const lows = d("lows", "highs"), above = d("above", "below"), below = d("below", "above");
    const list = [];

    list.push(zone ? {
      id: "direction", tf: S.htf, title: "Direction", chart: true,
      want: "The higher timeframe has just broken structure " + d("upward", "downward") + " and is pulling back.",
      checks: [
        "A " + S.htf + " candle has closed " + above + " the last " + highlow + " (break of structure).",
        "Price is now pulling back from that break.",
        "I have marked the weak " + highlow + " (target side) and the strong " + lowhigh + " the break came from."
      ],
      stop: ["The " + S.htf + " is moving sideways with no recent break.", "The last break was in the other direction."]
    } : {
      id: "direction", tf: S.htf, title: "Context", chart: true,
      want: "The higher timeframe is with the trade, or at least not moving hard against it.",
      checks: [
        "I have read the last " + S.htf + " break of structure.",
        "The " + S.htf + " is " + d("bullish", "bearish") + ", or I have halved my risk and chosen a nearer target because it is not.",
        "Price is not " + d("falling", "rising") + " fast on the " + S.htf + " right now."
      ],
      stop: ["The " + S.htf + " has just broken " + d("down", "up") + " with force and price is still running.", "I cannot say which side the " + S.htf + " favours."]
    });

    list.push(zone ? {
      id: "location", tf: S.htf, title: "Zone and target", chart: true,
      want: "A fresh " + z + " zone in " + d("discount", "premium") + ", and a marked target with room to reach it.",
      checks: [
        "The " + z + " zone is drawn at the last " + d("down", "up") + " candle before the move that broke structure.",
        "The zone is fresh: price has not returned to it since it formed.",
        "Price is in the " + d("lower", "upper") + " half of the last " + d("rally", "decline") + " (" + d("discount", "premium") + ").",
        "The target is marked: the weak " + highlow + ", or a " + d("supply", "demand") + " zone in front of it.",
        "There is room for at least 1:2 between the zone and the target."
      ],
      stop: ["The zone has already been tapped.", "A candle has closed " + below + " the zone.", "The target is too close for 1:2."]
    } : {
      id: "location", tf: S.ltf, title: "Liquidity and target", chart: true,
      want: "A clear " + lowhigh + " with stops resting " + below + " it, and a clear " + highlow + " on the other side as the target.",
      checks: [
        "I have drawn a line at clear " + lows + ": equal " + lows + ", a range " + lowhigh + ", or the previous day's or session's " + lowhigh + ".",
        "The level has not been swept before.",
        "The target is marked: the nearest clear " + highlow + " " + above + " price.",
        "The target is several times further away than the depth I expect the sweep to go."
      ],
      stop: ["The " + lowhigh + " is a minor one in the middle of a move.", "A zone or old " + highlow + " sits too close for 1:2."]
    });

    list.push({
      id: "sweep", tf: S.ltf, title: "Sweep", chart: true,
      want: zone ? d("Lows", "Highs") + " at the zone have been taken and price has turned back." : "Price has traded " + below + " the level and closed back " + above + " it.",
      checks: [
        zone ? "Price has reached the " + z + " zone." : "Price has traded " + below + " the line.",
        zone ? d("Lows", "Highs") + " at or inside the zone have been taken." : "It closed back " + above + " the line within a candle or two, or left a long wick.",
        "I have marked the extreme of the sweep. My stop will go beyond it.",
        "I have not entered yet."
      ],
      stop: ["Candles keep closing " + below + " the " + (zone ? "zone" : "level") + ". That is a break, not a sweep.", zone ? "Price bounced from " + above + " the zone without taking any " + lowhigh + "." : "Price returns to the line from the other side and is rejected."]
    });

    list.push({
      id: "shift", tf: S.ltf, title: "Shift", chart: true,
      want: "A " + S.ltf + " candle has closed " + above + " the last " + d("lower high", "higher low") + ", leaving an imbalance.",
      checks: [
        "A " + S.ltf + " candle has closed " + above + " the last " + d("lower high", "higher low") + " (MSS / CHoCH). A wick does not count.",
        "The move left an imbalance: strong candles whose wicks do not overlap.",
        "The breaking candle has finished closing."
      ],
      stop: ["Only a wick went through the level.", "The break is slow with overlapping candles.", "Price made a new " + lowhigh + " beyond the sweep instead."]
    });

    list.push({
      id: "zone", tf: S.ltf, title: "Entry zone", chart: true,
      want: zone ? "The small " + z + " zone at the base of the shift, inside the higher-timeframe zone." : "The zone made by the sweep: the base of the move that shifted structure.",
      checks: [
        "I have drawn the small zone at the last " + d("down", "up") + " candle before the move that made the shift.",
        zone ? "It sits inside or on the " + S.htf + " zone." : "Its far edge is the sweep " + lowhigh + ".",
        "Price has not come back and tapped it yet.",
        "I have noted any small " + lowhigh + " between price and the zone. It may be taken before the fill."
      ],
      stop: [zone ? "The small zone is " + above + " the " + S.htf + " zone with untouched " + lows + " beyond it (inducement)." : "The zone is so tall that the stop is too wide for the target.", "Price has already tapped the zone."]
    });

    list.push({
      id: "order", tf: S.ltf, title: "Order", chart: true, kind: "order",
      want: "Entry, stop and target set together, paying at least 1:2.",
      checks: [
        "Entry: a " + d("buy", "sell") + " limit at the " + d("top", "bottom") + " edge of the entry zone.",
        "Stop: " + below + " the sweep " + lowhigh + ", with a buffer of 5–10 pips plus the spread.",
        "Target: just before the level marked in step 2.",
        "No zone or liquidity level sits between entry and target at less than 2R."
      ],
      stop: ["The ratio is under 1:2.", "The stop only fits inside the zone."]
    });

    list.push({
      id: "size", tf: "Before the fill", title: "Position size", kind: "size",
      want: "A position that makes the stop cost 0.5–1% of the account.",
      checks: [
        "I am risking 1% or less of the account on this trade.",
        "I rounded the size down, not up.",
        "No high-impact news for this pair is due before the order is likely to fill."
      ],
      stop: ["The smallest size my broker allows risks more than 1%."]
    });

    list.push({
      id: "placed", tf: "Order live", title: "Place it and leave it",
      want: "The order is in with its stop and target attached, and the cancel rules are written down.",
      checks: [
        "The limit order is placed with stop loss and take profit attached.",
        "I will cancel it if price reaches the target before filling me.",
        "I will cancel it if a candle closes beyond the sweep " + lowhigh + " before the fill.",
        "Once filled, I will not move the stop to break-even early or widen it."
      ],
      stop: []
    });

    list.push({
      id: "review", tf: "After the trade", title: "Exit and record", kind: "review",
      want: "The result is written down with screenshots.",
      checks: [
        "I saved screenshots of each timeframe, before and after.",
        "I wrote down which steps were clean and which were forced."
      ],
      stop: []
    });
    return list;
  }

  // ---------- numbers ----------
  const num = (v) => { const n = parseFloat(String(v).replace(",", ".")); return isFinite(n) ? n : null; };
  function orderMath() {
    const e = num(S.order.entry), s = num(S.order.stop), t = num(S.order.target);
    if (e == null || s == null || t == null) return { ok: false, msg: "Enter all three prices." };
    const L = S.dir === "long";
    if (L ? !(s < e && e < t) : !(s > e && e > t)) return { ok: false, msg: L ? "For a long the stop must be below the entry and the target above it." : "For a short the stop must be above the entry and the target below it." };
    const risk = Math.abs(e - s), reward = Math.abs(t - e), rr = reward / risk;
    return { ok: rr >= 2, rr, risk, reward, msg: rr >= 2 ? "" : "Under 1:2. Skip the trade. Do not move the stop closer to fix it." };
  }
  function sizeMath() {
    const o = orderMath();
    const bal = num(S.size.balance), pct = num(S.size.risk);
    if (!o.risk) return { ok: false, msg: "Fill in the order prices in step 6 first." };
    if (bal == null || pct == null || bal <= 0 || pct <= 0) return { ok: false, msg: "Enter the account balance and the risk per trade." };
    const money = (bal * pct) / 100;
    let perLot; // loss per 1.00 lot if the stop is hit, in account currency (USD assumed)
    const k = S.size.kind;
    if (k === "usd") perLot = o.risk * 100000;
    else if (k === "jpy") { const r = num(S.size.rate); if (!r) return { ok: false, msg: "Enter the current USD/JPY rate." }; perLot = (o.risk * 100000) / r; }
    else if (k === "gold") perLot = o.risk * 100;
    else { const v = num(S.size.unit); if (!v) return { ok: false, msg: "Enter what a move of 1.00 in price is worth per lot." }; perLot = o.risk * v; }
    const lots = money / perLot;
    const rounded = Math.floor(lots * 100) / 100;
    return { ok: pct <= 1 && rounded >= 0.01, money, lots, rounded, perLot, pct,
      msg: pct > 1 ? "That is more than 1% of the account." : rounded < 0.01 ? "The size is below 0.01 lots. At the minimum size this trade risks more than you allow. Skip it." : "" };
  }

  function done(step) {
    const s = st(step.id);
    if (step.checks.some((_, i) => !s.checks[i])) return false;
    if (step.kind === "order" && !orderMath().ok) return false;
    if (step.kind === "size" && !sizeMath().ok) return false;
    if (step.kind === "review" && !S.result.outcome) return false;
    if (step.chart) {
      if (s.ai && s.ai.verdict === "fail" && !s.override) return false;
      if (S.requireAi && !(s.ai && (s.ai.verdict || s.ai.error)) && !s.override) return false;
    }
    return true;
  }

  // ---------- AI check ----------
  function shrink(file) {
    return new Promise((resolve, reject) => {
      const fr = new FileReader();
      fr.onerror = () => reject(new Error("read"));
      fr.onload = () => {
        const img = new Image();
        img.onerror = () => resolve(fr.result);
        setTimeout(() => resolve(fr.result), 5000); // never leave the upload hanging
        img.onload = () => {
          try {
            const max = 1400, k = Math.min(1, max / Math.max(img.width, img.height));
            const c = document.createElement("canvas");
            c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
            c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
            resolve(c.toDataURL("image/jpeg", 0.85));
          } catch (e) { resolve(fr.result); }
        };
        img.src = fr.result;
      };
      fr.readAsDataURL(file);
    });
  }
  async function aiApi() {
    for (let i = 0; i < 60 && !window.SMC_AI; i++) await new Promise((r) => setTimeout(r, 100));
    if (!window.SMC_AI) throw new Error("assistant not loaded");
    return window.SMC_AI;
  }
  const SYSTEM = [
    "You check a trader's chart screenshot against ONE step of a Smart Money Concepts checklist. You are a careful second pair of eyes, not a signal service.",
    "Judge only what is visible in the image: candles, the trader's lines, boxes and labels, the price and time axes, the timeframe shown.",
    "Be strict and honest. If the image is too zoomed out, unlabelled or ambiguous to judge an item, say so. Never guess in the trader's favour.",
    "Do not predict where price will go and do not tell the trader to buy or sell.",
    "Reply with JSON only, no other text: {\"verdict\":\"pass\"|\"unclear\"|\"fail\",\"seen\":[\"...\"],\"problems\":[\"...\"],\"advice\":\"one short sentence\"}",
    "verdict: pass = every item of the step is visibly met; fail = at least one item is visibly not met or a stop condition is visible; unclear = you cannot tell from this image.",
    "seen: up to 4 short facts you can actually see that support the step. problems: up to 4 short points that are missing, wrong or not visible."
  ].join("\n");

  async function askVision(step, dataUrl) {
    const api = await aiApi();
    const token = await api.token();
    const all = steps();
    const n = all.findIndex((x) => x.id === step.id) + 1;
    const text = [
      "Trade being planned: " + (S.pair || "pair not stated") + ", " + S.dir.toUpperCase() + ", " + (S.model === "zone" ? "zone model (entry from a demand or supply zone)" : "sweep model (a swept low or high, then a shift)") + ".",
      "Higher timeframe: " + S.htf + ". Entry timeframe: " + S.ltf + ".",
      "STEP " + n + ": " + step.title + " (" + step.tf + ")",
      "Goal: " + step.want,
      "Items that must be true:", step.checks.map((c) => "- " + c).join("\n"),
      step.stop.length ? "Stop conditions (any of these means fail):\n" + step.stop.map((c) => "- " + c).join("\n") : "",
      step.kind === "order" && orderMath().rr ? "Order typed by the trader: entry " + S.order.entry + ", stop " + S.order.stop + ", target " + S.order.target + "." : "",
      "Check the attached screenshot against this step."
    ].filter(Boolean).join("\n");
    const messages = [
      { role: "system", content: SYSTEM },
      { role: "user", content: [{ type: "text", text }, { type: "image_url", image_url: { url: dataUrl } }] }
    ];
    const headers = { "Content-Type": "application/json" };
    if (token) headers.Authorization = "Bearer " + token;
    const candidates = visionModel ? [visionModel] : VISION_MODELS.slice();
    let last = null, listed = false;
    for (let i = 0; i < candidates.length; i++) {
      const r = await fetch(api.endpoint, { method: "POST", headers, body: JSON.stringify({ model: candidates[i], messages, temperature: 0.1, max_tokens: 500 }) });
      let data = null;
      try { data = await r.json(); } catch (e) { /* not JSON */ }
      if (r.ok) {
        visionModel = candidates[i];
        return parse(((data.choices || [])[0] || {}).message ? data.choices[0].message.content : "");
      }
      last = new Error((data && data.error && data.error.message) || "HTTP " + r.status);
      last.status = r.status;
      const code = data && data.error && data.error.code;
      const modelProblem = r.status === 404 || code === "model_not_found" || code === "model_decommissioned" || (r.status === 400 && /model|image|vision|content/i.test(last.message));
      if (!modelProblem) throw last;
      if (i === candidates.length - 1 && !listed) {
        listed = true;
        try {
          const lr = await fetch(api.endpoint.replace(/chat\/completions$/, "models"), { headers: token ? { Authorization: "Bearer " + token } : {} });
          const ld = await lr.json();
          (ld.data || []).map((m) => m.id).filter((id) => /vision|llama-4|scout|maverick|pixtral|llava|gemma-3|qwen.*vl|-vl/i.test(id)).forEach((id) => { if (!candidates.includes(id)) candidates.push(id); });
        } catch (e) { /* keep the last error */ }
      }
    }
    throw last || new Error("No vision model available");
  }
  function parse(text) {
    const m = String(text || "").match(/\{[\s\S]*\}/);
    let o = null;
    try { o = m ? JSON.parse(m[0]) : null; } catch (e) { o = null; }
    if (!o) return { verdict: "unclear", seen: [], problems: [], advice: String(text || "").slice(0, 300) || "The reply could not be read. Try again." };
    const v = String(o.verdict || "").toLowerCase();
    const arr = (x) => (Array.isArray(x) ? x : x ? [x] : []).map((s) => String(s).slice(0, 220)).slice(0, 4);
    return { verdict: v === "pass" || v === "fail" ? v : "unclear", seen: arr(o.seen), problems: arr(o.problems), advice: String(o.advice || "").slice(0, 300) };
  }

  // ---------- rendering ----------
  const opt = (v, label, cur) => '<option value="' + v + '"' + (v === cur ? " selected" : "") + ">" + label + "</option>";
  const TFS = ["Weekly", "Daily", "4H", "1H", "30m", "15m", "5m", "1m"];

  function aiBlock(step, s, locked) {
    if (!step.chart) return "";
    let res = "";
    if (s.busy) res = '<div class="cl-ai pending">Checking the screenshot…</div>';
    else if (s.ai && s.ai.error) res = '<div class="cl-ai error"><strong>The check could not run.</strong> ' + esc(s.ai.error) + " You can continue on your own judgement.</div>";
    else if (s.ai) {
      const head = { pass: "AI check: this looks right", unclear: "AI check: cannot tell from this screenshot", fail: "AI check: something does not match" }[s.ai.verdict];
      res = '<div class="cl-ai ' + s.ai.verdict + '"><strong>' + head + "</strong>" +
        (s.ai.seen.length ? "<p>Seen:</p><ul>" + s.ai.seen.map((x) => "<li>" + esc(x) + "</li>").join("") + "</ul>" : "") +
        (s.ai.problems.length ? "<p>Check again:</p><ul>" + s.ai.problems.map((x) => "<li>" + esc(x) + "</li>").join("") + "</ul>" : "") +
        (s.ai.advice ? "<p>" + esc(s.ai.advice) + "</p>" : "") + "</div>";
    }
    const needOverride = (s.ai && s.ai.verdict === "fail") || (S.requireAi && !(s.ai && (s.ai.verdict || s.ai.error)));
    const over = needOverride ? '<label class="cl-check cl-override"><input type="checkbox" data-override="' + step.id + '"' + (s.override ? " checked" : "") + (locked ? " disabled" : "") + "><span>" +
      (s.ai && s.ai.verdict === "fail" ? "I have looked again and I am sure this step is met. Continue anyway." : "Continue without an AI check on this step.") + "</span></label>" : "";
    return '<div class="cl-shot"><h4>Screenshot check</h4>' +
      (shots[step.id] ? '<img class="cl-thumb" src="' + shots[step.id] + '" alt="Your screenshot for this step">' : "") +
      '<div class="cl-shot-actions"><label class="btn ghost cl-file' + (locked ? " disabled" : "") + '">' + (shots[step.id] ? "Change screenshot" : "Add screenshot") +
      '<input type="file" accept="image/*" data-file="' + step.id + '"' + (locked ? " disabled" : "") + "></label>" +
      '<button type="button" class="btn" data-ai="' + step.id + '"' + (!shots[step.id] || s.busy || locked ? " disabled" : "") + ">Check with AI</button></div>" +
      (s.ai && !shots[step.id] && !s.ai.error ? '<p class="small muted">Result from an earlier screenshot. The image itself is not stored.</p>' : "") + res + over + "</div>";
  }

  function extra(step, locked) {
    const dis = locked ? " disabled" : "";
    if (step.kind === "order") {
      const o = orderMath();
      const f = (k, label) => '<label>' + label + '<input type="text" inputmode="decimal" data-order="' + k + '" value="' + esc(S.order[k] || "") + '"' + dis + "></label>";
      return '<div class="cl-form"><h4>Your three prices</h4><div class="cl-fields">' + f("entry", "Entry") + f("stop", "Stop loss") + f("target", "Take profit") + "</div>" +
        '<p class="cl-calc ' + (o.rr ? (o.ok ? "good" : "bad") : "") + '" data-out="order">' + (o.rr ? "Reward to risk: <strong>1:" + o.rr.toFixed(2) + "</strong>. " : "") + esc(o.msg) + "</p></div>";
    }
    if (step.kind === "size") {
      const z = sizeMath(), k = S.size.kind;
      return '<div class="cl-form"><h4>Size calculator</h4><div class="cl-fields">' +
        '<label>Account balance (USD)<input type="text" inputmode="decimal" data-size="balance" value="' + esc(S.size.balance || "") + '"' + dis + "></label>" +
        '<label>Risk per trade (%)<input type="text" inputmode="decimal" data-size="risk" value="' + esc(S.size.risk || "") + '"' + dis + "></label>" +
        '<label>Instrument<select data-size="kind"' + dis + ">" + opt("usd", "FX pair quoted in USD (EUR/USD, GBP/USD…)", k) + opt("jpy", "FX pair quoted in JPY (USD/JPY, GBP/JPY…)", k) + opt("gold", "Gold (XAU/USD, 100 oz lot)", k) + opt("other", "Other", k) + "</select></label>" +
        (k === "jpy" ? '<label>Current USD/JPY rate<input type="text" inputmode="decimal" data-size="rate" value="' + esc(S.size.rate || "") + '"' + dis + "></label>" : "") +
        (k === "other" ? '<label>Value of a 1.00 price move per lot (USD)<input type="text" inputmode="decimal" data-size="unit" value="' + esc(S.size.unit || "") + '"' + dis + "></label>" : "") +
        '</div><p class="cl-calc ' + (z.lots ? (z.ok ? "good" : "bad") : "") + '" data-out="size">' +
        (z.lots ? "Money at risk: <strong>$" + z.money.toFixed(2) + "</strong>. Size: <strong>" + z.rounded.toFixed(2) + " lots</strong> (exact " + z.lots.toFixed(3) + "). " : "") + esc(z.msg) +
        '</p><p class="small muted">Assumes a USD account and standard lot sizes. Check the contract size with your broker, especially for indices and crypto.</p></div>';
    }
    if (step.kind === "review") {
      const r = S.result;
      return '<div class="cl-form"><h4>Result</h4><div class="cl-fields">' +
        '<label>Outcome<select data-result="outcome"' + dis + ">" + opt("", "Choose…", r.outcome || "") + opt("Target hit", "Target hit", r.outcome) + opt("Stop hit", "Stop hit", r.outcome) + opt("Closed early", "Closed early", r.outcome) + opt("Order cancelled", "Order cancelled", r.outcome) + opt("No fill", "No fill", r.outcome) + "</select></label>" +
        '<label>Result in R<input type="text" inputmode="decimal" data-result="r" value="' + esc(r.r || "") + '" placeholder="e.g. 2.5 or -1"' + dis + "></label></div>" +
        '<label class="cl-notes">Notes<textarea rows="3" data-result="notes"' + dis + ">" + esc(r.notes || "") + "</textarea></label></div>";
    }
    return "";
  }

  function journal() {
    const all = steps(), o = orderMath(), z = sizeMath();
    const lines = ["Trade journal — " + new Date().toISOString().slice(0, 10),
      "Pair: " + (S.pair || "-") + " | " + S.dir + " | " + (S.model === "zone" ? "zone model" : "sweep model") + " | " + S.htf + " → " + S.ltf,
      "Entry " + (S.order.entry || "-") + " | Stop " + (S.order.stop || "-") + " | Target " + (S.order.target || "-") + (o.rr ? " | R:R 1:" + o.rr.toFixed(2) : ""),
      z.lots ? "Size " + z.rounded.toFixed(2) + " lots | Risk $" + z.money.toFixed(2) + " (" + z.pct + "%)" : "",
      "Outcome: " + (S.result.outcome || "-") + (S.result.r ? " | " + S.result.r + "R" : ""), ""];
    all.forEach((step, i) => {
      const s = st(step.id);
      lines.push((i + 1) + ". " + step.title + ": " + (done(step) ? "done" : "not done") + (s.ai && s.ai.verdict ? " | AI: " + s.ai.verdict + (s.override ? " (overridden)" : "") : s.override ? " | no AI check" : ""));
      if (s.ai && s.ai.problems && s.ai.problems.length) lines.push("   AI flagged: " + s.ai.problems.join("; "));
    });
    if (S.result.notes) lines.push("", "Notes: " + S.result.notes);
    return lines.filter((l) => l !== "").join("\n");
  }

  function render() {
    const all = steps();
    let firstOpen = all.findIndex((x) => !done(x));
    if (firstOpen === -1) firstOpen = all.length;
    const pct = Math.round((firstOpen / all.length) * 100);
    let h = '<div class="cl-setup card"><h3>The trade you are checking</h3><div class="cl-fields">' +
      '<label>Pair<input type="text" data-set="pair" value="' + esc(S.pair) + '" placeholder="e.g. USD/JPY" maxlength="20"></label>' +
      "<label>Model<select data-set=\"model\">" + opt("zone", "Zone model", S.model) + opt("sweep", "Sweep model", S.model) + "</select></label>" +
      "<label>Direction<select data-set=\"dir\">" + opt("long", "Long", S.dir) + opt("short", "Short", S.dir) + "</select></label>" +
      "<label>Higher timeframe<select data-set=\"htf\">" + TFS.slice(0, 5).map((t) => opt(t, t, S.htf)).join("") + "</select></label>" +
      "<label>Entry timeframe<select data-set=\"ltf\">" + TFS.slice(2).map((t) => opt(t, t, S.ltf)).join("") + "</select></label></div>" +
      '<label class="cl-check"><input type="checkbox" data-set="requireAi"' + (S.requireAi ? " checked" : "") + "><span>Ask for an AI screenshot check on each chart step before moving on. You can skip it step by step.</span></label>" +
      '<div class="cl-progress" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + pct + '"><span style="width:' + pct + '%"></span></div>' +
      '<p class="cl-progress-text">' + (firstOpen >= all.length ? "All " + all.length + " steps are complete." : "Step " + (firstOpen + 1) + " of " + all.length + ": " + esc(all[firstOpen].title)) +
      ' <button type="button" class="cl-link" data-reset>Start a new checklist</button></p></div>';

    all.forEach((step, i) => {
      const s = st(step.id), isDone = done(step), locked = i > firstOpen, active = i === firstOpen;
      h += '<section class="cl-step' + (isDone ? " done" : "") + (locked ? " locked" : "") + (active ? " active" : "") + '" id="step-' + step.id + '">' +
        '<header><span class="cl-no">' + (isDone ? "✓" : i + 1) + '</span><div><h3>' + esc(step.title) + '</h3><small>' + esc(step.tf) + "</small></div>" +
        '<span class="cl-badge">' + (isDone ? "Done" : locked ? "Locked" : "Now") + "</span></header>";
      if (locked) { h += '<p class="cl-locked-note">Finish step ' + (firstOpen + 1) + " first.</p></section>"; return; }
      h += '<div class="cl-body"><p class="cl-want">' + esc(step.want) + "</p>" +
        step.checks.map((c, j) => '<label class="cl-check"><input type="checkbox" data-check="' + step.id + ":" + j + '"' + (s.checks[j] ? " checked" : "") + "><span>" + esc(c) + "</span></label>").join("") +
        extra(step, false) + aiBlock(step, s, false) +
        (step.stop.length ? '<div class="cl-stop"><strong>Stop here if</strong><ul>' + step.stop.map((x) => "<li>" + esc(x) + "</li>").join("") + '</ul><button type="button" class="cl-link" data-reset>No setup. Clear and start again.</button></div>' : "") +
        "</div></section>";
    });

    if (firstOpen >= all.length) {
      h += '<div class="callout rule cl-finish"><h4>Checklist complete</h4><p>Copy the summary into your journal, then start a new checklist for the next setup.</p>' +
        '<textarea class="cl-journal" rows="12" readonly>' + esc(journal()) + '</textarea><p><button type="button" class="btn" data-copy>Copy summary</button> <button type="button" class="btn ghost" data-reset>Start a new checklist</button></p></div>';
    }
    mount.innerHTML = h;
  }

  // Update only the calculated line while typing, so the field keeps focus.
  function refreshCalc(which) {
    const el = mount.querySelector('[data-out="' + which + '"]');
    if (!el) return;
    if (which === "order") {
      const o = orderMath();
      el.className = "cl-calc " + (o.rr ? (o.ok ? "good" : "bad") : "");
      el.innerHTML = (o.rr ? "Reward to risk: <strong>1:" + o.rr.toFixed(2) + "</strong>. " : "") + esc(o.msg);
    } else {
      const z = sizeMath();
      el.className = "cl-calc " + (z.lots ? (z.ok ? "good" : "bad") : "");
      el.innerHTML = (z.lots ? "Money at risk: <strong>$" + z.money.toFixed(2) + "</strong>. Size: <strong>" + z.rounded.toFixed(2) + " lots</strong> (exact " + z.lots.toFixed(3) + "). " : "") + esc(z.msg);
    }
  }

  // ---------- events ----------
  mount.addEventListener("input", (e) => {
    const t = e.target;
    if (t.dataset.order) { S.order[t.dataset.order] = t.value; save(); refreshCalc("order"); }
    else if (t.dataset.size && t.tagName === "INPUT") { S.size[t.dataset.size] = t.value; save(); refreshCalc("size"); }
    else if (t.dataset.result && t.tagName !== "SELECT") { S.result[t.dataset.result] = t.value; save(); }
    else if (t.dataset.set === "pair") { S.pair = t.value; save(); }
  });
  mount.addEventListener("change", async (e) => {
    const t = e.target;
    if (t.dataset.check) {
      const [id, j] = t.dataset.check.split(":");
      st(id).checks[+j] = t.checked; save(); render();
    } else if (t.dataset.override) { st(t.dataset.override).override = t.checked; save(); render(); }
    else if (t.dataset.set && t.dataset.set !== "pair") {
      const k = t.dataset.set;
      if (k === "requireAi") S.requireAi = t.checked;
      else {
        if ((k === "model" || k === "dir") && S[k] !== t.value && Object.keys(S.steps).some((id) => (S.steps[id].checks || []).some(Boolean)) &&
          !window.confirm("Changing this clears the boxes you have ticked. Continue?")) { render(); return; }
        if (k === "model" || k === "dir") { S.steps = {}; Object.keys(shots).forEach((x) => delete shots[x]); }
        S[k] = t.value;
      }
      save(); render();
    } else if (t.dataset.size === "kind") { S.size.kind = t.value; save(); render(); }
    else if (t.dataset.result === "outcome") { S.result.outcome = t.value; save(); render(); }
    else if (t.dataset.order || t.dataset.size) { render(); }
    else if (t.dataset.file) {
      const id = t.dataset.file, file = t.files && t.files[0];
      if (!file) return;
      if (!/^image\//.test(file.type)) { window.alert("Please choose an image file."); return; }
      try { shots[id] = await shrink(file); } catch (err) { window.alert("That image could not be read."); return; }
      const s = st(id); s.ai = null; s.override = false; save(); render();
    }
  });
  mount.addEventListener("click", async (e) => {
    const t = e.target.closest("[data-ai],[data-reset],[data-copy]");
    if (!t) return;
    if (t.hasAttribute("data-reset")) {
      if (!window.confirm("Clear this checklist and start again?")) return;
      const keep = { model: S.model, dir: S.dir, htf: S.htf, ltf: S.ltf, requireAi: S.requireAi, size: { kind: S.size.kind, balance: S.size.balance, risk: S.size.risk } };
      S = Object.assign(blank(), keep);
      Object.keys(shots).forEach((x) => delete shots[x]);
      save(); render(); mount.scrollIntoView({ block: "start" });
    } else if (t.hasAttribute("data-copy")) {
      const ta = mount.querySelector(".cl-journal");
      try { await navigator.clipboard.writeText(ta.value); t.textContent = "Copied"; } catch (err) { ta.select(); }
    } else if (t.dataset.ai) {
      const id = t.dataset.ai, step = steps().find((x) => x.id === id), s = st(id);
      if (!step || !shots[id] || s.busy) return;
      s.busy = true; render();
      try { s.ai = await askVision(step, shots[id]); s.override = false; }
      catch (err) {
        let msg = "Check your connection and try again.";
        if (err.status === 429) msg = "The usage limit was reached. Wait a minute and try again.";
        else if (err.status === 401 || err.status === 403) msg = "The access key was rejected.";
        else if (err.status === 413) msg = "The image is too large. Crop it and try again.";
        else if (/vision model|No vision/i.test(err.message || "")) msg = "No image-reading model is available right now.";
        s.ai = { error: msg };
      }
      delete s.busy; save(); render();
    }
  });

  Object.keys(S.steps).forEach((id) => { delete S.steps[id].busy; });
  render();
})();
