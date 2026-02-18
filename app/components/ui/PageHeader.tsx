"use client";

import { typography, spacing } from "@/app/styles/design-tokens";

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
        marginBottom: "2.5rem",
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
