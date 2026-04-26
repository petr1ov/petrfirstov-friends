import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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
import { Plus, Pencil, Trash2, RefreshCw, ExternalLink, Github } from "lucide-react";
import { Link } from "react-router-dom";

type Project = {
  id: string;
  name: string;
  telegram_id: number;
  client_name: string | null;
  github_repo: string | null;
  status: string;
  progress: number;
  last_commit_at: string | null;
  last_commit_message: string | null;
  commits_count: number;
  created_at: string;
};

const empty: Partial<Project> = {
  name: "",
  telegram_id: 0,
  client_name: "",
  github_repo: "",
  status: "active",
  progress: 0,
};

export default function Projects() {
  const [items, setItems] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<Project> | null>(null);
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchAll = async () => {
    const { data } = await supabase.from("projects").select("*").order("created_at", { ascending: false });
    setItems((data as Project[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const save = async () => {
    if (!editing?.name || !editing?.telegram_id) {
      toast({ title: "Заполните название и Telegram ID", variant: "destructive" });
      return;
    }
    setSaving(true);
    const payload = {
      name: editing.name,
      telegram_id: Number(editing.telegram_id),
      client_name: editing.client_name || null,
      github_repo: editing.github_repo || null,
      status: editing.status || "active",
    };
    const { error } = editing.id
      ? await supabase.from("projects").update(payload).eq("id", editing.id)
      : await supabase.from("projects").insert(payload);
    setSaving(false);
    if (error) {
      toast({ title: "Ошибка", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: editing.id ? "Проект обновлён" : "Проект создан" });
    setEditing(null);
    fetchAll();
  };

  const remove = async (id: string) => {
    if (!confirm("Удалить проект и все задачи?")) return;
    const { error } = await supabase.from("projects").delete().eq("id", id);
    if (error) return toast({ title: "Ошибка", description: error.message, variant: "destructive" });
    toast({ title: "Удалено" });
    fetchAll();
  };

  const sync = async (id: string) => {
    setSyncing(id);
    const { data, error } = await supabase.functions.invoke("sync-github", { body: { project_id: id } });
    setSyncing(null);
    if (error) return toast({ title: "Ошибка sync", description: error.message, variant: "destructive" });
    toast({ title: "Синхронизация выполнена", description: JSON.stringify(data?.results?.[0] || {}) });
    fetchAll();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold">Проекты клиентов</h1>
          <p className="text-sm text-muted-foreground">Привяжите Telegram ID клиента — у него появится «Мой проект» в боте.</p>
        </div>
        <Button onClick={() => setEditing({ ...empty })}>
          <Plus className="h-4 w-4 mr-1" /> Новый проект
        </Button>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Загрузка...</p>
      ) : items.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">Пока нет проектов</CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {items.map((p) => (
            <Card key={p.id} className="flex flex-col">
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-lg">{p.name}</CardTitle>
                  <Badge variant={p.status === "active" ? "default" : "secondary"}>{p.status}</Badge>
                </div>
                {p.client_name && <p className="text-sm text-muted-foreground">{p.client_name}</p>}
                <p className="text-xs text-muted-foreground">TG: {p.telegram_id}</p>
              </CardHeader>
              <CardContent className="flex-1 space-y-3">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span>Прогресс</span>
                    <span className="font-semibold">{p.progress}%</span>
                  </div>
                  <Progress value={p.progress} />
                </div>
                {p.github_repo && (
                  <a
                    href={p.github_repo.startsWith("http") ? p.github_repo : `https://github.com/${p.github_repo}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-xs text-primary hover:underline"
                  >
                    <Github className="h-3 w-3" /> {p.github_repo}
                  </a>
                )}
                {p.last_commit_message && (
                  <p className="text-xs text-muted-foreground line-clamp-2">💬 {p.last_commit_message}</p>
                )}
                <div className="flex flex-wrap gap-2 pt-2">
                  <Link to={`/tasks?project=${p.id}`}>
                    <Button size="sm" variant="outline">
                      Задачи <ExternalLink className="h-3 w-3 ml-1" />
                    </Button>
                  </Link>
                  {p.github_repo && (
                    <Button size="sm" variant="ghost" onClick={() => sync(p.id)} disabled={syncing === p.id}>
                      <RefreshCw className={`h-3 w-3 mr-1 ${syncing === p.id ? "animate-spin" : ""}`} /> Sync
                    </Button>
                  )}
                  <Button size="sm" variant="ghost" onClick={() => setEditing(p)}>
                    <Pencil className="h-3 w-3" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => remove(p.id)}>
                    <Trash2 className="h-3 w-3 text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editing?.id ? "Редактировать" : "Новый проект"}</DialogTitle>
            <DialogDescription>Привяжите проект к клиенту по его Telegram ID</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-muted-foreground">Название проекта</label>
              <Input value={editing?.name || ""} onChange={(e) => setEditing({ ...editing!, name: e.target.value })} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Telegram ID клиента</label>
              <Input
                type="number"
                value={editing?.telegram_id || ""}
                onChange={(e) => setEditing({ ...editing!, telegram_id: Number(e.target.value) })}
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Имя клиента (необязательно)</label>
              <Input
                value={editing?.client_name || ""}
                onChange={(e) => setEditing({ ...editing!, client_name: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">GitHub repo (owner/name или URL)</label>
              <Input
                value={editing?.github_repo || ""}
                onChange={(e) => setEditing({ ...editing!, github_repo: e.target.value })}
                placeholder="petrfirstov/my-app"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Статус</label>
              <Input
                value={editing?.status || "active"}
                onChange={(e) => setEditing({ ...editing!, status: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setEditing(null)}>
              Отмена
            </Button>
            <Button onClick={save} disabled={saving}>
              {saving ? "Сохраняю..." : "Сохранить"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}