# Ravora MVP V1 - Product Specification

## 1. Goal

Build a high-craft, trustworthy AI-powered wealth platform and trading terminal that demonstrates the core Ravora experience using the **Design System V2.0 (Gunmetal Night, Stone, Amber)** and the **Araiven Decision Engine**.

---

## 2. Included Features in V1

### User & Authentication System
- Registration & Login (Email, Mobile, OTP, Supabase Auth)
- 7-Step Tailored Onboarding Wizard (Experience, Capital, Risk Stance, Goals, Assistance Model)
- Cryptographic session management (JWT)

### Trading Terminal (Cockpit)
- Interactive Candlestick Chart (Dual-Engine: TradingView Widget + Araiven Native SVG Engine)
- Timeframe Selection (`1m`, `5m`, `15m`, `1h`, `4h`, `1D`)
- AI Overlay Toggles (Support/Resistance levels & Araiven Target Ladders)
- Live Market Radar / Watchlist with instant asset switching
- Real-time L2 Orderbook Depth (Bids & Asks with live spread)
- Rapid 1-Click Order Execution form with leverage slider (1x–10x)

### Wealth Workspace (Portfolio)
- Live Equity Balance & Unrealized PnL
- Araiven Safety Health Score (0–100)
- Historical Performance Equity Curve
- Asset Allocation Breakdown (Crypto, Staking, Cash)
- Open Paper Positions Table with 1-click close functionality

### Global Markets Matrix
- Top 24h Movers (Trending Volume, Top Gainers, Top Losers)
- Searchable Market Matrix Table with real-time price feeds
- Deep Asset Inspection Drawer with trajectory sparkline and AI structural audits

### AI Intelligence (Araiven)
- Algorithmic Opportunity Discovery with Confidence Scoring ($C_s$)
- Plain-English Strategy Justifications
- Conversational Strategy Auditing via Araiven Copilot Chat

### Risk Management Guard
- User Risk Stances:
  * **Conservative**: 1.5% max drawdown target
  * **Balanced**: 3.5% max drawdown target
  * **Aggressive**: 8.5% max drawdown target
- Position Risk Warnings & Drawdown Monitor

### Paper Trading Sandbox
- $100k Default Virtual Balance
- Simulated 1-Click Trade Placement
- Real-Time Position Performance Tracking

### Exchange Integration
- Phase 1 Connection Interface: Binance API Key connection (Read & Trade with Withdrawal Block validation)

---

## 3. NOT Included In V1 (Reserved for Future Phases)

- Traditional equities / Stocks / ETFs (Phase 4)
- Automated emergency custodial execution (Phase 4)
- Native iOS / Android Mobile Apps (Phase 4)
- Multi-Agent Autonomous Swarms (Phase 4)
- Options & Derivatives complex multi-leg builder (Phase 4)

---

## 4. Success Criteria

A user can:
1. Sign up and complete the 7-step onboarding profiling.
2. Enter the dashboard and inspect real-time candlestick charts in the Trading Terminal.
3. Test trade strategies with the \$100k virtual paper trading sandbox.
4. Review surfaced Araiven opportunities with plain-English rationales.
5. Audit strategy decisions inside the Araiven Copilot chat.
6. Connect an exchange API key for balance aggregation.

---

## 5. V1 Purpose

Validate user demand, establish unshakeable trust through non-custodial risk guardrails, and deliver an institutional-grade financial terminal experience.
