# Ravora Notification System - Product Specification V1.0

This document defines Ravora's notification engine, classifying alerts, priority hierarchies, delivery methods, and user interaction states.

---

## 1. Notification Architecture Overview
Ravora's notifications are split into five logical channels. To prevent alert fatigue and maintain a premium SaaS experience, delivery channels are strictly tied to priority:

```
+-------------------+       +-----------------------+       +----------------------+
|   HIGH PRIORITY   |       |    MEDIUM PRIORITY    |       |     LOW PRIORITY     |
+-------------------+       +-----------------------+       +----------------------+
| * Emergency Risks |       | * Opportunities       |       | * Goal Progress      |
| * Drawdown Limits |       | * Rebalancing Swaps   |       | * General News       |
+---------+---------+       +-----------+-----------+       +----------+-----------+
          |                             |                              |
+---------v---------+       +-----------v-----------+       +----------v-----------+
| In-App + Push     |       | In-App Dashboard      |       | Email Digest /       |
| (Immediate action)|       | (Requires user audit) |       | Background Feed      |
+-------------------+       +-----------------------+       +----------------------+
```

---

## 2. Notification Matrix & Channel Definitions

### 2.1 Opportunities Channel

#### New Opportunity Found
* **Trigger:** An asset meets stance constraints and has a confidence score $C_s \ge 75\%$.
* **Priority:** Medium
* **Delivery Method:** In-App Banner + Dashboard Feed
* **User Action:** Click to open **Opportunity Detail Drawer** to audit reasoning and deploy allocation.

#### High Conviction Opportunity
* **Trigger:** An asset has a confidence score $C_s \ge 90\%$.
* **Priority:** High
* **Delivery Method:** Push Notification + In-App Drawer Banner
* **User Action:** Inspect allocation swap parameters and click **Approve & Execute**.

---

### 2.2 Risk Channel

#### Portfolio Risk Increased
* **Trigger:** Portfolio Safety Score drops below **80/100** due to asset volatility.
* **Priority:** Medium
* **Delivery Method:** In-App Warning Card + Notification Badge
* **User Action:** Review the risk breakdown inside the Portfolio tab to check asset correlation.

#### Position Exceeds Risk Limits
* **Trigger:** An asset allocation rises $+15\%$ above its target weight, or portfolio daily drawdown exceeds **75% of the risk stance cap**.
* **Priority:** Critical
* **Delivery Method:** Push Notification + Email + In-App Modal
* **User Action:** Acknowledge risk limits and approve recommended rotation to stablecoins.

---

### 2.3 Market Events Channel

#### Major News Detected
* **Trigger:** NLP sentiment tracker detects news sentiment drops below $-0.6$ or rises above $+0.6$.
* **Priority:** Low
* **Delivery Method:** Background Market Pulse Feed
* **User Action:** Read explanation digest (no immediate transaction required).

#### Macro Event Impact
* **Trigger:** Macro events (such as Fed rate hikes or CPI announcements) cause volatility spikes that affect active assets.
* **Priority:** Medium
* **Delivery Method:** In-App Alert Banner
* **User Action:** Review Araiven's assessment of how the event impacts portfolio assets.

---

### 2.4 Portfolio Channel

#### Rebalancing Suggested
* **Trigger:** Capital drag (idle funds) is detected, or asset allocation drift exceeds **5%**.
* **Priority:** Medium
* **Delivery Method:** Dashboard Directive Card + Notification Badge
* **User Action:** Click **Approve & Execute** to run the recommended asset rebalancing swap.

#### Goal Progress Update
* **Trigger:** Portfolio value passes a milestone (e.g., $+10\%$ growth), or goal progress increases by $+5\%$.
* **Priority:** Low
* **Delivery Method:** Weekly Email Digest + Dashboard Card
* **User Action:** View progress charts and share milestone reports.

---

### 2.5 Araiven Engine Channel

#### New Recommendation
* **Trigger:** The decision engine completes a market audit and recommends a portfolio rebalancing pivot.
* **Priority:** High
* **Delivery Method:** In-App Directive Alert + Push Notification
* **User Action:** Open the copilot conversation tab to review reasoning and execute the swap.

#### Confidence Upgrade
* **Trigger:** An active opportunity's confidence score $C_s$ rises by **+10%** due to improved orderbook liquidity.
* **Priority:** Low
* **Delivery Method:** In-App Opportunity Update Badge
* **User Action:** Inspect updated metrics inside the Opportunity Explorer.

#### Confidence Downgrade
* **Trigger:** An active opportunity's confidence score $C_s$ falls below the **75% threshold**.
* **Priority:** Medium
* **Delivery Method:** In-App Opportunity Dismissal Notice
* **User Action:** Acknowledge that the opportunity has been dismissed from the feed.

---

## 3. Notification Payload Schema Example
```json
{
  "notificationId": "notif-99881",
  "channel": "risk",
  "type": "limit_exceeded",
  "priority": "CRITICAL",
  "title": "Portfolio Drawdown Alert",
  "body": "Ethereum price volatility has triggered 85% of your Balanced model drawdown limit. Araiven recommends rotating 10% ETH exposure to USDC Stable Basket.",
  "timestamp": "2026-06-24T09:40:02Z",
  "isRead": false,
  "action": {
    "label": "Authorize Defensive Swap",
    "route": "/app/copilot",
    "payload": {
      "rebalanceId": "reb-88229",
      "fromAsset": "ETH",
      "toAsset": "USDC",
      "percentage": 10
    }
  }
}
```
