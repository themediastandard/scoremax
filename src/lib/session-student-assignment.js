function normalizedEmail(value) {
  return typeof value === 'string' ? value.trim().toLowerCase() : ''
}

function attendeeFor(person) {
  const email = normalizedEmail(person?.email)
  if (!email) return null
  return {
    email,
    ...(person?.full_name ? { displayName: person.full_name } : {}),
  }
}

/**
 * Replace only the managed-student attendee on a ScoreMax-owned event.
 * Existing owner/tutor response state and any unrelated attendees are kept.
 */
function replaceManagedStudentAttendee(attendees, previousStudent, nextStudent, owner, tutor) {
  const previousEmail = normalizedEmail(previousStudent?.email)
  const nextEmail = normalizedEmail(nextStudent?.email)
  const protectedEmails = new Set([
    normalizedEmail(owner?.email),
    normalizedEmail(tutor?.email),
  ].filter(Boolean))
  const result = []
  const seen = new Set()

  for (const attendee of Array.isArray(attendees) ? attendees : []) {
    const email = normalizedEmail(attendee?.email)
    const isReplacedStudent =
      (email === previousEmail || email === nextEmail) && !protectedEmails.has(email)
    if (!email || isReplacedStudent || seen.has(email)) continue
    seen.add(email)
    result.push(attendee)
  }

  // These may already be present in `result`; if so, keep Google's existing
  // responseStatus and organizer metadata instead of recreating the attendee.
  for (const person of [tutor, owner, nextStudent]) {
    const attendee = attendeeFor(person)
    if (!attendee || seen.has(attendee.email)) continue
    seen.add(attendee.email)
    result.push(attendee)
  }

  return result
}

function studentAssignmentPolicy(input) {
  const {
    currentStudentId,
    nextStudentId,
    paymentMethod,
    paymentType,
    courseEnrollmentId,
    boundStudentId,
  } = input

  if (!nextStudentId) {
    return {
      allowed: false,
      code: 'student_required',
      message: 'Choose an active student before saving this session.',
    }
  }
  if (currentStudentId === nextStudentId) return { allowed: true }

  const isReassignment = Boolean(currentStudentId)
  if (isReassignment && paymentMethod === 'step_up') {
    return {
      allowed: false,
      code: 'step_up_student_reassignment_blocked',
      message:
        'This Step Up session is tied to the original student. Contact support before moving it to another child.',
    }
  }

  const isCourse = Boolean(courseEnrollmentId) ||
    paymentType === 'course' ||
    paymentType === 'sat-course-inperson'
  if (isReassignment && isCourse) {
    return {
      allowed: false,
      code: 'course_student_reassignment_blocked',
      message:
        'This course session is tied to the enrolled student. Change the enrollment before moving this session.',
    }
  }

  if (boundStudentId && boundStudentId !== nextStudentId) {
    return {
      allowed: false,
      code: 'student_bound_credit_reassignment_blocked',
      message:
        'This session used student-specific credits. It can only remain assigned to the student who owns those credits.',
    }
  }

  return { allowed: true }
}

module.exports = {
  normalizedEmail,
  replaceManagedStudentAttendee,
  studentAssignmentPolicy,
}
