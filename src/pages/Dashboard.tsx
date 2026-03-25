import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, MousePointerClick, UserCheck, DollarSign, Bot, BarChart3 } from "lucide-react";

const Dashboard = () => {
  const [stats, setStats] = useState({
    partners: 0, clicks: 0, leads: 0, clients: 0, botUsers: 0, actions: 0,
  });
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
    </div>
  );
};

export default Dashboard;
