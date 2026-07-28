/**
 * Working out what an order actually cost, and saying so.
 *
 * Six call sites had all written the same expression:
 *
 *     order.amount_cents || order.payments?.[0]?.amount_cents || 0
 *
 * A credit-funded booking has amount_cents = 0. Zero is falsy, so `||` skipped
 * the perfectly valid zero and fell through to the payments row — which does
 * not exist for a credit booking, because no money changed hands. The result
 * was `undefined`, and the admin saw "—" where it should have said the booking
 * was paid with credit.
 *
 * The precedence is also deliberately the other way round from the original.
 * booking_requests.amount_cents is the LIST price recorded at checkout;
 * payments.amount_cents is what Stripe actually captured. Where they disagree —
 * a promotion code, a partial capture — the real charge is the truthful figure.
 */

/**
 * What was actually charged, in cents.
 * Returns 0 for credit-funded bookings, and null only when genuinely unknown.
 */
function getChargedCents(order) {
  const paid = order?.payments?.[0]?.amount_cents
  if (typeof paid === 'number') return paid
  if (typeof order?.amount_cents === 'number') return order.amount_cents
  return null
}

/** Paid with hours rather than money: no charge and no Stripe payment intent. */
function isCreditFundedOrder(order) {
  return getChargedCents(order) === 0 && !order?.stripe_payment_intent_id
}

/** Human-readable amount for the admin dashboard. */
function formatOrderAmount(order) {
  if (isCreditFundedOrder(order)) return '1 credit used'
  const cents = getChargedCents(order)
  if (cents == null) return '—'
  return `$${(cents / 100).toLocaleString()}`
}

module.exports = {
  getChargedCents,
  isCreditFundedOrder,
  formatOrderAmount,
}
