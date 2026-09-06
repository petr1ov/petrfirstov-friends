ALTER TABLE public.bot_users
  ADD COLUMN IF NOT EXISTS funnel_temp TEXT,
  ADD COLUMN IF NOT EXISTS entry_block TEXT;

CREATE INDEX IF NOT EXISTS idx_bot_users_funnel_temp ON public.bot_users (funnel_temp);