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

// Stripe moved the subscription reference on invoices: older API versions expose
// `invoice.subscription`, newer ones nest it under
// `invoice.parent.subscription_details.subscription`. Accept either so the
// renewal handler keeps working across an API version bump.
function getInvoiceSubscriptionId(invoice) {
  return (
    getStripeId(invoice?.subscription) ??
    getStripeId(invoice?.parent?.subscription_details?.subscription)
  )
}

// Only a genuine renewal should replenish hours. The first invoice of a new
// subscription is already accounted for by checkout.session.completed, which
// sets the opening balance — treating it as a renewal would hand out a free hour.
function isRenewalInvoice(invoice) {
  return invoice?.billing_reason === 'subscription_cycle'
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
  getInvoiceSubscriptionId,
  getStripeId,
  getSubscriptionPeriod,
  isPaymentIntentId,
  isRenewalInvoice,
}
