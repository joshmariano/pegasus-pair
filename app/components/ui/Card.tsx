"use client";

import { useState } from "react";
import { colors, spacing, radius, shadow } from "@/app/styles/design-tokens";

type Props = {
  children: React.ReactNode;
  className?: string;
  /** Rose-tinted glow shadow. */
  glow?: boolean;
  /** Faint rose border / success state. */
  highlight?: boolean;
  /** Slightly stronger accent presence (e.g. invite page). */
  accentPresence?: boolean;
};

export default function Card({
  children,
  className = "",
  glow = false,
  highlight,
  accentPresence,
}: Props) {
  const [hover, setHover] = useState(false);
  const borderColor = highlight
    ? "rgba(244, 63, 94, 0.35)"
    : accentPresence
      ? "rgba(244, 63, 94, 0.2)"
      : hover
        ? colors.borderStrong
        : colors.border;
  const boxShadow = glow
    ? shadow.cardGlow
    : highlight
      ? `0 0 0 1px rgba(244, 63, 94, 0.2), ${shadow.cardGlow}`
      : shadow.card;
  const backgroundColor = accentPresence
    ? colors.surfaceStrong
    : colors.surface;

  return (
    <div
      className={className}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        padding: `${spacing.card} ${spacing.cardSm}`,
        backgroundColor,
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        border: `1px solid ${borderColor}`,
        borderRadius: radius["2xl"],
        boxShadow,
        transition: "border-color 0.2s ease, box-shadow 0.2s ease",
      }}
    >
      {children}
    </div>
  );
}
