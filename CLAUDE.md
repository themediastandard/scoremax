# CLAUDE.md

Guidance for Claude Code (claude.ai/code) when working in this repository.

## What this is

ScoreMax is a **production tutoring business platform** — not a starter app. It sells
1:1 tutoring and SAT/ACT prep courses, takes real payments through Stripe, provisions
credit (memberships/packages/course enrollments), and schedules sessions onto Google
Calendar with Meet links. ~18k lines across ~150 TS/TSX files in `src/`.

It is **pre-launch**: the production domain `www.scoremaxtutoring.com` still serves the
old Wix site. Treat the Supabase project as live data regardless — it holds real
customer, payment, and tutor rows.

## Commands

- `npm run dev` — dev server on port 3000 (runs `scripts/guard-next-dev.mjs` first to
  kill stale dev servers this project already has listening on 3000/3001)
- `npm run dev:clean` — same, after `rm -rf .next`
- `npm run build` — guard + `rm -rf .next` + `next build`
- `npm run start` / `npm run lint`
- **Tests: `node --test "test/*.test.mjs"`** (7 tests, all passing as of 2026-07-27).
  Quote the glob — the bare directory form `node --test test/` does **not** work on
  Node 22 here and exits 1 without running anything. There is no `test` script in
  `package.json`, so tests never run in CI or on build. Run them by hand.

## Architecture

Next.js 15.4.10 App Router, React 19, TypeScript 5 (`strict`), Tailwind CSS v4,
shadcn/ui-style primitives in `src/components/ui/`. Deployed on Netlify
(`netlify.toml` raises the Node heap to 4 GB — `next build` type-checks and lints the
whole project and OOMs at the default ~2 GB).

### The three Supabase clients — pick deliberately

| Module | Key | Use for |
|---|---|---|
| `src/lib/supabase/server.ts` | anon + user cookies | Server components/actions **as the user**; RLS applies |
| `src/lib/supabase/client.ts` | anon | Browser components; RLS applies |
| `src/lib/supabase/admin.ts` | **service role** | Route handlers needing to bypass RLS |

`supabaseAdmin` bypasses **all** row-level security. Every query through it must be
manually scoped — `.eq('profile_id', user.id)` or equivalent. The existing account
routes do this consistently; preserve that pattern.

### Auth and roles

- Supabase Auth (email/password + Google OAuth). `src/app/auth/callback/route.ts`
  handles the code exchange.
- Identity of record is `profiles.role` — one of `admin` / `tutor` / `customer`.
  The `ADMIN_EMAILS` env var in `.env.local` is **dead**; nothing reads it.
- `src/lib/auth.ts` exports `getAuthUser`, `getProfile` (both React `cache`d),
  `requireAdmin()` and `requireAuth()`. These return a `NextResponse` on failure, so
  callers must check for that explicitly rather than testing truthiness.
- `src/middleware.ts` only refreshes the session and checks *logged-in-ness* for
  `/dashboard/*`. It does **not** check role. Each dashboard page does its own
  `role !== 'admin'` check, so a new page without that check is exposed by default.
- A Postgres trigger `handle_new_user()` auto-creates the `profiles` row (and a
  `customers` row for customers) on signup, taking role from `raw_app_meta_data`.

### Payments (Stripe)

- `POST /api/stripe/checkout` — **resolves every price server-side from the `pricing`
  table.** The client sends a plan identifier, never an amount. Keep it that way.
- `POST /api/stripe/webhook` — verifies the signature, then de-dupes on a unique
  constraint on `processed_stripe_events.event_id` *before* any side effect. The
  webhook is what grants credit and creates `booking_requests` / `sessions`.
- `src/lib/stripe.ts` falls back to `sk_test_placeholder` when `STRIPE_SECRET_KEY` is
  unset so builds don't fail; API calls then fail at runtime instead.

### Credit model

Three independent sources, tried in this order by `POST /api/booking/submit`:
`memberships` (recurring, `included_hours + rollover_hours - used_hours`),
`packages` (prepaid `remaining_hours`), then `course_enrollments`
(`remaining_sessions`).

**Redemption happens entirely inside Postgres.** The route calls
`redeem_credit_and_create_booking()` via `.rpc()`; that function picks the source,
decrements it with a guarded `UPDATE` (safe under concurrency because READ COMMITTED
re-evaluates the WHERE on the locked row), and inserts the `booking_requests` and
`sessions` rows — all in one transaction. Do **not** reintroduce read-modify-write
credit math in TypeScript; that was the double-spend bug.

Conventions that matter here:
- `packages.expires_at IS NULL` means **never expires**. Readers must handle NULL
  explicitly — `.gt('expires_at', ...)` silently drops those rows.
- `memberships.used_hours` / `rollover_hours` are nullable; always `coalesce`.
- Renewal is `invoice.paid` with `billing_reason = 'subscription_cycle'`, which calls
  `renew_membership_period()`. The first invoice (`subscription_create`) must be
  ignored — `checkout.session.completed` already set the opening balance.
- Both functions are `SECURITY DEFINER` and take identifiers as parameters, so
  `EXECUTE` is granted to `service_role` only. Never grant them to `authenticated`.

### Google Calendar

**One** ScoreMax business Google account owns every session event and invites the tutor
and student as attendees. An admin connects it in Dashboard → Settings → Integrations;
the refresh token is stored in `admin_settings` under the key `google_refresh_token`
(`src/lib/google-admin.ts`). Per-tutor and per-customer OAuth was removed — the
`tutors.google_*` and `customers.google_*` columns still exist in the database but
**nothing in `src/` reads or writes them**, and they are empty. They are dead columns.

OAuth state is signed via `src/lib/google-oauth-state.ts`, bound to an httpOnly nonce
cookie with a 10-minute expiry, and re-checks admin on both legs of the flow.

⚠️ As of 2026-07-27 the `google_refresh_token` row **does not exist** — `admin_settings`
holds only `notification_emails`. Scheduling an online session hard-fails with a 400
until an admin completes that one-time connection.

### Plain-JavaScript modules in `src/lib/`

`stripe-subscription.js`, `customer-credit-summary.js`, `session-calendar.js`, and
`subject-catalog.js` are intentionally `.js` so `test/*.test.mjs` can `require()` them
without a build step. Only `subject-catalog` has a `.d.ts`; the other three are
untyped when imported from TS. **Keep this pattern** — converting them to `.ts` breaks
the tests. Add a `.d.ts` alongside instead.

## Database

Supabase project **`fceekjlispfjduetumrf`** ("Score Max", us-west-2, Postgres 17).
17 public tables; RLS enabled on all of them.

**The schema is only partly in version control.** `supabase/migrations/` now holds the
changes made from 2026-07-28 onward, but there is no baseline dump — the six earlier
migrations and the original schema exist only remotely. Getting a true baseline needs
`supabase login` plus the database password (`supabase db pull`). Until then, read
current state with the Supabase MCP tools (`list_tables`, `list_migrations`) rather
than trusting the local directory to be complete.

**Client roles cannot write.** As of 2026-07-28, `anon` and `authenticated` hold only
`SELECT` (plus `REFERENCES`/`TRIGGER`) on every public table; `INSERT`/`UPDATE`/
`DELETE`/`TRUNCATE` were revoked, and default privileges were altered so new tables do
not silently regain them. This closed a verified privilege escalation — RLS policies
constrain which *row* you may touch, never which *column*, so `USING (auth.uid() = id)`
on `profiles` combined with an `UPDATE` grant on `profiles.role` let any signed-in user
promote themselves to admin.

Consequence for new work: every write must go through `supabaseAdmin`. If you ever need
a genuine client-side write, grant the specific columns explicitly and add a
`WITH CHECK` — do not re-grant broadly.

## Conventions

- Route handlers return `NextResponse.json({ error }, { status })`. Many currently
  leak raw `error.message` to clients — don't add more.
- `zod` is a dependency but is **imported nowhere**; API routes destructure
  `await req.json()` untyped. New routes should validate.
- Email templates live in `src/lib/email-templates.ts` and send via Resend. Values are
  interpolated into HTML **unescaped** — escape anything user-supplied.
- Path alias `@/*` → `./src/*`.

## Before changing anything

Read the audit reports in the repo root (`AUDIT-2026-07-28.md` is current,
`AUDIT-2026-07-27.md` precedes it) — they catalogue known findings with file paths and
line numbers. Don't re-report them as new; check whether they're still open.

These files are **gitignored on purpose** — they contain working reproduction steps for
unpatched vulnerabilities and the repo has a GitHub remote. They exist only in the local
working copy, so a fresh clone won't have them. Un-ignore them once the blockers are
fixed, if you want them in history.
