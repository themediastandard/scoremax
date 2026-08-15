const BUSINESS_TIME_ZONE = 'America/New_York'

function toValidDate(value) {
  if (value === null || value === undefined || value === '') return null

  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

/**
 * Format the date portion of a stored instant in ScoreMax's business timezone.
 * Caller options can change the visible date fields, but never the timezone.
 *
 * @param {string | number | Date | null | undefined} value
 * @param {Intl.DateTimeFormatOptions} [options]
 * @returns {string | null}
 */
function formatBusinessDate(value, options = {}) {
  const date = toValidDate(value)
  if (!date) return null

  return new Intl.DateTimeFormat('en-US', {
    ...options,
    timeZone: BUSINESS_TIME_ZONE,
  }).format(date)
}

/**
 * Format the time portion of a stored instant in ScoreMax's business timezone.
 *
 * @param {string | number | Date | null | undefined} value
 * @returns {string | null}
 */
function formatBusinessTime(value) {
  const date = toValidDate(value)
  if (!date) return null

  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    timeZone: BUSINESS_TIME_ZONE,
  }).format(date)
}

/**
 * Split a stored instant into the values used by admin date/time inputs. The
 * values always represent ScoreMax Eastern time, even when the administrator
 * opens the form from another timezone.
 *
 * @param {string | number | Date | null | undefined} value
 * @returns {{ date: string, time: string }}
 */
function businessDateTimeInputValues(value) {
  const date = toValidDate(value)
  if (!date) return { date: '', time: '' }

  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
      timeZone: BUSINESS_TIME_ZONE,
    })
      .formatToParts(date)
      .filter((part) => part.type !== 'literal')
      .map((part) => [part.type, part.value]),
  )

  return {
    date: `${parts.year}-${parts.month}-${parts.day}`,
    time: `${parts.hour}:${parts.minute}`,
  }
}

/**
 * Format a stored instant in ScoreMax's business timezone. Server-rendered
 * pages run in UTC on Netlify, so relying on the server's local timezone turns
 * a 3:00 PM Eastern session into 7:00 PM during daylight saving time.
 *
 * @param {string | number | Date | null | undefined} value
 * @returns {string | null}
 */
function formatBusinessDateTime(value) {
  const date = toValidDate(value)
  if (!date) return null

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

module.exports = {
  BUSINESS_TIME_ZONE,
  businessDateTimeInputValues,
  formatBusinessDate,
  formatBusinessDateTime,
  formatBusinessTime,
}
