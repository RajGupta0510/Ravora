# Ravora MVP Implementation Plan - Technical Build Specification V1.0

This document defines the exact milestone-based build order, priorities, complexity ratings, and requirements for delivering the Ravora MVP.

---

## 1. Build Order & Milestone Roadmap

```
+-------------------------------------------------------------------------------+
|                             DEVELOPMENT TIMELINE                              |
+--------------------------------------+----------------------------------------+
                                       |
    +----------------------------------+----------------------------------+
    |                                  |                                  |
+---v------------------------+  +------v---------------------+  +---------v------------------+
|    MILESTONE 1: AUTH       |  |    MILESTONE 3: PORTFOLIO  |  |    MILESTONE 5: EXPLORER   |
|    MILESTONE 2: ONBOARDING |  |    MILESTONE 4: ADVISORY   |  |    MILESTONE 6: NOTIFS     |
+----------------------------+  +----------------------------+  +----------------------------+
                                                                          |
                                                                          v
                                                                +---------v------------------+
                                                                |    MILESTONE 7: INTEGRATION|
                                                                |    MILESTONE 8: LAUNCH     |
                                                                +----------------------------+
```

---

## 2. Milestone Specifications

### Milestone 1: Authentication
* **Priority:** Critical (P0) - Foundation Blocker
* **Dependencies:** None
* **Estimated Complexity:** Low - Medium (Standard OAuth/JWT setup)
* **Requirements:**
  * *Frontend:* Login page layout, Registration page layout, JWT storage implementation.
  * *Backend:* `/auth/register` and `/auth/login` handlers, token generation and verification.
  * *Database:* `users` table schema, index on email.

---

### Milestone 2: Onboarding
* **Priority:** Critical (P0) - Profiling baseline
* **Dependencies:** Milestone 1 (User session active)
* **Estimated Complexity:** Low (Static questionnaire state machine)
* **Requirements:**
  * *Frontend:* Step-by-step onboarding cards (Experience, Capital, Risk, Goals) in `/app/`.
  * *Backend:* `/user/onboard` API handler to capture user parameters.
  * *Database:* `user_profiles` and `risk_profiles` schemas.

---

### Milestone 3: Portfolio Tracking
* **Priority:** Critical (P0) - Primary workspace view
* **Dependencies:** Milestone 2
* **Estimated Complexity:** Medium (Data calculations and SVG render)
* **Requirements:**
  * *Frontend:* Portfolio balance card, active safety score gauge, asset weights list.
  * *Backend:* `/portfolio` and `/portfolio/history` API aggregates.
  * *Database:* `portfolios` and `portfolio_assets` tables.

---

### Milestone 4: Araiven Recommendations (Simulated Advisory)
* **Priority:** Critical (P0) - The core product experience
* **Dependencies:** Milestone 3
* **Estimated Complexity:** High (Slippage calculations, paper execution logic)
* **Requirements:**
  * *Frontend:* Active Directive panel on dashboard, execution click actions.
  * *Backend:* `/opportunities/recommendations` and simulated `/execute` order routing.
  * *Database:* `opportunities` and `araiven_recommendations` tables.

---

### Milestone 5: Opportunity Explorer
* **Priority:** High (P1) - Secondary view
* **Dependencies:** Milestone 4
* **Estimated Complexity:** Medium (Lists filtering, drawer modals)
* **Requirements:**
  * *Frontend:* Opportunities list grid, filter tabs (Yield, Momentum), Detail Drawer modal.
  * *Backend:* `/opportunities` aggregation and confidence threshold filters.
  * *Database:* Example mock records seeded into `opportunities`.

---

### Milestone 6: Notifications & Alerts
* **Priority:** High (P1) - Safety communications
* **Dependencies:** Milestone 4
* **Estimated Complexity:** Low - Medium (Events queue listener)
* **Requirements:**
  * *Frontend:* Header notification badge, alerts drawer panel, read toggle triggers.
  * *Backend:* `/notifications` and read-state API handlers.
  * *Database:* `notifications` table and index on read state.

---

### Milestone 7: Exchange Integrations (Semi-Automated live trade routing)
* **Priority:** High (P1) - Live monetization blocker
* **Dependencies:** Milestone 4, Milestone 3
* **Estimated Complexity:** High (API signature verification, encryption vaults)
* **Requirements:**
  * *Frontend:* Exchange config setup forms in settings.
  * *Backend:* `/settings/exchanges` connection checks, AWS KMS secrets store drivers, order execution routing.
  * *Database:* `connected_exchanges` table.

---

### Milestone 8: Production Launch
* **Priority:** Critical (P0) - Project closeout
* **Dependencies:** Milestones 1 - 7
* **Estimated Complexity:** Medium (Hosting and deployment setup)
* **Requirements:**
  * *Frontend:* Static CDN deployment (Vercel/S3), asset minimization.
  * *Backend:* Server deployment (AWS EKS/ECS), database replication config.
  * *Database:* Seed configurations, migration pipelines.
