import { memo } from "react";

type Props = {
  className?: string;
  withWordmark?: boolean;
  title?: string;
};

/**
 * FIRSTOV.AI logo — recreated as an inline SVG.
 * Central numeral "1" surrounded by 8 circuit branches ending in nodes,
 * cyan→purple gradient on a dark canvas.
 */
const FirstovLogo = ({ className, withWordmark = false, title = "FIRSTOV.AI" }: Props) => {
  const gid = "firstov-grad";
  const gidSoft = "firstov-grad-soft";
  return (
    <svg
      viewBox="0 0 200 240"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label={title}
    >
      <defs>
        <linearGradient id={gid} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#22d3ee" />
          <stop offset="45%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#a855f7" />
        </linearGradient>
        <linearGradient id={gidSoft} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#a855f7" stopOpacity="0.9" />
        </linearGradient>
      </defs>

      {/* Mark group — centered around (100, 100) */}
      <g
        fill="none"
        stroke={`url(#${gid})`}
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* 8 circuit branches with right-angle bends ending in dots */}
        {/* Top-left cluster */}
        <path d="M100 70 L80 70 L70 60" />
        <path d="M85 85 L60 85 L52 78" />
        <path d="M85 100 L45 100" />
        <path d="M85 115 L60 115 L52 122" />
        {/* Bottom-left */}
        <path d="M95 132 L80 145 L70 145" />
        {/* Top-right */}
        <path d="M115 70 L130 60 L142 60" />
        <path d="M115 85 L140 85 L150 78" />
        <path d="M115 100 L155 100" />
        <path d="M115 115 L140 115 L150 122" />
        {/* Bottom-right */}
        <path d="M115 130 L130 145 L138 145" />
        {/* Bottom center */}
        <path d="M105 135 L105 158" />
      </g>

      {/* End nodes */}
      <g fill={`url(#${gidSoft})`}>
        <circle cx="70" cy="60" r="6" />
        <circle cx="52" cy="78" r="5" />
        <circle cx="45" cy="100" r="6" />
        <circle cx="52" cy="122" r="5" />
        <circle cx="70" cy="145" r="6" />
        <circle cx="142" cy="60" r="6" />
        <circle cx="150" cy="78" r="5" />
        <circle cx="155" cy="100" r="6" />
        <circle cx="150" cy="122" r="5" />
        <circle cx="138" cy="145" r="6" />
        <circle cx="105" cy="158" r="7" />
      </g>

      {/* Numeral "1" — bold, geometric */}
      <g fill={`url(#${gid})`}>
        <path d="
          M104 65
          L88 80
          L88 92
          L97 84
          L97 130
          L84 130
          L84 142
          L122 142
          L122 130
          L110 130
          L110 65
          Z
        " />
      </g>

      {withWordmark && (
        <text
          x="100"
          y="205"
          textAnchor="middle"
          fontFamily="'Space Grotesk', system-ui, sans-serif"
          fontWeight="700"
          fontSize="30"
          letterSpacing="2"
          fill={`url(#${gid})`}
        >
          FIRSTOV.AI
        </text>
      )}
    </svg>
  );
};

export default memo(FirstovLogo);