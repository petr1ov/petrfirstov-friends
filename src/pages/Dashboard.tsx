import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Users, MousePointerClick, UserCheck, DollarSign, Bot, BarChart3, FolderKanban, ExternalLink, Github, CheckCircle2 } from "lucide-react";

type ProjectRow = {
  id: string;
  name: string;
  status: string;
  progress: number;
  published_url: string | null;
  github_repo: string | null;
  last_commit_at: string | null;
  last_commit_message: string | null;
  mvp_completed_at: string | null;
};

const Dashboard = () => {
  const [stats, setStats] = useState({
    partners: 0, clicks: 0, leads: 0, clients: 0, botUsers: 0, actions: 0,
  });
  const [projects, setProjects] = useState<ProjectRow[]>([]);
  const [projStats, setProjStats] = useState({ total: 0, active: 0, mvpDone: 0, avgProgress: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      const [partners, clicks, leads, clients, botUsers, actions] = await Promise.all([
        supabase.from("partners").select("*", { count: "exact", head: true }),
        supabase.from("clicks").select("*", { count: "exact", head: true }),
        supabase.from("leads").select("*", { count: "exact", head: true }),
        supabase.from("leads").select("*", { count: "exact", head: true }).eq("status", "client"),
        supabase.from("bot_users").select("*", { count: "exact", head: true }),
        supabase.from("user_actions").select("*", { count: "exact", head: true }),
      ]);
      setStats({
        partners: partners.count || 0,
        clicks: clicks.count || 0,
        leads: leads.count || 0,
        clients: clients.count || 0,
        botUsers: botUsers.count || 0,
        actions: actions.count || 0,
      });

      const { data: allProjects } = await supabase
        .from("projects")
        .select("id, name, status, progress, published_url, github_repo, last_commit_at, last_commit_message, mvp_completed_at")
        .order("last_commit_at", { ascending: false, nullsFirst: false });
      const list = (allProjects || []) as ProjectRow[];
      const active = list.filter((p) => p.status === "active");
      const mvpDone = list.filter((p) => p.mvp_completed_at).length;
      const avg = active.length > 0 ? Math.round(active.reduce((s, p) => s + (p.progress || 0), 0) / active.length) : 0;
      setProjStats({ total: list.length, active: active.length, mvpDone, avgProgress: avg });
      setProjects(list.slice(0, 6));

      setLoading(false);
    };
    fetchStats();
  }, []);

  const cards = [
    { title: "Пользователи бота", value: stats.botUsers, icon: Bot, color: "text-[hsl(var(--info))]" },
    { title: "Партнёры", value: stats.partners, icon: Users, color: "text-primary" },
    { title: "Клики", value: stats.clicks, icon: MousePointerClick, color: "text-accent" },
    { title: "Лиды", value: stats.leads, icon: UserCheck, color: "text-[hsl(var(--warning))]" },
    { title: "Клиенты", value: stats.clients, icon: DollarSign, color: "text-[hsl(var(--success))]" },
    { title: "Действий в боте", value: stats.actions, icon: BarChart3, color: "text-primary" },
  ];

  const conversion = stats.clicks > 0 ? ((stats.leads / stats.clicks) * 100).toFixed(1) : "0";
  const botConversion = stats.botUsers > 0 ? ((stats.leads / stats.botUsers) * 100).toFixed(1) : "0";

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Дашборд</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{card.title}</CardTitle>
              <card.icon className={`h-5 w-5 ${card.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{loading ? "..." : card.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Конверсия (клики → лиды)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{loading ? "..." : `${conversion}%`}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Конверсия (бот → лиды)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{loading ? "..." : `${botConversion}%`}</div>
          </CardContent>
        </Card>
      </div>

      <div className="pt-2">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <FolderKanban className="h-5 w-5 text-primary" /> Проекты
          </h2>
          <Link to="/projects" className="text-xs text-primary hover:underline flex items-center gap-1">
            Все проекты <ExternalLink className="h-3 w-3" />
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-xs text-muted-foreground">Всего проектов</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold">{loading ? "..." : projStats.total}</div></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-xs text-muted-foreground">Активных</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold text-primary">{loading ? "..." : projStats.active}</div></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-xs text-muted-foreground">MVP завершён</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold text-emerald-500">{loading ? "..." : projStats.mvpDone}</div></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-xs text-muted-foreground">Средний прогресс</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold">{loading ? "..." : `${projStats.avgProgress}%`}</div></CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-sm">Последняя активность</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {loading ? (
              <p className="text-muted-foreground text-sm">Загрузка...</p>
            ) : projects.length === 0 ? (
              <p className="text-muted-foreground text-sm">Проектов пока нет</p>
            ) : (
              projects.map((p) => (
                <div key={p.id} className="flex items-start justify-between gap-3 pb-3 border-b border-border/40 last:border-0 last:pb-0">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm truncate">{p.name}</span>
                      {p.mvp_completed_at && <CheckCircle2 className="h-3 w-3 text-emerald-500" />}
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      <div className="flex-1 max-w-[200px]">
                        <Progress value={p.progress} className="h-1.5" />
                      </div>
                      <span className="text-xs text-muted-foreground shrink-0">{p.progress}%</span>
                    </div>
                    {p.last_commit_message && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-1">💬 {p.last_commit_message}</p>
                    )}
                  </div>
                  <div className="flex flex-col gap-1 shrink-0">
                    {p.published_url && (
                      <a href={p.published_url} target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline flex items-center gap-1">
                        <ExternalLink className="h-3 w-3" /> сайт
                      </a>
                    )}
                    {p.github_repo && (
                      <a
                        href={p.github_repo.startsWith("http") ? p.github_repo : `https://github.com/${p.github_repo}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
                      >
                        <Github className="h-3 w-3" /> repo
                      </a>
                    )}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
