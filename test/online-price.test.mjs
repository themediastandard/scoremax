import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import onlinePrice from '../src/lib/online-price.js'

const { getOnlinePriceCents } = onlinePrice

test('uses the approved rounded single-session prices', () => {
  assert.equal(getOnlinePriceCents(15000), 15500)
  assert.equal(getOnlinePriceCents(17500), 18500)
  assert.equal(getOnlinePriceCents(20000), 21000)
  assert.equal(getOnlinePriceCents(25000), 26000)
})

test('database-configured online prices are authoritative', () => {
  assert.equal(getOnlinePriceCents(29900, 30900), 30900)
  assert.equal(getOnlinePriceCents(120000, 124000), 124000)
  assert.equal(getOnlinePriceCents(250000, 257500), 257500)
})

test('a future price safely grosses up and rounds to a whole dollar', () => {
  assert.equal(getOnlinePriceCents(10000), 10400)
})

test('zero remains free and invalid prices fail closed', () => {
  assert.equal(getOnlinePriceCents(0), 0)
  assert.throws(() => getOnlinePriceCents(-1), /Invalid base price/)
  assert.throws(() => getOnlinePriceCents(undefined), /Invalid base price/)
})

test('Stripe checkout uses the server-resolved online amount for every one-time payment', () => {
  const source = readFileSync(new URL('../src/app/api/stripe/checkout/route.ts', import.meta.url), 'utf8')

  assert.equal(source.split('unit_amount: trustedPriceCents').length - 1, 3)
  assert.doesNotMatch(source, /unit_amount: (?:pkg\.price_cents|maxRate|matched\.price_cents)/)
  assert.match(source, /line_items\.push\(\{ price: memberPlan\.stripe_online_price_id/)
  assert.match(source, /amount_cents: trustedPriceCents/)
})

test('customer-facing pricing displays the same online price fields checkout charges', () => {
  const booking = readFileSync(new URL('../src/components/booking/PlanSelection.tsx', import.meta.url), 'utf8')
  const publicPricing = readFileSync(new URL('../src/app/pricing/page.tsx', import.meta.url), 'utf8')

  assert.match(booking, /getOnlinePriceCents/)
  assert.match(booking, /stripe_online_price_id/)
  assert.match(publicPricing, /getOnlinePriceCents/)
  assert.match(publicPricing, /Paying by Zelle\? Contact ScoreMax for the discounted price/)
})
