import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const { operationalRecipients, calendarAttendees, sessionStudentName } = require('../src/lib/session-recipients.js')
const { buildSessionCalendarPlan } = require('../src/lib/session-calendar.js')
const {
  courseTypeFromPricingName,
  courseTypeMatchesSelection,
  normalizeCourseType,
} = require('../src/lib/course-plan-rules.js')

test('parent and child receive operational mail, with parent-first same-address dedupe', () => {
  const owner = { full_name: 'Parent', email: ' Family@Example.com ' }
  const child = { full_name: 'Child', email: 'child@example.com' }
  assert.deepEqual(operationalRecipients(owner, child).map((r) => [r.role, r.email]), [
    ['owner', 'family@example.com'],
    ['student', 'child@example.com'],
  ])

  const shared = operationalRecipients(owner, { ...child, email: 'family@example.com' })
  assert.deepEqual(shared.map((r) => r.role), ['owner'])
})

test('calendar identifies the managed student and invites tutor, parent, and child once', () => {
  const session = {
    id: 'session-family',
    session_type: 'online',
    confirmed_start: '2026-08-20T19:00:00.000Z',
    confirmed_end: '2026-08-20T20:00:00.000Z',
    customers: { full_name: 'Adib Parent', email: 'parent@example.com' },
    students: { full_name: 'Maya Student', email: 'student@example.com' },
    tutors: { full_name: 'Grace Tutor', email: 'tutor@example.com' },
  }
  const plan = buildSessionCalendarPlan(session)
  assert.match(plan.requestBody.summary, /Maya Student with Grace Tutor/)
  assert.deepEqual(plan.requestBody.attendees.map((a) => a.email), [
    'tutor@example.com', 'parent@example.com', 'student@example.com',
  ])
  assert.equal(sessionStudentName({ students: null }), 'Student not assigned')
  assert.deepEqual(calendarAttendees(session.tutors, session.customers, {
    ...session.students,
    email: 'PARENT@example.com',
  }).map((a) => a.email), ['tutor@example.com', 'parent@example.com'])
})

test('student APIs are authenticated, strict, owner-scoped, and expose no delete handler', () => {
  const collection = readFileSync(new URL('../src/app/api/account/students/route.ts', import.meta.url), 'utf8')
  const item = readFileSync(new URL('../src/app/api/account/students/[id]/route.ts', import.meta.url), 'utf8')
  assert.match(collection, /z\.strictObject/)
  assert.match(item, /z\.strictObject/)
  assert.match(collection, /supabase\.auth\.getUser\(\)/)
  assert.match(item, /\.eq\('customer_id', owner\.id\)/)
  assert.doesNotMatch(collection + item, /export async function DELETE/)
  assert.doesNotMatch(collection + item, /auth\.admin|inviteUserByEmail|createUser/)
})

test('every booking boundary carries authoritative student identity', () => {
  const credit = readFileSync(new URL('../src/app/api/booking/submit/route.ts', import.meta.url), 'utf8')
  const offline = readFileSync(new URL('../src/app/api/offline-purchase/route.ts', import.meta.url), 'utf8')
  const checkout = readFileSync(new URL('../src/app/api/stripe/checkout/route.ts', import.meta.url), 'utf8')
  const webhook = readFileSync(new URL('../src/app/api/stripe/webhook/route.ts', import.meta.url), 'utf8')
  assert.match(credit, /p_student_id: student_id/)
  assert.match(offline, /p_student_id: body\.student_id/)
  assert.match(checkout, /student_id: studentId/)
  assert.match(webhook, /authoritativeBooking/)
  assert.match(webhook, /bookingStudentId = authoritativeBooking\?\.student_id/)
  assert.doesNotMatch(webhook, /bookingStudentId = metadata\.student_id/)
})

test('Stripe checkout rejects empty, oversized, and non-catalog subject selections', () => {
  const checkout = readFileSync(new URL('../src/app/api/stripe/checkout/route.ts', import.meta.url), 'utf8')

  assert.match(checkout, /rawSubjects\.length < 1/)
  assert.match(checkout, /rawSubjects\.length > 20/)
  assert.match(checkout, /typeof subject === 'string'/)
  assert.ok(
    checkout.match(/resolvedSubjects\.every\(\(id\) => Boolean\([^\n]+\[id\]\)\)/g)?.length >= 3
  )
})

test('reminder and scheduling paths distinguish owner, student, and tutor delivery', () => {
  const schedule = readFileSync(new URL('../src/app/api/admin/sessions/[id]/route.ts', import.meta.url), 'utf8')
  const reminders = readFileSync(new URL('../src/app/api/cron/session-reminders/route.ts', import.meta.url), 'utf8')
  assert.match(schedule, /operationalRecipients\(session\.customers, session\.students\)/)
  assert.match(schedule, /sendCancellationEmails/)
  assert.match(schedule, /session-cancelled:\$\{recipient\.role\}/)
  assert.match(reminders, /ownerOutcome/)
  assert.match(reminders, /studentOutcome/)
  assert.match(reminders, /confirmedStart/)
})

test('course type and included sessions come from validated subjects and trusted pricing', () => {
  assert.equal(normalizeCourseType('ACT'), 'act')
  assert.equal(normalizeCourseType('other'), null)
  assert.equal(courseTypeMatchesSelection('sat', { isSAT: true, isACT: false }), true)
  assert.equal(courseTypeMatchesSelection('act', { isSAT: true, isACT: true }), false)
  assert.equal(courseTypeMatchesSelection('sat-act-combined', { isSAT: true, isACT: true }), true)
  assert.equal(courseTypeFromPricingName('Comprehensive ACT Program'), 'act')
  assert.equal(courseTypeFromPricingName('Combined SAT & ACT Program'), 'sat-act-combined')

  const checkout = readFileSync(new URL('../src/app/api/stripe/checkout/route.ts', import.meta.url), 'utf8')
  const webhook = readFileSync(new URL('../src/app/api/stripe/webhook/route.ts', import.meta.url), 'utf8')
  assert.match(checkout, /courseTypeMatchesSelection\(courseType, getSatActSelection\(resolvedSubjects, courseSubjectMap\)\)/)
  assert.match(checkout, /activeDbSubjectIds\.has\(id\)/)
  assert.match(webhook, /authoritativeBooking\.pricing_id/)
  assert.match(webhook, /Number\(coursePricing\?\.included_hours\)/)
  assert.doesNotMatch(webhook, /isACT \? 12/)
})

test('Stripe fulfillment selects payer only from the authoritative booking', () => {
  const webhook = readFileSync(new URL('../src/app/api/stripe/webhook/route.ts', import.meta.url), 'utf8')
  assert.match(webhook, /\.eq\('id', authoritativeBooking\.customer_id\)/)
  assert.match(webhook, /linkedStripeCustomer\.id !== customer\.id/)
  assert.match(webhook, /stripeCustomerId &&\s*customer\.stripe_customer_id &&\s*customer\.stripe_customer_id !== stripeCustomerId/)
  assert.doesNotMatch(webhook, /\.ilike\('email'/)
  assert.doesNotMatch(webhook, /auth\.admin\.(createUser|listUsers|generateLink)/)
  assert.match(webhook, /const legacyStudentGrade = bookingStudentId \? null : studentGrade/)
})

test('confirmation child PII requires the booking owner or an admin for both lookup paths', () => {
  const confirmation = readFileSync(new URL('../src/app/api/booking/confirmation/route.ts', import.meta.url), 'utf8')
  const authIndex = confirmation.indexOf('supabase.auth.getUser()')
  const stripeIndex = confirmation.indexOf('stripe.checkout.sessions.retrieve')
  assert.ok(authIndex >= 0 && stripeIndex > authIndex)
  assert.match(confirmation, /const isAdmin = profile\?\.role === 'admin'/)
  assert.match(confirmation, /booking\.customer_id !== customer\.id/)
})

test('reminder sending uses an atomic lease and stable provider idempotency keys', () => {
  const reminders = readFileSync(new URL('../src/app/api/cron/session-reminders/route.ts', import.meta.url), 'utf8')
  assert.match(reminders, /rpc\('claim_session_reminder'/)
  assert.match(reminders, /rpc\('finish_session_reminder_claim'/)
  assert.match(reminders, /session-reminder-\$\{recipient\.role\}-\$\{candidate\.id\}-\$\{confirmedStart\}/)
  assert.doesNotMatch(reminders, /\.update\(\{ reminder_sent_for: confirmedStart \}\)/)
})

test('managed-child purchase paths do not forward grade into customer data', () => {
  const checkout = readFileSync(new URL('../src/app/api/stripe/checkout/route.ts', import.meta.url), 'utf8')
  const offline = readFileSync(new URL('../src/app/api/offline-purchase/route.ts', import.meta.url), 'utf8')
  assert.doesNotMatch(checkout, /student_grade:/)
  assert.doesNotMatch(offline, /p_student_grade:/)
})
