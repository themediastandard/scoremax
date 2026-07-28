const IN_PERSON_LOCATION =
  'Florida Blue Center · 1970 Sawgrass Mills Cir, Sunrise, FL 33323-2994'

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

  return {
    isOnline,
    shouldCreateMeet: isOnline,
    requestBody: {
      summary: `ScoreMax Session: ${session.customers.full_name} with ${session.tutors.full_name}`,
      description: [
        `Student: ${session.customers.full_name}`,
        `Tutor: ${session.tutors.full_name}`,
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
