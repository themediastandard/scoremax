-- Make credit grants idempotent at the data layer.
--
-- The Stripe webhook reserved its processed_stripe_events marker BEFORE doing any
-- work, and deleted that marker in its catch block. That produced two failure
-- modes, in opposite directions:
--
--   * Double-grant. A failure *after* credit was granted deleted the marker, so
--     Stripe's retry re-ran the handler and granted the credit a second time.
--   * Permanent loss. A function timeout skipped the catch entirely, so the
--     marker survived, Stripe's retry was rejected as a duplicate, and the
--     customer paid for credit they never received.
--
-- Marker ordering alone cannot fix both — a retry has to be able to re-run the
-- handler safely. These partial unique indexes are what make that safe: the
-- second grant for a given payment intent cannot be written, whatever the
-- application does. The webhook pairs them with ON CONFLICT DO NOTHING so a
-- retry skips completed work and finishes the parts that did not land.
--
-- These are deliberately NOT partial indexes. Subscription-funded rows carry no
-- payment intent, and a partial index would be the obvious way to let those
-- NULLs coexist — but Postgres cannot infer a partial index as an ON CONFLICT
-- target unless the predicate is restated, which PostgREST/supabase-js cannot
-- express. A plain unique index gives the same result anyway: Postgres treats
-- NULLs as distinct in unique indexes, so any number of NULL rows is allowed
-- while real payment intents stay unique.

drop index if exists public.packages_stripe_payment_intent_id_key;
drop index if exists public.course_enrollments_stripe_payment_intent_id_key;
drop index if exists public.act_course_enrollments_stripe_payment_intent_id_key;
drop index if exists public.payments_stripe_payment_intent_id_key;

create unique index packages_stripe_payment_intent_id_key
  on public.packages (stripe_payment_intent_id);

create unique index course_enrollments_stripe_payment_intent_id_key
  on public.course_enrollments (stripe_payment_intent_id);

create unique index act_course_enrollments_stripe_payment_intent_id_key
  on public.act_course_enrollments (stripe_payment_intent_id);

create unique index payments_stripe_payment_intent_id_key
  on public.payments (stripe_payment_intent_id);
