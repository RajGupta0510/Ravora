-- 008: security hardening.
-- Ravora's frontend never talks to the database directly: every write goes through the API, which uses the service
-- role (and bypasses RLS). So signed-in users do not need write access to money and trading state through PostgREST,
-- and anyone holding the public anon key plus their own JWT should not have it.

-- 1. historical_signals / pattern_statistics had `FOR ALL USING (true)` with no role, i.e. anyone could write.
--    With no policy, only the service role can write; the SELECT policies for `authenticated` stay.
DROP POLICY IF EXISTS "Admin can manage historical signals" ON historical_signals;
DROP POLICY IF EXISTS "Admin can manage pattern statistics" ON pattern_statistics;

-- 2. Balances, positions and orders are read-only for clients (a user could otherwise PATCH their own balance).
DROP POLICY IF EXISTS "Users can update own portfolio" ON portfolios;
DROP POLICY IF EXISTS "Users can insert own portfolio" ON portfolios;

DROP POLICY IF EXISTS "Users can manage own portfolio assets" ON portfolio_assets;

DROP POLICY IF EXISTS "Users can manage own positions" ON positions;
DROP POLICY IF EXISTS "Users can manage own orders" ON orders;
DROP POLICY IF EXISTS "Users can manage own paper account" ON paper_accounts;

DROP POLICY IF EXISTS "Users can manage own paper positions" ON paper_positions;
DROP POLICY IF EXISTS "Users can manage own paper orders" ON paper_orders;
-- The existing "Users can view own ..." SELECT policies on these tables remain.
-- Exchange rows are created by the API after the credentials are validated.
DROP POLICY IF EXISTS "Users can manage own exchanges" ON connected_exchanges;

-- 3. Encrypted exchange credentials must never be readable through PostgREST, even by their owner.
REVOKE ALL ON connected_exchanges FROM anon, authenticated;
DO $$
DECLARE cols text;
BEGIN
  SELECT string_agg(quote_ident(column_name), ', ') INTO cols
  FROM information_schema.columns
  WHERE table_schema = 'public' AND table_name = 'connected_exchanges'
    AND column_name NOT IN ('api_key_encrypted', 'api_secret_encrypted', 'api_passphrase_encrypted');
  EXECUTE format('GRANT SELECT (%s) ON public.connected_exchanges TO authenticated', cols);
END $$;
