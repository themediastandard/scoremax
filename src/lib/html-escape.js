/**
 * HTML entity escaping for values interpolated into email templates.
 *
 * The transactional emails in src/lib/email-templates.ts are built by string
 * concatenation, and much of what goes into them is attacker-controlled: names
 * and free-text from the public contact and Step Up forms, and customer names
 * that originate from checkout. Those emails are opened by admins, in a mail
 * client, and are trusted by the person reading them — so an unescaped <a> or
 * <img> in a "Help Needed" field is a phishing link delivered from ScoreMax's
 * own verified sending domain.
 *
 * Plain JavaScript with a .d.ts alongside so test/*.test.mjs can require() it
 * without a build step. See CLAUDE.md.
 */

/**
 * Escape the five characters that matter in HTML text and attribute contexts.
 *
 * Both quote styles are included so the result is safe inside a quoted
 * attribute as well as in element text — email templates use both.
 *
 * @param {unknown} value coerced to string; null and undefined become ''
 * @returns {string}
 */
function escapeHtml(value) {
  if (value === null || value === undefined) return ''
  return String(value)
    .replace(/&/g, '&amp;') // must run first, or it double-escapes the others
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

module.exports = { escapeHtml }
