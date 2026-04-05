"use client";

import { spacing } from "@/app/styles/design-tokens";

type Props = {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  className?: string;
};

export default function PageHeader({ title, subtitle, className = "" }: Props) {
  return (
    <div
      className={className}
      style={{
        position: "relative",
        marginBottom: "clamp(1.35rem, 3vw, 2.1rem)",
        overflow: "visible",
      }}
    >
      <div style={{ position: "relative", overflow: "visible" }}>
        {title}
        {subtitle && (
          <div style={{ marginTop: spacing.sm }}>{subtitle}</div>
        )}
      </div>
    </div>
  );
}
