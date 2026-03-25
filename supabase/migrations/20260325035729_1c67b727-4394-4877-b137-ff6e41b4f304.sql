
-- Bot users table (all users who interact with the bot, not just partners)
CREATE TABLE public.bot_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  telegram_id bigint UNIQUE NOT NULL,
  first_name text,
  username text,
  source text DEFAULT 'organic',
  niche text,
  services text,
  goal text,
  created_at timestamptz NOT NULL DEFAULT now(),
  last_active_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.bot_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow service role full access bot_users" ON public.bot_users FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated read bot_users" ON public.bot_users FOR SELECT TO authenticated USING (true);

-- User actions table for CRM analytics
CREATE TABLE public.user_actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  telegram_id bigint NOT NULL,
  action text NOT NULL,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.user_actions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow service role full access user_actions" ON public.user_actions FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated read user_actions" ON public.user_actions FOR SELECT TO authenticated USING (true);

CREATE INDEX idx_user_actions_telegram_id ON public.user_actions(telegram_id);
CREATE INDEX idx_user_actions_action ON public.user_actions(action);

-- Event offers counter table for tiered pricing
CREATE TABLE public.event_offers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_code text UNIQUE NOT NULL,
  tier1_limit int NOT NULL DEFAULT 3,
  tier1_price int NOT NULL DEFAULT 3000,
  tier2_limit int NOT NULL DEFAULT 5,
  tier2_price int NOT NULL DEFAULT 5000,
  tier3_limit int NOT NULL DEFAULT 10,
  tier3_price int NOT NULL DEFAULT 10000,
  sold_count int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.event_offers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow service role full access event_offers" ON public.event_offers FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated all event_offers" ON public.event_offers FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Seed default event offer
INSERT INTO public.event_offers (event_code, tier1_limit, tier1_price, tier2_limit, tier2_price, tier3_limit, tier3_price)
VALUES ('event', 3, 3000, 5, 5000, 10, 10000);

-- AI conversations table
CREATE TABLE public.ai_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  telegram_id bigint NOT NULL,
  role text NOT NULL CHECK (role IN ('user', 'assistant')),
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.ai_conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow service role full access ai_conversations" ON public.ai_conversations FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated read ai_conversations" ON public.ai_conversations FOR SELECT TO authenticated USING (true);

CREATE INDEX idx_ai_conversations_telegram_id ON public.ai_conversations(telegram_id);
