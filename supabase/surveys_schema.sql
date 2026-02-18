-- ============================================================
-- Pegasus Pair: surveys table (core + romance answers, pool_mode)
-- ============================================================
-- One row per user. core_answers and romance_answers keyed by question id, value 1..7.

create table if not exists public.surveys (
  user_id uuid primary key references auth.users(id) on delete cascade,
  pool_mode text not null default 'both',
  core_answers jsonb not null default '{}',
  romance_answers jsonb not null default '{}',
  submitted_at timestamptz default now(),
  updated_at timestamptz default now()
);

comment on column public.surveys.core_answers is 'key: questionId, value: 1..7';
comment on column public.surveys.romance_answers is 'key: questionId, value: 1..7';

alter table public.surveys enable row level security;

drop policy if exists "Users can insert own survey" on public.surveys;
create policy "Users can insert own survey"
  on public.surveys for insert to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own survey" on public.surveys;
create policy "Users can update own survey"
  on public.surveys for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can read own survey" on public.surveys;
create policy "Users can read own survey"
  on public.surveys for select to authenticated
  using (auth.uid() = user_id);

-- Service/RPC needs to read other users' surveys for matching; we do matching in RPC (SECURITY DEFINER).
-- So no policy here for "read all". RPC runs with definer rights and can read surveys internally.
