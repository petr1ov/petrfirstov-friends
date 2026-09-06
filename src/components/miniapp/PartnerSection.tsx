import { motion } from "framer-motion";
import { Users, TrendingUp, Gift } from "lucide-react";
import { botLink } from "@/lib/botLink";

const PartnerSection = () => (
  <section className="py-16 px-4" id="partner" aria-labelledby="partner-title">
    <div className="max-w-2xl mx-auto">
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={{ once: true }}
        className="relative rounded-3xl p-6 sm:p-8 overflow-hidden"
      >
        {/* BG gradient */}
        <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-br from-miniapp-purple/20 via-miniapp-blue/10 to-transparent" />
        <div aria-hidden="true" className="absolute inset-0 border border-miniapp-purple/25 rounded-3xl" />
        <div aria-hidden="true" className="absolute -top-20 -right-20 w-48 h-48 bg-miniapp-purple/25 rounded-full blur-[70px] animate-aurora" />
        <div aria-hidden="true" className="absolute -bottom-20 -left-20 w-48 h-48 bg-miniapp-neon/15 rounded-full blur-[70px] animate-aurora" style={{ animationDelay: "3s" }} />

        <div className="relative">
          <div className="flex items-center gap-2 mb-4">
            <Gift className="w-5 h-5 text-miniapp-purple" aria-hidden="true" />
            <h2 id="partner-title" className="font-display text-2xl sm:text-3xl font-bold">Партнёрство и амбассадорство</h2>
          </div>

          <p className="font-display text-3xl sm:text-4xl font-bold bg-gradient-to-r from-miniapp-purple via-miniapp-blue to-miniapp-neon bg-clip-text text-transparent mb-2">
            10–20% с каждого проекта
          </p>
          <p className="text-sm sm:text-base text-miniapp-foreground/70 mb-6">
            Рекомендуйте — и зарабатывайте. Амбассадорам — приоритетная поддержка и готовые материалы для контента.
          </p>

          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="p-4 rounded-xl glass-card">
              <Users className="w-5 h-5 text-miniapp-purple mb-2" aria-hidden="true" />
              <p className="text-xs text-miniapp-foreground/75">Личная ссылка сразу в боте</p>
            </div>
            <div className="p-4 rounded-xl glass-card">
              <TrendingUp className="w-5 h-5 text-miniapp-neon mb-2" aria-hidden="true" />
              <p className="text-xs text-miniapp-foreground/75">Выплата с каждого проекта</p>
            </div>
          </div>

          <a
            href={botLink("partner", "ambassador")}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full min-h-12 leading-[3rem] rounded-xl bg-white/5 border border-miniapp-purple/30 text-center text-sm font-semibold text-miniapp-purple hover:bg-miniapp-purple/10 transition-colors focus-ring"
          >
            Получить партнёрскую ссылку →
          </a>

        </div>
      </motion.div>
    </div>
  </section>
);

export default PartnerSection;
