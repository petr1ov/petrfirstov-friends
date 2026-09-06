import { motion } from "framer-motion";
import { ArrowRight, Send } from "lucide-react";
import { botLink, type FunnelTemp } from "../../lib/botLink";

interface Props {
  temp: FunnelTemp;
  block: string;
  label: string;
  hint?: string;
  variant?: "solid" | "ghost";
}

/**
 * Кнопка перехода в бота из конкретного блока сайта.
 * Бот получает «температуру» и блок — и открывает релевантный сценарий.
 */
const BotFunnelCTA = ({ temp, block, label, hint, variant = "ghost" }: Props) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    className="mt-8 text-center"
  >
    <a
      href={botLink(temp, block)}
      target="_blank"
      rel="noopener noreferrer"
      className={
        variant === "solid"
          ? "inline-flex w-full sm:w-auto items-center justify-center gap-2.5 min-h-12 px-5 sm:px-7 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-sky-500 text-white font-semibold text-sm shadow-xl shadow-purple-600/30 hover:shadow-purple-600/50 hover:scale-[1.02] active:scale-[0.98] transition-all focus-ring group"
          : "inline-flex w-full sm:w-auto items-center justify-center gap-2.5 min-h-12 px-5 sm:px-6 rounded-xl bg-white/5 border border-white/10 text-white text-sm font-medium hover:bg-white/10 hover:border-purple-400/40 hover:scale-[1.01] active:scale-[0.99] transition-all focus-ring group"
      }
    >
      <Send className="w-4 h-4 text-sky-400 group-hover:translate-x-0.5 transition-transform" />
      <span>{label}</span>
      <ArrowRight className="w-4 h-4 text-purple-300 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
    </a>
    {hint && <p className="text-xs text-slate-400 mt-2.5 font-normal">{hint}</p>}
  </motion.div>
);

export default BotFunnelCTA;
