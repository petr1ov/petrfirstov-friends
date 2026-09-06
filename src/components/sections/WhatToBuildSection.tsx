import { motion } from "framer-motion";
import { Boxes, Workflow, Bot, Sparkles, LayoutDashboard } from "lucide-react";
import BotFunnelCTA from "./BotFunnelCTA";

const groups = [
  {
    icon: Boxes,
    title: "Продукты",
    desc: "Приложения, сервисы, Telegram Mini Apps, сайты.",
    gradient: "from-sky-500 to-blue-600",
  },
  {
    icon: Workflow,
    title: "Автоматизация",
    desc: "CRM, продажи, контент, отчёты, работа с клиентами.",
    gradient: "from-purple-500 to-indigo-600",
  },
  {
    icon: Bot,
    title: "AI-агенты",
    desc: "Персональные помощники, сотрудники, аналитики, продавцы.",
    gradient: "from-emerald-500 to-teal-600",
  },
  {
    icon: Sparkles,
    title: "Контент",
    desc: "Генерация постов, видео, изображений, рассылок.",
    gradient: "from-pink-500 to-rose-600",
  },
  {
    icon: LayoutDashboard,
    title: "Внутренние системы",
    desc: "Базы знаний, панели управления, учёт, рабочие процессы.",
    gradient: "from-amber-500 to-orange-600",
  },
];

const WhatToBuildSection = () => (
  <section className="py-16 px-4 relative" id="what-to-build" aria-labelledby="build-title">
    <div className="max-w-3xl mx-auto">
      <p className="text-xs uppercase tracking-[0.2em] text-slate-400 text-center mb-3 font-medium">
        Что можно создавать
      </p>

      <motion.h2
        id="build-title"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="font-display text-2xl sm:text-4xl font-bold text-center mb-8 text-balance text-white"
      >
        Твой проект может быть любым
      </motion.h2>

      <ul className="grid gap-3.5 sm:grid-cols-2" role="list">
        {groups.map((g, i) => (
          <motion.li
            key={g.title}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.06 }}
            className={`glass-card rounded-2xl p-5 border border-white/10 hover:border-white/25 transition-all hover:bg-white/5 ${
              i === 4 ? "sm:col-span-2" : ""
            }`}
          >
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${g.gradient} flex items-center justify-center mb-3 shadow-lg shadow-black/40`}>
              <g.icon className="w-5 h-5 text-white" aria-hidden="true" />
            </div>
            <h3 className="font-display font-semibold text-base sm:text-lg text-white">
              {g.title}
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 leading-relaxed font-normal">
              {g.desc}
            </p>
          </motion.li>
        ))}
      </ul>

      <BotFunnelCTA temp="warm" block="build" label="Подобрать, что создать мне" />
    </div>
  </section>
);

export default WhatToBuildSection;
