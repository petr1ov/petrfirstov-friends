import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const nots = [
  "Не нужно знать программирование",
  "Не нужно сразу нанимать команду",
  "Не нужно сначала изучить сто AI-инструментов",
];

const path = ["идея", "AI-агент", "первый прототип", "работающий MVP", "самостоятельное создание"];

const CTASection = () => (
  <section className="py-16 px-4 pb-24" aria-labelledby="cta-title">
    <div className="max-w-2xl mx-auto text-center">
      <motion.div initial={{ y: 20, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }} className="relative">
        <div
          aria-hidden="true"
          className="absolute inset-0 -m-8 bg-gradient-to-t from-miniapp-purple/15 via-miniapp-blue/5 to-transparent rounded-3xl blur-xl"
        />

        <div className="relative">
          <h2 id="cta-title" className="font-display text-2xl sm:text-4xl font-bold mb-3 text-balance">
            Что ты давно хочешь создать?
          </h2>
          <p className="text-sm sm:text-base text-miniapp-foreground/70 mb-6 max-w-md mx-auto text-balance">
            Возможно, именно сейчас самое время перестать откладывать.
          </p>

          <ul className="grid gap-2 mb-6 text-left">
            {nots.map((n) => (
              <li key={n} className="glass-card rounded-xl px-4 py-3 text-sm text-miniapp-foreground/75">
                {n}
              </li>
            ))}
          </ul>

          <p className="text-sm text-miniapp-foreground mb-6">
            Нужна идея и готовность начать её создавать.
          </p>

          <ol className="flex flex-wrap justify-center items-center gap-x-2 gap-y-2 mb-8">
            {path.map((p, i) => (
              <li key={p} className="flex items-center gap-2">
                <span className="rounded-full bg-white/[0.06] border border-white/10 px-3 py-1.5 text-xs text-miniapp-foreground/80">
                  {p}
                </span>
                {i < path.length - 1 && <ArrowRight className="w-3 h-3 text-miniapp-foreground/40" aria-hidden="true" />}
              </li>
            ))}
          </ol>

          <p className="font-display text-lg font-semibold mb-5">Давай создадим что-нибудь.</p>

          <a
            href="https://t.me/PetrFirstovBot?start=warm_start"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 min-h-12 px-8 rounded-xl bg-gradient-to-r from-miniapp-purple to-miniapp-blue text-white font-semibold text-sm shadow-xl shadow-miniapp-purple/40 hover:shadow-miniapp-purple/60 hover:scale-[1.02] active:scale-[0.98] transition-all focus-ring"
          >
            Начать <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </a>

          <p className="text-xs text-miniapp-foreground/60 mt-4">
            или напишите{" "}
            <a href="https://t.me/PetrFirstovBot?start=warm_start" className="text-miniapp-purple hover:underline focus-ring rounded">
              @PetrFirstovBot
            </a>
          </p>
        </div>
      </motion.div>
    </div>
  </section>
);

export default CTASection;
