import { createClient, SupabaseClient } from "@supabase/supabase-js";

let _client: SupabaseClient | null = null;

/**
 * Returns the Supabase client. Throws if env vars are missing (call only on client).
 */
export function getSupabase(): SupabaseClient {
  if (_client) return _client;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Runtime debugging: log URL fully
  console.log("[supabaseClient] raw URL:", url);
  console.log("[supabaseClient] typeof url:", typeof url);
  console.log("[supabaseClient] url.length:", typeof url === "string" ? url.length : "N/A");
  console.log("[supabaseClient] url.startsWith('http'):", typeof url === "string" ? url.startsWith("http") : "N/A");

  if (url === undefined || url === null || typeof url !== "string" || url.trim() === "") {
    throw new Error("Supabase URL not loaded correctly");
  }
  if (anonKey === undefined || anonKey === null || typeof anonKey !== "string" || anonKey.trim() === "") {
    throw new Error("Supabase anon key not loaded correctly");
  }

  const urlTrimmed = url.trim();
  const anonKeyTrimmed = anonKey.trim();

  try {
    console.log("[supabaseClient] createClient called with url:", urlTrimmed, "anonKey length:", anonKeyTrimmed.length);
    _client = createClient(urlTrimmed, anonKeyTrimmed);
    return _client;
  } catch (err) {
    console.error("[supabaseClient] createClient failed. url:", urlTrimmed, "anonKey length:", anonKeyTrimmed.length, "error:", err);
    throw err;
  }
}
