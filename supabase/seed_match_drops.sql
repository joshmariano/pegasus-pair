-- ============================================================
-- Pegasus Pair: seed match_drops (2 per year)
-- ============================================================
-- Keep in sync with app/lib/matchDrops.ts (same ids, dates, UTC).
-- Timeline per season: survey_opens → survey_closes (14 days) → anticipation → drop_at (reveal) → +window_hours.

insert into public.match_drops (id, label, drop_at, window_hours, survey_opens_at, survey_closes_at)
values
  (
    'spring-2026',
    'Spring 2026',
    '2026-04-20 04:00:00+00'::timestamptz,
    72,
    '2026-04-06 04:00:00+00'::timestamptz,
    '2026-04-20 04:00:00+00'::timestamptz
  ),
  (
    'fall-2026',
    'Fall 2026',
    '2026-09-22 12:00:00+00'::timestamptz,
    72,
    '2026-09-01 12:00:00+00'::timestamptz,
    '2026-09-15 12:00:00+00'::timestamptz
  ),
  (
    'spring-2027',
    'Spring 2027',
    '2027-04-06 12:00:00+00'::timestamptz,
    72,
    '2027-03-16 12:00:00+00'::timestamptz,
    '2027-03-30 12:00:00+00'::timestamptz
  ),
  (
    'fall-2027',
    'Fall 2027',
    '2027-09-22 12:00:00+00'::timestamptz,
    72,
    '2027-09-01 12:00:00+00'::timestamptz,
    '2027-09-15 12:00:00+00'::timestamptz
  )
on conflict (id) do update set
  label = excluded.label,
  drop_at = excluded.drop_at,
  window_hours = excluded.window_hours,
  survey_opens_at = excluded.survey_opens_at,
  survey_closes_at = excluded.survey_closes_at;
