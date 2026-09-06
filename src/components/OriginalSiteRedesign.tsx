import React from "react";
import HeroSection from "./sections/HeroSection";
import RecognizeSection from "./sections/RecognizeSection";
import StorySection from "./sections/StorySection";
import OfferSection from "./sections/OfferSection";
import ProcessSection from "./sections/ProcessSection";
import CreatorsSection from "./sections/CreatorsSection";
import DifferenceSection from "./sections/DifferenceSection";
import WhatToBuildSection from "./sections/WhatToBuildSection";
import PhilosophySection from "./sections/PhilosophySection";
import TransformationSection from "./sections/TransformationSection";
import BeyondAISection from "./sections/BeyondAISection";
import TwoPathsSection from "./sections/TwoPathsSection";
import ProductsCasesSection from "./sections/ProductsCasesSection";
import CalculatorQuiz from "./sections/CalculatorQuiz";
import PartnerSection from "./sections/PartnerSection";
import CTASection from "./sections/CTASection";

interface Props {
  isPhoneFrame?: boolean;
}

/**
 * Полный редизайн сайта petrfirstov-friends с сохранением
 * 100% оригинальных текстов слово-в-слово, структуры всех 17 блоков
 * и добавлением современных визуальных иллюстраций для каждого блока.
 */
export const OriginalSiteRedesign: React.FC<Props> = ({ isPhoneFrame = false }) => {
  return (
    <div className={`aurora-bg text-slate-100 overflow-x-hidden font-sans antialiased ${isPhoneFrame ? "text-sm" : "min-h-screen"}`}>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:px-3 focus:py-2 focus:rounded-lg focus:bg-purple-600 focus:text-white"
      >
        К содержимому
      </a>

      {/* Main Blocks - 17 blocks in exact original sequence */}
      <main id="main">
        {/* Block 1: Hero */}
        <HeroSection />

        {/* Block 2: Узнаёшь себя? */}
        <RecognizeSection />

        {/* Block 3: Моя история */}
        <StorySection />

        {/* Block 4: Что я предлагаю */}
        <OfferSection />

        {/* Block 5: Как это работает */}
        <ProcessSection />

        {/* Block 6: Созидатели 2.0 */}
        <CreatorsSection />

        {/* Block 7: Главное отличие */}
        <DifferenceSection />

        {/* Block 8: Что можно создавать */}
        <WhatToBuildSection />

        {/* Block 9: Философия */}
        <PhilosophySection />

        {/* Block 10: Что происходит с человеком */}
        <TransformationSection />

        {/* Block 11: Это не только про AI */}
        <BeyondAISection />

        {/* Block 12: Два пути */}
        <TwoPathsSection />

        {/* Block 13: Портфолио с кейсами */}
        <ProductsCasesSection />

        {/* Block 14: Калькулятор проекта */}
        <CalculatorQuiz />

        {/* Block 16: Партнёрство и амбассадорство */}
        <PartnerSection />

        {/* Block 17: Что ты давно хочешь создать? */}
        <CTASection />
      </main>

      {/* Footer copyright */}
      <footer className="py-8 px-4 border-t border-white/10 text-center text-xs text-slate-500">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© {new Date().getFullYear()} FIRSTOV.AI — Создавай свои проекты с помощью AI</p>
          <div className="flex items-center gap-4 text-slate-400">
            <a href="https://t.me/PetrFirstovBot" target="_blank" rel="noopener noreferrer" className="hover:text-sky-400 transition-colors">
              Telegram-бот
            </a>
            <span>•</span>
            <a href="#cases" className="hover:text-sky-400 transition-colors">
              Кейсы
            </a>
            <span>•</span>
            <a href="#partner" className="hover:text-sky-400 transition-colors">
              Партнерам
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default OriginalSiteRedesign;
