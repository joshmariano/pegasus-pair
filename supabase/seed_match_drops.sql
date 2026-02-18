-- ============================================================
-- Pegasus Pair: seed match_drops (2 per year, 4 total = 2 years)
-- ============================================================
-- Keep in sync with app/lib/matchDrops.ts (same ids, labels, drop_at, window_hours).

insert into public.match_drops (id, label, drop_at, window_hours)
values
  ('spring-2026', 'Spring Drop 2026', '2026-03-15 12:00:00+00'::timestamptz, 72),
  ('fall-2026', 'Fall Drop 2026', '2026-09-15 12:00:00+00'::timestamptz, 72),
  ('spring-2027', 'Spring Drop 2027', '2027-03-15 12:00:00+00'::timestamptz, 72),
  ('fall-2027', 'Fall Drop 2027', '2027-09-15 12:00:00+00'::timestamptz, 72)
on conflict (id) do update set
  label = excluded.label,
  drop_at = excluded.drop_at,
  window_hours = excluded.window_hours;
