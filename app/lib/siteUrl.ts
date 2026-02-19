/** Base path for auth callback; use with getSiteUrl(): `${getSiteUrl()}${AUTH_CALLBACK_PATH}` */
export const AUTH_CALLBACK_PATH = "/auth/callback";

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
