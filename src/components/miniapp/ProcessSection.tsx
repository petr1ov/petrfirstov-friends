import { motion } from "framer-motion";
import BotFunnelCTA from "./BotFunnelCTA";

const steps = [
  {
    n: "01",
    title: "Приносим идею",
    intro: "Неважно, что у тебя в голове:",
    items: [
      "«Хочу приложение»",
      "«Хочу автоматизировать отдел продаж»",
      "«Хочу Telegram-бота»",
      "«Хочу запустить новый продукт»",
      "«Хочу перестать делать эту работу руками»",
    ],
    outro: "Разбираем идею и превращаем её в понятную задачу.",
  },
  {
    n: "02",
    title: "Создаём твоего AI-агента",
    intro: "Не просто открываем ChatGPT и начинаем переписываться. Мы собираем твоего персонального AI-помощника:",
    items: ["с твоим контекстом", "с твоими задачами", "с твоими инструментами", "с твоими правилами работы"],
    outro: "Он начинает понимать твой бизнес и твой проект.",
  },
  {
    n: "03",
    title: "Создаём первый результат",
    intro: "Вместо месяцев подготовки — начинаем делать.",
    items: ["Сайт", "Бот", "CRM", "Приложение", "Автоматизацию", "Прототип"],
    outro: "Главное — чтобы оно начало работать.",
  },
  {
    n: "04",
    title: "Ты учишься управлять AI",
    intro: "Постепенно ты начинаешь понимать:",
    items: [
      "как ставить задачи агенту",
      "как разбивать большую задачу на маленькие",
      "как проверять результат",
      "как исправлять ошибки",
      "как подключать новые инструменты",
      "как превращать свои знания в AI-навыки",
    ],
  },
  {
    n: "05",
    title: "Получаешь работающий MVP",
    intro: "На выходе у тебя не сертификат. У тебя есть работающий результат.",
    items: [],
    outro: "И главное — ты понимаешь, как создавать следующий.",
  },
];

const ProcessSection = () => (
  <section className="py-16 px-4" id="process" aria-labelledby="process-title">
    <div className="max-w-2xl mx-auto">
      <motion.h2
        id="process-title"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="font-display text-2xl sm:text-4xl font-bold text-center mb-10 text-balance"
      >
        Как это работает
      </motion.h2>

      <ol className="space-y-3">
        {steps.map((s, i) => (
          <motion.li
            key={s.n}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.06 }}
            className="glass-card rounded-2xl p-5"
          >
            <div className="flex items-baseline gap-3 mb-2">
              <span className="font-display text-lg font-bold bg-gradient-to-r from-miniapp-purple to-miniapp-blue bg-clip-text text-transparent">
                {s.n}
              </span>
              <h3 className="font-display text-base sm:text-lg font-semibold">{s.title}</h3>
            </div>
            <p className="text-sm text-miniapp-foreground/70 leading-relaxed">{s.intro}</p>
            {s.items.length > 0 && (
              <ul className="mt-3 flex flex-wrap gap-2">
                {s.items.map((it) => (
                  <li key={it} className="rounded-lg bg-white/[0.05] px-2.5 py-1.5 text-xs text-miniapp-foreground/80">
                    {it}
                  </li>
                ))}
              </ul>
            )}
            {s.outro && <p className="mt-3 text-sm text-miniapp-neon/90">{s.outro}</p>}
          </motion.li>
        ))}
      </ol>

      <BotFunnelCTA temp="warm" block="process" label="Пройти шаг 1 прямо сейчас" />
    </div>
  </section>
);

export default ProcessSection;
