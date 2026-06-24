# Ravora Opportunity Engine - Specification & Examples V1.0

This document defines how Araiven identifies, ranks, scores, and presents wealth-building opportunities to Ravora users.

---

## 1. What Qualifies as an Opportunity?
The Opportunity Engine filters the market for three specific allocation opportunities:

1. **Yield Premium Spreads:** Occur when decentralized lending pools (Aave, Compound) or validator staking rates show a yield differential that exceeds the user’s baseline cash yield by at least **1.5% APY**, without increasing net asset exposure.
2. **Structural Momentum Breakouts:** Occur when institutional inflows (such as Spot ETFs) or DEX trading volumes cross key support zones, indicating a high probability of upward momentum.
3. **Macro Hedging Rotations:** Occur when macro volatility spikes (e.g., Fed rate hikes), prompting Araiven to recommend rotating volatile assets into stablecoin yield baskets to protect capital.

---

## 2. Ranking & Selection Logic
Araiven filters and ranks opportunities using a **Risk-Adjusted Efficiency Score ($E_r$)**:

$$E_r = \frac{\text{Expected APY}}{\text{Drawdown Risk Index}} \cdot C_s$$

Where:
* **Expected APY:** Projected annual yield or target price appreciation percentage.
* **Drawdown Risk Index:** Volatility metric scored from 1 (Low) to 10 (High).
* **$C_s$:** Araiven Confidence Score (0.00 to 1.00).

Opportunities are matched against the user's active settings:

| Stance | Primary Target | Asset Types Allowed | Excluded Opportunities |
| :--- | :--- | :--- | :--- |
| **Conservative** | Capital Preservation | USDC, USDT, low-leverage stable pools | Momentum breakouts on volatile assets (SOL) |
| **Balanced** | Staking Income & Blue-chips | BTC, ETH, Stable Basket | High-beta altcoin swing trades |
| **Aggressive** | Maximum Growth | BTC, ETH, SOL, Liquidity Pairs | Low-yield stablecoin lending |

---

## 3. Real-world Scenarios (BTC, ETH, SOL)

### 3.1 Ethereum (ETH) Staking Opportunity
* **Name:** Ethereum Staking Alpha
* **Type:** Yield Premium
* **Confluence:** Validator queue consolidation + post-upgrade staking pattern support.
* **Expected APY:** 8.0% - 12.0%
* **Stance Match:** Balanced, Aggressive

#### Recommendation Output
```json
{
  "opportunityId": "eth-staking-alpha",
  "asset": "ETH/USD",
  "confidenceScore": 94,
  "riskLevel": "Low",
  "expectedReturn": "9.62% APY",
  "suggestedAllocation": "8% of Cash Reserves",
  "reasoningText": "Validator queue dynamics have stabilized near the post-upgrade support range of $3,450. Araiven scans show institutional inflows into staking pools yielding a 2.1% premium over baseline rates, offering asymmetric low-drawdown yield accumulation."
}
```

---

### 3.2 Bitcoin (BTC) Momentum Opportunity
* **Name:** Bitcoin ETF Momentum Stacking
* **Type:** Momentum Flow
* **Confluence:** Net spot ETF inflows accelerating for 5 consecutive days + exchange supply reserves reaching multi-year lows.
* **Expected APY:** 15.0% - 22.0%
* **Stance Match:** Balanced, Aggressive

#### Recommendation Output
```json
{
  "opportunityId": "btc-etf-momentum",
  "asset": "BTC/USD",
  "confidenceScore": 89,
  "riskLevel": "Medium",
  "expectedReturn": "18.50% (Appreciation Target)",
  "suggestedAllocation": "12% of Portfolio Value",
  "reasoningText": "Consecutive net ETF inflows have established strong structural support at $64,000. Capital is locking up at record rates, indicating a high-probability squeeze toward range highs of $72,500. Exposure is buffered by our active 3.50% trailing stop-loss."
}
```

---

### 3.3 Solana (SOL) Liquidity Staking Opportunity
* **Name:** Solana Liquidity Staking Accumulation
* **Type:** Momentum Flow / Yield
* **Confluence:** DEX volume indices rising 40% + trading fees generating high yield on Jupiter/Raydium liquidity pools.
* **Expected APY:** 22.0% - 32.0%
* **Stance Match:** Aggressive Only

#### Recommendation Output
```json
{
  "opportunityId": "sol-liquidity-staking",
  "asset": "SOL/USD",
  "confidenceScore": 78,
  "riskLevel": "High",
  "expectedReturn": "26.70% APY (Variable)",
  "suggestedAllocation": "6% of Portfolio Value",
  "reasoningText": "Solana DEX volume expansion has driven transaction fee pools to record yields. While volatility is high, the reward-to-risk ratio is optimal under the Aggressive profile. Autopilot stop-loss parameters will trigger a swap to stablecoins if SOL drops below $124."
}
```

---

## 4. UI Rendering Specifications
To maintain Ravora's premium design guidelines, opportunities must be rendered on-screen with the following treatments:

1. **Stance Tags:** Pill badges displaying the profile match (e.g., `Balanced Shield` or `Aggressive Capture`).
2. **Confidence Gauges:** Concentric SVG rings that draw the confidence score dynamically, styled in the accent colors (Success Green for low risk, Purple for medium risk, Amber for high risk).
3. **Reasoning Block:** Clear, plain-text typography using the `Inter` font, avoiding dense technical charts or TradingView widgets to maintain simplicity and clarity.
