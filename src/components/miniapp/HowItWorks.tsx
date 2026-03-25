import { motion } from "framer-motion";
import { MessageCircle, Bot, CheckCircle } from "lucide-react";

const steps = [
  { icon: MessageCircle, title: "Клиент пишет", desc: "Задаёт вопрос в мессенджере", color: "from-miniapp-purple to-miniapp-blue" },
  { icon: Bot, title: "AI отвечает", desc: "Мгновенно, 24/7, как эксперт", color: "from-miniapp-blue to-miniapp-neon" },
  { icon: CheckCircle, title: "Вы получаете заявку", desc: "Горячий клиент готов к работе", color: "from-miniapp-neon to-miniapp-purple" },
];

const HowItWorks = () => (
  <section className="py-16 px-4">
    <div className="max-w-lg mx-auto">
      <motion.h2
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="text-2xl font-bold text-center mb-10"
      >
        Как это работает
      </motion.h2>
      <div className="space-y-4">
        {steps.map((step, i) => (
          <motion.div
            key={i}
            initial={{ x: -30, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.15 }}
            className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] backdrop-blur-sm"
          >
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center shrink-0`}>
              <step.icon className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-miniapp-muted">Шаг {i + 1}</span>
              </div>
              <p className="font-semibold text-sm">{step.title}</p>
              <p className="text-xs text-miniapp-muted">{step.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default HowItWorks;
