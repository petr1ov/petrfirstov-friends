import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import type { Tables } from "@/integrations/supabase/types";
import { toast } from "sonner";

type LeadStatus = "new" | "in_progress" | "client" | "rejected";

const statusLabels: Record<LeadStatus, string> = {
  new: "Новый",
  in_progress: "В работе",
  client: "Клиент",
  rejected: "Отклонён",
};

const statusColors: Record<LeadStatus, string> = {
  new: "bg-[hsl(var(--info))] text-white",
  in_progress: "bg-[hsl(var(--warning))] text-white",
  client: "bg-[hsl(var(--success))] text-white",
  rejected: "bg-destructive text-destructive-foreground",
};

const Leads = () => {
  const [leads, setLeads] = useState<Tables<"leads">[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLeads = async () => {
    const { data } = await supabase.from("leads").select("*").order("created_at", { ascending: false });
    setLeads(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchLeads(); }, []);

  const updateStatus = async (id: string, status: LeadStatus) => {
    const { error } = await supabase.from("leads").update({ status }).eq("id", id);
    if (error) {
      toast.error("Ошибка обновления статуса");
    } else {
      toast.success("Статус обновлён");
      setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, status } : l)));
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Лиды</h1>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Имя</TableHead>
                <TableHead>Telegram</TableHead>
                <TableHead>Контакт</TableHead>
                <TableHead>Ref Code</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead>Дата</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Загрузка...</TableCell>
                </TableRow>
              ) : leads.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Нет лидов</TableCell>
                </TableRow>
              ) : (
                leads.map((l) => (
                  <TableRow key={l.id}>
                    <TableCell className="font-medium">{l.name || "—"}</TableCell>
                    <TableCell>{l.telegram || "—"}</TableCell>
                    <TableCell>{l.contact || "—"}</TableCell>
                    <TableCell><code className="text-xs bg-muted px-2 py-1 rounded">{l.ref_code}</code></TableCell>
                    <TableCell>
                      <Select value={l.status} onValueChange={(v) => updateStatus(l.id, v as LeadStatus)}>
                        <SelectTrigger className="w-[140px]">
                          <Badge className={statusColors[l.status as LeadStatus]}>{statusLabels[l.status as LeadStatus]}</Badge>
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(statusLabels).map(([key, label]) => (
                            <SelectItem key={key} value={key}>{label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{new Date(l.created_at).toLocaleDateString("ru-RU")}</TableCell>
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

export default Leads;
