# Ravora Portfolio Intelligence - Product Specification V1.0

This document defines how Araiven audits, scores, and rebalances user portfolios, serving as the core analytical specification.

---

## 1. Portfolio Evaluation Framework
Araiven evaluates portfolios by treating holdings not as isolated tokens, but as an interconnected ecosystem of asset variance, correlation, and yields.

```
+-------------------------------------------------------------------------------+
|                        PORTFOLIO AUDIT PIPELINE                               |
+--------------------------------------+----------------------------------------+
                                       |
    +----------------------------------+----------------------------------+
    |                                  |                                  |
+---v------------------------+  +------v---------------------+  +---------v------------------+
|    CORRELATION MATRIX      |  |    EXPOSURE BALANCE        |  |    CASH YIELD EFFICIENCY   |
+----------------------------+  +----------------------------+  +----------------------------+
| Evaluates asset-to-asset   |  | Audits concentration risks |  | Identifies idle cash       |
| covariance to prevent      |  | and verifies alignment with|  | reserves that are missing  |
| hidden systematic risk.    |  | selected risk limits.      |  | active yield options.      |
+----------------------------+  +----------------------------+  +----------------------------+
```

---

## 2. Core Scoring Models

### 2.1 Portfolio Health Score
The **Health Score ($H_p$)** is a 0-100 rating representing how well the portfolio balances safety, risk constraints, and yield optimization:

$$H_p = (W_{drawdown} \cdot S_{dd}) + (W_{alloc} \cdot S_{al}) + (W_{yield} \cdot S_{ye})$$

Where:
* $S_{dd}$ = Drawdown Safety Rating (0 to 100): Calculated based on the distance between current daily variance and the hard drawdown cap (1.5%, 3.5%, or 8.5%).
* $S_{al}$ = Target Allocation Fit (0 to 100): Margin of variance from the user’s selected goal weights.
* $S_{ye}$ = Yield Efficiency Score (0 to 100): Percentage of portfolio capital capturing optimized lending or staking yield vs. sitting idle.
* $W_{drawdown}, W_{alloc}, W_{yield}$ = Weight coefficients (default: $0.5$, $0.3$, $0.2$).

### 2.2 Diversification Score
Calculated using **Shannon Entropy ($H_s$)** of the portfolio weights, scaled by asset covariance:

$$\text{Diversification Score} = \left( -\sum_{i=1}^{n} w_i \ln(w_i) \right) \cdot (1 - \overline{\rho})$$

Where:
* $w_i$ = Percentage weight of asset $i$.
* $\overline{\rho}$ = Average correlation coefficient of all assets in the portfolio. High correlation (e.g., holding BTC and ETH during high covariance periods) penalizes the diversification score.

---

## 3. Sector & Asset Categories
Araiven classifies assets into four core sectors to assess systemic risk:

1. **Capital Guards:** Stablecoins (USDC, USDT, USDS) deployed in low-risk lending protocols.
2. **Layer 1 Bluechips:** Bitcoin (BTC) and Ethereum (ETH) representing long-term market accumulation.
3. **DeFi Yield:** Decentralized liquid staking pools (e.g., Lido ETH, Jup SOL) capturing validator yields.
4. **Fiat/Cash:** Unallocated exchange capital sitting idle.

---

## 4. Common Portfolio Anomalies & Alerts
Araiven triggers corrective rebalance directives when it detects any of the following four states:

### 4.1 Overexposure to a Single Asset
* *Trigger:* A single volatile asset exceeds its target weight by **+15%**.
* *Anomaly:* Concentration Risk.
* *Directive:* Swap excess gains into the stable yield basket to locking profits.

### 4.2 Exceeded Risk Limits
* *Trigger:* Portfolio Safety Score drops below **70/100** due to altcoin volatility.
* *Anomaly:* Stance Non-Compliance.
* *Directive:* Rotate high-beta assets into stablecoin yield indexes.

### 4.3 Low Diversification
* *Trigger:* Average correlation coefficient $\overline{\rho}$ rises above **0.85**.
* *Anomaly:* Correlation Confluence.
* *Directive:* Reallocate capital from highly-correlated assets to delta-neutral yield pools.

### 4.4 Idle Capital
* *Trigger:* Unallocated cash/stablecoins exceed **5%** of the portfolio for over 24 hours.
* *Anomaly:* Capital Drag.
* *Directive:* Deploy unspent reserves into Aave stablecoin yield indices (e.g., stable lending).

---

## 5. Example Portfolio Review Payloads

### Example 1: Balanced Portfolio Review (Healthy Stance)
```json
{
  "portfolioId": "port-user-101",
  "timestamp": "2026-06-24T09:30:00Z",
  "healthScore": 96,
  "riskStance": "Balanced Shield",
  "diversificationScore": 82,
  "anomaliesDetected": [],
  "metrics": {
    "totalValue": 132194.10,
    "activeApy": "12.42%",
    "drawdown24h": "0.18%"
  },
  "allocations": [
    { "sector": "L1 Bluechips", "percentage": 65, "status": "Optimized" },
    { "sector": "DeFi Yield", "percentage": 30, "status": "Optimized" },
    { "sector": "Fiat/Cash", "percentage": 5, "status": "Optimized" }
  ],
  "recommendations": []
}
```

### Example 2: Non-Compliant Portfolio Review (Idle & Overexposed)
```json
{
  "portfolioId": "port-user-202",
  "timestamp": "2026-06-24T09:35:00Z",
  "healthScore": 64,
  "riskStance": "Conservative Shield",
  "diversificationScore": 41,
  "anomaliesDetected": ["Concentration Risk", "Capital Drag"],
  "metrics": {
    "totalValue": 84500.00,
    "activeApy": "3.10%",
    "drawdown24h": "4.20%"
  },
  "allocations": [
    { "sector": "L1 Bluechips (SOL)", "percentage": 40, "status": "Overexposed" },
    { "sector": "L1 Bluechips (BTC)", "percentage": 35, "status": "Optimized" },
    { "sector": "Fiat/Cash", "percentage": 25, "status": "Idle" }
  ],
  "recommendations": [
    {
      "type": "Idle Capital Deployment",
      "severity": "Medium",
      "action": "Deploy 20% idle cash into USDC Stablecoin Yield Basket",
      "impact": "Increases portfolio APY from 3.10% to 5.80% while retaining liquidity."
    },
    {
      "type": "Concentration Risk Reduction",
      "severity": "High",
      "action": "Rotate 15% SOL exposure into USDC Stablecoin Yield Basket",
      "impact": "Lowers portfolio beta and aligns max drawdown cap to the Conservative limit (1.50%)."
    }
  ]
}
```
