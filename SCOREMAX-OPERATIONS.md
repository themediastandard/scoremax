# ScoreMax Tutoring — Operations & Business Reference

This document captures all client-provided information about how ScoreMax operates, including pricing, team, services, workflows, and technical decisions for the booking system build.

## Recent Implementation Log — Agent Read-First

This section records durable implementation decisions and operating boundaries from recent commits. Read it before material work. The repository remains the source of truth; when an older MVP description elsewhere in this document conflicts with a dated entry below, follow the current code and this log.

### Previous recorded release baseline

- Previous recorded head: `cc1f6b8` (`Refine tutor sessions and profiles`), pushed to `main` on 2026-08-17.
- Pushing `main` to GitHub automatically starts the Netlify production deployment. A successful push does not by itself prove that the deployment reached `ready`; verify the exact deployed commit separately when live status matters.
- Current validation at `cc1f6b8`: full test suite 307/307, `npx tsc --noEmit`, relevant ESLint, `git diff --check`, and an isolated production build passed.
- If the canonical checkout's development server is using port 3000, do not stop it or build against its shared `.next`. Run production builds from an isolated `/tmp` rsync copy with the canonical `node_modules` symlinked, then move the temporary copy to Trash.
- Production Supabase project reference: `fceekjlispfjduetumrf`. Verify it from repository configuration before database work. Never infer permission to mutate live data, Auth, Storage, Stripe, Google Calendar, or production settings from read access alone.

### 2026-08-17 — Confirmed signup notification

- After a new customer finishes confirmed signup classification and student creation, the app emails every address in `admin_settings.notification_emails` with the owner, account type, contact details, student summary, and a direct customer-dashboard link.
- Notification state is armed only for a newly classified account and stored in trusted Auth app metadata. Existing customers are never backfilled as new signups. Failed sends remain pending for a later `/book` retry; successful sends use a stable Resend idempotency key and record a sent timestamp.
- The admin email is best effort because the customer and student records are already durable. An email-provider failure is reported but does not tell the customer that their completed signup failed.
- A read-only check against the verified Score Max project on 2026-08-17 confirmed that `admin_settings.notification_emails` is configured with three recipients; addresses were not copied into source or logs.
- Local validation passed: focused auth/email tests 59/59, full suite 310/310, TypeScript, relevant ESLint, `git diff --check`, and an isolated production build.

### 2026-08-17 — Tutor portal and self-service profile (`cc1f6b8`)

- Tutors no longer have an Overview page. Tutor `/dashboard`, the portal logo, and account-menu dashboard links lead to `/dashboard/sessions`.
- Tutor sessions use the shared date-sectioned timeline: Upcoming first from soonest to latest, then Completed from newest to oldest. Cards lead with time, remain read-only, and retain search plus status/student filters.
- Tutor Settings loads the authoritative `tutors` row and supports editing public bio and subjects/specialties, plus uploading, replacing, or removing a profile photo.
- Tutor profile writes are authenticated and scoped by the signed-in user's `profile_id`; the client never supplies tutor ownership. Bio and specialties are bounded, normalized, and whitelisted.
- Tutor photos are limited to 5MB JPEG/PNG/WebP/AVIF, decoded and re-encoded with Sharp, capped at 25 megapixels and 1600px output, stored under a user-owned unique path, and cleaned up only after ownership is proven. Public `/tutors` cache invalidation runs after successful profile changes.
- Automated behavior is covered, but an authenticated real Storage upload/replacement/removal and manual desktop/mobile visual pass were not recorded as verified at this commit.

### 2026-08-17 — Parent onboarding and admin control room (`a7a8d92`, with `ae7e129` and preceding signup fixes)

- Parent signup requires at least one complete student; student phone is required during signup, Add First Student recovery, and parent-portal student create/edit.
- Booking reloads the signup student authoritatively. Selecting a student no longer auto-advances; the parent sees the selection and presses Continue. Signed-out booking places the auth prompt above a disabled first step.
- Confirmation uses the scanner-safe `/auth/continue` flow and canonical public host. Expired signup links resend signup confirmation rather than starting password recovery.
- Admin `/dashboard` redirects to `/dashboard/sessions`; Overview is hidden for admins, Sessions is first in navigation, and the sidebar shows separate amber awaiting-scheduling and blue scheduled counts.
- Admin Sessions removed top summary tiles and the type filter. Needs Scheduling appears first, oldest request first; Upcoming is grouped under full date headings from soonest forward; Completed is available by filter, newest first.
- Orders became a compact owner/student/plan/payment/scheduled/amount/date directory. Customers became a compact operational directory with owner contact, students, plan, payment access, credits available, order/spend summary, and a combined attention filter. Rows/cards remain fully clickable and keyboard accessible.

### 2026-08-16 to 2026-08-17 — Account-first signup and booking continuity (`286d2de` through `5c021cc`)

- Booking requires an authenticated account before customer details or student data can enter the purchase flow.
- Email and Google signup preserve only the safe `/book` continuation. Parent Google-signup student drafts remain same-tab and untrusted until server finalization.
- Student accounts create and use their self student profile. Zero-student parents recover inside booking with Add First Student.
- Internal Netlify auth/booking hosts redirect to the configured public ScoreMax origin so confirmation cookies and continuation remain on the canonical domain.

### 2026-08-15 — Booking recovery, Eastern Time, and Calendar behavior (`6602b65`, `aded600`)

- Booking progress persists across interrupted approval/payment flows and clears only after confirmed success.
- Customer, admin, tutor, order, email, and calendar session times use the ScoreMax business timezone (`America/New_York`) and reject invalid/epoch-like values.
- Online sessions use the single ScoreMax-owned Google Calendar event with the existing Meet link and owner/student/tutor attendees. In-person sessions have no Meet request.
- `guestsCanModify: true` is the accepted fast Calendar workaround for future events. This grants broad edit access to every guest; it is not tutor-only or title-only permission.

### 2026-08-13 to 2026-08-14 — Offline payments, student ownership, and admin scheduling (`c9c2a74` through `2016086`, plus follow-ups)

- Payment method is separate from product type. Supported operational methods include credit card, account credit, Step Up, and Zelle; offline access requires explicit method-specific account approval.
- Offline purchases remain server-priced and use the established atomic order/payment/session/credit path. Do not model Step Up as a Stripe discount or create orphan manual calendar/session rows.
- Parent accounts own managed students; account type is explicit. Student assignment on an order is limited to active students belonging to that account and keeps linked order/session identity synchronized.
- Admin credit booking is account-first, requires an active student and sufficient credits, prevents tutor/session overlap, and uses atomic credit redemption. Calendar/email delivery is idempotent and recoverable after partial external delivery failure.
- Stale Stripe customer IDs are repaired safely for checkout, billing portal, and membership lookup without overwriting a newer customer reference.

### 2026-08-12 — Booking plans and pricing (`e105208` through `3af438e`)

- SAT and ACT selections use their dedicated exam-prep packages and do not offer monthly memberships. Academic/unknown subjects may use generic prepaid packages.
- Online prices displayed to customers and charged by Stripe come from validated server/database-backed pricing and are rounded to whole-dollar amounts as implemented.
- Package/order labels use authoritative included hours rather than guessing from price. Customer-facing session dates and times render in Eastern Time.

### 2026-08-10 to 2026-08-11 — Conversion, authentication, and rescheduling (`8425f0f`, `cf5b25c`, `42d4318`)

- Tutoring landing pages share booking/contact/pricing calls to action through the reusable CTA components.
- Turnstile protects email/password signup, sign-in, and password recovery; the public site key belongs in the browser while the secret remains in Supabase Auth settings.
- Auth confirmation uses a scanner-safe explicit action before consuming a one-time token. Password recovery and signup confirmation remain distinct flows.
- Admin rescheduling updates Google Calendar before persistence, compensates Calendar if the database write fails, preserves the existing Meet link where possible, and emails only after the database save succeeds.

---

## Team / Tutors

| Name     | Specialties                        |
|----------|------------------------------------|
| Srijan   | Math, Physics                      |
| Logan    | Chemistry, SAT                     |
| Deva     | Chemistry, Algebra                 |
| Adrian   | Chemistry, Algebra                 |
| Hemaanya | Basic High School Math, English    |
| Avi      | SAT, ACT, LSAT (Founder/Lead)     |

---

## Subjects Offered

### Test Prep
- SAT
- ACT
- LSAT
- PSAT
- GMAT
- GRE
- AP Calculus
- AP Physics
- AP Statistics
- AP Chemistry

### High School
- Algebra I
- Algebra II
- Geometry
- Pre-Calculus
- Calculus
- Statistics
- Chemistry
- Physics
- Competition Mathematics
- English

### College
- Beginning Algebra
- Intermediate Algebra
- College Algebra
- Pre-Calculus
- Statistics
- Calculus I, II, III
- Linear Algebra
- Physics
- Chemistry

### Elementary
- Reading
- Math
- Science

---

## Pricing Structure (4 Pillars)

### Pillar A: 1:1 Tutoring (Non-Member / Pay-As-You-Go)

| Service Level                                      | Per Hour |
|----------------------------------------------------|----------|
| SAT/ACT Session (includes materials)               | $250     |
| AP Mathematics & Science                           | $200     |
| Middle & High School Math/Science (Non-AP)          | $175     |
| Elementary                                         | $150     |
| General non-member rate (simplified for booking)    | $125–$150|

### Pillar B: Monthly Memberships (Recommended)

| Tier    | Price/Month | Included Hours | Perks                                                        |
|---------|-------------|----------------|--------------------------------------------------------------|
| Starter | $299        | 2 hours        | $10 off additional hours                                     |
| Core    | $549        | 4 hours        | Priority scheduling, access to Avi's video library           |
| Premier | $899        | 8 hours        | Priority + weekend access, monthly expert chat, SAT diagnostics |

All memberships are month-to-month. Members get one rollover session per month. Members are prioritized during exam weeks.

### Pillar C: Prepaid Packages

| Package   | Price  | Per Hour |
|-----------|--------|----------|
| 10 hours  | $1,200 | $120     |
| 20 hours  | $2,300 | $115     |

Best for short-term goals or families who want to prepay without a subscription.

### Pillar D: In-Person SAT Course

- 8-week program
- 2 sessions/week, 2 hours each (32 total contact hours)
- Includes diagnostics + practice tests
- Price: $1,200–$1,500
- Bonus: 2 hours of 1:1 tutoring included

### Legacy Price List (2024 Reference)

| Service                                     | Single Session | 10 Sessions | 20 Sessions | 40 Sessions |
|---------------------------------------------|----------------|-------------|-------------|-------------|
| SAT Course (10 sessions, includes materials)| $250/session   | $2,500 total| —           | —           |
| ACT Course (11 sessions, includes materials)| $250/session   | $2,750 total| —           | —           |
| SAT/ACT Full Integrated Course (12 sessions)| —              | —           | —           | $3,000      |
| AP Math & Science                           | $200/hr        | $1,850      | $3,400      | $6,000      |
| Middle/High School Math & Science (Non-AP)  | $175/hr        | $1,600      | $2,900      | $4,800      |
| Elementary                                  | $150/hr        | —           | $2,500      | $3,960      |

---

## Membership / Subscription Incentives

- Exclusive Video Library: Avi explains SAT strategies and core topics
- AI Chat Support: Homework questions, scheduling, FAQs (24-hour availability)
- Chat with an Expert: Monthly live Q&A session
- Progress Tracking & Reports
- Priority booking + rollover hours (limited)
- Member-only hourly discounts
- Discounted pricing for SAT & ACT sessions (value $250/session at standard rate)
- Live tutor within 24 hours of requesting

---

## Sales Approach (From Client)

### Default Positioning

- Always recommend membership first, then let the client downgrade
- Momentum (Premier) should be mentioned before Foundations (Starter)
- Speak slowly when stating price; silence is an ally
- Frame membership as structure + priority, not a discount
- Reframe away from hourly sessions early in the conversation

### Key Talking Points

- "Booking sessions one at a time leads to gaps — missed weeks, scrambling before tests, and slower progress. Students do best with consistency."
- "Monthly academic memberships guarantee a weekly time slot, lock in your rate, and give your child consistent support."
- "It's month-to-month, and you get one rollover session per month if something comes up."
- "Our goal is long-term progress, not just getting through the next assignment."

### Objection Handling

- "I understand — it's an investment. Individual sessions are $125–$150 each, and the membership ensures consistent progress instead of paying more for less consistency."
- For existing hourly clients: "Since you've already been working with us, I can honor your current rate for the first month if you transition to a membership this week."

### Session Recommendations by Level

- Elementary: 1x/week for steady support, 2x/week if closing gaps
- Middle / High School: 2x/week recommended for biggest improvement
- College: At least 2x/week, especially math and science (fast pacing)

---

## Client Workflow (How Customers Should Interact)

### Primary Flow (Website Booking)

1. Parent/student lands on website
2. Can call, email, or chat for more information
3. Selects subject(s) they need help with (multi-select)
4. Picks an available date/time slot
5. Chooses session type (online or in-person)
6. Enters contact information
7. Sees pricing options (single session, membership, package, SAT course)
8. Pays online via Stripe
9. Receives confirmation email + calendar invite
10. ScoreMax team assigns a tutor and notifies the customer
11. After session: prompted to leave a review, book another session, and shown membership upsell (if not a member)

### Important: Tutor Assignment

- Customers do NOT choose their tutor
- Customers select which subject(s) they need help with
- ScoreMax team assigns the appropriate tutor on their end
- Customer is notified of their assigned tutor before the session

### Secondary Flow (Social Media / Referral)

1. Parent sees IG/LinkedIn content
2. Clicks booking link
3. Intake form completed
4. Payment link sent
5. First session scheduled
6. Follow-up + upsell to membership

### In-Person SAT Course Flow

1. Inquiry via phone/chat
2. Diagnostic scheduled
3. Results reviewed
4. Enroll in SAT course
5. Add optional membership
6. Weekly progress updates

---

## Technical Decisions

| Decision              | Choice                                                    |
|-----------------------|-----------------------------------------------------------|
| Payment processor     | Stripe (test mode for development, live for production)   |
| Database              | Supabase (project: fceekjlispfjduetumrf)                  |
| Email service         | Resend                                                    |
| Booking UX            | Dedicated `/book` page (not a modal)                      |
| Component library     | shadcn/ui + Lucide icons                                  |
| In-person in MVP?     | Yes                                                       |
| Packages in MVP?      | Yes                                                       |
| Tutor selection        | Customer does NOT pick a tutor; ScoreMax assigns internally|
| Calendar integration  | ICS file in confirmation email (no Google/Outlook sync for MVP) |
| Session duration      | 1 hour (standard)                                         |

### Auth Email Hook (Resend)

Guest checkout customers receive a branded invite email via Resend instead of Supabase’s default.

**Setup**

1. Supabase Dashboard → Auth → Hooks → Send Email hook
2. Create hook, set URL to `https://www.scoremaxtutoring.com/api/auth/send-email`
3. Generate secret, add to env as `SEND_EMAIL_HOOK_SECRET`
4. Ensure `RESEND_API_KEY` and `NEXT_PUBLIC_SUPABASE_URL` are set
5. Enable the hook and turn on Email Provider in Auth settings

### Auth Bot Protection (Cloudflare Turnstile)

Turnstile protects email/password signup, sign-in, and password recovery. Supabase validates each token, so the app receives only Cloudflare's public site key; the Turnstile secret stays in Supabase Auth settings.

**Safe rollout order**

1. In Cloudflare, create a managed Turnstile widget for the canonical host `www.scoremaxtutoring.com`. Add the bare host only if it is ever served directly instead of redirecting to `www`.
2. Add the public site key to Netlify as `NEXT_PUBLIC_TURNSTILE_SITE_KEY`.
3. Deploy the app bundle containing `AuthTurnstile`. Do not enable CAPTCHA in Supabase before this deploy or email auth will fail.
4. In Supabase Dashboard → Auth → Bot and Abuse Protection, choose Cloudflare Turnstile, enter the Turnstile secret, and enable CAPTCHA protection.
5. Verify email signup, password sign-in, and password reset. Also verify a direct Auth request without a CAPTCHA token is rejected.

Keep email confirmation enabled. Never put the Turnstile secret in source control, Netlify browser-exposed variables, or any `NEXT_PUBLIC_` variable.

### Auth Link and Canonical Host Safety

- Auth emails link to `/auth/continue`, which shows an explicit confirmation button. The single-use Supabase token is verified only after the customer presses that button, preventing email scanners from consuming it on receipt.
- `scoremaxtutor.netlify.app` redirects to `https://www.scoremaxtutoring.com` while the server-to-server email-hook path remains available during the transition.
- After the hook uses the official domain and production auth has been verified, remove the Netlify hostname and callback from Supabase Auth redirect URLs.

---

## Admin Panel (In MVP)

- Protected admin area at `/admin` with Supabase Auth (role-based: admin/staff)
- **Orders tab**: view all booking requests, expand to see full details, assign tutor + date/time, change status to "active" to trigger confirmation emails + Google Calendar event
- **Tutors tab**: add/edit/remove tutors, manage subject assignments, connect Google Calendar via OAuth
- Google Calendar integration: when a booking is confirmed, an event is created directly on the assigned tutor's Google Calendar

## Future Features (Not in MVP)

- AI chat support (homework questions, scheduling, FAQs)
- Video library gating (membership perk, content delivery separate)
- Customer-facing authentication / login portal
- Outlook calendar sync
- Progress tracking & reports
- Automated review collection
- Automated tutor assignment

---

## Contact Information

- Phone: (954) 214-8880 | (954) 224-1511
- Email: info@scoremaxtutoring.com
- Website: https://scoremax.com

---

## Content Ideas (Free Social Media Content)

These are the most common questions from students/parents, to be answered by Avi for IG Reels, YouTube Shorts, and LinkedIn posts:

1. How many tutoring hours does my child actually need?
2. Is the SAT still important for college admissions?
3. What score improvement is realistic in 8 weeks?
4. 1:1 tutoring vs SAT courses — which is better?
5. When should students start SAT prep?
6. How do I know if my child's tutor is effective?
7. What's the difference between test prep and tutoring?
8. Can tutoring help with confidence and test anxiety?
