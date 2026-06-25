# Araiven Intelligence Framework
### The Official AI Blueprint for Ravora
**Version 1.0 — Authored by the Ravora Architecture Team**

---

> This document is the single source of truth for every AI decision inside Ravora.
> Every future feature, recommendation, scoring system, trade plan, chart overlay,
> portfolio analysis, and execution engine must follow this framework.
> No exceptions.

---

## Table of Contents

1. [Core Philosophy](#1-core-philosophy)
2. [Decision Pipeline](#2-decision-pipeline)
3. [Signal Categories](#3-signal-categories)
4. [Scoring System](#4-scoring-system)
5. [Recommendation Engine](#5-recommendation-engine)
6. [Trade Plan Framework](#6-trade-plan-framework)
7. [Explainability Standard](#7-explainability-standard)
8. [Future Multi-Agent Architecture](#8-future-multi-agent-architecture)
9. [Design Principles](#9-design-principles)
10. [What Araiven Must Never Do](#10-what-araiven-must-never-do)

---

## 1. Core Philosophy

### What Araiven Is

Araiven is a **quantitative intelligence engine** embedded inside Ravora. It continuously scans financial markets, processes structured market signals, evaluates risk, and produces explainable trading recommendations — the same way an experienced institutional trader would, but at machine speed and with complete transparency.

Araiven is not a chatbot. It is not an assistant that responds to questions. It is an **always-on analytical system** that watches the market, scores opportunities, and tells users exactly what to do and — critically — **why**.

### What Its Purpose Is

Most retail traders lose money not because the market is impossible to navigate, but because:

- They don't know how to read signals correctly
- They act on emotion, not evidence
- They cannot process multiple market variables simultaneously
- They receive recommendations with no explanation (signal groups, influencers)
- They don't know when NOT to trade

Araiven exists to solve exactly this. Its purpose is to:

1. **Scan** the market continuously across all supported assets
2. **Identify** high-probability setups using quantitative evidence
3. **Score** every opportunity with a transparent, deterministic system
4. **Recommend** concrete actions (LONG, SHORT, HOLD, WAIT) with a complete rationale
5. **Protect** users from unnecessary risk by being conservative and honest about uncertainty

### What Problems It Solves

| Problem | How Araiven Solves It |
|---|---|
| "I don't know which asset to trade" | Scans all assets and ranks them by Opportunity Score |
| "I don't know when to enter" | Calculates optimal entry based on support levels and momentum |
| "I don't know where to put my stop loss" | Derives SL from market structure, not random percentages |
| "I don't know if this is a good trade" | Confidence Score + Risk Score quantify the trade quality |
| "I don't understand why this is recommended" | Every recommendation includes a full written rationale |
| "I can't monitor the market 24/7" | Araiven runs continuously in the background |
| "I got burned by a signal group tip" | Araiven never recommends without measurable evidence |

### How Araiven Differs from ChatGPT

| ChatGPT | Araiven |
|---|---|
| Generates text based on patterns | Makes decisions based on live market data |
| Can fabricate confident-sounding answers | Never produces a score without real calculation |
| Has no market data access | Continuously connected to live price feeds |
| Cannot calculate RSI, MACD, or structure | Built on quantitative signal analyzers |
| General purpose | Purpose-built for crypto trading intelligence |
| No accountability for recommendations | Every recommendation is traceable to evidence |

### How Araiven Differs from TradingView

| TradingView | Araiven |
|---|---|
| Shows you charts and indicators | Interprets the charts for you |
| Requires you to know what you are looking at | Requires no prior knowledge |
| Gives you tools, not answers | Gives you answers, with the reasoning |
| You draw support/resistance manually | Araiven detects structure automatically |
| No recommendation engine | Full LONG/SHORT/HOLD decision engine |
| You decide risk | Araiven calculates and communicates risk |

### How Araiven Differs from Signal Groups

| Signal Groups | Araiven |
|---|---|
| "Buy BTC at $64,000 — TP $72,000" | "BTC: LONG setup detected. RSI 48. Bullish structure above $63,200. Entry $63,800. SL $62,100. TP $68,400. RR 2.4:1. Confidence 74%." |
| No explanation | Full transparent reasoning |
| Human-generated (emotional, biased) | Quantitative and deterministic |
| Often delayed | Always real-time |
| Opaque source | Every signal traceable to market data |
| No risk management | Risk is the primary filter |

### Why Explainability Is a Core Advantage

The single biggest complaint from retail traders is: "I was told to buy but never told why. When it dropped, I didn't know if I should hold or cut losses."

Araiven's explainability solves this. When a user understands the reasoning behind a recommendation, they can:

- Make an informed decision to accept or reject it
- Know when the thesis has been invalidated (e.g., price broke below support)
- Build their own understanding of the market over time
- Trust the system because they can verify the logic

**Explainability is not a feature. It is the product.**

---

## 2. Decision Pipeline

Every Araiven recommendation passes through a deterministic, sequential pipeline. No stage can be skipped. No output is produced without completing every prior stage.

```
ARAIVEN DECISION PIPELINE
==========================

  1. DATA COLLECTION
     Live prices, OHLCV history, volume, market cap, exchange data
     |
  2. NORMALIZATION
     Standardize all data. Validate completeness.
     Flag stale or missing data. Reject if corrupt.
     |
  3. TREND DETECTION
     SMA20, SMA50, SMA200. Price vs MAs.
     Higher highs / higher lows detection.
     Output: Bullish / Bearish / Range
     |
  4. MOMENTUM MEASUREMENT
     RSI-14. Rate of change (14-day).
     Relative strength vs other assets.
     Output: Momentum Score 0-100
     |
  5. VOLUME ANALYSIS
     Volume vs 14-day average.
     Volume trend (rising/falling).
     Volume confirms price action?
     Output: Volume Confirmation Score 0-100
     |
  6. VOLATILITY EVALUATION
     Annualized volatility (std dev of returns).
     Recent vol vs historical vol.
     Output: Volatility Score 0-100 (100 = extremely volatile = high risk)
     |
  7. SUPPORT & RESISTANCE DETECTION
     Detect local swing lows (support).
     Detect local swing highs (resistance).
     Calculate distance from current price.
     Output: S1, S2, R1, R2 price levels
     |
  8. MARKET STRUCTURE ANALYSIS
     Break of structure detection.
     Higher highs / lower lows sequence.
     Accumulation vs distribution patterns.
     Output: Structure Score 0-100
     |
  9. OPPORTUNITY SCORING
     Composite: Trend (40%) + Momentum (40%) + Volume (20%)
     Output: Opportunity Score 0-100
     |
  10. RISK SCORING
      Composite: Volatility (60%) + (100 - Trend) (40%)
      Output: Risk Score 0-100
      |
  11. CONFIDENCE SCORING
      Composite: Trend (40%) + Volume (40%) + (100-Vol)(20%)
      Output: Confidence Score 0-100
      |
  12. DIRECTION DECISION
      Apply decision rules.
      Output: LONG / SHORT / HOLD / WAIT / DO NOTHING
      |
  13. TRADE PLAN GENERATION
      Entry = current price +/- buffer
      SL = below S1 (LONG) / above R1 (SHORT)
      TP = R1 (LONG) / S1 (SHORT)
      RR = |TP - Entry| / |Entry - SL|
      Duration = f(volatility)
      |
  14. REASONING GENERATION
      Assemble human-readable explanation.
      Every signal contributes a sentence.
      Output: transparent rationale paragraph.
```

### Stage Descriptions

**Stage 1 — Data Collection**
Pull live ticker data (price, 24h change, volume, market cap) and historical OHLCV from Binance (primary) with CoinCap as fallback. Minimum 30 daily candles required for analysis. If data is unavailable, the asset is flagged as UNANALYZABLE and no recommendation is produced.

**Stage 2 — Normalization**
All price data is validated for completeness and freshness. Stale data (older than 1 hour for tickers, older than 12 hours for history) triggers a refresh. Data with gaps, zero values, or extreme outliers (>50% single-candle moves) is flagged and handled conservatively.

**Stage 3 — Trend Detection**
Three SMAs are computed: SMA20 (short-term), SMA50 (medium-term), SMA200 (long-term). Price position relative to these MAs determines trend:
- **Bullish**: Price > SMA20 > SMA50
- **Bearish**: Price < SMA20 < SMA50
- **Range**: Mixed / conflicting signals

Higher high / higher low sequences over the last 10 candles provide structure confirmation.

**Stage 4 — Momentum Measurement**
RSI-14 is the primary momentum indicator. A 14-day rate-of-change percentage is calculated and compared against the average of all tracked assets to produce a relative momentum score. This penalizes assets lagging the broader market even if their RSI appears neutral.

**Stage 5 — Volume Analysis**
Current volume is compared against the 14-day moving average volume. Rising volume during price advances is bullish confirmation. Declining volume during price advances is a divergence warning. Volume below average weakens any signal significantly.

**Stage 6 — Volatility Evaluation**
Daily returns standard deviation is calculated and annualized. This is compared against the asset's own historical baseline. Assets in abnormally high-volatility regimes have inflated risk scores, regardless of directional signals.

**Stage 7 — Support & Resistance Detection**
Local swing lows (support) and swing highs (resistance) are detected from the 30-day OHLCV history. The two most recent and relevant levels are stored as S1, S2 (support) and R1, R2 (resistance). These levels directly drive trade plan generation.

**Stage 8 — Market Structure**
Analysis of whether the asset is in an accumulation phase (higher lows forming), distribution phase (lower highs forming), or consolidation (range-bound). This provides directional bias that reinforces or contradicts the trend signal.

**Stages 9-11 — Scoring**
Composite scores are assembled from the weighted signal outputs. See Section 4 for complete scoring formulas.

**Stage 12 — Direction Decision**
Decision rules applied to scores and conditions. See Section 5 for complete decision logic.

**Stage 13 — Trade Plan Generation**
Using current price, S/R levels, and volatility, a complete trade plan is constructed. See Section 6 for full methodology.

**Stage 14 — Reasoning Generation**
Each signal analyzer contributes one or more evidence sentences. These are assembled into a coherent paragraph that explains the recommendation in plain language.

---

## 3. Signal Categories

### Phase 1 — Currently Implemented

---

#### 3.1 Technical Analysis (Trend)

**Why it matters:** Price trend is the single most reliable predictor of short-term continuation. Trading against the trend requires extraordinary evidence. The trend is Araiven's primary directional filter.

**When it matters:** Always. Every scan begins with trend classification.

**Weight in final decision:** High. A confirmed trend overrides weaker opposing signals.

**Signals used:**
- SMA20, SMA50 (primary trend confirmation)
- Price-to-MA relationship
- Higher highs / higher lows sequence
- Candle close position relative to MAs

**Output:** Trend Direction (Bullish / Bearish / Range) + Trend Strength Score (0-100)

---

#### 3.2 Momentum

**Why it matters:** Trend shows direction. Momentum shows velocity. A bullish trend with declining momentum is weakening. A bullish trend with rising momentum is accelerating. Momentum is the timing signal.

**When it matters:** Critical for entry timing. High momentum in a bullish trend = high-quality long opportunity. Diverging momentum (price rising, RSI falling) = warning signal.

**Weight in final decision:** High. Momentum directly feeds the Opportunity Score at 40% weight.

**Signals used:**
- RSI-14 (overbought >70, oversold <30, neutral 30-70)
- 14-day rate of change
- Relative momentum vs other tracked assets

**Output:** Momentum Score (0-100) + RSI value + momentum context sentence

---

#### 3.3 Volume

**Why it matters:** Volume confirms or denies price moves. Price advancing on rising volume = institutional participation = high conviction. Price advancing on declining volume = retail-driven = low conviction, likely to fail.

**When it matters:** Volume confirmation is required before any LONG or SHORT recommendation. A setup without volume confirmation is downgraded to HOLD automatically.

**Weight in final decision:** Medium. 20% of Opportunity Score, 40% of Confidence Score.

**Signals used:**
- Current volume vs 14-day average volume
- Volume trend (rising/falling over last 5 candles)
- Volume divergence detection

**Output:** Volume Confirmation Score (0-100) + confirmation sentence

---

#### 3.4 Volatility

**Why it matters:** Volatility is not good or bad — it is a risk parameter. High volatility means larger potential gains but larger potential losses. Low volatility means tighter, more predictable ranges. Araiven uses volatility to size risk, set stop losses, and estimate holding duration.

**When it matters:** Always present. High volatility inflates Risk Score. In extreme volatility regimes (crisis conditions), Araiven defaults to WAIT regardless of other signals.

**Weight in final decision:** Negative weight on Opportunity Score (higher vol = lower opportunity quality). 60% weight in Risk Score.

**Signals used:**
- Annualized volatility (std dev of daily returns x sqrt(365))
- Current vol vs 30-day historical vol baseline
- Volatility regime classification (Low / Normal / Elevated / Extreme)

**Output:** Volatility Score (0-100, where 100 = extremely volatile) + Annualized Vol % + regime label

---

#### 3.5 Market Structure

**Why it matters:** Market structure tells you who is in control — buyers or sellers. A market making higher highs and higher lows is in a buyer-controlled uptrend. A market making lower highs and lower lows is in a seller-controlled downtrend. Structure breaks (BOS) are the earliest signals of trend change.

**When it matters:** Critical for confirming trend direction and detecting reversals before price confirms them.

**Weight in final decision:** Medium. Structure confirmation raises Confidence Score. Structure conflict reduces it.

**Signals used:**
- Swing high / swing low sequence analysis
- Break of structure (BOS) detection
- Accumulation vs distribution pattern detection

**Output:** Structure Score (0-100) + structural context sentence + S1/S2/R1/R2 levels

---

#### 3.6 Price Action

**Why it matters:** Recent candle behaviour reveals immediate market sentiment. A strong bullish close near the candle's high shows buying pressure. A series of indecision candles near resistance shows conflict. Price action is the most recent and most honest signal.

**When it matters:** Used as a confirmation layer. Strong price action with good scores raises confidence. Weak price action at key levels triggers caution.

**Weight in final decision:** Supporting role. Modifies Confidence Score by +/- 5-10 points.

**Signals used:**
- Recent candle body size and position
- Consecutive bullish/bearish closes
- Candle rejection patterns (wicks at S/R)
- Distance from recent high/low

**Output:** Price Action Score (0-100) + directional bias sentence

---

### Phase 2 — Future Signals

---

#### 3.7 News & Sentiment Intelligence

**Why it matters:** A technically perfect setup can be destroyed by a single negative news event. Conversely, a weak setup can explode on positive fundamental news. News is the external wildcard that no pure technical system can predict — but can respond to.

**When it matters:** Before and after major news events (regulatory decisions, ETF approvals, protocol upgrades, exchange listings, hacks). During low-news periods, this signal has minimal weight.

**Weight in final decision:** Variable. 0-30% depending on news recency and magnitude. Can override other signals in extreme cases (e.g., exchange hack = immediate SELL regardless of technicals).

**Planned sources:** Crypto news APIs, social sentiment indexes, Fear & Greed Index

---

#### 3.8 Funding Rates

**Why it matters:** Funding rates in perpetual futures markets reveal the balance between long and short positions. Extremely positive funding (longs paying shorts heavily) means the market is over-leveraged to the upside — a contrarian bearish signal. Extremely negative funding is contrarian bullish.

**When it matters:** High impact during strong trend moves. Helps identify when a trend is over-extended and a correction is likely even without price evidence.

**Weight in final decision:** 10-20% when extreme. Used primarily as a risk modifier and reversal early warning.

---

#### 3.9 Open Interest

**Why it matters:** Rising open interest with rising price = new money entering the trend = trend continuation. Falling open interest with rising price = short covering, not genuine buying = trend is weak. Open interest peaks often coincide with trend exhaustion.

**When it matters:** During trending markets. Most useful for confirming whether a move is real or manufactured.

**Weight in final decision:** 10-15% as a trend continuation/exhaustion modifier.

---

#### 3.10 Whale Activity / Large Order Flow

**Why it matters:** Institutional and whale participants move markets. Detecting large accumulation or distribution before price responds gives Araiven a significant edge.

**When it matters:** Most powerful in low-liquidity periods (weekends, early morning UTC). Less significant in high-liquidity markets where whales cannot move price easily.

**Weight in final decision:** 15-25% when detected. A confirmed whale accumulation pattern alongside bullish technicals creates the highest-confidence setups.

---

#### 3.11 On-Chain Metrics

**Why it matters:** On-chain data shows what is actually happening on the blockchain — not what traders believe will happen. Exchange inflows (potential selling pressure), exchange outflows (accumulation), active address counts, and transaction volumes provide ground-truth about network usage.

**When it matters:** Highly relevant for longer-term (days to weeks) setups. Less relevant for intraday analysis.

**Weight in final decision:** 10-20% for medium-term recommendations. Primary signal for fundamentals-driven setups.

---

#### 3.12 Macro Events & Economic Calendar

**Why it matters:** Crypto markets are increasingly correlated with macro conditions. FOMC decisions, CPI data, and unemployment reports move Bitcoin. A technically perfect setup entering an FOMC week carries elevated uncertainty.

**When it matters:** In the 48-hour window around major macro events. Araiven will flag upcoming events as risk modifiers on all active recommendations.

**Weight in final decision:** Risk modifier only. Never a primary signal. Can trigger WAIT recommendation before scheduled events.

---

#### 3.13 ETF Flows

**Why it matters:** Spot Bitcoin ETF flows are the most direct measure of institutional money entering or leaving crypto. Consecutive days of large inflows create sustained buying pressure. Large outflows signal institutional exits.

**When it matters:** Currently Bitcoin-specific. Extremely high impact on BTC during strong inflow/outflow periods. Indirect impact on altcoins via market sentiment.

**Weight in final decision:** 15-25% for BTC. Will extend to ETH ETF data when available.

---

## 4. Scoring System

All scores are integers from **0 to 100**. No score is ever random. Every score is computed deterministically from market data. The same market conditions always produce the same score.

---

### 4.1 Opportunity Score

**What it measures:** How attractive is this asset for a trade right now? High = strong setup with multiple confirming signals. Low = weak or conflicting signals.

**Formula:**
```
Opportunity Score = round(
  (Trend Strength x 0.40) +
  (Momentum Score x 0.40) +
  (Volume Confirmation x 0.20)
)
```

**Interpretation:**

| Score | Meaning |
|---|---|
| 80-100 | Exceptional setup — multiple signals aligned |
| 65-79 | Strong setup — most signals confirming |
| 50-64 | Moderate setup — some signals present |
| 35-49 | Weak setup — conflicting signals |
| 0-34 | No setup — do not trade |

**What raises it:** Strong trend + high momentum + volume confirmation
**What lowers it:** Range-bound market, low momentum, volume divergence

---

### 4.2 Risk Score

**What it measures:** How much risk does this trade carry? High = dangerous. Low = safer.

**Formula:**
```
Risk Score = round(
  (Volatility Score x 0.60) +
  ((100 - Trend Strength) x 0.40)
)
```

**Interpretation:**

| Score | Meaning | Action |
|---|---|---|
| 0-25 | Low risk | Full position sizing allowed |
| 26-45 | Moderate risk | Standard position sizing |
| 46-65 | Elevated risk | Reduced position sizing recommended |
| 66-80 | High risk | Minimal position only |
| 81-100 | Extreme risk | Do not trade |

**What raises it:** High volatility, weak trend, conflicting signals
**What lowers it:** Low volatility, strong clear trend, high volume confirmation

---

### 4.3 Confidence Score

**What it measures:** How confident is Araiven in its own recommendation? High = strong evidence base. Low = limited or ambiguous data.

**Formula:**
```
Confidence Score = round(
  (Trend Strength x 0.40) +
  (Volume Confirmation x 0.40) +
  ((100 - Volatility Score) x 0.20)
)
```

**Interpretation:**

| Score | Meaning |
|---|---|
| 80-100 | Very high confidence — strong evidence across all signals |
| 65-79 | High confidence — most signals clearly confirming |
| 50-64 | Moderate confidence — setup exists but mixed signals |
| 35-49 | Low confidence — proceed with caution or skip |
| 0-34 | Very low confidence — do not trade |

**What raises it:** Trend confirmed by volume, low volatility, clear structure
**What lowers it:** High volatility, volume divergence, conflicting MA signals

---

### 4.4 Market Health Score (Planned)

**What it measures:** The overall state of the crypto market. A weak market context reduces the quality of any individual setup.

**Formula (planned):**
```
Market Health Score = round(
  (BTC Dominance Trend x 0.30) +
  (Average 24h Change across assets x 0.30) +
  (Total Market Volume vs 7d avg x 0.20) +
  (Average Volatility across assets x 0.20, inverted)
)
```

**How it affects other scores:** In poor market health (score < 35), all Opportunity Scores are multiplied by 0.75. No LONG recommendations are made when Market Health < 25.

---

### 4.5 Portfolio Compatibility Score (Planned)

**What it measures:** How well does this opportunity fit the user's specific risk profile, current allocations, and stated goals?

**Factors:**
- User's declared risk stance (Conservative / Balanced / Aggressive)
- Current portfolio allocation to this asset
- Portfolio-level correlation between new position and existing holdings
- Remaining cash/stable allocation for deployment

**How it affects recommendations:** Conservative users see only opportunities with Risk Score < 40. Aggressive users see all opportunities with Risk Score < 75.

---

### Score Combination Rules

When multiple scores are used together, the following hierarchy applies:

1. **Risk Score is the veto.** If Risk Score >= 81, no LONG or SHORT is recommended regardless of Opportunity Score.
2. **Confidence Score is the filter.** If Confidence Score < 35, the recommendation is WAIT even if Opportunity Score is high.
3. **Opportunity Score is the primary rank.** When multiple assets qualify, they are ranked by Opportunity Score descending.
4. **Scores are never averaged together blindly.** Each score answers a different question and is used at its specific pipeline stage.

---

## 5. Recommendation Engine

Araiven produces one of five possible recommendations for each asset. Each is governed by explicit, non-negotiable rules.

---

### LONG

Araiven recommends LONG when **all five** of the following conditions are true:

1. Trend Direction = **Bullish**
2. RSI is in the range **40-70** (not overbought, not oversold)
3. Opportunity Score >= **60**
4. Risk Score < **65**
5. Volume Confirmation Score >= **45**

**What it means:** The asset shows structural upward momentum, confirmed by volume, with acceptable risk and a price that has not yet extended to overbought levels. There is a high-probability window for a profitable long entry.

---

### SHORT

Araiven recommends SHORT when **all five** of the following conditions are true:

1. Trend Direction = **Bearish**
2. RSI is in the range **30-60** (not oversold, not overbought)
3. Opportunity Score < **45**
4. Risk Score < **65**
5. Volume Confirmation Score >= **45** (confirming selling pressure)

**What it means:** The asset is in a confirmed downtrend with volume participation. There is a high-probability window for profitable short exposure.

*Note: SHORT recommendations require a higher evidence bar than LONG due to the asymmetric risk of shorting in crypto. SHORT will only be recommended when multiple bearish signals align cleanly.*

---

### HOLD

Araiven recommends HOLD when **a position is already open** and the original thesis has not been invalidated. HOLD is not a "do nothing" recommendation — it is an active signal to maintain the position.

Conditions for HOLD:
- Existing position is open
- Price has not breached the original stop loss level
- The primary trend that justified entry is still intact
- No new bearish signals strong enough to override the original thesis

---

### WAIT

Araiven recommends WAIT when market conditions exist but the setup is **not clean enough to act on yet**. WAIT means: "This asset is on my watchlist. The conditions are forming but not yet confirmed. Do not enter yet."

Conditions for WAIT:
- Trend is forming but not yet confirmed (e.g., testing key level)
- Opportunity Score is in the range 45-59
- RSI is outside the ideal entry range (too overbought or too oversold)
- An upcoming macro event creates elevated uncertainty
- Volume has not yet confirmed the price move

---

### DO NOTHING

Araiven recommends DO NOTHING when there is genuinely no opportunity present and no reason to monitor this asset closely.

Conditions:
- Trend = Range (no directional conviction)
- Opportunity Score < 35
- Volume is below average with no trend
- No structural development occurring

*DO NOTHING is not a failure state. It is an accurate assessment. Araiven that recognises poor setups and recommends inaction is more valuable than one that forces trades in unfavourable conditions.*

---

## 6. Trade Plan Framework

Every LONG or SHORT recommendation includes a complete trade plan. No field is optional. No field is randomly generated.

---

### 6.1 Suggested Entry

**How it is determined:**

- **LONG:** Entry = Current Market Price x 0.995 (0.5% below current price, giving a slight pullback buffer)
  - If current price is more than 2% above the nearest Support level, entry is adjusted closer to that support
  - Entry must be above S1
- **SHORT:** Entry = Current Market Price x 1.005 (0.5% above current price, giving a slight bounce buffer)
  - Entry must be below R1

**Why:** Entering slightly off the current price avoids FOMO entries and improves the risk-reward ratio.

---

### 6.2 Stop Loss

**How it is determined:**

- **LONG:** SL = S1 x 0.98 (2% below the nearest significant support level)
  - If SL is more than 8% below Entry, the trade is rejected (risk too large)
  - SL must never be placed above Entry
- **SHORT:** SL = R1 x 1.02 (2% above the nearest significant resistance level)
  - SL must never be placed below Entry

**Why:** Stop losses placed at structural levels are more likely to hold. Random percentage stops ignore where the market actually respects price.

---

### 6.3 Take Profit

**How it is determined:**

- **LONG:** TP = R1 x 1.01 (1% above the nearest significant resistance level)
  - If the resulting RR ratio < 1.5:1, TP is extended to R2 instead
- **SHORT:** TP = S1 x 0.99 (1% below the nearest significant support level)
  - If the resulting RR ratio < 1.5:1, TP is extended to S2 instead

**Why:** Taking profit at resistance for longs (and support for shorts) aligns exits with where the market is most likely to reverse.

---

### 6.4 Risk-Reward Ratio

**Calculation:**
```
For LONG:  RR = |Take Profit - Entry| / |Entry - Stop Loss|
For SHORT: RR = |Entry - Take Profit| / |Stop Loss - Entry|
```

**Minimum acceptable RR:** 1.5:1
**Target RR:** 2.0:1 or better
**Reject trade if:** RR < 1.5:1 (trade is not mathematically justified)

---

### 6.5 Estimated Holding Duration

| Annualized Volatility | Expected Duration |
|---|---|
| > 120% (Extreme) | 1-2 days |
| 80-120% (High) | 2-3 days |
| 50-80% (Normal) | 3-5 days |
| < 50% (Low) | 7-10 days |

---

### 6.6 Trade Quality Classification

| Condition | Grade |
|---|---|
| All 5 conditions met + RR >= 2.5:1 | A — Institutional Grade |
| All 5 conditions met + RR >= 2.0:1 | B — High Quality |
| 4 conditions met + RR >= 1.5:1 | C — Standard |
| 3 conditions met | D — Marginal (WAIT recommended) |
| Less than 3 conditions | F — Rejected (DO NOTHING) |

---

### 6.7 Market Regime

Each trade plan includes a regime label:

- **Trending Bull Market** — Crypto broadly in uptrend, high confidence in longs
- **Trending Bear Market** — Crypto broadly in downtrend, longs carry elevated risk
- **Ranging/Sideways** — No macro directional bias, setups require stronger evidence
- **High Volatility Regime** — Exceptional caution, reduce position sizes
- **Recovery Phase** — Following significant drawdown, structure forming but unconfirmed

---

## 7. Explainability Standard

Every Araiven recommendation must answer all of the following questions. If Araiven cannot answer a question, it must state that the evidence is insufficient.

---

### The Seven Explainability Questions

**1. Why this asset?**
What specific signals triggered this recommendation? Why was this asset chosen over others that were scanned simultaneously?

*Example: "BTC was selected because it scored highest across all tracked assets with an Opportunity Score of 78, driven by a confirmed bullish trend (SMA20 > SMA50) and above-average volume over the last 3 candles."*

**2. Why this direction?**
Why LONG and not SHORT or HOLD?

*Example: "A LONG direction was recommended because the asset is above key support at $63,200, RSI is at 48 (not overbought), and the trend shows higher highs over the last 8 candles."*

**3. Why now?**
What changed recently that makes this the right moment to act?

*Example: "Volume has increased 34% above the 14-day average in the last 24 hours, confirming that the recent price advance has genuine participation — not just low-volume drift."*

**4. Why not another asset?**
How does this compare to other opportunities available?

*Example: "ETH scored an Opportunity Score of 62 with elevated Risk Score of 58. SOL's trend is currently classified as Range with insufficient volume confirmation. BTC presented the cleanest setup."*

**5. What are the biggest risks?**
What could go wrong with this trade?

*Example: "Primary risk: A close below $63,200 (S1) would invalidate the bullish structure and trigger the stop loss. Secondary risk: Annualized volatility is at 68%, meaning intraday swings of 3-4% are normal."*

**6. What would invalidate this trade?**
Under what specific conditions should the position be exited or reconsidered?

*Example: "This trade is invalidated if: (a) Price closes below $62,100 (Stop Loss), (b) RSI moves above 75 before reaching TP, (c) A major negative news event is detected."*

**7. What is the confidence level and why?**
How certain is Araiven, and what is driving that level of certainty?

*Example: "Confidence is 74%. Trend and volume signals are clearly bullish. Confidence is not higher because global market health is moderate (52/100) and volatility is slightly above the 6-month average."*

---

### Reasoning Output Format

Every generated reasoning block follows this structure:

```
[TREND]     {Trend direction and strength sentence.}
[MOMENTUM]  {RSI level and relative momentum sentence.}
[VOLUME]    {Volume confirmation or divergence sentence.}
[STRUCTURE] {Support/resistance context and structural state.}
[RISK]      {Primary risk factors and volatility context.}
[SIGNAL]    {Final directional signal and confidence summary.}
```

---

## 8. Future Multi-Agent Architecture

As Araiven scales, the single-engine model will evolve into a collaborative multi-agent system. Each agent is a specialist. The Supervisor Agent arbitrates disagreements and produces the final recommendation.

---

### Agent Roster

```
                    SUPERVISOR AGENT
                 Weighs all agent outputs.
                 Resolves disagreements.
                 Produces final recommendation.
                         |
     _____________________|_____________________
    |              |                |           |
TECHNICAL      NEWS INTEL        MACRO       RISK
AGENT          AGENT             AGENT       AGENT
TA, S/R,       Headlines,        CPI, FOMC,  Portfolio
Structure,     Sentiment,        DXY, Global risk,
Patterns       Social signal     risk appetite Drawdown cap
    |              |                |           |
    |         ON-CHAIN          PORTFOLIO   EXECUTION
    |         AGENT             AGENT       AGENT
    |         Wallets,          Holdings,   Order routing,
    |         Exchange flows,   Allocation, Position monitoring,
    |         Active addresses  Rebalance   SL triggers
    |_______________|________________|___________|
```

---

### Agent Communication Protocol

Each agent produces a structured vote:

```json
{
  "agent": "TechnicalAgent",
  "asset": "BTC",
  "direction": "LONG",
  "conviction": 78,
  "evidence": [
    "Bullish trend above SMA20 and SMA50",
    "RSI at 48, neutral zone",
    "Volume 28% above 14-day average"
  ],
  "risk_flags": [],
  "veto": false
}
```

---

### Disagreement Resolution Rules

**Rule 1 — Veto Power**
Any agent can issue `veto: true` if it detects an extreme condition (e.g., Risk Agent detects Risk Score >= 81, News Agent detects a hack or regulatory ban). A veto by any single agent immediately overrides all bullish signals. Result = WAIT or DO NOTHING.

**Rule 2 — Weighted Consensus**

| Market Regime | Primary Agents | Secondary Agents |
|---|---|---|
| Trending market | Technical, Momentum | News, Macro |
| High news activity | News, Macro | Technical |
| Accumulation phase | On-Chain, Volume | Technical |
| High-volatility regime | Risk | All others reduced |

**Rule 3 — Minimum Agreement**
A LONG or SHORT recommendation requires at least 3 agents voting in the same direction. If only 2 agree, the result is WAIT.

**Rule 4 — Confidence Averaging**
Final Confidence Score = weighted average of all agent conviction scores, adjusted by each agent's weight in the current regime.

**Rule 5 — Reasoning Assembly**
Each agent contributes one paragraph to the final reasoning output. The Supervisor Agent assembles them in pipeline order and notes contradictions explicitly as "Conflicting signal noted."

---

## 9. Design Principles

These principles are not guidelines. They are constraints. Every feature of Araiven must comply with all of them.

---

**9.1 Explainability First**
Every score, recommendation, and trade plan must be traceable to specific market data. If a score cannot be explained in plain English with reference to actual numbers, it is not a valid output.

**9.2 Conservatism by Default**
When signals are ambiguous, Araiven always defaults to the more conservative recommendation:

```
LONG / SHORT  <  WAIT  <  HOLD  <  DO NOTHING
```

When uncertain, go right on this scale.

**9.3 Consistency**
The same market conditions always produce the same recommendation. Araiven has no mood. It has no bias. It cannot be influenced by recent wins or losses. Each scan starts from scratch with the current data.

**9.4 Evidence Dependency**
No score is ever produced without real data to support it. If market data is unavailable, incomplete, or stale, Araiven flags the condition and either requests a data refresh or communicates the data quality issue in its output.

**9.5 Transparency About Uncertainty**
Araiven communicates its confidence level at all times. A Confidence Score of 52 must be displayed as 52%, not rounded up to 60%. A WAIT recommendation is a valid and important output. Uncertainty is information.

**9.6 No Overconfidence**
Araiven never expresses false certainty. In cryptocurrency markets, no outcome is guaranteed. Araiven can express high conviction (Confidence Score 85+) on particularly clear setups — but always with the caveat that all trades carry risk.

**9.7 Reliability Over Performance**
Araiven is built to be reliably useful across all market conditions — not to produce extraordinary returns in bull markets at the cost of catastrophic losses in bear markets. Reliability means:
- Fewer false positives
- Honest WAIT and DO NOTHING recommendations when conditions don't qualify
- Risk management built into every recommendation

---

## 10. What Araiven Must Never Do

These are absolute prohibitions. No feature, optimisation, or user request can override them.

**1. Never recommend without evidence.**
If the data does not support a recommendation, Araiven outputs WAIT or DO NOTHING. It does not force a LONG or SHORT because a user expects one or because the platform "should" always have an active recommendation.

**2. Never fabricate scores.**
No score is randomly generated, rounded up to seem more confident, or adjusted based on what "feels right." All scores are mathematical outputs of defined formulas applied to real data.

**3. Never hide uncertainty.**
If Araiven does not have enough data to make a confident recommendation, it says so explicitly. It does not paper over data gaps with confident-sounding language.

**4. Never chase hype.**
A coin trending on social media is not a signal. A celebrity endorsement is not a signal. An influencer's post is not a signal. Araiven only responds to quantitative market data.

**5. Never overtrade.**
A high Opportunity Score on one asset does not justify scanning for more setups to fill the recommendation feed. Araiven recommends only what the market presents. There is no quota for recommendations per day.

**6. Never recommend unnecessary risk.**
If a trade does not meet the minimum RR ratio, it is rejected. If the Risk Score exceeds the user's risk profile, it is filtered out. Araiven does not show high-risk trades to conservative users "for informational purposes."

**7. Never ignore its own stop losses.**
If a position's stop loss level is breached, Araiven must flag it as invalidated. It does not hold on and hope for recovery. The plan is the plan.

**8. Never present a recommendation without a complete trade plan.**
A direction (LONG) without an entry, stop loss, and take profit is not a recommendation — it is a guess. Araiven only outputs complete, actionable plans.

**9. Never pretend to know what it cannot know.**
Future price is unknown. Araiven does not predict price. It assesses probability. It identifies where evidence suggests price is more likely to go, while explicitly acknowledging that markets can and do move unexpectedly.

**10. Never prioritise engagement over accuracy.**
Araiven is not designed to produce exciting recommendations to keep users engaged. It is designed to produce accurate recommendations to help users make better decisions. If the market is boring and the correct recommendation is DO NOTHING for 5 consecutive days — that is the correct output.

---

## Final Statement

Araiven is built on one foundational belief:

> **A user who understands why they are in a trade will always make better decisions than one who does not.**

This framework exists to ensure that every output Araiven produces is traceable, honest, explainable, and designed around the user's long-term success — not short-term engagement metrics or the appearance of intelligence.

Every line of code written for Araiven must serve this mission.

---

*Araiven Intelligence Framework v1.0*
*Ravora — AI Trading Copilot*
*Last updated: June 2026*
