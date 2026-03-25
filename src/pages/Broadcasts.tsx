import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Send, Plus, Eye, Sparkles, Users, CheckCircle, XCircle, Clock, Loader2 } from "lucide-react";

type BroadcastType = "mass" | "segmented" | "ai_personalized";
type BroadcastStatus = "draft" | "sending" | "completed" | "failed";

interface Broadcast {
  id: string;
  name: string;
  type: BroadcastType;
  message_template: string | null;
  ai_goal: string | null;
  ai_tone: string | null;
  buttons: any[];
  segment_filters: Record<string, any>;
  status: BroadcastStatus;
  total_recipients: number;
  sent_count: number;
  error_count: number;
  created_at: string;
  completed_at: string | null;
}

const SEGMENT_FILTERS = [
  { key: "source_event", label: "С мероприятия", description: "Пришли через event" },
  { key: "clicked_cases", label: "Смотрел кейсы", description: "Нажимал 'Кейсы'" },
  { key: "clicked_ai", label: "Пробовал AI", description: "Нажимал 'Попробовать AI'" },
  { key: "clicked_price", label: "Смотрел цену", description: "Нажимал 'Стоимость'" },
  { key: "visited_miniapp", label: "Был в мини-апе", description: "Открывал мини-приложение" },
  { key: "has_niche", label: "Указал нишу", description: "Заполнил данные о нише" },
];

const statusMap: Record<BroadcastStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  draft: { label: "Черновик", variant: "outline" },
  sending: { label: "Отправка...", variant: "secondary" },
  completed: { label: "Завершена", variant: "default" },
  failed: { label: "Ошибка", variant: "destructive" },
};

export default function Broadcasts() {
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedBroadcast, setSelectedBroadcast] = useState<string | null>(null);
  const [previews, setPreviews] = useState<any[]>([]);
  const [previewLoading, setPreviewLoading] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [type, setType] = useState<BroadcastType>("mass");
  const [messageTemplate, setMessageTemplate] = useState("");
  const [aiGoal, setAiGoal] = useState("");
  const [aiTone, setAiTone] = useState("friendly");
  const [segmentFilters, setSegmentFilters] = useState<Record<string, boolean>>({});
  const [buttonText, setButtonText] = useState("");
  const [buttonUrl, setButtonUrl] = useState("");

  const { data: broadcasts = [], isLoading } = useQuery({
    queryKey: ["broadcasts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("broadcasts")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Broadcast[];
    },
  });

  const { data: stats } = useQuery({
    queryKey: ["broadcast-stats"],
    queryFn: async () => {
      const { count: totalUsers } = await supabase.from("bot_users").select("*", { count: "exact", head: true });
      return { totalUsers: totalUsers || 0 };
    },
  });

  const createBroadcast = useMutation({
    mutationFn: async () => {
      // Get matching users
      let query = supabase.from("bot_users").select("telegram_id");

      if (type === "segmented") {
        if (segmentFilters.source_event) {
          query = query.eq("source", "event");
        }
        if (segmentFilters.has_niche) {
          query = query.not("niche", "is", null);
        }
      }

      const { data: users, error: usersError } = await query;
      if (usersError) throw usersError;

      let filteredUsers = users || [];

      // For segmented: apply action-based filters
      if (type === "segmented") {
        const actionFilters = Object.entries(segmentFilters)
          .filter(([k, v]) => v && !["source_event", "has_niche"].includes(k))
          .map(([k]) => k);

        if (actionFilters.length > 0) {
          const actionMap: Record<string, string> = {
            clicked_cases: "view_cases",
            clicked_ai: "try_ai",
            clicked_price: "view_price",
            visited_miniapp: "open_miniapp",
          };

          const { data: actionUsers } = await supabase
            .from("user_actions")
            .select("telegram_id")
            .in("action", actionFilters.map((f) => actionMap[f] || f));

          const actionTgIds = new Set((actionUsers || []).map((u) => u.telegram_id));
          filteredUsers = filteredUsers.filter((u) => actionTgIds.has(u.telegram_id));
        }
      }

      const buttons = buttonText ? [{ text: buttonText, url: buttonUrl || "https://petrfirstov.lovable.app/mini-app" }] : [];

      // Create broadcast
      const { data: broadcast, error } = await supabase
        .from("broadcasts")
        .insert({
          name,
          type,
          message_template: type !== "ai_personalized" ? messageTemplate : null,
          ai_goal: type === "ai_personalized" ? aiGoal : null,
          ai_tone: type === "ai_personalized" ? aiTone : null,
          buttons,
          segment_filters: type === "segmented" ? segmentFilters : {},
          total_recipients: filteredUsers.length,
        })
        .select()
        .single();

      if (error) throw error;

      // Create recipients
      if (filteredUsers.length > 0) {
        const recipients = filteredUsers.map((u) => ({
          broadcast_id: broadcast.id,
          telegram_id: u.telegram_id,
        }));

        const { error: recError } = await supabase.from("broadcast_recipients").insert(recipients);
        if (recError) throw recError;
      }

      return broadcast;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["broadcasts"] });
      setIsCreateOpen(false);
      resetForm();
      toast({ title: "Рассылка создана", description: "Теперь вы можете отправить или предпросмотреть её" });
    },
    onError: (e: any) => {
      toast({ title: "Ошибка", description: e.message, variant: "destructive" });
    },
  });

  const sendBroadcast = useMutation({
    mutationFn: async (broadcastId: string) => {
      const { data, error } = await supabase.functions.invoke("send-broadcast", {
        body: { broadcast_id: broadcastId, action: "send" },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["broadcasts"] });
      toast({ title: "Рассылка отправлена", description: `Отправлено: ${data.sent}, ошибок: ${data.errors}` });
    },
    onError: (e: any) => {
      toast({ title: "Ошибка отправки", description: e.message, variant: "destructive" });
    },
  });

  const handlePreview = async (broadcastId: string) => {
    setSelectedBroadcast(broadcastId);
    setPreviewLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("send-broadcast", {
        body: { broadcast_id: broadcastId, action: "preview" },
      });
      if (error) throw error;
      setPreviews(data.previews || []);
    } catch (e: any) {
      toast({ title: "Ошибка превью", description: e.message, variant: "destructive" });
    }
    setPreviewLoading(false);
  };

  const resetForm = () => {
    setName("");
    setType("mass");
    setMessageTemplate("");
    setAiGoal("");
    setAiTone("friendly");
    setSegmentFilters({});
    setButtonText("");
    setButtonUrl("");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Рассылки</h1>
          <p className="text-muted-foreground">
            Всего пользователей: <strong>{stats?.totalUsers || 0}</strong>
          </p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Новая рассылка
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Создать рассылку</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Название</Label>
                <Input placeholder="Например: Прогрев после кейсов" value={name} onChange={(e) => setName(e.target.value)} />
              </div>

              <div>
                <Label>Тип рассылки</Label>
                <Select value={type} onValueChange={(v) => setType(v as BroadcastType)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mass">📢 Массовая</SelectItem>
                    <SelectItem value="segmented">🎯 Сегментированная</SelectItem>
                    <SelectItem value="ai_personalized">🤖 AI-персонализированная</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {type === "segmented" && (
                <div className="space-y-3">
                  <Label>Фильтры сегмента</Label>
                  {SEGMENT_FILTERS.map((f) => (
                    <div key={f.key} className="flex items-center gap-2">
                      <Checkbox
                        id={f.key}
                        checked={segmentFilters[f.key] || false}
                        onCheckedChange={(checked) =>
                          setSegmentFilters((prev) => ({ ...prev, [f.key]: !!checked }))
                        }
                      />
                      <label htmlFor={f.key} className="text-sm cursor-pointer">
                        <span className="font-medium">{f.label}</span>
                        <span className="text-muted-foreground ml-1">— {f.description}</span>
                      </label>
                    </div>
                  ))}
                </div>
              )}

              {type !== "ai_personalized" && (
                <div>
                  <Label>Текст сообщения</Label>
                  <Textarea
                    placeholder="Текст рассылки (поддерживает HTML)"
                    value={messageTemplate}
                    onChange={(e) => setMessageTemplate(e.target.value)}
                    rows={5}
                  />
                </div>
              )}

              {type === "ai_personalized" && (
                <>
                  <div>
                    <Label>Цель рассылки</Label>
                    <Input
                      placeholder="Например: продать ботовизитку"
                      value={aiGoal}
                      onChange={(e) => setAiGoal(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Тон сообщения</Label>
                    <Select value={aiTone} onValueChange={setAiTone}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="friendly">😊 Дружелюбный</SelectItem>
                        <SelectItem value="selling">💰 Продающий</SelectItem>
                        <SelectItem value="soft">🌿 Мягкий</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="rounded-lg border p-3 bg-muted/50">
                    <p className="text-sm text-muted-foreground">
                      <Sparkles className="h-4 w-4 inline mr-1" />
                      AI сгенерирует персональное сообщение для каждого пользователя на основе его действий, ниши и стадии воронки.
                    </p>
                  </div>
                </>
              )}

              <div className="space-y-2">
                <Label>Кнопка (опционально)</Label>
                <Input placeholder="Текст кнопки" value={buttonText} onChange={(e) => setButtonText(e.target.value)} />
                {buttonText && (
                  <Input placeholder="Ссылка кнопки" value={buttonUrl} onChange={(e) => setButtonUrl(e.target.value)} />
                )}
              </div>

              <Button
                className="w-full"
                onClick={() => createBroadcast.mutate()}
                disabled={!name || createBroadcast.isPending}
              >
                {createBroadcast.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
                Создать рассылку
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Всего рассылок</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{broadcasts.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Отправлено</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{broadcasts.reduce((sum, b) => sum + (b.sent_count || 0), 0)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Ошибки</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{broadcasts.reduce((sum, b) => sum + (b.error_count || 0), 0)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">AI-рассылки</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{broadcasts.filter((b) => b.type === "ai_personalized").length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Broadcasts table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Название</TableHead>
                <TableHead>Тип</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead>Получатели</TableHead>
                <TableHead>Отправлено</TableHead>
                <TableHead>Ошибки</TableHead>
                <TableHead>Дата</TableHead>
                <TableHead>Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">Загрузка...</TableCell>
                </TableRow>
              ) : broadcasts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">Нет рассылок</TableCell>
                </TableRow>
              ) : (
                broadcasts.map((b) => (
                  <TableRow key={b.id}>
                    <TableCell className="font-medium">{b.name}</TableCell>
                    <TableCell>
                      {b.type === "mass" && "📢 Массовая"}
                      {b.type === "segmented" && "🎯 Сегмент"}
                      {b.type === "ai_personalized" && "🤖 AI"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusMap[b.status]?.variant || "outline"}>
                        {statusMap[b.status]?.label || b.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Users className="h-3 w-3 inline mr-1" />
                      {b.total_recipients}
                    </TableCell>
                    <TableCell>
                      <CheckCircle className="h-3 w-3 inline mr-1 text-green-500" />
                      {b.sent_count}
                    </TableCell>
                    <TableCell>
                      {b.error_count > 0 && <XCircle className="h-3 w-3 inline mr-1 text-destructive" />}
                      {b.error_count}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs">
                      {new Date(b.created_at).toLocaleString("ru")}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {b.status === "draft" && (
                          <>
                            {b.type === "ai_personalized" && (
                              <Button size="sm" variant="outline" onClick={() => handlePreview(b.id)} disabled={previewLoading}>
                                <Eye className="h-3 w-3" />
                              </Button>
                            )}
                            <Button
                              size="sm"
                              onClick={() => sendBroadcast.mutate(b.id)}
                              disabled={sendBroadcast.isPending}
                            >
                              <Send className="h-3 w-3" />
                            </Button>
                          </>
                        )}
                        {b.status === "sending" && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* AI Preview Dialog */}
      <Dialog open={!!selectedBroadcast && previews.length > 0} onOpenChange={() => { setSelectedBroadcast(null); setPreviews([]); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              <Sparkles className="h-4 w-4 inline mr-2" />
              Превью AI-сообщений
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {previews.map((p, i) => (
              <div key={i} className="rounded-lg border p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{p.name || `ID: ${p.telegram_id}`}</Badge>
                </div>
                <p className="text-sm whitespace-pre-wrap">{p.message}</p>
                {p.cta && (
                  <Badge variant="secondary">{p.cta}</Badge>
                )}
              </div>
            ))}
            <p className="text-xs text-muted-foreground">Показаны примеры для 3 случайных получателей</p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
