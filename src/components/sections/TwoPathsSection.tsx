import { motion } from "framer-motion";
import { ArrowRight, Rocket, Wrench, Sparkles } from "lucide-react";

const TwoPathsSection = () => {
  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  return (
    <section className="py-16 px-4 relative" id="two-paths" aria-labelledby="paths-title">
      <div className="max-w-3xl mx-auto">
        <p className="text-xs uppercase tracking-[0.2em] text-slate-400 text-center mb-3 font-medium">
          Выбор формата
        </p>

        <motion.h2
          id="paths-title"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="font-display text-2xl sm:text-4xl font-bold text-center mb-8 text-balance text-white"
        >
          Два пути
        </motion.h2>

        <div className="grid gap-4 sm:grid-cols-2">
          {/* Path 1: Self-Creation */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-card rounded-2xl p-6 flex flex-col justify-between border border-purple-500/30 bg-purple-950/15 shadow-xl hover:border-purple-400/50 transition-all group"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center mb-4 shadow-lg shadow-purple-900/40">
                <Rocket className="w-5 h-5 text-white" aria-hidden="true" />
              </div>
              <h3 className="font-display font-bold text-lg sm:text-xl text-white mb-2">
                Ты можешь создать сам
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                Приходишь в «Созидатели», подключаешь своего AI-агента и постепенно учишься создавать свои проекты.
              </p>
            </div>

            <a
              href="https://t.me/PetrFirstovBot?start=club_creators"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center justify-center gap-2 min-h-12 px-5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-lg shadow-purple-600/30 hover:scale-[1.02] active:scale-[0.98] transition-all focus-ring"
            >
              <span>Хочу создавать сам</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </a>
          </motion.div>

          {/* Path 2: Turnkey Development */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.08 }}
            className="glass-card rounded-2xl p-6 flex flex-col justify-between border border-sky-500/30 bg-sky-950/15 shadow-xl hover:border-sky-400/50 transition-all group"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center mb-4 shadow-lg shadow-sky-900/40">
                <Wrench className="w-5 h-5 text-white" aria-hidden="true" />
              </div>
              <h3 className="font-display font-bold text-lg sm:text-xl text-white mb-2">
                Или можешь заказать разработку
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                Если тебе не хочется разбираться самому — мы можем создать продукт для тебя. При этом ты получаешь не просто исполнителя, а AI-инструменты и систему, которую можно дальше развивать.
              </p>
            </div>

            <button
              type="button"
              onClick={() => scrollTo("calculator")}
              className="mt-6 inline-flex items-center justify-center gap-2 min-h-12 px-5 rounded-xl border border-sky-400/30 bg-white/5 hover:bg-sky-500/10 text-sky-300 font-semibold text-sm transition-all focus-ring hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>Обсудить свой проект</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </button>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default TwoPathsSection;
