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
        overflowX: "hidden",
        overflowY: "visible",
        background: colors.backgroundBase,
      }}
    >
      {/* Glow layers: overflow-hidden wrapper + pointer-events: none to avoid scroll/zoom glitches */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 0,
          overflow: "hidden",
          pointerEvents: "none",
        }}
      >
        {/* B) Dominant warm color wash */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            background: gradients.colorWash,
          }}
        />
        {/* C) Hero center glow (always) */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            background: gradients.heroGlowCenter,
          }}
        />
        {/* D) Radial glows – top, right, left */}
        {glow && (
          <>
            <div
              aria-hidden
              style={{
                position: "absolute",
                inset: 0,
                background: gradients.glowTop,
              }}
            />
            <div
              aria-hidden
              style={{
                position: "absolute",
                inset: 0,
                background: gradients.glowRight,
              }}
            />
            <div
              aria-hidden
              style={{
                position: "absolute",
                inset: 0,
                background: gradients.glowLeft,
              }}
            />
          </>
        )}
        {glowTopRight && (
          <div
            aria-hidden
            style={{
              position: "absolute",
              inset: 0,
              background: gradients.glowRight,
            }}
          />
        )}
        {(glowBottomLeft ?? false) && (
          <div
            aria-hidden
            style={{
              position: "absolute",
              inset: 0,
              background: gradients.glowBottom,
            }}
          />
        )}
        {/* E) Light dark overlay (readability, less dominance) */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            background: gradients.pageBackground,
          }}
        />
        {/* F) Subtle vignette only */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            background: gradients.vignette,
          }}
        />
      </div>
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
