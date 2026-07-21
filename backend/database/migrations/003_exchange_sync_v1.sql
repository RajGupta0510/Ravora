-- ═══════════════════════════════════════════════════════════
-- EXCHANGE SYNC SCHEMA V1 UPGRADES (003_exchange_sync_v1.sql)
-- ═══════════════════════════════════════════════════════════

-- 1. Upgrade connected_exchanges table with passphrase, permissions, and sync tracking columns
ALTER TABLE public.connected_exchanges
    ADD COLUMN IF NOT EXISTS api_passphrase_encrypted TEXT,
    ADD COLUMN IF NOT EXISTS permissions JSONB DEFAULT '{"read": true, "trade": true, "withdraw": false}'::jsonb,
    ADD COLUMN IF NOT EXISTS last_sync_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS error_count INTEGER DEFAULT 0,
    ADD COLUMN IF NOT EXISTS last_error_message TEXT;

-- 2. Associate real trading positions with connected exchange accounts
ALTER TABLE public.positions
    ADD COLUMN IF NOT EXISTS exchange_account_id UUID REFERENCES public.connected_exchanges(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_positions_exchange_account ON public.positions(exchange_account_id);

-- 3. Associate orders with connected exchange accounts
ALTER TABLE public.orders
    ADD COLUMN IF NOT EXISTS exchange_account_id UUID REFERENCES public.connected_exchanges(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_orders_exchange_account ON public.orders(exchange_account_id);

-- 4. Associate completed trade history with connected exchange accounts
ALTER TABLE public.trade_history
    ADD COLUMN IF NOT EXISTS exchange_account_id UUID REFERENCES public.connected_exchanges(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_trade_history_exchange_account ON public.trade_history(exchange_account_id);
