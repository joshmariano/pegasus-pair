-- ============================================================
-- Development: keep survey submissions allowed in Supabase RLS
-- ============================================================
-- Use on a dev/staging project while NEXT_PUBLIC_FORCE_SURVEY_OPEN=true in the app.
-- public.is_survey_open() is true when NOW is in [survey_opens_at, survey_closes_at) for any row.
--
-- To go back to real seasons: re-run supabase/seed_match_drops.sql (or restore dates manually).

update public.match_drops
set
  survey_opens_at = '2000-01-01 00:00:00+00'::timestamptz,
  survey_closes_at = '2099-12-31 23:59:59+00'::timestamptz;
