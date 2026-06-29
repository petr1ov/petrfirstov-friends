import { motion } from "framer-motion";
import { Bot } from "lucide-react";

const MiniAppNav = () => {
  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      aria-label="Главное меню"
      className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-miniapp/75 border-b border-miniapp-border/60 supports-[backdrop-filter]:bg-miniapp/55"
    >
      <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
        <a href="#main" className="flex items-center gap-2 focus-ring rounded-lg" aria-label="На главную">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-miniapp-purple to-miniapp-blue flex items-center justify-center shadow-lg shadow-miniapp-purple/30">
            <Bot className="w-4 h-4 text-white" aria-hidden="true" />
          </div>
          <span className="font-display font-semibold text-sm tracking-tight">Пётр Фирстов</span>
        </a>
        <a
          href="https://t.me/PetrFirstovBot?start=miniapp_contact"
          target="_blank"
          rel="noopener noreferrer"
          className="min-h-9 inline-flex items-center text-xs font-medium px-3.5 py-2 rounded-full bg-miniapp-purple/15 text-miniapp-purple border border-miniapp-purple/30 hover:bg-miniapp-purple/25 transition-colors focus-ring"
        >
          Написать
        </a>
      </div>
    </motion.nav>
  );
};

export default MiniAppNav;
