import assert from 'node:assert/strict'
import test from 'node:test'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)

const {
  getCheckoutPaymentIntentId,
  getInvoicePaymentIntentId,
  getSubscriptionPeriod,
  isPaymentIntentId,
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
  assert.equal(summary.totalCredits, 9)
  assert.equal(summary.totalCourseSessions, 2)
})

test('calendar plan creates exactly one canonical Meet request', () => {
  const plan = buildSessionCalendarPlan({
    id: 'session-1',
    session_type: 'online',
    confirmed_start: '2026-03-01T15:00:00.000Z',
    confirmed_end: '2026-03-01T16:00:00.000Z',
    customers: {
      full_name: 'Ada Student',
      google_refresh_token: 'student-refresh',
    },
    tutors: {
      full_name: 'Grace Tutor',
      google_refresh_token: 'tutor-refresh',
    },
  })

  assert.equal(plan.tutor?.shouldCreateMeet, true)
  assert.equal(plan.student?.shouldCreateMeet, false)
})

test('calendar plan lets the student event create Meet only when the tutor cannot', () => {
  const plan = buildSessionCalendarPlan({
    id: 'session-2',
    session_type: 'online',
    confirmed_start: '2026-03-01T15:00:00.000Z',
    confirmed_end: '2026-03-01T16:00:00.000Z',
    customers: {
      full_name: 'Ada Student',
      google_refresh_token: 'student-refresh',
    },
    tutors: {
      full_name: 'Grace Tutor',
      google_refresh_token: null,
    },
  })

  assert.equal(plan.tutor, null)
  assert.equal(plan.student?.shouldCreateMeet, true)
})
