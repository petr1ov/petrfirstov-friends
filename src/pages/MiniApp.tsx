import HeroSection from "@/components/miniapp/HeroSection";
import HowItWorks from "@/components/miniapp/HowItWorks";
import ProductsCasesSection from "@/components/miniapp/ProductsCasesSection";
import BenefitsSection from "@/components/miniapp/BenefitsSection";
import AIDemoSection from "@/components/miniapp/AIDemoSection";
import CalculatorQuiz from "@/components/miniapp/CalculatorQuiz";
import PartnerSection from "@/components/miniapp/PartnerSection";
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
        <HowItWorks />
        <ProductsCasesSection />
        <BenefitsSection />
        <AIDemoSection />
        <CalculatorQuiz />
        <PartnerSection />
        <CTASection />
      </main>
    </div>
  );
};

export default MiniApp;
