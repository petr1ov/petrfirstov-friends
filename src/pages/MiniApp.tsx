import HeroSection from "@/components/miniapp/HeroSection";
import RecognizeSection from "@/components/miniapp/RecognizeSection";
import StorySection from "@/components/miniapp/StorySection";
import OfferSection from "@/components/miniapp/OfferSection";
import ProcessSection from "@/components/miniapp/ProcessSection";
import CreatorsSection from "@/components/miniapp/CreatorsSection";
import DifferenceSection from "@/components/miniapp/DifferenceSection";
import WhatToBuildSection from "@/components/miniapp/WhatToBuildSection";
import PhilosophySection from "@/components/miniapp/PhilosophySection";
import TransformationSection from "@/components/miniapp/TransformationSection";
import BeyondAISection from "@/components/miniapp/BeyondAISection";
import TwoPathsSection from "@/components/miniapp/TwoPathsSection";
import ProductsCasesSection from "@/components/miniapp/ProductsCasesSection";
import AboutSection from "@/components/miniapp/AboutSection";
import CalculatorQuiz from "@/components/miniapp/CalculatorQuiz";
import CTASection from "@/components/miniapp/CTASection";
import MiniAppNav from "@/components/miniapp/MiniAppNav";

const MiniApp = () => {
  return (
    <div className="min-h-dvh aurora-bg text-miniapp-foreground overflow-x-hidden font-sans antialiased">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:px-3 focus:py-2 focus:rounded-lg focus:bg-miniapp-purple focus:text-white"
      >
        К содержимому
      </a>
      <MiniAppNav />
      <main id="main">
        <HeroSection />
        <RecognizeSection />
        <StorySection />
        <OfferSection />
        <ProcessSection />
        <CreatorsSection />
        <DifferenceSection />
        <WhatToBuildSection />
        <PhilosophySection />
        <TransformationSection />
        <BeyondAISection />
        <TwoPathsSection />
        <ProductsCasesSection />
        <AboutSection />
        <CalculatorQuiz />
        <CTASection />
      </main>
    </div>
  );
};

export default MiniApp;
