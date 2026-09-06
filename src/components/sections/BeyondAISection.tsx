import { motion } from "framer-motion";
import { Sparkles, Users, Cpu, ArrowRight } from "lucide-react";
import BotFunnelCTA from "./BotFunnelCTA";

const BeyondAISection = () => (
  <section className="py-16 px-4 relative" id="beyond-ai" aria-labelledby="beyond-title">
    <div className="max-w-3xl mx-auto">
      <p className="text-xs uppercase tracking-[0.2em] text-slate-400 text-center mb-3 font-medium">
        Это не только про AI
      </p>

      <motion.h2
        id="beyond-title"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="font-display text-2xl sm:text-4xl font-bold text-center mb-6 text-balance text-white"
      >
        Мы развиваем новую способность
      </motion.h2>

      {/* Main Banner */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="glass-card rounded-2xl p-6 sm:p-8 text-center mb-6 border border-white/15 bg-gradient-to-b from-purple-950/30 to-slate-900/60 shadow-xl"
      >
        <p className="font-display text-xl sm:text-2xl font-bold bg-gradient-to-r from-purple-400 via-sky-400 to-emerald-400 bg-clip-text text-transparent">
          Способность превращать идеи в реальность
        </p>
        <p className="text-xs sm:text-sm text-slate-300 mt-2 font-normal">
          AI просто впервые сделал этот путь настолько доступным.
        </p>
      </motion.div>

      {/* Comparison: Раньше vs Теперь */}
      <div className="grid gap-3.5 sm:grid-cols-2 mb-6">
        <div className="glass-card rounded-2xl p-5 border border-white/10 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs uppercase tracking-wider text-slate-400 font-mono font-medium">
                Раньше
              </span>
              <Users className="w-4 h-4 text-slate-500" />
            </div>
            <p className="text-xs sm:text-sm text-slate-300 font-normal leading-relaxed">
              Между идеей и продуктом стояла целая команда.
            </p>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-emerald-500/30 bg-emerald-950/10 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs uppercase tracking-wider text-emerald-400 font-mono font-bold">
                Теперь
              </span>
              <Cpu className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-xs sm:text-sm text-slate-100 font-medium leading-relaxed">
              Часть этой команды может быть у тебя внутри AI.
            </p>
          </div>
        </div>
      </div>

      <p className="text-sm sm:text-base text-center text-slate-300 text-balance leading-relaxed font-normal">
        Поэтому я не хочу учить людей просто пользоваться нейросетями.{" "}
        <span className="text-white font-semibold">Я хочу научить их создавать.</span>
      </p>

      <BotFunnelCTA temp="warm" block="beyond" label="Хочу научиться создавать" />
    </div>
  </section>
);

export default BeyondAISection;
