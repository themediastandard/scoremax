/**
 * Stripe reports a Customer that was deleted or belongs to the other API mode
 * as a resource_missing error. Keep this structural so it also works with
 * errors crossing a server/runtime boundary where instanceof is unreliable.
 *
 * @param {unknown} error
 */
function isMissingStripeCustomerError(error) {
  if (!error || typeof error !== 'object') return false

  const candidate = /** @type {{
   *   code?: unknown,
   *   param?: unknown,
   *   message?: unknown,
   *   raw?: { code?: unknown, param?: unknown, message?: unknown }
   * }} */ (error)
  const code = candidate.code ?? candidate.raw?.code
  const param = candidate.param ?? candidate.raw?.param
  const message = candidate.message ?? candidate.raw?.message

  if (typeof message === 'string' && /no such customer/i.test(message)) return true

  return code === 'resource_missing' && (param === 'customer' || param === 'customer_id')
}

module.exports = { isMissingStripeCustomerError }
