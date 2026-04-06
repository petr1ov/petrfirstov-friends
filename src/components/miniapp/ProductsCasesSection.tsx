import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CreditCard, Smartphone, Server, ChevronRight, X, Rocket, Calculator } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

type Case = {
  title: string;
  subtitle: string;
  price: string;
  description: string;
  features: string[];
  result: string;
};

type Category = {
  icon: React.ElementType;
  name: string;
  price: string;
  gradient: string;
  cases: Case[];
};

const categories: Category[] = [
  {
    icon: CreditCard,
    name: "AI-визитки",
    price: "от 10 000 ₽",
    gradient: "from-miniapp-purple to-pink-500",
    cases: [
      {
        title: "ИИ-визитка для риелтора",
        subtitle: "Автоматизация продаж недвижимости",
        price: "15 000 ₽",
        description: "Telegram-бот, который отвечает на вопросы клиентов о недвижимости, собирает заявки и квалифицирует лидов автоматически.",
        features: [
          "Автоматические ответы по объектам",
          "Сбор и квалификация заявок",
          "Каталог недвижимости в боте",
          "Уведомления риелтору о горячих лидах",
        ],
        result: "Автоответы → сбор заявок → рост записей без переписки",
      },
      {
        title: "ИИ-визитка для эксперта по EQ",
        subtitle: "Привлечение клиентов на консультации",
        price: "10 000 ₽",
        description: "Бот-визитка, который рассказывает об услугах эксперта, отвечает на частые вопросы и записывает на консультацию.",
        features: [
          "Презентация услуг и кейсов",
          "Ответы на типовые вопросы",
          "Онлайн-запись на консультацию",
          "Прогрев через контент",
        ],
        result: "Клиенты узнают → доверяют → записываются без участия эксперта",
      },
    ],
  },
  {
    icon: Smartphone,
    name: "Приложения",
    price: "от 30 000 ₽",
    gradient: "from-miniapp-blue to-cyan-400",
    cases: [
      {
        title: "Город+",
        subtitle: "Агрегатор мероприятий",
        price: "80 000 ₽",
        description: "Полноценная платформа для поиска и продвижения мероприятий в городе. Telegram-бот + сайт + админ-панель.",
        features: [
          "Telegram-бот для поиска событий",
          "Сайт с каталогом мероприятий",
          "Админ-панель для организаторов",
          "Система аналитики и статистики",
        ],
        result: "Люди находят события → организаторы получают клиентов",
      },
      {
        title: "Мини-приложение для бизнеса",
        subtitle: "Полноценный сервис в Telegram",
        price: "от 30 000 ₽",
        description: "Кастомное мини-приложение внутри Telegram с каталогом, оплатой и личным кабинетом.",
        features: [
          "Каталог товаров / услуг",
          "Интеграция с оплатой",
          "Личный кабинет клиента",
          "Push-уведомления через бота",
        ],
        result: "Клиент покупает прямо в Telegram без перехода на сайт",
      },
    ],
  },
  {
    icon: Server,
    name: "Сервисы",
    price: "от 60 000 ₽",
    gradient: "from-miniapp-neon to-emerald-400",
    cases: [
      {
        title: "AI-ассистент с ЛК",
        subtitle: "Цифровой сотрудник 24/7",
        price: "120 000 ₽",
        description: "Интеллектуальный ассистент с личным кабинетом, геймификацией и автоматической воронкой продаж.",
        features: [
          "ИИ-ассистент с личным кабинетом",
          "Геймификация для вовлечения",
          "Ответы 24/7 на любые вопросы",
          "Доведение до заявки автоматически",
        ],
        result: "Отвечает 24/7 → ведёт диалог → доводит до заявки",
      },
      {
        title: "Голосовой бот для обработки звонков",
        subtitle: "Автоматизация колл-центра",
        price: "от 60 000 ₽",
        description: "Голосовой ИИ-бот, который принимает звонки, отвечает на вопросы и записывает клиентов.",
        features: [
          "Распознавание речи в реальном времени",
          "Ответы по сценарию и свободный диалог",
          "Запись и транскрибация звонков",
          "Интеграция с CRM",
        ],
        result: "Звонки обрабатываются 24/7 → ни один клиент не потерян",
      },
    ],
  },
];

const ProductsCasesSection = () => {
  const [activeCategory, setActiveCategory] = useState<number | null>(null);
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);

  const handleCTA = (action: string) => {
    const tgLink = action === "calculate"
      ? "https://t.me/PetrFirstovBot?start=src_calculate"
      : "https://t.me/PetrFirstovBot?start=src_want_same";
    window.open(tgLink, "_blank");
  };

  return (
    <section className="py-16 px-4" id="cases">
      <div className="max-w-lg mx-auto">
        <motion.h2
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-2xl font-bold text-center mb-2"
        >
          Продукты и кейсы
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-miniapp-muted text-sm text-center mb-8"
        >
          Выберите категорию — покажем реальные проекты
        </motion.p>

        {/* Category cards */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {categories.map((cat, i) => (
            <motion.button
              key={i}
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              onClick={() => setActiveCategory(activeCategory === i ? null : i)}
              className={`relative p-4 rounded-2xl border text-center transition-all ${
                activeCategory === i
                  ? "bg-gradient-to-b border-white/20 shadow-lg shadow-white/5"
                  : "bg-white/[0.03] border-white/[0.06] hover:border-white/[0.12]"
              }`}
              style={activeCategory === i ? {
                background: `linear-gradient(to bottom, hsl(var(--miniapp-purple) / 0.15), transparent)`
              } : undefined}
            >
              <div className={`w-10 h-10 rounded-xl mx-auto mb-2 flex items-center justify-center bg-gradient-to-br ${cat.gradient}`}>
                <cat.icon className="w-5 h-5 text-white" />
              </div>
              <p className="font-semibold text-xs mb-0.5">{cat.name}</p>
              <p className="text-[10px] text-miniapp-neon font-bold">{cat.price}</p>
            </motion.button>
          ))}
        </div>

        {/* Cases list */}
        <AnimatePresence mode="wait">
          {activeCategory !== null && (
            <motion.div
              key={activeCategory}
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="space-y-3">
                {categories[activeCategory].cases.map((c, j) => (
                  <motion.div
                    key={j}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: j * 0.1 }}
                    onClick={() => setSelectedCase(c)}
                    className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] cursor-pointer hover:border-white/[0.15] transition-all group"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-semibold text-sm">{c.title}</p>
                        <p className="text-xs text-miniapp-muted">{c.subtitle}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-miniapp-muted group-hover:text-white transition-colors" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-miniapp-neon">{c.price}</span>
                      <span className="text-[10px] text-miniapp-muted">Подробнее →</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Case detail popup */}
        <Dialog open={!!selectedCase} onOpenChange={() => setSelectedCase(null)}>
          <DialogContent className="bg-[hsl(var(--miniapp-bg))] border-white/10 text-[hsl(var(--miniapp-fg))] max-w-md mx-4 max-h-[85vh] overflow-y-auto">
            {selectedCase && (
              <>
                <DialogHeader>
                  <DialogTitle className="text-lg">{selectedCase.title}</DialogTitle>
                  <DialogDescription className="text-miniapp-muted text-sm">
                    {selectedCase.subtitle} · <span className="text-miniapp-neon font-semibold">{selectedCase.price}</span>
                  </DialogDescription>
                </DialogHeader>

                <p className="text-sm text-miniapp-muted leading-relaxed">
                  {selectedCase.description}
                </p>

                <div className="space-y-2">
                  <p className="text-xs font-semibold text-miniapp-muted uppercase tracking-wider">Что входит</p>
                  {selectedCase.features.map((f, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <div className="w-1.5 h-1.5 rounded-full bg-miniapp-purple shrink-0" />
                      {f}
                    </div>
                  ))}
                </div>

                <div className="p-3 rounded-xl bg-miniapp-neon/5 border border-miniapp-neon/10">
                  <p className="text-xs text-miniapp-neon">✨ {selectedCase.result}</p>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => handleCTA("calculate")}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-gradient-to-r from-miniapp-purple to-miniapp-blue text-white text-sm font-semibold"
                  >
                    <Calculator className="w-4 h-4" />
                    Рассчитать проект
                  </button>
                  <button
                    onClick={() => handleCTA("want_same")}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-miniapp-neon/10 border border-miniapp-neon/20 text-miniapp-neon text-sm font-semibold"
                  >
                    <Rocket className="w-4 h-4" />
                    Хочу такой же
                  </button>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
};

export default ProductsCasesSection;
