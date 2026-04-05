"use client";

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
  glow: _glow = true,
  glowBottomLeft: _glowBottomLeft,
  glowTopRight: _glowTopRight,
}: Props) {
  void _glow;
  void _glowBottomLeft;
  void _glowTopRight;

  return (
    <div
      className={className}
      style={{
        minHeight: "100vh",
        position: "relative",
      }}
    >
      {children}
    </div>
  );
}
