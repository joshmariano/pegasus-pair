-- ============================================================
-- Pegasus Pair: profiles table + RLS (idempotent)
-- ============================================================
-- Keeps user_id as PK for compatibility. Adds pool_mode, gender, sexuality, romance_preferences.

create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  major text,
  year text,
  bio text,
  contact_method text,
  contact_value text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on column public.profiles.year is 'e.g. Freshman, Sophomore, Junior, Senior, Grad';
comment on column public.profiles.contact_method is 'instagram, discord, email, phone, other';
comment on column public.profiles.contact_value is 'handle, email, or number';

-- Add new columns if missing (safe for re-runs)
do $$
begin
  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'profiles' and column_name = 'gender') then
    alter table public.profiles add column gender text;
  end if;
  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'profiles' and column_name = 'sexuality') then
    alter table public.profiles add column sexuality text;
  end if;
  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'profiles' and column_name = 'pool_mode') then
    alter table public.profiles add column pool_mode text not null default 'both';
  end if;
  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'profiles' and column_name = 'romance_preferences') then
    alter table public.profiles add column romance_preferences jsonb default '{}';
  end if;
end $$;

comment on column public.profiles.gender is 'e.g. man, woman, nonbinary, other, prefer_not';
comment on column public.profiles.sexuality is 'e.g. straight, gay, bi, pan, asexual, other, prefer_not';
comment on column public.profiles.pool_mode is 'friends | romance | both';
comment on column public.profiles.romance_preferences is 'e.g. { desired_genders: [], desired_sexualities: [] }';

alter table public.profiles enable row level security;

drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile"
  on public.profiles for insert to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
  on public.profiles for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can read own profile" on public.profiles;
create policy "Users can read own profile"
  on public.profiles for select to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Authenticated can read all profiles" on public.profiles;
create policy "Authenticated can read all profiles"
  on public.profiles for select to authenticated
  using (true);
