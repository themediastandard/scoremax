const BUSINESS_TIME_ZONE = 'America/New_York'

const BUSINESS_PARTS = new Intl.DateTimeFormat('en-US', {
  timeZone: BUSINESS_TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
})

/** @param {Date} value */
function businessParts(value) {
  const values = Object.fromEntries(
    BUSINESS_PARTS.formatToParts(value)
      .filter((part) => part.type !== 'literal')
      .map((part) => [part.type, Number(part.value)])
  )
  return {
    year: values.year,
    month: values.month,
    day: values.day,
    hour: values.hour,
    minute: values.minute,
  }
}

/**
 * Convert the date/time an admin enters as ScoreMax Eastern time into an
 * instant. Searching possible UTC offsets makes DST gaps and duplicate fall-
 * back times explicit instead of silently relying on the server's UTC zone.
 *
 * @param {string} dateValue YYYY-MM-DD
 * @param {string} timeValue HH:mm
 * @returns {{ ok: true, iso: string } | { ok: false, code: string }}
 */
function businessLocalDateTimeToIso(dateValue, timeValue) {
  const dateMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateValue)
  const timeMatch = /^(\d{2}):(\d{2})$/.exec(timeValue)
  if (!dateMatch || !timeMatch) return { ok: false, code: 'invalid_business_datetime' }

  const wanted = {
    year: Number(dateMatch[1]),
    month: Number(dateMatch[2]),
    day: Number(dateMatch[3]),
    hour: Number(timeMatch[1]),
    minute: Number(timeMatch[2]),
  }
  if (
    wanted.month < 1 || wanted.month > 12 ||
    wanted.day < 1 || wanted.day > 31 ||
    wanted.hour < 0 || wanted.hour > 23 ||
    wanted.minute < 0 || wanted.minute > 59
  ) return { ok: false, code: 'invalid_business_datetime' }

  const nominal = Date.UTC(
    wanted.year,
    wanted.month - 1,
    wanted.day,
    wanted.hour,
    wanted.minute
  )
  const nominalDate = new Date(nominal)
  if (
    nominalDate.getUTCFullYear() !== wanted.year ||
    nominalDate.getUTCMonth() + 1 !== wanted.month ||
    nominalDate.getUTCDate() !== wanted.day
  ) return { ok: false, code: 'invalid_business_datetime' }

  const matches = []
  // All real-world UTC offsets fit inside this range. Fifteen-minute steps
  // include the uncommon quarter-hour offsets without assuming New York's.
  for (let offsetMinutes = -14 * 60; offsetMinutes <= 14 * 60; offsetMinutes += 15) {
    const candidate = new Date(nominal + offsetMinutes * 60_000)
    const parts = businessParts(candidate)
    if (Object.keys(wanted).every((key) => parts[key] === wanted[key])) {
      matches.push(candidate)
    }
  }

  if (!matches.length) return { ok: false, code: 'nonexistent_business_datetime' }
  if (matches.length > 1) return { ok: false, code: 'ambiguous_business_datetime' }
  return { ok: true, iso: matches[0].toISOString() }
}

/** @param {string} startIso @param {string} endIso */
function isOneHourSession(startIso, endIso) {
  const start = new Date(startIso)
  const end = new Date(endIso)
  return !Number.isNaN(start.getTime()) &&
    !Number.isNaN(end.getTime()) &&
    end.getTime() - start.getTime() === 60 * 60_000
}

/**
 * Google event ids accept base32hex characters. UUID hex is a valid subset;
 * assigning the id ourselves makes a retry after an uncertain network result
 * find the same event rather than creating another invitation.
 * @param {string} sessionId
 */
function adminBookingCalendarEventId(sessionId) {
  const hex = String(sessionId).toLowerCase().replace(/[^0-9a-f]/g, '')
  if (hex.length !== 32) throw new Error('invalid_session_id')
  return `ab${hex}`
}

/**
 * Build the custom email plan. Owner wins when the child shares the same
 * email, matching operationalRecipients(); admins are sent as one deduped
 * group and are never duplicated against family/tutor recipients.
 * @param {{owner?: object, student?: object, tutor?: object, admins?: object[]}} context
 */
function adminBookingEmailRecipients(context = {}) {
  const seen = new Set()
  const recipients = []
  const add = (role, person) => {
    const email = typeof person?.email === 'string' ? person.email.trim().toLowerCase() : ''
    if (!email || seen.has(email)) return
    seen.add(email)
    recipients.push({ role, email, full_name: person.full_name || '' })
  }
  add('owner', context.owner)
  add('student', context.student)
  add('tutor', context.tutor)
  for (const admin of context.admins ?? []) add('admin', admin)
  return recipients
}

module.exports = {
  BUSINESS_TIME_ZONE,
  adminBookingCalendarEventId,
  adminBookingEmailRecipients,
  businessLocalDateTimeToIso,
  isOneHourSession,
}
