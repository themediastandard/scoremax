-- Per-day availability windows on booking requests.
--
-- booking_requests carried one time range for every selected day
-- (available_days text[], available_time_start time, available_time_end time),
-- so "Mon and Thu, 4-6pm" was expressible but "Mon 4-6pm, Thu 9-11am" was not.
--
-- This adds the canonical shape and DELIBERATELY KEEPS the three old columns.
-- Every existing row has only the flat shape and there is nothing to migrate
-- them from, so a hard cutover would blank the "Requested Availability" panel
-- on every booking taken to date. The application now writes both: the per-day
-- array here, and the earliest-start/latest-end envelope into the old columns.
-- Dropping them is a separate change, once nothing reads them.

------------------------------------------------------------------------------
-- 1. The column.
------------------------------------------------------------------------------
alter table public.booking_requests
  add column if not exists available_windows jsonb;

comment on column public.booking_requests.available_windows is
  'Per-day availability as [{"day":"Monday","start":"16:00","end":"18:00"}], '
  'sorted Monday-first with at most one entry per day. NULL on rows created '
  'before 2026-08-04, which carry only available_days/available_time_start/'
  'available_time_end. Readers should prefer this and fall back to those.';

-- Shape guard only: the element contract (day name, HH:MM, end after start) is
-- enforced in src/lib/availability-windows.js, which both write paths run their
-- input through. This stops a non-array from ever reaching a reader that
-- iterates it. Existing rows are all NULL, so this validates instantly.
alter table public.booking_requests
  drop constraint if exists booking_requests_available_windows_is_array;

alter table public.booking_requests
  add constraint booking_requests_available_windows_is_array
  check (available_windows is null or jsonb_typeof(available_windows) = 'array');

------------------------------------------------------------------------------
-- 2. Credit redemption records the per-day shape too.
------------------------------------------------------------------------------
-- The 8-argument signature is dropped and replaced by a 9-argument one rather
-- than left alongside it: two overloads differing only by a defaulted trailing
-- parameter make a call with the original 8 named arguments ambiguous, and
-- PostgREST would start failing every booking.
--
-- p_available_windows therefore DEFAULTS TO NULL, which is what makes the
-- deploy order safe in the one direction that matters. Apply this migration
-- first and the currently-deployed code — which sends only the 8 original named
-- arguments — keeps working untouched against the new function. Deploying the
-- code first would instead leave it calling a function that does not exist yet.
--
-- Body is otherwise unchanged from 20260728160000_refunds_and_signup_collision:
-- credit selection order, the concurrency guards on each UPDATE, and
-- credit_source_id all carry over verbatim.

drop function if exists public.redeem_credit_and_create_booking(
  uuid, uuid[], text[], time, time, text, text, text
);

create or replace function public.redeem_credit_and_create_booking(
  p_profile_id           uuid,
  p_subjects             uuid[],
  p_available_days       text[],
  p_available_time_start time,
  p_available_time_end   time,
  p_timezone             text,
  p_session_type         text,
  p_notes                text,
  p_available_windows    jsonb default null
)
returns public.booking_requests
language plpgsql
security definer
set search_path = public
as $$
declare
  v_customer   public.customers;
  v_source     text;
  v_source_id  uuid;
  v_booking    public.booking_requests;
begin
  select * into v_customer from public.customers where profile_id = p_profile_id;
  if not found then
    raise exception 'customer_not_found' using errcode = 'P0002';
  end if;

  update public.memberships
     set used_hours = coalesce(used_hours, 0) + 1
   where id = (
     select id from public.memberships
      where customer_id = v_customer.id
        and status = 'active'
        and coalesce(included_hours,0) + coalesce(rollover_hours,0)
            - coalesce(used_hours,0) > 0
      order by current_period_end desc nulls last
      limit 1
   )
     and coalesce(included_hours,0) + coalesce(rollover_hours,0)
         - coalesce(used_hours,0) > 0
  returning id into v_source_id;
  if v_source_id is not null then v_source := 'membership'; end if;

  if v_source is null then
    update public.packages
       set remaining_hours = remaining_hours - 1
     where id = (
       select id from public.packages
        where customer_id = v_customer.id
          and remaining_hours > 0
          and (expires_at is null or expires_at > now())
        order by expires_at asc nulls last
        limit 1
     )
       and remaining_hours > 0
       and (expires_at is null or expires_at > now())
    returning id into v_source_id;
    if v_source_id is not null then v_source := 'package'; end if;
  end if;

  if v_source is null then
    update public.course_enrollments
       set remaining_sessions = remaining_sessions - 1
     where id = (
       select id from public.course_enrollments
        where customer_id = v_customer.id
          and status = 'active'
          and remaining_sessions > 0
        order by created_at asc
        limit 1
     )
       and remaining_sessions > 0
    returning id into v_source_id;
    if v_source_id is not null then v_source := 'course'; end if;
  end if;

  if v_source is null then
    raise exception 'no_available_credits' using errcode = 'P0003';
  end if;

  insert into public.booking_requests (
    customer_id, subjects, available_days, available_time_start,
    available_time_end, available_windows, timezone, session_type, status,
    payment_type, course_enrollment_id, credit_source_id, notes, amount_cents
  ) values (
    v_customer.id, p_subjects, p_available_days, p_available_time_start,
    p_available_time_end, p_available_windows, p_timezone, p_session_type,
    'paid', v_source,
    case when v_source = 'course' then v_source_id else null end,
    v_source_id, p_notes, 0
  )
  returning * into v_booking;

  insert into public.sessions (order_id, customer_id, session_type, subjects, status)
  values (
    v_booking.id, v_customer.id, p_session_type,
    (select array_agg(s::text) from unnest(p_subjects) as s),
    'pending_scheduling'
  );

  return v_booking;
end;
$$;

-- Unchanged from the previous signature: the function takes p_profile_id as a
-- parameter, so anyone able to call it could redeem another customer's credit.
-- service_role only, never anon or authenticated.
revoke all on function public.redeem_credit_and_create_booking(
  uuid, uuid[], text[], time, time, text, text, text, jsonb
) from public, anon, authenticated;
grant execute on function public.redeem_credit_and_create_booking(
  uuid, uuid[], text[], time, time, text, text, text, jsonb
) to service_role;
