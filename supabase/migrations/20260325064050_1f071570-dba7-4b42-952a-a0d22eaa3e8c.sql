
-- Broadcasts table
CREATE TABLE public.broadcasts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text NOT NULL DEFAULT 'mass' CHECK (type IN ('mass', 'segmented', 'ai_personalized')),
  message_template text,
  ai_goal text,
  ai_tone text DEFAULT 'friendly' CHECK (ai_tone IN ('friendly', 'selling', 'soft')),
  buttons jsonb DEFAULT '[]'::jsonb,
  segment_filters jsonb DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sending', 'completed', 'failed')),
  total_recipients integer DEFAULT 0,
  sent_count integer DEFAULT 0,
  error_count integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz
);

ALTER TABLE public.broadcasts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated all broadcasts" ON public.broadcasts FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow service role full access broadcasts" ON public.broadcasts FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Broadcast recipients table
CREATE TABLE public.broadcast_recipients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  broadcast_id uuid REFERENCES public.broadcasts(id) ON DELETE CASCADE NOT NULL,
  telegram_id bigint NOT NULL,
  personalized_message text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'error')),
  error_message text,
  sent_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.broadcast_recipients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated all broadcast_recipients" ON public.broadcast_recipients FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow service role full access broadcast_recipients" ON public.broadcast_recipients FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE INDEX idx_broadcast_recipients_broadcast_id ON public.broadcast_recipients(broadcast_id);
CREATE INDEX idx_broadcast_recipients_status ON public.broadcast_recipients(status);
