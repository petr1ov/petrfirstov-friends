import { motion } from "framer-motion";
import { HelpCircle } from "lucide-react";
import BotFunnelCTA from "./BotFunnelCTA";

const questions = [
  "Умеешь ли ты поставить ему задачу?",
  "Понимаешь ли ты, что именно нужно создать?",
  "Можешь ли проверить результат?",
  "Можешь ли объяснить AI, что исправить?",
  "Можешь ли собрать из десятка AI-инструментов одну работающую систему?",
];

const DifferenceSection = () => (
  <section className="py-16 px-4" id="difference" aria-labelledby="difference-title">
    <div className="max-w-2xl mx-auto">
      <p className="text-xs uppercase tracking-[0.2em] text-miniapp-foreground/45 text-center mb-3">Главное отличие</p>
      <motion.h2
        id="difference-title"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="font-display text-2xl sm:text-4xl font-bold text-center mb-6 text-balance"
      >
        Здесь не нужно сначала стать программистом
      </motion.h2>

      <p className="text-sm sm:text-base text-miniapp-foreground/70 text-center mb-2">AI уже умеет писать код.</p>
      <p className="text-sm text-miniapp-foreground/60 text-center mb-6 text-balance">
        Но проблема теперь не в том, умеет ли AI программировать. Проблема в другом:
      </p>

      <ul className="space-y-2 mb-7">
        {questions.map((q, i) => (
          <motion.li
            key={q}
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05 }}
            className="glass-card rounded-xl px-4 py-3 flex items-start gap-3 text-sm text-miniapp-foreground/85"
          >
            <HelpCircle className="w-4 h-4 text-miniapp-purple shrink-0 mt-0.5" aria-hidden="true" />
            {q}
          </motion.li>
        ))}
      </ul>

      <p className="font-display text-center text-base sm:text-lg font-semibold">Вот этому мы и учимся.</p>

      <BotFunnelCTA temp="club" block="difference" label="Учиться этому в «Созидателях 2.0»" />
    </div>
  </section>
);

export default DifferenceSection;
