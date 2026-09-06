import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Trash2, UserPlus } from "lucide-react";

type Member = {
  id: string;
  project_id: string;
  telegram_id: number;
  role: "owner" | "client" | "viewer";
  name: string | null;
};

const ROLES = [
  { value: "owner", label: "👑 Owner", color: "bg-amber-500/20 text-amber-300 border-amber-500/30" },
  { value: "client", label: "👤 Client", color: "bg-blue-500/20 text-blue-300 border-blue-500/30" },
  { value: "viewer", label: "👁 Viewer", color: "bg-zinc-500/20 text-zinc-300 border-zinc-500/30" },
] as const;

export function ProjectMembers({ projectId }: { projectId: string }) {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [tgId, setTgId] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<Member["role"]>("client");
  const [adding, setAdding] = useState(false);
  const { toast } = useToast();

  const fetchMembers = async () => {
    const { data } = await supabase
      .from("project_members")
      .select("*")
      .eq("project_id", projectId)
      .order("created_at", { ascending: true });
    setMembers((data as Member[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchMembers();
  }, [projectId]);

  const add = async () => {
    const id = Number(tgId);
    if (!id || Number.isNaN(id)) {
      return toast({ title: "Введите корректный Telegram ID", variant: "destructive" });
    }
    setAdding(true);
    const { error } = await supabase.from("project_members").insert({
      project_id: projectId,
      telegram_id: id,
      role,
      name: name.trim() || null,
    });
    setAdding(false);
    if (error) {
      return toast({
        title: "Ошибка",
        description: error.code === "23505" ? "Этот Telegram ID уже добавлен" : error.message,
        variant: "destructive",
      });
    }
    // Пушим клиенту приветственное сообщение в бот
    supabase.functions
      .invoke("notify-client-onboarding", {
        body: { project_id: projectId, telegram_id: id, role },
      })
      .then(({ data }) => {
        if (data?.delivered) {
          toast({ title: "Участник добавлен", description: "Отправил приветствие в Telegram" });
        } else {
          toast({
            title: "Участник добавлен",
            description: "Не удалось доставить приветствие (возможно, он ещё не запускал бота /start)",
          });
        }
      })
      .catch((e) => console.error("onboarding invoke failed", e));
    setTgId("");
    setName("");
    setRole("client");
    fetchMembers();
  };

  const updateRole = async (id: string, newRole: Member["role"]) => {
    const { error } = await supabase.from("project_members").update({ role: newRole }).eq("id", id);
    if (error) return toast({ title: "Ошибка", description: error.message, variant: "destructive" });
    fetchMembers();
  };

  const remove = async (id: string) => {
    if (!confirm("Удалить участника?")) return;
    const { error } = await supabase.from("project_members").delete().eq("id", id);
    if (error) return toast({ title: "Ошибка", description: error.message, variant: "destructive" });
    fetchMembers();
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="text-xs text-muted-foreground">Участники проекта</label>
        <p className="text-xs text-muted-foreground/70 mb-2">
          Все участники получают уведомления. Viewer не может отправлять правки.
        </p>
      </div>

      {loading ? (
        <p className="text-xs text-muted-foreground">Загрузка...</p>
      ) : members.length === 0 ? (
        <p className="text-xs text-muted-foreground/70 italic">Пока никого нет</p>
      ) : (
        <ul className="space-y-1">
          {members.map((m) => {
            const meta = ROLES.find((r) => r.value === m.role);
            return (
              <li key={m.id} className="flex items-center gap-2 bg-muted/40 rounded px-2 py-1.5 text-sm">
                <Badge className={meta?.color}>{meta?.label}</Badge>
                <div className="flex-1 min-w-0">
                  <div className="truncate">{m.name || `TG: ${m.telegram_id}`}</div>
                  {m.name && <div className="text-xs text-muted-foreground">TG: {m.telegram_id}</div>}
                </div>
                <Select value={m.role} onValueChange={(v) => updateRole(m.id, v as Member["role"])}>
                  <SelectTrigger className="h-7 w-28 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLES.map((r) => (
                      <SelectItem key={r.value} value={r.value} className="text-xs">
                        {r.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <button
                  onClick={() => remove(m.id)}
                  className="text-muted-foreground hover:text-destructive shrink-0"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </li>
            );
          })}
        </ul>
      )}

      <div className="border-t border-border/40 pt-3 space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <Input
            type="number"
            placeholder="Telegram ID"
            value={tgId}
            onChange={(e) => setTgId(e.target.value)}
          />
          <Input
            placeholder="Имя (опц.)"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Select value={role} onValueChange={(v) => setRole(v as Member["role"])}>
            <SelectTrigger className="flex-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ROLES.map((r) => (
                <SelectItem key={r.value} value={r.value}>
                  {r.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={add} disabled={adding} size="sm">
            <UserPlus className="h-4 w-4 mr-1" />
            {adding ? "..." : "Добавить"}
          </Button>
        </div>
      </div>
    </div>
  );
}