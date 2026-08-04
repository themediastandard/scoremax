/**
 * Everything decidable about a session reminder without touching the network.
 *
 * A cron tick every ten minutes asks this module two questions — which sessions
 * are due a reminder, and is this one still due now that I am about to send —
 * and gets the location line for the email. All three are places where being
 * wrong is invisible in production: a missed reminder looks like nothing at all,
 * a double send looks like nothing in the logs, and an empty href renders as a
 * dead "Join" button that nobody reports. So they live here as pure functions
 * over an injected clock, and test/session-reminders.test.mjs pins them.
 *
 * Plain JavaScript with a .d.ts alongside so test/*.test.mjs can require() it
 * without a build step. See CLAUDE.md.
 */

/*
 * CommonJS, not ESM import: this file has to load inside test/*.test.mjs through
 * createRequire() with no build step, which is the entire reason it is .js and
 * not .ts. next lint's no-require-imports rule is aimed at TypeScript sources.
 */
/* eslint-disable @typescript-eslint/no-require-imports */
const { escapeHtml } = require('./html-escape.js')
const { IN_PERSON_LOCATION } = require('./session-calendar.js')
/* eslint-enable @typescript-eslint/no-require-imports */

/*
 * The selection window: sessions starting between 55 and 70 minutes from now.
 *
 * The width (15 minutes) MUST stay wider than the cron interval (10 minutes, see
 * netlify/functions/session-reminders.mts). Ticks fire at t, t+10, t+20 …, each
 * covering [t+55, t+70], so consecutive windows overlap by 5 minutes and every
 * session start is covered by at least one tick. Equal width and interval would
 * make the windows merely abut, and any cron drift at all — Netlify makes no
 * promise of firing on the second — opens a gap that a session falls through
 * silently and permanently.
 *
 * The overlap means a session near a boundary is selected by two consecutive
 * ticks. That is fine and expected: reminder_sent_for is what stops the second
 * tick sending again, and it is the reason this design does not rely on the
 * windows being disjoint.
 */
const REMINDER_LEAD_MIN_MINUTES = 55
const REMINDER_LEAD_MAX_MINUTES = 70

const MINUTE_MS = 60 * 1000

// Sessions are sold and delivered in Florida and the server runs in UTC on
// Netlify, so an unqualified toLocaleString() renders a 4pm ET session as
// "8:00 PM" with no zone label — telling both attendees the wrong time an hour
// before it starts. Same constant and same reasoning as the scheduling email in
// src/app/api/admin/sessions/[id]/route.ts.
const BUSINESS_TIME_ZONE = 'America/New_York'

/**
 * Milliseconds since the epoch, or null if the value cannot be read as a time.
 * @param {Date | string | number | null | undefined} value
 * @returns {number | null}
 */
function toMillis(value) {
  if (value === null || value === undefined || value === '') return null
  const ms = value instanceof Date ? value.getTime() : new Date(value).getTime()
  return Number.isNaN(ms) ? null : ms
}

/**
 * The `confirmed_start` range a tick at `now` should look at.
 *
 * Returned as ISO strings because the only consumer hands them straight to
 * PostgREST `.gte()` / `.lte()`, which are inclusive at both ends — matching
 * isReminderDue() below, so the query and the re-check can never disagree about
 * a session sitting exactly on a boundary.
 *
 * @param {Date | string | number} [now]
 * @returns {{ start: string, end: string }}
 */
function reminderWindow(now = new Date()) {
  const nowMs = toMillis(now)
  if (nowMs === null) {
    throw new TypeError(`reminderWindow received an invalid date: ${String(now)}`)
  }
  return {
    start: new Date(nowMs + REMINDER_LEAD_MIN_MINUTES * MINUTE_MS).toISOString(),
    end: new Date(nowMs + REMINDER_LEAD_MAX_MINUTES * MINUTE_MS).toISOString(),
  }
}

/**
 * Has this session already been reminded *at its current start time*?
 *
 * The marker stores the confirmed_start a reminder went out for, so comparing
 * instants rather than strings: Postgres may hand back `+00:00` where we wrote
 * `Z`, and the two are the same moment.
 *
 * A marker that is present but unreadable returns true — "already sent". That
 * direction costs at most one missed reminder; the other direction sends a
 * duplicate to a paying customer, which is the failure this whole column exists
 * to prevent.
 *
 * @param {string | Date | null | undefined} reminderSentFor
 * @param {string | Date | null | undefined} confirmedStart
 * @returns {boolean}
 */
function isAlreadyReminded(reminderSentFor, confirmedStart) {
  if (reminderSentFor === null || reminderSentFor === undefined || reminderSentFor === '') {
    return false
  }
  const sentMs = toMillis(reminderSentFor)
  if (sentMs === null) return true
  const startMs = toMillis(confirmedStart)
  if (startMs === null) return true
  return sentMs === startMs
}

/**
 * Is this session due a reminder on a tick at `now`?
 *
 * Mirrors the SQL the polling query expresses — status = 'scheduled',
 * confirmed_start inside the window, `reminder_sent_for is distinct from
 * confirmed_start` — with the last clause done here because PostgREST cannot
 * compare two columns to each other.
 *
 * @param {{
 *   status?: string | null,
 *   confirmed_start?: string | null,
 *   reminder_sent_for?: string | null,
 * } | null | undefined} session
 * @param {Date | string | number} [now]
 * @returns {boolean}
 */
function isReminderDue(session, now = new Date()) {
  if (!session) return false
  if (session.status !== 'scheduled') return false

  const startMs = toMillis(session.confirmed_start)
  if (startMs === null) return false

  const nowMs = toMillis(now)
  if (nowMs === null) {
    throw new TypeError(`isReminderDue received an invalid date: ${String(now)}`)
  }

  // Inclusive both ends, matching .gte()/.lte() in the polling query.
  if (startMs < nowMs + REMINDER_LEAD_MIN_MINUTES * MINUTE_MS) return false
  if (startMs > nowMs + REMINDER_LEAD_MAX_MINUTES * MINUTE_MS) return false

  return !isAlreadyReminded(session.reminder_sent_for, session.confirmed_start)
}

/**
 * Is the session STILL due, re-read from the database immediately before the
 * send?
 *
 * Deliberately not a window check. By this point the tick has already decided
 * this session is in scope; re-testing the window would let a slow run — Resend
 * is paced at under two sends a second — push a session below 55 minutes and
 * drop it after it had been selected. What can genuinely change between the poll
 * and the send is the parts that make sending *wrong*:
 *
 *   - the session was cancelled or completed
 *   - it was rescheduled, so `expectedStart` is no longer its start and the
 *     reminder we are holding quotes the wrong time
 *   - another run (a manual curl overlapping the cron) already sent it
 *
 * @param {{
 *   status?: string | null,
 *   confirmed_start?: string | null,
 *   reminder_sent_for?: string | null,
 * } | null | undefined} session
 * @param {string | Date | null | undefined} expectedStart the start the pending
 *   reminder email was rendered for
 * @returns {boolean}
 */
function isReminderStillDue(session, expectedStart) {
  if (!session) return false
  if (session.status !== 'scheduled') return false

  const startMs = toMillis(session.confirmed_start)
  const expectedMs = toMillis(expectedStart)
  if (startMs === null || expectedMs === null) return false
  if (startMs !== expectedMs) return false

  return !isAlreadyReminded(session.reminder_sent_for, session.confirmed_start)
}

/**
 * The session time as both attendees should read it, in the business timezone
 * and labelled with it.
 *
 * @param {string | Date | null | undefined} value
 * @returns {string}
 */
function formatSessionTime(value) {
  const ms = toMillis(value)
  if (ms === null) return 'Time to be confirmed'
  const date = new Date(ms)
  const formatted = new Intl.DateTimeFormat('en-US', {
    dateStyle: 'full',
    timeStyle: 'short',
    timeZone: BUSINESS_TIME_ZONE,
  }).format(date)
  const zoneLabel =
    new Intl.DateTimeFormat('en-US', {
      timeZone: BUSINESS_TIME_ZONE,
      timeZoneName: 'short',
    })
      .formatToParts(date)
      .find((part) => part.type === 'timeZoneName')?.value ?? 'ET'
  return `${formatted} (${zoneLabel})`
}

/**
 * The Location line and the one-click join target for a reminder.
 *
 * Three cases, and the middle one is the reason this is a function rather than a
 * ternary at the call site:
 *
 *   online + meet_url  → a real link, and a Join button on the email
 *   online, no meet_url → named as online, and NO link. A session can reach this
 *     state: handleCancel() clears meet_url, and an online session scheduled
 *     while the ScoreMax Google account was disconnected never had one. Rendering
 *     `<a href="">Join</a>` here would put a dead button in front of a customer
 *     an hour before their session.
 *   in person → the street address, no link. An hour out, the address is more
 *     use than the "Sawgrass, FL" the confirmation email settles for, and
 *     IN_PERSON_LOCATION is already the single source of truth for it.
 *
 * `locationHtml` is HTML and goes into emailLayout's unescaped `body`, so
 * everything interpolated into it is escaped here — including the URL, which is
 * inside a quoted attribute. It originates from Google rather than from a user,
 * but nothing about the call site enforces that.
 *
 * @param {{ session_type?: string | null, meet_url?: string | null } | null | undefined} session
 * @returns {{ locationHtml: string, joinUrl: string | null }}
 */
function buildReminderLocation(session) {
  const isOnline = session?.session_type === 'online'
  const meetUrl = typeof session?.meet_url === 'string' ? session.meet_url.trim() : ''

  if (!isOnline) {
    return { locationHtml: escapeHtml(IN_PERSON_LOCATION), joinUrl: null }
  }

  if (!meetUrl) {
    return {
      locationHtml: 'Online (Google Meet) — the link is on your calendar invite',
      joinUrl: null,
    }
  }

  return {
    locationHtml: `Online (Google Meet) — <a href="${escapeHtml(meetUrl)}">Join Meeting</a>`,
    joinUrl: meetUrl,
  }
}

module.exports = {
  BUSINESS_TIME_ZONE,
  IN_PERSON_LOCATION,
  REMINDER_LEAD_MAX_MINUTES,
  REMINDER_LEAD_MIN_MINUTES,
  buildReminderLocation,
  formatSessionTime,
  isAlreadyReminded,
  isReminderDue,
  isReminderStillDue,
  reminderWindow,
}
