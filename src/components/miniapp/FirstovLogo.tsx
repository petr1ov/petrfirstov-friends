import { memo } from "react";

type Props = {
  className?: string;
  withWordmark?: boolean;
  title?: string;
};

/**
 * FIRSTOV.AI logo.
 * Concept: "Firstov" → "first" → numeral "1" wired into a neural circuit.
 */
const FirstovLogo = ({ className, withWordmark = false, title = "FIRSTOV.AI" }: Props) => {
  const gid = "fv-grad";
  const gidOne = "fv-grad-one";
  const gidNode = "fv-grad-node";
  return (
    <svg
      viewBox="0 0 240 280"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label={title}
    >
      <defs>
        <linearGradient id={gid} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#22d3ee" />
          <stop offset="50%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#c026d3" />
        </linearGradient>
        <linearGradient id={gidOne} x1="20%" y1="0%" x2="80%" y2="100%">
          <stop offset="0%" stopColor="#7dd3fc" />
          <stop offset="55%" stopColor="#818cf8" />
          <stop offset="100%" stopColor="#d946ef" />
        </linearGradient>
        <radialGradient id={gidNode} cx="35%" cy="35%" r="70%">
          <stop offset="0%" stopColor="#a5f3fc" />
          <stop offset="60%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#a855f7" />
        </radialGradient>
        <filter id="fv-glow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="2.5" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Circuit branches — symmetric, ending in nodes */}
      <g
        fill="none"
        stroke={`url(#${gid})`}
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* Left */}
        <path d="M86 80 L66 80 L56 70" />
        <path d="M76 105 L46 105" />
        <path d="M86 130 L60 130 L48 142" />
        <path d="M96 162 L78 180 L66 180" />
        {/* Right */}
        <path d="M154 80 L174 80 L184 70" />
        <path d="M164 105 L194 105" />
        <path d="M154 130 L180 130 L192 142" />
        <path d="M144 162 L162 180 L174 180" />
        {/* Bottom center */}
        <path d="M120 178 L120 200" />
      </g>

      {/* End nodes — large for contrast, dark ring separates them from glow */}
      <g fill={`url(#${gidNode})`} stroke="#0b1024" strokeWidth="1.5">
        <circle cx="56"  cy="70"  r="9" />
        <circle cx="46"  cy="105" r="9" />
        <circle cx="48"  cy="142" r="8" />
        <circle cx="66"  cy="180" r="9" />
        <circle cx="184" cy="70"  r="9" />
        <circle cx="194" cy="105" r="9" />
        <circle cx="192" cy="142" r="8" />
        <circle cx="174" cy="180" r="9" />
        <circle cx="120" cy="200" r="10" />
      </g>

      {/* Dark "card" behind the numeral — separates it from the circuit */}
      <rect x="84" y="56" width="72" height="124" rx="16" fill="#0b1024" opacity="0.95" />
      <rect
        x="84" y="56" width="72" height="124" rx="16"
        fill="none"
        stroke={`url(#${gid})`}
        strokeWidth="2.5"
        opacity="0.65"
      />

      {/* Numeral "1" — bold, clear, with serif foot */}
      <g fill={`url(#${gidOne})`} filter="url(#fv-glow)">
        <path d="
          M134 72
          L134 158
          L150 158
          L150 170
          L94 170
          L94 158
          L114 158
          L114 100
          L96 110
          L96 94
          L120 72
          Z
        " />
      </g>

      {withWordmark && (
        <text
          x="120"
          y="246"
          textAnchor="middle"
          fontFamily="'Space Grotesk', system-ui, sans-serif"
          fontWeight="800"
          fontSize="32"
          letterSpacing="3"
          fill={`url(#${gid})`}
        >
          FIRSTOV.AI
        </text>
      )}
    </svg>
  );
};

export default memo(FirstovLogo);
