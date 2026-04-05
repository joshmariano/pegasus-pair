-- ============================================================
-- Pegasus Pair: survey submission windows (2 weeks) + match reveal
-- ============================================================
-- Run after match_drops exists. Keeps drop_at = match reveal instant (matches RPC + RLS).

alter table public.match_drops add column if not exists survey_opens_at timestamptz;
alter table public.match_drops add column if not exists survey_closes_at timestamptz;

comment on column public.match_drops.drop_at is 'Match reveal time — list goes live for [drop_at, drop_at + window_hours)';
comment on column public.match_drops.survey_opens_at is 'Start of submission period (typically 14 days before reveal)';
comment on column public.match_drops.survey_closes_at is 'End of submission period; after this, is_survey_open() is false';

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

drop policy if exists "Users can insert own survey" on public.surveys;
create policy "Users can insert own survey"
  on public.surveys for insert to authenticated
  with check (auth.uid() = user_id and public.is_survey_open());

drop policy if exists "Users can update own survey" on public.surveys;
create policy "Users can update own survey"
  on public.surveys for update to authenticated
  using (auth.uid() = user_id and public.is_survey_open())
  with check (auth.uid() = user_id and public.is_survey_open());
