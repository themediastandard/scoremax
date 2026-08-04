const IN_PERSON_LOCATION =
  'Florida Blue Center · 1970 Sawgrass Mills Cir, Sunrise, FL 33323-2994'

// Google truncates long summaries in month and week view, and the names either
// side of the subject are the part a tutor scans for. Keep the subject segment
// short enough that "with <tutor>" survives; the description carries the full
// list either way.
const MAX_SUBJECT_LABEL = 40

/**
 * Render resolved subject names for the event title.
 * One or two fit; beyond that, name the first and count the rest so a
 * five-subject session does not push the student's name off the grid.
 * @param {string[]} names
 */
function buildSubjectLabel(names) {
  if (!names.length) return ''

  const joined = names.join(', ')
  if (joined.length <= MAX_SUBJECT_LABEL) return joined

  const [first, ...rest] = names
  const summarised = `${first} +${rest.length}`
  return summarised.length <= MAX_SUBJECT_LABEL
    ? summarised
    : `${first.slice(0, MAX_SUBJECT_LABEL - 1).trimEnd()}…`
}

/**
 * Builds the single ScoreMax-owned calendar event for a session.
 * The event is created on the ScoreMax (admin) Google account's calendar with
 * the tutor and student as invited attendees, so neither needs their own
 * Google connection — Google delivers invites and updates to both.
 *
 * @param {{
 *   id: string,
 *   session_type?: string | null,
 *   confirmed_start?: string | null,
 *   confirmed_end?: string | null,
 *   subjectNames?: string[] | null,
 *   customers: { full_name?: string | null, email?: string | null },
 *   tutors: { full_name?: string | null, email?: string | null },
 * }} session
 */
function buildSessionCalendarPlan(session) {
  // Guard the times before they reach `new Date(...)`. A null confirmed_start
  // becomes the 1970 epoch rather than an error, so clearing a scheduled
  // session's date and then reassigning its tutor used to silently move the
  // live Google event — and its invitations — to 1 January 1970.
  const start = new Date(session.confirmed_start)
  const end = new Date(session.confirmed_end)
  if (!session.confirmed_start || Number.isNaN(start.getTime())) {
    throw new Error('session_missing_confirmed_start')
  }
  if (!session.confirmed_end || Number.isNaN(end.getTime())) {
    throw new Error('session_missing_confirmed_end')
  }
  if (end <= start) {
    throw new Error('session_end_not_after_start')
  }

  const isOnline = session.session_type === 'online'
  /** @type {Array<{ email: string, displayName?: string }>} */
  const attendees = []
  if (session.tutors?.email) {
    attendees.push({ email: session.tutors.email, displayName: session.tutors.full_name || undefined })
  }
  if (session.customers?.email) {
    attendees.push({ email: session.customers.email, displayName: session.customers.full_name || undefined })
  }

  /*
   * The subject goes in the title so a tutor with several students in one day
   * can tell their sessions apart from the calendar grid alone.
   *
   * `subjectNames` is resolved by the caller: sessions.subjects stores subject
   * *ids*, and raw UUIDs in an event title would be worse than no subject. When
   * they are absent — no subjects on the session, or a caller that did not
   * resolve them — fall back to the original title rather than emitting
   * "ScoreMax : Ada with Sam".
   */
  const subjectNames = Array.isArray(session.subjectNames)
    ? session.subjectNames.filter((name) => typeof name === 'string' && name.trim())
    : []
  const subjectLabel = buildSubjectLabel(subjectNames)

  return {
    isOnline,
    shouldCreateMeet: isOnline,
    requestBody: {
      summary: subjectLabel
        ? `ScoreMax ${subjectLabel}: ${session.customers.full_name} with ${session.tutors.full_name}`
        : `ScoreMax Session: ${session.customers.full_name} with ${session.tutors.full_name}`,
      description: [
        `Student: ${session.customers.full_name}`,
        `Tutor: ${session.tutors.full_name}`,
        // Full list, untruncated — the title is the constrained surface, not this.
        ...(subjectNames.length
          ? [`Subject${subjectNames.length > 1 ? 's' : ''}: ${subjectNames.join(', ')}`]
          : []),
        `Location: ${isOnline ? 'Online (Google Meet)' : IN_PERSON_LOCATION}`,
      ].join('\n'),
      start: { dateTime: start.toISOString() },
      end: { dateTime: end.toISOString() },
      attendees,
      ...(isOnline ? {} : { location: IN_PERSON_LOCATION }),
    },
  }
}

/**
 * Conference create request for attaching a Google Meet to an event.
 * The requestId must be unique per creation attempt — reusing one after a
 * cancel/re-schedule can return a stale conference.
 * @param {string} sessionId
 */
function getMeetConferenceRequest(sessionId) {
  return {
    conferenceData: {
      createRequest: {
        requestId: `scoremax-${sessionId}-${Date.now()}`,
        conferenceSolutionKey: { type: 'hangoutsMeet' },
      },
    },
  }
}

module.exports = {
  IN_PERSON_LOCATION,
  buildSessionCalendarPlan,
  getMeetConferenceRequest,
}
