-- ============================================================
-- Pegasus Pair: survey_responses schema + RLS policies
-- ============================================================
-- Creates:
--   public.survey_responses(user_id uuid PK -> auth.users, answers jsonb, updated_at timestamptz)
-- Enables RLS
-- Policies:
--   (a) insert own row
--   (b) update own row
--   (c) select own row
--   (d) PRIVACY TRADEOFF: authenticated users can select all rows (needed for client-side matching)
-- ============================================================

create table if not exists public.survey_responses (
  user_id uuid primary key references auth.users(id) on delete cascade,
  answers jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.survey_responses enable row level security;

-- (a) insert own row
drop policy if exists "Users can insert their own survey" on public.survey_responses;
create policy "Users can insert their own survey"
on public.survey_responses
for insert
to authenticated
with check (auth.uid() = user_id);

-- (b) update own row
drop policy if exists "Users can update their own survey" on public.survey_responses;
create policy "Users can update their own survey"
on public.survey_responses
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- (c) select own row
drop policy if exists "Users can read their own survey" on public.survey_responses;
create policy "Users can read their own survey"
on public.survey_responses
for select
to authenticated
using (auth.uid() = user_id);

-- (d) PRIVACY TRADEOFF:
-- Allows any authenticated user to read all survey responses so the app can compute matches client-side.
-- If you want stronger privacy, remove this and compute matches server-side with a service role.
drop policy if exists "Authenticated users can read all survey responses" on public.survey_responses;
create policy "Authenticated users can read all survey responses"
on public.survey_responses
for select
to authenticated
using (true);
