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
      start: { dateTime: new Date(session.confirmed_start).toISOString() },
      end: { dateTime: new Date(session.confirmed_end).toISOString() },
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
