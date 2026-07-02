function toIsoFromSeconds(value) {
  return typeof value === 'number' && Number.isFinite(value)
    ? new Date(value * 1000).toISOString()
    : null
}

function getStripeId(value) {
  if (!value) return null
  if (typeof value === 'string') return value
  return typeof value.id === 'string' ? value.id : null
}

function isPaymentIntentId(value) {
  return typeof value === 'string' && value.startsWith('pi_')
}

function getCheckoutPaymentIntentId(session) {
  const id = getStripeId(session?.payment_intent)
  return isPaymentIntentId(id) ? id : null
}

function getInvoicePaymentIntentId(invoice) {
  const id = getStripeId(invoice?.payment_intent)
  return isPaymentIntentId(id) ? id : null
}

function getSubscriptionPeriod(subscription) {
  const item = subscription?.items?.data?.find(
    (candidate) =>
      typeof candidate?.current_period_start === 'number' ||
      typeof candidate?.current_period_end === 'number'
  )

  return {
    currentPeriodStart: toIsoFromSeconds(item?.current_period_start),
    currentPeriodEnd: toIsoFromSeconds(item?.current_period_end),
  }
}

module.exports = {
  getCheckoutPaymentIntentId,
  getInvoicePaymentIntentId,
  getStripeId,
  getSubscriptionPeriod,
  isPaymentIntentId,
}
