/**
 * Supabase helpers for profile, survey, matches. Caller passes getSupabase().
 */
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Profile, SurveyAnswerMap } from "./types";

/** Upsert current user's profile. */
export async function upsertProfile(
  supabase: SupabaseClient,
  userId: string,
  data: Partial<Pick<Profile, "display_name" | "major" | "year" | "bio" | "contact_method" | "contact_value" | "gender" | "sexuality" | "pool_mode" | "romance_preferences">>
) {
  const row = {
    user_id: userId,
    ...data,
    updated_at: new Date().toISOString(),
  };
  return supabase.from("profiles").upsert(row, { onConflict: "user_id" });
}

/** Save survey (core + optional romance, pool_mode). */
export async function saveSurvey(
  supabase: SupabaseClient,
  userId: string,
  coreAnswers: SurveyAnswerMap,
  romanceAnswers: SurveyAnswerMap,
  poolMode: string
) {
  return supabase
    .from("surveys")
    .upsert(
      {
        user_id: userId,
        pool_mode: poolMode,
        core_answers: coreAnswers,
        romance_answers: romanceAnswers,
        submitted_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );
}

/** Fetch matches for current user for a pool (friends | romance). */
export async function fetchMatches(supabase: SupabaseClient, pool: string) {
  const { data: me } = await supabase.auth.getUser();
  if (!me?.user?.id) return { data: null, error: { message: "Not authenticated" } as Error };
  return supabase
    .from("matches")
    .select("id, match_user_id, pool, score, reasons, created_at")
    .eq("user_id", me.user.id)
    .eq("pool", pool)
    .order("score", { ascending: false });
}

/** Fetch current user's total invite uses (sum of uses on invites they created). */
export async function fetchInviteUses(supabase: SupabaseClient): Promise<{ data: number | null; error: Error | null }> {
  const { data: me } = await supabase.auth.getUser();
  if (!me?.user?.id) return { data: null, error: { message: "Not authenticated" } as Error };
  const { data, error } = await supabase.rpc("get_my_invite_uses");
  if (error) return { data: null, error };
  return { data: typeof data === "number" ? data : 0, error: null };
}

/** Call RPC to generate matches for the current user. Server enforces effective limit from invite uses. */
export async function generateMatches(
  supabase: SupabaseClient,
  pool: "friends" | "romance",
  limit = 999
) {
  return supabase.rpc("generate_matches_for_user", {
    pool_param: pool,
    limit_param: limit,
  });
}
