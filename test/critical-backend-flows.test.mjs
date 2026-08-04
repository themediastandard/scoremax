import assert from 'node:assert/strict'
import test from 'node:test'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)

const {
  getCheckoutPaymentIntentId,
  getInvoicePaymentIntentId,
  getInvoiceSubscriptionId,
  getSubscriptionPeriod,
  isPaymentIntentId,
  isRenewalInvoice,
} = require('../src/lib/stripe-subscription.js')
const { sanitizeCustomerCreditSummary } = require('../src/lib/customer-credit-summary.js')
const { buildSessionCalendarPlan } = require('../src/lib/session-calendar.js')

test('uses subscription item periods for Stripe subscription date ranges', () => {
  const period = getSubscriptionPeriod({
    current_period_start: 111,
    current_period_end: 222,
    items: {
      data: [
        {
          current_period_start: 1770000000,
          current_period_end: 1772592000,
        },
      ],
    },
  })

  assert.equal(period.currentPeriodStart, '2026-02-02T02:40:00.000Z')
  assert.equal(period.currentPeriodEnd, '2026-03-04T02:40:00.000Z')
})

test('stores only real payment intent ids in payment-intent fields', () => {
  assert.equal(getCheckoutPaymentIntentId({ payment_intent: 'pi_checkout_123' }), 'pi_checkout_123')
  assert.equal(getCheckoutPaymentIntentId({ payment_intent: { id: 'pi_checkout_obj' } }), 'pi_checkout_obj')
  assert.equal(getCheckoutPaymentIntentId({ payment_intent: null, subscription: 'sub_123' }), null)
  assert.equal(getInvoicePaymentIntentId({ payment_intent: 'pi_invoice_123' }), 'pi_invoice_123')
  assert.equal(getInvoicePaymentIntentId({ payment_intent: { id: 'pi_invoice_obj' } }), 'pi_invoice_obj')
  assert.equal(isPaymentIntentId('pi_valid'), true)
  assert.equal(isPaymentIntentId('sub_not_a_payment_intent'), false)
})

// Regression: the first live membership stored a null payment intent and could
// not be refunded. Stripe's current invoice shape carries the payment under
// `payments`, not `payment_intent`.
test('resolves the payment intent from the current invoice payments shape', () => {
  assert.equal(
    getInvoicePaymentIntentId({
      payment_intent: null,
      payments: { data: [{ status: 'paid', payment: { payment_intent: 'pi_from_payments' } }] },
    }),
    'pi_from_payments'
  )

  // A settled payment wins over an earlier failed attempt on the same invoice.
  assert.equal(
    getInvoicePaymentIntentId({
      payments: {
        data: [
          { status: 'failed', payment: { payment_intent: 'pi_failed_attempt' } },
          { status: 'paid', payment: { payment_intent: 'pi_settled' } },
        ],
      },
    }),
    'pi_settled'
  )

  // Expanded object form, and the legacy field still wins when payments is absent.
  assert.equal(
    getInvoicePaymentIntentId({
      payments: { data: [{ status: 'paid', payment: { payment_intent: { id: 'pi_expanded' } } }] },
    }),
    'pi_expanded'
  )
  assert.equal(getInvoicePaymentIntentId({ payment_intent: 'pi_legacy', payments: { data: [] } }), 'pi_legacy')

  // Nothing usable must stay null rather than storing a non-pi_ id.
  assert.equal(getInvoicePaymentIntentId({ payments: { data: [{ payment: { payment_intent: null } }] } }), null)
  assert.equal(getInvoicePaymentIntentId({}), null)
})

test('customer credit summary does not expose internal record ids', () => {
  const summary = sanitizeCustomerCreditSummary({
    customer: { id: 'cus-db-id', full_name: 'Ada Student' },
    membership: {
      id: 'membership-id',
      tier: 'core',
      included_hours: 4,
      used_hours: 1,
      rollover_hours: 1,
    },
    packages: [{ id: 'package-id', remaining_hours: 5 }],
    courseEnrollments: [{ id: 'course-id', remaining_sessions: 2 }],
  })

  assert.deepEqual(summary.customer, { full_name: 'Ada Student' })
  assert.equal(summary.membership.id, undefined)
  assert.equal(summary.packages[0].id, undefined)
  assert.equal(summary.courseEnrollments[0].id, undefined)
  assert.equal(summary.hasCredits, true)
  // 4 membership (4 included - 1 used + 1 rollover) + 5 package + 2 course.
  // Course sessions are included because they are spendable the same way —
  // redeem_credit_and_create_booking() treats course_enrollments as a credit
  // source alongside memberships and packages.
  assert.equal(summary.totalCredits, 11)
  assert.equal(summary.totalCourseSessions, 2)
})

test('a course-only customer is not told they have zero credits', () => {
  // The booking flow renders "You have {totalCredits} credits remaining" and,
  // directly beneath, "Including {totalCourseSessions} course sessions". While
  // totalCredits excluded course sessions, someone who had bought only a course
  // read "You have 0 credits remaining. Including 10 course sessions."
  const summary = sanitizeCustomerCreditSummary({
    customer: { full_name: 'Ada Student' },
    membership: null,
    packages: [],
    courseEnrollments: [{ remaining_sessions: 10 }],
  })

  assert.equal(summary.totalCourseSessions, 10)
  assert.equal(summary.totalCredits, 10)
  assert.equal(summary.hasCredits, true)
  assert.ok(summary.totalCredits >= summary.totalCourseSessions)
})

test('online calendar plan builds one ScoreMax-owned event inviting tutor and student with a Meet', () => {
  const plan = buildSessionCalendarPlan({
    id: 'session-1',
    session_type: 'online',
    confirmed_start: '2026-03-01T15:00:00.000Z',
    confirmed_end: '2026-03-01T16:00:00.000Z',
    customers: { full_name: 'Ada Student', email: 'ada@example.com' },
    tutors: { full_name: 'Grace Tutor', email: 'grace@example.com' },
  })

  assert.equal(plan.isOnline, true)
  assert.equal(plan.shouldCreateMeet, true)
  assert.deepEqual(
    plan.requestBody.attendees.map((a) => a.email),
    ['grace@example.com', 'ada@example.com']
  )
  assert.equal(plan.requestBody.location, undefined)
  assert.equal(plan.requestBody.start.dateTime, '2026-03-01T15:00:00.000Z')
  assert.equal(plan.requestBody.end.dateTime, '2026-03-01T16:00:00.000Z')
})

// The subject in the title is what lets a tutor with several students in a day
// tell their sessions apart from the calendar grid alone.
test('calendar plan puts resolved subject names in the event title', () => {
  const base = {
    id: 'session-subj',
    session_type: 'online',
    confirmed_start: '2026-03-01T15:00:00.000Z',
    confirmed_end: '2026-03-01T16:00:00.000Z',
    customers: { full_name: 'Ada Student', email: 'ada@example.com' },
    tutors: { full_name: 'Grace Tutor', email: 'grace@example.com' },
  }

  const one = buildSessionCalendarPlan({ ...base, subjectNames: ['SAT Math'] })
  assert.equal(one.requestBody.summary, 'ScoreMax SAT Math: Ada Student with Grace Tutor')
  assert.match(one.requestBody.description, /Subject: SAT Math/)

  const two = buildSessionCalendarPlan({ ...base, subjectNames: ['SAT Math', 'ACT Science'] })
  assert.equal(
    two.requestBody.summary,
    'ScoreMax SAT Math, ACT Science: Ada Student with Grace Tutor'
  )
  assert.match(two.requestBody.description, /Subjects: SAT Math, ACT Science/)

  // Falls back rather than emitting "ScoreMax : Ada with Grace". Covers a
  // session with no subjects and a caller that never resolved them.
  for (const missing of [undefined, null, [], ['', '   ']]) {
    const plan = buildSessionCalendarPlan({ ...base, subjectNames: missing })
    assert.equal(plan.requestBody.summary, 'ScoreMax Session: Ada Student with Grace Tutor')
    assert.doesNotMatch(plan.requestBody.description, /Subject/)
  }

  // sessions.subjects holds ids, so a caller that forgets to resolve them must
  // not leak a UUID into the title. Nothing resolves it, so nothing is shown.
  const unresolved = buildSessionCalendarPlan({ ...base, subjects: ['137d560d-96e4-47a1-abaf-494140324d96'] })
  assert.equal(unresolved.requestBody.summary, 'ScoreMax Session: Ada Student with Grace Tutor')
})

test('calendar plan keeps the title short when a session has many subjects', () => {
  const base = {
    id: 'session-many',
    session_type: 'online',
    confirmed_start: '2026-03-01T15:00:00.000Z',
    confirmed_end: '2026-03-01T16:00:00.000Z',
    customers: { full_name: 'Ada Student', email: 'ada@example.com' },
    tutors: { full_name: 'Grace Tutor', email: 'grace@example.com' },
  }
  const many = ['SAT Math', 'ACT Science', 'AP Chemistry', 'AP Biology', 'AP Physics C']

  const plan = buildSessionCalendarPlan({ ...base, subjectNames: many })

  // Summarised, not enumerated — otherwise the tutor's name falls off the grid.
  assert.equal(plan.requestBody.summary, 'ScoreMax SAT Math +4: Ada Student with Grace Tutor')
  // The description is unconstrained, so it keeps every one of them.
  assert.match(plan.requestBody.description, /Subjects: SAT Math, ACT Science, AP Chemistry, AP Biology, AP Physics C/)

  // A single subject longer than the cap is truncated rather than dropped.
  const long = buildSessionCalendarPlan({
    ...base,
    subjectNames: ['Advanced Placement Comparative Government and Politics'],
  })
  assert.match(long.requestBody.summary, /^ScoreMax Advanced Placement .*…: Ada Student with Grace Tutor$/)
  assert.ok(long.requestBody.summary.includes('with Grace Tutor'))
})

test('in-person calendar plan sets the location and skips the Meet request', () => {
  const plan = buildSessionCalendarPlan({
    id: 'session-2',
    session_type: 'in-person',
    confirmed_start: '2026-03-01T15:00:00.000Z',
    confirmed_end: '2026-03-01T16:00:00.000Z',
    customers: { full_name: 'Ada Student', email: 'ada@example.com' },
    tutors: { full_name: 'Grace Tutor', email: 'grace@example.com' },
  })

  assert.equal(plan.isOnline, false)
  assert.equal(plan.shouldCreateMeet, false)
  assert.match(plan.requestBody.location, /Sunrise, FL/)
  assert.equal(plan.requestBody.attendees.length, 2)
})

test('reads the subscription id from both old and new Stripe invoice shapes', () => {
  // Older API versions: invoice.subscription
  assert.equal(getInvoiceSubscriptionId({ subscription: 'sub_123' }), 'sub_123')
  assert.equal(getInvoiceSubscriptionId({ subscription: { id: 'sub_456' } }), 'sub_456')

  // Newer API versions moved it under parent.subscription_details
  assert.equal(
    getInvoiceSubscriptionId({
      parent: { subscription_details: { subscription: 'sub_789' } },
    }),
    'sub_789'
  )

  // Absent on one-off invoices
  assert.equal(getInvoiceSubscriptionId({}), null)
  assert.equal(getInvoiceSubscriptionId(null), null)
})

test('only subscription_cycle invoices replenish membership hours', () => {
  // A renewal replenishes.
  assert.equal(isRenewalInvoice({ billing_reason: 'subscription_cycle' }), true)

  // The first invoice must NOT: checkout.session.completed already set the
  // opening balance, so treating it as a renewal would hand out a free hour.
  assert.equal(isRenewalInvoice({ billing_reason: 'subscription_create' }), false)
  assert.equal(isRenewalInvoice({ billing_reason: 'subscription_update' }), false)
  assert.equal(isRenewalInvoice({ billing_reason: 'manual' }), false)
  assert.equal(isRenewalInvoice({}), false)
  assert.equal(isRenewalInvoice(null), false)
})

const {
  toLocalDateValue,
  toLocalTimeValue,
  fromLocalDateTimeValues,
} = require('../src/lib/local-datetime.js')

test('session date/time inputs round-trip without shifting the day', () => {
  // The regression: the form read the date in UTC but the time in local, then
  // recombined them as local. Every evening session in a negative-offset zone
  // moved forward a day on each save.
  //
  // Deliberately timezone-independent: whatever zone the test host is in, a
  // timestamp split into date+time and recombined must equal what we started
  // with. That invariant is exactly what the old code violated.
  const samples = [
    '2026-08-01T23:30:00.000Z',
    '2026-08-02T00:15:00.000Z',
    '2026-01-15T04:45:00.000Z',
    '2026-07-04T16:00:00.000Z',
    '2026-12-31T23:59:00.000Z',
  ]

  for (const iso of samples) {
    const original = new Date(iso)
    const rebuilt = fromLocalDateTimeValues(
      toLocalDateValue(iso),
      toLocalTimeValue(iso)
    )
    assert.ok(rebuilt, `expected a Date back for ${iso}`)
    // Equal to the minute (seconds are not part of the form inputs).
    assert.equal(
      Math.floor(rebuilt.getTime() / 60000),
      Math.floor(original.getTime() / 60000),
      `round-trip shifted ${iso} to ${rebuilt.toISOString()}`
    )
  }
})

test('invalid or empty date/time values do not become the 1970 epoch', () => {
  assert.equal(toLocalDateValue('not-a-date'), '')
  assert.equal(toLocalTimeValue('not-a-date'), '')
  assert.equal(fromLocalDateTimeValues('', '16:00'), null)
  assert.equal(fromLocalDateTimeValues('2026-08-01', ''), null)
})

test('calendar plan refuses a session with no usable start or end', () => {
  const base = {
    id: 's1',
    session_type: 'online',
    customers: { full_name: 'Sam Student', email: 's@example.com' },
    tutors: { full_name: 'Tara Tutor', email: 't@example.com' },
  }

  // A null confirmed_start used to become new Date(null) -> the 1970 epoch,
  // which moved the live Google event and its invitations to 1 January 1970.
  assert.throws(
    () => buildSessionCalendarPlan({ ...base, confirmed_start: null, confirmed_end: null }),
    /session_missing_confirmed_start/
  )
  assert.throws(
    () => buildSessionCalendarPlan({
      ...base,
      confirmed_start: '2026-08-01T20:00:00.000Z',
      confirmed_end: null,
    }),
    /session_missing_confirmed_end/
  )
  assert.throws(
    () => buildSessionCalendarPlan({
      ...base,
      confirmed_start: '2026-08-01T20:00:00.000Z',
      confirmed_end: '2026-08-01T19:00:00.000Z',
    }),
    /session_end_not_after_start/
  )
})

const {
  getChargedCents,
  isCreditFundedOrder,
  formatOrderAmount,
} = require('../src/lib/order-amount.js')

test('a credit-funded order reports credit, not an em dash', () => {
  // The regression: `amount_cents || payments?.[0]?.amount_cents` skipped the
  // valid zero because zero is falsy, fell through to a payments row that does
  // not exist for credit bookings, and rendered "—".
  const creditBooking = {
    amount_cents: 0,
    payments: [],
    stripe_payment_intent_id: null,
  }
  assert.equal(getChargedCents(creditBooking), 0)
  assert.equal(isCreditFundedOrder(creditBooking), true)
  assert.equal(formatOrderAmount(creditBooking), '1 credit used')

  // Same when the relation comes back null rather than an empty array.
  assert.equal(
    formatOrderAmount({ amount_cents: 0, payments: null, stripe_payment_intent_id: null }),
    '1 credit used'
  )
})

test('a paid order reports what Stripe actually captured, not the list price', () => {
  // booking_requests.amount_cents is the list price at checkout; the payments
  // row is the real capture. A promotion code makes them disagree.
  const discounted = {
    amount_cents: 200000,
    payments: [{ amount_cents: 150000 }],
    stripe_payment_intent_id: 'pi_123',
  }
  assert.equal(getChargedCents(discounted), 150000)
  assert.equal(isCreditFundedOrder(discounted), false)
  assert.equal(formatOrderAmount(discounted), '$1,500')

  // No payments row yet (webhook still in flight): fall back to the booking.
  assert.equal(formatOrderAmount({ amount_cents: 89500, payments: [], stripe_payment_intent_id: 'pi_9' }), '$895')
})

test('a genuinely unknown amount stays an em dash', () => {
  assert.equal(getChargedCents({}), null)
  assert.equal(formatOrderAmount({}), '—')
  assert.equal(formatOrderAmount(null), '—')
  // A zero charge WITH a payment intent is a real £0 capture, not credit.
  assert.equal(isCreditFundedOrder({ amount_cents: 0, stripe_payment_intent_id: 'pi_free' }), false)
})
