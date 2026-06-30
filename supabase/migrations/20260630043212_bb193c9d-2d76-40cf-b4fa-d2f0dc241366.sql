ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS lovable_project_id TEXT;
CREATE INDEX IF NOT EXISTS idx_projects_lovable_project_id ON public.projects(lovable_project_id);