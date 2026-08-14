import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'

import bookingHelpers from '../src/lib/admin-session-booking.js'

const {
  adminBookingCalendarEventId,
  adminBookingEmailRecipients,
  businessLocalDateTimeToIso,
  isOneHourSession,
} = bookingHelpers

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const read = (relative) => fs.readFileSync(path.join(ROOT, relative), 'utf8')

test('ScoreMax local times convert to Eastern instants across DST', () => {
  assert.deepEqual(
    businessLocalDateTimeToIso('2026-08-22', '09:00'),
    { ok: true, iso: '2026-08-22T13:00:00.000Z' }
  )
  assert.deepEqual(
    businessLocalDateTimeToIso('2026-01-22', '09:00'),
    { ok: true, iso: '2026-01-22T14:00:00.000Z' }
  )
})

test('DST gaps and duplicate local times fail closed', () => {
  assert.equal(
    businessLocalDateTimeToIso('2026-03-08', '02:30').code,
    'nonexistent_business_datetime'
  )
  assert.equal(
    businessLocalDateTimeToIso('2026-11-01', '01:30').code,
    'ambiguous_business_datetime'
  )
})

test('one credit is constrained to exactly one tutoring hour', () => {
  assert.equal(isOneHourSession('2026-08-22T13:00:00Z', '2026-08-22T14:00:00Z'), true)
  assert.equal(isOneHourSession('2026-08-22T13:00:00Z', '2026-08-22T14:30:00Z'), false)
})

test('calendar id is deterministic and Google-safe for uncertain retries', () => {
  const id = adminBookingCalendarEventId('750c0c07-69ef-4e58-b360-fd0e5b17d918')
  assert.equal(id, 'ab750c0c0769ef4e58b360fd0e5b17d918')
  assert.match(id, /^[0-9a-v]{5,1024}$/)
})

test('notification recipients dedupe owner, child, tutor, and admins', () => {
  assert.deepEqual(adminBookingEmailRecipients({
    owner: { email: 'Parent@Example.com', full_name: 'Parent' },
    student: { email: 'parent@example.com', full_name: 'Child' },
    tutor: { email: 'tutor@example.com', full_name: 'Tutor' },
    admins: [
      { email: 'admin@example.com', full_name: 'Admin' },
      { email: 'TUTOR@example.com', full_name: 'Duplicate' },
    ],
  }), [
    { role: 'owner', email: 'parent@example.com', full_name: 'Parent' },
    { role: 'tutor', email: 'tutor@example.com', full_name: 'Tutor' },
    { role: 'admin', email: 'admin@example.com', full_name: 'Admin' },
  ])
})

test('admin create route fails closed and delegates atomic credit booking to the database', () => {
  const route = read('src/app/api/admin/session-bookings/route.ts')
  assert.match(route, /await requireAdmin\(\)/)
  assert.match(route, /admin_book_session_with_credit/)
  assert.match(route, /processAdminSessionDelivery/)
  assert.match(route, /No eligible credits/)
})

test('delivery recovery route is admin-only and idempotent by session', () => {
  const route = read('src/app/api/admin/sessions/[id]/delivery/route.ts')
  const delivery = read('src/lib/admin-session-delivery.ts')
  assert.match(route, /await requireAdmin\(\)/)
  assert.match(route, /processAdminSessionDelivery\(id\)/)
  assert.match(delivery, /adminBookingCalendarEventId\(sessionId\)/)
  assert.match(delivery, /sendUpdates: 'all'/)
  assert.match(delivery, /admin-booking-\$\{audit\.id\}-\$\{role\}/)
  assert.match(delivery, /\.eq\('claim_token', claimToken\)/)
  assert.match(delivery, /Database creation is\s+\* never compensated/s)
  assert.match(delivery, /status: 'attention'/)
})

test('sessions UI exposes create, balance guard, attention state, and retry action', () => {
  const page = read('src/app/dashboard/sessions/page.tsx')
  const dialog = read('src/components/dashboard/AdminCreateSessionDialog.tsx')
  const list = read('src/components/dashboard/SessionList.tsx')
  const delivery = read('src/components/dashboard/AdminBookingDeliveryStatus.tsx')

  assert.match(page, /<AdminCreateSessionDialog/)
  assert.match(dialog, /Create Session/)
  assert.match(dialog, /eligible credits available/)
  assert.match(dialog, /This booking will use 1 credit, leaving/)
  assert.match(dialog, /Book Session & Use 1 Credit/)
  assert.match(dialog, /disabled=.*eligibleCredits/s)
  assert.match(list, /AdminBookingDeliveryStatus/)
  assert.match(delivery, /Retry calendar & emails/)
})

test('admin create session uses one account dropdown and online sessions only', () => {
  const dialog = read('src/components/dashboard/AdminCreateSessionDialog.tsx')
  const route = read('src/app/api/admin/session-bookings/route.ts')
  const sql = read('test/fixtures/admin-credit-booking-schema.sql')

  assert.doesNotMatch(dialog, /Search account owner/)
  assert.doesNotMatch(dialog, /accountSearch|filteredAccounts/)
  assert.doesNotMatch(dialog, /In Person|Sawgrass|in-person/)
  assert.match(dialog, /A Google Meet link will be created automatically/)
  assert.doesNotMatch(route, /sessionType: z\./)
  assert.match(route, /p_session_type: 'online'/)
  assert.match(sql, /if p_session_type<>'online' then/)
})

test('admin create session resets after closing and lists tutors alphabetically', () => {
  const page = read('src/app/dashboard/sessions/page.tsx')
  const dialog = read('src/components/dashboard/AdminCreateSessionDialog.tsx')

  assert.match(dialog, /const closeAndReset = \(\) => \{\s*reset\(\)\s*setOpen\(false\)\s*\}/)
  assert.match(dialog, /onClick=\{closeAndReset\}>Done/)
  assert.match(dialog, /onClick=\{closeAndReset\} disabled=\{submitting\}>Cancel/)
  assert.match(
    page,
    /\.from\('tutors'\)[\s\S]*?\.eq\('is_active', true\)\s*\.order\('full_name', \{ ascending: true, nullsFirst: false \}\)/,
  )
})

test('schema contract protects audit, idempotency, credit scoping, overlap, and delivery claims', () => {
  const sql = read('test/fixtures/admin-credit-booking-schema.sql')
  assert.match(sql, /enable row level security/i)
  assert.match(sql, /revoke all.*anon.*authenticated/is)
  assert.match(sql, /idempotency_key uuid not null unique/i)
  assert.match(sql, /student_id=p_student_id/i)
  assert.match(sql, /student_id is null/i)
  assert.match(sql, /for update skip locked/i)
  assert.match(sql, /pg_advisory_xact_lock\(\s*hashtextextended\('admin-booking-tutor:'\s*\|\|\s*p_tutor_id::text,0\)\s*\)/i)
  assert.match(sql, /tstzrange\(s\.confirmed_start,s\.confirmed_end,'\[\)'\)/i)
  assert.match(sql, /admin_booking_tutor_overlap/i)
  assert.match(sql, /v_source_id,null,0/i)
  assert.match(sql, /claim_admin_session_booking_delivery/i)
})

test('legacy unnamed accounts and tutors render safe fallbacks', () => {
  const dialog = read('src/components/dashboard/AdminCreateSessionDialog.tsx')
  assert.match(dialog, /full_name: string \| null/)
  assert.match(dialog, /Unnamed account/)
  assert.match(dialog, /Unnamed tutor/)
})
