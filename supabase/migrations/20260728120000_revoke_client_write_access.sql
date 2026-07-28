-- Revoke all write access to public tables from the browser-facing roles.
--
-- WHY
-- Row-level security policies constrain *which row* a caller may touch, never
-- *which column*. The "Users can update own profile" policy on public.profiles
-- was USING (auth.uid() = id) with no WITH CHECK, and the `authenticated` role
-- held UPDATE on every column including `role`. Any signed-in user could
-- therefore promote themselves to admin with a single PostgREST call using the
-- public anon key:
--
--   PATCH /rest/v1/profiles?id=eq.<their-own-id>   {"role":"admin"}
--
-- Verified against this project on 2026-07-27 in a rolled-back transaction.
-- The same shape allowed rewriting customers.stripe_customer_id (billing-portal
-- takeover), inserting booking_requests with status='paid' and amount_cents=0
-- (free tutoring), and letting a tutor re-activate themselves after an admin
-- deactivated them.
--
-- WHY THIS IS SAFE
-- Every write in the application goes through `supabaseAdmin`
-- (src/lib/supabase/admin.ts), which uses the service_role key. Confirmed by
-- auditing all .insert()/.update()/.upsert()/.delete() call sites in src/ on
-- 2026-07-28: there are zero writes via the user-scoped server client
-- (src/lib/supabase/server.ts) and zero via the browser client
-- (src/lib/supabase/client.ts). service_role is unaffected by these grants, so
-- revoking them costs the application nothing.
--
-- SELECT is deliberately left intact — the public pages (pricing, subjects,
-- tutors, cohorts) and the RLS read policies depend on it, and read isolation
-- was verified correct: a plain authenticated user sees only their own rows.
--
-- ROLLBACK
--   grant all on all tables in schema public to anon, authenticated;
--   alter default privileges in schema public
--     grant all on tables to anon, authenticated;

revoke insert, update, delete, truncate
  on all tables in schema public
  from anon, authenticated;

-- Stop newly created tables from silently regaining client write access.
-- NOTE for future work: after this, a new table is NOT writable from the
-- browser by default. That matches this codebase's architecture (all writes go
-- through the service role). If you ever add a genuine client-side write path,
-- grant the specific columns explicitly rather than re-granting broadly.
alter default privileges in schema public
  revoke insert, update, delete, truncate on tables
  from anon, authenticated;
