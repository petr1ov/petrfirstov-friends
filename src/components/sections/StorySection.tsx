import { motion } from "framer-motion";
import { Quote, Sparkles, Compass, Cpu, History } from "lucide-react";
import BotFunnelCTA from "./BotFunnelCTA";

const StorySection = () => (
  <section className="py-16 px-4 relative" id="story" aria-labelledby="story-title">
    <div className="max-w-3xl mx-auto">
      <p className="text-xs uppercase tracking-[0.2em] text-slate-400 text-center mb-3 font-medium">
        Моя история
      </p>

      {/* Main Intro Card with Photo & Greeting */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="glass-card rounded-2xl p-6 sm:p-8 sm:flex sm:items-center sm:gap-6 border border-white/10 shadow-xl mb-6 relative overflow-hidden group"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-16 -left-16 w-56 h-56 bg-purple-600/15 rounded-full blur-3xl"
        />

        {/* Photo with glowing aura */}
        <div className="relative w-28 h-28 mx-auto sm:mx-0 mb-4 sm:mb-0 shrink-0">
          <div
            aria-hidden="true"
            className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-500 via-sky-500 to-emerald-400 blur-md opacity-60 animate-pulse"
          />
          <img
            src="/petr-firstov.jpg"
            alt="Пётр Фирстов"
            loading="lazy"
            decoding="async"
            referrerPolicy="no-referrer"
            className="relative w-28 h-28 rounded-full object-cover ring-2 ring-white/20 shadow-xl"
          />
          <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-slate-900 border border-emerald-400/40 flex items-center justify-center shadow-md">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="w-2 h-2 rounded-full bg-emerald-400 absolute" />
          </div>
        </div>

        {/* Name & Title */}
        <div className="text-center sm:text-left relative z-10">
          <h2 id="story-title" className="font-display text-2xl sm:text-3xl font-bold text-white mb-1.5">
            Привет, я Пётр Фирстов
          </h2>
          <p className="text-sm sm:text-base text-sky-400 font-medium mb-2">
            Предприниматель, разработчик и исследователь AI
          </p>
          <p className="text-xs sm:text-sm text-slate-300 font-normal leading-relaxed">
            Помогаю предпринимателям перестать зависеть от наёмных команд и научиться создавать продукты, ботов и автоматизации вместе с AI-агентами.
          </p>
        </div>
      </motion.div>

      {/* Block: "Последние годы я собираю системы" */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="glass-card rounded-2xl p-6 sm:p-7 border border-white/10 mb-6 relative overflow-hidden bg-gradient-to-br from-purple-950/20 via-slate-900/40 to-slate-900/20 shadow-lg"
      >
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0 mt-0.5">
            <Cpu className="w-5 h-5 text-purple-400" />
          </div>
          <div className="space-y-2.5">
            <h3 className="font-display text-lg sm:text-xl font-bold text-white">
              Последние годы я собираю системы
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
              Мой фокус — на стыке:{" "}
              <span className="text-emerald-400 font-semibold">
                AI × разработка × бизнес × человек.
              </span>
            </p>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
              Создаю продукты, автоматизации и AI-агентов. Экспериментирую с новыми инструментами и проверяю их не на тестовых задачах, а на реальных проектах. И сейчас делюсь этим опытом с предпринимателями.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Compact Story Narrative: Experience -> Insight -> Today */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="glass-card rounded-2xl p-6 sm:p-7 border border-white/10 space-y-5 shadow-lg"
      >
        <div className="flex items-center gap-3 pb-2 border-b border-white/10">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
            <History className="w-4 h-4 text-amber-400" />
          </div>
          <h3 className="font-display text-base sm:text-lg font-bold text-white">
            Я сам был на другой стороне
          </h3>
        </div>

        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
          Несколько лет назад у меня появилась идея приложения для соседей. Я нашёл разработчиков, заплатил деньги, долго объяснял, что хочу получить... <span className="text-rose-400 font-medium">Но до работающего продукта так и не дошёл.</span>
        </p>

        {/* Central Quote */}
        <blockquote className="relative p-4 sm:p-5 rounded-xl border-l-4 border-l-purple-500 bg-purple-950/20 border-y border-r border-white/10">
          <Quote className="w-6 h-6 text-purple-400/40 mb-1" aria-hidden="true" />
          <p className="font-display text-sm sm:text-base font-semibold text-white leading-snug">
            «Если я не умею создавать продукт сам, я всегда завишу от того, кто умеет.»
          </p>
        </blockquote>

        <div className="flex items-start gap-3 pt-1">
          <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center shrink-0 mt-0.5">
            <Compass className="w-4 h-4 text-sky-400" />
          </div>
          <div className="space-y-1.5 text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
            <p>
              После этого я начал разбираться в разработке, ботах, веб-приложениях, AI и AI-агентах.
            </p>
            <p className="text-emerald-400 font-medium">
              Сегодня я создаю реальные продукты и автоматизации с помощью AI — и передаю эту практическую систему другим создателям.
            </p>
          </div>
        </div>
      </motion.div>

      <BotFunnelCTA
        temp="warm"
        block="story"
        label="Расскажу, что хочу создать"
        hint="Напишите одной фразой — дальше подскажет AI"
      />
    </div>
  </section>
);

export default StorySection;
