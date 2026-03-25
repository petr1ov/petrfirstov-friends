import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowLeft, Calculator } from "lucide-react";

const questions = [
  {
    q: "Тип проекта",
    options: [
      { label: "Ботовизитка", value: "botcard", base: 10000 },
      { label: "AI-бот", value: "aibot", base: 15000 },
      { label: "Голосовой бот", value: "voice", base: 20000 },
      { label: "Мини-приложение", value: "miniapp", base: 30000 },
    ],
  },
  {
    q: "Платформа",
    options: [
      { label: "Telegram", value: "telegram", mult: 1 },
      { label: "VK", value: "vk", mult: 1.1 },
      { label: "WhatsApp", value: "whatsapp", mult: 1.2 },
      { label: "MAX", value: "max", mult: 1.15 },
    ],
  },
  {
    q: "Нужен ли AI?",
    options: [
      { label: "Да, полноценный AI", value: "full_ai", add: 15000 },
      { label: "Базовый AI", value: "basic_ai", add: 5000 },
      { label: "Без AI", value: "no_ai", add: 0 },
    ],
  },
  {
    q: "Срок",
    options: [
      { label: "Срочно (1-2 нед)", value: "urgent", mult: 1.5 },
      { label: "Стандарт (3-4 нед)", value: "standard", mult: 1 },
      { label: "Не спешу (1-2 мес)", value: "relaxed", mult: 0.9 },
    ],
  },
];

const CalculatorQuiz = () => {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, any>>({});
  const [showResult, setShowResult] = useState(false);

  const selectOption = (option: any) => {
    const newAnswers = { ...answers, [step]: option };
    setAnswers(newAnswers);

    if (step < questions.length - 1) {
      setStep(step + 1);
    } else {
      setShowResult(true);
    }
  };

  const calcPrice = () => {
    const base = answers[0]?.base || 10000;
    const platformMult = answers[1]?.mult || 1;
    const aiAdd = answers[2]?.add || 0;
    const timeMult = answers[3]?.mult || 1;
    return Math.round((base * platformMult + aiAdd) * timeMult);
  };

  const calcWeeks = () => {
    if (answers[3]?.value === "urgent") return "1-2 недели";
    if (answers[3]?.value === "relaxed") return "4-8 недель";
    return "2-4 недели";
  };

  const reset = () => {
    setStep(0);
    setAnswers({});
    setShowResult(false);
  };

  return (
    <section className="py-16 px-4" id="calculator">
      <div className="max-w-lg mx-auto">
        <motion.h2
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-2xl font-bold text-center mb-2"
        >
          Калькулятор проекта
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-miniapp-muted text-sm text-center mb-8"
        >
          4 вопроса — и вы узнаете примерную стоимость
        </motion.p>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          className="rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-xl p-5"
        >
          <AnimatePresence mode="wait">
            {!showResult ? (
              <motion.div
                key={step}
                initial={{ x: 30, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -30, opacity: 0 }}
                transition={{ duration: 0.25 }}
              >
                {/* Progress */}
                <div className="flex gap-1.5 mb-6">
                  {questions.map((_, i) => (
                    <div
                      key={i}
                      className={`h-1 flex-1 rounded-full transition-colors ${
                        i <= step ? "bg-miniapp-purple" : "bg-white/10"
                      }`}
                    />
                  ))}
                </div>

                <p className="text-xs text-miniapp-muted mb-1">Вопрос {step + 1} из {questions.length}</p>
                <p className="font-semibold mb-4">{questions[step].q}</p>

                <div className="space-y-2">
                  {questions[step].options.map((opt, i) => (
                    <button
                      key={i}
                      onClick={() => selectOption(opt)}
                      className={`w-full text-left px-4 py-3 rounded-xl border text-sm transition-all hover:scale-[1.01] active:scale-[0.99] ${
                        answers[step]?.value === opt.value
                          ? "border-miniapp-purple bg-miniapp-purple/10 text-white"
                          : "border-white/[0.08] bg-white/[0.02] text-miniapp-foreground hover:border-white/20"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>

                {step > 0 && (
                  <button onClick={() => setStep(step - 1)} className="mt-4 flex items-center gap-1 text-xs text-miniapp-muted hover:text-miniapp-foreground transition-colors">
                    <ArrowLeft className="w-3 h-3" /> Назад
                  </button>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="result"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-center"
              >
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-miniapp-purple to-miniapp-blue flex items-center justify-center mx-auto mb-4">
                  <Calculator className="w-6 h-6 text-white" />
                </div>
                <p className="text-sm text-miniapp-muted mb-1">Примерная стоимость</p>
                <p className="text-3xl font-extrabold bg-gradient-to-r from-miniapp-purple to-miniapp-neon bg-clip-text text-transparent mb-1">
                  от {calcPrice().toLocaleString("ru-RU")} ₽
                </p>
                <p className="text-xs text-miniapp-muted mb-6">Срок: {calcWeeks()}</p>

                <div className="space-y-2">
                  <a
                    href="https://t.me/petrfirstov"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full py-3 rounded-xl bg-gradient-to-r from-miniapp-purple to-miniapp-blue text-white font-semibold text-sm text-center shadow-lg shadow-miniapp-purple/25"
                  >
                    Обсудить проект
                  </a>
                  <button
                    onClick={reset}
                    className="w-full py-3 rounded-xl bg-white/5 border border-white/10 text-miniapp-muted text-sm hover:text-white transition-colors"
                  >
                    Пересчитать
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
};

export default CalculatorQuiz;
