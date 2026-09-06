import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Send, Check } from "lucide-react";

const disclaimers = [
  "Не нужно знать программирование",
  "Не нужно сразу нанимать команду",
  "Не нужно сначала изучить сто AI-инструментов",
];

const steps = [
  "идея",
  "AI-агент",
  "первый прототип",
  "работающий MVP",
  "самостоятельное создание",
];

const CTASection = () => (
  <section className="py-20 px-4 relative overflow-hidden" id="cta" aria-labelledby="cta-title">
    {/* Aurora background */}
    <div
      aria-hidden="true"
      className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-gradient-to-t from-purple-600/20 via-sky-500/15 to-transparent rounded-full blur-[90px]"
    />

    <div className="max-w-3xl mx-auto relative z-10 text-center">
      <motion.h2
        id="cta-title"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="font-display text-3xl sm:text-5xl font-bold mb-4 text-balance text-white"
      >
        Что ты давно хочешь создать?
      </motion.h2>

      <p className="text-base sm:text-lg text-slate-300 max-w-xl mx-auto mb-8 text-balance font-normal leading-relaxed">
        Возможно, именно сейчас самое время перестать откладывать.
      </p>

      {/* Disclaimers */}
      <ul className="inline-flex flex-col items-start gap-2.5 mb-8 text-left max-w-md mx-auto" role="list">
        {disclaimers.map((d) => (
          <li key={d} className="flex items-center gap-2.5 text-xs sm:text-sm text-slate-300 font-medium">
            <div className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <Check className="w-3 h-3 stroke-[3]" />
            </div>
            <span>{d}</span>
          </li>
        ))}
      </ul>

      <p className="text-sm sm:text-base text-white font-medium mb-6">
        Нужна идея и готовность начать её создавать.
      </p>

      {/* Steps trail */}
      <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 mb-8 text-xs text-slate-400 font-mono">
        {steps.map((s, i) => (
          <span key={s} className="inline-flex items-center gap-1.5">
            <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-slate-200">
              {s}
            </span>
            {i < steps.length - 1 && <span className="text-purple-400 font-sans">→</span>}
          </span>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="space-y-4"
      >
        <p className="font-display text-xl sm:text-2xl font-bold text-white">
          Давай создадим что-нибудь.
        </p>

        <a
          href="https://t.me/PetrFirstovBot?start=warm_start"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2.5 min-h-12 px-9 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-sky-500 text-white font-semibold text-base shadow-xl shadow-purple-600/30 hover:shadow-purple-600/50 hover:scale-[1.02] active:scale-[0.98] transition-all focus-ring"
        >
          <Send className="w-4 h-4 text-sky-300" />
          <span>Начать</span>
          <ArrowRight className="w-4 h-4" aria-hidden="true" />
        </a>

        <p className="text-xs text-slate-400 font-normal">
          или напишите{" "}
          <a
            href="https://t.me/PetrFirstovBot"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sky-400 hover:text-sky-300 underline underline-offset-2 focus-ring"
          >
            @PetrFirstovBot
          </a>
        </p>
      </motion.div>
    </div>
  </section>
);

export default CTASection;
