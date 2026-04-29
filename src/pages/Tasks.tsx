import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Plus, Copy, Trash2, ChevronRight, Sparkles, PencilLine } from "lucide-react";

type Task = {
  id: string;
  project_id: string;
  title: string;
  description: string | null;
  steps: string[];
  ai_instruction: string | null;
  source_message: string | null;
  status: string;
  priority: string;
  type: string;
  created_at: string;
  completed_at: string | null;
  is_manual?: boolean;
};

type Project = {
  id: string;
  name: string;
  telegram_id: number;
  progress: number;
  mvp_completed_at: string | null;
  scope_features: string[];
};

const STATUSES = [
  { key: "new", label: "🆕 Новые", color: "bg-blue-500/15 text-blue-300" },
  { key: "in_progress", label: "⚙️ В работе", color: "bg-amber-500/15 text-amber-300" },
  { key: "review", label: "👀 На проверке", color: "bg-purple-500/15 text-purple-300" },
  { key: "done", label: "✅ Готово", color: "bg-emerald-500/15 text-emerald-300" },
];

export default function Tasks() {
  const [params, setParams] = useSearchParams();
  const projectFilter = params.get("project") || "all";
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState<Task | null>(null);
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState({ project_id: "", source: "" });
  const [aiBusy, setAiBusy] = useState(false);
  const [manualOpen, setManualOpen] = useState(false);
  const [manualDraft, setManualDraft] = useState({
    project_id: "",
    title: "",
    description: "",
    status: "done",
    type: "scope",
    planned_for_date: "",
  });
  const [manualBusy, setManualBusy] = useState(false);
  const { toast } = useToast();

  const fetchAll = async () => {
    const [{ data: pr }, { data: ts }] = await Promise.all([
      supabase.from("projects").select("id, name, telegram_id, progress, mvp_completed_at, scope_features").order("created_at", { ascending: false }),
      supabase.from("tasks").select("*").order("created_at", { ascending: false }),
    ]);
    setProjects((pr as Project[]) || []);
    setTasks((ts as Task[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const filtered = projectFilter === "all" ? tasks : tasks.filter((t) => t.project_id === projectFilter);

  const setStatus = async (task: Task, status: string) => {
    const { error } = await supabase.from("tasks").update({ status }).eq("id", task.id);
    if (error) return toast({ title: "Ошибка", description: error.message, variant: "destructive" });
    if (status === "done") {
      await supabase.functions.invoke("notify-task-done", { body: { task_id: task.id } });
      toast({ title: "✅ Готово", description: "Клиент уведомлён в Telegram" });
    }
    fetchAll();
    setOpen(null);
  };

  const remove = async (id: string) => {
    if (!confirm("Удалить задачу?")) return;
    await supabase.from("tasks").delete().eq("id", id);
    fetchAll();
    setOpen(null);
  };

  const copy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Скопировано в буфер" });
  };

  const aiCreate = async () => {
    if (!draft.project_id || !draft.source.trim()) {
      return toast({ title: "Выберите проект и опишите правку", variant: "destructive" });
    }
    setAiBusy(true);
    const project = projects.find((p) => p.id === draft.project_id);
    const { data, error } = await supabase.functions.invoke("parse-edit", {
      body: {
        text: draft.source,
        project_id: draft.project_id,
        project_context: project
          ? `Название: ${project.name}\nГраницы MVP: ${(project.scope_features || []).join("; ") || "не заданы"}`
          : "",
        scope_features: project?.scope_features || [],
      },
    });
    if (error || data?.error) {
      setAiBusy(false);
      return toast({ title: "AI ошибка", description: error?.message || data?.error, variant: "destructive" });
    }
    const taskType = data.task_type === "extra" ? "extra" : "scope";
    const { error: insErr } = await supabase.from("tasks").insert({
      project_id: draft.project_id,
      title: data.title,
      steps: data.steps,
      ai_instruction: data.instruction_for_lovable,
      source_message: draft.source,
      priority: data.priority || "normal",
      status: "new",
      type: taskType,
    });
    setAiBusy(false);
    if (insErr) return toast({ title: "Ошибка", description: insErr.message, variant: "destructive" });
    toast({
      title: "Задача создана через AI",
      description: taskType === "extra" ? "🎁 Помечена как улучшение (вне MVP)" : "📋 Входит в MVP",
    });
    setCreating(false);
    setDraft({ project_id: "", source: "" });
    fetchAll();
  };

  const createManual = async () => {
    if (!manualDraft.project_id || !manualDraft.title.trim()) {
      return toast({ title: "Заполните проект и название", variant: "destructive" });
    }
    setManualBusy(true);
    const { error } = await supabase.from("tasks").insert({
      project_id: manualDraft.project_id,
      title: manualDraft.title.trim(),
      description: manualDraft.description.trim() || null,
      status: manualDraft.status,
      priority: "normal",
      type: manualDraft.type,
      planned_for_date: manualDraft.planned_for_date || null,
      is_manual: true,
    });
    setManualBusy(false);
    if (error) return toast({ title: "Ошибка", description: error.message, variant: "destructive" });
    if (manualDraft.status === "done") {
      // notify client just like AI tasks when marked done
      const { data: created } = await supabase
        .from("tasks")
        .select("id")
        .eq("project_id", manualDraft.project_id)
        .eq("title", manualDraft.title.trim())
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (created?.id) {
        await supabase.functions.invoke("notify-task-done", { body: { task_id: created.id } });
      }
    }
    toast({ title: "Задача создана" });
    setManualOpen(false);
    setManualDraft({ project_id: "", title: "", description: "", status: "done", type: "scope", planned_for_date: "" });
    fetchAll();
  };

  const grouped = STATUSES.map((s) => ({ ...s, items: filtered.filter((t) => t.status === s.key) }));
  const activeProject = projectFilter !== "all" ? projects.find((p) => p.id === projectFilter) : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold">Задачи</h1>
          <p className="text-sm text-muted-foreground">Канбан задач по проектам клиентов</p>
        </div>
        <div className="flex gap-2">
          <Select
            value={projectFilter}
            onValueChange={(v) => setParams(v === "all" ? {} : { project: v })}
          >
            <SelectTrigger className="w-56">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все проекты</SelectItem>
              {projects.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => setManualOpen(true)}>
            <PencilLine className="h-4 w-4 mr-1" /> Ручная задача
          </Button>
          <Button onClick={() => setCreating(true)}>
            <Plus className="h-4 w-4 mr-1" /> AI-задача
          </Button>
        </div>
      </div>

      {activeProject?.mvp_completed_at && (
        <Card className="border-emerald-500/40 bg-emerald-500/10">
          <CardContent className="py-4 flex items-center justify-between gap-3">
            <div>
              <p className="font-semibold text-emerald-300">🎉 MVP завершён!</p>
              <p className="text-xs text-muted-foreground">
                Все scope-задачи выполнены. Новые задачи будут автоматически помечены как улучшения (extra).
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <p className="text-muted-foreground">Загрузка...</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {grouped.map((col) => (
            <div key={col.key} className="space-y-3">
              <div className={`rounded-md px-3 py-2 text-sm font-medium ${col.color}`}>
                {col.label} <span className="opacity-60">· {col.items.length}</span>
              </div>
              <div className="space-y-2">
                {col.items.map((t) => {
                  const proj = projects.find((p) => p.id === t.project_id);
                  return (
                    <Card
                      key={t.id}
                      className="cursor-pointer hover:border-primary/50 transition-colors"
                      onClick={() => setOpen(t)}
                    >
                      <CardContent className="p-3 space-y-1">
                        <p className="text-sm font-medium line-clamp-2">{t.title}</p>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span className="truncate">{proj?.name || "—"}</span>
                          <div className="flex items-center gap-1 shrink-0">
                            {t.type === "extra" ? (
                              <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">extra</Badge>
                            ) : (
                              <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">scope</Badge>
                            )}
                          </div>
                        </div>
                        {(t as any).planned_for_date && (
                          <p className="text-[10px] text-muted-foreground">📅 {(t as any).planned_for_date}</p>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
                {col.items.length === 0 && (
                  <p className="text-xs text-muted-foreground/60 text-center py-2">Пусто</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Task detail */}
      <Dialog open={!!open} onOpenChange={(o) => !o && setOpen(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          {open && (
            <>
              <DialogHeader>
                <DialogTitle>{open.title}</DialogTitle>
                <DialogDescription>
                  {projects.find((p) => p.id === open.project_id)?.name} · приоритет {open.priority}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                {open.source_message && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Запрос клиента:</p>
                    <p className="text-sm bg-muted/40 rounded p-2">{open.source_message}</p>
                  </div>
                )}
                {open.description && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Описание:</p>
                    <p className="text-sm bg-muted/40 rounded p-2 whitespace-pre-wrap">{open.description}</p>
                  </div>
                )}
                {open.steps?.length > 0 && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Шаги:</p>
                    <ol className="list-decimal list-inside space-y-1 text-sm">
                      {open.steps.map((s, i) => (
                        <li key={i}>{s}</li>
                      ))}
                    </ol>
                  </div>
                )}
                {open.ai_instruction && (
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs text-muted-foreground">Инструкция для Lovable:</p>
                      <Button size="sm" variant="ghost" onClick={() => copy(open.ai_instruction!)}>
                        <Copy className="h-3 w-3 mr-1" /> Копировать
                      </Button>
                    </div>
                    <Textarea
                      readOnly
                      value={open.ai_instruction}
                      className="font-mono text-xs min-h-[140px]"
                    />
                  </div>
                )}
                <div className="flex flex-wrap gap-2">
                  {STATUSES.filter((s) => s.key !== open.status).map((s) => (
                    <Button key={s.key} size="sm" variant="outline" onClick={() => setStatus(open, s.key)}>
                      <ChevronRight className="h-3 w-3 mr-1" /> {s.label}
                    </Button>
                  ))}
                </div>
              </div>
              <DialogFooter>
                <Button variant="destructive" size="sm" onClick={() => remove(open.id)}>
                  <Trash2 className="h-3 w-3 mr-1" /> Удалить
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Create via AI */}
      <Dialog open={creating} onOpenChange={setCreating}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Создать задачу через AI</DialogTitle>
            <DialogDescription>AI разберёт описание и подготовит инструкцию для Lovable</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Select value={draft.project_id} onValueChange={(v) => setDraft({ ...draft, project_id: v })}>
              <SelectTrigger>
                <SelectValue placeholder="Выберите проект" />
              </SelectTrigger>
              <SelectContent>
                {projects.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Textarea
              placeholder="Опишите правку: «Сделай кнопку зелёной и добавь Stripe оплату»"
              value={draft.source}
              onChange={(e) => setDraft({ ...draft, source: e.target.value })}
              className="min-h-[120px]"
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setCreating(false)}>
              Отмена
            </Button>
            <Button onClick={aiCreate} disabled={aiBusy}>
              <Sparkles className="h-4 w-4 mr-1" />
              {aiBusy ? "AI работает..." : "Создать"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create manually */}
      <Dialog open={manualOpen} onOpenChange={setManualOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ручная задача</DialogTitle>
            <DialogDescription>Создать задачу без AI</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Select
              value={manualDraft.project_id}
              onValueChange={(v) => setManualDraft({ ...manualDraft, project_id: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Выберите проект" />
              </SelectTrigger>
              <SelectContent>
                {projects.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              placeholder="Название задачи"
              value={manualDraft.title}
              onChange={(e) => setManualDraft({ ...manualDraft, title: e.target.value })}
            />
            <Textarea
              placeholder="Описание (опционально)"
              value={manualDraft.description}
              onChange={(e) => setManualDraft({ ...manualDraft, description: e.target.value })}
              className="min-h-[80px]"
            />
            <Select
              value={manualDraft.status}
              onValueChange={(v) => setManualDraft({ ...manualDraft, status: v })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUSES.map((s) => (
                  <SelectItem key={s.key} value={s.key}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setManualOpen(false)}>
              Отмена
            </Button>
            <Button onClick={createManual} disabled={manualBusy}>
              {manualBusy ? "Сохраняю..." : "Создать"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}