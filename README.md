# Ravora - AI-Powered Wealth Operating System

> **"Your Wealth, Intelligently Managed."**  
> An institutional-grade AI wealth copilot and trading terminal powered by the **Araiven Decision Engine**.

---

## 1. What is Ravora?

Ravora is an AI-native financial operating system designed for modern investors, active traders, and busy professionals. Instead of forcing users to spend hours studying chart indicators, orderbook feeds, and macro announcements, Ravora automates market scanning, risk calculation, and portfolio rebalancing.

Users configure their personal financial objectives and risk stance; the **Araiven Engine** continuously evaluates global liquidity, detects mathematical confluences, and presents plain-English 1-Click execution ladders.

---

## 2. Core Value Proposition & Goals

* **Non-Custodial Precision:** Connects to centralized exchanges (Binance, Bybit, Coinbase) and decentralized protocols without requiring custody of user capital.
* **Algorithmic Risk Armor:** Hard-capped drawdown limits (**Conservative 1.5%**, **Balanced 3.5%**, **Aggressive 8.5%**) with emergency automated stablecoin rotations.
* **High-Signal Opportunity Discovery:** Continuously evaluates orderbook depth, yield spreads (Aave, Uniswap), and momentum anomalies.
* **Paper-to-Live Smooth Transition:** Users test ideas with a virtual $100k sandbox before committing real capital.

---

## 3. Brand Identity & Design System V2.0

Ravora uses an institutional financial terminal aesthetic built to the highest UI/UX standards ([Mobbin](https://mobbin.com) patterns and [Impeccable](https://impeccable.style) clean terminal principles). All generic AI slop (glowing radial halos, purple gradients, low-contrast text) has been replaced by a strictly disciplined three-color palette:

* **Gunmetal Night (`#0b0e14`, `#10141d`, `#151a26`)**: Primary dark backgrounds, surfaces, and focused low-fatigue workspace.
* **Stone (`#cbd5e1`, `#94a3b8`, `rgba(203, 213, 225, 0.12)`)**: High-legibility neutral text, secondary surfaces, and crisp 1px borders.
* **Amber (`#f59e0b`, `#fbbf24`, `#d97706`)**: Signature accent representing active intelligence, primary CTA buttons, and key indicators.
* **Market Indicators**: Emerald (`#10b981`) for profit/bullish; Rose (`#ef4444`) for loss/bearish.

---

## 4. Application Architecture & Screens

```
                                    ┌─────────────────────┐
                                    │    Landing Page     │
                                    └──────────┬──────────┘
                                               │
                                    ┌──────────▼──────────┐
                                    │ Authentication Flow │ (Email / Mobile / OTP / Supabase)
                                    └──────────┬──────────┘
                                               │
                                    ┌──────────▼──────────┐
                                    │  Onboarding Wizard  │ (7-Step Tailored Profile)
                                    └──────────┬──────────┘
                                               │
                                    ┌──────────▼──────────┐
                                    │    App Dashboard    │
                                    └──────────┬──────────┘
              ┌─────────────────┬──────────────┼────────────────┬─────────────────┐
              │                 │              │                │                 │
    ┌─────────▼────────┐ ┌──────▼──────┐ ┌─────▼──────┐ ┌───────▼────────┐ ┌──────▼───────┐
    │ Trading Terminal │ │  Portfolio  │ │  Markets   │ │ Opportunities  │ │ Araiven AI    │
    │ (Candlesticks)   │ │ (Workspace) │ │  (Matrix)  │ │ (Scan Engine)  │ │ (Audit Chat)  │
    └──────────────────┘ └─────────────┘ └────────────┘ └────────────────┘ └───────────────┘
```

### Dashboard Workspaces:
1. **Trading Terminal (`/dashboard` - Terminal Tab)**:
   - **Dual Candlestick Engine**: Integrated TradingView widget and Araiven Native SVG Candlestick Engine.
   - **Timeframe Selector**: `1m`, `5m`, `15m`, `1h`, `4h`, `1D`.
   - **AI Overlay Toggles**: Support/Resistance lines and Araiven Target Ladders (+4.5%).
   - **Market Radar**: Instant coin filtering and search (BTC, ETH, SOL, BNB, XRP, ADA, AVAX).
   - **L2 Orderbook Depth**: Real-time bid/ask spread ladders.
   - **Rapid 1-Click Execution**: Long/Short switch, leverage slider (1x–10x), and sandbox trade deployment.

2. **Wealth Workspace (`/dashboard` - Portfolio Tab)**:
   - Total equity balance, safety health score (0–100), historical growth chart.
   - Active asset allocation breakdowns and open paper positions.

3. **Global Markets Matrix (`/dashboard` - Markets Tab)**:
   - Top 24h turnover movers, top gainers, top pullbacks.
   - Searchable market table with deep asset research drawer.

4. **Araiven Scan Matrix (`/dashboard` - Opportunities Tab)**:
   - Live yield and momentum setups with confidence scoring ($C_s$).
   - 1-Click deployment into active portfolio.

5. **Araiven Copilot (`/dashboard` - Copilot Tab)**:
   - Conversational strategy auditing and macro risk explanations.

6. **System Parameters (`/dashboard` - Settings Tab)**:
   - Exchange API key management, auto-hedge risk guards, notification alerts.

---

## 5. Phased Product Roadmap

* **Phase 1: Foundations & Simulated Accounts (Current)**:
  - 7-Step Onboarding profiling.
  - Paper Trading Engine ($100k virtual sandbox).
  - Trading Terminal with dual candlestick charting.
  - Gunmetal Night, Stone, and Amber design system.
* **Phase 2: Read-Only Integrations & Live Sync**:
  - Non-custodial exchange connection (Binance, Bybit, Coinbase).
  - Hourly wallet holdings synchronization.
  - Real-time DeFi yield feed (Aave, Uniswap).
* **Phase 3: Active Advisory & 1-Click Live Trading**:
  - Direct 1-Click order execution on connected exchanges.
  - Automated trailing stop-loss triggers and slippage protection.
  - Conversational trade execution inside Araiven Copilot chat.
* **Phase 4: Full Autopilot & Asset Expansion**:
  - Autonomous emergency rotation to stablecoins upon drawdown breach.
  - Expansion to US Stocks, ETFs, and Commodities via broker APIs (Alpaca).
  - Multi-agent AI specialized sub-networks.

---

## 6. Tech Stack

* **Frontend**: React 18, Vite, TypeScript, Tailwind CSS, Lucide Icons, Sonner.
* **Backend**: Node.js, Express, SQLite3 (local) / PostgreSQL (production), JSON Web Tokens (JWT).
* **Authentication**: Supabase Auth (OAuth, Email, OTP).
* **Charts**: TradingView Technical Analysis Widget + Araiven Native SVG Candlestick Engine.
* **Hosting**: Vercel (Frontend) & Render (Backend API).
