import assert from 'node:assert/strict'
import test from 'node:test'
import { createRequire } from 'node:module'
import { readFileSync } from 'node:fs'

const require = createRequire(import.meta.url)
const { isMissingStripeCustomerError } = require('../src/lib/stripe-customer-error.js')

test('recognizes Stripe missing-customer errors without hiding unrelated failures', () => {
  assert.equal(
    isMissingStripeCustomerError(new Error("No such customer: 'cus_stale'")),
    true
  )
  assert.equal(
    isMissingStripeCustomerError({ code: 'resource_missing', param: 'customer' }),
    true
  )
  assert.equal(
    isMissingStripeCustomerError({ raw: { code: 'resource_missing', param: 'customer_id' } }),
    true
  )
  assert.equal(
    isMissingStripeCustomerError({ code: 'resource_missing', param: 'price' }),
    false
  )
  assert.equal(isMissingStripeCustomerError({ code: 'rate_limit' }), false)
})

test('stale-customer repair cannot erase a newer Stripe customer id', () => {
  const source = readFileSync('src/lib/stripe-customer-server.ts', 'utf8')

  assert.match(source, /\.eq\('stripe_customer_id', missingCustomerId\)/)
  assert.match(source, /currentId && currentId !== missingCustomerId/)
  assert.match(source, /\.is\('stripe_customer_id', null\)/)
})

test('subscription page uses the shared guarded membership resolver', () => {
  const page = readFileSync('src/app/dashboard/subscription/page.tsx', 'utf8')

  assert.match(page, /getCustomerMembership\(user\.id, user\.email \?\? null\)/)
  assert.doesNotMatch(page, /stripe\.subscriptions\.list/)
  assert.doesNotMatch(page, /stripe\.customers\.list/)
})

test('billing portal repairs a missing Stripe customer and otherwise fails gracefully', () => {
  const portal = readFileSync('src/app/api/stripe/portal/route.ts', 'utf8')

  assert.match(portal, /isMissingStripeCustomerError\(error\)/)
  assert.match(portal, /recoverMissingStripeCustomer/)
  assert.match(portal, /No billing account found/)
})

test('checkout retries the existing booking without a stale Stripe customer id', () => {
  const checkout = readFileSync('src/app/api/stripe/checkout/route.ts', 'utf8')

  const bookingInsert = checkout.indexOf(".from('booking_requests')")
  const createHelper = checkout.indexOf('const createCheckoutSession')
  const recovery = checkout.indexOf('recoverMissingStripeCustomer(', createHelper)
  const retry = checkout.indexOf('session = await createCheckoutSession(customerId)', recovery)

  assert.ok(bookingInsert >= 0 && bookingInsert < createHelper)
  assert.ok(createHelper < recovery && recovery < retry)
  assert.match(checkout, /if \(!customerId \|\| !isMissingStripeCustomerError\(error\)\) throw error/)
})
