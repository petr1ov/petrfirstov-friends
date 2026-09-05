import { motion } from "framer-motion";
import { Quote } from "lucide-react";

const StorySection = () => (
  <section className="py-16 px-4" id="story" aria-labelledby="story-title">
    <div className="max-w-2xl mx-auto">
      <p className="text-xs uppercase tracking-[0.2em] text-miniapp-foreground/45 mb-3">Моя история</p>
      <motion.h2
        id="story-title"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="font-display text-2xl sm:text-4xl font-bold mb-6 text-balance"
      >
        Я сам был на другой стороне
      </motion.h2>

      <div className="space-y-4 text-sm sm:text-base text-miniapp-foreground/75 leading-relaxed">
        <p>Несколько лет назад у меня появилась идея приложения для соседей.</p>
        <p>Я нашёл разработчиков, заплатил деньги, объяснял, что хочу получить...</p>
        <p>Но до работающего продукта так и не дошёл.</p>
      </div>

      <motion.blockquote
        initial={{ opacity: 0, y: 14 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="glass-card rounded-2xl p-6 my-7 relative"
      >
        <Quote className="w-6 h-6 text-miniapp-purple mb-3" aria-hidden="true" />
        <p className="font-display text-base sm:text-lg font-semibold text-balance">
          Если я не умею создавать продукт сам, я всегда завишу от того, кто умеет.
        </p>
      </motion.blockquote>

      <div className="space-y-4 text-sm sm:text-base text-miniapp-foreground/75 leading-relaxed">
        <p>После этого я начал разбираться в разработке, ботах, веб-приложениях, AI и AI-агентах.</p>
        <p>Сегодня я создаю реальные продукты и автоматизации с помощью AI.</p>
        <p className="text-miniapp-foreground">И теперь хочу передать этот опыт другим предпринимателям.</p>
      </div>
    </div>
  </section>
);

export default StorySection;
