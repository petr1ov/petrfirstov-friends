import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CreditCard, Smartphone, Server, ChevronRight, Rocket, Calculator, ExternalLink } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";

type Case = {
  id: string;
  title: string;
  subtitle: string;
  price: string;
  category: string;
  description: string;
  features: string[];
  result: string;
  link?: string | null;
};

type CategoryDef = {
  key: string;
  icon: React.ElementType;
  name: string;
  price: string;
  gradient: string;
};

const categoryDefs: CategoryDef[] = [
  { key: "ai_cards", icon: CreditCard, name: "AI-визитки", price: "от 10 000 ₽", gradient: "from-miniapp-purple to-pink-500" },
  { key: "apps", icon: Smartphone, name: "Приложения", price: "от 30 000 ₽", gradient: "from-miniapp-blue to-cyan-400" },
  { key: "services", icon: Server, name: "Сервисы", price: "от 60 000 ₽", gradient: "from-miniapp-neon to-emerald-400" },
];

const ProductsCasesSection = () => {
  const [activeCategory, setActiveCategory] = useState<number | null>(null);
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const [cases, setCases] = useState<Case[]>([]);

  useEffect(() => {
    supabase.from("cases").select("*").order("sort_order").then(({ data }) => {
      if (data) setCases(data as Case[]);
    });
  }, []);

  const getCasesForCategory = (key: string) => cases.filter(c => c.category === key);

  const handleCTA = (action: string) => {
    const tgLink = action === "calculate"
      ? "https://t.me/PetrFirstovBot?start=src_calculate"
      : "https://t.me/PetrFirstovBot?start=src_want_same";
    window.open(tgLink, "_blank");
  };

  return (
    <section className="py-16 px-4" id="cases">
      <div className="max-w-lg mx-auto">
        <motion.h2 initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-2xl font-bold text-center mb-2">
          Продукты и кейсы
        </motion.h2>
        <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-miniapp-muted text-sm text-center mb-8">
          Выберите категорию — покажем реальные проекты
        </motion.p>

        <div className="grid grid-cols-3 gap-3 mb-6">
          {categoryDefs.map((cat, i) => (
            <motion.button
              key={i}
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              onClick={() => setActiveCategory(activeCategory === i ? null : i)}
              className={`relative p-4 rounded-2xl border text-center transition-all ${
                activeCategory === i
                  ? "bg-gradient-to-b border-white/20 shadow-lg shadow-white/5"
                  : "bg-white/[0.03] border-white/[0.06] hover:border-white/[0.12]"
              }`}
              style={activeCategory === i ? { background: `linear-gradient(to bottom, hsl(var(--miniapp-purple) / 0.15), transparent)` } : undefined}
            >
              <div className={`w-10 h-10 rounded-xl mx-auto mb-2 flex items-center justify-center bg-gradient-to-br ${cat.gradient}`}>
                <cat.icon className="w-5 h-5 text-white" />
              </div>
              <p className="font-semibold text-xs mb-0.5">{cat.name}</p>
              <p className="text-[10px] text-miniapp-neon font-bold">{cat.price}</p>
            </motion.button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {activeCategory !== null && (
            <motion.div key={activeCategory} initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }} className="overflow-hidden">
              <div className="space-y-3">
                {getCasesForCategory(categoryDefs[activeCategory].key).map((c, j) => (
                  <motion.div key={c.id} initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: j * 0.1 }} onClick={() => setSelectedCase(c)} className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] cursor-pointer hover:border-white/[0.15] transition-all group">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-semibold text-sm">{c.title}</p>
                        <p className="text-xs text-miniapp-muted">{c.subtitle}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-miniapp-muted group-hover:text-white transition-colors" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-miniapp-neon">{c.price}</span>
                      <span className="text-[10px] text-miniapp-muted">Подробнее →</span>
                    </div>
                  </motion.div>
                ))}
                {getCasesForCategory(categoryDefs[activeCategory].key).length === 0 && (
                  <p className="text-center text-miniapp-muted text-sm py-4">Кейсы скоро появятся</p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <Dialog open={!!selectedCase} onOpenChange={() => setSelectedCase(null)}>
          <DialogContent className="bg-[hsl(var(--miniapp-bg))] border-white/10 text-[hsl(var(--miniapp-fg))] max-w-md mx-4 max-h-[85vh] overflow-y-auto">
            {selectedCase && (
              <>
                <DialogHeader>
                  <DialogTitle className="text-lg">{selectedCase.title}</DialogTitle>
                  <DialogDescription className="text-miniapp-muted text-sm">
                    {selectedCase.subtitle} · <span className="text-miniapp-neon font-semibold">{selectedCase.price}</span>
                  </DialogDescription>
                </DialogHeader>
                <p className="text-sm text-miniapp-muted leading-relaxed">{selectedCase.description}</p>
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-miniapp-muted uppercase tracking-wider">Что входит</p>
                  {selectedCase.features.map((f, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <div className="w-1.5 h-1.5 rounded-full bg-miniapp-purple shrink-0" />
                      {f}
                    </div>
                  ))}
                </div>
                {selectedCase.link && (
                  <a href={selectedCase.link} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/[0.06] border border-white/[0.1] text-white text-sm font-semibold hover:bg-white/[0.1] transition-colors">
                    <ExternalLink className="w-4 h-4" /> Посмотреть кейс
                  </a>
                )}
                <div className="p-3 rounded-xl bg-miniapp-neon/5 border border-miniapp-neon/10">
                  <p className="text-xs text-miniapp-neon">✨ {selectedCase.result}</p>
                </div>
                <div className="flex gap-2 pt-2">
                  <button onClick={() => handleCTA("calculate")} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-gradient-to-r from-miniapp-purple to-miniapp-blue text-white text-sm font-semibold">
                    <Calculator className="w-4 h-4" /> Рассчитать проект
                  </button>
                  <button onClick={() => handleCTA("want_same")} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-miniapp-neon/10 border border-miniapp-neon/20 text-miniapp-neon text-sm font-semibold">
                    <Rocket className="w-4 h-4" /> Хочу такой же
                  </button>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
};

export default ProductsCasesSection;
