# Ravora MVP Roadmap - Product Delivery Specification V1.0

This document outlines the phased delivery roadmap for Ravora, detailing timelines, features, priorities, and dependencies to deliver the smallest viable product that provides immediate value.

---

## 1. Roadmap Overview

```
+-------------------------------------------------------------------------------+
|                            PRODUCT DELIVERY PHASES                            |
+--------------------------------------+----------------------------------------+
                                       |
    +----------------------------------+----------------------------------+
    |                                  |                                  |
+---v------------------------+  +------v---------------------+  +---------v------------------+
|    PHASE 1: FOUNDATIONS    |  |   PHASE 2: READ-ONLY LIVE  |  |    PHASE 3: 1-CLICK LIVE   |
|    & SIMULATORS (W1-4)     |  |   INTEGRATIONS (W5-8)      |  |    TRADING (W9-12)         |
+----------------------------+  +----------------------------+  +----------------------------+
| * Onboarding profiling     |  | * Connect exchange API     |  | * Route live trades        |
| * Paper Trading Engine     |  | * Live wallet balance sync |  | * Active stop-loss limits  |
| * 1-Click simulated trades |  | * Scanned opportunity feed |  | * Copilot chat auditing    |
+----------------------------+  +----------------------------+  +----------------------------+
```

---

## 2. Phase-by-Phase Specifications

### Phase 1: Foundations & Simulated Accounts
* **Timeline:** Weeks 1 - 4
* **Priority:** Critical (P0)
* **Complexity:** Low
* **Dependencies:** None (Standalone static UI shell)

#### Feature Deliverables
* **Onboarding Wizard:** Profile setup capturing experience level, capital limits, risk stance (Conservative, Balanced, Aggressive), and primary goal.
* **Paper Trading Engine:** Simulated sandbox utilizing real-time price feeds to run mock trades with a virtual $100k balance.
* **Dashboard Shell:** Visual rendering of portfolio balances, safety health gauges, and static historical growth charts.

#### Scope Classification
* **Must Have:** Onboarding setup, virtual wallet tracking, simulated 1-click execution.
* **Should Have:** Background system logging of transaction ledgers.
* **Nice To Have:** Multi-language translations.

---

### Phase 2: Read-Only Integration & Live Sync
* **Timeline:** Weeks 5 - 8
* **Priority:** High (P1)
* **Complexity:** Medium
* **Dependencies:** Database service, KMS Key vaults, Exchange API integration.

#### Feature Deliverables
* **Exchange Connections:** Interface to connect exchange keys with withdrawal permissions validated and blocked.
* **Live Wallet Sync:** Hourly retrieval of actual assets, balances, and average entry costs from connected accounts.
* **Opportunity Feed:** Active feed displaying real-time yield premiums (Aave, Uniswap) and momentum signals.

#### Scope Classification
* **Must Have:** Read-only API verification, live balance aggregation.
* **Should Have:** Email alert digests for newly surfaced opportunities.
* **Nice To Have:** Real-time web-socket updates on balance charts.

---

### Phase 3: Active Advisory & 1-Click Live Trading
* **Timeline:** Weeks 9 - 12
* **Priority:** High (P1)
* **Complexity:** High
* **Dependencies:** Whitelisted IP routing gateway, order placement drivers.

#### Feature Deliverables
* **1-Click Live Execution:** Placing trades directly on connected exchanges when a user clicks **Approve & Execute**.
* **Risk Control Guards:** Trailing stop-loss triggers and limit-order slippage checks.
* **Araiven Copilot Chat:** Auditing capabilities allowing users to query strategy justifications in chat.

#### Scope Classification
* **Must Have:** 1-Click Live Rebalancing, IP-whitelisted execution gateway, trailing stop-losses.
* **Should Have:** Take-profit tier targets.
* **Nice To Have:** Conversational swap requests inside chat.

---

### Phase 4: Autopilot & Asset Expansion
* **Timeline:** Weeks 13+
* **Priority:** Medium (P2)
* **Complexity:** Very High
* **Dependencies:** Microservices auto-scaling, traditional asset data feeds.

#### Feature Deliverables
* **Autopilot Guard:** Automatic rotation of assets into stablecoin baskets when drawdown limits are violated.
* **Asset Class Expansion:** Adapters to trade traditional financial instruments (Stocks, ETFs) using third-party brokers (Alpaca).

#### Scope Classification
* **Must Have:** Automated emergency rotation.
* **Should Have:** Autopilot target allocation bands.
* **Nice To Have:** Traditional broker connection options.
