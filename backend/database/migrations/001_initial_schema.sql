-- ═══════════════════════════════════════════════════════════════════════
-- Ravora Backend V1 — Initial PostgreSQL Schema
-- Target: Supabase PostgreSQL
-- Run via: Supabase Dashboard > SQL Editor
-- ═══════════════════════════════════════════════════════════════════════

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop tables to ensure clean slate and apply correct constraints
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS ai_memory CASCADE;
DROP TABLE IF EXISTS market_cache CASCADE;
DROP TABLE IF EXISTS paper_orders CASCADE;
DROP TABLE IF EXISTS paper_positions CASCADE;
DROP TABLE IF EXISTS paper_accounts CASCADE;
DROP TABLE IF EXISTS price_alerts CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS watchlist CASCADE;
DROP TABLE IF EXISTS trade_history CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS positions CASCADE;
DROP TABLE IF EXISTS portfolio_assets CASCADE;
DROP TABLE IF EXISTS portfolios CASCADE;
DROP TABLE IF EXISTS user_settings CASCADE;
DROP TABLE IF EXISTS connected_exchanges CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- ═══════════════════════════════════════════════════════════
-- HELPER: updated_at trigger function
-- ═══════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- ═══════════════════════════════════════════════════════════
-- 1. PROFILES
-- ═══════════════════════════════════════════════════════════

CREATE TABLE profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name     TEXT,
  email         TEXT,
  phone         TEXT,
  avatar_url    TEXT,
  experience_level TEXT DEFAULT 'beginner' CHECK (experience_level IN ('beginner', 'active', 'professional', 'intermediate', 'advanced')),
  primary_goal  TEXT,
  risk_stance   TEXT DEFAULT 'balanced' CHECK (risk_stance IN ('conservative', 'balanced', 'aggressive')),
  max_drawdown_cap NUMERIC DEFAULT 10.0,
  capital       NUMERIC DEFAULT 0,
  provider      TEXT,
  onboarding_completed BOOLEAN DEFAULT FALSE,
  last_login    TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

DROP TRIGGER IF EXISTS profiles_updated_at ON profiles;
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);


-- ═══════════════════════════════════════════════════════════
-- 2. USER SETTINGS
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS user_settings (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  auto_hedge_enabled  BOOLEAN DEFAULT TRUE,
  notifications_enabled BOOLEAN DEFAULT TRUE,
  execution_mode  TEXT DEFAULT 'advisory' CHECK (execution_mode IN ('advisory', 'semi_auto', 'auto')),
  theme           TEXT DEFAULT 'dark' CHECK (theme IN ('dark', 'light')),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

DROP TRIGGER IF EXISTS user_settings_updated_at ON user_settings;
CREATE TRIGGER user_settings_updated_at
  BEFORE UPDATE ON user_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- ═══════════════════════════════════════════════════════════
-- 3. PORTFOLIOS
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS portfolios (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  current_balance NUMERIC DEFAULT 0.00,
  currency        TEXT DEFAULT 'USD',
  safety_score    INTEGER DEFAULT 100 CHECK (safety_score >= 0 AND safety_score <= 100),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

DROP TRIGGER IF EXISTS portfolios_updated_at ON portfolios;
CREATE TRIGGER portfolios_updated_at
  BEFORE UPDATE ON portfolios
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_portfolios_user_id ON portfolios(user_id);


-- ═══════════════════════════════════════════════════════════
-- 4. PORTFOLIO ASSETS
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS portfolio_assets (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  portfolio_id    UUID NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,
  asset_symbol    TEXT NOT NULL,
  allocation_pct  NUMERIC NOT NULL DEFAULT 0,
  balance_amount  NUMERIC NOT NULL DEFAULT 0,
  average_entry_price NUMERIC NOT NULL DEFAULT 0,
  position_type   TEXT DEFAULT 'long' CHECK (position_type IN ('long', 'short')),
  leverage        NUMERIC DEFAULT 1.0,
  UNIQUE (portfolio_id, asset_symbol)
);

CREATE INDEX IF NOT EXISTS idx_portfolio_assets_portfolio ON portfolio_assets(portfolio_id);


-- ═══════════════════════════════════════════════════════════
-- 5. POSITIONS (Real Trading)
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS positions (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  exchange        TEXT NOT NULL,
  symbol          TEXT NOT NULL,
  side            TEXT NOT NULL CHECK (side IN ('long', 'short')),
  entry_price     NUMERIC NOT NULL,
  current_price   NUMERIC DEFAULT 0,
  quantity        NUMERIC NOT NULL,
  leverage        NUMERIC DEFAULT 1.0,
  margin_used     NUMERIC DEFAULT 0,
  unrealized_pnl  NUMERIC DEFAULT 0,
  stop_loss       NUMERIC,
  take_profit     NUMERIC,
  status          TEXT DEFAULT 'open' CHECK (status IN ('open', 'closed', 'liquidated')),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  closed_at       TIMESTAMPTZ,
  deleted_at      TIMESTAMPTZ   -- soft delete
);

CREATE INDEX IF NOT EXISTS idx_positions_user_id ON positions(user_id);
CREATE INDEX IF NOT EXISTS idx_positions_status ON positions(status);
CREATE INDEX IF NOT EXISTS idx_positions_user_status ON positions(user_id, status);


-- ═══════════════════════════════════════════════════════════
-- 6. ORDERS
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS orders (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  exchange        TEXT NOT NULL,
  symbol          TEXT NOT NULL,
  type            TEXT NOT NULL CHECK (type IN ('market', 'limit', 'stop_loss', 'take_profit')),
  side            TEXT NOT NULL CHECK (side IN ('buy', 'sell')),
  quantity        NUMERIC NOT NULL,
  price           NUMERIC,
  filled_price    NUMERIC,
  fee             NUMERIC DEFAULT 0,
  status          TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'filled', 'partially_filled', 'cancelled', 'rejected')),
  exchange_order_id TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  filled_at       TIMESTAMPTZ,
  deleted_at      TIMESTAMPTZ   -- soft delete
);

CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);


-- ═══════════════════════════════════════════════════════════
-- 7. TRADE HISTORY
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS trade_history (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  exchange        TEXT,
  symbol          TEXT NOT NULL,
  side            TEXT NOT NULL,
  entry_price     NUMERIC NOT NULL,
  exit_price      NUMERIC NOT NULL,
  quantity        NUMERIC NOT NULL,
  leverage        NUMERIC DEFAULT 1.0,
  pnl             NUMERIC NOT NULL,
  fee             NUMERIC DEFAULT 0,
  opened_at       TIMESTAMPTZ NOT NULL,
  closed_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_trade_history_user_id ON trade_history(user_id);
CREATE INDEX IF NOT EXISTS idx_trade_history_closed_at ON trade_history(closed_at);


-- ═══════════════════════════════════════════════════════════
-- 8. WATCHLIST
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS watchlist (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  symbol          TEXT NOT NULL,
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, symbol)
);

CREATE INDEX IF NOT EXISTS idx_watchlist_user_id ON watchlist(user_id);


-- ═══════════════════════════════════════════════════════════
-- 9. NOTIFICATIONS
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS notifications (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  channel         TEXT NOT NULL CHECK (channel IN ('system', 'trade', 'ai', 'alert', 'security')),
  priority        TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  title           TEXT NOT NULL,
  body            TEXT NOT NULL,
  is_read         BOOLEAN DEFAULT FALSE,
  payload         JSONB,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id, is_read) WHERE is_read = FALSE;


-- ═══════════════════════════════════════════════════════════
-- 10. PRICE ALERTS
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS price_alerts (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  symbol          TEXT NOT NULL,
  condition       TEXT NOT NULL CHECK (condition IN ('above', 'below', 'crosses')),
  target_price    NUMERIC NOT NULL,
  is_triggered    BOOLEAN DEFAULT FALSE,
  is_active       BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  triggered_at    TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_price_alerts_active ON price_alerts(user_id, is_active) WHERE is_active = TRUE;


-- ═══════════════════════════════════════════════════════════
-- 11. PAPER ACCOUNTS
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS paper_accounts (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  balance         NUMERIC DEFAULT 100000.00,
  initial_balance NUMERIC DEFAULT 100000.00,
  currency        TEXT DEFAULT 'USD',
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

DROP TRIGGER IF EXISTS paper_accounts_updated_at ON paper_accounts;
CREATE TRIGGER paper_accounts_updated_at
  BEFORE UPDATE ON paper_accounts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- ═══════════════════════════════════════════════════════════
-- 12. PAPER POSITIONS
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS paper_positions (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  paper_account_id UUID NOT NULL REFERENCES paper_accounts(id) ON DELETE CASCADE,
  symbol          TEXT NOT NULL,
  side            TEXT NOT NULL CHECK (side IN ('long', 'short')),
  entry_price     NUMERIC NOT NULL,
  quantity        NUMERIC NOT NULL,
  leverage        NUMERIC DEFAULT 1.0,
  stop_loss       NUMERIC,
  take_profit     NUMERIC,
  status          TEXT DEFAULT 'open' CHECK (status IN ('open', 'closed')),
  exit_price      NUMERIC,
  pnl             NUMERIC,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  closed_at       TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_paper_positions_account ON paper_positions(paper_account_id);
CREATE INDEX IF NOT EXISTS idx_paper_positions_status ON paper_positions(paper_account_id, status);


-- ═══════════════════════════════════════════════════════════
-- 13. PAPER ORDERS
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS paper_orders (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  paper_account_id UUID NOT NULL REFERENCES paper_accounts(id) ON DELETE CASCADE,
  symbol          TEXT NOT NULL,
  type            TEXT NOT NULL CHECK (type IN ('market', 'limit', 'stop_loss', 'take_profit')),
  side            TEXT NOT NULL CHECK (side IN ('buy', 'sell')),
  quantity        NUMERIC NOT NULL,
  price           NUMERIC,
  filled_price    NUMERIC,
  status          TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'filled', 'cancelled')),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  filled_at       TIMESTAMPTZ
);


-- ═══════════════════════════════════════════════════════════
-- 14. MARKET CACHE
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS market_cache (
  symbol          TEXT PRIMARY KEY,
  name            TEXT NOT NULL,
  price           NUMERIC NOT NULL,
  change_24h      NUMERIC DEFAULT 0,
  volume_24h      NUMERIC DEFAULT 0,
  market_cap      NUMERIC DEFAULT 0,
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);


-- ═══════════════════════════════════════════════════════════
-- 15. AI MEMORY
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS ai_memory (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  conversation_id TEXT,
  role            TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content         TEXT NOT NULL,
  metadata        JSONB,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_memory_user ON ai_memory(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_memory_conversation ON ai_memory(user_id, conversation_id);


-- ═══════════════════════════════════════════════════════════
-- 16. AUDIT LOGS
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS audit_logs (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action          TEXT NOT NULL,
  resource        TEXT NOT NULL,
  resource_id     TEXT,
  metadata        JSONB,
  ip_address      TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at);


-- ═══════════════════════════════════════════════════════════
-- CONNECTED EXCHANGES (for storing encrypted API keys)
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS connected_exchanges (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  exchange_name   TEXT NOT NULL,
  api_key_encrypted   TEXT,
  api_secret_encrypted TEXT,
  status          TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'revoked')),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, exchange_name)
);

DROP TRIGGER IF EXISTS connected_exchanges_updated_at ON connected_exchanges;
CREATE TRIGGER connected_exchanges_updated_at
  BEFORE UPDATE ON connected_exchanges
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- ═══════════════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ═══════════════════════════════════════════════════════════════════════

-- Cleanup existing policies
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view own settings" ON user_settings;
DROP POLICY IF EXISTS "Users can update own settings" ON user_settings;
DROP POLICY IF EXISTS "Users can insert own settings" ON user_settings;
DROP POLICY IF EXISTS "Users can view own portfolio" ON portfolios;
DROP POLICY IF EXISTS "Users can update own portfolio" ON portfolios;
DROP POLICY IF EXISTS "Users can insert own portfolio" ON portfolios;
DROP POLICY IF EXISTS "Users can view own portfolio assets" ON portfolio_assets;
DROP POLICY IF EXISTS "Users can manage own portfolio assets" ON portfolio_assets;
DROP POLICY IF EXISTS "Users can view own positions" ON positions;
DROP POLICY IF EXISTS "Users can manage own positions" ON positions;
DROP POLICY IF EXISTS "Users can view own orders" ON orders;
DROP POLICY IF EXISTS "Users can manage own orders" ON orders;
DROP POLICY IF EXISTS "Users can view own trade history" ON trade_history;
DROP POLICY IF EXISTS "Users can view own watchlist" ON watchlist;
DROP POLICY IF EXISTS "Users can manage own watchlist" ON watchlist;
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can view own alerts" ON price_alerts;
DROP POLICY IF EXISTS "Users can manage own alerts" ON price_alerts;
DROP POLICY IF EXISTS "Users can view own paper account" ON paper_accounts;
DROP POLICY IF EXISTS "Users can manage own paper account" ON paper_accounts;
DROP POLICY IF EXISTS "Users can view own paper positions" ON paper_positions;
DROP POLICY IF EXISTS "Users can manage own paper positions" ON paper_positions;
DROP POLICY IF EXISTS "Users can view own paper orders" ON paper_orders;
DROP POLICY IF EXISTS "Users can manage own paper orders" ON paper_orders;
DROP POLICY IF EXISTS "Users can view own AI memory" ON ai_memory;
DROP POLICY IF EXISTS "Users can manage own AI memory" ON ai_memory;
DROP POLICY IF EXISTS "Users can view own exchanges" ON connected_exchanges;
DROP POLICY IF EXISTS "Users can manage own exchanges" ON connected_exchanges;
DROP POLICY IF EXISTS "Anyone can read market cache" ON market_cache;
DROP POLICY IF EXISTS "Users can view own audit logs" ON audit_logs;

-- Profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- User Settings
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own settings" ON user_settings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own settings" ON user_settings FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own settings" ON user_settings FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Portfolios
ALTER TABLE portfolios ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own portfolio" ON portfolios FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own portfolio" ON portfolios FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own portfolio" ON portfolios FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Portfolio Assets
ALTER TABLE portfolio_assets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own portfolio assets" ON portfolio_assets FOR SELECT
  USING (portfolio_id IN (SELECT id FROM portfolios WHERE user_id = auth.uid()));
CREATE POLICY "Users can manage own portfolio assets" ON portfolio_assets FOR ALL
  USING (portfolio_id IN (SELECT id FROM portfolios WHERE user_id = auth.uid()));

-- Positions
ALTER TABLE positions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own positions" ON positions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own positions" ON positions FOR ALL USING (auth.uid() = user_id);

-- Orders
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own orders" ON orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own orders" ON orders FOR ALL USING (auth.uid() = user_id);

-- Trade History
ALTER TABLE trade_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own trade history" ON trade_history FOR SELECT USING (auth.uid() = user_id);

-- Watchlist
ALTER TABLE watchlist ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own watchlist" ON watchlist FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own watchlist" ON watchlist FOR ALL USING (auth.uid() = user_id);

-- Notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE USING (auth.uid() = user_id);

-- Price Alerts
ALTER TABLE price_alerts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own alerts" ON price_alerts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own alerts" ON price_alerts FOR ALL USING (auth.uid() = user_id);

-- Paper Accounts
ALTER TABLE paper_accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own paper account" ON paper_accounts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own paper account" ON paper_accounts FOR ALL USING (auth.uid() = user_id);

-- Paper Positions (joined through paper_accounts)
ALTER TABLE paper_positions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own paper positions" ON paper_positions FOR SELECT
  USING (paper_account_id IN (SELECT id FROM paper_accounts WHERE user_id = auth.uid()));
CREATE POLICY "Users can manage own paper positions" ON paper_positions FOR ALL
  USING (paper_account_id IN (SELECT id FROM paper_accounts WHERE user_id = auth.uid()));

-- Paper Orders
ALTER TABLE paper_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own paper orders" ON paper_orders FOR SELECT
  USING (paper_account_id IN (SELECT id FROM paper_accounts WHERE user_id = auth.uid()));
CREATE POLICY "Users can manage own paper orders" ON paper_orders FOR ALL
  USING (paper_account_id IN (SELECT id FROM paper_accounts WHERE user_id = auth.uid()));

-- AI Memory
ALTER TABLE ai_memory ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own AI memory" ON ai_memory FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own AI memory" ON ai_memory FOR ALL USING (auth.uid() = user_id);

-- Connected Exchanges
ALTER TABLE connected_exchanges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own exchanges" ON connected_exchanges FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own exchanges" ON connected_exchanges FOR ALL USING (auth.uid() = user_id);

-- Market Cache (public read, service role write)
ALTER TABLE market_cache ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read market cache" ON market_cache FOR SELECT USING (TRUE);

-- Audit Logs (read own, service role writes)
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own audit logs" ON audit_logs FOR SELECT USING (auth.uid() = user_id);


-- ═══════════════════════════════════════════════════════════
-- OPPORTUNITIES & ARAIVEN RECOMMENDATIONS
-- ═══════════════════════════════════════════════════════════

DROP TABLE IF EXISTS araiven_recommendations CASCADE;
DROP TABLE IF EXISTS opportunities CASCADE;

CREATE TABLE IF NOT EXISTS opportunities (
  id              TEXT PRIMARY KEY,
  name            TEXT NOT NULL,
  symbol          TEXT NOT NULL,
  icon_symbol     TEXT,
  opportunity_type TEXT,
  opportunity_score NUMERIC DEFAULT 0,
  confidence_score NUMERIC DEFAULT 0,
  risk_score      NUMERIC DEFAULT 0,
  risk_level      TEXT,
  expected_return NUMERIC DEFAULT 0,
  reasoning_text  TEXT,
  suggested_entry NUMERIC DEFAULT 0,
  suggested_stop_loss NUMERIC DEFAULT 0,
  suggested_take_profit NUMERIC DEFAULT 0,
  suggested_take_profit_1 NUMERIC DEFAULT 0,
  suggested_take_profit_2 NUMERIC DEFAULT 0,
  suggested_take_profit_3 NUMERIC DEFAULT 0,
  expected_duration TEXT,
  risk_reward_ratio NUMERIC DEFAULT 0,
  trend_direction TEXT,
  trend_strength  NUMERIC DEFAULT 0,
  support_levels  TEXT,
  resistance_levels TEXT,
  trade_probability NUMERIC DEFAULT 0,
  strategy_used   TEXT,
  trade_quality   TEXT,
  nearest_support NUMERIC DEFAULT 0,
  nearest_resistance NUMERIC DEFAULT 0,
  distance_to_support NUMERIC DEFAULT 0,
  distance_to_resistance NUMERIC DEFAULT 0,
  market_bias     TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS araiven_recommendations (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  opportunity_id  TEXT NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
  suggested_allocation_pct NUMERIC DEFAULT 0,
  status          TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'executed', 'dismissed')),
  reasoning_text  TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- RLS policies for opportunities (anyone can read)
ALTER TABLE opportunities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view opportunities" ON opportunities FOR SELECT USING (TRUE);

-- RLS policies for araiven_recommendations (users can view/manage own)
ALTER TABLE araiven_recommendations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own recommendations" ON araiven_recommendations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own recommendations" ON araiven_recommendations FOR ALL USING (auth.uid() = user_id);



-- ═══════════════════════════════════════════════════════════
-- DONE
-- ═══════════════════════════════════════════════════════════
-- Schema version: 1.0.0
-- Tables created: 17 (including connected_exchanges)
-- RLS policies: All user-facing tables secured
