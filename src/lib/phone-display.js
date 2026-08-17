/**
 * Formats North American phone numbers for display without changing stored data.
 * Unrecognized formats are returned as entered so international numbers and
 * extensions are never silently rewritten.
 */
function formatPhoneForDisplay(value) {
  if (typeof value !== 'string') return ''

  const trimmed = value.trim()
  if (!trimmed) return ''

  const digits = trimmed.replace(/\D/g, '')
  const localDigits = digits.length === 11 && digits.startsWith('1')
    ? digits.slice(1)
    : digits

  if (localDigits.length !== 10) return trimmed

  return `(${localDigits.slice(0, 3)}) ${localDigits.slice(3, 6)}-${localDigits.slice(6)}`
}

module.exports = { formatPhoneForDisplay }
