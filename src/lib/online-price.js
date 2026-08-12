const STRIPE_RATE = 0.029
const STRIPE_FIXED_FEE_CENTS = 30

// Single-session rates live on subjects rather than pricing rows, so their
// approved rounded online amounts stay here. Membership/package/course online
// prices come from pricing.online_price_cents and take precedence.
const ROUNDED_ONLINE_PRICES = new Map([
  [15000, 15500],
  [17500, 18500],
  [20000, 21000],
  [25000, 26000],
])

/**
 * Resolve the standard online price without overwriting the base/Zelle price.
 * A configured database value is authoritative. The fallback covers subject
 * rates and future rows, rounding up to a whole dollar so Stripe never nets
 * less than the underlying base price.
 *
 * @param {number | null | undefined} basePriceCents
 * @param {number | null | undefined} configuredOnlinePriceCents
 */
function getOnlinePriceCents(basePriceCents, configuredOnlinePriceCents) {
  const base = Number(basePriceCents)
  if (!Number.isFinite(base) || base < 0) {
    throw new TypeError(`Invalid base price: ${String(basePriceCents)}`)
  }

  const configured = Number(configuredOnlinePriceCents)
  if (Number.isFinite(configured) && configured >= base) {
    return Math.round(configured)
  }

  if (base === 0) return 0

  const approvedRounded = ROUNDED_ONLINE_PRICES.get(base)
  if (approvedRounded != null) return approvedRounded

  const grossedUp = Math.ceil((base + STRIPE_FIXED_FEE_CENTS) / (1 - STRIPE_RATE))
  return Math.ceil(grossedUp / 100) * 100
}

module.exports = {
  STRIPE_FIXED_FEE_CENTS,
  STRIPE_RATE,
  getOnlinePriceCents,
}
