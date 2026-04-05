/** Base path for auth callback; use with getSiteUrl(): `${getSiteUrl()}${AUTH_CALLBACK_PATH}` */
export const AUTH_CALLBACK_PATH = "/auth/callback";

const LOCAL_ORIGIN_RE = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i;

function normalizeOrigin(url: string): string {
  return url.trim().replace(/\/$/, "");
}

/**
 * Origin embedded in Supabase email links (signup confirm, resend, password reset).
 * If NEXT_PUBLIC_SITE_URL is set to a non-localhost URL, that wins so production emails
 * always point at the live site — not localhost from a dev signup or wrong browser origin.
 * For local dev (unset or localhost env), uses the current tab origin so the callback matches.
 */
export function getEmailRedirectOrigin(): string {
  const fromEnv =
    typeof process !== "undefined" && process.env.NEXT_PUBLIC_SITE_URL
      ? normalizeOrigin(process.env.NEXT_PUBLIC_SITE_URL)
      : "";
  const runtime =
    typeof window !== "undefined" && window.location?.origin
      ? normalizeOrigin(window.location.origin)
      : "";

  const envIsPublic = Boolean(fromEnv && !LOCAL_ORIGIN_RE.test(fromEnv));
  if (envIsPublic) return fromEnv;

  if (runtime) return runtime;
  return fromEnv;
}

/**
 * Single source of truth for the app's public site URL (origin).
 * - If NEXT_PUBLIC_SITE_URL exists and is non-empty, return its trimmed value.
 * - If running in browser, fallback to window.location.origin.
 * - Else return empty string.
 */
export function getSiteUrl(): string {
  const fromEnv =
    typeof process !== "undefined" && process.env.NEXT_PUBLIC_SITE_URL
      ? process.env.NEXT_PUBLIC_SITE_URL.trim()
      : "";
  if (fromEnv) return fromEnv;
  if (typeof window !== "undefined" && window.location?.origin) {
    return window.location.origin;
  }
  return "";
}
