import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

let _client: SupabaseClient | null = null;

/**
 * Browser Supabase client singleton.
 * Uses NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY from .env.local (project root).
 * Next.js inlines these at compile time — restart `npm run dev` after changing env files.
 */
export function getSupabase(): SupabaseClient {
  if (_client) return _client;

  const url =
    typeof process.env.NEXT_PUBLIC_SUPABASE_URL === "string"
      ? process.env.NEXT_PUBLIC_SUPABASE_URL.trim()
      : "";
  const anonKey =
    typeof process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY === "string"
      ? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.trim()
      : "";

  if (!url) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL. Add it to .env.local in the project root, then restart the dev server (npm run dev)."
    );
  }
  if (!/^https?:\/\//i.test(url)) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL must start with https:// (use the Project URL from Supabase → Settings → API)."
    );
  }
  if (!anonKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_ANON_KEY. Add it to .env.local in the project root, then restart the dev server (npm run dev)."
    );
  }

  try {
    _client = createBrowserClient(url, anonKey);
    return _client;
  } catch (err) {
    console.error("[supabase] createClient failed:", err);
    throw err;
  }
}
