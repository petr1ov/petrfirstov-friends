import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

interface ActionStat {
  action: string;
  count: number;
}

const COLORS = [
  "hsl(230, 70%, 55%)",
  "hsl(160, 60%, 45%)",
  "hsl(40, 95%, 55%)",
  "hsl(200, 80%, 55%)",
  "hsl(0, 72%, 51%)",
  "hsl(280, 60%, 55%)",
];

const Analytics = () => {
  const [actionStats, setActionStats] = useState<ActionStat[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [todayUsers, setTodayUsers] = useState(0);
  const [totalActions, setTotalActions] = useState(0);
  const [recentActions, setRecentActions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const [usersTotal, usersToday, actions, recent] = await Promise.all([
        supabase.from("bot_users").select("*", { count: "exact", head: true }),
        supabase.from("bot_users").select("*", { count: "exact", head: true }).gte("created_at", today.toISOString()),
        supabase.from("user_actions").select("action"),
        supabase.from("user_actions").select("*").order("created_at", { ascending: false }).limit(50),
      ]);

      setTotalUsers(usersTotal.count || 0);
      setTodayUsers(usersToday.count || 0);
      setTotalActions(actions.data?.length || 0);
      setRecentActions(recent.data || []);

      // Aggregate actions
      const actionMap: Record<string, number> = {};
      (actions.data || []).forEach((a: any) => {
        const key = a.action.startsWith("button:") ? a.action.replace("button:", "") : a.action;
        actionMap[key] = (actionMap[key] || 0) + 1;
      });

      const sorted = Object.entries(actionMap)
        .map(([action, count]) => ({ action, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      setActionStats(sorted);
      setLoading(false);
    };
    fetchAnalytics();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Аналитика</h1>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Всего пользователей</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{loading ? "..." : totalUsers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Новые сегодня</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{loading ? "..." : todayUsers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Всего действий</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{loading ? "..." : totalActions}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Популярные действия</CardTitle>
          </CardHeader>
          <CardContent>
            {actionStats.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={actionStats}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="action" tick={{ fontSize: 11 }} angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center text-muted-foreground py-8">Нет данных</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Распределение действий</CardTitle>
          </CardHeader>
          <CardContent>
            {actionStats.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={actionStats} dataKey="count" nameKey="action" cx="50%" cy="50%" outerRadius={100} label>
                    {actionStats.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center text-muted-foreground py-8">Нет данных</div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Последние действия</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Telegram ID</TableHead>
                <TableHead>Действие</TableHead>
                <TableHead>Дата</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">Загрузка...</TableCell>
                </TableRow>
              ) : recentActions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">Нет действий</TableCell>
                </TableRow>
              ) : (
                recentActions.map((a: any) => (
                  <TableRow key={a.id}>
                    <TableCell><code className="text-xs bg-muted px-2 py-1 rounded">{a.telegram_id}</code></TableCell>
                    <TableCell className="font-medium">{a.action}</TableCell>
                    <TableCell className="text-muted-foreground">{new Date(a.created_at).toLocaleString("ru-RU")}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Analytics;
