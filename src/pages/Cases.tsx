import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { ExternalLink, Plus, Pencil, Trash2, X, Upload, Star, GripVertical, ImageIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const CATEGORIES = [
  { value: "telegram_bot", label: "Telegram Bot" },
  { value: "ai", label: "AI" },
  { value: "crm", label: "CRM" },
  { value: "mini_app", label: "Mini App" },
  { value: "pwa", label: "PWA" },
  { value: "website", label: "Сайт" },
  { value: "automation", label: "Автоматизация" },
  // legacy
  { value: "ai_cards", label: "AI-визитки" },
  { value: "apps", label: "Приложения" },
  { value: "services", label: "Сервисы" },
];

const categoryLabel = (v: string) => CATEGORIES.find(c => c.value === v)?.label || v;

type CaseItem = {
  id: string;
  title: string;
  subtitle: string;
  client: string | null;
  category: string;
  task: string | null;
  solution: string | null;
  features: string[];
  technologies: string[];
  result: string;
  budget: number | null;
  price: string | null;
  cover_image: string | null;
  gallery: string[];
  tags: string[];
  featured: boolean;
  link: string | null;
  sort_order: number;
};

const empty: Partial<CaseItem> = {
  title: "", subtitle: "", client: "", category: "telegram_bot",
  task: "", solution: "", features: [], technologies: [], result: "",
  budget: null, cover_image: null, gallery: [], tags: [], featured: false, link: "", sort_order: 0,
};

const signedUrl = async (path: string | null) => {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  const { data } = await supabase.storage.from("case-gallery").createSignedUrl(path, 60 * 60 * 24 * 30);
  return data?.signedUrl || null;
};

const uploadFile = async (file: File): Promise<string> => {
  const ext = file.name.split(".").pop() || "jpg";
  const path = `${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from("case-gallery").upload(path, file, { upsert: false });
  if (error) throw error;
  return path;
};

const formatBudget = (n: number | null | undefined, fallback?: string | null) => {
  if (n) return new Intl.NumberFormat("ru-RU").format(n) + " ₽";
  return fallback || "";
};

const TagInput = ({ value, onChange, placeholder }: { value: string[]; onChange: (v: string[]) => void; placeholder?: string }) => {
  const [input, setInput] = useState("");
  const add = () => {
    const t = input.trim();
    if (t && !value.includes(t)) onChange([...value, t]);
    setInput("");
  };
  return (
    <div>
      <div className="flex gap-2 mb-2 flex-wrap">
        {value.map((t, i) => (
          <Badge key={i} variant="secondary" className="gap-1">
            {t}
            <button onClick={() => onChange(value.filter((_, j) => j !== i))}><X className="w-3 h-3" /></button>
          </Badge>
        ))}
      </div>
      <div className="flex gap-2">
        <Input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); add(); } }} placeholder={placeholder} />
        <Button type="button" variant="outline" size="sm" onClick={add}>+</Button>
      </div>
    </div>
  );
};

const SignedImg = ({ path, className, alt }: { path: string | null; className?: string; alt?: string }) => {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => { signedUrl(path).then(setUrl); }, [path]);
  if (!url) return <div className={`bg-muted ${className}`} />;
  return <img src={url} className={className} alt={alt || ""} loading="lazy" />;
};

const Cases = () => {
  const [filter, setFilter] = useState("all");
  const [cases, setCases] = useState<CaseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<CaseItem> | null>(null);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const coverRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const fetchCases = async () => {
    const { data } = await supabase.from("cases").select("*").order("sort_order");
    if (data) setCases(data as any as CaseItem[]);
    setLoading(false);
  };
  useEffect(() => { fetchCases(); }, []);

  const filtered = filter === "all" ? cases : cases.filter(c => c.category === filter);
  const sorted = [...filtered].sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0) || a.sort_order - b.sort_order);

  const openNew = () => setEditing({ ...empty, sort_order: cases.length + 1 });
  const openEdit = (c: CaseItem) => setEditing({ ...c });

  const handleSave = async () => {
    if (!editing?.title) return;
    setSaving(true);
    const payload: any = {
      title: editing.title,
      subtitle: editing.subtitle || "",
      client: editing.client || null,
      category: editing.category || "telegram_bot",
      task: editing.task || null,
      solution: editing.solution || null,
      features: editing.features || [],
      technologies: editing.technologies || [],
      result: editing.result || "",
      budget: editing.budget || null,
      price: editing.budget ? formatBudget(editing.budget) : (editing.price || ""),
      cover_image: editing.cover_image || null,
      gallery: editing.gallery || [],
      tags: editing.tags || [],
      featured: !!editing.featured,
      link: editing.link || null,
      sort_order: editing.sort_order || 0,
      description: editing.task || editing.solution || "",
    };
    if (editing.id) {
      const { error } = await supabase.from("cases").update(payload).eq("id", editing.id);
      if (error) toast({ title: "Ошибка", description: error.message, variant: "destructive" });
      else toast({ title: "Кейс обновлён" });
    } else {
      const { error } = await supabase.from("cases").insert(payload);
      if (error) toast({ title: "Ошибка", description: error.message, variant: "destructive" });
      else toast({ title: "Кейс добавлен" });
    }
    setSaving(false);
    setEditing(null);
    fetchCases();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Удалить кейс?")) return;
    await supabase.from("cases").delete().eq("id", id);
    toast({ title: "Удалён" });
    fetchCases();
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f || !editing) return;
    try {
      const path = await uploadFile(f);
      setEditing({ ...editing, cover_image: path });
    } catch (err: any) {
      toast({ title: "Ошибка загрузки", description: err.message, variant: "destructive" });
    }
  };

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length || !editing) return;
    try {
      const paths = await Promise.all(files.map(uploadFile));
      setEditing({ ...editing, gallery: [...(editing.gallery || []), ...paths] });
    } catch (err: any) {
      toast({ title: "Ошибка загрузки", description: err.message, variant: "destructive" });
    }
  };

  const moveGallery = (from: number, to: number) => {
    if (!editing) return;
    const g = [...(editing.gallery || [])];
    const [x] = g.splice(from, 1);
    g.splice(to, 0, x);
    setEditing({ ...editing, gallery: g });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Кейсы</h1>
          <p className="text-sm text-muted-foreground">Портфолио проектов</p>
        </div>
        <div className="flex gap-2">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все категории</SelectItem>
              {CATEGORIES.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button onClick={openNew} size="sm"><Plus className="w-4 h-4 mr-1" /> Добавить</Button>
        </div>
      </div>

      {loading ? <p className="text-muted-foreground text-sm">Загрузка...</p> : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sorted.map(c => (
            <Card key={c.id} className="overflow-hidden">
              <div className="aspect-video bg-muted relative">
                {c.cover_image ? <SignedImg path={c.cover_image} className="w-full h-full object-cover" alt={c.title} /> : <div className="w-full h-full flex items-center justify-center text-muted-foreground"><ImageIcon className="w-8 h-8" /></div>}
                {c.featured && <Badge className="absolute top-2 left-2 bg-yellow-500 text-black"><Star className="w-3 h-3 mr-1 fill-current" />Рекомендуемый</Badge>}
              </div>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <CardTitle className="text-base truncate">{c.title}</CardTitle>
                    <p className="text-xs text-muted-foreground line-clamp-1">{c.subtitle}</p>
                    {c.client && <p className="text-xs text-primary mt-1">👤 {c.client}</p>}
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button onClick={() => openEdit(c)} className="p-1.5 hover:bg-accent rounded"><Pencil className="w-3.5 h-3.5" /></button>
                    <button onClick={() => handleDelete(c.id)} className="p-1.5 hover:bg-accent rounded"><Trash2 className="w-3.5 h-3.5 text-destructive" /></button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex flex-wrap gap-1">
                  <Badge variant="outline" className="text-xs">{categoryLabel(c.category)}</Badge>
                  {c.tags.slice(0, 3).map(t => <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>)}
                </div>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-sm font-bold text-primary">{formatBudget(c.budget, c.price)}</span>
                  {c.link && <a href={c.link} target="_blank" rel="noopener noreferrer" className="text-xs text-primary inline-flex items-center gap-1"><ExternalLink className="w-3 h-3" />Ссылка</a>}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!editing} onOpenChange={() => setEditing(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing?.id ? "Редактировать кейс" : "Новый кейс"}</DialogTitle></DialogHeader>
          {editing && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30">
                <Switch id="featured" checked={!!editing.featured} onCheckedChange={v => setEditing({ ...editing, featured: v })} />
                <Label htmlFor="featured" className="cursor-pointer flex items-center gap-2"><Star className="w-4 h-4" />Рекомендуемый кейс</Label>
              </div>

              <div>
                <Label>Обложка</Label>
                <div className="mt-1 flex items-center gap-3">
                  {editing.cover_image ? (
                    <div className="relative">
                      <SignedImg path={editing.cover_image} className="w-32 h-20 object-cover rounded border" />
                      <button onClick={() => setEditing({ ...editing, cover_image: null })} className="absolute -top-2 -right-2 bg-destructive text-white rounded-full p-0.5"><X className="w-3 h-3" /></button>
                    </div>
                  ) : <div className="w-32 h-20 rounded border border-dashed flex items-center justify-center text-muted-foreground"><ImageIcon className="w-6 h-6" /></div>}
                  <Button type="button" variant="outline" size="sm" onClick={() => coverRef.current?.click()}><Upload className="w-4 h-4 mr-1" />Загрузить</Button>
                  <input ref={coverRef} type="file" accept="image/*" className="hidden" onChange={handleCoverUpload} />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <div><Label>Название проекта *</Label><Input value={editing.title || ""} onChange={e => setEditing({ ...editing, title: e.target.value })} /></div>
                <div><Label>Клиент</Label><Input value={editing.client || ""} onChange={e => setEditing({ ...editing, client: e.target.value })} placeholder="Имя клиента или компания" /></div>
              </div>
              <div><Label>Подзаголовок</Label><Input value={editing.subtitle || ""} onChange={e => setEditing({ ...editing, subtitle: e.target.value })} placeholder="Краткое описание (1–2 строки)" /></div>

              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <Label>Категория</Label>
                  <Select value={editing.category || "telegram_bot"} onValueChange={v => setEditing({ ...editing, category: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{CATEGORIES.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><Label>Стоимость разработки (₽)</Label><Input type="number" value={editing.budget ?? ""} onChange={e => setEditing({ ...editing, budget: e.target.value ? Number(e.target.value) : null })} placeholder="150000" /></div>
              </div>

              <div><Label>Задача клиента</Label><Textarea rows={3} value={editing.task || ""} onChange={e => setEditing({ ...editing, task: e.target.value })} placeholder="Исходная проблема или запрос" /></div>
              <div><Label>Решение</Label><Textarea rows={4} value={editing.solution || ""} onChange={e => setEditing({ ...editing, solution: e.target.value })} placeholder="Что было реализовано" /></div>

              <div>
                <Label>Основной функционал</Label>
                <TagInput value={editing.features || []} onChange={v => setEditing({ ...editing, features: v })} placeholder="Например: Telegram Bot" />
              </div>
              <div>
                <Label>Используемые технологии</Label>
                <TagInput value={editing.technologies || []} onChange={v => setEditing({ ...editing, technologies: v })} placeholder="Например: Supabase" />
              </div>

              <div><Label>Результат</Label><Textarea rows={3} value={editing.result || ""} onChange={e => setEditing({ ...editing, result: e.target.value })} placeholder="Что автоматизировано, какая ценность" /></div>

              <div>
                <Label>Галерея проекта</Label>
                <div className="mt-2 grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {(editing.gallery || []).map((path, i) => (
                    <div key={i} className="relative group aspect-square rounded border overflow-hidden">
                      <SignedImg path={path} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                        {i > 0 && <button onClick={() => moveGallery(i, i - 1)} className="text-white text-xs px-1.5 py-0.5 bg-white/20 rounded">←</button>}
                        <button onClick={() => setEditing({ ...editing, gallery: (editing.gallery || []).filter((_, j) => j !== i) })} className="text-white p-1 bg-destructive/80 rounded"><X className="w-3 h-3" /></button>
                        {i < (editing.gallery?.length || 0) - 1 && <button onClick={() => moveGallery(i, i + 1)} className="text-white text-xs px-1.5 py-0.5 bg-white/20 rounded">→</button>}
                      </div>
                    </div>
                  ))}
                  <button onClick={() => fileRef.current?.click()} className="aspect-square rounded border border-dashed flex items-center justify-center text-muted-foreground hover:bg-accent">
                    <Upload className="w-5 h-5" />
                  </button>
                </div>
                <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={handleGalleryUpload} />
              </div>

              <div>
                <Label>Теги (для фильтрации)</Label>
                <TagInput value={editing.tags || []} onChange={v => setEditing({ ...editing, tags: v })} placeholder="Например: AI" />
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <div><Label>Ссылка</Label><Input value={editing.link || ""} onChange={e => setEditing({ ...editing, link: e.target.value })} placeholder="https://..." /></div>
                <div><Label>Порядок сортировки</Label><Input type="number" value={editing.sort_order ?? 0} onChange={e => setEditing({ ...editing, sort_order: Number(e.target.value) })} /></div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setEditing(null)}>Отмена</Button>
                <Button onClick={handleSave} disabled={saving || !editing.title}>{saving ? "Сохранение..." : "Сохранить"}</Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Cases;
