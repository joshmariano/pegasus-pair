"use client";

import { useState } from "react";
import { colors, shadow } from "@/app/styles/design-tokens";

type Props = {
  children: React.ReactNode;
  className?: string;
  /** Rose-tinted glow shadow. */
  glow?: boolean;
  /** Faint rose border / success state. */
  highlight?: boolean;
  /** Slightly stronger accent presence (e.g. invite page). */
  accentPresence?: boolean;
  /** Subtle animated border sheen for premium card look. */
  shine?: boolean;
};

export default function Card({
  children,
  className = "",
  glow = false,
  highlight,
  accentPresence,
  shine = true,
}: Props) {
  const [hover, setHover] = useState(false);
  const borderColor = highlight
    ? "rgba(255, 140, 175, 0.42)"
    : accentPresence
      ? "rgba(255, 140, 175, 0.26)"
      : hover
        ? "rgba(255, 196, 219, 0.34)"
        : colors.border;
  const boxShadow = glow
    ? shadow.cardGlow
    : highlight
      ? `0 0 0 1px rgba(255, 140, 175, 0.28), ${shadow.cardGlow}`
      : "0 12px 34px rgba(11, 7, 16, 0.42)";
  const backgroundColor = accentPresence
    ? colors.surfaceStrong
    : colors.surface;

  return (
    <div
      className={`${shine ? "pp-shine-card" : ""} ${className}`.trim()}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        position: "relative",
        overflow: "hidden",
        isolation: "isolate",
        padding: "clamp(1rem, 2.3vw, 1.35rem) clamp(1rem, 2.8vw, 1.7rem)",
        background: `linear-gradient(135deg, ${backgroundColor} 0%, rgba(255, 255, 255, 0.03) 100%)`,
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        border: `1px solid ${borderColor}`,
        borderRadius: "1.15rem",
        boxShadow,
        transition: "border-color 0.2s ease, box-shadow 0.2s ease",
      }}
    >
      <div style={{ position: "relative", zIndex: 1 }}>
        {children}
      </div>
    </div>
  );
}
