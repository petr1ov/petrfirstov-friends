import { motion } from "framer-motion";

const ideas = ["Новый сервис", "Приложение", "Бот", "Сайт", "Автоматизация", "Новый продукт"];
const blockers = [
  "нужен программист",
  "нужен дизайнер",
  "нужно разобраться в технологиях",
  "нужно поставить задачу",
  "нужно контролировать разработку",
  "нужны деньги и время",
];

const RecognizeSection = () => (
  <section className="py-16 px-4" id="recognize" aria-labelledby="recognize-title">
    <div className="max-w-2xl mx-auto">
      <p className="text-xs uppercase tracking-[0.2em] text-miniapp-foreground/45 text-center mb-3">Узнаёшь себя?</p>
      <motion.h2
        id="recognize-title"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="font-display text-2xl sm:text-4xl font-bold text-center mb-6 text-balance"
      >
        У тебя постоянно появляются идеи
      </motion.h2>

      <div className="flex flex-wrap justify-center gap-2 mb-8">
        {ideas.map((i) => (
          <span key={i} className="glass-card rounded-full px-3.5 py-1.5 text-xs text-miniapp-foreground/80">
            {i}
          </span>
        ))}
      </div>

      <p className="text-sm sm:text-base text-miniapp-foreground/70 text-center mb-5 text-balance">
        Но между «я придумал» и «оно работает» обычно появляется куча препятствий:
      </p>

      <ul className="grid gap-2 sm:grid-cols-2 mb-8">
        {blockers.map((b, i) => (
          <motion.li
            key={b}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05 }}
            className="glass-card rounded-xl px-4 py-3 text-sm text-miniapp-foreground/75"
          >
            — {b}
          </motion.li>
        ))}
      </ul>

      <div className="glass-card rounded-2xl p-6 text-center">
        <p className="text-sm text-miniapp-foreground/65 mb-3">И в итоге многие идеи просто остаются идеями.</p>
        <p className="font-display text-lg sm:text-xl font-semibold mb-2">А что, если попробовать по-другому?</p>
        <p className="text-sm text-miniapp-foreground/80">
          Не искать исполнителя.
          <br />
          <span className="text-miniapp-neon">А научиться создавать самому — вместе с AI.</span>
        </p>
      </div>
    </div>
  </section>
);

export default RecognizeSection;
