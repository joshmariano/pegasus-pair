"use client";

import { colors, gradients, spacing, typography } from "@/app/styles/design-tokens";

type Props = {
  children: React.ReactNode;
  className?: string;
  /** 0–2 for slight variation. */
  variant?: 0 | 1 | 2;
  /** Use brand gradient background (e.g. match score, highlighted tag). */
  highlighted?: boolean;
};

const CHIP_BG = "rgba(244, 63, 94, 0.1)";
const CHIP_BORDER = "rgba(244, 63, 94, 0.2)";
const CHIP_COLOR = colors.primary;

export default function Chip({
  children,
  className = "",
  variant = 0,
  highlighted = false,
}: Props) {
  const opacity = highlighted ? 1 : 1 - variant * 0.05;
  return (
    <span
      className={className}
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: `${spacing.xs} ${spacing.md}`,
        fontSize: typography.fontSize.xs,
        fontWeight: typography.fontWeight.medium,
        color: highlighted ? colors.primaryForeground : CHIP_COLOR,
        backgroundColor: highlighted ? undefined : CHIP_BG,
        background: highlighted ? gradients.brandGradient : undefined,
        borderRadius: "9999px",
        border: `1px solid ${highlighted ? "transparent" : CHIP_BORDER}`,
        opacity,
      }}
    >
      {children}
    </span>
  );
}
