import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

type PayoutStatus = "pending" | "paid" | "cancelled";

const statusLabels: Record<PayoutStatus, string> = {
  pending: "Ожидает",
  paid: "Выплачено",
  cancelled: "Отменено",
};

const statusColors: Record<PayoutStatus, string> = {
  pending: "bg-[hsl(var(--warning))] text-white",
  paid: "bg-[hsl(var(--success))] text-white",
  cancelled: "bg-destructive text-destructive-foreground",
};

const Payouts = () => {
  const [payouts, setPayouts] = useState<(Tables<"payouts"> & { partner_name?: string })[]>([]);
  const [partners, setPartners] = useState<Tables<"partners">[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [newPayout, setNewPayout] = useState({ partner_id: "", amount: "" });

  const fetchData = async () => {
    const [payoutsRes, partnersRes] = await Promise.all([
      supabase.from("payouts").select("*").order("created_at", { ascending: false }),
      supabase.from("partners").select("*"),
    ]);

    const partnersData = partnersRes.data || [];
    setPartners(partnersData);

    const enriched = (payoutsRes.data || []).map((p) => ({
      ...p,
      partner_name: partnersData.find((pr) => pr.id === p.partner_id)?.name || "—",
    }));
    setPayouts(enriched);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const updateStatus = async (id: string, status: PayoutStatus) => {
    const { error } = await supabase.from("payouts").update({ status }).eq("id", id);
    if (error) {
      toast.error("Ошибка");
    } else {
      toast.success("Статус обновлён");
      setPayouts((prev) => prev.map((p) => (p.id === id ? { ...p, status } : p)));
    }
  };

  const createPayout = async () => {
    if (!newPayout.partner_id || !newPayout.amount) return;
    const { error } = await supabase.from("payouts").insert({
      partner_id: newPayout.partner_id,
      amount: Number(newPayout.amount),
    });
    if (error) {
      toast.error("Ошибка создания выплаты");
    } else {
      toast.success("Выплата создана");
      setOpen(false);
      setNewPayout({ partner_id: "", amount: "" });
      fetchData();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Выплаты</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" />Новая выплата</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Создать выплату</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <Select value={newPayout.partner_id} onValueChange={(v) => setNewPayout((p) => ({ ...p, partner_id: v }))}>
                <SelectTrigger><SelectValue placeholder="Выберите партнёра" /></SelectTrigger>
                <SelectContent>
                  {partners.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.name} ({p.ref_code})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                type="number"
                placeholder="Сумма (₽)"
                value={newPayout.amount}
                onChange={(e) => setNewPayout((p) => ({ ...p, amount: e.target.value }))}
              />
              <Button onClick={createPayout} className="w-full">Создать</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Партнёр</TableHead>
                <TableHead>Сумма</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead>Дата</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">Загрузка...</TableCell>
                </TableRow>
              ) : payouts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">Нет выплат</TableCell>
                </TableRow>
              ) : (
                payouts.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.partner_name}</TableCell>
                    <TableCell className="font-semibold">{Number(p.amount).toLocaleString("ru-RU")} ₽</TableCell>
                    <TableCell>
                      <Select value={p.status} onValueChange={(v) => updateStatus(p.id, v as PayoutStatus)}>
                        <SelectTrigger className="w-[140px]">
                          <Badge className={statusColors[p.status as PayoutStatus]}>{statusLabels[p.status as PayoutStatus]}</Badge>
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(statusLabels).map(([key, label]) => (
                            <SelectItem key={key} value={key}>{label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
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

export default Payouts;
