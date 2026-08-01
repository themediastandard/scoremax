/**
 * Escaping for values passed to PostgREST pattern filters.
 *
 * `.ilike('email', value)` sends the value straight into SQL ILIKE, where `%`
 * and `_` are wildcards. Email addresses routinely contain underscores, so
 * `.ilike('email', 'first_last@example.com')` also matches
 * `firstXlast@example.com`.
 *
 * That is not merely a wrong match. The lookups in the Stripe webhook use
 * `.single()`, which errors when more than one row comes back — and the caller
 * reads only `data`, so a multi-match looks identical to "no such customer".
 * The guest-checkout branch then tries to insert a customer that already
 * exists, hits the unique index on lower(email), and the purchase is orphaned.
 *
 * Plain JavaScript with a .d.ts alongside so test/*.test.mjs can require() it
 * without a build step. See CLAUDE.md.
 */

/**
 * Escape LIKE/ILIKE wildcards so a value matches literally.
 *
 * Backslash goes first, or it would double-escape the escapes added after it.
 *
 * @param {string} value
 * @returns {string}
 */
function escapeLikePattern(value) {
  return String(value)
    .replace(/\\/g, '\\\\')
    .replace(/%/g, '\\%')
    .replace(/_/g, '\\_')
}

module.exports = { escapeLikePattern }
