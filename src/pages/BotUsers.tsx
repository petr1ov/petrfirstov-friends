import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface BotUser {
  id: string;
  telegram_id: number;
  first_name: string | null;
  username: string | null;
  source: string | null;
  niche: string | null;
  created_at: string;
  last_active_at: string;
}

const BotUsers = () => {
  const [users, setUsers] = useState<BotUser[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      const { data } = await supabase
        .from("bot_users")
        .select("*")
        .order("last_active_at", { ascending: false });
      setUsers((data as BotUser[]) || []);
      setLoading(false);
    };
    fetchUsers();
  }, []);

  const filtered = users.filter(
    (u) =>
      (u.first_name || "").toLowerCase().includes(search.toLowerCase()) ||
      (u.username || "").toLowerCase().includes(search.toLowerCase()) ||
      String(u.telegram_id).includes(search)
  );

  const sourceColors: Record<string, string> = {
    organic: "bg-[hsl(var(--info))] text-white",
    event: "bg-[hsl(var(--warning))] text-white",
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Пользователи бота</h1>
      <Input
        placeholder="Поиск по имени, username, ID..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-sm"
      />
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Имя</TableHead>
                <TableHead>Username</TableHead>
                <TableHead>Telegram ID</TableHead>
                <TableHead>Источник</TableHead>
                <TableHead>Ниша</TableHead>
                <TableHead>Последняя активность</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Загрузка...</TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Нет пользователей</TableCell>
                </TableRow>
              ) : (
                filtered.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium">{u.first_name || "—"}</TableCell>
                    <TableCell>{u.username ? `@${u.username}` : "—"}</TableCell>
                    <TableCell><code className="text-xs bg-muted px-2 py-1 rounded">{u.telegram_id}</code></TableCell>
                    <TableCell>
                      <Badge className={sourceColors[u.source || "organic"] || "bg-muted text-muted-foreground"}>
                        {u.source || "organic"}
                      </Badge>
                    </TableCell>
                    <TableCell>{u.niche || "—"}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(u.last_active_at).toLocaleString("ru-RU")}
                    </TableCell>
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

export default BotUsers;
