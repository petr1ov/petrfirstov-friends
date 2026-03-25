import { motion } from "framer-motion";
import { Users, TrendingUp, Gift } from "lucide-react";

const PartnerSection = () => (
  <section className="py-16 px-4" id="partner">
    <div className="max-w-lg mx-auto">
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={{ once: true }}
        className="relative rounded-2xl p-6 overflow-hidden"
      >
        {/* BG gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-miniapp-purple/20 via-miniapp-blue/10 to-transparent" />
        <div className="absolute inset-0 border border-miniapp-purple/20 rounded-2xl" />
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-miniapp-purple/20 rounded-full blur-[60px]" />

        <div className="relative">
          <div className="flex items-center gap-2 mb-4">
            <Gift className="w-5 h-5 text-miniapp-purple" />
            <h2 className="text-xl font-bold">Партнёрская программа</h2>
          </div>

          <p className="text-2xl font-extrabold bg-gradient-to-r from-miniapp-purple to-miniapp-neon bg-clip-text text-transparent mb-2">
            10–20% с каждого проекта
          </p>
          <p className="text-sm text-miniapp-muted mb-6">
            Просто рекомендуйте — и зарабатывайте на каждом привлечённом клиенте
          </p>

          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="p-3 rounded-xl bg-white/[0.04] border border-white/[0.06]">
              <Users className="w-4 h-4 text-miniapp-purple mb-1" />
              <p className="text-xs text-miniapp-muted">Поделитесь ссылкой</p>
            </div>
            <div className="p-3 rounded-xl bg-white/[0.04] border border-white/[0.06]">
              <TrendingUp className="w-4 h-4 text-miniapp-neon mb-1" />
              <p className="text-xs text-miniapp-muted">Получайте доход</p>
            </div>
          </div>

          <a
            href="https://t.me/PetrFirstovBot"
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full py-3 rounded-xl bg-white/5 border border-miniapp-purple/30 text-center text-sm font-semibold text-miniapp-purple hover:bg-miniapp-purple/10 transition-colors"
          >
            Стать партнёром →
          </a>
        </div>
      </motion.div>
    </div>
  </section>
);

export default PartnerSection;
