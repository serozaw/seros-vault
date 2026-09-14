/**
 * Sero — the vault's little white ghost mascot. Pure inline SVG (no image
 * asset to load), floating gently in the background of the hero. Purely
 * decorative: aria-hidden and pointer-events: none so it never gets in the
 * way of real content or interaction.
 */

import type { CSSProperties } from "react";

type GhostMascotProps = {
  className?: string;
  size?: number;
  style?: CSSProperties;
};

export default function GhostMascot({
  className = "",
  size = 76,
  style,
}: GhostMascotProps) {
  return (
    <div className={`ghost-mascot ${className}`} style={style} aria-hidden="true">
      <svg
        width={size}
        height={size * 1.12}
        viewBox="0 0 100 112"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <radialGradient id="ghostBody" cx="50%" cy="32%" r="70%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#efe6ff" />
          </radialGradient>
        </defs>
        <path
          d="M50 6C25.7 6 8 25.4 8 48v50.5c0 2.9 3.4 4.4 5.6 2.5l8-6.9 8.3 7.2c1.5 1.3 3.8 1.3 5.4 0l8.2-7.2 8.5 7.2c1.6 1.3 3.8 1.3 5.4 0l8.2-7.2 8.3 7.2c2.2 1.9 5.6.4 5.6-2.5V48C92 25.4 74.3 6 50 6z"
          fill="url(#ghostBody)"
        />
        <ellipse className="ghost-eye" cx="36" cy="50" rx="5.5" ry="7" fill="#2a1f3d" />
        <ellipse className="ghost-eye" cx="64" cy="50" rx="5.5" ry="7" fill="#2a1f3d" />
        <path
          d="M42 68c2.8 3 13.2 3 16 0"
          stroke="#2a1f3d"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
          opacity="0.55"
        />
      </svg>
    </div>
  );
}
