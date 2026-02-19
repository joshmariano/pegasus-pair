"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  colors,
  typography,
  spacing,
  radius,
  shadow,
} from "@/app/styles/design-tokens";
import {
  getNextDrop,
  getActiveDrop,
  getCountdownParts,
  formatCountdown,
  getActiveDropEnd,
} from "@/app/lib/matchDrops";

/** Inline SVG alarm clock icon with gradient fill. */
function AlarmIcon() {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      style={{ flexShrink: 0 }}
    >
      <defs>
        <linearGradient id="clock-icon-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fb7185" />
          <stop offset="50%" stopColor="#f43f5e" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>
      </defs>
      <path
        d="M12 6v6l4 2M20 13a8 8 0 11-16 0 8 8 0 0116 0z"
        stroke="url(#clock-icon-gradient)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function MatchDropCountdown() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  if (!now) return null;

  const activeDrop = getActiveDrop(now);
  const nextDrop = getNextDrop(now);

  if (activeDrop) {
    const endAt = getActiveDropEnd(now);
    const endParts = endAt ? getCountdownParts(endAt, now) : { days: 0, hours: 0, minutes: 0, seconds: 0 };
    const endString = formatCountdown(endParts);

    return (
      <div
        className="flex flex-col items-center"
        style={{
          marginTop: spacing.xl,
          marginBottom: spacing.xl,
          paddingLeft: spacing.md,
          paddingRight: spacing.md,
          width: "min(92vw, 38rem)",
          maxWidth: "100%",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            position: "relative",
            width: "100%",
            maxWidth: "38rem",
            minWidth: 0,
            background: colors.surfaceStrong,
            border: `1px solid ${colors.borderStrong}`,
            borderRadius: radius.card,
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            boxShadow: shadow.clockWidget,
            padding: spacing.xl,
            overflow: "hidden",
          }}
        >
          <div className="clock-widget-glow" aria-hidden />
          <div className="flex flex-col items-center gap-3" style={{ position: "relative" }}>
            <div className="flex items-center justify-center gap-2">
              <AlarmIcon />
              <p
                className="font-medium"
                style={{
                  fontSize: typography.fontSize.xs,
                  color: colors.mutedForeground,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                }}
              >
                Live: {activeDrop.label}
              </p>
            </div>
            <p className="text-center font-semibold" style={{ fontSize: typography.fontSize["2xl"], color: colors.primary }}>
              Drop is live
            </p>
            <p className="text-center text-sm" style={{ color: colors.mutedForeground }}>
              Ends in {endString}
            </p>
            <Link
              href="/matches"
              className="mt-2 inline-block rounded-lg px-5 py-2.5 font-medium transition-colors"
              style={{
                background: colors.primary,
                color: colors.primaryForeground,
              }}
            >
              View Matches
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!nextDrop) {
    return (
      <div
        className="flex flex-col items-center"
        style={{
          marginTop: spacing.xl,
          marginBottom: spacing.xl,
          paddingLeft: spacing.md,
          paddingRight: spacing.md,
          width: "min(92vw, 38rem)",
          maxWidth: "100%",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "38rem",
            minWidth: 0,
            background: colors.surfaceStrong,
            border: `1px solid ${colors.borderStrong}`,
            borderRadius: radius.card,
            padding: spacing.xl,
          }}
        >
          <p className="text-center text-sm" style={{ color: colors.mutedForeground }}>
            Next Match Drop schedule coming soon. Your survey stays saved.
          </p>
        </div>
      </div>
    );
  }

  const parts = getCountdownParts(new Date(nextDrop.dropAt), now);
  const timerString = formatCountdown(parts);

  return (
    <div
      className="flex flex-col items-center"
      style={{
        marginTop: spacing.xl,
        marginBottom: spacing.xl,
        paddingLeft: spacing.md,
        paddingRight: spacing.md,
        width: "min(92vw, 38rem)",
        maxWidth: "100%",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          position: "relative",
          width: "100%",
          maxWidth: "38rem",
          minWidth: 0,
          background: colors.surfaceStrong,
          border: `1px solid ${colors.borderStrong}`,
          borderRadius: radius.card,
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          boxShadow: shadow.clockWidget,
          padding: spacing.xl,
          overflow: "hidden",
        }}
      >
        <div className="clock-widget-glow" aria-hidden />
        <div className="flex flex-col items-center gap-3" style={{ position: "relative" }}>
          <div className="flex items-center justify-center gap-2">
            <AlarmIcon />
            <p
              className="font-medium"
              style={{
                fontSize: typography.fontSize.xs,
                color: colors.mutedForeground,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}
            >
              Next: {nextDrop.label}
            </p>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              justifyContent: "center",
              width: "100%",
              minWidth: 0,
              maxWidth: "100%",
              whiteSpace: "nowrap",
            }}
          >
            <span
              style={{
                fontFamily: typography.fontFamilyClock,
                fontVariantNumeric: "tabular-nums",
                fontWeight: typography.fontWeight.semibold,
                fontSize: "clamp(1.6rem, 5vw, 4rem)",
                color: colors.foreground,
                whiteSpace: "nowrap",
                display: "inline-flex",
                alignItems: "baseline",
                letterSpacing: "0.02em",
                lineHeight: 1,
              }}
            >
              {timerString}
            </span>
          </div>
          <p
            className="text-center text-sm"
            style={{ color: colors.mutedForeground, maxWidth: "20rem" }}
          >
            Matches unlock during drop windows. Your survey stays saved.
          </p>
        </div>
      </div>
    </div>
  );
}
