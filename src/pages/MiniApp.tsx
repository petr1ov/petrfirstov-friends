import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import HeroSection from "@/components/miniapp/HeroSection";
import HowItWorks from "@/components/miniapp/HowItWorks";
import ProductsCasesSection from "@/components/miniapp/ProductsCasesSection";
import AIDemoSection from "@/components/miniapp/AIDemoSection";
import CalculatorQuiz from "@/components/miniapp/CalculatorQuiz";
import PartnerSection from "@/components/miniapp/PartnerSection";
import CTASection from "@/components/miniapp/CTASection";
import MiniAppNav from "@/components/miniapp/MiniAppNav";

const MiniApp = () => {
  return (
    <div className="min-h-screen bg-miniapp text-miniapp-foreground overflow-x-hidden">
      <MiniAppNav />
      <HeroSection />
      <HowItWorks />
      <CasesSection />
      <ProductsSection />
      <AIDemoSection />
      <CalculatorQuiz />
      <PartnerSection />
      <CTASection />
    </div>
  );
};

export default MiniApp;
