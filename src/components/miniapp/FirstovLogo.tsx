import { memo } from "react";

type Props = {
  className?: string;
  withWordmark?: boolean;
  title?: string;
};

/**
 * FIRSTOV.AI logo — central "1" (Firstov = first) wired into a neural circuit.
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
      </defs>

      {/* Circuit branches — they start OUTSIDE the numeral, so no frame is needed */}
      <g
        fill="none"
        stroke={`url(#${gid})`}
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* Left */}
        <path d="M78 78  L60 78  L50 68" />
        <path d="M70 110 L36 110" />
        <path d="M78 142 L54 142 L42 154" />
        <path d="M92 172 L74 188 L62 188" />
        {/* Right */}
        <path d="M162 78  L180 78  L190 68" />
        <path d="M170 110 L204 110" />
        <path d="M162 142 L186 142 L198 154" />
        <path d="M148 172 L166 188 L178 188" />
        {/* Bottom center */}
        <path d="M120 188 L120 210" />
      </g>

      {/* End nodes — large for contrast */}
      <g fill={`url(#${gidNode})`}>
        <circle cx="50"  cy="68"  r="10" />
        <circle cx="36"  cy="110" r="10" />
        <circle cx="42"  cy="154" r="9" />
        <circle cx="62"  cy="188" r="10" />
        <circle cx="190" cy="68"  r="10" />
        <circle cx="204" cy="110" r="10" />
        <circle cx="198" cy="154" r="9" />
        <circle cx="178" cy="188" r="10" />
        <circle cx="120" cy="210" r="11" />
      </g>

      {/* Numeral "1" — bold and large; sits prominently in the center */}
      <g fill={`url(#${gidOne})`}>
        <path d="
          M138 60
          L138 162
          L156 162
          L156 178
          L86 178
          L86 162
          L114 162
          L114 92
          L88 108
          L88 88
          L122 60
          Z
        " />
      </g>

      {withWordmark && (
        <text
          x="120"
          y="252"
          textAnchor="middle"
          fontFamily="'Space Grotesk', system-ui, sans-serif"
          fontWeight="800"
          fontSize="34"
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
