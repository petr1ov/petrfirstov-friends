-- Add scope management to projects
ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS scope_features TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS mvp_completed_at TIMESTAMPTZ;

-- Add scope/extra type and planned date to tasks
-- tasks.type already exists with default 'edit' — repurpose it: allow 'scope' | 'extra' | legacy values
ALTER TABLE public.tasks
  ADD COLUMN IF NOT EXISTS planned_for_date DATE;

-- Backfill: existing tasks default to 'scope' so progress remains meaningful
UPDATE public.tasks SET type = 'scope' WHERE type IS NULL OR type IN ('edit', 'idea');

-- Change default for new tasks to 'scope'
ALTER TABLE public.tasks ALTER COLUMN type SET DEFAULT 'scope';

-- Replace progress recalculation: count only scope tasks
CREATE OR REPLACE FUNCTION public.recalc_project_progress()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
DECLARE
  pid UUID;
  total INTEGER;
  done INTEGER;
  new_progress INTEGER;
  was_completed TIMESTAMPTZ;
BEGIN
  pid := COALESCE(NEW.project_id, OLD.project_id);

  SELECT COUNT(*), COUNT(*) FILTER (WHERE status = 'done')
    INTO total, done
  FROM public.tasks
  WHERE project_id = pid AND type = 'scope';

  IF total = 0 THEN
    new_progress := 0;
  ELSE
    new_progress := ROUND((done::NUMERIC / total::NUMERIC) * 100);
  END IF;

  SELECT mvp_completed_at INTO was_completed FROM public.projects WHERE id = pid;

  UPDATE public.projects
    SET progress = new_progress,
        updated_at = now(),
        mvp_completed_at = CASE
          WHEN total > 0 AND done = total AND was_completed IS NULL THEN now()
          WHEN total > 0 AND done < total THEN NULL
          ELSE was_completed
        END
  WHERE id = pid;

  RETURN NULL;
END;
$$;

-- Ensure trigger exists
DROP TRIGGER IF EXISTS trg_recalc_project_progress ON public.tasks;
CREATE TRIGGER trg_recalc_project_progress
AFTER INSERT OR UPDATE OR DELETE ON public.tasks
FOR EACH ROW EXECUTE FUNCTION public.recalc_project_progress();

CREATE INDEX IF NOT EXISTS idx_tasks_project_type ON public.tasks(project_id, type);
CREATE INDEX IF NOT EXISTS idx_tasks_planned_for_date ON public.tasks(planned_for_date);