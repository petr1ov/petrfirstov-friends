
CREATE TABLE public.admin_login_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  token text NOT NULL UNIQUE,
  telegram_id bigint NOT NULL,
  used boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.admin_login_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow service role full access admin_login_tokens"
ON public.admin_login_tokens FOR ALL TO service_role
USING (true) WITH CHECK (true);
