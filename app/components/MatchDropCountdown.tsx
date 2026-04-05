"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  typography,
  spacing,
  radius,
  shadow,
} from "@/app/styles/design-tokens";
import {
  getDropPhase,
  getNextCountdownTarget,
  getCountdownParts,
  formatCountdown,
} from "@/app/lib/matchDrops";

const DEFAULT_SUBMISSION_COPY =
  "Names drop two weeks after survey launch.";
const rose = {
  timer: "#ffd4e4",
  cardBg: "rgba(255, 122, 162, 0.11)",
  cardBorder: "rgba(255, 140, 175, 0.34)",
  muted: "rgba(255, 236, 244, 0.76)",
  buttonBg: "linear-gradient(135deg, rgba(255,122,162,0.92) 0%, rgba(219,88,170,0.92) 60%, rgba(139,92,246,0.88) 100%)",
  buttonFg: "#fff9fc",
};

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
          <stop offset="0%" stopColor="#ff7aa2" />
          <stop offset="50%" stopColor="#db58aa" />
          <stop offset="100%" stopColor="#ffffff" />
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
    void Promise.resolve().then(() => setNow(new Date()));
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const placeholderTimerString = "00:00:00:00";

  const timerStyle: React.CSSProperties = {
    fontFamily: "var(--font-geist-sans), -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif",
    fontVariantNumeric: "tabular-nums",
    fontWeight: 800,
    fontSize: "clamp(2.2rem, 6.8vw, 4.5rem)",
    color: rose.timer,
    whiteSpace: "nowrap",
    display: "inline-flex",
    alignItems: "baseline",
    letterSpacing: "-0.025em",
    lineHeight: 1,
  };

  if (!now) {
    return (
      <div
        className="flex flex-col items-center"
        style={{
          marginTop: spacing.xl,
          marginBottom: spacing.xl,
          paddingLeft: spacing.md,
          paddingRight: spacing.md,
          width: "100%",
          maxWidth: "44rem",
          marginLeft: "auto",
          marginRight: "auto",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "44rem",
            minWidth: 0,
            background: rose.cardBg,
            border: `1px solid ${rose.cardBorder}`,
            borderRadius: radius.card,
            padding: spacing.xl,
          }}
        >
          <div className="flex flex-col items-center gap-3">
            <p className="text-center font-medium" style={{ color: rose.muted }}>Loading schedule…</p>
            <span style={{ ...timerStyle }}>{placeholderTimerString}</span>
          </div>
        </div>
      </div>
    );
  }

  const phase = getDropPhase(now);
  const target = getNextCountdownTarget(now);
  const countdownTarget =
    phase.kind === "pre_survey" || phase.kind === "survey_open" || phase.kind === "anticipation"
      ? {
          at: new Date(phase.drop.matchRevealAt),
          title: phase.drop.label,
          subtitle: "Names drop in",
        }
      : target;
  const parts = countdownTarget ? getCountdownParts(countdownTarget.at, now) : { days: 0, hours: 0, minutes: 0, seconds: 0 };
  const timerString = formatCountdown(parts);

  const showSurveyCta = phase.kind === "survey_open";
  const showMatchesCta = phase.kind === "matches_live";

  return (
    <div
      className="flex flex-col items-center"
      style={{
        marginTop: spacing.md,
        marginBottom: spacing.lg,
        paddingLeft: spacing.md,
        paddingRight: spacing.md,
        width: "100%",
        maxWidth: "44rem",
        marginLeft: "auto",
        marginRight: "auto",
        boxSizing: "border-box",
      }}
    >
      <div
        className="home-card-hover"
        style={{
          position: "relative",
          width: "100%",
          maxWidth: "44rem",
          minWidth: 0,
          background: rose.cardBg,
          border: `1px solid ${rose.cardBorder}`,
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
                color: rose.muted,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}
            >
              {countdownTarget ? countdownTarget.title : "Pegasus Pair"}
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
            <span style={timerStyle}>{countdownTarget ? timerString : placeholderTimerString}</span>
          </div>
          <p className="text-center text-sm" style={{ color: rose.muted, maxWidth: "22rem" }}>
            {countdownTarget ? (
              <>
                {countdownTarget.subtitle}
                {phase.kind === "survey_open" && (
                  <> · {DEFAULT_SUBMISSION_COPY}</>
                )}
                {phase.kind === "pre_survey" && (
                  <> · {DEFAULT_SUBMISSION_COPY}</>
                )}
                {phase.kind === "anticipation" && (
                  <> · Survey window closed — names release on the scheduled drop.</>
                )}
                {phase.kind === "matches_live" && (
                  <> · Your ranked list is live for a limited time.</>
                )}
              </>
            ) : (
              "Season schedule will be posted here."
            )}
          </p>
          {showMatchesCta && (
            <Link
              href="/matches"
              className="mt-2 inline-block rounded-lg px-5 py-2.5 font-medium transition-colors"
              style={{
                background: rose.buttonBg,
                color: rose.buttonFg,
              }}
            >
              View matches
            </Link>
          )}
          {showSurveyCta && (
            <Link
              href="/survey"
              className="mt-2 inline-block rounded-lg px-5 py-2.5 font-medium transition-colors"
              style={{
                background: rose.buttonBg,
                color: rose.buttonFg,
              }}
            >
              Take survey
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
