import { motion } from "framer-motion";
import BotFunnelCTA from "./BotFunnelCTA";

const pairs = [
  { ai: "AI может написать код.", you: "Но идею создаёшь ты." },
  { ai: "AI может провести исследование.", you: "Но решение принимаешь ты." },
  { ai: "AI может собрать приложение.", you: "Но ответственность за продукт остаётся у тебя." },
];

const PhilosophySection = () => (
  <section className="py-16 px-4" id="philosophy" aria-labelledby="philosophy-title">
    <div className="max-w-2xl mx-auto">
      <p className="text-xs uppercase tracking-[0.2em] text-miniapp-foreground/45 text-center mb-3">Философия</p>
      <motion.h2
        id="philosophy-title"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="font-display text-2xl sm:text-4xl font-bold text-center mb-6 text-balance"
      >
        AI — не замена человеку
      </motion.h2>

      <p className="text-sm sm:text-base text-miniapp-foreground/70 text-center mb-2">
        Я не хочу научить тебя отдавать всё AI. Наоборот.
      </p>
      <p className="text-sm text-miniapp-neon/90 text-center mb-8 text-balance">
        AI забирает рутину, чтобы человек мог заниматься созданием.
      </p>

      <ul className="space-y-2.5 mb-8">
        {pairs.map((p, i) => (
          <motion.li
            key={p.ai}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.07 }}
            className="glass-card rounded-2xl p-4 sm:flex sm:items-center sm:gap-4"
          >
            <p className="text-sm text-miniapp-foreground/60 sm:w-1/2">{p.ai}</p>
            <p className="text-sm font-medium text-miniapp-foreground mt-1 sm:mt-0 sm:w-1/2">{p.you}</p>
          </motion.li>
        ))}
      </ul>

      <div className="text-center space-y-1.5">
        <p className="text-sm text-miniapp-foreground/70">Мы не отдаём AI управление своей жизнью и бизнесом.</p>
        <p className="font-display text-base sm:text-lg font-semibold">Мы даём себе нового сильного партнёра.</p>
      </div>

      <BotFunnelCTA temp="cold" block="philosophy" label="Попробовать AI как партнёра" />
    </div>
  </section>
);

export default PhilosophySection;
