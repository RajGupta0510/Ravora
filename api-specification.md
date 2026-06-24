# Ravora API Specification - REST API Specification V1.0

This document defines the REST API endpoints, request/response models, permissions, and error codes for the Ravora platform services.

---

## 1. Global Specifications & Base URL
* **Base URL:** `https://api.ravora.com/v1`
* **Format:** JSON (`application/json`)
* **Authentication Header:** `Authorization: Bearer <JWT_TOKEN>`

---

## 2. API Endpoints

### 2.1 Authentication & User Management

#### POST `/auth/register`
Creates a new user account.
* **Method:** `POST`
* **Route:** `/auth/register`
* **Permissions:** Public
* **Request:**
  ```json
  {
    "email": "user@example.com",
    "password": "StrongPassword123!"
  }
  ```
* **Response (201 Created):**
  ```json
  {
    "userId": "9a7b7e28-2c26-4d04-8b43-9828236746ef",
    "email": "user@example.com",
    "token": "eyJhbGciOi..."
  }
  ```
* **Errors:**
  * `400 Bad Request` (Email invalid, Password too weak)
  * `409 Conflict` (Email already registered)

#### POST `/auth/login`
Authenticates user and returns JWT session token.
* **Method:** `POST`
* **Route:** `/auth/login`
* **Permissions:** Public
* **Request:**
  ```json
  {
    "email": "user@example.com",
    "password": "StrongPassword123!"
  }
  ```
* **Response (200 OK):**
  ```json
  {
    "token": "eyJhbGciOi..."
  }
  ```
* **Errors:**
  * `401 Unauthorized` (Invalid credentials)

---

### 2.2 Onboarding & User Profiles

#### GET `/user/profile`
Retrieves the user's profiling stance.
* **Method:** `GET`
* **Route:** `/user/profile`
* **Permissions:** Authenticated User (`userId` matched from JWT claim)
* **Response (200 OK):**
  ```json
  {
    "experienceLevel": "beginner",
    "primaryGoal": "preservation",
    "riskStance": "balanced",
    "maxDrawdownCap": 3.50
  }
  ```

#### POST `/user/onboard`
Submits initial onboarding profiling choices.
* **Method:** `POST`
* **Route:** `/user/onboard`
* **Permissions:** Authenticated User
* **Request:**
  ```json
  {
    "experienceLevel": "beginner",
    "capitalAmount": 132000,
    "riskLevel": 1,
    "primaryGoal": "preservation"
  }
  ```
* **Response (200 OK):**
  ```json
  {
    "status": "completed",
    "initializedAt": "2026-06-24T09:30:00Z"
  }
  ```

---

### 2.3 Portfolio Service

#### GET `/portfolio`
Retrieves aggregated balance, safety score, and active sector weight distributions.
* **Method:** `GET`
* **Route:** `/portfolio`
* **Permissions:** Authenticated User
* **Response (200 OK):**
  ```json
  {
    "currentBalance": 132194.10,
    "currency": "USD",
    "safetyScore": 96,
    "annualizedYield": "12.42%",
    "holdings": [
      {
        "asset": "Ethereum Staking Alpha",
        "symbol": "ETH",
        "allocationPct": 45.00,
        "amount": 17.069,
        "entryPrice": 3482.40,
        "currentPrice": 3485.10,
        "change24h": 2.15
      }
    ]
  }
  ```

#### GET `/portfolio/history`
Returns historical balances for charting over periods (`24h`, `7d`, `30d`, `1y`).
* **Method:** `GET`
* **Route:** `/portfolio/history?period=24h`
* **Permissions:** Authenticated User
* **Response (200 OK):**
  ```json
  {
    "period": "24h",
    "points": [128000, 127200, 129500, 128400, 130800, 131500, 132194]
  }
  ```

---

### 2.4 Opportunities & Araiven Recommendations

#### GET `/opportunities`
Lists active scanned alpha opportunities compiled by Araiven.
* **Method:** `GET`
* **Route:** `/opportunities`
* **Permissions:** Authenticated User
* **Response (200 OK):**
  ```json
  [
    {
      "opportunityId": "7bd49012-3210-410c-99a2-9b223cde882b",
      "type": "yield",
      "name": "Ethereum Staking Alpha",
      "symbol": "ETH / USD",
      "icon": "Ξ",
      "confidenceScore": 94,
      "riskLevel": "low",
      "expectedReturn": "8.0% - 12.0%"
    }
  ]
  ```

#### GET `/opportunities/recommendations`
Retrieves pending rebalance directives generated specifically for the user's stance.
* **Method:** `GET`
* **Route:** `/opportunities/recommendations`
* **Permissions:** Authenticated User
* **Response (200 OK):**
  ```json
  [
    {
      "recommendationId": "rec-55221a",
      "opportunity": {
        "opportunityId": "7bd49012-3210-410c-99a2-9b223cde882b",
        "name": "Ethereum Staking Alpha"
      },
      "suggestedAllocationPct": 8.00,
      "reasoningText": "Validator queue dynamics have stabilized near the post-upgrade support range of $3,450. Araiven scans show institutional inflows into staking pools yielding a 2.1% premium.",
      "status": "pending"
    }
  ]
  ```

#### POST `/opportunities/recommendations/:id/execute`
Authorizes 1-click execution of a recommended directive swap.
* **Method:** `POST`
* **Route:** `/opportunities/recommendations/rec-55221a/execute`
* **Permissions:** Authenticated User (Write API key access)
* **Response (200 OK):**
  ```json
  {
    "status": "cleared",
    "transactionId": "tx-8833-ad92",
    "clearedPrice": 3485.10,
    "executionFee": 10.56,
    "timestamp": "2026-06-24T09:42:00Z"
  }
  ```
* **Errors:**
  * `422 Unprocessable Entity` (Slippage bounds exceeded, Insufficient funds)
  * `502 Bad Gateway` (Exchange API failure)

---

### 2.5 Exchange Integrations

#### POST `/settings/exchanges`
Connects a new live broker API credential.
* **Method:** `POST`
* **Route:** `/settings/exchanges`
* **Permissions:** Authenticated User
* **Request:**
  ```json
  {
    "exchangeName": "binance",
    "apiKey": "bin_key_abc123...",
    "apiSecret": "bin_sec_xyz789..."
  }
  ```
* **Response (200 OK):**
  ```json
  {
    "status": "connected",
    "exchange": "binance",
    "isWithdrawalDisabled": true,
    "isTradeExecutionEnabled": true
  }
  ```
* **Errors:**
  * `400 Bad Request` (Invalid API key credentials or Withdrawal permission is enabled)

---

### 2.6 Copilot Conversations

#### POST `/copilot/message`
Sends a query to the Araiven Copilot and receives a real-time audited response.
* **Method:** `POST`
* **Route:** `/copilot/message`
* **Permissions:** Authenticated User
* **Request:**
  ```json
  {
    "message": "Analyze my current yield spread"
  }
  ```
* **Response (200 OK):**
  ```json
  {
    "reply": "Under your active model, Araiven is capturing compounding spreads across two major channels: **Ethereum validator staking** (45% allocation, yielding 9.6% APY) and **Stablecoin Lending pool spreads** (30% allocation, yielding 8.2% APY).",
    "stats": "Overall Portfolio APY: 12.42% | Safety Index: Fully Compliant",
    "actions": []
  }
  ```

---

### 2.7 Notifications Service

#### GET `/notifications`
Retrieves alerts, sorted by priority.
* **Method:** `GET`
* **Route:** `/notifications`
* **Permissions:** Authenticated User
* **Response (200 OK):**
  ```json
  [
    {
      "notificationId": "notif-99881",
      "channel": "risk",
      "priority": "critical",
      "title": "Portfolio Drawdown Alert",
      "body": "Ethereum price volatility has triggered 85% of your Balanced model drawdown limit.",
      "isRead": false
    }
  ]
  ```

#### POST `/notifications/read`
Marks all user notifications as read.
* **Method:** `POST`
* **Route:** `/notifications/read`
* **Permissions:** Authenticated User
* **Response (200 OK):**
  ```json
  {
    "status": "success",
    "markedReadCount": 3
  }
  ```
