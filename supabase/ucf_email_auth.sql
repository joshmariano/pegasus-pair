-- ============================================================
-- UCF-only auth: block sign-up for non-@ucf.edu emails (server-side)
-- ============================================================
-- Run in Supabase SQL Editor. Requires trigger on auth.users.
-- Client-side validation in /login still blocks before calling signUp;
-- this is a safety net so sign-ups from other clients are rejected.

create or replace function public.check_ucf_email()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.email is null then
    return new;
  end if;
  if lower(trim(new.email)) not like '%@ucf.edu' then
    raise exception 'Only UCF email addresses (@ucf.edu) are allowed to sign up.'
      using errcode = 'P0001';
  end if;
  return new;
end;
$$;

-- Drop existing trigger if present, then create
drop trigger if exists enforce_ucf_email on auth.users;
create trigger enforce_ucf_email
  before insert on auth.users
  for each row
  execute function public.check_ucf_email();
