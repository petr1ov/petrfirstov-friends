import { motion } from "framer-motion";
import { CheckCircle2, ArrowRight, Lightbulb, Bot, Rocket, Cpu, Award } from "lucide-react";
import BotFunnelCTA from "./BotFunnelCTA";

const ideas = [
  "«Хочу приложение»",
  "«Хочу автоматизировать отдел продаж»",
  "«Хочу Telegram-бота»",
  "«Хочу запустить новый продукт»",
  "«Хочу перестать делать эту работу руками»",
];

const agentFeatures = [
  "с твоим контекстом",
  "с твоими задачами",
  "с твоими инструментами",
  "с твоими правилами работы",
];

const artifacts = ["Сайт", "Бот", "CRM", "Приложение", "Автоматизацию", "Прототип"];

const managementSkills = [
  "как ставить задачи агенту",
  "как разбивать большую задачу на маленькие",
  "как проверять результат",
  "как исправлять ошибки",
  "как подключать новые инструменты",
  "как превращать свои знания в AI-навыки",
];

const ProcessSection = () => (
  <section className="py-16 px-4 relative" id="process" aria-labelledby="process-title">
    <div className="max-w-3xl mx-auto">
      <p className="text-xs uppercase tracking-[0.2em] text-slate-400 text-center mb-3 font-medium">
        Пошаговый процесс
      </p>

      <motion.h2
        id="process-title"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="font-display text-2xl sm:text-4xl font-bold text-center mb-10 text-balance text-white"
      >
        Как это работает
      </motion.h2>

      <div className="space-y-6">
        {/* Step 1 */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass-card rounded-2xl p-6 relative overflow-hidden border border-white/10"
        >
          <div className="flex items-center gap-3 mb-4">
            <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-lg bg-sky-500/20 text-sky-400 border border-sky-500/30">
              01
            </span>
            <h3 className="font-display text-lg sm:text-xl font-bold text-white">Приносим идею</h3>
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            {ideas.map((idea) => (
              <span
                key={idea}
                className="rounded-full bg-white/5 border border-white/10 px-3 py-1 text-xs text-slate-300"
              >
                {idea}
              </span>
            ))}
          </div>

          <p className="text-sm sm:text-base text-slate-300 font-normal leading-relaxed">
            Разбираем идею и превращаем её в понятную задачу.
          </p>
        </motion.div>

        {/* Step 2 */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass-card rounded-2xl p-6 relative overflow-hidden border border-white/10"
        >
          <div className="flex items-center gap-3 mb-4">
            <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-lg bg-purple-500/20 text-purple-400 border border-purple-500/30">
              02
            </span>
            <h3 className="font-display text-lg sm:text-xl font-bold text-white">Создаём твоего AI-агента</h3>
          </div>

          <p className="text-sm sm:text-base text-slate-300 mb-3 font-normal">
            Не просто открываем ChatGPT...
          </p>

          <ul className="grid sm:grid-cols-2 gap-2.5 mb-4">
            {agentFeatures.map((f) => (
              <li key={f} className="flex items-center gap-2.5 text-xs sm:text-sm text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
                <span>{f}</span>
              </li>
            ))}
          </ul>

          <p className="text-sm sm:text-base text-emerald-400 font-medium">
            Он начинает понимать твой бизнес и твой проект.
          </p>
        </motion.div>

        {/* Step 3 */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass-card rounded-2xl p-6 relative overflow-hidden border border-white/10"
        >
          <div className="flex items-center gap-3 mb-4">
            <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              03
            </span>
            <h3 className="font-display text-lg sm:text-xl font-bold text-white">Создаём первый результат</h3>
          </div>

          <p className="text-sm sm:text-base text-slate-300 mb-3 font-normal">
            Вместо месяцев подготовки...
          </p>

          <div className="flex flex-wrap gap-2 mb-4">
            {artifacts.map((a) => (
              <span
                key={a}
                className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-1 text-xs font-medium text-emerald-300"
              >
                {a}
              </span>
            ))}
          </div>

          <p className="text-sm sm:text-base text-white font-medium">
            Главное — чтобы оно начало работать.
          </p>
        </motion.div>

        {/* Step 4 */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass-card rounded-2xl p-6 relative overflow-hidden border border-white/10"
        >
          <div className="flex items-center gap-3 mb-4">
            <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
              04
            </span>
            <h3 className="font-display text-lg sm:text-xl font-bold text-white">Ты учишься управлять AI</h3>
          </div>

          <p className="text-sm sm:text-base text-slate-300 mb-3 font-normal">
            Постепенно ты начинаешь понимать:
          </p>

          <ul className="grid sm:grid-cols-2 gap-2.5">
            {managementSkills.map((s) => (
              <li key={s} className="flex items-center gap-2.5 text-xs sm:text-sm text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </motion.div>

        {/* Step 5 */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass-card rounded-2xl p-6 relative overflow-hidden border border-sky-500/30 bg-sky-950/10 shadow-lg"
        >
          <div className="flex items-center gap-3 mb-4">
            <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-lg bg-sky-500/20 text-sky-400 border border-sky-500/30">
              05
            </span>
            <h3 className="font-display text-lg sm:text-xl font-bold text-white">Получаешь работающий MVP</h3>
          </div>

          <p className="text-sm sm:text-base text-slate-200 mb-2 font-normal leading-relaxed">
            На выходе у тебя не сертификат. У тебя есть работающий результат.
          </p>
          <p className="text-sm sm:text-base text-emerald-400 font-medium">
            И главное — ты понимаешь, как создавать следующий.
          </p>
        </motion.div>
      </div>

      <BotFunnelCTA
        temp="warm"
        block="process"
        label="Пройти шаг 1 прямо сейчас"
      />
    </div>
  </section>
);

export default ProcessSection;
