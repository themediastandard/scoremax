const BUSINESS_TIME_ZONE = 'America/New_York'

/**
 * Format a stored instant in ScoreMax's business timezone. Server-rendered
 * pages run in UTC on Netlify, so relying on the server's local timezone turns
 * a 3:00 PM Eastern session into 7:00 PM during daylight saving time.
 *
 * @param {string | number | Date | null | undefined} value
 * @returns {string | null}
 */
function formatBusinessDateTime(value) {
  if (value === null || value === undefined || value === '') return null

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null

  const formatted = new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZone: BUSINESS_TIME_ZONE,
  }).format(date)
  const zoneLabel = new Intl.DateTimeFormat('en-US', {
    timeZone: BUSINESS_TIME_ZONE,
    timeZoneName: 'short',
  })
    .formatToParts(date)
    .find((part) => part.type === 'timeZoneName')?.value ?? 'ET'

  return `${formatted} (${zoneLabel})`
}

module.exports = { BUSINESS_TIME_ZONE, formatBusinessDateTime }
