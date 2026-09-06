import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Terminal, Bot, Cpu } from "lucide-react";
import FirstovLogo from "./FirstovLogo";

const steps = [
  { num: "01", text: "Ты приходишь с идеей", icon: Sparkles },
  { num: "02", text: "Мы подключаем твоего AI-агента", icon: Bot },
  { num: "03", text: "Вместе превращаем её в работающий продукт", icon: Terminal },
];

const HeroSection = () => {
  return (
    <section className="relative pt-24 pb-16 px-4 overflow-hidden" id="main" aria-label="Главный экран">
      {/* Aurora glow effects */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-[550px] sm:w-[750px] h-[400px] bg-gradient-to-b from-purple-600/25 via-sky-500/15 to-transparent rounded-full blur-[90px] animate-aurora"
      />

      <div className="max-w-4xl mx-auto relative z-10 text-center">
        {/* Top badge */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium bg-white/5 border border-white/10 backdrop-blur-md mb-6"
        >
          <FirstovLogo className="w-4 h-4" />
          <span className="text-slate-300">FIRSTOV.AI</span>
          <span className="text-white/30">•</span>
          <span className="text-emerald-400 flex items-center gap-1.5 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            AI-партнёр для создателей
          </span>
        </motion.div>

        {/* Main Title (word-for-word) */}
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05 }}
          className="font-display text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-balance leading-[1.18] sm:leading-[1.12] mb-4 sm:mb-6 text-white break-words"
        >
          Создавай свои проекты с помощью AI
        </motion.h1>

        {/* Subtitle (word-for-word) */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-sm sm:text-lg text-slate-300 max-w-2xl mx-auto mb-6 sm:mb-8 text-balance font-normal leading-relaxed"
        >
          От идеи до первого работающего продукта — без команды программистов. Я помогаю предпринимателям освоить AI не как набор нейросетей, а как нового партнёра по созданию.
        </motion.p>

        {/* Illustrated Hero Artwork */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="relative max-w-3xl mx-auto mb-10 rounded-2xl overflow-hidden glass-card p-2 group shadow-2xl shadow-purple-950/40 border border-white/15"
        >
          <div className="relative rounded-xl overflow-hidden aspect-[16/9] sm:aspect-[21/9] bg-slate-950">
            <img
              src="/images/hero.jpg"
              alt="Создавай свои проекты с помощью AI"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-center group-hover:scale-102 transition-transform duration-700 brightness-95 contrast-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent" />
            
            {/* Holographic overlay details */}
            <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-left">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                  <Cpu className="w-4 h-4 text-sky-400 animate-pulse" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-white tracking-wide">Цифровая лаборатория созидания</p>
                  <p className="text-[11px] text-slate-400">Синхронизировано с Telegram Bot API</p>
                </div>
              </div>
              <span className="hidden sm:inline-flex text-[11px] font-mono font-medium px-2.5 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                MVP Engine v2.0
              </span>
            </div>
          </div>
        </motion.div>

        {/* 3 Steps (word-for-word) */}
        <motion.ol
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="grid gap-3 sm:grid-cols-3 max-w-2xl mx-auto mb-8 text-left"
        >
          {steps.map((s) => (
            <li
              key={s.num}
              className="glass-card rounded-2xl p-4 flex items-center gap-3.5 hover:border-purple-400/30 transition-colors"
            >
              <span className="font-mono text-sm font-bold text-sky-400 bg-sky-500/10 border border-sky-500/20 w-8 h-8 rounded-xl flex items-center justify-center shrink-0">
                {s.num}
              </span>
              <span className="text-xs sm:text-sm font-medium text-slate-200 leading-snug">
                {s.text}
              </span>
            </li>
          ))}
        </motion.ol>

        {/* Primary CTA (word-for-word) */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="space-y-4"
        >
          <a
            href="https://t.me/PetrFirstovBot?start=warm_hero"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex w-full sm:w-auto items-center justify-center gap-2.5 min-h-12 px-8 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-sky-500 text-white font-semibold text-sm shadow-xl shadow-purple-600/30 hover:shadow-purple-600/50 hover:scale-[1.02] active:scale-[0.98] transition-all focus-ring"
          >
            <span>Попробовать вместе</span>
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </a>

          {/* Bottom note (word-for-word) */}
          <p className="text-xs sm:text-sm text-slate-400 text-balance font-normal">
            Не учимся «пользоваться ChatGPT». Учимся создавать с помощью AI.
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
