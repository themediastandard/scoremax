function hasGoogleRefreshToken(entity) {
  return Boolean(entity?.google_refresh_token)
}

function buildBaseEventBody(session) {
  const isOnline = session.session_type === 'online'
  return {
    summary: `ScoreMax: ${isOnline ? 'Online' : 'In-Person'} Session`,
    description: `Student: ${session.customers.full_name}\nTutor: ${session.tutors.full_name}\nLocation: ${isOnline ? 'Online (Google Meet)' : 'Sawgrass, FL'}`,
    start: { dateTime: new Date(session.confirmed_start).toISOString() },
    end: { dateTime: new Date(session.confirmed_end).toISOString() },
  }
}

function getMeetConferenceRequest(sessionId) {
  return {
    conferenceData: {
      createRequest: {
        requestId: `scoremax-session-${sessionId}`,
        conferenceSolutionKey: { type: 'hangoutsMeet' },
      },
    },
  }
}

function withMeetLink(eventBody, meetUrl) {
  if (!meetUrl) return eventBody
  return {
    ...eventBody,
    description: `${eventBody.description}\n\nGoogle Meet: ${meetUrl}`,
  }
}

function buildSessionCalendarPlan(session) {
  const isOnline = session.session_type === 'online'
  const tutorConnected = hasGoogleRefreshToken(session.tutors)
  const studentConnected = hasGoogleRefreshToken(session.customers)
  const baseEventBody = buildBaseEventBody(session)

  return {
    isOnline,
    baseEventBody,
    tutor: tutorConnected
      ? {
          shouldCreateMeet: isOnline,
          requestBody: {
            ...baseEventBody,
            summary: `ScoreMax Session: ${session.customers.full_name}`,
          },
        }
      : null,
    student: studentConnected
      ? {
          shouldCreateMeet: isOnline && !tutorConnected,
          requestBody: {
            ...baseEventBody,
            summary: `ScoreMax Session: ${session.tutors.full_name}`,
          },
        }
      : null,
  }
}

module.exports = {
  buildSessionCalendarPlan,
  getMeetConferenceRequest,
  withMeetLink,
}
