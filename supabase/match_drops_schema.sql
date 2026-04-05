-- ============================================================
-- Pegasus Pair: match_drops table + is_drop_live() + is_survey_open()
-- ============================================================
-- Survey window: [survey_opens_at, survey_closes_at) — typically 14 days.
-- Match list live: [drop_at, drop_at + window_hours) — anticipation is between survey_closes and drop_at.

create table if not exists public.match_drops (
  id text primary key,
  label text not null,
  drop_at timestamptz not null,
  window_hours int not null default 72,
  survey_opens_at timestamptz,
  survey_closes_at timestamptz
);

comment on table public.match_drops is 'Per season: survey window, then match reveal (drop_at) + visibility window';
comment on column public.match_drops.drop_at is 'When ranked matches become visible (RPC + RLS)';

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

create or replace function public.is_survey_open(now_ts timestamptz default now())
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.match_drops d
    where d.survey_opens_at is not null
      and d.survey_closes_at is not null
      and now_ts >= d.survey_opens_at
      and now_ts < d.survey_closes_at
  );
$$;

grant execute on function public.is_survey_open(timestamptz) to authenticated;

-- Matches are only readable during a drop window.
drop policy if exists "Users can read own matches" on public.matches;
create policy "Users can read own matches"
  on public.matches for select to authenticated
  using (auth.uid() = user_id and public.is_drop_live());
