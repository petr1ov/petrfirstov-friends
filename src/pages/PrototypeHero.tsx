import { useEffect, useState } from "react";
import HeroEditorial from "@/prototypes/hero/HeroEditorial";
import HeroTerminal from "@/prototypes/hero/HeroTerminal";
import HeroSpotlight from "@/prototypes/hero/HeroSpotlight";
import HowItWorks from "@/components/miniapp/HowItWorks";
import MiniAppNav from "@/components/miniapp/MiniAppNav";

const variants = [
  { name: "Editorial", axis: "Крупная типографика, левое выравнивание", Component: HeroEditorial },
  { name: "Terminal", axis: "Технический, моно-сетка данных", Component: HeroTerminal },
  { name: "Spotlight", axis: "Портрет-герой, пруфы, градиент", Component: HeroSpotlight },
];

const PrototypeHero = () => {
  const [i, setI] = useState(0);
  const Active = variants[i].Component;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") setI((p) => (p + 1) % variants.length);
      if (e.key === "ArrowLeft") setI((p) => (p - 1 + variants.length) % variants.length);
      const n = Number(e.key);
      if (n >= 1 && n <= variants.length) setI(n - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="min-h-dvh aurora-bg text-miniapp-foreground overflow-x-hidden font-sans antialiased pb-28">
      <MiniAppNav />
      <main>
        <Active />
        <HowItWorks />
      </main>

      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[80] flex items-center gap-1 rounded-full bg-neutral-900/95 border border-neutral-700 px-1.5 py-1.5 shadow-2xl backdrop-blur">
        {variants.map((v, idx) => (
          <button
            key={v.name}
            onClick={() => setI(idx)}
            aria-pressed={i === idx}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium font-sans ${
              i === idx ? "bg-neutral-100 text-neutral-900" : "text-neutral-400 hover:text-neutral-100"
            }`}
          >
            {idx + 1}. {v.name}
          </button>
        ))}
        <span className="px-2 text-[10px] text-neutral-500 hidden sm:inline">← →</span>
      </div>
    </div>
  );
};

export default PrototypeHero;