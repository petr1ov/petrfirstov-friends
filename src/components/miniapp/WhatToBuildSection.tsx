import { motion } from "framer-motion";
import { Boxes, Workflow, Bot, Sparkles, LayoutDashboard } from "lucide-react";

const groups = [
  { icon: Boxes, title: "Продукты", desc: "Приложения, сервисы, Telegram Mini Apps, сайты." },
  { icon: Workflow, title: "Автоматизация", desc: "CRM, продажи, контент, отчёты, работа с клиентами." },
  { icon: Bot, title: "AI-агенты", desc: "Персональные помощники, сотрудники, аналитики, продавцы." },
  { icon: Sparkles, title: "Контент", desc: "Генерация постов, видео, изображений, рассылок." },
  { icon: LayoutDashboard, title: "Внутренние системы", desc: "Базы знаний, панели управления, учёт, рабочие процессы." },
];

const WhatToBuildSection = () => (
  <section className="py-16 px-4" id="what-to-build" aria-labelledby="build-title">
    <div className="max-w-2xl mx-auto">
      <p className="text-xs uppercase tracking-[0.2em] text-miniapp-foreground/45 text-center mb-3">Что можно создавать</p>
      <motion.h2
        id="build-title"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="font-display text-2xl sm:text-4xl font-bold text-center mb-8 text-balance"
      >
        Твой проект может быть любым
      </motion.h2>

      <ul className="grid gap-3 sm:grid-cols-2">
        {groups.map((g, i) => (
          <motion.li
            key={g.title}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.06 }}
            className={`glass-card rounded-2xl p-5 ${i === 4 ? "sm:col-span-2" : ""}`}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-miniapp-purple to-miniapp-blue flex items-center justify-center mb-3">
              <g.icon className="w-5 h-5 text-white" aria-hidden="true" />
            </div>
            <h3 className="font-display font-semibold text-base">{g.title}</h3>
            <p className="text-sm text-miniapp-foreground/65 mt-1 leading-relaxed">{g.desc}</p>
          </motion.li>
        ))}
      </ul>
    </div>
  </section>
);

export default WhatToBuildSection;
