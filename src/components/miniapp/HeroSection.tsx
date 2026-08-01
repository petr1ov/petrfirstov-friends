import { motion } from "framer-motion";
import { Sparkles, MessageSquare, ShieldCheck } from "lucide-react";
import petrPhoto from "@/assets/petr-firstov.jpg";

const proofs = [
  { icon: ShieldCheck, text: "Фиксированный scope и цена" },
  { icon: Sparkles, text: "AI внутри продукта, не поверх" },
];

const HeroSection = () => {
  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative pt-20 pb-16 px-4 overflow-hidden" aria-labelledby="hero-title">
      <div
        aria-hidden="true"
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[36rem] h-[36rem] rounded-full bg-miniapp-purple/20 blur-[140px] animate-aurora"
      />
      <div className="relative max-w-md mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="relative w-32 h-32 mx-auto mb-6"
        >
          <div
            aria-hidden="true"
            className="absolute inset-0 rounded-full bg-gradient-to-br from-miniapp-purple via-miniapp-blue to-miniapp-neon blur-md opacity-70"
          />
          <img
            src={petrPhoto}
            alt="Портрет Петра Фирстова"
            loading="eager"
            decoding="async"
            className="relative w-32 h-32 rounded-full object-cover ring-2 ring-white/10"
          />
          <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded-full bg-miniapp text-[10px] font-semibold text-miniapp-neon border border-miniapp-neon/30 whitespace-nowrap">
            свободен для проектов
          </span>
        </motion.div>

        <motion.h1
          id="hero-title"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.08, ease: "easeOut" }}
          className="font-display text-3xl sm:text-4xl font-bold leading-[1.08] mb-3 text-balance"
        >
          Соберу вам AI-продукт
          <span className="block bg-gradient-to-r from-miniapp-purple via-miniapp-blue to-miniapp-neon bg-clip-text text-transparent">
            за 14 дней
          </span>
        </motion.h1>

        <p className="text-sm text-miniapp-foreground/70 mb-6 text-balance">
          Боты, CRM и AI-ассистенты — от идеи до работающего продукта.
        </p>

        <div className="flex flex-col gap-2.5 mb-6">
          <button
            onClick={() => scrollTo("calculator")}
            className="min-h-12 rounded-2xl bg-gradient-to-r from-miniapp-purple to-miniapp-blue text-white font-semibold text-sm shadow-lg shadow-miniapp-purple/30 transition-transform duration-200 hover:scale-[1.02] active:scale-[0.99] focus-ring"
          >
            Рассчитать проект
          </button>
          <button
            onClick={() => scrollTo("ai-demo")}
            className="min-h-12 rounded-2xl glass-card text-miniapp-foreground font-semibold text-sm inline-flex items-center justify-center gap-2 hover:bg-white/10 transition-colors duration-200 focus-ring"
          >
            <MessageSquare className="w-4 h-4" aria-hidden="true" /> Попробовать AI
          </button>
        </div>

        <ul className="space-y-2 text-left">
          {proofs.map((p) => (
            <li
              key={p.text}
              className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 glass-card text-xs text-miniapp-foreground/80"
            >
              <p.icon className="w-4 h-4 text-miniapp-neon shrink-0" aria-hidden="true" />
              {p.text}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default HeroSection;
