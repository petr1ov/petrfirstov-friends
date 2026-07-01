import { motion } from "framer-motion";
import { Sparkles, MessageSquare } from "lucide-react";
import petrPhoto from "@/assets/petr-firstov.jpg";

const HeroSection = () => {
  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative pt-24 pb-16 px-4 overflow-hidden" aria-labelledby="hero-title">
      {/* Aurora orbs */}
      <div
        aria-hidden="true"
        className="absolute top-20 -left-32 w-72 h-72 bg-miniapp-purple/30 rounded-full blur-[110px] animate-aurora"
      />
      <div
        aria-hidden="true"
        className="absolute top-40 -right-32 w-72 h-72 bg-miniapp-blue/25 rounded-full blur-[110px] animate-aurora"
        style={{ animationDelay: "2s" }}
      />
      <div
        aria-hidden="true"
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-96 h-48 bg-miniapp-neon/15 rounded-full blur-[90px] animate-aurora"
        style={{ animationDelay: "4s" }}
      />

      <div className="relative max-w-xl mx-auto text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mb-5"
        >
          <img
            src={petrPhoto}
            alt="Портрет Петра Фирстова"
            loading="eager"
            decoding="async"
            className="w-28 h-28 rounded-full mx-auto object-cover ring-2 ring-miniapp-purple/40 ring-offset-4 ring-offset-[hsl(var(--miniapp-bg))] shadow-2xl shadow-miniapp-purple/30"
          />
        </motion.div>

        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-miniapp-purple/10 border border-miniapp-purple/25 text-miniapp-purple text-xs font-medium mb-6"
        >
          <Sparkles className="w-3 h-3" aria-hidden="true" />
          AI-решения для бизнеса
        </motion.div>

        <motion.h1
          id="hero-title"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="font-display text-4xl sm:text-5xl md:text-6xl font-bold leading-[1.05] mb-4 text-balance"
        >
          <span className="block bg-gradient-to-br from-white via-white to-white/60 bg-clip-text text-transparent">
            Пётр Фирстов
          </span>
          <span className="block mt-2 text-2xl sm:text-3xl md:text-4xl bg-gradient-to-r from-miniapp-purple via-miniapp-blue to-miniapp-neon bg-clip-text text-transparent">
            AI-агенты для бизнеса
          </span>
        </motion.h1>

        <motion.p
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="text-miniapp-foreground/75 text-base sm:text-lg mb-8 max-w-md mx-auto text-balance"
        >
          От идеи до работающего продукта за 14 дней — боты, CRM, AI-ассистенты
        </motion.p>

        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-3 justify-center items-stretch sm:items-center"
        >
          <button
            onClick={() => scrollTo("calculator")}
            className="min-h-12 px-6 rounded-xl bg-gradient-to-r from-miniapp-purple to-miniapp-blue text-white font-semibold text-sm shadow-lg shadow-miniapp-purple/30 hover:shadow-miniapp-purple/50 transition-all hover:scale-[1.02] active:scale-[0.98] focus-ring"
          >
            Рассчитать проект
          </button>
          <button
            onClick={() => scrollTo("ai-demo")}
            className="min-h-12 px-6 rounded-xl glass-card text-white font-semibold text-sm hover:bg-white/10 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 focus-ring"
          >
            <MessageSquare className="w-4 h-4" aria-hidden="true" />
            Попробовать AI
          </button>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
