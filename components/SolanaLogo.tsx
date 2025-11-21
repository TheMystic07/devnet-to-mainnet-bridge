import React from "react";

type Props = {
  variant?: "mark" | "wordmark";
  size?: number;
  className?: string;
};

// Minimal Solana-like gradient logo (three bars) for branding in UI.
export default function SolanaLogo({ variant = "mark", size = 28, className }: Props) {
  if (variant === "mark") {
    return (
      <svg
        width={size}
        height={(size * 28) / 28}
        viewBox="0 0 115 92"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        aria-label="Solana"
      >
        <defs>
          <linearGradient id="solanaGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#7c3aed" />
            <stop offset="50%" stopColor="#a855f7" />
            <stop offset="100%" stopColor="#c084fc" />
          </linearGradient>
        </defs>
        <rect x="0" y="0" width="115" height="24" rx="8" fill="url(#solanaGrad)" />
        <rect x="0" y="34" width="115" height="24" rx="8" fill="url(#solanaGrad)" />
        <rect x="0" y="68" width="115" height="24" rx="8" fill="url(#solanaGrad)" />
      </svg>
    );
  }

  return (
    <div className={`flex items-center gap-3 ${className ?? ""}`.trim()}>
      <SolanaLogo variant="mark" size={size} />
      <span className="select-none text-xl font-extrabold tracking-tight" style={{
        background: "linear-gradient(90deg, #ffffff 0%, #d9d9e3 100%)",
        WebkitBackgroundClip: "text",
        backgroundClip: "text",
        color: "transparent",
      }}>
        Solana
      </span>
    </div>
  );
}


