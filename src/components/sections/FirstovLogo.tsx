import { memo } from "react";

type Props = {
  className?: string;
  withWordmark?: boolean;
  title?: string;
};

/**
 * Premium First of AI Logo — aerodynamic monogram combining
 * the letter 'F', numeral '1' (First), and glowing AI core.
 */
export const FirstovLogo = ({
  className = "w-9 h-9",
  withWordmark = false,
  title = "First of AI",
}: Props) => {
  return (
    <div className="flex items-center gap-3 select-none">
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        role="img"
        aria-label={title}
      >
        <defs>
          {/* Main luminous gradient */}
          <linearGradient id="foa-grad-primary" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="50%" stopColor="#818cf8" />
            <stop offset="100%" stopColor="#c084fc" />
          </linearGradient>

          {/* Accent cyber gradient */}
          <linearGradient id="foa-grad-accent" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#818cf8" />
            <stop offset="60%" stopColor="#a855f7" />
            <stop offset="100%" stopColor="#34d399" />
          </linearGradient>

          {/* Core glow */}
          <radialGradient id="foa-core-glow" cx="40%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.9" />
            <stop offset="60%" stopColor="#818cf8" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#a855f7" stopOpacity="0" />
          </radialGradient>

          {/* Subtle drop shadow filter for 3D depth */}
          <filter id="foa-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Outer ambient glow */}
        <circle cx="50" cy="50" r="38" fill="url(#foa-core-glow)" opacity="0.4" />

        {/* Sleek rounded hex container */}
        <path
          d="M50 8
             L86 28
             L86 72
             L50 92
             L14 72
             L14 28
             Z"
          fill="#0f172a"
          fillOpacity="0.8"
          stroke="url(#foa-grad-primary)"
          strokeWidth="3.5"
          strokeLinejoin="round"
          filter="url(#foa-glow)"
        />

        {/* Inner high-tech monogram: geometric F & 1 hybrid with cyber cuts */}
        {/* Vertical stem */}
        <path
          d="M34 26
             L45 26
             L45 74
             L34 74
             Z"
          fill="url(#foa-grad-primary)"
        />

        {/* Top wing (F upper bar + angle of 1) */}
        <path
          d="M34 26
             L74 26
             L68 37
             L45 37
             L45 26
             Z"
          fill="url(#foa-grad-primary)"
        />

        {/* Middle wing (F center bar) */}
        <path
          d="M45 47
             L65 47
             L60 56
             L45 56
             Z"
          fill="url(#foa-grad-accent)"
        />

        {/* Neural connection node / AI spark */}
        <circle cx="68" cy="31" r="3.5" fill="#38bdf8" />
        <circle cx="62.5" cy="51.5" r="3" fill="#34d399" />
        <line
          x1="68"
          y1="31"
          x2="78"
          y2="24"
          stroke="#38bdf8"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.8"
        />
        <circle cx="78" cy="24" r="2" fill="#bae6fd" />
      </svg>

      {withWordmark && (
        <div className="flex items-center gap-1.5 font-display tracking-tight text-lg sm:text-xl font-bold">
          <span className="text-white">First of</span>
          <span className="bg-gradient-to-r from-sky-400 via-purple-400 to-emerald-400 bg-clip-text text-transparent">
            AI
          </span>
        </div>
      )}
    </div>
  );
};

export default memo(FirstovLogo);
