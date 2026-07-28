-- Atomic credit redemption + booking creation.
--
-- REPLACES the read-modify-write in src/app/api/booking/submit/route.ts, which
-- had four defects:
--   1. Double-spend. Two concurrent requests read the same used_hours and wrote
--      the same incremented value, so the customer got a free session.
--   2. Credit was deducted at step 3, before the booking insert at step 4. If
--      the insert failed the route returned 500 with the credit already gone
--      and no rollback.
--   3. NULL arithmetic. memberships.used_hours and rollover_hours are nullable,
--      so `included + rollover - used` yielded NaN in JS and wrote NaN back.
--   4. packages.expires_at IS NULL was treated as *expired* (`new Date(null)`
--      is the 1970 epoch), making every package sold dead credit.
--
-- Concurrency safety comes from the trailing guard on each UPDATE. Under READ
-- COMMITTED, Postgres re-evaluates the WHERE clause against the latest
-- committed row version after taking the row lock, so a second concurrent
-- request sees the decremented value and matches zero rows. The whole function
-- body is one transaction, so credit and booking commit together or not at all.
--
-- SECURITY: this function takes p_profile_id as a parameter, so anyone able to
-- call it could redeem *another* customer's credit. EXECUTE is therefore granted
-- to service_role only — never to anon or authenticated. The application calls
-- it through supabaseAdmin.

create or replace function public.redeem_credit_and_create_booking(
  p_profile_id           uuid,
  p_subjects             uuid[],
  p_available_days       text[],
  p_available_time_start time,
  p_available_time_end   time,
  p_timezone             text,
  p_session_type         text,
  p_notes                text
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
  select * into v_customer
    from public.customers
   where profile_id = p_profile_id;

  if not found then
    raise exception 'customer_not_found' using errcode = 'P0002';
  end if;

  -- 1. Membership hours.
  update public.memberships
     set used_hours = coalesce(used_hours, 0) + 1
   where id = (
     select id from public.memberships
      where customer_id = v_customer.id
        and status = 'active'
        and coalesce(included_hours, 0) + coalesce(rollover_hours, 0)
            - coalesce(used_hours, 0) > 0
      order by current_period_end desc nulls last
      limit 1
   )
     and coalesce(included_hours, 0) + coalesce(rollover_hours, 0)
         - coalesce(used_hours, 0) > 0
  returning id into v_source_id;

  if v_source_id is not null then
    v_source := 'membership';
  end if;

  -- 2. Prepaid package hours. NULL expires_at means "never expires".
  --    Soonest-expiring package is consumed first so nothing is wasted.
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

    if v_source_id is not null then
      v_source := 'package';
    end if;
  end if;

  -- 3. Course enrollment sessions. Previously unreachable: the route
  --    hardcoded courseEnrollmentId = null, so course buyers could never
  --    spend what they had paid for.
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

    if v_source_id is not null then
      v_source := 'course';
    end if;
  end if;

  if v_source is null then
    raise exception 'no_available_credits' using errcode = 'P0003';
  end if;

  insert into public.booking_requests (
    customer_id, subjects, available_days, available_time_start,
    available_time_end, timezone, session_type, status, payment_type,
    course_enrollment_id, notes, amount_cents
  ) values (
    v_customer.id, p_subjects, p_available_days, p_available_time_start,
    p_available_time_end, p_timezone, p_session_type, 'paid', v_source,
    case when v_source = 'course' then v_source_id else null end,
    p_notes, 0
  )
  returning * into v_booking;

  insert into public.sessions (
    order_id, customer_id, session_type, subjects, status
  ) values (
    v_booking.id, v_customer.id, p_session_type,
    (select array_agg(s::text) from unnest(p_subjects) as s),
    'pending_scheduling'
  );

  return v_booking;
end;
$$;

revoke all on function public.redeem_credit_and_create_booking(
  uuid, uuid[], text[], time, time, text, text, text
) from public, anon, authenticated;

grant execute on function public.redeem_credit_and_create_booking(
  uuid, uuid[], text[], time, time, text, text, text
) to service_role;
