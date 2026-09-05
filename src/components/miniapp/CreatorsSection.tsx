import { motion } from "framer-motion";

const items = [
  { emoji: "🤖", title: "Персональный AI-агент", desc: "Твой AI-партнёр, который постепенно погружается в твой бизнес и становится частью твоей работы." },
  { emoji: "🛠", title: "Реальный проект", desc: "Ты создаёшь то, что тебе действительно нужно." },
  { emoji: "🧠", title: "Практика", desc: "Каждую новую AI-возможность сразу проверяем на реальной задаче." },
  { emoji: "👥", title: "Сообщество", desc: "Предприниматели помогают друг другу, делятся решениями и опытом." },
  { emoji: "📚", title: "Skill Hub", desc: "Общая библиотека AI-навыков и готовых решений. То, что один человек однажды сделал и проверил, может использовать вся группа." },
  { emoji: "🔥", title: "Живые разборы", desc: "Созваниваемся, показываем результаты, разбираем проблемы и двигаем проекты дальше." },
];

const CreatorsSection = () => (
  <section className="py-16 px-4" id="creators" aria-labelledby="creators-title">
    <div className="max-w-2xl mx-auto">
      <p className="text-xs uppercase tracking-[0.2em] text-miniapp-neon/80 text-center mb-3">Созидатели 2.0</p>
      <motion.h2
        id="creators-title"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="font-display text-2xl sm:text-4xl font-bold text-center mb-4 text-balance"
      >
        Поэтому я создал «Созидателей»
      </motion.h2>
      <p className="text-sm sm:text-base text-miniapp-foreground/70 text-center mb-3 text-balance">
        Закрытое пространство для предпринимателей, которые хотят создавать свои проекты вместе с AI.
      </p>
      <p className="text-sm text-miniapp-foreground/60 text-center mb-8 text-balance">
        Здесь каждый работает не над абстрактными учебными заданиями, а над своей реальной задачей.
      </p>

      <ul className="grid gap-3 sm:grid-cols-2">
        {items.map((it, i) => (
          <motion.li
            key={it.title}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.06 }}
            className="glass-card rounded-2xl p-5 hover:border-white/15 transition-colors"
          >
            <span className="text-2xl" aria-hidden="true">{it.emoji}</span>
            <h3 className="font-display font-semibold text-base mt-2">{it.title}</h3>
            <p className="text-sm text-miniapp-foreground/65 mt-1.5 leading-relaxed">{it.desc}</p>
          </motion.li>
        ))}
      </ul>
    </div>
  </section>
);

export default CreatorsSection;
