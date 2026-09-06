import { motion } from "framer-motion";
import { Handshake, Link as LinkIcon, DollarSign, ArrowRight, Sparkles, Award } from "lucide-react";

const PartnerSection = () => (
  <section className="py-16 px-4 relative" id="partner" aria-labelledby="partner-title">
    <div className="max-w-3xl mx-auto">
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={{ once: true }}
        className="rounded-3xl glass-card p-6 sm:p-10 border border-white/15 relative overflow-hidden shadow-2xl"
      >
        {/* Decorative background aura */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 -right-24 w-72 h-72 bg-gradient-to-br from-emerald-500/20 via-sky-500/10 to-transparent rounded-full blur-3xl"
        />

        <div className="relative z-10 text-center max-w-xl mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mx-auto mb-4 shadow-xl shadow-emerald-500/30">
            <Handshake className="w-7 h-7 text-white" aria-hidden="true" />
          </div>

          <h2 id="partner-title" className="font-display text-2xl sm:text-4xl font-bold text-white mb-2">
            Партнёрство и амбассадорство
          </h2>

          <div className="inline-block my-3 px-4 py-1.5 rounded-full bg-gradient-to-r from-emerald-500/20 to-sky-500/20 border border-emerald-500/40">
            <span className="font-display text-lg sm:text-xl font-bold bg-gradient-to-r from-emerald-400 to-sky-400 bg-clip-text text-transparent">
              10–20% с каждого проекта
            </span>
          </div>

          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed mb-6 font-normal">
            Рекомендуйте — и зарабатывайте. Амбассадорам — приоритетная поддержка и готовые материалы для контента.
          </p>

          {/* Graphic Artwork */}
          <div className="rounded-2xl overflow-hidden glass-card p-2 border border-white/10 mb-6 group">
            <div className="relative aspect-[21/9] rounded-xl overflow-hidden bg-slate-950">
              <img
                src="/images/partner.jpg"
                alt="Партнерская программа и реферальная сеть"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
              <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-[11px]">
                <span className="text-emerald-300 font-semibold flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-amber-400" />
                  Моментальная активация в Telegram
                </span>
                <span className="font-mono text-slate-400">P2P Партнёрская сеть</span>
              </div>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-3 mb-8 text-left">
            <div className="p-4 rounded-xl glass-card border border-white/10 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center shrink-0">
                <LinkIcon className="w-4 h-4 text-sky-400" />
              </div>
              <p className="text-xs sm:text-sm font-medium text-slate-200">
                Личная ссылка сразу в боте
              </p>
            </div>
            <div className="p-4 rounded-xl glass-card border border-white/10 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                <DollarSign className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-xs sm:text-sm font-medium text-slate-200">
                Выплата с каждого проекта
              </p>
            </div>
          </div>

          <a
            href="https://t.me/PetrFirstovBot?start=partner_ambassador"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 min-h-12 px-8 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-sky-500 text-white font-semibold text-sm shadow-xl shadow-emerald-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all focus-ring"
          >
            <span>Получить партнёрскую ссылку →</span>
          </a>
        </div>
      </motion.div>
    </div>
  </section>
);

export default PartnerSection;
