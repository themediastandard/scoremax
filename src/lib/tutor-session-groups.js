/**
 * Every tutor session belongs to exactly one history bucket. Status wins for
 * terminal and pending records; scheduled and legacy records fall back to the
 * confirmed time. This keeps an unexpected old status visible instead of
 * silently dropping it from the admin's history.
 *
 * @param {Array<{ status?: string | null, confirmed_start?: string | null }>} sessions
 * @param {string | number | Date} [now]
 */
function groupTutorSessions(sessions, now = new Date()) {
  const nowDate = new Date(now)
  if (Number.isNaN(nowDate.getTime())) throw new TypeError('now must be a valid date')

  const upcoming = []
  const past = []

  for (const session of sessions) {
    const status = session.status?.toLowerCase()

    if (status === 'completed' || status === 'cancelled') {
      past.push(session)
      continue
    }

    if (status === 'pending_scheduling') {
      upcoming.push(session)
      continue
    }

    const start = session.confirmed_start ? new Date(session.confirmed_start) : null
    const hasValidStart = start && !Number.isNaN(start.getTime())
    if (hasValidStart && start < nowDate) past.push(session)
    else upcoming.push(session)
  }

  upcoming.sort((a, b) => {
    const aTime = a.confirmed_start ? new Date(a.confirmed_start).getTime() : Number.NaN
    const bTime = b.confirmed_start ? new Date(b.confirmed_start).getTime() : Number.NaN
    if (Number.isNaN(aTime) && Number.isNaN(bTime)) return 0
    if (Number.isNaN(aTime)) return -1
    if (Number.isNaN(bTime)) return 1
    return aTime - bTime
  })

  past.sort((a, b) => {
    const aTime = a.confirmed_start ? new Date(a.confirmed_start).getTime() : 0
    const bTime = b.confirmed_start ? new Date(b.confirmed_start).getTime() : 0
    return bTime - aTime
  })

  return { upcoming, past }
}

/**
 * Only render stored meeting URLs as links when the browser can safely handle
 * them as ordinary HTTP(S) navigation.
 *
 * @param {unknown} value
 */
function isSafeHttpUrl(value) {
  if (typeof value !== 'string' || !value.trim()) return false

  try {
    const url = new URL(value)
    return (url.protocol === 'http:' || url.protocol === 'https:') && !url.username && !url.password
  } catch {
    return false
  }
}

module.exports = { groupTutorSessions, isSafeHttpUrl }
