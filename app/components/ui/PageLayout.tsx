"use client";

import { colors, gradients } from "@/app/styles/design-tokens";

type Props = {
  children: React.ReactNode;
  className?: string;
  /** Show top/right/left glows (default true). */
  glow?: boolean;
  /** Extra glow at bottom (e.g. matches page). */
  glowBottomLeft?: boolean;
  /** Extra glow at top-right (e.g. profile). */
  glowTopRight?: boolean;
};

const glowLayerStyle: React.CSSProperties = {
  position: "absolute",
  inset: 0,
  zIndex: 0,
  pointerEvents: "none",
};

export default function PageLayout({
  children,
  className = "",
  glow = true,
  glowBottomLeft,
  glowTopRight,
}: Props) {
  return (
    <div
      className={`grain-overlay ${className}`.trim()}
      style={{
        minHeight: "100vh",
        position: "relative",
        overflow: "visible",
        background: colors.backgroundBase,
      }}
    >
      {/* B) Dominant warm color wash */}
      <div
        aria-hidden
        style={{
          ...glowLayerStyle,
          background: gradients.colorWash,
        }}
      />
      {/* C) Hero center glow (always) */}
      <div
        aria-hidden
        style={{
          ...glowLayerStyle,
          background: gradients.heroGlowCenter,
        }}
      />
      {/* D) Radial glows – top, right, left */}
      {glow && (
        <>
          <div
            aria-hidden
            style={{
              ...glowLayerStyle,
              background: gradients.glowTop,
            }}
          />
          <div
            aria-hidden
            style={{
              ...glowLayerStyle,
              background: gradients.glowRight,
            }}
          />
          <div
            aria-hidden
            style={{
              ...glowLayerStyle,
              background: gradients.glowLeft,
            }}
          />
        </>
      )}
      {glowTopRight && (
        <div
          aria-hidden
          style={{
            ...glowLayerStyle,
            background: gradients.glowRight,
          }}
        />
      )}
      {(glowBottomLeft ?? false) && (
        <div
          aria-hidden
          style={{
            ...glowLayerStyle,
            background: gradients.glowBottom,
          }}
        />
      )}
      {/* E) Light dark overlay (readability, less dominance) */}
      <div
        aria-hidden
        style={{
          ...glowLayerStyle,
          background: gradients.pageBackground,
        }}
      />
      {/* F) Subtle vignette only */}
      <div
        aria-hidden
        style={{
          ...glowLayerStyle,
          background: gradients.vignette,
        }}
      />
      {/* Content */}
      <div
        style={{
          position: "relative",
          zIndex: 2,
          overflow: "visible",
        }}
      >
        {children}
      </div>
    </div>
  );
}
