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

// Stripe's 2025 invoice rework removed `invoice.payment_intent` and
// `invoice.charge` outright. The payment now lives in `invoice.payments`, a list
// that is absent unless expanded — so a stale `expand: ['latest_invoice.payment_intent']`
// silently resolves nothing and the caller stores a null payment intent. That is
// exactly what left the first live membership unrefundable: the refund route
// requires a `pi_`, found none, and 400'd.
//
// Read the new shape first, keep the old one as a fallback so a fixture or an
// account still on an older API version resolves the same way.
function getInvoicePaymentIntentId(invoice) {
  const payments = invoice?.payments?.data
  if (Array.isArray(payments)) {
    // A settled payment is the one worth refunding; fall back to any entry that
    // carries an id, since a single-payment invoice may not be marked yet.
    const ordered = [
      ...payments.filter((entry) => entry?.status === 'paid'),
      ...payments.filter((entry) => entry?.status !== 'paid'),
    ]
    for (const entry of ordered) {
      const id = getStripeId(entry?.payment?.payment_intent)
      if (isPaymentIntentId(id)) return id
    }
  }

  const legacy = getStripeId(invoice?.payment_intent)
  return isPaymentIntentId(legacy) ? legacy : null
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
