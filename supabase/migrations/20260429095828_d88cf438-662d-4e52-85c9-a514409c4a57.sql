-- Project members table
CREATE TABLE IF NOT EXISTS public.project_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  telegram_id BIGINT NOT NULL,
  role TEXT NOT NULL DEFAULT 'client' CHECK (role IN ('owner', 'client', 'viewer')),
  name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (project_id, telegram_id)
);

CREATE INDEX IF NOT EXISTS idx_project_members_project ON public.project_members(project_id);
CREATE INDEX IF NOT EXISTS idx_project_members_telegram ON public.project_members(telegram_id);

ALTER TABLE public.project_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access project_members"
  ON public.project_members FOR ALL TO service_role
  USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated full access project_members"
  ON public.project_members FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

CREATE POLICY "Anyone read project_members"
  ON public.project_members FOR SELECT TO anon
  USING (true);

-- Backfill: existing telegram_id on projects becomes an owner
INSERT INTO public.project_members (project_id, telegram_id, role, name)
SELECT p.id, p.telegram_id, 'owner', p.client_name
FROM public.projects p
WHERE p.telegram_id IS NOT NULL
ON CONFLICT (project_id, telegram_id) DO NOTHING;