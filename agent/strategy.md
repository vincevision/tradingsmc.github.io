# VinceVision SMC strategy pack

_Exported from the live site by tools/build_strategy_pack.py. Do not edit_
_by hand: edit the site and re-run._

## The only sequence  _(key-points.html#sequence)_

The only sequence
Every trade on this site is the same six lines, in this order. Written for longs; mirror it for shorts.
Direction.The analysis rung has closed above a high. Longs only. Bearish rung: shorts only, or stand aside.
Liquidity and target.Mark what rests: equal lows, a range edge, a session low. Mark the target first — the nearest clear high — and check the room before anything else.
Sweep.Price trades through the level and closes back inside, wick or within two candles. Mark the extreme: that is the protected level and the stop goes beyond it.
Shift with imbalance.A candle close through the last lower high, leaving an imbalance. A wick is not a shift. A slow break with no gap is not a shift.
Zone and order.The last down candle before the shift leg is the zone. Limit at its top edge, stop beyond the protected level plus buffer, target at the marked liquidity. Under 1:2, no order.
Size, hold, record.Half to one percent. Alert set, hands off. Win or lose, the trade goes in the log with its screenshots.
The long version with drawings: zone model and sweep model. The morning version: notes.
The timeframe-stacked version, exactly as the note states it: the routine in four steps.

## Origin decides the target  _(key-points.html#origin)_

Where the leg began decides the target
A rule earned in backtesting. Two sweeps can look identical on the entry timeframe and deserve completely different targets, because of what the higher timeframe is doing underneath.
SetupGateTarget
Sweep at a higher-TF zone, and the HTF leg itself started at a demandWith-trend biasFar liquidity: the nearest HTF swing, else the week high or low
Sweep at a higher-TF zone, but the HTF leg started at swept liquidityWith-trend biasThe next liquidity point on the entry TF only
Bare sweep — no zone behind itOnly when the HTF itself shifted away from that swept liquidityThe next liquidity point on the entry TF only
Bare sweep, HTF leg from a demand or from nothingRefused. Label it, walk on.—
The one-liner
A bare sweep trades only when the higher timeframe shifted from swept liquidity, and then it aims at the first pool in front of it — never at HTF highs or week lows. Far targets belong to zone-backed moves whose higher timeframe also came from a demand.
Exhibit A, drawn from a replay: BTCUSD 5m — sweep, MSS, and a target that stops at the first pool.
Exhibit C, drawn on your own terminal: EURUSD 30m — two sweeps into one supply, one target drawn once.
Exhibit D, three of your own charts: one gate run twice as shorts and once in the mirror for longs — and the probability rule to memorise.

## The routine in four steps  _(key-points.html#routine)_

The routine in four steps
The note as posted, then unpacked into the order it is actually executed. Every other line on this page is detail inside one of these four steps — nothing here is a fifth rule.
The note, verbatim
“ON HIGHER TF SPOT LIQUIDITY SWEEP AND BREAK OF STRUCTURE AND A SUPPLY OR DEMAND FROM THE LEG, THEN WAIT FOR THE SHIFT. AS FOR TARGETS USE THOSE FROM THE TIMEFRAME OF THE SHIFT.”
Step 1 · Higher timeframe: three marks.On the higher timeframe spot the liquidity sweep (the X), the break of structure that follows it, and the supply or demand the leg left at its origin. All three, or the chart is not ready: the sweep names the fuel, the break names the direction, the zone names where the move began. A sweep with no zone behind it is a different animal — see the bare-sweep rows in the origin table.
Step 2 · Wait for the shift, one frame down.Nothing is ordered on the strength of the higher-timeframe marks. Drop to the lower timeframe and wait for the shift — a candle close through the pullback’s last high or low, leaving an imbalance. A wick is not a shift; a slow break with no gap is not a shift. This is the confirmation note 12 demands, drawn in full on the confirmation model.
Step 3 · Enter at what the shift leaves.The order block at the shift candle is the entry. The stop goes beyond the structure the shift depends on — the protected high or low it made — never inside the block. Under 1:2 to the step-4 target, there is no order.
Step 4 · Target the shift’s own timeframe.The pools that belong to this trade are the ones on the timeframe of the shift: the next liquidity in front of it, drawn before the entry. Do not reach up for higher-timeframe swings or […]

## Exhibit D and the memorised probability note  _(key-points.html#mirror)_

Exhibit D: one gate, three charts — and the mirror
The entry model this site teaches, shown on three of your own charts instead of a diagram: a liquidity sweep followed by a shift is enough to act — but when the sweep itself comes from a demand or supply zone, the shift that follows carries more probability. Two shorts on the euro's 30m and 15m, and the same gate flipped in the mirror for longs on your 1h paper chart.
Memorise
A liquidity sweep followed by a shift can be enough — but if that liquidity sweep came from a demand or supply zone, the shift that follows adds more probability.
Pinned, untouched: the rule exactly as it was first written — the owner's own message. Exhibit D, the illustration below it and every MEMORISE callout on this site descend from these four lines.
Left: the X sits in no-man's-land — the sweep clears liquidity and the MSS that follows is the only evidence, which is enough to act. Right: the X sits at the supply's floor — the sweep triggers the zone's own defenders, so the MSS that follows carries their weight too. Same gate, different weight behind it.
The three reference charts, untouched
Chart 1 — the mirror, for longs. Your 1h euro paper chart with the scale inverted on purpose, so the same gate reads the way a long reads it: a staircase of demand boxes, X on the swept lows into each box, bos and two MSS on the way up, $$$ on the buy-side pool above the middle swing, and the arrow — the pullback's zigzag taps the last demand box and the long the model asks for points up from there. The ⊕ line at 1.10317 marks where the staircase began; the tool carries 0.3 open at the live 1.09411. On the raw, un-inverted feed this same session is the […]

## Risk  _(key-points.html#risk)_

Risk, in four lines
Half to one percent of the account per idea. One idea, one risk.
Add only to a winner, only after a new sweep, shift and zone; move the first stop first; never more than the first size; same target; two adds maximum.
One re-entry after a stop-sweep, never a second.
Every trade recorded: screenshot, numbers, the rule that gave the entry, the rule that was bent.
The long form lives in the playbook risk rules and scaling & re-entry.

## The skips are the strategy  _(key-points.html#skips)_

The skips are the strategy
The entries take care of themselves once these are honest. Every line here has a losing trade behind it.
No sweep before the break — the break has no fuel and no protected level.
Break without imbalance — a slow drift through structure is not a shift.
Zone already tapped — a used zone is a story told twice.
Target already spent — if the liquidity you aim at was already taken, the move is gone. Ask: is my target still untouched?
Against the higher timeframe — except at a major level, with a nearer target and half the risk.
Protected level closed through — the idea is dead; delete the order, do not move the stop.
Under 1:2 — the maths does not pay for the misses.
High-impact news still being priced — that is a coin flip wearing a setup’s clothes.
What a skipped rule costsRun the live checklist

## The thirteen notes, pinned  _(notes.html)_

- Mark the trend
- Check the break: was there a sweep first?
- Mark the protected low
- Mark the demand that caused the break
- Mark the target
- Wait for price to return
- Inside the zone, wait for a sweep
- Wait for the shift
- Mark the small zone and place the order
- Hold, then record
- Catch one move, not every move
- The trend keeps sweeping; the protected zone gives the entry
- A sweep from a zone makes the shift worth more

**Pinned rule · probability** — Sweep + shift = enough. Sweep from a demand or supply zone + shift = more probability. Weigh the entry by where the sweep happened, not only by the fact of it.

## What the cases have in common  _(playbook.html)_

ass="hero">
Playbook
One model, run the same way every day.
This page collects the rules that the case studies have in common. It grows as more examples are added. Right now it is built from fifteen trades: three USD/JPY longs (4H, 1H and a weekly-to-4H swing), four XAU/USD trades (a short, a 5m long, a 15m short and a 4H-to-15m OB short), two GBP/JPY longs (15m and 5m), two BTC/USD longs (15m and 1H), the AUD/USD long, the AUD/USD short, the GBP/AUD long and the GBP/USD short. Treat it as a draft to be tested, not a finished system.
The model
Patterns so far
Daily routine
SL & TP rules
Risk rules
Journal
Glossary
Notes: the routine in order →
Strategy: zone model →
Strategy: sweep model →
Key points: the method in one page →
Entry models →
Inducement →
Structure & entry models →
Scaling in & re-entering →
Why a trade failed →
Internal & external structure →
Imbalance, supply & demand →
Top-down analysis →
The full sequence →
Good vs bad BoS →
Types of liquidity →
The model
HTF zone → LTF shift → order block
StageTimeframeWhat you need to see (long)For shorts
1. Location4H (or 1H)The 4H has swept a low and shifted bullish. Price has pulled back into the discount half of the leg, […]

## Confirmation vs aggressive entry  _(entry-models.html#confirmation)_

Model 2 — “Confirmation Entry.”
Model 2
Confirmation entry
Price reaches the zone and you do nothing yet. You wait for the internal structure of the pullback to break, then sell the first retracement after that break.
Reading the drawing, left to right
A drop from supply breaks structure. The large supply zone at the top is the origin of the fall through the BoS line. The low of that fall is marked SSL: sell-side liquidity, and the eventual target.
The pullback climbs in a staircase. Higher highs and higher lows, each previous high broken (the short dotted lines). Internally, the trend is up.
Its lows sit on a trendline ($$$). More sell-side liquidity building under the pullback.
Price taps the supply zone and sweeps a high (X). The last push takes the previous internal high and reaches into the zone. The zone has now been mitigated. The aggressive trader is already short from the zone's edge.
CHoCH. Price turns and breaks below the most recent higher low. This is the first time the staircase has failed. The drop leaves an imbalance.
A new, smaller supply forms. It runs from the high made inside the big zone, now the protected high, down to the start of the CHoCH move.
Price […]

