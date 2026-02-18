/**
 * Shared types for profiles, surveys, matches.
 */

export type SurveyAnswerMap = Record<string, number>;

export type PoolMode = "friends" | "romance" | "both";

export type RomancePreferences = {
  desired_genders?: string[];
  desired_sexualities?: string[];
};

export interface Profile {
  user_id: string;
  display_name: string;
  major: string | null;
  year: string | null;
  bio: string | null;
  contact_method: string | null;
  contact_value: string | null;
  gender: string | null;
  sexuality: string | null;
  pool_mode: string;
  romance_preferences: RomancePreferences | null;
  updated_at?: string;
}

export interface Survey {
  user_id: string;
  pool_mode: string;
  core_answers: SurveyAnswerMap;
  romance_answers: SurveyAnswerMap;
  submitted_at: string | null;
  updated_at: string | null;
}

export interface Match {
  id: string;
  user_id: string;
  match_user_id: string;
  pool: string;
  score: number;
  reasons: string[];
  created_at?: string;
}
