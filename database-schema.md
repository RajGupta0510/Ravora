# Ravora Database Schema - Technical Specification V1.0

This document defines Ravora's relational database schema for PostgreSQL, including table definitions, keys, relationships, indexes, and example records.

---

## 1. Entity-Relationship Summary

```
[users] 
   |-- (1:1) --> [user_profiles]
   |-- (1:1) --> [risk_profiles]
   |-- (1:1) --> [user_settings]
   |-- (1:N) --> [connected_exchanges]
   |-- (1:1) --> [portfolios] ---> (1:N) ---> [portfolio_assets]
   |-- (1:N) --> [transactions]
   |-- (1:N) --> [araiven_recommendations]
   |-- (1:N) --> [notifications]
   |-- (1:N) --> [watchlists]
   |-- (1:N) --> [copilot_conversations]
```

---

## 2. Table Definitions & Schemas

### 2.1 Table: `users`
Stores core authentication and account details.
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    is_mfa_enabled BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_users_email ON users(email);
```

### 2.2 Table: `user_profiles`
Stores onboarding and experience stance variables.
```sql
CREATE TYPE experience_level_enum AS ENUM ('beginner', 'intermediate', 'advanced');
CREATE TYPE primary_goal_enum AS ENUM ('preservation', 'income', 'growth');

CREATE TABLE user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    experience_level experience_level_enum NOT NULL,
    primary_goal primary_goal_enum NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### 2.3 Table: `risk_profiles`
Stores active risk control limits.
```sql
CREATE TYPE risk_stance_enum AS ENUM ('conservative', 'balanced', 'aggressive');

CREATE TABLE risk_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    risk_stance risk_stance_enum NOT NULL,
    max_drawdown_cap NUMERIC(4,2) NOT NULL, -- e.g., 3.50 for 3.5%
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### 2.4 Table: `user_settings`
Handles system execution preferences.
```sql
CREATE TYPE execution_mode_enum AS ENUM ('advisory', 'autopilot_guard', 'autopilot_full');

CREATE TABLE user_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    auto_hedge_enabled BOOLEAN DEFAULT TRUE,
    notifications_enabled BOOLEAN DEFAULT TRUE,
    execution_mode execution_mode_enum DEFAULT 'advisory',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### 2.5 Table: `connected_exchanges`
Stores encrypted credentials for API keys.
```sql
CREATE TYPE exchange_name_enum AS ENUM ('binance', 'bybit', 'coinbase', 'kraken', 'paper_trading');
CREATE TYPE exchange_status_enum AS ENUM ('active', 'inactive', 'failed');

CREATE TABLE connected_exchanges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    exchange_name exchange_name_enum NOT NULL,
    api_key_kms_arn VARCHAR(255),
    api_secret_encrypted TEXT,
    status exchange_status_enum DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_user_exchange UNIQUE (user_id, exchange_name)
);
```

### 2.6 Table: `portfolios`
Main portfolio tracking aggregates.
```sql
CREATE TABLE portfolios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    current_balance NUMERIC(16,2) DEFAULT 0.00,
    currency VARCHAR(10) DEFAULT 'USD',
    safety_score INT DEFAULT 100,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### 2.7 Table: `portfolio_assets`
Stores asset holdings and entry bases.
```sql
CREATE TABLE portfolio_assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    portfolio_id UUID NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,
    asset_symbol VARCHAR(16) NOT NULL, -- e.g., 'ETH', 'USDC'
    allocation_pct NUMERIC(5,2) NOT NULL, -- e.g., 45.00 for 45%
    balance_amount NUMERIC(24,8) NOT NULL,
    average_entry_price NUMERIC(16,8) NOT NULL,
    CONSTRAINT unique_portfolio_asset UNIQUE (portfolio_id, asset_symbol)
);
```

### 2.8 Table: `transactions`
Clearing ledger for swap actions.
```sql
CREATE TYPE tx_type_enum AS ENUM ('swap', 'staking_deposit', 'staking_withdrawal', 'hedge_in', 'hedge_out');
CREATE TYPE tx_status_enum AS ENUM ('pending', 'completed', 'failed', 'hedged');

CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    transaction_type tx_type_enum NOT NULL,
    asset_pair VARCHAR(32) NOT NULL, -- e.g., 'USDC/ETH'
    amount VARCHAR(64) NOT NULL, -- String to handle decimals (e.g. '2.50 ETH')
    cleared_price NUMERIC(16,8) NOT NULL,
    execution_fee NUMERIC(12,8) NOT NULL,
    status tx_status_enum DEFAULT 'completed',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_transactions_user_created ON transactions(user_id, created_at);
```

### 2.9 Table: `opportunities`
Global opportunities table scanned by Araiven.
```sql
CREATE TYPE opp_type_enum AS ENUM ('yield', 'momentum', 'hedge');
CREATE TYPE risk_level_enum AS ENUM ('low', 'medium', 'high');

CREATE TABLE opportunities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    opportunity_type opp_type_enum NOT NULL,
    name VARCHAR(255) NOT NULL,
    symbol VARCHAR(32) NOT NULL,
    icon_symbol VARCHAR(8) NOT NULL,
    confidence_score INT NOT NULL,
    expected_return VARCHAR(64) NOT NULL,
    risk_level risk_level_enum NOT NULL,
    reasoning_text TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### 2.10 Table: `araiven_recommendations`
User-specific directives pushed by Araiven.
```sql
CREATE TYPE rec_status_enum AS ENUM ('pending', 'approved', 'rejected', 'expired');

CREATE TABLE araiven_recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    opportunity_id UUID NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
    suggested_allocation_pct NUMERIC(5,2) NOT NULL,
    status rec_status_enum DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### 2.11 Table: `notifications`
Alerts and background logs.
```sql
CREATE TYPE notif_channel_enum AS ENUM ('opportunities', 'risk', 'market', 'portfolio', 'araiven');
CREATE TYPE notif_priority_enum AS ENUM ('low', 'medium', 'high', 'critical');

CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    channel notif_channel_enum NOT NULL,
    priority notif_priority_enum NOT NULL,
    title VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    payload JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_notifications_user_unread ON notifications(user_id) WHERE is_read = FALSE;
```

### 2.12 Table: `watchlists`
User-specific watch assets.
```sql
CREATE TABLE watchlists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    asset_symbol VARCHAR(16) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_user_watchlist UNIQUE (user_id, asset_symbol)
);
```

### 2.13 Table: `copilot_conversations`
Chat history logs.
```sql
CREATE TYPE speaker_enum AS ENUM ('user', 'copilot', 'system');

CREATE TABLE copilot_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    sender speaker_enum NOT NULL,
    message_text TEXT NOT NULL,
    stats_meta VARCHAR(255),
    actions_json JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_conversations_user_created ON copilot_conversations(user_id, created_at);
```

---

## 3. Example Records (Seed Data)

### 3.1 Record: `users`
```sql
INSERT INTO users (id, email, password_hash, is_mfa_enabled)
VALUES ('9a7b7e28-2c26-4d04-8b43-9828236746ef', 'raj.gupta@example.com', '$2b$12$L8vN91xYkL998m8q4G8eO.u0k4m8n8q4G8eO.u0k4m8n8q4G8eO.u', TRUE);
```

### 3.2 Record: `user_profiles`
```sql
INSERT INTO user_profiles (user_id, experience_level, primary_goal)
VALUES ('9a7b7e28-2c26-4d04-8b43-9828236746ef', 'beginner', 'preservation');
```

### 3.3 Record: `risk_profiles`
```sql
INSERT INTO risk_profiles (user_id, risk_stance, max_drawdown_cap)
VALUES ('9a7b7e28-2c26-4d04-8b43-9828236746ef', 'balanced', 3.50);
```

### 3.4 Record: `portfolios`
```sql
INSERT INTO portfolios (id, user_id, current_balance, safety_score)
VALUES ('82df23f6-e822-4290-bdfd-9b882d63abf9', '9a7b7e28-2c26-4d04-8b43-9828236746ef', 132194.10, 96);
```

### 3.5 Record: `portfolio_assets`
```sql
INSERT INTO portfolio_assets (portfolio_id, asset_symbol, allocation_pct, balance_amount, average_entry_price)
VALUES 
('82df23f6-e822-4290-bdfd-9b882d63abf9', 'ETH', 45.00, 17.06900000, 3482.40),
('82df23f6-e822-4290-bdfd-9b882d63abf9', 'USDC', 30.00, 39658.23000000, 1.00);
```

### 3.6 Record: `opportunities`
```sql
INSERT INTO opportunities (id, opportunity_type, name, symbol, icon_symbol, confidence_score, expected_return, risk_level, reasoning_text)
VALUES ('7bd49012-3210-410c-99a2-9b223cde882b', 'yield', 'Ethereum Staking Alpha', 'ETH / USD', 'Ξ', 94, '8.0% - 12.0%', 'low', 'Validator queue consolidation patterns reveal a post-upgrade yields premium on decentralized pools. Backed by institutional accumulation support lines.');
```

### 3.7 Record: `araiven_recommendations`
```sql
INSERT INTO araiven_recommendations (user_id, opportunity_id, suggested_allocation_pct, status)
VALUES ('9a7b7e28-2c26-4d04-8b43-9828236746ef', '7bd49012-3210-410c-99a2-9b223cde882b', 8.00, 'pending');
```
