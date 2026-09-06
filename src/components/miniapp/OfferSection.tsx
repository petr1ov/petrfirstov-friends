import { motion } from "framer-motion";
import { Code2, LineChart, Megaphone, Bot, PenLine, Search } from "lucide-react";
import BotFunnelCTA from "./BotFunnelCTA";

const roles = [
  { icon: Code2, label: "программистом" },
  { icon: LineChart, label: "аналитиком" },
  { icon: Megaphone, label: "маркетологом" },
  { icon: Bot, label: "ассистентом" },
  { icon: PenLine, label: "контент-менеджером" },
  { icon: Search, label: "исследователем" },
];

const OfferSection = () => (
  <section className="py-16 px-4" id="offer" aria-labelledby="offer-title">
    <div className="max-w-2xl mx-auto">
      <p className="text-xs uppercase tracking-[0.2em] text-miniapp-foreground/45 text-center mb-3">Что я предлагаю</p>
      <motion.h2
        id="offer-title"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="font-display text-2xl sm:text-4xl font-bold text-center mb-3 text-balance"
      >
        Практика создания
      </motion.h2>
      <p className="text-sm text-miniapp-foreground/60 text-center mb-8">
        Не курс. Не лекции. Не «нейросети за 3 дня».
      </p>

      <p className="text-sm sm:text-base text-miniapp-foreground/80 text-center mb-6 text-balance">
        Ты берёшь свою реальную идею или задачу. А AI становится твоим:
      </p>

      <ul className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mb-8">
        {roles.map((r, i) => (
          <motion.li
            key={r.label}
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05 }}
            className="glass-card rounded-xl p-3.5 flex flex-col gap-2"
          >
            <r.icon className="w-4 h-4 text-miniapp-blue" aria-hidden="true" />
            <span className="text-xs sm:text-sm text-miniapp-foreground/85">{r.label}</span>
          </motion.li>
        ))}
      </ul>

      <p className="font-display text-center text-base sm:text-lg font-semibold text-balance">
        А ты остаёшься <span className="text-miniapp-neon">автором и руководителем</span> проекта.
      </p>

      <BotFunnelCTA temp="warm" block="offer" label="Проверить это на своей идее" hint="Мини-разбор в боте, бесплатно" />
    </div>
  </section>
);

export default OfferSection;
