import { motion } from "framer-motion";
import { Rocket } from "lucide-react";

const CTASection = () => (
  <section className="py-16 px-4 pb-24">
    <div className="max-w-lg mx-auto text-center">
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={{ once: true }}
        className="relative"
      >
        <div className="absolute inset-0 -m-8 bg-gradient-to-t from-miniapp-purple/10 to-transparent rounded-3xl blur-xl" />

        <div className="relative">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-miniapp-purple to-miniapp-blue flex items-center justify-center mx-auto mb-5 shadow-lg shadow-miniapp-purple/30">
            <Rocket className="w-7 h-7 text-white" />
          </div>

          <h2 className="text-2xl font-bold mb-2">Готовы запустить проект?</h2>
          <p className="text-sm text-miniapp-muted mb-6 max-w-xs mx-auto">
            Обсудим вашу идею и найдём лучшее решение для автоматизации
          </p>

          <a
            href="https://t.me/PetrFirstovBot"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-8 py-3.5 rounded-xl bg-gradient-to-r from-miniapp-purple to-miniapp-blue text-white font-semibold text-sm shadow-xl shadow-miniapp-purple/30 hover:shadow-miniapp-purple/50 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            Запустить проект 🚀
          </a>

          <p className="text-xs text-miniapp-muted mt-4">
            или напишите{" "}
            <a href="https://t.me/PetrFirstovBot" className="text-miniapp-purple hover:underline">
              @PetrFirstovBot
            </a>
          </p>
        </div>
      </motion.div>
    </div>
  </section>
);

export default CTASection;
