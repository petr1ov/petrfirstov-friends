import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, ExternalLink, Rocket, Calculator, ArrowRight, CheckCircle2, Layers, ImageIcon, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import CaseLeadDialog, { LeadMode } from "./CaseLeadDialog";

type Case = {
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
};

const categoryLabels: Record<string, string> = {
  telegram_bot: "Telegram Bot", ai: "AI", crm: "CRM", mini_app: "Mini App",
  pwa: "PWA", website: "Сайт", automation: "Автоматизация",
  ai_cards: "AI-визитки", apps: "Приложения", services: "Сервисы",
};

const formatBudget = (n: number | null, fallback: string | null) =>
  n ? new Intl.NumberFormat("ru-RU").format(n) + " ₽" : fallback || "";

// Signed URL cache
const urlCache = new Map<string, string>();
const useSignedUrl = (path: string | null) => {
  const [url, setUrl] = useState<string | null>(path && urlCache.get(path) || null);
  useEffect(() => {
    if (!path) { setUrl(null); return; }
    if (path.startsWith("http")) { setUrl(path); return; }
    if (urlCache.has(path)) { setUrl(urlCache.get(path)!); return; }
    supabase.storage.from("case-gallery").createSignedUrl(path, 60 * 60 * 24 * 7).then(({ data }) => {
      if (data?.signedUrl) { urlCache.set(path, data.signedUrl); setUrl(data.signedUrl); }
    });
  }, [path]);
  return url;
};

const SignedImg = ({ path, className, alt }: { path: string | null; className?: string; alt?: string }) => {
  const url = useSignedUrl(path);
  if (!url) return <div className={`bg-white/5 flex items-center justify-center ${className}`}><ImageIcon className="w-6 h-6 text-white/30" /></div>;
  return <img src={url} className={className} alt={alt || ""} loading="lazy" />;
};

const ProductsCasesSection = () => {
  const [cases, setCases] = useState<Case[]>([]);
  const [activeTag, setActiveTag] = useState<string>("all");
  const [selected, setSelected] = useState<Case | null>(null);
  const [leadMode, setLeadMode] = useState<LeadMode | null>(null);
  const [leadCase, setLeadCase] = useState<Case | null>(null);

  useEffect(() => {
    supabase.from("cases").select("*").order("sort_order").then(({ data }) => {
      if (data) setCases(data as any as Case[]);
    });
  }, []);

  const allTags = Array.from(new Set(cases.flatMap(c => c.tags || []))).filter(Boolean);
  const filtered = activeTag === "all" ? cases : cases.filter(c => c.tags?.includes(activeTag));
  const sorted = [...filtered].sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));

  const handleCTA = (action: string, c: Case) => {
    setLeadCase(c);
    setLeadMode(action === "calculate" ? "calculate" : "want_same");
  };

  return (
    <section className="py-16 px-4" id="cases" aria-labelledby="cases-title">
      <div className="max-w-3xl mx-auto">
        <motion.h2 id="cases-title" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="font-display text-3xl sm:text-4xl font-bold text-center mb-3 text-balance">
          Портфолио
        </motion.h2>
        <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-miniapp-foreground/65 text-sm sm:text-base text-center mb-8">
          Реальные проекты: задача клиента → решение → результат
        </motion.p>

        {allTags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6 justify-center" role="tablist" aria-label="Фильтр по тегам">
            <button onClick={() => setActiveTag("all")} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all focus-ring ${activeTag === "all" ? "bg-gradient-to-r from-miniapp-purple to-miniapp-blue text-white" : "glass-card hover:border-white/20"}`}>
              Все
            </button>
            {allTags.map(tag => (
              <button key={tag} onClick={() => setActiveTag(tag)} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all focus-ring ${activeTag === tag ? "bg-gradient-to-r from-miniapp-purple to-miniapp-blue text-white" : "glass-card hover:border-white/20"}`}>
                {tag}
              </button>
            ))}
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          {sorted.map((c, i) => (
            <motion.button
              type="button"
              key={c.id}
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              onClick={() => setSelected(c)}
              className="text-left rounded-2xl glass-card overflow-hidden hover:border-white/20 transition-all group focus-ring"
            >
              <div className="aspect-square relative overflow-hidden">
                <SignedImg path={c.cover_image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={c.title} />
                {c.featured && (
                  <div className="absolute top-2 left-2 px-2 py-1 rounded-full bg-yellow-500/90 text-black text-[10px] font-bold flex items-center gap-1 z-10">
                    <Star className="w-3 h-3 fill-current" />Рекомендуем
                  </div>
                )}
                <div className="absolute top-2 right-2 px-2 py-1 rounded-full bg-black/60 backdrop-blur text-[10px] text-white z-10">
                  {categoryLabels[c.category] || c.category}
                </div>
                <div className="absolute inset-x-0 bottom-0 p-3 bg-black/25 backdrop-blur-md border-t border-white/10">
                  <p className="font-display font-semibold text-sm sm:text-base text-white line-clamp-1">{c.title}</p>
                  {c.subtitle && <p className="text-[11px] text-white/75 line-clamp-1 mt-0.5">{c.subtitle}</p>}
                  <div className="flex items-center justify-between mt-1.5">
                    <span className="text-[11px] font-bold text-miniapp-neon">{formatBudget(c.budget, c.price)}</span>
                    <span className="text-[10px] text-white/70 inline-flex items-center gap-1">Подробнее <ArrowRight className="w-3 h-3" /></span>
                  </div>
                </div>
              </div>
            </motion.button>
          ))}
          {sorted.length === 0 && (
            <p className="text-center text-miniapp-foreground/60 text-sm py-8 col-span-full">Кейсы скоро появятся</p>
          )}
        </div>

        <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
          <DialogContent className="bg-[hsl(var(--miniapp-bg))] border-white/10 text-[hsl(var(--miniapp-fg))] max-w-2xl mx-4 max-h-[90vh] overflow-y-auto p-0">
            {selected && <CaseView c={selected} onCTA={(a) => handleCTA(a, selected)} />}
          </DialogContent>
        </Dialog>

        <CaseLeadDialog
          open={leadMode !== null}
          onOpenChange={(o) => !o && setLeadMode(null)}
          mode={leadMode ?? "calculate"}
          caseTitle={leadCase?.title}
          caseBudget={leadCase ? formatBudget(leadCase.budget, leadCase.price) : null}
        />

        <BotFunnelCTA
          temp="hot"
          block="cases"
          label="Хочу такой же проект"
          hint="Назовите задачу — сразу получите вилку цены и срок"
          variant="solid"
        />
      </div>

    </section>
  );
};

const CaseView = ({ c, onCTA }: { c: Case; onCTA: (a: string) => void }) => {
  const [lightbox, setLightbox] = useState<number | null>(null);
  return (
    <div>
      {/* Cover */}
      <div className="aspect-video w-full relative overflow-hidden rounded-t-lg">
        <SignedImg path={c.cover_image} className="w-full h-full object-cover" alt={c.title} />
        {c.featured && (
          <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-yellow-500/90 text-black text-xs font-bold flex items-center gap-1">
            <Star className="w-3 h-3 fill-current" />Рекомендуем
          </div>
        )}
      </div>

      <div className="p-6 space-y-6">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl text-balance">{c.title}</DialogTitle>
          {c.subtitle && <p className="text-sm text-miniapp-foreground/70 mt-1">{c.subtitle}</p>}
        </DialogHeader>

        {/* Meta */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
          {c.client && (
            <div className="glass-card rounded-xl p-3">
              <p className="text-[10px] uppercase tracking-wider text-miniapp-foreground/50 mb-1">Клиент</p>
              <p className="font-medium">{c.client}</p>
            </div>
          )}
          <div className="glass-card rounded-xl p-3">
            <p className="text-[10px] uppercase tracking-wider text-miniapp-foreground/50 mb-1">Категория</p>
            <p className="font-medium">{categoryLabels[c.category] || c.category}</p>
          </div>
          {(c.budget || c.price) && (
            <div className="glass-card rounded-xl p-3">
              <p className="text-[10px] uppercase tracking-wider text-miniapp-foreground/50 mb-1">Бюджет</p>
              <p className="font-bold text-miniapp-neon">{formatBudget(c.budget, c.price)}</p>
            </div>
          )}
        </div>

        {c.task && (
          <Block title="Задача клиента" emoji="🎯">
            <p className="text-sm text-miniapp-foreground/80 leading-relaxed whitespace-pre-line">{c.task}</p>
          </Block>
        )}

        {c.solution && (
          <Block title="Решение" emoji="💡">
            <p className="text-sm text-miniapp-foreground/80 leading-relaxed whitespace-pre-line">{c.solution}</p>
          </Block>
        )}

        {c.features?.length > 0 && (
          <Block title="Основной функционал" emoji="⚙️">
            <div className="grid sm:grid-cols-2 gap-2">
              {c.features.map((f, i) => (
                <div key={i} className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-miniapp-neon shrink-0 mt-0.5" />
                  <span>{f}</span>
                </div>
              ))}
            </div>
          </Block>
        )}

        {c.technologies?.length > 0 && (
          <Block title="Технологии" emoji="🧩">
            <div className="flex flex-wrap gap-2">
              {c.technologies.map((t, i) => (
                <span key={i} className="px-2.5 py-1 rounded-full glass-card text-xs font-medium inline-flex items-center gap-1">
                  <Layers className="w-3 h-3 text-miniapp-purple" />{t}
                </span>
              ))}
            </div>
          </Block>
        )}

        {c.result && (
          <div className="p-4 rounded-xl bg-gradient-to-br from-miniapp-neon/10 to-miniapp-blue/10 border border-miniapp-neon/20">
            <p className="text-[10px] uppercase tracking-wider text-miniapp-neon mb-2 font-bold">✨ Результат</p>
            <p className="text-sm leading-relaxed whitespace-pre-line">{c.result}</p>
          </div>
        )}

        {c.gallery?.length > 0 && (
          <Block title="Галерея" emoji="🖼">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {c.gallery.map((path, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setLightbox(i)}
                  className="aspect-square rounded-lg overflow-hidden glass-card focus-ring group"
                  aria-label={`Открыть изображение ${i + 1}`}
                >
                  <SignedImg path={path} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                </button>
              ))}
            </div>
            <Dialog open={lightbox !== null} onOpenChange={(o) => !o && setLightbox(null)}>
              <DialogContent className="bg-black/95 border-white/10 max-w-5xl w-[95vw] p-0 overflow-hidden">
                {lightbox !== null && (
                  <div className="relative">
                    <button
                      onClick={() => setLightbox(null)}
                      className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-black/60 hover:bg-black/80 flex items-center justify-center text-white"
                      aria-label="Закрыть"
                    >
                      <X className="w-5 h-5" />
                    </button>
                    <LightboxImg path={c.gallery[lightbox]} />
                    {c.gallery.length > 1 && (
                      <>
                        <button
                          onClick={() => setLightbox((lightbox - 1 + c.gallery.length) % c.gallery.length)}
                          className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 hover:bg-black/80 flex items-center justify-center text-white text-xl"
                          aria-label="Предыдущее"
                        >‹</button>
                        <button
                          onClick={() => setLightbox((lightbox + 1) % c.gallery.length)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 hover:bg-black/80 flex items-center justify-center text-white text-xl"
                          aria-label="Следующее"
                        >›</button>
                        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-black/60 text-white text-xs">
                          {lightbox + 1} / {c.gallery.length}
                        </div>
                      </>
                    )}
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </Block>
        )}

        {c.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {c.tags.map(t => <span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-miniapp-foreground/70">#{t}</span>)}
          </div>
        )}

        {c.link && (
          <a href={c.link} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 py-3 rounded-xl glass-card hover:border-white/20 text-sm font-semibold transition-all">
            <ExternalLink className="w-4 h-4" /> Посмотреть проект
          </a>
        )}

        <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-white/10">
          <button onClick={() => onCTA("calculate")} className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-xl bg-gradient-to-r from-miniapp-purple to-miniapp-blue text-white text-sm font-semibold">
            <Calculator className="w-4 h-4" /> Рассчитать проект
          </button>
          <button onClick={() => onCTA("want_same")} className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-xl bg-miniapp-neon/10 border border-miniapp-neon/30 text-miniapp-neon text-sm font-semibold">
            <Rocket className="w-4 h-4" /> Хочу такой же
          </button>
        </div>
      </div>
    </div>
  );
};

const LightboxImg = ({ path }: { path: string | null }) => {
  const url = useSignedUrl(path);
  if (!url) return <div className="w-full h-[70vh] flex items-center justify-center"><ImageIcon className="w-10 h-10 text-white/30" /></div>;
  return <img src={url} className="w-full max-h-[85vh] object-contain" alt="" />;
};

const Block = ({ title, emoji, children }: { title: string; emoji: string; children: React.ReactNode }) => (
  <div>
    <p className="text-[10px] uppercase tracking-wider text-miniapp-foreground/50 mb-2 font-bold">{emoji} {title}</p>
    {children}
  </div>
);

export default ProductsCasesSection;
