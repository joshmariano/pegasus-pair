/**
 * Match season schedule — single source of truth for the app (keep DB seed in sync).
 *
 * Each season:
 * 1. Survey window: [surveyOpensAt, surveyOpensAt + submissionDays) — users submit / edit answers.
 * 2. Anticipation: [surveyClosesAt, matchRevealAt) — submissions closed; matches not visible yet.
 * 3. Match drop: [matchRevealAt, matchRevealAt + windowHours) — list is live; same window used by RPC + RLS.
 */

export type MatchDrop = {
  id: string;
  label: string;
  /** When the submission period opens (UTC ISO). */
  surveyOpensAt: string;
  /** Length of survey period in days (typically 14). */
  submissionDays: number;
  /** When compatibility scores unlock; RLS + generate_matches use this as `drop_at`. */
  matchRevealAt: string;
  /** How long the match list stays visible after reveal. */
  windowHours: number;
};

/** Default survey length — product: “two weeks to submit.” */
export const DEFAULT_SUBMISSION_DAYS = 14;

/**
 * Dev / staging: set `NEXT_PUBLIC_FORCE_SURVEY_OPEN=true` in `.env.local` so the survey form always shows
 * and submits (client treats the window as open). Restart `npm run dev` after changing.
 * For Supabase to accept inserts/updates, run `supabase/dev_force_survey_open.sql` on that project, or revert
 * survey dates in `match_drops` when you go live. Remove the env var for real season timing.
 */
export function isForceSurveyOpenEnabled(): boolean {
  return process.env.NEXT_PUBLIC_FORCE_SURVEY_OPEN === "true";
}

/** Next several seasons. Align ids/dates with `supabase/seed_match_drops.sql`. */
export const MATCH_DROPS: MatchDrop[] = [
  {
    id: "spring-2026",
    label: "Spring 2026",
    // Launch week timeline: submissions open on Monday, names drop 2 weeks later.
    // 2026-04-06 12:00 AM ET
    surveyOpensAt: "2026-04-06T04:00:00.000Z",
    submissionDays: 14,
    // 2026-04-20 12:00 AM ET
    matchRevealAt: "2026-04-20T04:00:00.000Z",
    windowHours: 72,
  },
  {
    id: "fall-2026",
    label: "Fall 2026",
    surveyOpensAt: "2026-09-01T12:00:00.000Z",
    submissionDays: 14,
    matchRevealAt: "2026-09-22T12:00:00.000Z",
    windowHours: 72,
  },
  {
    id: "spring-2027",
    label: "Spring 2027",
    surveyOpensAt: "2027-03-16T12:00:00.000Z",
    submissionDays: 14,
    matchRevealAt: "2027-04-06T12:00:00.000Z",
    windowHours: 72,
  },
  {
    id: "fall-2027",
    label: "Fall 2027",
    surveyOpensAt: "2027-09-01T12:00:00.000Z",
    submissionDays: 14,
    matchRevealAt: "2027-09-22T12:00:00.000Z",
    windowHours: 72,
  },
];

export type CountdownParts = { days: number; hours: number; minutes: number; seconds: number };

export type DropPhase =
  | { kind: "pre_survey"; drop: MatchDrop; surveyOpensAt: Date }
  | { kind: "survey_open"; drop: MatchDrop; surveyClosesAt: Date }
  | { kind: "anticipation"; drop: MatchDrop; matchRevealAt: Date }
  | { kind: "matches_live"; drop: MatchDrop; matchRevealEndsAt: Date }
  | { kind: "idle"; nextSurveyOpensAt: Date | null; nextLabel: string | null };

function toDate(iso: string): Date {
  return new Date(iso);
}

/** End of the submission window (exclusive upper bound uses same instant as “closes”). */
export function getSurveyClosesAt(drop: MatchDrop): Date {
  const open = toDate(drop.surveyOpensAt).getTime();
  return new Date(open + drop.submissionDays * 24 * 60 * 60 * 1000);
}

function sortedDrops(): MatchDrop[] {
  return [...MATCH_DROPS].sort(
    (a, b) => toDate(a.surveyOpensAt).getTime() - toDate(b.surveyOpensAt).getTime()
  );
}

/**
 * Where we are in the season cycle: 2-week survey → anticipation → match drop window.
 */
export function getDropPhase(now?: Date): DropPhase {
  const t = (now ?? new Date()).getTime();
  const drops = sortedDrops();

  for (const drop of drops) {
    const surveyOpen = toDate(drop.surveyOpensAt).getTime();
    const surveyClose = getSurveyClosesAt(drop).getTime();
    const reveal = toDate(drop.matchRevealAt).getTime();
    const revealEnd = reveal + drop.windowHours * 60 * 60 * 1000;

    if (t < surveyOpen) {
      return { kind: "pre_survey", drop, surveyOpensAt: new Date(surveyOpen) };
    }
    if (t < surveyClose) {
      return { kind: "survey_open", drop, surveyClosesAt: new Date(surveyClose) };
    }
    if (t < reveal) {
      return { kind: "anticipation", drop, matchRevealAt: new Date(reveal) };
    }
    if (t < revealEnd) {
      return { kind: "matches_live", drop, matchRevealEndsAt: new Date(revealEnd) };
    }
  }

  const next = drops.find((d) => toDate(d.surveyOpensAt).getTime() > t);
  return {
    kind: "idle",
    nextSurveyOpensAt: next ? toDate(next.surveyOpensAt) : null,
    nextLabel: next?.label ?? null,
  };
}

/** True during the match-list window only (RPC + matches RLS align with this). */
export function isDropLive(now?: Date): boolean {
  return getDropPhase(now).kind === "matches_live";
}

/** True while users may create/update survey answers (the 2-week window). */
export function isSurveyOpen(now?: Date): boolean {
  if (isForceSurveyOpenEnabled()) return true;
  return getDropPhase(now).kind === "survey_open";
}

/** After surveys close, before match reveal — “anticipation” period. */
export function isAnticipationPhase(now?: Date): boolean {
  return getDropPhase(now).kind === "anticipation";
}

/** @deprecated Use getDropPhase; kept for a few call sites that only need the live drop. */
export function getActiveDrop(now?: Date): MatchDrop | null {
  const p = getDropPhase(now);
  return p.kind === "matches_live" ? p.drop : null;
}

/** End of the active match-list window. */
export function getActiveDropEnd(now?: Date): Date | null {
  const p = getDropPhase(now ?? new Date());
  return p.kind === "matches_live" ? p.matchRevealEndsAt : null;
}

/**
 * Next “interesting” instant for countdown UIs when not in matches_live.
 * Prefers: survey close → match reveal → next season survey open.
 */
export function getNextCountdownTarget(now?: Date): { at: Date; title: string; subtitle: string } | null {
  const p = getDropPhase(now);
  switch (p.kind) {
    case "pre_survey":
      return {
        at: p.surveyOpensAt,
        title: p.drop.label,
        subtitle: "Survey opens in",
      };
    case "survey_open":
      return {
        at: p.surveyClosesAt,
        title: p.drop.label,
        subtitle: "Submit your survey by",
      };
    case "anticipation":
      return {
        at: p.matchRevealAt,
        title: p.drop.label,
        subtitle: "Matches drop in",
      };
    case "matches_live":
      return {
        at: p.matchRevealEndsAt,
        title: p.drop.label,
        subtitle: "Match list ends in",
      };
    case "idle":
      if (p.nextSurveyOpensAt) {
        return {
          at: p.nextSurveyOpensAt,
          title: p.nextLabel ?? "Next season",
          subtitle: "Next survey opens in",
        };
      }
      return null;
    default:
      return null;
  }
}

/** Back-compat: next season whose match reveal is still in the future (for legacy copy). */
export function getNextDrop(now?: Date): MatchDrop | null {
  const t = (now ?? new Date()).getTime();
  const drops = sortedDrops();
  for (const d of drops) {
    if (toDate(d.matchRevealAt).getTime() > t) return d;
  }
  return null;
}

/** Countdown to a target time. If target is in the past, returns 0 parts. */
export function getCountdownParts(target: Date, now?: Date): CountdownParts {
  const t = now ?? new Date();
  const ms = target.getTime() - t.getTime();
  if (ms <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  const seconds = Math.floor((ms / 1000) % 60);
  const minutes = Math.floor((ms / 60000) % 60);
  const hours = Math.floor((ms / 3600000) % 24);
  const days = Math.floor(ms / 86400000);
  return { days, hours, minutes, seconds };
}

/** Format countdown as D:HH:MM:SS */
export function formatCountdown(parts: CountdownParts): string {
  const d = String(Math.max(0, parts.days));
  const h = String(Math.max(0, parts.hours)).padStart(2, "0");
  const m = String(Math.max(0, parts.minutes)).padStart(2, "0");
  const s = String(Math.max(0, parts.seconds)).padStart(2, "0");
  return `${d}:${h}:${m}:${s}`;
}

/** Whether the survey can be submitted (client + should match `public.is_survey_open()` in DB). */
export function getSurveyAvailabilityMessage(now?: Date): { open: boolean; detail: string } {
  const t = now ?? new Date();
  if (isSurveyOpen(t)) {
    return { open: true, detail: "" };
  }
  const p = getDropPhase(t);
  const target = getNextCountdownTarget(t);
  const countdownStr = target ? formatCountdown(getCountdownParts(target.at, t)) : "—";

  switch (p.kind) {
    case "pre_survey":
      return {
        open: false,
        detail: `The ${p.drop.label} survey isn’t open yet — it starts in ${countdownStr}. You’ll have ${p.drop.submissionDays} days to complete it.`,
      };
    case "anticipation":
      return {
        open: false,
        detail: `Submissions for ${p.drop.label} are closed. The match list goes live in ${countdownStr}.`,
      };
    case "matches_live":
      return {
        open: false,
        detail: `This season’s survey window has ended. Your ranked list is live for a limited time (${countdownStr} left in this drop window).`,
      };
    case "idle":
      return {
        open: false,
        detail: target
          ? `No survey window right now. Next milestone in ${countdownStr}.`
          : "No survey window is scheduled — check back later.",
      };
    default:
      return {
        open: false,
        detail: `Survey submissions are closed. Next milestone in ${countdownStr}.`,
      };
  }
}

/** Copy for /matches when the match list is not live yet. */
export function getLockedMatchesBlurb(now?: Date): { countdownStr: string; detail: string } {
  const t = now ?? new Date();
  const target = getNextCountdownTarget(t);
  const phase = getDropPhase(t);
  const countdownStr = target ? formatCountdown(getCountdownParts(target.at, t)) : "—";

  switch (phase.kind) {
    case "pre_survey":
      return {
        countdownStr,
        detail: `${phase.drop.label} survey opens in ${countdownStr}. You’ll have ${phase.drop.submissionDays} days to submit before the window closes and the reveal.`,
      };
    case "survey_open":
      return {
        countdownStr,
        detail: `Survey window closes in ${countdownStr}. After that, submissions lock while we get ready for the drop.`,
      };
    case "anticipation":
      return {
        countdownStr,
        detail: `Survey window has ended for ${phase.drop.label}. Ranked matches release in ${countdownStr} (same scoring for all submissions this season).`,
      };
    case "idle":
      return {
        countdownStr,
        detail: target
          ? `Next season milestone in ${countdownStr}.`
          : "New seasons are announced here — check back later.",
      };
    default:
      return {
        countdownStr,
        detail: target ? `Next: ${target.subtitle.toLowerCase()} ${countdownStr}.` : "Check back soon.",
      };
  }
}
