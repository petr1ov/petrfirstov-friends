import { motion } from "framer-motion";
import { AlertCircle, Lightbulb, Sparkles } from "lucide-react";
import BotFunnelCTA from "./BotFunnelCTA";

const ideas = [
  "Новый сервис",
  "Приложение",
  "Бот",
  "Сайт",
  "Автоматизация",
  "Новый продукт",
];

const blockers = [
  "нужен программист",
  "нужен дизайнер",
  "нужно разобраться в технологиях",
  "нужно поставить задачу",
  "нужно контролировать разработку",
  "нужны деньги и время",
];

const RecognizeSection = () => (
  <section className="py-16 px-4 relative overflow-hidden" id="recognize" aria-labelledby="recognize-title">
    <div className="max-w-3xl mx-auto">
      <p className="text-xs uppercase tracking-[0.2em] text-slate-400 text-center mb-3 font-medium">
        Узнаёшь себя?
      </p>

      <motion.h2
        id="recognize-title"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="font-display text-2xl sm:text-4xl font-bold text-center mb-6 text-balance text-white"
      >
        У тебя постоянно появляются идеи
      </motion.h2>

      {/* Ideas chips */}
      <div className="flex flex-wrap justify-center gap-2 mb-8" role="list" aria-label="Типы идей">
        {ideas.map((item, idx) => (
          <span
            key={item}
            role="listitem"
            className="rounded-full bg-white/5 border border-white/10 px-3.5 py-1.5 text-xs sm:text-sm text-slate-200 backdrop-blur-md flex items-center gap-1.5 hover:border-sky-400/40 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-sky-400" />
            {item}
          </span>
        ))}
      </div>

      {/* Visual illustration + blockers in an interactive two-column/stack */}
      <div className="grid md:grid-cols-12 gap-6 items-center mb-8">
        {/* Illustration container */}
        <motion.div
          initial={{ opacity: 0, x: -16 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="md:col-span-5 rounded-2xl overflow-hidden glass-card p-2 border border-white/15 group shadow-xl"
        >
          <div className="relative aspect-square rounded-xl overflow-hidden bg-slate-950">
            <img
              src="/images/ideas.jpg"
              alt="Идеи и препятствия на пути к реализации"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
            <div className="absolute bottom-3 left-3 right-3 p-2.5 rounded-lg bg-slate-900/85 backdrop-blur border border-white/10 text-xs">
              <div className="flex items-center gap-1.5 text-sky-400 font-semibold mb-0.5">
                <Lightbulb className="w-3.5 h-3.5 text-amber-300" />
                <span>От идеи к коду</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-tight">Без долгого ожидания и посредников</p>
            </div>
          </div>
        </motion.div>

        {/* Blockers content */}
        <div className="md:col-span-7 space-y-4">
          <p className="text-sm sm:text-base text-slate-300 text-left font-normal leading-relaxed">
            Но между «я придумал» и «оно работает» обычно появляется куча препятствий:
          </p>

          <ul className="space-y-2.5" role="list">
            {blockers.map((b, i) => (
              <motion.li
                key={b}
                initial={{ opacity: 0, x: 12 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="glass-card rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-300 flex items-center gap-3 border border-white/10 hover:border-red-500/30 transition-colors"
              >
                <div className="w-5 h-5 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
                  <span className="text-red-400 text-xs font-bold">—</span>
                </div>
                <span>{b}</span>
              </motion.li>
            ))}
          </ul>
        </div>
      </div>

      <p className="text-sm sm:text-base text-slate-400 text-center mb-6 font-normal">
        И в итоге многие идеи просто остаются идеями.
      </p>

      {/* Alternative callout */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        className="glass-card rounded-2xl p-6 text-center border-purple-500/30 bg-purple-950/10 shadow-lg shadow-purple-950/20"
      >
        <p className="font-display text-base sm:text-lg font-semibold text-white mb-2">
          А что, если попробовать по-другому?
        </p>
        <p className="text-sm sm:text-base text-emerald-400 font-medium">
          Не искать исполнителя. А научиться создавать самому — вместе с AI.
        </p>
      </motion.div>

      <BotFunnelCTA
        temp="warm"
        block="recognize"
        label="Хочу попробовать по-другому"
        hint="AI-напарник разберёт вашу идею бесплатно"
      />
    </div>
  </section>
);

export default RecognizeSection;
