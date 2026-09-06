import { motion } from "framer-motion";
import { Code2, BarChart3, Megaphone, Bot, FileText, Search, ShieldCheck } from "lucide-react";
import BotFunnelCTA from "./BotFunnelCTA";

const roles = [
  { label: "программистом", icon: Code2, color: "text-sky-400 bg-sky-500/10 border-sky-500/20" },
  { label: "аналитиком", icon: BarChart3, color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
  { label: "маркетологом", icon: Megaphone, color: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
  { label: "ассистентом", icon: Bot, color: "text-purple-400 bg-purple-500/10 border-purple-500/20" },
  { label: "контент-менеджером", icon: FileText, color: "text-pink-400 bg-pink-500/10 border-pink-500/20" },
  { label: "исследователем", icon: Search, color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20" },
];

const OfferSection = () => (
  <section className="py-16 px-4 relative" id="offer" aria-labelledby="offer-title">
    <div className="max-w-3xl mx-auto">
      <p className="text-xs uppercase tracking-[0.2em] text-slate-400 text-center mb-3 font-medium">
        Что я предлагаю
      </p>

      <motion.h2
        id="offer-title"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="font-display text-2xl sm:text-4xl font-bold text-center mb-4 text-balance text-white"
      >
        Практика создания
      </motion.h2>

      <p className="text-sm sm:text-base text-slate-400 text-center mb-2 font-normal">
        Не курс. Не лекции. Не «нейросети за 3 дня».
      </p>
      <p className="text-sm sm:text-base text-white text-center mb-8 font-medium">
        Ты берёшь свою реальную идею или задачу. А AI становится твоим:
      </p>

      {/* Illustration + Roles layout */}
      <div className="grid md:grid-cols-12 gap-6 items-center mb-8">
        {/* Visual Illustration */}
        <motion.div
          initial={{ opacity: 0, x: -16 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="md:col-span-5 rounded-2xl overflow-hidden glass-card p-2 border border-white/15 shadow-xl group"
        >
          <div className="relative aspect-square rounded-xl overflow-hidden bg-slate-950">
            <img
              src="/images/ai_team.jpg"
              alt="Команда AI-агентов под управлением автора"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
            <div className="absolute bottom-3 left-3 right-3 p-2.5 rounded-lg bg-slate-900/90 backdrop-blur border border-white/10 text-xs">
              <span className="text-emerald-400 font-semibold block mb-0.5">Синтез агентных ролей</span>
              <span className="text-[11px] text-slate-400">AI выполняет рутину за секунды</span>
            </div>
          </div>
        </motion.div>

        {/* Roles List */}
        <div className="md:col-span-7">
          <ul className="grid grid-cols-2 gap-3" role="list">
            {roles.map((r, i) => (
              <motion.li
                key={r.label}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="glass-card rounded-xl p-3.5 flex items-center gap-3 border border-white/10 hover:border-white/20 transition-all hover:bg-white/5"
              >
                <div className={`w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 ${r.color}`}>
                  <r.icon className="w-4 h-4" />
                </div>
                <span className="text-xs sm:text-sm font-medium text-slate-200">
                  {r.label}
                </span>
              </motion.li>
            ))}
          </ul>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="glass-card rounded-2xl p-5 text-center border-sky-500/30 bg-sky-950/10 shadow-lg"
      >
        <p className="font-display text-base sm:text-lg font-semibold text-white">
          А ты остаёшься автором и руководителем проекта.
        </p>
      </motion.div>

      <BotFunnelCTA
        temp="cold"
        block="offer"
        label="Проверить это на своей идее"
        hint="Мини-разбор в боте, бесплатно"
      />
    </div>
  </section>
);

export default OfferSection;
