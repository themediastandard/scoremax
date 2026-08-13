function normalizedEmail(value) {
  return typeof value === 'string' ? value.trim().toLowerCase() : ''
}

/**
 * Parent-first recipient list for operational session messages. When the
 * parent and student share an address, only the parent-facing copy is sent.
 */
function operationalRecipients(owner, student) {
  const seen = new Set()
  const recipients = []
  for (const candidate of [
    owner && { role: 'owner', ...owner },
    student && { role: 'student', ...student },
  ]) {
    const email = normalizedEmail(candidate?.email)
    if (!email || seen.has(email)) continue
    seen.add(email)
    recipients.push({ ...candidate, email })
  }
  return recipients
}

function calendarAttendees(tutor, owner, student) {
  const seen = new Set()
  const attendees = []
  for (const person of [tutor, owner, student]) {
    const email = normalizedEmail(person?.email)
    if (!email || seen.has(email)) continue
    seen.add(email)
    attendees.push({ email, displayName: person?.full_name || undefined })
  }
  return attendees
}

function sessionStudentName(session) {
  return session?.students?.full_name?.trim() || 'Student not assigned'
}

module.exports = {
  normalizedEmail,
  operationalRecipients,
  calendarAttendees,
  sessionStudentName,
}
