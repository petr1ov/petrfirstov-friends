import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import type { Tables } from "@/integrations/supabase/types";

const Partners = () => {
  const [partners, setPartners] = useState<Tables<"partners">[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from("partners").select("*").order("created_at", { ascending: false });
      setPartners(data || []);
      setLoading(false);
    };
    fetch();
  }, []);

  const filtered = partners.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.ref_code.toLowerCase().includes(search.toLowerCase()) ||
      (p.username || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Партнёры</h1>
      <Input
        placeholder="Поиск по имени, ref_code, username..."
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
                <TableHead>Ref Code</TableHead>
                <TableHead>Источник</TableHead>
                <TableHead>Дата</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Загрузка...</TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Нет партнёров</TableCell>
                </TableRow>
              ) : (
                filtered.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.name}</TableCell>
                    <TableCell>{p.username ? `@${p.username}` : "—"}</TableCell>
                    <TableCell><code className="text-xs bg-muted px-2 py-1 rounded">{p.ref_code}</code></TableCell>
                    <TableCell>{p.traffic_source || "—"}</TableCell>
                    <TableCell className="text-muted-foreground">{new Date(p.created_at).toLocaleDateString("ru-RU")}</TableCell>
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

export default Partners;
