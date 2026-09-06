import { motion } from "framer-motion";
import { Sparkles, ArrowDown } from "lucide-react";
import BotFunnelCTA from "./BotFunnelCTA";

const phrases = [
  "«Я вообще не понимаю, как это сделать»",
  "«А если попросить AI сделать вот это?»",
  "«Подожди, а если соединить эти два инструмента?..»",
  "«Я могу сам это собрать»",
];

const TransformationSection = () => (
  <section className="py-16 px-4 relative" id="transformation" aria-labelledby="transformation-title">
    <div className="max-w-2xl mx-auto">
      <p className="text-xs uppercase tracking-[0.2em] text-slate-400 text-center mb-3 font-medium">
        Эволюция мышления
      </p>

      <motion.h2
        id="transformation-title"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="font-display text-2xl sm:text-4xl font-bold text-center mb-8 text-balance text-white"
      >
        Что происходит с человеком
      </motion.h2>

      <ol className="relative border-l-2 border-white/10 ml-4 sm:ml-6 space-y-6" role="list">
        {phrases.map((p, i) => (
          <motion.li
            key={p}
            initial={{ opacity: 0, x: -12 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
            className="relative pl-7"
          >
            {/* Glowing marker */}
            <span
              aria-hidden="true"
              className={`absolute -left-[9px] top-3.5 w-4 h-4 rounded-full border-2 border-slate-950 flex items-center justify-center ${
                i === phrases.length - 1
                  ? "bg-emerald-400 ring-4 ring-emerald-400/20"
                  : "bg-purple-500/80 ring-2 ring-purple-500/20"
              }`}
            />

            <div
              className={`glass-card rounded-2xl p-4 sm:p-5 border transition-all ${
                i === phrases.length - 1
                  ? "border-emerald-400/40 bg-emerald-950/15 shadow-lg shadow-emerald-950/30"
                  : "border-white/10"
              }`}
            >
              <span className="font-mono text-[10px] text-slate-400 uppercase tracking-widest block mb-1">
                Этап {i + 1}
              </span>
              <p
                className={`text-sm sm:text-base ${
                  i === phrases.length - 1
                    ? "text-emerald-300 font-bold"
                    : "text-slate-300 font-normal"
                }`}
              >
                {p}
              </p>
            </div>
          </motion.li>
        ))}
      </ol>

      <p className="text-sm sm:text-base text-slate-400 text-center mt-8 text-balance font-normal">
        И вот этот переход для меня — самое интересное.
      </p>

      <BotFunnelCTA temp="cold" block="transformation" label="Хочу пройти этот переход" />
    </div>
  </section>
);

export default TransformationSection;
