import { motion } from "framer-motion";
import { Sparkles, MessageSquare } from "lucide-react";
import petrPhoto from "@/assets/petr-firstov.jpg";

const HeroSection = () => {
  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative pt-20 pb-16 px-4 overflow-hidden">
      {/* Gradient orbs */}
      <div className="absolute top-20 -left-32 w-64 h-64 bg-miniapp-purple/30 rounded-full blur-[100px]" />
      <div className="absolute top-40 -right-32 w-64 h-64 bg-miniapp-blue/20 rounded-full blur-[100px]" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-80 h-40 bg-miniapp-neon/10 rounded-full blur-[80px]" />

      <div className="relative max-w-lg mx-auto text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-miniapp-purple/10 border border-miniapp-purple/20 text-miniapp-purple text-xs mb-6"
        >
          <Sparkles className="w-3 h-3" />
          AI-решения для бизнеса
        </motion.div>

        <motion.h1
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="text-4xl sm:text-5xl font-extrabold leading-tight mb-4"
        >
          <span className="bg-gradient-to-r from-white via-white to-white/60 bg-clip-text text-transparent">
            Пётр Фирстов
          </span>
        </motion.h1>

        <motion.p
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="text-lg sm:text-xl font-semibold bg-gradient-to-r from-miniapp-purple to-miniapp-blue bg-clip-text text-transparent mb-3"
        >
          AI-боты и цифровые сотрудники для бизнеса
        </motion.p>

        <motion.p
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="text-miniapp-muted text-sm sm:text-base mb-8 max-w-md mx-auto"
        >
          Система, которая привлекает клиентов и отвечает за тебя
        </motion.p>

        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-3 justify-center"
        >
          <button
            onClick={() => scrollTo("calculator")}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-miniapp-purple to-miniapp-blue text-white font-semibold text-sm shadow-lg shadow-miniapp-purple/25 hover:shadow-miniapp-purple/40 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            Рассчитать проект
          </button>
          <button
            onClick={() => scrollTo("ai-demo")}
            className="px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-semibold text-sm hover:bg-white/10 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <MessageSquare className="w-4 h-4" />
            Попробовать AI
          </button>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
