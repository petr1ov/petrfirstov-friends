import { motion } from "framer-motion";
import { Rocket } from "lucide-react";

const CTASection = () => (
  <section className="py-16 px-4 pb-24" aria-labelledby="cta-title">
    <div className="max-w-2xl mx-auto text-center">
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={{ once: true }}
        className="relative"
      >
        <div aria-hidden="true" className="absolute inset-0 -m-8 bg-gradient-to-t from-miniapp-purple/15 via-miniapp-blue/5 to-transparent rounded-3xl blur-xl" />

        <div className="relative">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-miniapp-purple to-miniapp-blue flex items-center justify-center mx-auto mb-5 shadow-2xl shadow-miniapp-purple/40">
            <Rocket className="w-7 h-7 text-white" aria-hidden="true" />
          </div>

          <h2 id="cta-title" className="font-display text-3xl sm:text-4xl font-bold mb-3 text-balance">Готовы запустить проект?</h2>
          <p className="text-sm sm:text-base text-miniapp-foreground/70 mb-6 max-w-md mx-auto text-balance">
            Обсудим вашу идею и найдём лучшее решение для автоматизации
          </p>

          <a
            href="https://t.me/PetrFirstovBot?start=miniapp_launch"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center min-h-12 px-8 rounded-xl bg-gradient-to-r from-miniapp-purple to-miniapp-blue text-white font-semibold text-sm shadow-xl shadow-miniapp-purple/40 hover:shadow-miniapp-purple/60 hover:scale-[1.02] active:scale-[0.98] transition-all focus-ring"
          >
            Запустить проект 🚀
          </a>

          <p className="text-xs text-miniapp-foreground/60 mt-4">
            или напишите{" "}
            <a href="https://t.me/PetrFirstovBot?start=miniapp_launch" className="text-miniapp-purple hover:underline focus-ring rounded">
              @PetrFirstovBot
            </a>
          </p>
        </div>
      </motion.div>
    </div>
  </section>
);

export default CTASection;
