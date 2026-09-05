import { motion } from "framer-motion";
import petrPhoto from "@/assets/petr-firstov.jpg";

const AboutSection = () => (
  <section className="py-16 px-4" id="about" aria-labelledby="about-title">
    <div className="max-w-2xl mx-auto">
      <p className="text-xs uppercase tracking-[0.2em] text-miniapp-foreground/45 text-center mb-6">Обо мне</p>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="glass-card rounded-2xl p-6 sm:flex sm:gap-6 sm:items-start"
      >
        <div className="relative w-24 h-24 mx-auto sm:mx-0 mb-4 sm:mb-0 shrink-0">
          <div
            aria-hidden="true"
            className="absolute inset-0 rounded-full bg-gradient-to-br from-miniapp-purple via-miniapp-blue to-miniapp-neon blur-md opacity-60"
          />
          <img
            src={petrPhoto}
            alt="Портрет Петра Фирстова"
            loading="lazy"
            decoding="async"
            className="relative w-24 h-24 rounded-full object-cover ring-2 ring-white/10"
          />
        </div>

        <div className="text-center sm:text-left">
          <h2 id="about-title" className="font-display text-xl sm:text-2xl font-bold">
            Пётр Фирстов
          </h2>
          <p className="text-sm text-miniapp-foreground/65 mt-1">Предприниматель, разработчик и исследователь AI.</p>

          <div className="mt-4 space-y-3 text-sm text-miniapp-foreground/75 leading-relaxed">
            <p>
              Последние годы я собираю системы на стыке:{" "}
              <span className="text-miniapp-neon">AI × разработка × бизнес × человек.</span>
            </p>
            <p>Создаю продукты, автоматизации и AI-агентов.</p>
            <p>
              Экспериментирую с новыми инструментами и проверяю их не на тестовых задачах, а на реальных проектах.
            </p>
            <p className="text-miniapp-foreground">И сейчас делюсь этим опытом с предпринимателями.</p>
          </div>
        </div>
      </motion.div>
    </div>
  </section>
);

export default AboutSection;
