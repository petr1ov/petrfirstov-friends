import { motion } from "framer-motion";
import BotFunnelCTA from "./BotFunnelCTA";

const phrases = [
  "«Я вообще не понимаю, как это сделать»",
  "«А если попросить AI сделать вот это?»",
  "«Подожди, а если соединить эти два инструмента?..»",
  "«Я могу сам это собрать»",
];

const TransformationSection = () => (
  <section className="py-16 px-4" id="transformation" aria-labelledby="transformation-title">
    <div className="max-w-2xl mx-auto">
      <motion.h2
        id="transformation-title"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="font-display text-2xl sm:text-4xl font-bold text-center mb-8 text-balance"
      >
        Что происходит с человеком
      </motion.h2>

      <ol className="relative border-l border-white/10 ml-3 space-y-5">
        {phrases.map((p, i) => (
          <motion.li
            key={p}
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
            className="relative pl-6"
          >
            <span
              aria-hidden="true"
              className={`absolute -left-[5px] top-3 w-2.5 h-2.5 rounded-full ${
                i === phrases.length - 1 ? "bg-miniapp-neon" : "bg-miniapp-purple/70"
              }`}
            />
            <p
              className={`glass-card rounded-xl px-4 py-3 text-sm ${
                i === phrases.length - 1 ? "text-miniapp-foreground font-semibold" : "text-miniapp-foreground/75"
              }`}
            >
              {p}
            </p>
          </motion.li>
        ))}
      </ol>

      <p className="text-sm text-miniapp-foreground/60 text-center mt-8 text-balance">
        И вот этот переход для меня — самое интересное.
      </p>

      <BotFunnelCTA temp="cold" block="transformation" label="Хочу пройти этот переход" />
    </div>
  </section>
);

export default TransformationSection;
