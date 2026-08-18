-- 005_backtesting_strategy.sql
-- Migration file for Ravora Backtesting & Strategy Engine V1

-- 1. Strategy Definitions
CREATE TABLE IF NOT EXISTS strategy_definitions (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id             UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name                TEXT NOT NULL,
  description         TEXT,
  indicators_config   JSONB NOT NULL DEFAULT '{}'::jsonb,
  rules_config        JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- Triggers for updated_at on strategy_definitions
DROP TRIGGER IF EXISTS strategy_definitions_updated_at ON strategy_definitions;
CREATE TRIGGER strategy_definitions_updated_at
  BEFORE UPDATE ON strategy_definitions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 2. Backtest Results
CREATE TABLE IF NOT EXISTS backtest_results (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id             UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  strategy_id         UUID REFERENCES strategy_definitions(id) ON DELETE SET NULL,
  symbol              TEXT NOT NULL,
  timeframe           TEXT NOT NULL,
  start_date          TIMESTAMPTZ NOT NULL,
  end_date            TIMESTAMPTZ NOT NULL,
  initial_capital     REAL NOT NULL,
  final_capital       REAL NOT NULL,
  metrics             JSONB NOT NULL DEFAULT '{}'::jsonb,
  trades              JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Historical Signals
CREATE TABLE IF NOT EXISTS historical_signals (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  symbol              TEXT NOT NULL,
  timeframe           TEXT NOT NULL,
  signal_type         TEXT NOT NULL, -- 'buy' | 'sell' | 'hold'
  price               REAL NOT NULL,
  indicators_snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Pattern Statistics
CREATE TABLE IF NOT EXISTS pattern_statistics (
  id                          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pattern_name                TEXT NOT NULL, -- e.g. 'double_top', 'fair_value_gap'
  symbol                      TEXT NOT NULL,
  timeframe                   TEXT NOT NULL,
  detected_at                 TIMESTAMPTZ NOT NULL,
  subsequent_price_change_pct REAL,
  success                     BOOLEAN,
  created_at                  TIMESTAMPTZ DEFAULT NOW()
);

-- RLS policies
ALTER TABLE strategy_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE backtest_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE historical_signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE pattern_statistics ENABLE ROW LEVEL SECURITY;

-- strategy_definitions policies
CREATE POLICY "Users can view own strategy definitions" ON strategy_definitions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own strategy definitions" ON strategy_definitions FOR ALL USING (auth.uid() = user_id);

-- backtest_results policies
CREATE POLICY "Users can view own backtest results" ON backtest_results FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own backtest results" ON backtest_results FOR ALL USING (auth.uid() = user_id);

-- historical_signals policies (readable by users)
CREATE POLICY "Users can view historical signals" ON historical_signals FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin can manage historical signals" ON historical_signals FOR ALL USING (true);

-- pattern_statistics policies (readable by users)
CREATE POLICY "Users can view pattern statistics" ON pattern_statistics FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin can manage pattern statistics" ON pattern_statistics FOR ALL USING (true);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_strategy_definitions_user_id ON strategy_definitions(user_id);
CREATE INDEX IF NOT EXISTS idx_backtest_results_user_id ON backtest_results(user_id);
CREATE INDEX IF NOT EXISTS idx_historical_signals_symbol_timeframe ON historical_signals(symbol, timeframe);
CREATE INDEX IF NOT EXISTS idx_pattern_statistics_pattern_name ON pattern_statistics(pattern_name);
