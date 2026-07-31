-- Rate limiting for the two public, unauthenticated forms.
--
-- /api/contact and /api/step-up accept JSON from anyone and turn it into mail
-- sent from ScoreMax's verified Resend domain. With no limit, one script can
-- exhaust the monthly Resend quota, get the sending domain classified as a
-- spam source, and bury real enquiries — and the client has confirmed this
-- form is their main inbound channel, so losing it is losing the business.
--
-- The counter has to be shared, not per-process: the app runs on Netlify
-- Functions, where each request may hit a different cold instance, so an
-- in-memory Map would reset constantly and enforce nothing.

create table if not exists public.form_submission_log (
  id          bigserial primary key,
  scope       text        not null,
  identifier  text        not null,
  created_at  timestamptz not null default now()
);

comment on table public.form_submission_log is
  'Append-only log of public form submissions, used only for rate limiting. '
  'Rows older than a day are pruned on write. Not a record of enquiries — the '
  'enquiry itself goes out by email.';

create index if not exists form_submission_log_lookup_idx
  on public.form_submission_log (scope, identifier, created_at desc);

alter table public.form_submission_log enable row level security;
-- No policies: nothing may read or write this except the service role, which
-- bypasses RLS. anon/authenticated hold no write grants anyway as of the
-- 2026-07-28 revoke, but enabling RLS keeps the table consistent with the rest
-- of public and stops it being readable through PostgREST.

/**
 * Record an attempt and report whether it is within the limit.
 *
 * Returns true when the caller may proceed, false when it has exceeded p_max
 * attempts within p_window.
 *
 * The insert happens before the count, so the row being judged is included.
 * That makes the check atomic enough for this purpose without taking a lock:
 * two simultaneous requests can both be admitted at the boundary, which for
 * spam control is an acceptable off-by-one. It also means blocked attempts keep
 * extending their own window, so sustained hammering stays blocked.
 */
create or replace function public.check_form_rate_limit(
  p_scope      text,
  p_identifier text,
  p_max        integer,
  p_window     interval
) returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count integer;
begin
  if p_identifier is null or btrim(p_identifier) = '' then
    -- Nothing to key on (no client IP, say). Fail open rather than locking
    -- every anonymous visitor out of the contact form.
    return true;
  end if;

  delete from public.form_submission_log
   where created_at < now() - interval '1 day';

  insert into public.form_submission_log (scope, identifier)
  values (p_scope, btrim(p_identifier));

  select count(*) into v_count
    from public.form_submission_log
   where scope = p_scope
     and identifier = btrim(p_identifier)
     and created_at > now() - p_window;

  return v_count <= p_max;
end;
$$;

-- SECURITY DEFINER with identifiers passed as parameters, so it must not be
-- reachable by signed-in users: it is called only from route handlers using the
-- service role. Same rule as redeem_credit_and_create_booking().
revoke all on function public.check_form_rate_limit(text, text, integer, interval) from public;
revoke all on function public.check_form_rate_limit(text, text, integer, interval) from anon, authenticated;
grant execute on function public.check_form_rate_limit(text, text, integer, interval) to service_role;
