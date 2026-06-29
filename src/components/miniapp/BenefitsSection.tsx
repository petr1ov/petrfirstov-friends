import { useState } from "react";
import { motion } from "framer-motion";
import { Eye, Target, Users, Edit3, Briefcase, Sparkles, BarChart3, Wallet, Zap, ShieldCheck, CheckCircle2, ArrowRight } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

type Benefit = {
  icon: typeof Eye;
  title: string;
  desc: string;
  gradient: string;
  span?: string;
  details: { intro: string; points: string[]; outro?: string };
};

const benefits: Benefit[] = [
  {
    icon: Eye,
    title: "Полная прозрачность",
    desc: "Личный кабинет в Telegram 24/7, ежедневные отчёты, уведомления о каждой задаче",
    gradient: "from-miniapp-purple to-pink-500",
    span: "sm:col-span-2",
    details: {
      intro: "Вы видите проект так же, как я. Без созвонов «а как там дела?» и без чёрного ящика.",
      points: [
        "Личный кабинет в Telegram Mini App — открыт 24/7",
        "Прогресс в % считается автоматически по закрытым задачам MVP",
        "Ежедневный отчёт: что сделано, что в работе, что дальше",
        "Push-уведомление о каждой завершённой задаче",
        "История правок и комментариев сохраняется",
      ],
      outro: "Вы всегда знаете, за что именно платите сегодня.",
    },
  },
  {
    icon: Target,
    title: "Чёткие границы",
    desc: "Фиксированный MVP-scope. Без расползания бюджета и сроков",
    gradient: "from-miniapp-blue to-cyan-400",
    details: {
      intro: "До старта мы фиксируем, что входит в MVP, а что — в следующие итерации.",
      points: [
        "Чёткий список задач MVP — утверждается письменно",
        "Бюджет и сроки фиксируются на старте",
        "Изменения вне scope — отдельной задачей с оценкой",
        "Никаких «а давайте ещё вот это бесплатно»",
      ],
    },
  },
  {
    icon: Edit3,
    title: "Правки одной кнопкой",
    desc: "Голосом или текстом из Telegram — AI сам создаст задачу",
    gradient: "from-miniapp-neon to-emerald-400",
    details: {
      intro: "Не нужно писать ТЗ или собирать созвон, чтобы внести правку.",
      points: [
        "Кнопка «Внести правку» прямо в кабинете проекта",
        "Текстом или голосом — как удобно",
        "AI сам распарсит запрос и создаст задачу",
        "Вы видите статус правки в реальном времени",
      ],
    },
  },
  {
    icon: Users,
    title: "Команда в проекте",
    desc: "Несколько участников, роли Owner / Client / Viewer, уведомления всем",
    gradient: "from-pink-500 to-rose-500",
    details: {
      intro: "Подключайте к проекту коллег, партнёров, инвесторов — каждому своя роль.",
      points: [
        "Owner — полный доступ, управление участниками",
        "Client — может отправлять правки и комментировать",
        "Viewer — только просмотр прогресса и отчётов",
        "Уведомления получают все участники",
      ],
    },
  },
  {
    icon: Briefcase,
    title: "Реальное портфолио",
    desc: "Задача → Решение → Технологии → Результат. Бюджеты видны",
    gradient: "from-amber-500 to-orange-500",
    details: {
      intro: "Никаких безликих карточек «мы сделали бота». Каждый кейс — полноценная история.",
      points: [
        "Задача клиента и контекст бизнеса",
        "Принятое решение и архитектура",
        "Стек технологий с обоснованием",
        "Измеримый результат и бюджет",
        "Галерея интерфейсов",
      ],
    },
  },
  {
    icon: Sparkles,
    title: "AI на моей стороне",
    desc: "OpenAI, Gemini, Whisper — выбираю оптимальную модель под задачу",
    gradient: "from-violet-500 to-fuchsia-500",
    details: {
      intro: "Я не привязан к одному провайдеру — подбираю модель под задачу и бюджет.",
      points: [
        "GPT-5 / Gemini 2.5 — для умных диалогов и анализа",
        "Whisper — для расшифровки голоса",
        "Image-модели — генерация и редактирование",
        "Через Lovable AI Gateway — без отдельных подписок",
      ],
    },
  },
  {
    icon: BarChart3,
    title: "CRM и аналитика в подарок",
    desc: "Лиды, источники, реферальные ссылки, AI-рассылки — из коробки",
    gradient: "from-cyan-500 to-blue-500",
    span: "sm:col-span-2",
    details: {
      intro: "К любому проекту с воронкой бесплатно идёт мини-CRM на той же платформе.",
      points: [
        "Карточки лидов с историей касаний",
        "Источники и UTM — откуда пришёл клиент",
        "Реферальные ссылки для партнёров",
        "AI-рассылки с персонализацией под каждого",
        "Дашборд с конверсиями и графиками",
      ],
    },
  },
  {
    icon: Wallet,
    title: "Понятная цена",
    desc: "Фиксируется до старта. От 10 000 ₽ до 150 000+ ₽",
    gradient: "from-emerald-500 to-teal-500",
    details: {
      intro: "Цена считается по калькулятору и фиксируется до начала работ.",
      points: [
        "От 10 000 ₽ — простой бот или лендинг",
        "30–80 000 ₽ — Mini App с базой данных",
        "100–150 000+ ₽ — комплексные системы с AI и CRM",
        "Оплата по этапам: предоплата + при сдаче",
      ],
    },
  },
  {
    icon: Zap,
    title: "MVP за недели",
    desc: "Современный стек, переиспользуемые модули — деплой за минуты",
    gradient: "from-yellow-500 to-amber-500",
    details: {
      intro: "Я не пишу всё с нуля — использую проверенные модули и современный стек.",
      points: [
        "React + Vite + Tailwind — быстрый фронт",
        "Supabase — БД, авторизация, файлы, функции",
        "Готовые модули CRM, AI, Telegram — переиспользую",
        "Деплой одним кликом, обновления — за минуты",
      ],
    },
  },
  {
    icon: ShieldCheck,
    title: "Безопасность по умолчанию",
    desc: "RLS на уровне БД, passwordless-вход, защита секретов",
    gradient: "from-indigo-500 to-purple-500",
    span: "sm:col-span-2",
    details: {
      intro: "Безопасность — не опция, а база. Всё «по-взрослому» с первого дня.",
      points: [
        "Row-Level Security на уровне БД — данные изолированы по пользователям",
        "Passwordless-вход через Telegram — никаких паролей в утечках",
        "Секреты и ключи — в защищённом vault, не в коде",
        "Service-role ключи — только на сервере",
        "Регулярный security-скан кода",
      ],
    },
  },
];

const BenefitsSection = () => {
  const [selected, setSelected] = useState<Benefit | null>(null);

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
            <motion.button
              type="button"
              key={i}
              onClick={() => setSelected(b)}
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.04 }}
              className={`relative overflow-hidden rounded-2xl glass-card p-4 sm:p-5 hover:border-white/20 hover:-translate-y-0.5 transition-all group text-left focus-ring ${b.span || ""}`}
              aria-label={`Подробнее: ${b.title}`}
            >
              <div className={`absolute -top-12 -right-12 w-32 h-32 rounded-full bg-gradient-to-br ${b.gradient} opacity-10 blur-2xl group-hover:opacity-20 transition-opacity`} />
              <div className={`relative w-10 h-10 rounded-xl bg-gradient-to-br ${b.gradient} flex items-center justify-center mb-3 shadow-lg`}>
                <b.icon className="w-5 h-5 text-white" aria-hidden="true" />
              </div>
              <h3 className="font-display font-semibold text-base mb-1.5 relative">{b.title}</h3>
              <p className="text-xs sm:text-sm text-miniapp-foreground/65 leading-relaxed relative">{b.desc}</p>
              <span className="relative mt-3 inline-flex items-center gap-1 text-[11px] text-miniapp-foreground/55 group-hover:text-miniapp-neon transition-colors">
                Подробнее <ArrowRight className="w-3 h-3" />
              </span>
            </motion.button>
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

        <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
          <DialogContent className="bg-[hsl(var(--miniapp-bg))] border-white/10 text-[hsl(var(--miniapp-fg))] max-w-lg mx-4 max-h-[90vh] overflow-y-auto p-0">
            {selected && (
              <div>
                <div className={`relative h-28 bg-gradient-to-br ${selected.gradient} overflow-hidden`}>
                  <div className="absolute inset-0 bg-black/30" />
                  <div className="absolute bottom-4 left-6 flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center shadow-lg">
                      <selected.icon className="w-6 h-6 text-white" aria-hidden="true" />
                    </div>
                  </div>
                </div>
                <div className="p-6 space-y-5">
                  <DialogHeader>
                    <DialogTitle className="font-display text-2xl text-balance">{selected.title}</DialogTitle>
                  </DialogHeader>
                  <p className="text-sm text-miniapp-foreground/80 leading-relaxed">{selected.details.intro}</p>
                  <div className="space-y-2.5">
                    {selected.details.points.map((p, i) => (
                      <div key={i} className="flex items-start gap-2.5 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-miniapp-neon shrink-0 mt-0.5" />
                        <span className="leading-relaxed">{p}</span>
                      </div>
                    ))}
                  </div>
                  {selected.details.outro && (
                    <div className="p-3 rounded-xl bg-gradient-to-br from-miniapp-neon/10 to-miniapp-blue/10 border border-miniapp-neon/20">
                      <p className="text-sm text-miniapp-foreground/90 leading-relaxed">{selected.details.outro}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
};

export default BenefitsSection;
