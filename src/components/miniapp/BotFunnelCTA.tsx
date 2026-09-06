import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { botLink, type FunnelTemp } from "@/lib/botLink";

interface Props {
  temp: FunnelTemp;
  block: string;
  label: string;
  hint?: string;
  variant?: "solid" | "ghost";
}

/**
 * Кнопка перехода в бота из конкретного блока лендинга.
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
          ? "inline-flex items-center justify-center gap-2 min-h-12 px-6 rounded-xl bg-gradient-to-r from-miniapp-purple to-miniapp-blue text-white font-semibold text-sm shadow-lg shadow-miniapp-purple/30 hover:shadow-miniapp-purple/50 transition-all focus-ring"
          : "inline-flex items-center justify-center gap-2 min-h-12 px-6 rounded-xl bg-white/5 border border-white/10 text-miniapp-foreground text-sm font-medium hover:bg-white/10 hover:border-miniapp-purple/40 transition-colors focus-ring"
      }
    >
      {label}
      <ArrowRight className="w-4 h-4" aria-hidden="true" />
    </a>
    {hint && <p className="text-xs text-miniapp-foreground/55 mt-2.5">{hint}</p>}
  </motion.div>
);

export default BotFunnelCTA;
