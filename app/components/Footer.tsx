"use client";

import { colors, typography } from "@/app/styles/design-tokens";

export default function Footer() {
  return (
    <footer
      style={{
        padding: "2rem 1rem",
        borderTop: `1px solid ${colors.border}`,
        backgroundColor: "rgba(255,255,255,0.03)",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
      }}
    >
      <div style={{ maxWidth: "80rem", margin: "0 auto" }}>
        <p
          className="text-center"
          style={{
            color: colors.mutedForeground,
            fontSize: typography.fontSize.xs,
            lineHeight: typography.lineHeight.normal,
          }}
        >
          Security note: Pegasus Pair uses Supabase for authentication and data storage. Access to user data is restricted by
          database row-level security rules. Don’t share passwords or sensitive information you wouldn’t want stored.
        </p>
      </div>
    </footer>
  );
}

