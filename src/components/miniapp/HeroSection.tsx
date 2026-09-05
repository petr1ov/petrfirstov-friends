import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const flow = ["Ты приходишь с идеей", "Мы подключаем твоего AI-агента", "Вместе превращаем её в работающий MVP"];

const HeroSection = () => {
  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  return (
    <section className="relative pt-24 pb-16 px-4 overflow-hidden" aria-labelledby="hero-title">
      <div
        aria-hidden="true"
        className="absolute -top-24 left-1/2 -translate-x-1/2 w-[36rem] h-[36rem] rounded-full bg-miniapp-purple/20 blur-[140px] animate-aurora"
      />
      <div className="relative max-w-2xl mx-auto text-center">
        <motion.h1
          id="hero-title"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="font-display text-[2rem] sm:text-5xl font-bold leading-[1.08] mb-4 text-balance"
        >
          Создавай свои проекты
          <span className="block bg-gradient-to-r from-miniapp-purple via-miniapp-blue to-miniapp-neon bg-clip-text text-transparent">
            с помощью AI
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-sm sm:text-base text-miniapp-foreground/75 mb-5 text-balance"
        >
          От идеи до первого работающего продукта — без команды программистов.
          <span className="block mt-2 text-miniapp-foreground/60">
            Я помогаю предпринимателям освоить AI не как набор нейросетей, а как нового партнёра по созданию.
          </span>
        </motion.p>

        <ol className="grid gap-2 mb-7 text-left">
          {flow.map((step, i) => (
            <motion.li
              key={step}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.08 }}
              className="glass-card rounded-xl px-4 py-3 text-sm text-miniapp-foreground/85 flex items-center gap-3"
            >
              <span className="font-display text-xs text-miniapp-neon">0{i + 1}</span>
              {step}
            </motion.li>
          ))}
        </ol>

        <button
          onClick={() => scrollTo("creators")}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 min-h-12 px-8 rounded-2xl bg-gradient-to-r from-miniapp-purple to-miniapp-blue text-white font-semibold text-sm shadow-xl shadow-miniapp-purple/35 hover:scale-[1.02] active:scale-[0.99] transition-transform focus-ring"
        >
          Попробовать вместе <ArrowRight className="w-4 h-4" aria-hidden="true" />
        </button>

        <p className="text-xs text-miniapp-foreground/55 mt-5 leading-relaxed">
          Не учимся «пользоваться ChatGPT».
          <br />
          Учимся создавать с помощью AI.
        </p>
      </div>
    </section>
  );
};

export default HeroSection;
