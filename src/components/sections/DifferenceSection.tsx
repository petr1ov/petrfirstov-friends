import { motion } from "framer-motion";
import { HelpCircle, Check, Terminal, Sparkles } from "lucide-react";
import BotFunnelCTA from "./BotFunnelCTA";

const questions = [
  "Умеешь ли ты поставить ему задачу?",
  "Понимаешь ли ты, что именно нужно создать?",
  "Можешь ли проверить результат?",
  "Можешь ли объяснить AI, что исправить?",
  "Можешь ли собрать из десятка AI-инструментов одну работающую систему?",
];

const DifferenceSection = () => (
  <section className="py-16 px-4 relative" id="difference" aria-labelledby="diff-title">
    <div className="max-w-3xl mx-auto">
      <p className="text-xs uppercase tracking-[0.2em] text-slate-400 text-center mb-3 font-medium">
        Главное отличие
      </p>

      <motion.h2
        id="diff-title"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="font-display text-2xl sm:text-4xl font-bold text-center mb-6 text-balance text-white"
      >
        Здесь не нужно сначала стать программистом
      </motion.h2>

      <div className="glass-card rounded-2xl p-6 mb-6 border border-white/10 text-center space-y-2">
        <p className="font-display text-lg sm:text-xl font-bold text-emerald-400">
          AI уже умеет писать код.
        </p>
        <p className="text-sm sm:text-base text-slate-300 font-normal leading-relaxed">
          Но проблема теперь не в том, умеет ли AI программировать. Проблема в другом:
        </p>
      </div>

      <ul className="space-y-3 mb-8" role="list">
        {questions.map((q, i) => (
          <motion.li
            key={q}
            initial={{ opacity: 0, x: -12 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.06 }}
            className="glass-card rounded-xl p-4 flex items-center gap-3.5 border border-white/10 hover:border-sky-400/30 transition-colors"
          >
            <div className="w-7 h-7 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center shrink-0">
              <HelpCircle className="w-4 h-4 text-sky-400" />
            </div>
            <p className="text-xs sm:text-sm font-medium text-slate-200">
              {q}
            </p>
          </motion.li>
        ))}
      </ul>

      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        className="text-center py-4 px-6 rounded-2xl bg-gradient-to-r from-purple-950/30 via-slate-900/40 to-sky-950/30 border border-purple-500/30"
      >
        <p className="font-display text-lg sm:text-xl font-bold text-white">
          Вот этому мы и учимся.
        </p>
      </motion.div>

      <BotFunnelCTA
        temp="warm"
        block="diff"
        label="Учиться этому в «Созидателях 2.0»"
      />
    </div>
  </section>
);

export default DifferenceSection;
