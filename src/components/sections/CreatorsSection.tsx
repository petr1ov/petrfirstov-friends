import { motion } from "framer-motion";
import { Bot, Wrench, Zap, Users, BookOpen, Flame, Sparkles } from "lucide-react";
import BotFunnelCTA from "./BotFunnelCTA";

const items = [
  {
    icon: Bot,
    title: "Персональный AI-агент",
    desc: "Твой AI-партнёр, который постепенно погружается в твой бизнес и становится частью твоей работы.",
    accent: "from-purple-500/20 to-indigo-500/20 border-purple-500/30 text-purple-400",
  },
  {
    icon: Wrench,
    title: "Реальный проект",
    desc: "Ты создаёшь то, что тебе действительно нужно.",
    accent: "from-sky-500/20 to-blue-500/20 border-sky-500/30 text-sky-400",
  },
  {
    icon: Zap,
    title: "Практика",
    desc: "Каждую новую AI-возможность сразу проверяем на реальной задаче.",
    accent: "from-amber-500/20 to-orange-500/20 border-amber-500/30 text-amber-400",
  },
  {
    icon: Users,
    title: "Сообщество",
    desc: "Предприниматели помогают друг другу, делятся решениями и опытом.",
    accent: "from-emerald-500/20 to-teal-500/20 border-emerald-500/30 text-emerald-400",
  },
  {
    icon: BookOpen,
    title: "Skill Hub",
    desc: "Общая библиотека AI-навыков и готовых решений. То, что один человек однажды сделал и проверил, может использовать вся группа.",
    accent: "from-pink-500/20 to-rose-500/20 border-pink-500/30 text-pink-400",
  },
  {
    icon: Flame,
    title: "Живые разборы",
    desc: "Созваниваемся, показываем результаты, разбираем проблемы и двигаем проекты дальше.",
    accent: "from-red-500/20 to-orange-500/20 border-red-500/30 text-red-400",
  },
];

const CreatorsSection = () => (
  <section className="py-16 px-4 relative" id="creators" aria-labelledby="creators-title">
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-purple-500/10 text-purple-300 border border-purple-500/30 mb-3">
          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          Созидатели 2.0
        </span>

        <motion.h2
          id="creators-title"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="font-display text-2xl sm:text-4xl font-bold text-white mb-4 text-balance"
        >
          Поэтому я создал «Созидателей»
        </motion.h2>

        <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto mb-2 font-normal leading-relaxed">
          Закрытое пространство для предпринимателей, которые хотят создавать свои проекты вместе с AI.
        </p>
        <p className="text-sm sm:text-base text-sky-400 font-medium max-w-xl mx-auto text-balance">
          Здесь каждый работает не над абстрактными учебными заданиями, а над своей реальной задачей.
        </p>
      </div>

      {/* Hero club illustration */}
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        className="rounded-2xl overflow-hidden glass-card p-2 border border-white/15 mb-8 shadow-2xl group"
      >
        <div className="relative rounded-xl overflow-hidden aspect-[21/9] sm:aspect-[24/9] bg-slate-950">
          <img
            src="/images/creators.jpg"
            alt="Созидатели 2.0 - Клуб и коворкинг предпринимателей"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/30 to-transparent" />
          <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-semibold text-white tracking-wide">
                Еженедельные мастермайнды и живые созвоны
              </span>
            </div>
            <span className="text-[11px] font-mono text-purple-300 bg-purple-900/40 px-2.5 py-1 rounded-full border border-purple-500/30 hidden sm:inline-block">
              Skill Hub Repository
            </span>
          </div>
        </div>
      </motion.div>

      {/* Grid of 6 features */}
      <ul className="grid gap-3.5 sm:grid-cols-2" role="list">
        {items.map((item, i) => (
          <motion.li
            key={item.title}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05 }}
            className="glass-card rounded-2xl p-5 border border-white/10 hover:border-white/20 transition-all hover:bg-white/5 flex flex-col justify-between"
          >
            <div>
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${item.accent} flex items-center justify-center mb-3 border`}>
                <item.icon className="w-5 h-5" aria-hidden="true" />
              </div>
              <h3 className="font-display font-semibold text-base sm:text-lg text-white mb-1.5">
                {item.title}
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                {item.desc}
              </p>
            </div>
          </motion.li>
        ))}
      </ul>

      <BotFunnelCTA
        temp="club"
        block="creators"
        label="Вступить в сообщество"
        hint="Первый прототип — уже на первой неделе"
        variant="solid"
      />
    </div>
  </section>
);

export default CreatorsSection;
