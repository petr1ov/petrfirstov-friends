import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowLeft, Calculator, Check, RefreshCw } from "lucide-react";

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
    <section className="py-16 px-4 relative" id="calculator" aria-labelledby="calc-title">
      <div className="max-w-2xl mx-auto">
        <p className="text-xs uppercase tracking-[0.2em] text-slate-400 text-center mb-3 font-medium">
          Интерактивный расчет
        </p>

        <motion.h2
          id="calc-title"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="font-display text-3xl sm:text-4xl font-bold text-center mb-3 text-balance text-white"
        >
          Калькулятор проекта
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-slate-300 text-sm sm:text-base text-center mb-8 font-normal"
        >
          4 вопроса — и вы узнаете примерную стоимость
        </motion.p>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          className="rounded-2xl glass-card p-4 sm:p-8 border border-white/15 shadow-2xl relative"
        >
          <AnimatePresence mode="wait">
            {!showResult ? (
              <motion.div
                key={step}
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -20, opacity: 0 }}
                transition={{ duration: 0.25 }}
              >
                {/* Progress bar */}
                <div
                  className="flex gap-2 mb-6"
                  role="progressbar"
                  aria-valuenow={step + 1}
                  aria-valuemin={1}
                  aria-valuemax={questions.length}
                  aria-label={`Шаг ${step + 1} из ${questions.length}`}
                >
                  {questions.map((_, i) => (
                    <div
                      key={i}
                      className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                        i <= step
                          ? "bg-gradient-to-r from-purple-500 to-sky-400"
                          : "bg-white/10"
                      }`}
                    />
                  ))}
                </div>

                <p className="text-xs font-mono text-sky-400 mb-1">
                  Вопрос {step + 1} из {questions.length}
                </p>
                <h3 className="font-display text-xl font-bold text-white mb-5">
                  {questions[step].q}
                </h3>

                <div className="space-y-2.5" role="radiogroup" aria-label={questions[step].q}>
                  {questions[step].options.map((opt, i) => {
                    const isSelected = answers[step]?.value === opt.value;
                    return (
                      <button
                        key={i}
                        type="button"
                        role="radio"
                        aria-checked={isSelected}
                        onClick={() => selectOption(opt)}
                        className={`w-full text-left px-5 min-h-12 rounded-xl border text-sm font-medium transition-all flex items-center justify-between focus-ring ${
                          isSelected
                            ? "border-sky-400 bg-sky-500/20 text-white shadow-md shadow-sky-500/20"
                            : "border-white/10 bg-white/5 text-slate-200 hover:border-white/25 hover:bg-white/10"
                        }`}
                      >
                        <span>{opt.label}</span>
                        {isSelected && <Check className="w-4 h-4 text-sky-400" />}
                      </button>
                    );
                  })}
                </div>

                {step > 0 && (
                  <button
                    type="button"
                    onClick={() => setStep(step - 1)}
                    className="mt-6 flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors focus-ring rounded px-2 py-1"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Назад</span>
                  </button>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="result"
                initial={{ scale: 0.92, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-center py-2"
              >
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-sky-500 flex items-center justify-center mx-auto mb-4 shadow-xl shadow-purple-600/30">
                  <Calculator className="w-8 h-8 text-white" aria-hidden="true" />
                </div>
                <p className="text-xs uppercase tracking-wider text-slate-400 mb-1 font-mono">
                  Примерная стоимость
                </p>
                <p className="font-display text-3xl sm:text-5xl font-extrabold bg-gradient-to-r from-purple-400 via-sky-400 to-emerald-400 bg-clip-text text-transparent mb-1 break-words">
                  от {calcPrice().toLocaleString("ru-RU")} ₽
                </p>
                <p className="text-xs sm:text-sm text-slate-300 mb-6 font-normal">
                  Срок: {calcWeeks()}
                </p>

                <div className="space-y-3 max-w-sm mx-auto">
                  <a
                    href="https://t.me/PetrFirstovBot?start=hot_calculator"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full min-h-12 leading-[3rem] rounded-xl bg-gradient-to-r from-purple-600 to-sky-500 hover:from-purple-500 hover:to-sky-400 text-white font-semibold text-sm text-center shadow-xl shadow-purple-600/30 hover:scale-[1.01] transition-transform focus-ring"
                  >
                    Обсудить проект
                  </a>
                  <button
                    type="button"
                    onClick={reset}
                    className="w-full min-h-12 rounded-xl bg-white/5 border border-white/10 text-slate-300 text-sm font-medium hover:text-white hover:bg-white/10 transition-colors focus-ring flex items-center justify-center gap-2"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Пересчитать</span>
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
