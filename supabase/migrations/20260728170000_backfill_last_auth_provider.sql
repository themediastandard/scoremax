-- Make profiles.last_auth_provider mean what its name says.
--
-- The column existed but was wrong for every row: it was written once by
-- handle_new_user() from raw_app_meta_data->>'provider' (the SIGN-UP provider)
-- and never updated afterwards. All 14 profiles read 'email', including an
-- account whose most recent sign-in was Google. Nothing in src/ read it.
--
-- Backfill from auth.identities, which carries a last_sign_in_at per linked
-- provider, so existing rows reflect real history rather than sign-up history.
-- From here the application keeps it current on each successful sign-in
-- (POST /api/auth/record-login-provider) — necessary because identity
-- timestamps miss some flows: a recovery-link sign-in authenticates the user
-- without touching the email identity's last_sign_in_at.
--
-- The column's CHECK constraint permits only 'google' or 'email', so any other
-- provider collapses to 'email' (the password/OTP bucket).

update public.profiles p
set last_auth_provider = sub.provider
from (
  select distinct on (i.user_id)
    i.user_id,
    case when i.provider = 'google' then 'google' else 'email' end as provider
  from auth.identities i
  order by i.user_id, i.last_sign_in_at desc nulls last
) sub
where sub.user_id = p.id
  and p.last_auth_provider is distinct from sub.provider;
