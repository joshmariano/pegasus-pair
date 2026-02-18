/**
 * Match Drop schedule: 2 drops per year. Single source of truth.
 * Window = [dropAt, dropAt + windowHours). All times UTC.
 */

export type MatchDrop = {
  id: string;
  label: string;
  dropAt: string; // ISO datetime UTC
  windowHours: number;
};

/** Next 4 drops (2 years). Keep in sync with supabase/seed_match_drops.sql */
export const MATCH_DROPS: MatchDrop[] = [
  { id: "spring-2026", label: "Spring Drop 2026", dropAt: "2026-03-15T12:00:00.000Z", windowHours: 72 },
  { id: "fall-2026", label: "Fall Drop 2026", dropAt: "2026-09-15T12:00:00.000Z", windowHours: 72 },
  { id: "spring-2027", label: "Spring Drop 2027", dropAt: "2027-03-15T12:00:00.000Z", windowHours: 72 },
  { id: "fall-2027", label: "Fall Drop 2027", dropAt: "2027-09-15T12:00:00.000Z", windowHours: 72 },
];

export type CountdownParts = { days: number; hours: number; minutes: number; seconds: number };

function toDate(iso: string): Date {
  return new Date(iso);
}

/** Returns the next upcoming drop (dropAt > now). If all past, returns null. */
export function getNextDrop(now?: Date): MatchDrop | null {
  const t = now ?? new Date();
  const next = MATCH_DROPS.find((d) => toDate(d.dropAt).getTime() > t.getTime());
  return next ?? null;
}

/** Returns the drop whose window contains now, if any. Window = [dropAt, dropAt + windowHours). */
export function getActiveDrop(now?: Date): MatchDrop | null {
  const t = now ?? new Date();
  const ms = t.getTime();
  for (const d of MATCH_DROPS) {
    const start = toDate(d.dropAt).getTime();
    const end = start + d.windowHours * 60 * 60 * 1000;
    if (ms >= start && ms < end) return d;
  }
  return null;
}

/** True if now is within any drop window. */
export function isDropLive(now?: Date): boolean {
  return getActiveDrop(now ?? new Date()) !== null;
}

/** Countdown to a target time. If target is in the past, returns 0. */
export function getCountdownParts(target: Date, now?: Date): CountdownParts {
  const t = now ?? new Date();
  let ms = target.getTime() - t.getTime();
  if (ms <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  const seconds = Math.floor((ms / 1000) % 60);
  const minutes = Math.floor((ms / 60000) % 60);
  const hours = Math.floor((ms / 3600000) % 24);
  const days = Math.floor(ms / 86400000);
  return { days, hours, minutes, seconds };
}

/** Format countdown as DD:HH:MM:SS (days 1–3 digits, rest zero-padded). */
export function formatCountdown(parts: CountdownParts): string {
  const d = String(Math.max(0, parts.days));
  const h = String(Math.max(0, parts.hours)).padStart(2, "0");
  const m = String(Math.max(0, parts.minutes)).padStart(2, "0");
  const s = String(Math.max(0, parts.seconds)).padStart(2, "0");
  return `${d}:${h}:${m}:${s}`;
}

/** End of the active drop window (dropAt + windowHours). Returns null if no active drop. */
export function getActiveDropEnd(now?: Date): Date | null {
  const d = getActiveDrop(now ?? new Date());
  if (!d) return null;
  const start = toDate(d.dropAt).getTime();
  return new Date(start + d.windowHours * 60 * 60 * 1000);
}
