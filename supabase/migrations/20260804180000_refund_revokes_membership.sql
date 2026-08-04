-- Refunding a membership purchase left the customer holding the credit.
--
-- refund_booking's purchase branch revoked packages and course_enrollments by
-- stripe_payment_intent_id but never touched memberships — and memberships had
-- no payment intent column to match on. Confirmed live on 2026-08-04: a fully
-- refunded $299 Starter membership stayed status='active' with a usable hour
-- and a subscription still renewing.
--
-- Mirrors the existing pattern rather than inventing a new one: memberships get
-- the same stripe_payment_intent_id column packages and course_enrollments
-- already carry, and refund_booking revokes on it the same way.

alter table public.memberships
  add column if not exists stripe_payment_intent_id text;

comment on column public.memberships.stripe_payment_intent_id is
  'Payment intent of the checkout that opened this membership. Set by the '
  'stripe webhook; refund_booking matches on it to revoke credit. Null for '
  'memberships created before 2026-08-04.';

-- Partial: only rows that carry one are ever looked up by it.
create index if not exists memberships_stripe_payment_intent_id_idx
  on public.memberships (stripe_payment_intent_id)
  where stripe_payment_intent_id is not null;

create or replace function public.refund_booking(p_booking_id uuid)
 returns jsonb
 language plpgsql
 security definer
 set search_path to 'public'
as $function$
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

    -- New. Both the status flip and the zeroing are load-bearing:
    -- redeem_credit_and_create_booking gates on status='active', but
    -- customer-credit-summary.js computes included - used + rollover with no
    -- status check, so status alone would leave the dashboard advertising
    -- hours that can no longer be spent. used_hours is zeroed too, or the
    -- summary would render a negative balance.
    update public.memberships
       set status = 'refunded',
           included_hours = 0,
           rollover_hours = 0,
           used_hours = 0
     where stripe_payment_intent_id = v_booking.stripe_payment_intent_id
       and stripe_payment_intent_id is not null;
    get diagnostics v_rows = row_count;
    if v_rows > 0 then v_credit_action := 'membership_credit_revoked'; end if;
  end if;

  update public.sessions set status = 'cancelled' where order_id = p_booking_id;
  update public.booking_requests set status = 'refunded' where id = p_booking_id;

  return jsonb_build_object('already_refunded', false, 'credit_action', v_credit_action);
end;
$function$;

-- SECURITY DEFINER and takes identifiers as parameters, so EXECUTE stays with
-- service_role only. Never grant to authenticated.
revoke all on function public.refund_booking(uuid) from public, anon, authenticated;
grant execute on function public.refund_booking(uuid) to service_role;
