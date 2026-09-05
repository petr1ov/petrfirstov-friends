import { motion } from "framer-motion";
import { ArrowRight, Rocket, Wrench } from "lucide-react";

const TwoPathsSection = () => {
  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  return (
    <section className="py-16 px-4" id="two-paths" aria-labelledby="paths-title">
      <div className="max-w-2xl mx-auto">
        <motion.h2
          id="paths-title"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="font-display text-2xl sm:text-4xl font-bold text-center mb-8 text-balance"
        >
          Два пути
        </motion.h2>

        <div className="grid gap-3 sm:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-card rounded-2xl p-6 flex flex-col"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-miniapp-purple to-miniapp-blue flex items-center justify-center mb-3">
              <Rocket className="w-5 h-5 text-white" aria-hidden="true" />
            </div>
            <h3 className="font-display font-semibold text-base sm:text-lg">Ты можешь создать сам</h3>
            <p className="text-sm text-miniapp-foreground/65 mt-2 leading-relaxed flex-1">
              Приходишь в «Созидатели», подключаешь своего AI-агента и постепенно учишься создавать свои проекты.
            </p>
            <a
              href="https://t.me/PetrFirstovBot?start=miniapp_creators"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center justify-center gap-2 min-h-11 px-5 rounded-xl bg-gradient-to-r from-miniapp-purple to-miniapp-blue text-white font-semibold text-sm shadow-lg shadow-miniapp-purple/30 hover:scale-[1.02] transition-transform focus-ring"
            >
              Хочу создавать сам <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.08 }}
            className="glass-card rounded-2xl p-6 flex flex-col"
          >
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center mb-3">
              <Wrench className="w-5 h-5 text-miniapp-neon" aria-hidden="true" />
            </div>
            <h3 className="font-display font-semibold text-base sm:text-lg">Или можешь заказать разработку</h3>
            <p className="text-sm text-miniapp-foreground/65 mt-2 leading-relaxed flex-1">
              Если тебе не хочется разбираться самому — мы можем создать продукт для тебя. При этом ты получаешь не просто
              исполнителя, а AI-инструменты и систему, которую можно дальше развивать.
            </p>
            <button
              onClick={() => scrollTo("calculator")}
              className="mt-4 inline-flex items-center justify-center gap-2 min-h-11 px-5 rounded-xl border border-white/15 bg-white/5 text-miniapp-foreground font-semibold text-sm hover:bg-white/10 transition-colors focus-ring"
            >
              Обсудить свой проект <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </button>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default TwoPathsSection;
