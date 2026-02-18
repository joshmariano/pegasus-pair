-- ============================================================
-- Pegasus Pair: match_drops table + is_drop_live()
-- ============================================================
-- Drops define when matches are visible. Window = [drop_at, drop_at + window_hours).

create table if not exists public.match_drops (
  id text primary key,
  label text not null,
  drop_at timestamptz not null,
  window_hours int not null default 72
);

comment on table public.match_drops is 'Match drop windows: matches only visible during [drop_at, drop_at + window_hours)';

create or replace function public.is_drop_live(now timestamptz default now())
returns boolean
language sql
stable
set search_path = public
as $$
  select exists (
    select 1 from public.match_drops d
    where now >= d.drop_at
      and now < d.drop_at + (d.window_hours || ' hours')::interval
  );
$$;

grant select on public.match_drops to authenticated;

-- Matches are only readable during a drop window.
drop policy if exists "Users can read own matches" on public.matches;
create policy "Users can read own matches"
  on public.matches for select to authenticated
  using (auth.uid() = user_id and public.is_drop_live());
