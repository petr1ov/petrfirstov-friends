import { motion } from "framer-motion";
import { Terminal, Zap } from "lucide-react";

const rows = [
  { label: "stack", value: "telegram · supabase · gemini" },
  { label: "mvp_time", value: "14 дней" },
  { label: "status", value: "принимаю проекты" },
];

const HeroTerminal = () => (
  <section className="relative pt-24 pb-14 px-4" aria-labelledby="hero-terminal">
    <div className="max-w-lg mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="rounded-2xl border border-miniapp-border bg-miniapp-surface/60 backdrop-blur-xl overflow-hidden shadow-2xl shadow-black/40"
      >
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-miniapp-border/70 bg-white/[0.03]">
          <Terminal className="w-3.5 h-3.5 text-miniapp-neon" aria-hidden />
          <span className="font-mono text-[11px] text-miniapp-muted tracking-wide">firstov.ai — agents</span>
          <span className="ml-auto w-1.5 h-1.5 rounded-full bg-miniapp-neon animate-pulse" aria-hidden />
        </div>

        <div className="p-5">
          <p className="font-mono text-[11px] text-miniapp-neon mb-4">$ init ai-agent --for business</p>
          <h1 id="hero-terminal" className="font-display text-3xl sm:text-4xl font-bold leading-[1.05] mb-3">
            AI-агенты для бизнеса
          </h1>
          <p className="text-sm text-miniapp-foreground/70 leading-relaxed mb-5">
            От идеи до работающего продукта за 14 дней — боты, CRM, приложения с ИИ.
          </p>

          <dl className="font-mono text-[11px] divide-y divide-miniapp-border/60 border-y border-miniapp-border/60 mb-5">
            {rows.map((r) => (
              <div key={r.label} className="flex items-center gap-3 py-2">
                <dt className="text-miniapp-muted w-24 shrink-0">{r.label}</dt>
                <dd className="text-miniapp-foreground/85">{r.value}</dd>
              </div>
            ))}
          </dl>

          <div className="flex flex-col sm:flex-row gap-2.5">
            <button className="min-h-11 px-5 rounded-lg bg-miniapp-neon/15 border border-miniapp-neon/40 text-miniapp-neon font-mono text-xs inline-flex items-center justify-center gap-2 hover:bg-miniapp-neon/25 transition-colors duration-200">
              <Zap className="w-3.5 h-3.5" aria-hidden /> рассчитать_проект
            </button>
            <button className="min-h-11 px-5 rounded-lg border border-miniapp-border text-miniapp-foreground/80 font-mono text-xs hover:bg-white/5 transition-colors duration-200">
              попробовать_ai
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  </section>
);

export default HeroTerminal;