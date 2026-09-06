import React, { useState, useEffect } from 'react';
import { Send, Menu, X, ArrowUpRight } from 'lucide-react';
import { FirstovLogo } from './sections/FirstovLogo';

interface NavbarProps {
  previewMode?: string;
  setPreviewMode?: (mode: any) => void;
  onOpenRepoModal?: () => void;
  repoUrl?: string;
}

const mainNavItems = [
  { label: 'AI Клуб', href: '#creators' },
  { label: 'Кейсы', href: '#cases' },
  { label: 'Калькулятор', href: '#calculator' },
  { label: 'Партнёрам', href: '#partner' },
];

export const Navbar: React.FC<NavbarProps> = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    const targetId = href.replace('#', '');
    const element = document.getElementById(targetId);
    if (element) {
      const headerOffset = 70;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  };

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-[#0b0f19]/90 backdrop-blur-xl border-b border-white/10 shadow-lg shadow-black/20 py-2.5'
          : 'bg-[#0b0f19]/75 backdrop-blur-md border-b border-white/5 py-3.5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-6 flex items-center justify-between gap-3 sm:gap-6">
        {/* Logo + First of AI */}
        <a
          href="#main"
          onClick={(e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="flex items-center gap-2 sm:gap-3 group shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 rounded-xl"
        >
          <div className="relative">
            <FirstovLogo className="w-8 h-8 sm:w-9 sm:h-9 group-hover:scale-105 transition-transform duration-300" />
            <div className="absolute inset-0 bg-sky-400/20 blur-lg rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <div className="flex items-baseline gap-1 sm:gap-1.5 font-display tracking-tight text-base sm:text-xl font-bold">
            <span className="text-white">First of</span>
            <span className="bg-gradient-to-r from-sky-400 via-purple-400 to-emerald-400 bg-clip-text text-transparent">
              AI
            </span>
          </div>
        </a>

        {/* Main Section Links (Desktop) */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
          {mainNavItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={(e) => handleNavClick(e, item.href)}
              className="px-3 py-1.5 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-all font-medium whitespace-nowrap"
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* Action Button: "Написать" */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <a
            href="https://t.me/PetrFirstovBot?start=hot_contact"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-sky-500 via-purple-600 to-indigo-600 hover:from-sky-400 hover:via-purple-500 hover:to-indigo-500 shadow-md shadow-purple-600/20 hover:shadow-purple-600/40 hover:-translate-y-0.5 active:translate-y-0 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400"
          >
            <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-sky-200" />
            <span>Написать</span>
          </a>

          {/* Mobile menu hamburger toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? 'Закрыть меню' : 'Открыть меню'}
            className="lg:hidden p-2 min-h-[38px] min-w-[38px] flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition-colors"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden px-4 pt-3 pb-5 border-t border-white/10 bg-[#0b0f19]/95 backdrop-blur-2xl animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex flex-col gap-1">
            {mainNavItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={(e) => handleNavClick(e, item.href)}
                className="px-4 py-2.5 rounded-xl text-sm font-medium text-slate-200 hover:text-white hover:bg-white/10 transition-colors"
              >
                {item.label}
              </a>
            ))}

            <div className="pt-3 mt-2 border-t border-white/10">
              <a
                href="https://t.me/PetrFirstovBot?start=hot_contact"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-sky-500 via-purple-600 to-indigo-600 shadow-md shadow-purple-600/30"
              >
                <Send className="w-4 h-4 text-sky-200" />
                <span>Написать в Telegram</span>
                <ArrowUpRight className="w-4 h-4 opacity-70" />
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
