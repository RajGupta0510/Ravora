-- ═══════════════════════════════════════════════════════════
-- TRADE EXECUTION SCHEMA V1 UPGRADES (004_trade_execution.sql)
-- ═══════════════════════════════════════════════════════════

-- 1. Upgrade orders table with execution metadata, client order tracking, and risk columns
ALTER TABLE public.orders
    ADD COLUMN IF NOT EXISTS client_order_id UUID,
    ADD COLUMN IF NOT EXISTS stop_price NUMERIC,
    ADD COLUMN IF NOT EXISTS leverage NUMERIC DEFAULT 1.0,
    ADD COLUMN IF NOT EXISTS error_message TEXT,
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- 2. Drop existing restrictive CHECK constraints on order type and status if they exist
-- Default auto-generated names in PG: orders_type_check, orders_status_check
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_type_check;
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_status_check;

-- 3. Apply expanded CHECK constraints to support stop limit, trailing stop, and detailed states
ALTER TABLE public.orders ADD CONSTRAINT orders_type_check CHECK (
    type IN ('market', 'limit', 'stop_loss', 'take_profit', 'stop_limit', 'trailing_stop')
);

ALTER TABLE public.orders ADD CONSTRAINT orders_status_check CHECK (
    status IN ('pending', 'submitted', 'accepted', 'partially_filled', 'filled', 'cancelled', 'rejected', 'expired', 'failed')
);

-- 4. Create index on client_order_id for idempotency deduplication
CREATE INDEX IF NOT EXISTS idx_orders_client_order_id ON public.orders(client_order_id);

-- 5. Table: executions (tracks individual fill transactions)
CREATE TABLE IF NOT EXISTS public.executions (
    id                     UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id                UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    order_id               UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    exchange_account_id    UUID NOT NULL REFERENCES public.connected_exchanges(id) ON DELETE CASCADE,
    exchange_execution_id  TEXT,
    symbol                 TEXT NOT NULL,
    side                   TEXT NOT NULL CHECK (side IN ('buy', 'sell')),
    price                  NUMERIC NOT NULL,
    quantity               NUMERIC NOT NULL,
    fee                    NUMERIC DEFAULT 0,
    fee_asset              TEXT,
    created_at             TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_executions_order_id ON public.executions(order_id);
CREATE INDEX IF NOT EXISTS idx_executions_user_id ON public.executions(user_id);

-- 6. Table: order_events (tracks order lifecycle history audit trail)
CREATE TABLE IF NOT EXISTS public.order_events (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id        UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    event_type      TEXT NOT NULL,
    previous_status TEXT,
    new_status      TEXT NOT NULL,
    message         TEXT,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_order_events_order_id ON public.order_events(order_id);

-- 7. Table: exchange_responses (logs raw HTTP request/response payloads to exchanges)
CREATE TABLE IF NOT EXISTS public.exchange_responses (
    id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id           UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    order_id          UUID REFERENCES public.orders(id) ON DELETE SET NULL,
    exchange          TEXT NOT NULL,
    endpoint          TEXT NOT NULL,
    request_payload   JSONB NOT NULL,
    response_payload  JSONB NOT NULL,
    status_code       INTEGER,
    latency_ms        INTEGER,
    created_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_exchange_responses_order ON public.exchange_responses(order_id);
CREATE INDEX IF NOT EXISTS idx_exchange_responses_user ON public.exchange_responses(user_id);

-- 8. Row Level Security (RLS) policies for new tables
ALTER TABLE public.executions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own executions" ON public.executions FOR SELECT USING (auth.uid() = user_id);

ALTER TABLE public.order_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own order events" ON public.order_events FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.orders 
        WHERE public.orders.id = public.order_events.order_id 
        AND public.orders.user_id = auth.uid()
    )
);

ALTER TABLE public.exchange_responses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own exchange responses" ON public.exchange_responses FOR SELECT USING (auth.uid() = user_id);
