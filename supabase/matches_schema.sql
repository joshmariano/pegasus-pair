-- ============================================================
-- Pegasus Pair: matches table + RLS
-- ============================================================
-- One row per (user_id, match_user_id, pool). Insert via RPC or with check user_id = auth.uid().

create table if not exists public.matches (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  match_user_id uuid not null references auth.users(id) on delete cascade,
  pool text not null,
  score numeric not null,
  reasons jsonb not null default '[]',
  created_at timestamptz default now(),
  constraint matches_user_match_pool_unique unique (user_id, match_user_id, pool),
  constraint matches_no_self check (user_id != match_user_id)
);

comment on column public.matches.pool is 'friends | romance';
comment on column public.matches.reasons is 'array of bullet strings';

alter table public.matches enable row level security;

drop policy if exists "Users can read own matches" on public.matches;
create policy "Users can read own matches"
  on public.matches for select to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own matches" on public.matches;
create policy "Users can insert own matches"
  on public.matches for insert to authenticated
  with check (auth.uid() = user_id and user_id != match_user_id);

-- Updates/deletes only via RPC or own row if you add that later.
drop policy if exists "Users can delete own matches" on public.matches;
create policy "Users can delete own matches"
  on public.matches for delete to authenticated
  using (auth.uid() = user_id);
