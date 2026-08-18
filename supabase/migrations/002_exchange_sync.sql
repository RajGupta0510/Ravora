-- ═══════════════════════════════════════════════════════════
-- EXCHANGE SYNC SCHEMA UPGRADES (002_exchange_sync.sql)
-- ═══════════════════════════════════════════════════════════

-- 1. Create exchange_sync_logs table
CREATE TABLE IF NOT EXISTS public.exchange_sync_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    exchange_account_id UUID NOT NULL REFERENCES public.connected_exchanges(id) ON DELETE CASCADE,
    sync_status TEXT NOT NULL, -- 'success', 'failed', 'in_progress'
    payload JSONB, -- logs count of imported assets, totals
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.exchange_sync_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own exchange sync logs"
    ON public.exchange_sync_logs
    FOR ALL
    USING (auth.uid() = user_id);

-- 2. Add exchange_account_id foreign key column to portfolio_assets table to associate balances with connected exchange
ALTER TABLE public.portfolio_assets 
    ADD COLUMN IF NOT EXISTS exchange_account_id UUID REFERENCES public.connected_exchanges(id) ON DELETE CASCADE;
