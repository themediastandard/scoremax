-- Replenish a membership's hours when Stripe bills a new period.
--
-- Before this, nothing in the codebase ever reset used_hours. It was set to 0 at
-- membership creation, set to 1 by the checkout webhook, and incremented on every
-- booking — never decreased. A recurring member therefore received their
-- included_hours exactly once, ever, and was then permanently out of credit while
-- Stripe kept billing them monthly. rollover_hours was likewise never computed.
--
-- Done as a function because the rollover figure is derived from the row's own
-- current values. Postgres evaluates every SET expression against the pre-update
-- row, so this single statement computes the carry-over and resets the counter
-- atomically, with no read-modify-write race.
--
-- POLICY NOTE — please confirm this is the intended business rule:
-- unused hours carry into the next period, capped at one period's included_hours.
-- Uncapped rollover would let a dormant member accrue unlimited liability; zero
-- rollover would mean hours are use-it-or-lose-it. The cap is the middle option.
-- Change `least(..., included_hours)` to adjust.

create or replace function public.renew_membership_period(
  p_stripe_subscription_id text,
  p_period_start           timestamptz,
  p_period_end             timestamptz
)
returns public.memberships
language plpgsql
security definer
set search_path = public
as $$
declare
  v_membership public.memberships;
begin
  update public.memberships
     set rollover_hours = least(
           greatest(
             coalesce(included_hours, 0)
               + coalesce(rollover_hours, 0)
               - coalesce(used_hours, 0),
             0
           ),
           coalesce(included_hours, 0)
         ),
         used_hours           = 0,
         status               = 'active',
         current_period_start = coalesce(p_period_start, current_period_start),
         current_period_end   = coalesce(p_period_end, current_period_end)
   where stripe_subscription_id = p_stripe_subscription_id
  returning * into v_membership;

  if not found then
    raise exception 'membership_not_found_for_subscription %', p_stripe_subscription_id
      using errcode = 'P0002';
  end if;

  return v_membership;
end;
$$;

revoke all on function public.renew_membership_period(text, timestamptz, timestamptz)
  from public, anon, authenticated;

grant execute on function public.renew_membership_period(text, timestamptz, timestamptz)
  to service_role;
