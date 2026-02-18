-- ============================================================
-- Pegasus Pair: invites table (referral codes) + RLS
-- ============================================================
-- Re-runnable. Authenticated users create invites; anon can read by code (landing);
-- increment uses via RPC for safety.

create table if not exists public.invites (
  code text primary key,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  uses int not null default 0
);

alter table public.invites enable row level security;

drop policy if exists "Users can create own invites" on public.invites;
create policy "Users can create own invites"
  on public.invites for insert to authenticated
  with check (auth.uid() = created_by);

drop policy if exists "Anyone can read invites by code" on public.invites;
create policy "Anyone can read invites by code"
  on public.invites for select
  using (true);

drop policy if exists "Users can read own invites" on public.invites;
create policy "Users can read own invites"
  on public.invites for select to authenticated
  using (auth.uid() = created_by);

-- RPC: increment uses for a code (called after signup with invite). Secured by auth.
create or replace function public.increment_invite_use(code_param text)
returns void
language sql
security definer
set search_path = public
as $$
  update public.invites set uses = uses + 1 where code = code_param;
$$;

grant execute on function public.increment_invite_use(text) to authenticated;

-- Return total successful invite uses for the current user (sum of uses where created_by = uid).
create or replace function public.get_my_invite_uses()
returns int
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(sum(uses)::int, 0) from public.invites where created_by = auth.uid();
$$;
grant execute on function public.get_my_invite_uses() to authenticated;
