/**
 * Prepaid packages are valid for one year from purchase.
 *
 * Until 2026-07-31 packages never expired: nothing set `expires_at`, so every
 * package ever sold carried NULL, which the schema reads as "never expires".
 * The client chose a one-year window, which changes the purchase path (an
 * expiry is now stamped on) and the read path (expired hours must stop being
 * counted as available).
 *
 * NULL still means "never expires" and always will — packages sold before this
 * change were bought under open-ended terms and it would be wrong to expire
 * them retroactively. Every query below therefore has to admit NULL explicitly;
 * a bare `.gt('expires_at', ...)` silently drops those rows instead.
 *
 * Plain JavaScript with a .d.ts alongside, so test/*.test.mjs can require() it
 * without a build step. See CLAUDE.md.
 */

const PACKAGE_VALIDITY_MONTHS = 12

/**
 * The moment a package bought at `purchasedAt` stops being redeemable.
 *
 * @param {Date | string | number} [purchasedAt] defaults to now
 * @returns {string} ISO 8601 timestamp
 */
function packageExpiresAt(purchasedAt = new Date()) {
  const start = purchasedAt instanceof Date ? new Date(purchasedAt.getTime()) : new Date(purchasedAt)
  if (Number.isNaN(start.getTime())) {
    throw new TypeError(`packageExpiresAt received an invalid date: ${String(purchasedAt)}`)
  }
  // setUTCMonth normalises overflow, so a 12-month step lands on the same
  // calendar day a year on. 29 February is the one exception and rolls to
  // 1 March, which is the conventional reading of "one year later".
  const expiry = new Date(start.getTime())
  expiry.setUTCMonth(expiry.getUTCMonth() + PACKAGE_VALIDITY_MONTHS)
  return expiry.toISOString()
}

/**
 * PostgREST `.or()` clause matching packages that are still redeemable.
 *
 * Mirrors the `expires_at is null or expires_at > now()` guard inside
 * redeem_credit_and_create_booking(), so what the dashboard displays and what
 * the database will actually spend cannot drift apart.
 *
 * @param {Date} [now]
 * @returns {string}
 */
function unexpiredPackagesClause(now = new Date()) {
  return `expires_at.is.null,expires_at.gt.${now.toISOString()}`
}

module.exports = {
  PACKAGE_VALIDITY_MONTHS,
  packageExpiresAt,
  unexpiredPackagesClause,
}
