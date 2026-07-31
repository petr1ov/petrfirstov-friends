import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import petrPhoto from "@/assets/petr-firstov.jpg";

const stats = [
  { k: "14", v: "дней до MVP" },
  { k: "36", v: "проектов" },
  { k: "24/7", v: "AI-ассистенты" },
];

const HeroEditorial = () => (
  <section className="relative pt-24 pb-16 px-5 overflow-hidden" aria-labelledby="hero-editorial">
    <div aria-hidden className="absolute -top-24 -left-24 w-80 h-80 bg-miniapp-purple/20 rounded-full blur-[120px]" />
    <div className="relative max-w-xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="flex items-center gap-3 mb-8"
      >
        <img src={petrPhoto} alt="Пётр Фирстов" className="w-11 h-11 rounded-full object-cover ring-1 ring-miniapp-border" />
        <div className="text-left">
          <p className="text-sm font-semibold text-miniapp-foreground">Пётр Фирстов</p>
          <p className="text-xs text-miniapp-muted">AI-разработчик · Telegram-экосистемы</p>
        </div>
      </motion.div>

      <motion.h1
        id="hero-editorial"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, delay: 0.05, ease: "easeOut" }}
        className="font-display text-left text-[2.6rem] sm:text-6xl font-bold leading-[0.98] tracking-tight mb-6"
      >
        AI-агенты,
        <br />
        которые <span className="italic font-normal text-miniapp-purple">работают</span>
        <br />
        за вас.
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.15 }}
        className="text-left text-miniapp-foreground/70 text-base leading-relaxed mb-8 max-w-sm"
      >
        От идеи до работающего продукта за 14 дней — боты, CRM, AI-ассистенты.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
        className="flex flex-col sm:flex-row gap-3 mb-10"
      >
        <button className="group min-h-12 px-6 rounded-full bg-miniapp-foreground text-miniapp font-semibold text-sm inline-flex items-center justify-center gap-2 transition-transform duration-200 hover:scale-[1.02] active:scale-[0.99]">
          Рассчитать проект
          <ArrowUpRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </button>
        <button className="min-h-12 px-6 rounded-full border border-miniapp-border text-miniapp-foreground font-semibold text-sm hover:bg-white/5 transition-colors duration-200">
          Попробовать AI
        </button>
      </motion.div>

      <div className="grid grid-cols-3 border-t border-miniapp-border/70 pt-5 text-left">
        {stats.map((s) => (
          <div key={s.k}>
            <p className="font-display text-xl font-bold">{s.k}</p>
            <p className="text-[11px] text-miniapp-muted leading-tight">{s.v}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default HeroEditorial;