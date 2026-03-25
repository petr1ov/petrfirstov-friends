import { motion } from "framer-motion";
import { Bot } from "lucide-react";

const MiniAppNav = () => {
  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-miniapp/70 border-b border-white/5"
    >
      <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-miniapp-purple to-miniapp-blue flex items-center justify-center">
            <Bot className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-sm">Пётр Фирстов</span>
        </div>
        <a
          href="https://t.me/petrfirstov"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs px-3 py-1.5 rounded-full bg-miniapp-purple/20 text-miniapp-purple border border-miniapp-purple/30 hover:bg-miniapp-purple/30 transition-colors"
        >
          Написать
        </a>
      </div>
    </motion.nav>
  );
};

export default MiniAppNav;
