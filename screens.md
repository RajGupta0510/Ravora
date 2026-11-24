# Ravora Screen Inventory & Interface Architecture V2.0

This document defines the complete inventory of screens, panels, and modal interfaces in Ravora, aligned with **Design System V2.0 (Gunmetal Night, Stone, Amber)** and the **Araiven Decision Engine**.

---

## 1. Public & Marketing Interfaces

### 1. Landing Page (`/`)
* **Purpose:** Introduce Ravora's AI wealth copilot philosophy and convert visitors into active users.
* **Aesthetic:** Institutional Gunmetal Night atmosphere (`#0b0e14`) with Amber action accents (`#f59e0b`).
* **Key Sections:**
  - **Navigation Bar:** Brand logo, product links, and "Launch App" CTA button.
  - **Hero Section:** Clean high-contrast typography, live platform metrics, and instant registration entry.
  - **Terminal Showcase:** High-fidelity interactive preview of the Candlestick Trading Terminal.
  - **Araiven Intelligence Breakdown:** Explanation of the 3-stage ingestion, risk filtering, and output pipeline.
  - **Risk Stance Comparison:** Interactive visual showing Conservative (1.5%), Balanced (3.5%), and Aggressive (8.5%) guardrails.
  - **Footer:** Security disclosure, 256-bit TLS transmission notice, and legal terms.

### 2. Authentication Flow (`/auth/:mode`)
* **Purpose:** High-security onboarding and credential management powered by Supabase & JWT.
* **Modes Supported:**
  - `login`: Dual-method login via Email Address or Mobile Number + Password/OTP.
  - `register`: Account creation with instant sandbox access.
  - `forgot`: Password recovery request via verified email/SMS.
  - `reset`: Cryptographically verified password reset token stage.
  - `otp`: One-time verification passcode input with automatic focus advance.

---

## 2. Onboarding Experience

### 3. Araiven Onboarding Wizard (`/onboarding`)
* **Purpose:** A structured 7-step profiling sequence to calibrate user risk parameters before workspace generation.
* **Visual Style:** Centered card on deep gunmetal canvas with an Amber progress bar.
* **Steps:**
  1. **Welcome Screen:** Overview of Araiven's automated wealth platform.
  2. **Trading Experience:** Beginner, Intermediate (Active), or Advanced (Professional).
  3. **Interested Markets:** Multi-select grid (Crypto, Stocks, Forex, Futures, Commodities, ETFs).
  4. **Primary Objective:** Long-term, Swing trading, Day trading, Portfolio growth, Capital preservation, or Learning.
  5. **Dashboard Configuration:** Simple, Balanced (Recommended), or Professional view.
  6. **Araiven Assistance Model:** Find opportunities, Explain trends, Build trade plans, Portfolio insights, Risk management, Market alerts.
  7. **Review & Confirm:** Interactive profile confirmation card with 1-click stage navigation.

---

## 3. Core Authenticated Workspace (`/dashboard`)

The dashboard is structured into 6 primary operational panels accessible via the fixed left sidebar:

### 4. Market Trading Terminal (`Tab: terminal` - Default)
* **Purpose:** High-performance real-time execution cockpit with interactive candlestick charting.
* **Components:**
  - **Top Control Bar:** Active asset quote ($63,314.01), 24h delta (+1.50%), 24h volume, timeframe pills (`1m`, `5m`, `15m`, `1h`, `4h`, `1D`), Paper/Live mode toggle, and Chart Engine toggle.
  - **Market Radar (Left Rail):** Instant search and filtered asset list (BTC, ETH, SOL, BNB, XRP, ADA, AVAX) with real-time price ticks.
  - **Candlestick Chart Canvas (Center):**
    - Dual Engine: TradingView Candlestick Widget + Araiven Native SVG Candlestick Engine.
    - AI Overlays: Dynamic Support/Resistance levels and Araiven Target Ladders (+4.5%).
    - Live Amber price ticker line with floating coordinate tag.
  - **L2 Orderbook & Rapid Execution (Right Rail):**
    - Orderbook Depth: Real-time ask (red) and bid (green) depth ladder.
    - 1-Click Order Form: Buy/Long vs. Sell/Short switch, position size selector ($250, $500, $1000, $2500), and leverage slider (1x–10x) wired directly to sandbox execution.
  - **Bottom Directive Banner:** Real-time Araiven structural assessment for the active asset.

### 5. Wealth Workspace (`Tab: portfolio`)
* **Purpose:** High-level portfolio tracking, safety audits, and historical equity curve.
* **Components:**
  - **Total Balance & Risk Score:** Live portfolio balance, 24h growth delta, and Araiven Safety Score (0–100).
  - **Equity Curve Chart:** Historical performance line chart rendered with Stone neutrals and Amber trajectory.
  - **Asset Allocation Breakdown:** Visual allocation progress bars across crypto, staking, and cash reserves.
  - **Open Paper Positions:** Active simulated positions table with real-time unrealized PnL, leverage, and 1-click close buttons.

### 6. Global Markets Matrix (`Tab: markets`)
* **Purpose:** Broad market intelligence, turnover leaders, and asset discovery.
* **Components:**
  - **Top Movers Cards:** Trending 24h volume leaders, Top Gainers, and Top Losers.
  - **Filter Segmented Tabs:** All Assets, Large Cap, High Volatility, Gainers, Losers.
  - **Global Matrix Table:** Searchable table showing price, 24h change, volume, and market cap.
  - **Slide-Over Asset Drawer:** Detailed asset research modal with 24h trajectory sparkline, KPI grid, Araiven AI technical audit, and 1-click "Open in Candlestick Terminal" button.

### 7. Araiven Scan Matrix (`Tab: opportunities`)
* **Purpose:** Algorithmic opportunity discovery engine displaying verified market setups.
* **Components:**
  - **Opportunity Cards:** Asset symbol, strategy name (e.g. "USDC/ETH Yield Rebalance", "SOL Momentum Breakout"), timeframe, and Araiven Confidence Score.
  - **Entry & Target Zones:** Visual entry price range, target profit zone, and hard stop-loss buffer.
  - **AI Rationale:** Plain-English explanation of why the setup passed mathematical risk thresholds.
  - **1-Click Execution Trigger:** Direct deployment into active portfolio.

### 8. Araiven AI Copilot (`Tab: copilot`)
* **Purpose:** Conversational strategy auditing and natural-language risk assessment.
* **Components:**
  - **Chat Stream:** Interactive message history between the user and Araiven.
  - **Audit Queries:** Quick prompt pills (*"Audit my portfolio risk"*, *"Explain today's BTC momentum"*, *"What is my maximum drawdown?"*).
  - **Actionable Responses:** Structured markdown replies containing recommendation cards with 1-click execution buttons.

### 9. System Parameters (`Tab: settings`)
* **Purpose:** Security settings, risk guard adjustments, and exchange key management.
* **Components:**
  - **Exchange Integrations:** Non-custodial API key connection cards for Binance, Bybit, and Coinbase.
  - **Risk Guard Configuration:** Toggle for Automated Drawdown Shield and Auto-Hedge Emergency Rotation.
  - **Notification Preferences:** Email, push, and digest alert toggles.
  - **Account Credentials:** Password change and session security management.

---

## 4. Notifications & Modals

### 10. Notifications Log Drawer
* Accessible via the top header bell icon across all dashboard panels.
* Displays high-priority safety alerts (red shield) and strategic directive notices (amber star).
* Real-time unread badge indicator.
