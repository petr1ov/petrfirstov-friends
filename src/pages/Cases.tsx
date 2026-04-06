import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { CreditCard, Smartphone, Server, Eye, ExternalLink, Plus, Pencil, Trash2, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type CaseItem = {
  id: string;
  title: string;
  subtitle: string;
  price: string;
  category: string;
  description: string;
  features: string[];
  result: string;
  link?: string | null;
  sort_order: number;
};

const categoryLabels: Record<string, string> = {
  all: "Все",
  ai_cards: "AI-визитки",
  apps: "Приложения",
  services: "Сервисы",
};

const categoryColors: Record<string, string> = {
  ai_cards: "bg-purple-500/20 text-purple-300",
  apps: "bg-blue-500/20 text-blue-300",
  services: "bg-emerald-500/20 text-emerald-300",
};

const categoryIcons: Record<string, React.ElementType> = {
  ai_cards: CreditCard,
  apps: Smartphone,
  services: Server,
};

const emptyCase: Omit<CaseItem, "id"> = {
  title: "",
  subtitle: "",
  price: "",
  category: "ai_cards",
  description: "",
  features: [],
  result: "",
  link: "",
  sort_order: 0,
};

const Cases = () => {
  const [filter, setFilter] = useState("all");
  const [cases, setCases] = useState<CaseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<CaseItem | null>(null);
  const [editing, setEditing] = useState<Partial<CaseItem> | null>(null);
  const [featuresText, setFeaturesText] = useState("");
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const fetchCases = async () => {
    const { data } = await supabase.from("cases").select("*").order("sort_order");
    if (data) setCases(data as CaseItem[]);
    setLoading(false);
  };

  useEffect(() => { fetchCases(); }, []);

  const filtered = filter === "all" ? cases : cases.filter(c => c.category === filter);

  const openEditor = (c?: CaseItem) => {
    if (c) {
      setEditing(c);
      setFeaturesText(c.features.join("\n"));
    } else {
      setEditing({ ...emptyCase, sort_order: cases.length + 1 });
      setFeaturesText("");
    }
  };

  const handleSave = async () => {
    if (!editing?.title) return;
    setSaving(true);
    const payload = {
      title: editing.title,
      subtitle: editing.subtitle || "",
      price: editing.price || "",
      category: editing.category || "ai_cards",
      description: editing.description || "",
      features: featuresText.split("\n").map(f => f.trim()).filter(Boolean),
      result: editing.result || "",
      link: editing.link || null,
      sort_order: editing.sort_order || 0,
    };

    if (editing.id) {
      await supabase.from("cases").update(payload).eq("id", editing.id);
      toast({ title: "Кейс обновлён" });
    } else {
      await supabase.from("cases").insert(payload);
      toast({ title: "Кейс добавлен" });
    }
    setSaving(false);
    setEditing(null);
    fetchCases();
  };

  const handleDelete = async (id: string) => {
    await supabase.from("cases").delete().eq("id", id);
    toast({ title: "Кейс удалён" });
    setSelected(null);
    fetchCases();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold">Кейсы</h1>
        <div className="flex gap-2">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-[160px]">
              <span>{categoryLabels[filter]}</span>
            </SelectTrigger>
            <SelectContent>
              {Object.entries(categoryLabels).map(([key, label]) => (
                <SelectItem key={key} value={key}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={() => openEditor()} size="sm">
            <Plus className="w-4 h-4 mr-1" /> Добавить
          </Button>
        </div>
      </div>

      {loading ? (
        <p className="text-muted-foreground text-sm">Загрузка...</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {filtered.map((c) => {
            const Icon = categoryIcons[c.category] || CreditCard;
            return (
              <Card key={c.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelected(c)}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Icon className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-base">{c.title}</CardTitle>
                        <p className="text-xs text-muted-foreground">{c.subtitle}</p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={(e) => { e.stopPropagation(); openEditor(c); }} className="p-1 hover:bg-accent rounded">
                        <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
                      </button>
                      <Eye className="w-4 h-4 text-muted-foreground mt-1" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <Badge className={categoryColors[c.category]}>{categoryLabels[c.category]}</Badge>
                    <span className="text-sm font-bold text-primary">{c.price}</span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* View dialog */}
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-md">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle>{selected.title}</DialogTitle>
                <DialogDescription>
                  {selected.subtitle} · <span className="font-semibold">{selected.price}</span>
                </DialogDescription>
              </DialogHeader>
              <p className="text-sm text-muted-foreground">{selected.description}</p>
              <div className="space-y-1.5">
                <p className="text-xs font-semibold text-muted-foreground uppercase">Что входит</p>
                {selected.features.map((f, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                    {f}
                  </div>
                ))}
              </div>
              <div className="p-3 rounded-lg bg-accent/10 border border-accent/20">
                <p className="text-sm text-accent">✨ {selected.result}</p>
              </div>
              {selected.link && (
                <a href={selected.link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm text-primary hover:underline">
                  <ExternalLink className="w-4 h-4" /> Ссылка на кейс
                </a>
              )}
              <DialogFooter className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => { setSelected(null); openEditor(selected); }}>
                  <Pencil className="w-3.5 h-3.5 mr-1" /> Редактировать
                </Button>
                <Button variant="destructive" size="sm" onClick={() => handleDelete(selected.id)}>
                  <Trash2 className="w-3.5 h-3.5 mr-1" /> Удалить
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit/Create dialog */}
      <Dialog open={!!editing} onOpenChange={() => setEditing(null)}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing?.id ? "Редактировать кейс" : "Новый кейс"}</DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Название</label>
                <Input value={editing.title || ""} onChange={e => setEditing({ ...editing, title: e.target.value })} />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Подзаголовок</label>
                <Input value={editing.subtitle || ""} onChange={e => setEditing({ ...editing, subtitle: e.target.value })} />
              </div>
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="text-xs font-medium text-muted-foreground">Цена</label>
                  <Input value={editing.price || ""} onChange={e => setEditing({ ...editing, price: e.target.value })} />
                </div>
                <div className="flex-1">
                  <label className="text-xs font-medium text-muted-foreground">Категория</label>
                  <Select value={editing.category || "ai_cards"} onValueChange={v => setEditing({ ...editing, category: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ai_cards">AI-визитки</SelectItem>
                      <SelectItem value="apps">Приложения</SelectItem>
                      <SelectItem value="services">Сервисы</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Описание</label>
                <Textarea value={editing.description || ""} onChange={e => setEditing({ ...editing, description: e.target.value })} rows={3} />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Фичи (каждая с новой строки)</label>
                <Textarea value={featuresText} onChange={e => setFeaturesText(e.target.value)} rows={4} />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Результат</label>
                <Input value={editing.result || ""} onChange={e => setEditing({ ...editing, result: e.target.value })} />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Ссылка (опционально)</label>
                <Input value={editing.link || ""} onChange={e => setEditing({ ...editing, link: e.target.value })} placeholder="https://..." />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Порядок сортировки</label>
                <Input type="number" value={editing.sort_order || 0} onChange={e => setEditing({ ...editing, sort_order: Number(e.target.value) })} />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setEditing(null)}>Отмена</Button>
                <Button onClick={handleSave} disabled={saving || !editing.title}>
                  {saving ? "Сохранение..." : "Сохранить"}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Cases;
