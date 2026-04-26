-- Projects table
CREATE TABLE public.projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  telegram_id BIGINT NOT NULL,
  client_name TEXT,
  github_repo TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  progress INTEGER NOT NULL DEFAULT 0,
  last_commit_at TIMESTAMP WITH TIME ZONE,
  last_commit_message TEXT,
  commits_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_projects_telegram_id ON public.projects(telegram_id);

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated full access projects"
  ON public.projects FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access projects"
  ON public.projects FOR ALL TO service_role
  USING (true) WITH CHECK (true);

CREATE POLICY "Anyone read projects"
  ON public.projects FOR SELECT TO anon
  USING (true);

-- Tasks table
CREATE TABLE public.tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  steps TEXT[] NOT NULL DEFAULT '{}',
  ai_instruction TEXT,
  source_message TEXT,
  status TEXT NOT NULL DEFAULT 'new',
  priority TEXT NOT NULL DEFAULT 'normal',
  type TEXT NOT NULL DEFAULT 'edit',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_tasks_project_id ON public.tasks(project_id);
CREATE INDEX idx_tasks_status ON public.tasks(status);

ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated full access tasks"
  ON public.tasks FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access tasks"
  ON public.tasks FOR ALL TO service_role
  USING (true) WITH CHECK (true);

CREATE POLICY "Anyone read tasks"
  ON public.tasks FOR SELECT TO anon
  USING (true);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-recalculate project progress when tasks change
CREATE OR REPLACE FUNCTION public.recalc_project_progress()
RETURNS TRIGGER AS $$
DECLARE
  pid UUID;
  total INTEGER;
  done INTEGER;
  new_progress INTEGER;
BEGIN
  pid := COALESCE(NEW.project_id, OLD.project_id);
  SELECT COUNT(*), COUNT(*) FILTER (WHERE status = 'done')
    INTO total, done FROM public.tasks WHERE project_id = pid;
  IF total = 0 THEN
    new_progress := 0;
  ELSE
    new_progress := ROUND((done::NUMERIC / total::NUMERIC) * 100);
  END IF;
  UPDATE public.projects SET progress = new_progress, updated_at = now() WHERE id = pid;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER tasks_progress_after_change
  AFTER INSERT OR UPDATE OR DELETE ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION public.recalc_project_progress();

-- Set completed_at when status changes to done
CREATE OR REPLACE FUNCTION public.set_task_completed_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'done' AND (OLD.status IS DISTINCT FROM 'done') THEN
    NEW.completed_at = now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER tasks_set_completed_at
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION public.set_task_completed_at();