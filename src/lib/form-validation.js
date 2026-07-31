/**
 * Input validation for the two public, unauthenticated forms — /api/contact and
 * /api/step-up.
 *
 * Both accept arbitrary JSON from anyone on the internet and turn it into email
 * sent from ScoreMax's verified Resend domain. Before this, the only check was
 * `if (!email)`, so "email" could be an array, an object, or a megabyte of
 * text, and any of it would be relayed.
 *
 * Plain JavaScript with a .d.ts alongside so test/*.test.mjs can require() it
 * without a build step. See CLAUDE.md.
 */

/** Generous cap for a single-line field (name, phone, scores). */
const MAX_FIELD_LENGTH = 200
/** Cap for the free-text fields on the contact form. */
const MAX_TEXT_LENGTH = 2000
/** RFC 5321 caps a whole address at 254 characters. */
const MAX_EMAIL_LENGTH = 254

/**
 * Deliberately conservative: one @, no whitespace, a dot-separated domain with
 * a 2+ character TLD. Full RFC 5322 permits addresses that no tutoring customer
 * will ever type and that no mail provider will accept, so matching it exactly
 * would only widen what we relay.
 */
const EMAIL_PATTERN = /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/

/**
 * Coerce an untrusted JSON value to a trimmed string, or null.
 *
 * Anything that is not a string — number, array, object, null — becomes null
 * rather than "[object Object]". Values over `maxLength` are rejected outright
 * rather than truncated, so a caller cannot smuggle content past a length check
 * by padding it.
 *
 * @param {unknown} value
 * @param {number} [maxLength]
 * @returns {string | null}
 */
function cleanString(value, maxLength = MAX_FIELD_LENGTH) {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  if (!trimmed || trimmed.length > maxLength) return null
  return trimmed
}

/**
 * Validate and normalise an email address.
 *
 * @param {unknown} value
 * @returns {string | null} lower-cased address, or null if unusable
 */
function cleanEmail(value) {
  const trimmed = cleanString(value, MAX_EMAIL_LENGTH)
  if (!trimmed) return null
  if (!EMAIL_PATTERN.test(trimmed)) return null
  return trimmed.toLowerCase()
}

/**
 * True when a honeypot field was filled in.
 *
 * The field is hidden from real users with CSS, so anything in it means an
 * automated submission. Costs nothing, needs no third-party service, and stops
 * the bulk of naive spam on its own.
 *
 * @param {unknown} value
 * @returns {boolean}
 */
function isHoneypotTripped(value) {
  return typeof value === 'string' && value.trim().length > 0
}

module.exports = {
  MAX_EMAIL_LENGTH,
  MAX_FIELD_LENGTH,
  MAX_TEXT_LENGTH,
  cleanEmail,
  cleanString,
  isHoneypotTripped,
}
