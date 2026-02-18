-- ============================================================
-- Pegasus Pair: invite-based match limit helpers
-- ============================================================
-- Must match app/lib/matchRewards.ts: BASE=10, BONUS_PER=3, MAX_INVITES=10.

create or replace function public.get_invite_uses(uid uuid)
returns int
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(sum(uses)::int, 0) from public.invites where created_by = uid;
$$;

create or replace function public.get_effective_match_limit(
  uid uuid,
  base int default 10,
  bonus_per int default 3,
  max_invites int default 10
)
returns int
language sql
stable
security definer
set search_path = public
as $$
  select base + bonus_per * least(greatest(0, public.get_invite_uses(uid)), max_invites);
$$;

grant execute on function public.get_invite_uses(uuid) to authenticated;
grant execute on function public.get_effective_match_limit(uuid, int, int, int) to authenticated;

-- ============================================================
-- Pegasus Pair: generate_matches_for_user RPC
-- ============================================================
-- SECURITY DEFINER: reads surveys/profiles, computes score, upserts matches.
-- Effective limit = get_effective_match_limit(me); client limit_param is capped by it.
-- Scoring: norm = (ans-1)/6, sim = 1 - abs(normA-normB), section weights, percent.
-- Section weights: personality 0.30, values 0.25, emotional 0.20, lifestyle 0.15, social 0.10.
-- Romance pool: scale core by 0.85, add romance section 0.15.

create or replace function public.compute_compatibility(
  core_a jsonb,
  core_b jsonb,
  romance_a jsonb default '{}',
  romance_b jsonb default '{}',
  use_romance boolean default false
)
returns table(score numeric, reasons jsonb)
language plpgsql
security definer
set search_path = public
as $$
declare
  q record;
  norm_a numeric;
  norm_b numeric;
  sim numeric;
  -- section sums and counts
  s_personality_sum numeric := 0; s_personality_n int := 0;
  s_values_sum numeric := 0; s_values_n int := 0;
  s_emotional_sum numeric := 0; s_emotional_n int := 0;
  s_lifestyle_sum numeric := 0; s_lifestyle_n int := 0;
  s_social_sum numeric := 0; s_social_n int := 0;
  s_romance_sum numeric := 0; s_romance_n int := 0;
  -- section sims
  sim_p numeric; sim_v numeric; sim_e numeric; sim_l numeric; sim_s numeric; sim_r numeric;
  final_score numeric;
  reason_list jsonb := '[]'::jsonb;
  section_order text[] := array['personality','values','emotional','lifestyle','social'];
  rom_ids text[] := array['R1','R2','R3','R4','R5'];
  core_ids_by_section jsonb := '{
    "personality": ["P1","P2","P3","P4","P5","P6","P7","P8"],
    "values": ["V1","V2","V3","V4","V5","V6","V7"],
    "emotional": ["E1","E2","E3","E4","E5","E6"],
    "lifestyle": ["L1","L2","L3","L4","L5"],
    "social": ["S1","S2","S3","S4"]
  }'::jsonb;
  arr jsonb;
  qid text;
  va int; vb int;
begin
  -- Core sections
  for q in select * from jsonb_each_text(core_ids_by_section) loop
    arr := q.value;
    for i in 0..jsonb_array_length(arr)-1 loop
      qid := arr->>i;
      va := (core_a->>qid)::int;
      vb := (core_b->>qid)::int;
      if va is not null and vb is not null and va between 1 and 7 and vb between 1 and 7 then
        norm_a := (va - 1)::numeric / 6;
        norm_b := (vb - 1)::numeric / 6;
        sim := 1 - abs(norm_a - norm_b);
        case q.key
          when 'personality' then s_personality_sum := s_personality_sum + sim; s_personality_n := s_personality_n + 1;
          when 'values' then s_values_sum := s_values_sum + sim; s_values_n := s_values_n + 1;
          when 'emotional' then s_emotional_sum := s_emotional_sum + sim; s_emotional_n := s_emotional_n + 1;
          when 'lifestyle' then s_lifestyle_sum := s_lifestyle_sum + sim; s_lifestyle_n := s_lifestyle_n + 1;
          when 'social' then s_social_sum := s_social_sum + sim; s_social_n := s_social_n + 1;
        end case;
      end if;
    end loop;
  end loop;

  sim_p := case when s_personality_n > 0 then s_personality_sum / s_personality_n else 0 end;
  sim_v := case when s_values_n > 0 then s_values_sum / s_values_n else 0 end;
  sim_e := case when s_emotional_n > 0 then s_emotional_sum / s_emotional_n else 0 end;
  sim_l := case when s_lifestyle_n > 0 then s_lifestyle_sum / s_lifestyle_n else 0 end;
  sim_s := case when s_social_n > 0 then s_social_sum / s_social_n else 0 end;

  if use_romance then
    for i in 1..array_length(rom_ids,1) loop
      qid := rom_ids[i];
      va := (romance_a->>qid)::int;
      vb := (romance_b->>qid)::int;
      if va is not null and vb is not null and va between 1 and 7 and vb between 1 and 7 then
        norm_a := (va - 1)::numeric / 6;
        norm_b := (vb - 1)::numeric / 6;
        s_romance_sum := s_romance_sum + (1 - abs(norm_a - norm_b));
        s_romance_n := s_romance_n + 1;
      end if;
    end loop;
    sim_r := case when s_romance_n > 0 then s_romance_sum / s_romance_n else 0 end;
    final_score := 0.85 * (0.30*sim_p + 0.25*sim_v + 0.20*sim_e + 0.15*sim_l + 0.10*sim_s) + 0.15 * sim_r;
  else
    final_score := 0.30*sim_p + 0.25*sim_v + 0.20*sim_e + 0.15*sim_l + 0.10*sim_s;
  end if;

  -- Reasons: top sections (add up to 5 bullets)
  if sim_p > 0 then reason_list := reason_list || '["Similar personality & energy (you both align well)."]'::jsonb; end if;
  if sim_v > 0 then reason_list := reason_list || '["Aligned values & priorities."]'::jsonb; end if;
  if sim_e > 0 then reason_list := reason_list || '["Compatible communication style."]'::jsonb; end if;
  if sim_l > 0 then reason_list := reason_list || '["Similar lifestyle & habits."]'::jsonb; end if;
  if sim_s > 0 then reason_list := reason_list || '["Matching social style."]'::jsonb; end if;
  if use_romance and sim_r > 0 then reason_list := reason_list || '["Similar relationship preferences."]'::jsonb; end if;
  reason_list := (select coalesce(jsonb_agg(to_jsonb(elem)), '[]') from (select jsonb_array_elements_text(reason_list) as elem limit 5) sub);

  score := round(least(1, greatest(0, final_score))::numeric, 4);
  reasons := coalesce(reason_list, '[]'::jsonb);
  return next;
  return;
end;
$$;

create or replace function public.generate_matches_for_user(pool_param text, limit_param int default 25)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  me uuid := auth.uid();
  my_survey record;
  my_profile record;
  cand record;
  comp record;
  score_val numeric;
  reasons_val jsonb;
  use_romance boolean;
  desired_genders text[];
  desired_sexualities text[];
  candidate_ok boolean;
  inserted int := 0;
  effective_limit int;
begin
  if me is null then return; end if;
  if pool_param is null or pool_param not in ('friends','romance') then return; end if;

  if not public.is_drop_live(now()) then
    raise exception 'matches_locked: Matches are only available during drop windows.';
  end if;

  effective_limit := least(coalesce(limit_param, 999), public.get_effective_match_limit(me, 10, 3, 10));

  select s.user_id, s.pool_mode, s.core_answers, s.romance_answers
    into my_survey from public.surveys s where s.user_id = me;
  if my_survey is null or my_survey.core_answers is null or jsonb_typeof(my_survey.core_answers) != 'object' then
    return;
  end if;

  select p.gender, p.sexuality, p.romance_preferences
    into my_profile from public.profiles p where p.user_id = me;

  use_romance := (pool_param = 'romance');
  desired_genders := coalesce(
    (select array_agg(x::text) from jsonb_array_elements_text(coalesce(my_profile.romance_preferences->'desired_genders', '[]'::jsonb)) x),
    array[]::text[]);
  desired_sexualities := coalesce(
    (select array_agg(x::text) from jsonb_array_elements_text(coalesce(my_profile.romance_preferences->'desired_sexualities', '[]'::jsonb)) x),
    array[]::text[]);

  delete from public.matches where user_id = me and pool = pool_param;

  for cand in
    select s.user_id, s.core_answers, s.romance_answers, p.gender, p.sexuality, p.romance_preferences
    from public.surveys s
    join public.profiles p on p.user_id = s.user_id
    where s.user_id != me
      and s.core_answers is not null
      and jsonb_typeof(s.core_answers) = 'object'
    order by s.updated_at desc nulls last
    limit 500
  loop
    candidate_ok := true;
    if pool_param = 'romance' then
      if array_length(desired_genders, 1) > 0 and (cand.gender is null or not (cand.gender = any(desired_genders))) then
        candidate_ok := false;
      end if;
      if candidate_ok and array_length(desired_sexualities, 1) > 0 and (cand.sexuality is null or not (cand.sexuality = any(desired_sexualities))) then
        candidate_ok := false;
      end if;
      if candidate_ok and cand.romance_preferences is not null then
        if (cand.romance_preferences->'desired_genders') is not null then
          if my_profile.gender is null or not (my_profile.gender::text = any(
            select array_agg(x::text) from jsonb_array_elements_text(cand.romance_preferences->'desired_genders') x)) then
            candidate_ok := false;
          end if;
        end if;
        if candidate_ok and (cand.romance_preferences->'desired_sexualities') is not null then
          if my_profile.sexuality is null or not (my_profile.sexuality::text = any(
            select array_agg(x::text) from jsonb_array_elements_text(cand.romance_preferences->'desired_sexualities') x)) then
            candidate_ok := false;
          end if;
        end if;
      end if;
    end if;

    if not candidate_ok then continue; end if;

    select c.score, c.reasons into score_val, reasons_val
    from public.compute_compatibility(
      my_survey.core_answers,
      cand.core_answers,
      my_survey.romance_answers,
      cand.romance_answers,
      use_romance
    ) c;

    insert into public.matches (user_id, match_user_id, pool, score, reasons)
    values (me, cand.user_id, pool_param, score_val, reasons_val)
    on conflict (user_id, match_user_id, pool) do update set score = excluded.score, reasons = excluded.reasons;

    inserted := inserted + 1;
    if inserted >= effective_limit then exit; end if;
  end loop;
end;
$$;

grant execute on function public.compute_compatibility(jsonb, jsonb, jsonb, jsonb, boolean) to authenticated;
grant execute on function public.generate_matches_for_user(text, int) to authenticated;
