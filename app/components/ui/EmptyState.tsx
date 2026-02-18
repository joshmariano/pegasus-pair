"use client";

import { colors, typography, spacing } from "@/app/styles/design-tokens";

type Props = {
  title: string;
  support?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
};

export default function EmptyState({ title, support, action, icon }: Props) {
  return (
    <div
      style={{
        textAlign: "center",
        padding: `${spacing["2xl"]} 0`,
      }}
    >
      {icon && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: spacing.md,
            color: colors.mutedForeground,
            opacity: 0.4,
          }}
        >
          {icon}
        </div>
      )}
      <h3
        style={{
          fontSize: typography.fontSize.xl,
          fontWeight: typography.fontWeight.medium,
          color: colors.foreground,
          marginBottom: support ? spacing.sm : 0,
        }}
      >
        {title}
      </h3>
      {support && (
        <p
          style={{
            fontSize: typography.fontSize.sm,
            color: colors.mutedForeground,
            marginBottom: action ? spacing.lg : 0,
            maxWidth: "28rem",
            marginLeft: "auto",
            marginRight: "auto",
          }}
        >
          {support}
        </p>
      )}
      {action && <div>{action}</div>}
    </div>
  );
}
