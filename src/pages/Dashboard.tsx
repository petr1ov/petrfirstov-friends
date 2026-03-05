import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, MousePointerClick, UserCheck, DollarSign } from "lucide-react";

const Dashboard = () => {
  const [stats, setStats] = useState({ partners: 0, clicks: 0, leads: 0, clients: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      const [partners, clicks, leads, clients] = await Promise.all([
        supabase.from("partners").select("*", { count: "exact", head: true }),
        supabase.from("clicks").select("*", { count: "exact", head: true }),
        supabase.from("leads").select("*", { count: "exact", head: true }),
        supabase.from("leads").select("*", { count: "exact", head: true }).eq("status", "client"),
      ]);
      setStats({
        partners: partners.count || 0,
        clicks: clicks.count || 0,
        leads: leads.count || 0,
        clients: clients.count || 0,
      });
      setLoading(false);
    };
    fetchStats();
  }, []);

  const cards = [
    { title: "Партнёры", value: stats.partners, icon: Users, color: "text-primary" },
    { title: "Клики", value: stats.clicks, icon: MousePointerClick, color: "text-accent" },
    { title: "Лиды", value: stats.leads, icon: UserCheck, color: "text-[hsl(var(--warning))]" },
    { title: "Клиенты", value: stats.clients, icon: DollarSign, color: "text-[hsl(var(--success))]" },
  ];

  const conversion = stats.clicks > 0 ? ((stats.leads / stats.clicks) * 100).toFixed(1) : "0";

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Дашборд</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground">Конверсия (клики → лиды)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{loading ? "..." : `${conversion}%`}</div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
