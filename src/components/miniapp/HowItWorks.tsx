import { motion } from "framer-motion";
import { MessageCircle, Bot, CheckCircle } from "lucide-react";

const steps = [
  { icon: MessageCircle, title: "Клиент пишет", desc: "Задаёт вопрос в мессенджере", color: "from-miniapp-purple to-miniapp-blue" },
  { icon: Bot, title: "AI отвечает", desc: "Мгновенно, 24/7, как эксперт", color: "from-miniapp-blue to-miniapp-neon" },
  { icon: CheckCircle, title: "Вы получаете заявку", desc: "Горячий клиент готов к работе", color: "from-miniapp-neon to-miniapp-purple" },
];

const HowItWorks = () => (
  <section className="py-16 px-4" aria-labelledby="how-title">
    <div className="max-w-2xl mx-auto">
      <motion.h2
        id="how-title"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="font-display text-3xl sm:text-4xl font-bold text-center mb-3 text-balance"
      >
        Как это работает
      </motion.h2>
      <p className="text-center text-miniapp-foreground/65 text-sm sm:text-base mb-10">
        Три шага — от запроса клиента до готовой заявки
      </p>
      <ol className="grid gap-3 sm:grid-cols-3" role="list">
        {steps.map((step, i) => (
          <motion.li
            key={i}
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.12 }}
            className="relative glass-card rounded-2xl p-5 hover:border-white/15 transition-colors"
          >
            <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center mb-3 shadow-lg shadow-black/20`}>
              <step.icon className="w-5 h-5 text-white" aria-hidden="true" />
            </div>
            <span className="text-[10px] uppercase tracking-wider text-miniapp-foreground/50 font-semibold">
              Шаг {i + 1}
            </span>
            <p className="font-display font-semibold text-base mt-1">{step.title}</p>
            <p className="text-sm text-miniapp-foreground/65 mt-1 leading-relaxed">{step.desc}</p>
          </motion.li>
        ))}
      </ol>
    </div>
  </section>
);

export default HowItWorks;
