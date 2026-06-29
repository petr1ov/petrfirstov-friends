import { motion } from "framer-motion";
import { Eye, Target, Users, Edit3, Briefcase, Sparkles, BarChart3, Wallet, Zap, ShieldCheck } from "lucide-react";

const benefits = [
  {
    icon: Eye,
    title: "Полная прозрачность",
    desc: "Личный кабинет в Telegram 24/7, ежедневные отчёты, уведомления о каждой задаче",
    gradient: "from-miniapp-purple to-pink-500",
    span: "sm:col-span-2",
  },
  {
    icon: Target,
    title: "Чёткие границы",
    desc: "Фиксированный MVP-scope. Без расползания бюджета и сроков",
    gradient: "from-miniapp-blue to-cyan-400",
  },
  {
    icon: Edit3,
    title: "Правки одной кнопкой",
    desc: "Голосом или текстом из Telegram — AI сам создаст задачу",
    gradient: "from-miniapp-neon to-emerald-400",
  },
  {
    icon: Users,
    title: "Команда в проекте",
    desc: "Несколько участников, роли Owner / Client / Viewer, уведомления всем",
    gradient: "from-pink-500 to-rose-500",
  },
  {
    icon: Briefcase,
    title: "Реальное портфолио",
    desc: "Задача → Решение → Технологии → Результат. Бюджеты видны",
    gradient: "from-amber-500 to-orange-500",
  },
  {
    icon: Sparkles,
    title: "AI на моей стороне",
    desc: "OpenAI, Gemini, Whisper — выбираю оптимальную модель под задачу",
    gradient: "from-violet-500 to-fuchsia-500",
  },
  {
    icon: BarChart3,
    title: "CRM и аналитика в подарок",
    desc: "Лиды, источники, реферальные ссылки, AI-рассылки — из коробки",
    gradient: "from-cyan-500 to-blue-500",
    span: "sm:col-span-2",
  },
  {
    icon: Wallet,
    title: "Понятная цена",
    desc: "Фиксируется до старта. От 10 000 ₽ до 150 000+ ₽",
    gradient: "from-emerald-500 to-teal-500",
  },
  {
    icon: Zap,
    title: "MVP за недели",
    desc: "Современный стек, переиспользуемые модули — деплой за минуты",
    gradient: "from-yellow-500 to-amber-500",
  },
  {
    icon: ShieldCheck,
    title: "Безопасность по умолчанию",
    desc: "RLS на уровне БД, passwordless-вход, защита секретов",
    gradient: "from-indigo-500 to-purple-500",
    span: "sm:col-span-2",
  },
];

const BenefitsSection = () => {
  return (
    <section className="py-16 px-4" id="benefits" aria-labelledby="benefits-title">
      <div className="max-w-3xl mx-auto">
        <motion.h2
          id="benefits-title"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-display text-3xl sm:text-4xl font-bold text-center mb-3 text-balance"
        >
          Почему со мной удобно
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-miniapp-foreground/65 text-sm sm:text-base text-center mb-10"
        >
          10 причин, по которым клиенты остаются на следующий проект
        </motion.p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {benefits.map((b, i) => (
            <motion.div
              key={i}
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.04 }}
              className={`relative overflow-hidden rounded-2xl glass-card p-4 sm:p-5 hover:border-white/20 transition-all group ${b.span || ""}`}
            >
              <div className={`absolute -top-12 -right-12 w-32 h-32 rounded-full bg-gradient-to-br ${b.gradient} opacity-10 blur-2xl group-hover:opacity-20 transition-opacity`} />
              <div className={`relative w-10 h-10 rounded-xl bg-gradient-to-br ${b.gradient} flex items-center justify-center mb-3 shadow-lg`}>
                <b.icon className="w-5 h-5 text-white" aria-hidden="true" />
              </div>
              <h3 className="font-display font-semibold text-base mb-1.5 relative">{b.title}</h3>
              <p className="text-xs sm:text-sm text-miniapp-foreground/65 leading-relaxed relative">{b.desc}</p>
            </motion.div>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center text-sm text-miniapp-foreground/55 mt-8 italic"
        >
          Вы получаете не «сайт» или «бота» — а <span className="text-miniapp-neon font-medium not-italic">управляемый продукт</span> с прозрачным процессом.
        </motion.p>
      </div>
    </section>
  );
};

export default BenefitsSection;
