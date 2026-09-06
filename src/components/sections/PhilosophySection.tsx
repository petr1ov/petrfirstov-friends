import { motion } from "framer-motion";
import { Sparkles, ArrowRight, UserCheck, Bot } from "lucide-react";
import BotFunnelCTA from "./BotFunnelCTA";

const pairs = [
  { ai: "AI может написать код.", you: "Но идею создаёшь ты." },
  { ai: "AI может провести исследование.", you: "Но решение принимаешь ты." },
  { ai: "AI может собрать приложение.", you: "Но ответственность за продукт остаётся у тебя." },
];

const PhilosophySection = () => (
  <section className="py-16 px-4 relative" id="philosophy" aria-labelledby="philosophy-title">
    <div className="max-w-3xl mx-auto">
      <p className="text-xs uppercase tracking-[0.2em] text-slate-400 text-center mb-3 font-medium">
        Философия
      </p>

      <motion.h2
        id="philosophy-title"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="font-display text-2xl sm:text-4xl font-bold text-center mb-6 text-balance text-white"
      >
        AI — не замена человеку
      </motion.h2>

      <p className="text-sm sm:text-base text-slate-300 text-center mb-2 font-normal">
        Я не хочу научить тебя отдавать всё AI. Наоборот.
      </p>
      <p className="text-sm sm:text-base text-emerald-400 font-medium text-center mb-8 text-balance">
        AI забирает рутину, чтобы человек мог заниматься созданием.
      </p>

      <ul className="space-y-3 mb-8" role="list">
        {pairs.map((p, i) => (
          <motion.li
            key={p.ai}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.07 }}
            className="glass-card rounded-2xl p-4 sm:p-5 sm:flex sm:items-center sm:gap-6 border border-white/10 hover:border-purple-500/30 transition-colors"
          >
            <div className="flex items-center gap-2 sm:w-1/2 text-slate-400 text-xs sm:text-sm">
              <Bot className="w-4 h-4 text-purple-400 shrink-0" />
              <span>{p.ai}</span>
            </div>
            <div className="flex items-center gap-2 sm:w-1/2 mt-2 sm:mt-0 font-medium text-white text-xs sm:text-sm">
              <UserCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{p.you}</span>
            </div>
          </motion.li>
        ))}
      </ul>

      <div className="text-center space-y-2 py-4 px-6 rounded-2xl glass-card border border-white/10">
        <p className="text-sm sm:text-base text-slate-300 font-normal">
          Мы не отдаём AI управление своей жизнью и бизнесом.
        </p>
        <p className="font-display text-base sm:text-xl font-bold text-white">
          Мы даём себе нового сильного партнёра.
        </p>
      </div>

      <BotFunnelCTA temp="cold" block="philosophy" label="Попробовать AI как партнёра" />
    </div>
  </section>
);

export default PhilosophySection;
