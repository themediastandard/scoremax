import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)

const {
  IN_PERSON_LOCATION,
  REMINDER_LEAD_MAX_MINUTES,
  REMINDER_LEAD_MIN_MINUTES,
  buildReminderLocation,
  formatSessionTime,
  isReminderDue,
  isReminderStillDue,
  reminderWindow,
} = require('../src/lib/session-reminders.js')

const NOW = new Date('2026-08-04T18:00:00.000Z')
const MINUTE = 60 * 1000

/** A session `minutes` from NOW, scheduled and never reminded. */
function sessionAt(minutes, overrides = {}) {
  return {
    status: 'scheduled',
    confirmed_start: new Date(NOW.getTime() + minutes * MINUTE).toISOString(),
    reminder_sent_for: null,
    session_type: 'online',
    meet_url: 'https://meet.google.com/abc-defg-hij',
    ...overrides,
  }
}

// ---------------------------------------------------------------------------
// The selection window. Every boundary here is a session that either gets a
// reminder or silently does not, and nothing downstream would notice either way.
// ---------------------------------------------------------------------------

test('the window runs from 55 to 70 minutes ahead, inclusive at both ends', () => {
  assert.equal(REMINDER_LEAD_MIN_MINUTES, 55)
  assert.equal(REMINDER_LEAD_MAX_MINUTES, 70)

  assert.equal(isReminderDue(sessionAt(55), NOW), true, 'exactly 55 minutes out is in')
  assert.equal(isReminderDue(sessionAt(70), NOW), true, 'exactly 70 minutes out is in')
  assert.equal(isReminderDue(sessionAt(62), NOW), true, 'the middle of the window is in')
})

test('a session one second outside either edge is not selected', () => {
  const justEarly = { ...sessionAt(55), confirmed_start: new Date(NOW.getTime() + 55 * MINUTE - 1000).toISOString() }
  const justLate = { ...sessionAt(70), confirmed_start: new Date(NOW.getTime() + 70 * MINUTE + 1000).toISOString() }

  assert.equal(isReminderDue(justEarly, NOW), false)
  assert.equal(isReminderDue(justLate, NOW), false)
})

test('a session already under way, or long past, is never selected', () => {
  assert.equal(isReminderDue(sessionAt(0), NOW), false)
  assert.equal(isReminderDue(sessionAt(-120), NOW), false)
  assert.equal(isReminderDue(sessionAt(600), NOW), false)
})

test('reminderWindow returns exactly the bounds isReminderDue tests, so the query and the re-check cannot disagree', () => {
  // The route hands these straight to PostgREST .gte()/.lte(), which are
  // inclusive. If these drifted apart, the query would hand the route rows it
  // then silently discarded — or worse, miss rows the re-check would have kept.
  const { start, end } = reminderWindow(NOW)
  assert.equal(start, '2026-08-04T18:55:00.000Z')
  assert.equal(end, '2026-08-04T19:10:00.000Z')

  assert.equal(isReminderDue({ ...sessionAt(0), confirmed_start: start }, NOW), true)
  assert.equal(isReminderDue({ ...sessionAt(0), confirmed_start: end }, NOW), true)
})

test('reminderWindow rejects an unreadable clock rather than polling around 1970', () => {
  assert.throws(() => reminderWindow('not a date'), TypeError)
})

// ---------------------------------------------------------------------------
// Coverage across ticks. A gap here loses reminders permanently and logs nothing.
// ---------------------------------------------------------------------------

test('the cron interval is strictly tighter than the window, so consecutive ticks overlap', () => {
  // Read the schedule out of the Netlify function rather than restating it:
  // these two numbers live in different files and only mean anything together.
  const source = readFileSync(new URL('../netlify/functions/session-reminders.mts', import.meta.url), 'utf8')
  const match = source.match(/schedule:\s*'\*\/(\d+) \* \* \* \*'/)
  assert.ok(match, 'expected a */N minute cron schedule in the Netlify function')

  const intervalMinutes = Number(match[1])
  const windowMinutes = REMINDER_LEAD_MAX_MINUTES - REMINDER_LEAD_MIN_MINUTES

  // Equal would make the windows merely abut. Any cron drift then opens a gap.
  assert.ok(
    intervalMinutes < windowMinutes,
    `cron interval ${intervalMinutes}m must be shorter than the ${windowMinutes}m window`
  )
})

test('every session start is caught by at least one tick', () => {
  const source = readFileSync(new URL('../netlify/functions/session-reminders.mts', import.meta.url), 'utf8')
  const intervalMinutes = Number(source.match(/schedule:\s*'\*\/(\d+) \* \* \* \*'/)[1])

  // Walk a session start minute by minute across two hours and count how many
  // ticks in a full day of ticks would select it.
  for (let offset = 0; offset < 120; offset += 1) {
    const start = new Date(NOW.getTime() + offset * MINUTE).toISOString()
    let hits = 0
    for (let tick = -180; tick <= 180; tick += intervalMinutes) {
      const tickTime = new Date(NOW.getTime() + tick * MINUTE)
      if (isReminderDue({ status: 'scheduled', confirmed_start: start, reminder_sent_for: null }, tickTime)) {
        hits += 1
      }
    }
    assert.ok(hits >= 1, `a session ${offset} minutes out was selected by no tick`)
  }
})

// ---------------------------------------------------------------------------
// Idempotency: the marker stores the start it was sent for, not the send time.
// ---------------------------------------------------------------------------

test('a session already reminded at its current time is not reminded again', () => {
  const session = sessionAt(60)
  const reminded = { ...session, reminder_sent_for: session.confirmed_start }
  assert.equal(isReminderDue(reminded, NOW), false)
})

test('rescheduling re-arms the reminder, with nothing having to clear the marker', () => {
  // The whole reason the column stores confirmed_start rather than a send time.
  // An admin moves a 3pm session to 7pm; the stale marker still names 3pm, so
  // the session no longer matches itself and becomes due again — without
  // src/app/api/admin/sessions/[id]/route.ts knowing this feature exists.
  const original = sessionAt(60)
  const moved = {
    ...original,
    confirmed_start: new Date(NOW.getTime() + 62 * MINUTE).toISOString(),
    reminder_sent_for: original.confirmed_start,
  }

  assert.notEqual(moved.reminder_sent_for, moved.confirmed_start)
  assert.equal(isReminderDue(moved, NOW), true)
})

test('the marker is compared as an instant, not as a string', () => {
  // Postgres hands timestamptz back as `+00:00` where we wrote `Z`, and may
  // render it in another offset entirely. A string comparison would read those
  // as "not yet reminded" and send a second copy to a paying customer.
  const session = { ...sessionAt(0), confirmed_start: '2026-08-04T19:00:00.000Z' }

  assert.equal(isReminderDue({ ...session, reminder_sent_for: '2026-08-04T19:00:00+00:00' }, NOW), false)
  assert.equal(isReminderDue({ ...session, reminder_sent_for: '2026-08-04T15:00:00-04:00' }, NOW), false)
  assert.equal(isReminderDue({ ...session, reminder_sent_for: '2026-08-04T19:00:00Z' }, NOW), false)
})

test('an unreadable marker blocks the send rather than triggering a duplicate', () => {
  // Cannot happen from a timestamptz column, but the safe direction is a missed
  // reminder (visible, recoverable) rather than a duplicate (neither).
  const session = sessionAt(60)
  assert.equal(isReminderDue({ ...session, reminder_sent_for: 'garbage' }, NOW), false)
})

test('only scheduled sessions are reminded', () => {
  for (const status of ['cancelled', 'completed', 'pending_scheduling', null]) {
    assert.equal(isReminderDue(sessionAt(60, { status }), NOW), false, `status ${status}`)
  }
})

test('a session with no confirmed start is never selected', () => {
  assert.equal(isReminderDue(sessionAt(60, { confirmed_start: null }), NOW), false)
  assert.equal(isReminderDue(null, NOW), false)
})

// ---------------------------------------------------------------------------
// The re-read immediately before sending.
// ---------------------------------------------------------------------------

test('the pre-send re-check passes when nothing has changed', () => {
  const session = sessionAt(60)
  assert.equal(isReminderStillDue(session, session.confirmed_start), true)
})

test('a session cancelled between the poll and the send is not reminded', () => {
  const session = sessionAt(60)
  assert.equal(isReminderStillDue({ ...session, status: 'cancelled' }, session.confirmed_start), false)
})

test('a session rescheduled between the poll and the send is not reminded with the old time', () => {
  const session = sessionAt(60)
  const moved = { ...session, confirmed_start: new Date(NOW.getTime() + 300 * MINUTE).toISOString() }
  assert.equal(isReminderStillDue(moved, session.confirmed_start), false)
})

test('a session another run already stamped is not sent twice', () => {
  const session = sessionAt(60)
  const stamped = { ...session, reminder_sent_for: session.confirmed_start }
  assert.equal(isReminderStillDue(stamped, session.confirmed_start), false)
})

test('the re-check does not re-apply the window, so a slow run still finishes its batch', () => {
  // Sends are paced under Resend's 2/second limit, so a session selected at 56
  // minutes out can be reached at 54. Re-testing the window there would drop a
  // session the run had already committed to.
  const session = sessionAt(5)
  assert.equal(isReminderDue(session, NOW), false, 'out of the selection window')
  assert.equal(isReminderStillDue(session, session.confirmed_start), true, 'but still worth sending')
})

// ---------------------------------------------------------------------------
// Online versus in person. The bug this guards is a "Join" button with an empty
// href, an hour before someone's session.
// ---------------------------------------------------------------------------

test('an online session with a Meet link gets a real link and a join target', () => {
  const { locationHtml, joinUrl } = buildReminderLocation({
    session_type: 'online',
    meet_url: 'https://meet.google.com/abc-defg-hij',
  })

  assert.equal(joinUrl, 'https://meet.google.com/abc-defg-hij')
  assert.ok(locationHtml.includes('href="https://meet.google.com/abc-defg-hij"'))
  assert.ok(locationHtml.includes('Online (Google Meet)'))
})

test('an online session with no Meet link gets no link at all, never an empty href', () => {
  // Reachable in production: handleCancel() clears meet_url, and an online
  // session scheduled while the ScoreMax Google account was disconnected never
  // had one.
  for (const meetUrl of [null, undefined, '', '   ']) {
    const { locationHtml, joinUrl } = buildReminderLocation({ session_type: 'online', meet_url: meetUrl })

    assert.equal(joinUrl, null, `meet_url ${JSON.stringify(meetUrl)}`)
    assert.ok(!locationHtml.includes('<a '), 'no anchor')
    assert.ok(!locationHtml.includes('href'), 'no href of any kind, empty or otherwise')
    assert.ok(locationHtml.includes('Online'), 'still says it is online')
  }
})

test('an in-person session gets the street address and no join link', () => {
  const { locationHtml, joinUrl } = buildReminderLocation({
    session_type: 'in_person',
    // A stale Meet link on an in-person session must not resurrect the button.
    meet_url: 'https://meet.google.com/left-over-link',
  })

  assert.equal(joinUrl, null)
  assert.ok(!locationHtml.includes('href'))
  assert.ok(locationHtml.includes('Sunrise, FL'))
  // Same constant the calendar event uses, so the two cannot drift.
  assert.ok(IN_PERSON_LOCATION.includes('Sawgrass Mills'))
})

test('a session with no type at all is treated as in person, not as a broken online session', () => {
  assert.equal(buildReminderLocation({}).joinUrl, null)
  assert.equal(buildReminderLocation(null).joinUrl, null)
  assert.ok(!buildReminderLocation(undefined).locationHtml.includes('href'))
})

test('the Meet URL is escaped, so it cannot break out of the href', () => {
  const { locationHtml } = buildReminderLocation({
    session_type: 'online',
    meet_url: 'https://evil.example/"><script>alert(1)</script>',
  })

  assert.ok(!locationHtml.includes('<script>'))
  assert.ok(!locationHtml.includes('"><'))
  assert.ok(locationHtml.includes('&quot;&gt;&lt;script&gt;'))
})

// ---------------------------------------------------------------------------
// The time both attendees read an hour before showing up.
// ---------------------------------------------------------------------------

test('the session time is rendered in the business timezone and labelled with it', () => {
  // The server runs in UTC on Netlify. Unlabelled local formatting told a
  // Florida student their 4pm session was at 8pm.
  const formatted = formatSessionTime('2026-08-04T20:00:00.000Z')
  assert.ok(formatted.includes('4:00 PM'), formatted)
  assert.ok(formatted.includes('(EDT)'), formatted)
  assert.ok(formatted.includes('August 4, 2026'), formatted)
})

test('the zone label follows the date, so a winter session says EST', () => {
  const formatted = formatSessionTime('2026-01-15T21:00:00.000Z')
  assert.ok(formatted.includes('4:00 PM'), formatted)
  assert.ok(formatted.includes('(EST)'), formatted)
})

test('a missing time says so rather than rendering the epoch', () => {
  assert.equal(formatSessionTime(null), 'Time to be confirmed')
  assert.equal(formatSessionTime(undefined), 'Time to be confirmed')
  assert.equal(formatSessionTime(''), 'Time to be confirmed')
  assert.equal(formatSessionTime('not a date'), 'Time to be confirmed')
})
