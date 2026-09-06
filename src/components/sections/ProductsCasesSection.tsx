import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, ArrowRight, CheckCircle2, Layers, X, Calculator, Rocket, Briefcase, ExternalLink } from "lucide-react";
import { CASE_STUDIES } from "../../data/casesData";
import { CaseStudy } from "../../types";
import BotFunnelCTA from "./BotFunnelCTA";

const categoryLabels: Record<string, string> = {
  telegram_bot: "Telegram Bot",
  ai: "AI",
  crm: "CRM",
  mini_app: "Mini App",
  pwa: "PWA",
  website: "Сайт",
  automation: "Автоматизация",
  ai_cards: "AI-визитки",
  apps: "Приложения",
  services: "Сервисы",
};

const formatBudget = (n: number | null | undefined, fallback: string | null | undefined) =>
  n ? new Intl.NumberFormat("ru-RU").format(n) + " ₽" : fallback || "";

const ProductsCasesSection = () => {
  const [activeTag, setActiveTag] = useState<string>("all");
  const [selected, setSelected] = useState<CaseStudy | null>(null);

  const allTags = Array.from(new Set(CASE_STUDIES.flatMap((c) => c.tags || []))).filter(Boolean);
  const filtered = activeTag === "all" ? CASE_STUDIES : CASE_STUDIES.filter((c) => c.tags?.includes(activeTag));
  const sorted = [...filtered].sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));

  return (
    <section className="py-16 px-4 relative" id="cases" aria-labelledby="cases-title">
      <div className="max-w-4xl mx-auto">
        <p className="text-xs uppercase tracking-[0.2em] text-slate-400 text-center mb-3 font-medium">
          Кейсы и внедрения
        </p>

        <motion.h2
          id="cases-title"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="font-display text-3xl sm:text-4xl font-bold text-center mb-3 text-balance text-white"
        >
          Портфолио
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-slate-300 text-sm sm:text-base text-center mb-8 font-normal"
        >
          Реальные проекты: задача клиента → решение → результат
        </motion.p>

        {/* Tag filters */}
        {allTags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-8 justify-center" role="tablist" aria-label="Фильтр по тегам">
            <button
              type="button"
              onClick={() => setActiveTag("all")}
              className={`px-3 sm:px-3.5 py-1.5 rounded-full text-xs font-medium transition-all focus-ring ${
                activeTag === "all"
                  ? "bg-gradient-to-r from-purple-600 to-sky-500 text-white shadow-md shadow-purple-600/30 font-semibold"
                  : "glass-card text-slate-300 hover:border-white/20 hover:text-white"
              }`}
            >
              Все
            </button>
            {allTags.map((tag) => (
              <button
                type="button"
                key={tag}
                onClick={() => setActiveTag(tag)}
                className={`px-3 sm:px-3.5 py-1.5 rounded-full text-xs font-medium transition-all focus-ring ${
                  activeTag === tag
                    ? "bg-gradient-to-r from-purple-600 to-sky-500 text-white shadow-md shadow-purple-600/30 font-semibold"
                    : "glass-card text-slate-300 hover:border-white/20 hover:text-white"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        )}

        {/* Cards Grid */}
        <div className="grid gap-4 sm:grid-cols-2">
          {sorted.map((c, i) => (
            <motion.div
              key={c.id}
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              onClick={() => setSelected(c)}
              className="text-left rounded-2xl glass-card overflow-hidden hover:border-sky-400/40 transition-all group focus-ring cursor-pointer border border-white/10 flex flex-col justify-between shadow-lg hover:shadow-sky-950/20"
            >
              <div className="p-5 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-sky-300 font-medium">
                    {categoryLabels[c.category] || c.category}
                  </span>
                  {c.featured && (
                    <span className="px-2 py-0.5 rounded-full bg-amber-400/20 border border-amber-400/30 text-amber-300 text-[10px] font-bold flex items-center gap-1">
                      <Star className="w-3 h-3 fill-current" />
                      Рекомендуем
                    </span>
                  )}
                </div>

                <h3 className="font-display font-bold text-base sm:text-lg text-white group-hover:text-sky-300 transition-colors line-clamp-2">
                  {c.title}
                </h3>

                <p className="text-xs sm:text-sm text-slate-300 font-normal line-clamp-2 leading-relaxed">
                  {c.subtitle}
                </p>

                {c.client && (
                  <p className="text-xs text-slate-400 flex items-center gap-1.5 pt-1">
                    <Briefcase className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span className="truncate">{c.client}</span>
                  </p>
                )}
              </div>

              <div className="px-5 py-3.5 bg-white/[0.03] border-t border-white/10 flex items-center justify-between mt-auto">
                <span className="text-xs font-bold text-emerald-400 font-mono">
                  {formatBudget(c.budget, c.price)}
                </span>
                <span className="text-xs text-slate-300 group-hover:text-white inline-flex items-center gap-1 font-medium">
                  Подробнее <ArrowRight className="w-3.5 h-3.5 text-sky-400 group-hover:translate-x-0.5 transition-transform" />
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Case Detail Modal */}
        <AnimatePresence>
          {selected && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-slate-900 border border-white/15 text-slate-100 max-w-2xl w-full max-h-[88vh] overflow-y-auto rounded-2xl shadow-2xl p-4 sm:p-6 relative space-y-4 sm:space-y-6"
              >
                <button
                  type="button"
                  onClick={() => setSelected(null)}
                  className="absolute top-3 right-3 sm:top-4 sm:right-4 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors focus-ring z-10"
                  aria-label="Закрыть"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="space-y-2 pr-8">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30">
                      {categoryLabels[selected.category] || selected.category}
                    </span>
                    {selected.featured && (
                      <span className="px-2.5 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-bold flex items-center gap-1">
                        <Star className="w-3 h-3 fill-current" /> Рекомендуем
                      </span>
                    )}
                  </div>
                  <h3 className="font-display text-xl sm:text-2xl font-bold text-white">
                    {selected.title}
                  </h3>
                  <p className="text-sm text-slate-300">{selected.subtitle}</p>
                </div>

                {/* Metadata */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  {selected.client && (
                    <div className="glass-card rounded-xl p-3 border border-white/10">
                      <p className="text-[10px] uppercase tracking-wider text-slate-400 mb-1">Клиент</p>
                      <p className="font-semibold text-white">{selected.client}</p>
                    </div>
                  )}
                  <div className="glass-card rounded-xl p-3 border border-white/10">
                    <p className="text-[10px] uppercase tracking-wider text-slate-400 mb-1">Категория</p>
                    <p className="font-semibold text-white">
                      {categoryLabels[selected.category] || selected.category}
                    </p>
                  </div>
                  {(selected.budget || selected.price) && (
                    <div className="glass-card rounded-xl p-3 border border-white/10">
                      <p className="text-[10px] uppercase tracking-wider text-slate-400 mb-1">Бюджет</p>
                      <p className="font-bold text-emerald-400 font-mono">
                        {formatBudget(selected.budget, selected.price)}
                      </p>
                    </div>
                  )}
                </div>

                {/* Deliverables */}
                {selected.deliverables && selected.deliverables.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs uppercase tracking-wider text-slate-400 font-bold flex items-center gap-1.5">
                      <span>⚙️</span>
                      <span>Основной функционал и решение</span>
                    </p>
                    <div className="grid sm:grid-cols-2 gap-2">
                      {selected.deliverables.map((d, i) => (
                        <div key={i} className="flex items-start gap-2 text-xs text-slate-200">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{d}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Stack */}
                {selected.stack && selected.stack.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs uppercase tracking-wider text-slate-400 font-bold flex items-center gap-1.5">
                      <span>🧩</span>
                      <span>Технологии</span>
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {selected.stack.map((t, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-slate-300 inline-flex items-center gap-1"
                        >
                          <Layers className="w-3 h-3 text-purple-400" />
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Metrics */}
                {selected.metrics && (
                  <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-500/10 to-sky-500/10 border border-emerald-500/20">
                    <p className="text-[10px] uppercase tracking-wider text-emerald-400 mb-1 font-bold">
                      ✨ Результат
                    </p>
                    <p className="text-xs sm:text-sm text-white font-medium leading-relaxed">
                      {selected.metrics}
                    </p>
                  </div>
                )}

                {/* Tags */}
                {selected.tags && selected.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {selected.tags.map((t) => (
                      <span key={t} className="text-[11px] px-2.5 py-0.5 rounded-full bg-white/5 text-slate-400">
                        #{t}
                      </span>
                    ))}
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-2.5 pt-3 border-t border-white/10">
                  <a
                    href="https://t.me/PetrFirstovBot?start=hot_calculator"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-sky-500 text-white text-xs sm:text-sm font-semibold shadow-lg shadow-purple-600/30 hover:scale-[1.01] transition-transform"
                  >
                    <Calculator className="w-4 h-4" />
                    <span>Рассчитать проект</span>
                  </a>
                  <a
                    href={`https://t.me/PetrFirstovBot?start=hot_case_${selected.id.slice(0, 8)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs sm:text-sm font-semibold hover:bg-emerald-500/25 transition-colors"
                  >
                    <Rocket className="w-4 h-4" />
                    <span>Хочу такой же</span>
                  </a>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

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

export default ProductsCasesSection;
