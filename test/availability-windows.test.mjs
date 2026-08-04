import assert from 'node:assert/strict'
import test from 'node:test'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)

const {
  DAY_NAMES,
  MAX_AVAILABILITY_WINDOWS,
  cleanTimeOfDay,
  cleanDayName,
  normalizeAvailabilityWindows,
  legacyAvailabilityFromWindows,
  availabilityWindowsFromLegacy,
  readAvailabilityWindows,
} = require('../src/lib/availability-windows.js')

// ---------------------------------------------------------------------------
// The shape the whole feature exists for.
// ---------------------------------------------------------------------------

test('a day can now carry its own range, which the flat shape could not express', () => {
  // The entire point: "Mon 4-6pm, Thu 9-11am" was unrepresentable before.
  const windows = normalizeAvailabilityWindows([
    { day: 'Monday', start: '16:00', end: '18:00' },
    { day: 'Thursday', start: '09:00', end: '11:00' },
  ])

  assert.deepEqual(windows, [
    { day: 'Monday', start: '16:00', end: '18:00' },
    { day: 'Thursday', start: '09:00', end: '11:00' },
  ])
})

test('windows come back Monday-first however the days were clicked', () => {
  // Stored order must depend on what was chosen, not the order of clicking,
  // or two identical requests produce different rows.
  const windows = normalizeAvailabilityWindows([
    { day: 'Sunday', start: '10:00', end: '12:00' },
    { day: 'Wednesday', start: '10:00', end: '12:00' },
    { day: 'Monday', start: '10:00', end: '12:00' },
  ])

  assert.deepEqual(windows.map((w) => w.day), ['Monday', 'Wednesday', 'Sunday'])
})

// ---------------------------------------------------------------------------
// Untrusted input. These values arrive from `await req.json()` on two routes
// that write to production through supabaseAdmin.
// ---------------------------------------------------------------------------

test('normalizeAvailabilityWindows returns null, not [], when nothing is usable', () => {
  // Callers chain `?? availabilityWindowsFromLegacy(...)`, which an empty
  // array would defeat silently.
  assert.equal(normalizeAvailabilityWindows(null), null)
  assert.equal(normalizeAvailabilityWindows(undefined), null)
  assert.equal(normalizeAvailabilityWindows([]), null)
  assert.equal(normalizeAvailabilityWindows('Monday'), null)
  assert.equal(normalizeAvailabilityWindows(42), null)
  assert.equal(normalizeAvailabilityWindows({ day: 'Monday', start: '09:00', end: '10:00' }), null)
})

test('normalizeAvailabilityWindows drops junk entries without losing the good ones', () => {
  const windows = normalizeAvailabilityWindows([
    null,
    'Monday',
    ['Monday', '09:00', '10:00'],
    { day: 'Notaday', start: '09:00', end: '10:00' },
    { day: 'Monday', start: '09:00' },
    { day: 'Tuesday', start: '09:00', end: '10:00' },
  ])

  assert.deepEqual(windows, [{ day: 'Tuesday', start: '09:00', end: '10:00' }])
})

test('an end at or before its start is rejected rather than quietly swapped', () => {
  assert.equal(
    normalizeAvailabilityWindows([{ day: 'Monday', start: '18:00', end: '16:00' }]),
    null
  )
  assert.equal(
    normalizeAvailabilityWindows([{ day: 'Monday', start: '16:00', end: '16:00' }]),
    null
  )
})

test('the first window for a day wins, so a duplicate cannot invent availability', () => {
  // Merging the two would offer 09:00-18:00 on Monday, which nobody stated.
  const windows = normalizeAvailabilityWindows([
    { day: 'Monday', start: '09:00', end: '11:00' },
    { day: 'Monday', start: '16:00', end: '18:00' },
  ])

  assert.deepEqual(windows, [{ day: 'Monday', start: '09:00', end: '11:00' }])
})

test('day names are matched case-insensitively and stored canonically', () => {
  assert.equal(cleanDayName('monday'), 'Monday')
  assert.equal(cleanDayName('  THURSDAY '), 'Thursday')
  assert.equal(cleanDayName('Mon'), null)
  assert.equal(cleanDayName(''), null)
  assert.equal(cleanDayName(3), null)
  assert.equal(cleanDayName(null), null)
  assert.deepEqual(
    normalizeAvailabilityWindows([{ day: 'tuesday', start: '09:00', end: '10:00' }]),
    [{ day: 'Tuesday', start: '09:00', end: '10:00' }]
  )
})

test('cleanTimeOfDay accepts HH:MM and the HH:MM:SS Postgres reads back', () => {
  assert.equal(cleanTimeOfDay('09:30'), '09:30')
  // A `time` column returns "16:00:00"; keeping the seconds would make it
  // compare as a different window from the "16:00" the form submitted.
  assert.equal(cleanTimeOfDay('16:00:00'), '16:00')
  assert.equal(cleanTimeOfDay('  07:00  '), '07:00')
})

test('cleanTimeOfDay rejects everything that is not a wall-clock time', () => {
  assert.equal(cleanTimeOfDay('24:00'), null)
  assert.equal(cleanTimeOfDay('9:00'), null)
  assert.equal(cleanTimeOfDay('09:60'), null)
  assert.equal(cleanTimeOfDay('09:00; drop table booking_requests'), null)
  assert.equal(cleanTimeOfDay('09:00\n16:00'), null)
  assert.equal(cleanTimeOfDay(900), null)
  assert.equal(cleanTimeOfDay(null), null)
  assert.equal(cleanTimeOfDay(undefined), null)
})

test('a day cannot appear more than once, so the array is bounded at seven', () => {
  const flood = Array.from({ length: 500 }, (_, i) => ({
    day: DAY_NAMES[i % DAY_NAMES.length],
    start: '09:00',
    end: '10:00',
  }))

  assert.equal(normalizeAvailabilityWindows(flood).length, MAX_AVAILABILITY_WINDOWS)
  assert.equal(MAX_AVAILABILITY_WINDOWS, 7)
})

// ---------------------------------------------------------------------------
// Keeping the legacy columns written, which is what stops the change from
// blanking availability on every booking taken to date.
// ---------------------------------------------------------------------------

test('legacy columns get the envelope: earliest start, latest end, every day', () => {
  const legacy = legacyAvailabilityFromWindows([
    { day: 'Monday', start: '16:00', end: '18:00' },
    { day: 'Thursday', start: '09:00', end: '11:00' },
  ])

  // Wider than what was offered — Monday 09:00 is not actually available. This
  // is why nothing reads these columns back for scheduling; they exist so a
  // reader of the old shape sees something coherent rather than nothing.
  assert.deepEqual(legacy, {
    days: ['Monday', 'Thursday'],
    startTime: '09:00',
    endTime: '18:00',
  })
})

test('the envelope is exact when every day shares one range, as it used to', () => {
  const legacy = legacyAvailabilityFromWindows([
    { day: 'Monday', start: '16:00', end: '18:00' },
    { day: 'Thursday', start: '16:00', end: '18:00' },
  ])

  assert.deepEqual(legacy, {
    days: ['Monday', 'Thursday'],
    startTime: '16:00',
    endTime: '18:00',
  })
})

test('legacyAvailabilityFromWindows validates its input rather than trusting it', () => {
  assert.equal(legacyAvailabilityFromWindows(null), null)
  assert.equal(legacyAvailabilityFromWindows([]), null)
  assert.equal(legacyAvailabilityFromWindows([{ day: 'Monday', start: 'x', end: 'y' }]), null)
})

test('the flat shape rebuilds into per-day windows with the range repeated', () => {
  // How a pre-2026-08-04 booking renders, and how a browser still running the
  // previous bundle is accepted mid-deploy.
  const windows = availabilityWindowsFromLegacy(
    ['Monday', 'Thursday'],
    '16:00:00',
    '18:00:00'
  )

  assert.deepEqual(windows, [
    { day: 'Monday', start: '16:00', end: '18:00' },
    { day: 'Thursday', start: '16:00', end: '18:00' },
  ])
})

test('availabilityWindowsFromLegacy gives up rather than inventing a range', () => {
  assert.equal(availabilityWindowsFromLegacy(['Monday'], null, '18:00'), null)
  assert.equal(availabilityWindowsFromLegacy(['Monday'], '16:00', null), null)
  assert.equal(availabilityWindowsFromLegacy(null, '16:00', '18:00'), null)
  assert.equal(availabilityWindowsFromLegacy([], '16:00', '18:00'), null)
  assert.equal(availabilityWindowsFromLegacy('Monday', '16:00', '18:00'), null)
})

test('a round trip through the legacy columns survives when the days agree', () => {
  const original = [
    { day: 'Monday', start: '16:00', end: '18:00' },
    { day: 'Friday', start: '16:00', end: '18:00' },
  ]
  const legacy = legacyAvailabilityFromWindows(original)

  assert.deepEqual(
    availabilityWindowsFromLegacy(legacy.days, legacy.startTime, legacy.endTime),
    original
  )
})

// ---------------------------------------------------------------------------
// What every display path calls.
// ---------------------------------------------------------------------------

test('readAvailabilityWindows prefers the per-day column over the flat one', () => {
  const windows = readAvailabilityWindows({
    available_windows: [
      { day: 'Monday', start: '16:00', end: '18:00' },
      { day: 'Thursday', start: '09:00', end: '11:00' },
    ],
    // The envelope written alongside it. Preferring this would show Monday as
    // available from 9am.
    available_days: ['Monday', 'Thursday'],
    available_time_start: '09:00:00',
    available_time_end: '18:00:00',
  })

  assert.deepEqual(windows, [
    { day: 'Monday', start: '16:00', end: '18:00' },
    { day: 'Thursday', start: '09:00', end: '11:00' },
  ])
})

test('readAvailabilityWindows still renders a booking taken before the column existed', () => {
  // The regression the whole keep-both-shapes plan is guarding against.
  const windows = readAvailabilityWindows({
    available_windows: null,
    available_days: ['Tuesday', 'Saturday'],
    available_time_start: '14:00:00',
    available_time_end: '16:00:00',
  })

  assert.deepEqual(windows, [
    { day: 'Tuesday', start: '14:00', end: '16:00' },
    { day: 'Saturday', start: '14:00', end: '16:00' },
  ])
})

test('readAvailabilityWindows returns null when a booking states no availability', () => {
  assert.equal(readAvailabilityWindows(null), null)
  assert.equal(readAvailabilityWindows(undefined), null)
  assert.equal(readAvailabilityWindows({}), null)
  assert.equal(
    readAvailabilityWindows({
      available_windows: null,
      available_days: null,
      available_time_start: null,
      available_time_end: null,
    }),
    null
  )
})

test('readAvailabilityWindows falls back when the jsonb column holds junk', () => {
  // A row hand-edited to `[]` or `{}` must not blank the panel while the flat
  // columns still hold a usable answer.
  const booking = {
    available_days: ['Wednesday'],
    available_time_start: '10:00:00',
    available_time_end: '12:00:00',
  }

  assert.deepEqual(readAvailabilityWindows({ ...booking, available_windows: [] }), [
    { day: 'Wednesday', start: '10:00', end: '12:00' },
  ])
  assert.deepEqual(readAvailabilityWindows({ ...booking, available_windows: {} }), [
    { day: 'Wednesday', start: '10:00', end: '12:00' },
  ])
})
