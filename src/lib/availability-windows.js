/**
 * Per-day availability windows for booking requests.
 *
 * A booking used to carry one time range applied to every selected day
 * (`available_days` + `available_time_start` + `available_time_end`), so
 * "Mon 4–6pm, Thu 9–11am" could not be expressed at all. The canonical shape is
 * now `booking_requests.available_windows`, a jsonb array of
 * `{ day, start, end }`, and the three old columns are kept in step as a
 * flattened envelope so nothing that still reads them breaks.
 *
 * Everything here treats its input as untrusted: these values arrive straight
 * from `await req.json()` on /api/booking/submit and /api/stripe/checkout, and
 * both write to production tables through supabaseAdmin. Anything unusable is
 * dropped rather than coerced, so a malformed entry costs you that one day
 * rather than corrupting the row.
 *
 * Plain JavaScript with a .d.ts alongside so test/*.test.mjs can require() it
 * without a build step. See CLAUDE.md.
 */

/** Canonical day names, in the order they are displayed and stored. */
const DAY_NAMES = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
]

/** Lower-cased name -> index, for canonicalising input and sorting output. */
const DAY_INDEX = new Map(DAY_NAMES.map((day, i) => [day.toLowerCase(), i]))

/** One window per day of the week is the most that can ever be meaningful. */
const MAX_AVAILABILITY_WINDOWS = DAY_NAMES.length

/**
 * "HH:MM", optionally with the seconds Postgres adds when reading a `time`
 * column back ("16:00:00"). Anchored, so "16:00 or drop table" is not a time.
 */
const TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/

/**
 * Normalise an untrusted value to "HH:MM", or null.
 *
 * Seconds are discarded: they are never meaningful for a stated availability
 * preference, and keeping them would make "16:00" and "16:00:00" compare as
 * different windows for the same hour.
 *
 * @param {unknown} value
 * @returns {string | null}
 */
function cleanTimeOfDay(value) {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  if (!TIME_PATTERN.test(trimmed)) return null
  return trimmed.slice(0, 5)
}

/**
 * Normalise an untrusted value to a canonical day name, or null.
 *
 * Matching is case-insensitive so "monday" from a hand-rolled request still
 * lands on "Monday" — one spelling in the database keeps the day comparable.
 *
 * @param {unknown} value
 * @returns {string | null}
 */
function cleanDayName(value) {
  if (typeof value !== 'string') return null
  const index = DAY_INDEX.get(value.trim().toLowerCase())
  return index === undefined ? null : DAY_NAMES[index]
}

/**
 * Validate and canonicalise a per-day availability array.
 *
 * Returns null — never an empty array — when nothing usable survives, so
 * callers can fall back to the legacy shape with a plain `??`.
 *
 * Rules, all of them load-bearing:
 *  - a window needs a recognised day, a valid start, a valid end, and end
 *    strictly after start. "HH:MM" strings compare correctly as strings, so no
 *    date parsing is involved;
 *  - the first window for a day wins. A duplicate day is a client bug, and
 *    silently merging two ranges would invent availability nobody offered;
 *  - output is sorted Monday-first regardless of the order days were clicked,
 *    so the stored value depends on what was chosen and not how.
 *
 * @param {unknown} value
 * @returns {Array<{ day: string, start: string, end: string }> | null}
 */
function normalizeAvailabilityWindows(value) {
  if (!Array.isArray(value)) return null

  const byDay = new Map()
  for (const entry of value) {
    if (!entry || typeof entry !== 'object' || Array.isArray(entry)) continue

    const day = cleanDayName(entry.day)
    const start = cleanTimeOfDay(entry.start)
    const end = cleanTimeOfDay(entry.end)
    if (!day || !start || !end) continue
    if (end <= start) continue
    if (byDay.has(day)) continue

    byDay.set(day, { day, start, end })
    if (byDay.size >= MAX_AVAILABILITY_WINDOWS) break
  }

  if (byDay.size === 0) return null
  return DAY_NAMES.filter((day) => byDay.has(day)).map((day) => byDay.get(day))
}

/**
 * Flatten per-day windows into the legacy `available_days` /
 * `available_time_start` / `available_time_end` triple.
 *
 * The times are the *envelope* — earliest start, latest end — which is wider
 * than what was actually offered whenever the days differ ("Mon 4–6pm, Thu
 * 9–11am" flattens to 09:00–18:00). That is deliberate and is why the envelope
 * is only ever written, never read back for scheduling: every reader in `src/`
 * prefers `available_windows` and falls back to these columns solely for rows
 * created before the per-day shape existed. Narrowing to the intersection would
 * be the alternative, and it is frequently empty.
 *
 * @param {Array<{ day: string, start: string, end: string }> | null | undefined} windows
 * @returns {{ days: string[], startTime: string, endTime: string } | null}
 */
function legacyAvailabilityFromWindows(windows) {
  const normalized = normalizeAvailabilityWindows(windows)
  if (!normalized) return null

  let startTime = normalized[0].start
  let endTime = normalized[0].end
  for (const window of normalized) {
    if (window.start < startTime) startTime = window.start
    if (window.end > endTime) endTime = window.end
  }

  return { days: normalized.map((w) => w.day), startTime, endTime }
}

/**
 * Rebuild per-day windows from the legacy triple, giving every day the one
 * shared range — exactly what the old form meant.
 *
 * Used in two places: reading a booking created before this shape existed, and
 * accepting a submission from a browser still running the previous bundle
 * during a deploy.
 *
 * @param {unknown} days
 * @param {unknown} startTime
 * @param {unknown} endTime
 * @returns {Array<{ day: string, start: string, end: string }> | null}
 */
function availabilityWindowsFromLegacy(days, startTime, endTime) {
  if (!Array.isArray(days)) return null
  const start = cleanTimeOfDay(startTime)
  const end = cleanTimeOfDay(endTime)
  if (!start || !end) return null

  return normalizeAvailabilityWindows(days.map((day) => ({ day, start, end })))
}

/**
 * The windows to display for a booking row, whichever shape it was stored in.
 * Rows written before the per-day column existed carry only the legacy triple.
 *
 * @param {{
 *   available_windows?: unknown,
 *   available_days?: unknown,
 *   available_time_start?: unknown,
 *   available_time_end?: unknown,
 * } | null | undefined} booking
 * @returns {Array<{ day: string, start: string, end: string }> | null}
 */
function readAvailabilityWindows(booking) {
  if (!booking) return null
  return (
    normalizeAvailabilityWindows(booking.available_windows) ??
    availabilityWindowsFromLegacy(
      booking.available_days,
      booking.available_time_start,
      booking.available_time_end
    )
  )
}

module.exports = {
  DAY_NAMES,
  MAX_AVAILABILITY_WINDOWS,
  cleanTimeOfDay,
  cleanDayName,
  normalizeAvailabilityWindows,
  legacyAvailabilityFromWindows,
  availabilityWindowsFromLegacy,
  readAvailabilityWindows,
}
