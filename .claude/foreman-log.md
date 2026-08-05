# Foreman log — ScoreMax

Numbered tasks delegated to their own sessions. Coordinator reviews each on
landing. See `AUDIT-2026-08-04.md` for the findings these came from.

| # | Task | Strength | Status | Outcome |
|---|------|----------|--------|---------|
| 001 | Add per-day time windows to booking form (+ surface availability to admin when scheduling) | high | done | `7f21b76`, migration applied, pushed |
| 002 | Send branded reminder email 1 hour before sessions | high | merged and deployed | `674b1f6`, migration applied, `CRON_SECRET` set by Tommy |

### 002 review (2026-08-04)

92/92 tests (66 baseline + 26 new), lint clean, `tsc --noEmit` clean. Scope
respected — it did not touch `admin/sessions/[id]/route.ts`, which is exactly
what the `reminder_sent_for` design was for, nor any file 004 owns.

Migration `20260804200000_session_reminder_marker.sql` applied to production as
`session_reminder_marker` and verified: column present and nullable, partial
index `sessions_reminder_due_idx` on `confirmed_start where status='scheduled'`.

Branch was cut from `e1caf42` and rebased onto `d57f925`; clean, no conflicts.

Notable, and correct: fails closed with 503 when `CRON_SECRET` is unset; both
sides hashed before `timingSafeEqual` so lengths always match; session status
re-read immediately before sending; the stamp is guarded on `confirmed_start`
being unchanged, so a reschedule mid-send cannot mark the new time as reminded.
First use of `zod` in the codebase, which `CLAUDE.md` asked for.

On partial failure it stamps anyway and reports to Sentry, reasoning that the
marker's granularity is the session rather than the recipient, so a retry would
duplicate to whoever already received one. That matches the stated guarantee
("neither ever receives two") and the reasoning is written down at the call site.

Nit, not a blocker: `meet_url` is escaped for HTML but not validated as http(s),
so a `javascript:` value would render as a link. It is written only by the
Google Calendar integration, never by a user.

`CRON_SECRET` set by Tommy in Netlify, scoped to **Functions + Runtime, not
Builds**. Builds is deliberately excluded: `next build` never reads it (only
`NEXT_PUBLIC_*` is inlined), and scoping a secret to Builds exposes it to every
build plugin for no benefit.

The coordinator cannot run the dry run itself — that needs the secret in a
header, and secrets do not belong in this transcript. Credential-free check
instead: an unauthenticated POST returning **401** proves the route can see
`CRON_SECRET`; **503** would mean the scope is wrong. Tommy runs the real dry
run with his own value.
| 003 | Add Google Analytics 4 to the site (`G-JJ8TFYH2FN`) | medium | done | `e1caf42`, merged, deployed, verified live |
| 004 | Add structured data and technical SEO/AEO fixes | medium | done | `b2b8f32`, merged, deployed, verified live |
| 005 | Pace email sends under Resend's rate limit | high | done | `d763fa6`, merged and pushed |
| 006 | Tell the outgoing tutor when a session is reassigned | medium | done | `739de0b`, merged and pushed |

### 006 review (2026-08-04)

145/145 tests (10 new), lint and `tsc` clean, 3 files, nothing out of scope.
Unparked by Tommy after being deferred earlier the same day.

Reasoned past the brief in three places, all correct:
- **Covers the no-Google-auth fallback.** The send wraps `handleReassign`'s
  callback rather than sitting inside it, so it also fires on the path where
  `handleReassign` degrades to `handleSchedule` — the case where Google sends no
  attendee notice at all and ScoreMax is the only thing that can tell them.
- **Uses the pre-update start time** on purpose. When an admin reassigns and
  reschedules in one PATCH, the old time is what is on the outgoing tutor's
  calendar, so that is what identifies the session for them.
- **Same-id guard for a case the brief did not name:** if the incoming-tutor
  lookup returns nothing, `merged.tutors` is still the outgoing tutor, and
  without the guard that person would receive "New Session Assigned" and "you
  have lost it" together. Sends nothing in that case.

No CTA in the email — the tutor has been removed from the Meet, so a Join button
would be dead. No reason for the change either: nothing in the schema records
one, so any sentence would be invented.

005 is high rather than medium because the change lives inside `sendEmail`, the
single choke point every customer email flows through including purchase
confirmations, and a break there stops mail without erroring visibly.

### 005 review (2026-08-04) — met every criterion

135/135 tests (18 new), lint and `tsc` clean, 6 files, nothing out of scope.
Pacing lives in `src/lib/send-pacer.js` (+ `.d.ts`), wired into `sendEmail`;
signature and boolean return untouched.

Three things worth knowing later:
- **The limiter cannot stop mail.** `slot.then(run, run)` runs the send on both
  settled outcomes of the pacing slot, so a throwing clock or timer means the
  send goes out *unpaced* rather than not at all.
- **The queue advances on the slot, not the task**, so a send that throws or
  hangs cannot wedge everything behind it. Both cases are tested.
- **Clock-step guard**: the wait is clamped to one interval, because an NTP
  correction backwards would otherwise compute an unbounded wait that looks
  exactly like email having stopped.

002's own pacing was removed and `RUN_DEADLINE_MS` still bounds the run; there is
a regression test named "the reminder cron does not pace a second time on top of
sendEmail" and a comment in that route saying not to re-add one.

Not verified in production: no email has been sent through the new path yet.
`sessions` is empty, so the reminder cron sends nothing; the next real
purchase or contact-form submission is the first live exercise.

### 005 — what the brief asked for, so the review can check it

Five paired-send routes were verified before briefing, not two as the queue said:
`stripe/webhook/route.ts:375,416` (purchase), `booking/submit/route.ts:133,158`,
`admin/sessions/[id]/route.ts:199,218` (scheduling), `contact/route.ts:140,165`,
`step-up/route.ts:74,95`. All sequential awaits, all unpaced. A third send sits at
`admin/sessions/[id]/route.ts:293` on the reassignment path.

Agreed approach — **the limiter goes inside `sendEmail` in `src/lib/resend.ts`**,
not at the five call sites, so future routes inherit it. Shape copied from
`api/cron/session-reminders/route.ts` (~:240), which already does this correctly:
it waits `lastSendStartedAt + MIN_SEND_INTERVAL_MS - Date.now()`, accounting for
elapsed time rather than sleeping a flat amount.

Review must confirm:
- `sendEmail`'s signature and boolean return are unchanged, and it still reports
  both the resolved-`error` and thrown cases to Sentry.
- **No double-pacing with 002.** The reminder cron paces its own loop; if that was
  left in place alongside the shared limiter it halves throughput. Either answer is
  acceptable if reasoned — but `RUN_DEADLINE_MS` in that route must still work.
- A throw inside the pacing logic cannot prevent a send. A limiter that stops mail
  is worse than the rate limit.
- The serverless caveat is *commented*: module state resets per invocation, so this
  paces within one request (the actual paired-send case) and concurrent requests can
  still collide. Deliberate, not overlooked.
- Tests fake the clock rather than really sleeping, and cover: two immediate calls
  spaced, a slow first send shortening the wait, a much-later send waiting not at
  all, and a throwing send not wedging the queue.
- Baseline is **117 tests passing**. `tsc` may show pre-existing `site-images.ts`
  errors from a gitignored `next-env.d.ts`; establish the count, do not assume zero.

### 004 review (2026-08-04)

117/117 tests after rebasing onto 002, lint and `tsc --noEmit` clean. 26 files.
Did not touch 002's files or `src/app/sitemap.ts`.

The truth constraint held. No `aggregateRating`, `review` or `ratingValue`
anywhere, and the module documents their absence as deliberate. Prices in the
`/pricing` schema are built from the live `pricing` table — the same rows
checkout charges against — so page and schema move together. It **declined** to
publish the 1:1 hourly rates, because those are hardcoded in the page as a mirror
of the subject catalog rather than read from the table, and asserting them
machine-readably would be one forgotten edit away from quoting a price checkout
does not charge. That is the judgement the brief asked for.

Caught something the brief did not anticipate: Next passes inherited metadata to
child routes verbatim, so `/book/confirmation` would have declared its canonical
as `/book`. It is now noindex with its own canonical.

Chose `Service` over `Course` — tutoring sold by the hour has no course
instances, start dates or fixed length, and `Course` would promise rich-result
fields the business cannot honestly fill.

Verified on production after deploy: 9 pages sampled, **0 invalid JSON-LD
blocks**. Landing pages carry `@graph` of `Service` (provider
`EducationalOrganization`, `areaServed` United States) plus `BreadcrumbList`.
Every sampled page has a self-referential absolute canonical. `/llms.txt` serves
200 as `text/plain`; `/sitemap.xml` still 200 with 21 URLs; `robots.txt` still
points at it.

Breadcrumbs on `/test-prep/*` read `Home > SAT Tutoring`, skipping a
`/test-prep` level — correct, because no such index page exists and linking one
would point at a 404.

004 runs alongside 002. No file overlap: 002 owns `src/lib/email-templates.ts`,
the cron route, the Netlify function and `supabase/migrations/`; 004 owns the
public `page.tsx` files, `src/lib/structured-data.ts` and `public/llms.txt`.
Both briefs name the other's files as off limits.

Not delegated (done inline, `d57f925`): replaced the drifting hand-written
`public/sitemap.xml` with a generated `src/app/sitemap.ts`.

### 003 review (2026-08-04)

Followed the brief exactly. 3 files, 80 insertions, nothing out of scope;
`tsc --noEmit` clean, lint clean, 66/66 tests. `next.config.ts` untouched, no new
dependency, measurement ID correct. Details in `AUDIT-2026-08-04.md`.

It did record its outcome in `AUDIT-2026-08-04.md`, writing to the main working
copy by absolute path — the file is gitignored (`.gitignore:57`) so it is absent
from the worktree, and a relative path would have failed. Worth naming the
absolute path in future briefs rather than relying on the session to work it out.

(The coordinator briefly concluded the task had skipped this, after running
`tail` from the worktree where the file does not exist. Check from the main copy.)

Strength is the reasoning level the task warrants — see the `foreman` skill for
the rubric. Both of these are high: 001 changes the schema of live tables and
sits on the booking-submit path that redeems credit; 002 runs unattended and
sends real email to real customers, where a duplicate or missed send is silent.

001 and 002 were spawned before the numbering convention existed, so their chip
titles are unnumbered. They are 001 and 002.

**Both run in git worktrees on `claude/*` branches, not on `main`** — contrary to
the brief. The coordinator reviews the branch and merges it; the spawned session
does not push to main itself.

- 001 → `claude/gracious-golick-cf4ede`
- 002 → `claude/brave-cohen-a7257a` (empty; interrupted 2026-08-04 during
  exploration, before any edit)

They run in parallel by exception. 002's brief names the six files 001 owns and
forbids touching them; its design stores `reminder_sent_for` (the
`confirmed_start` a reminder was sent for) specifically so rescheduling
self-heals without editing `admin/sessions/[id]/route.ts`, which 001 owns.

### 001 review (2026-08-04)

Verified independently, not taken on report: 66/66 tests, `tsc --noEmit` clean,
lint clean. Diffed the `redeem_credit_and_create_booking` body against
`20260728160000` — credit selection order, concurrency guards and
`credit_source_id` are verbatim; only the new parameter and insert column differ.
Grants still `service_role` only. Scope respected.

Migration applied to production 2026-08-04 as `per_day_availability_windows`,
then `7f21b76` pushed — that order, because the code calls a 9-argument
`redeem_credit_and_create_booking` and the deployed schema had only the 8-arg
one. Verified live afterwards: column and constraint present, exactly one
function overload (no ambiguity), `EXECUTE` still `service_role` only, and both
pre-existing bookings carry NULL windows so they render via the legacy fallback.

Note the local file is `20260804190000_per_day_availability_windows.sql` but
Supabase recorded its own version stamp for the applied migration — the local
directory and the remote history do not line up one-to-one. `list_migrations`
remains the source of truth, per `CLAUDE.md`.

## Waiting on Tommy (not delegatable)

- Resolve Sentry issues SCOREMAX-1 and SCOREMAX-2 — both are coordinator smoke
  tests, not real problems.
- ~~Create a Sentry alert rule~~ **Already working.** A real alert reached Tommy
  by email on 2026-08-04, triggered by Sentry's default "Send a notification for
  high priority issues" rule. Earlier notes claiming no rule existed were wrong.
- Restart Claude Code to pick up the `/foreman` skill (added after this session
  started, so it is not loaded here).
- Two console cleanups, low priority: remove the old
  `fceekjlispfjduetumrf.supabase.co/auth/v1/callback` redirect URI from the OAuth
  client (keep the three `/api/google/callback` entries — those are Calendar),
  and prune the two stale `scoremaxtutor.netlify.app` entries from Supabase's
  redirect allowlist.
- Three tutors hidden for want of bios; 8 of 9 tutors have no photo.
  **Deprioritised by Tommy 2026-08-04** — recorded as a known state, not an open
  action. Do not keep raising it.

## Queue

- Analytics stack — **GA4 done** (003), **Search Console done** (domain property
  verified, sitemap submitted). Remaining: Google Tag Manager, Meta Pixel,
  Google Business Profile. GTM would take over loading GA4;
  `src/components/Analytics.tsx` is the single place to swap it.
- ~~Supabase URL visible during Google sign-up~~ **CLOSED 2026-08-04** — see
  [[scoremax-supabase-custom-domain]] and the audit. Auth serves from
  `auth.scoremaxtutoring.com`; the consent screen reads "to continue to ScoreMax".
- Resend 2/sec rate limit on paired sends — purchase and scheduling each fire two
  sends back to back. 002's reminder job already paces correctly and is the model.
- ~~Outgoing tutor email on reassignment~~ **DONE** as 006.
- **Offline payments (Zelle / Step Up) — design not decided.** Tommy is thinking
  it through; do not build without a decision. Full analysis in
  `AUDIT-2026-08-04.md`, including why per-family Stripe discount codes were set
  aside and the three unanswered questions about how Step Up actually disburses.
- **Email authentication — blocked on ScoreMax having its own email addresses.**
  `scoremaxtutoring.com` publishes no SPF, DKIM or DMARC and hosts no mail, so
  anything sent as `@scoremaxtutoring.com` is unauthenticated and likely filtered
  by Gmail and Outlook. Invisible from inside the app: Resend accepting a send is
  not delivery, and nothing reaches Sentry. Bundle it with adding the domain to
  Google Workspace so the OAuth consent screen can use a ScoreMax support
  address instead of `info@themediastandard.com`. Detail in
  `AUDIT-2026-08-04.md`. Parked by Tommy 2026-08-04.
