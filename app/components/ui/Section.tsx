"use client";

import { spacing } from "@/app/styles/design-tokens";

type Props = {
  children: React.ReactNode;
  className?: string;
  maxWidth?: string;
  style?: React.CSSProperties;
};

export default function Section({
  children,
  className = "",
  maxWidth = "48rem",
  style: styleOverride,
}: Props) {
  return (
    <section
      className={className}
      style={{
        width: "100%",
        maxWidth,
        marginLeft: "auto",
        marginRight: "auto",
        paddingLeft: spacing.sectionX,
        paddingRight: spacing.sectionX,
        paddingTop: "clamp(1.15rem, 3.3vw, 2rem)",
        paddingBottom: "clamp(1.15rem, 3.3vw, 2rem)",
        ...styleOverride,
      }}
    >
      {children}
    </section>
  );
}
