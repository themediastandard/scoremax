-- Two fixes: refunds that actually revoke credit, and signup that survives a
-- pre-existing customer row.

------------------------------------------------------------------------------
-- 1. Record which credit row funded a booking.
------------------------------------------------------------------------------
-- booking_requests.payment_type records *what kind* of credit paid for a
-- booking, but never *which row* was debited. Without that, a refund cannot put
-- the hour back — a customer with two packages gives no way to know which one
-- to credit. course_enrollment_id existed for courses only.

alter table public.booking_requests
  add column if not exists credit_source_id uuid;

comment on column public.booking_requests.credit_source_id is
  'The memberships/packages/course_enrollments row debited for this booking. '
  'NULL for purchased (non-credit) bookings and for credit bookings created '
  'before 2026-07-28.';

------------------------------------------------------------------------------
-- 2. Redemption now records the debited row.
------------------------------------------------------------------------------
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
    available_time_end, timezone, session_type, status, payment_type,
    course_enrollment_id, credit_source_id, notes, amount_cents
  ) values (
    v_customer.id, p_subjects, p_available_days, p_available_time_start,
    p_available_time_end, p_timezone, p_session_type, 'paid', v_source,
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

revoke all on function public.redeem_credit_and_create_booking(
  uuid, uuid[], text[], time, time, text, text, text
) from public, anon, authenticated;
grant execute on function public.redeem_credit_and_create_booking(
  uuid, uuid[], text[], time, time, text, text, text
) to service_role;

------------------------------------------------------------------------------
-- 3. Refund a booking, settling the credit either way.
------------------------------------------------------------------------------
-- Previously a refund moved money and cancelled the sessions but never touched
-- credit, so a customer could buy a package, book against it, refund the
-- purchase, and keep the hours. Credit-funded bookings could not be refunded at
-- all: the route required a Stripe payment intent, which they never have.
--
-- The Stripe API call stays in the route (Postgres cannot reach Stripe). This
-- function performs the database half, and is idempotent: it only acts on a
-- booking still in 'paid', so a repeated call cannot double-credit.

create or replace function public.refund_booking(p_booking_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_booking public.booking_requests;
  v_credit_action text := 'none';
  v_rows int;
begin
  select * into v_booking from public.booking_requests where id = p_booking_id for update;
  if not found then
    raise exception 'booking_not_found' using errcode = 'P0002';
  end if;

  if v_booking.status = 'refunded' then
    return jsonb_build_object('already_refunded', true, 'credit_action', 'none');
  end if;

  if v_booking.status <> 'paid' then
    raise exception 'booking_not_refundable_in_status_%', v_booking.status
      using errcode = 'P0003';
  end if;

  if coalesce(v_booking.amount_cents, 0) = 0
     and v_booking.stripe_payment_intent_id is null then
    -- Credit-funded booking: give the hour back to the row it came from.
    if v_booking.credit_source_id is null then
      v_credit_action := 'unknown_source_not_restored';
    elsif v_booking.payment_type = 'membership' then
      update public.memberships
         set used_hours = greatest(coalesce(used_hours,0) - 1, 0)
       where id = v_booking.credit_source_id;
      get diagnostics v_rows = row_count;
      v_credit_action := case when v_rows > 0 then 'membership_hour_restored'
                              else 'source_row_missing' end;
    elsif v_booking.payment_type = 'package' then
      update public.packages
         set remaining_hours = remaining_hours + 1
       where id = v_booking.credit_source_id;
      get diagnostics v_rows = row_count;
      v_credit_action := case when v_rows > 0 then 'package_hour_restored'
                              else 'source_row_missing' end;
    elsif v_booking.payment_type = 'course' then
      update public.course_enrollments
         set remaining_sessions = remaining_sessions + 1
       where id = v_booking.credit_source_id;
      get diagnostics v_rows = row_count;
      v_credit_action := case when v_rows > 0 then 'course_session_restored'
                              else 'source_row_missing' end;
    end if;
  else
    -- Purchased booking: revoke whatever credit this payment bought. Hours
    -- already consumed cannot be un-consumed; the remaining balance is zeroed.
    update public.packages
       set remaining_hours = 0
     where stripe_payment_intent_id = v_booking.stripe_payment_intent_id
       and stripe_payment_intent_id is not null;
    get diagnostics v_rows = row_count;
    if v_rows > 0 then v_credit_action := 'package_credit_revoked'; end if;

    update public.course_enrollments
       set remaining_sessions = 0, status = 'refunded'
     where stripe_payment_intent_id = v_booking.stripe_payment_intent_id
       and stripe_payment_intent_id is not null;
    get diagnostics v_rows = row_count;
    if v_rows > 0 then v_credit_action := 'course_credit_revoked'; end if;
  end if;

  update public.sessions set status = 'cancelled' where order_id = p_booking_id;
  update public.booking_requests set status = 'refunded' where id = p_booking_id;

  return jsonb_build_object('already_refunded', false, 'credit_action', v_credit_action);
end;
$$;

revoke all on function public.refund_booking(uuid) from public, anon, authenticated;
grant execute on function public.refund_booking(uuid) to service_role;

------------------------------------------------------------------------------
-- 4. Signup must survive a pre-existing customer row.
------------------------------------------------------------------------------
-- handle_new_user() inserted into customers unconditionally. When a row already
-- existed for that email — a guest checkout, or a customer an admin created by
-- hand — the insert violated customers_email_key, the trigger raised, and the
-- auth.users insert was rolled back. Signup failed outright with no way to
-- recover. Verified 2026-07-28 by inserting into auth.users with a matching
-- customers row present.
--
-- Now the trigger claims an existing *unclaimed* row (profile_id IS NULL)
-- instead, which also attaches a guest's purchase history to their new account.
-- A row already claimed by another profile is left untouched, so signing up
-- cannot steal an established customer record.
--
-- Deliberately check-then-write rather than ON CONFLICT: customers carries two
-- unique indexes (customers_email_key on email, customers_email_lower_unique on
-- lower(email)) and a single conflict target cannot cover both.
--
-- OPERATIONAL NOTE: this links accounts by email address, so "Confirm email"
-- must stay enabled in Supabase Auth. Without it, someone could sign up with a
-- guest's address and claim their unclaimed customer row.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path to 'public', 'auth'
as $$
declare
  safe_role text := case
    when new.raw_app_meta_data->>'role' in ('admin','tutor','customer')
      then new.raw_app_meta_data->>'role'
    else 'customer'
  end;
  v_existing_customer_id uuid;
begin
  insert into public.profiles (id, email, full_name, role, last_auth_provider)
  values (
    new.id,
    lower(new.email),
    new.raw_user_meta_data->>'full_name',
    safe_role,
    new.raw_app_meta_data->>'provider'
  )
  on conflict (id) do nothing;

  if safe_role = 'customer' then
    select id into v_existing_customer_id
      from public.customers
     where lower(email) = lower(new.email)
     limit 1;

    if v_existing_customer_id is null then
      insert into public.customers (profile_id, full_name, email)
      values (
        new.id,
        coalesce(new.raw_user_meta_data->>'full_name', 'New User'),
        lower(new.email)
      );
    else
      update public.customers
         set profile_id = new.id,
             full_name  = coalesce(
               nullif(full_name, ''),
               new.raw_user_meta_data->>'full_name',
               'New User'
             )
       where id = v_existing_customer_id
         and profile_id is null;
    end if;
  end if;

  return new;
end;
$$;
