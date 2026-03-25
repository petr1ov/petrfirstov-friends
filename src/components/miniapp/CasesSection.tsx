import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Globe, Bot, Brain } from "lucide-react";

const cases = [
  {
    icon: Globe,
    title: "Город+",
    subtitle: "Агрегатор мероприятий",
    price: "≈ 80 000 ₽",
    color: "from-blue-500 to-cyan-400",
    details: [
      "Telegram-бот для поиска событий",
      "Сайт с каталогом мероприятий",
      "Админ-панель для организаторов",
      "Система аналитики и статистики",
    ],
    result: "Люди находят события → организаторы получают клиентов",
  },
  {
    icon: Bot,
    title: "Боты для экспертов",
    subtitle: "Автоматизация продаж",
    price: "от 10 000 ₽",
    color: "from-miniapp-purple to-pink-500",
    details: [
      "ИИ-визитка для риелтора",
      "ИИ-визитка для эксперта по EQ",
      "Автоматические ответы клиентам",
      "Сбор и квалификация заявок",
    ],
    result: "Автоответы → сбор заявок → рост записей без переписки",
  },
  {
    icon: Brain,
    title: "AI-ассистенты",
    subtitle: "Цифровые сотрудники",
    price: "≈ 120 000 ₽",
    color: "from-miniapp-neon to-emerald-400",
    details: [
      "ИИ-ассистент с личным кабинетом",
      "Геймификация для вовлечения",
      "Ответы 24/7 на любые вопросы",
      "Доведение до заявки автоматически",
    ],
    result: "Отвечают 24/7 → ведут диалог → доводят до заявки",
  },
];

const CasesSection = () => {
  const [expanded, setExpanded] = useState<number | null>(null);

  return (
    <section className="py-16 px-4" id="cases">
      <div className="max-w-lg mx-auto">
        <motion.h2
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-2xl font-bold text-center mb-2"
        >
          Кейсы
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-miniapp-muted text-sm text-center mb-8"
        >
          Реальные проекты, которые уже работают
        </motion.p>

        <div className="space-y-3">
          {cases.map((c, i) => (
            <motion.div
              key={i}
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="rounded-2xl bg-white/[0.03] border border-white/[0.06] overflow-hidden backdrop-blur-sm"
            >
              <button
                onClick={() => setExpanded(expanded === i ? null : i)}
                className="w-full p-4 flex items-center gap-3 text-left"
              >
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${c.color} flex items-center justify-center shrink-0`}>
                  <c.icon className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm">{c.title}</p>
                  <p className="text-xs text-miniapp-muted">{c.subtitle}</p>
                </div>
                <span className="text-xs font-semibold text-miniapp-neon shrink-0">{c.price}</span>
                <ChevronDown className={`w-4 h-4 text-miniapp-muted transition-transform ${expanded === i ? "rotate-180" : ""}`} />
              </button>

              <AnimatePresence>
                {expanded === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 space-y-3">
                      <div className="space-y-1.5">
                        {c.details.map((d, j) => (
                          <div key={j} className="flex items-center gap-2 text-xs text-miniapp-muted">
                            <div className="w-1 h-1 rounded-full bg-miniapp-purple shrink-0" />
                            {d}
                          </div>
                        ))}
                      </div>
                      <div className="p-3 rounded-xl bg-miniapp-neon/5 border border-miniapp-neon/10">
                        <p className="text-xs text-miniapp-neon">✨ {c.result}</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CasesSection;
