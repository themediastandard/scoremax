import { NextRequest, NextResponse } from 'next/server'
import { type calendar_v3 } from 'googleapis'
import { z } from 'zod'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { sendEmail, getEmailDefaults } from '@/lib/resend'
import {
  emailLayout,
  detailRow,
  sessionRescheduledEmail,
  sessionUnassignedEmail,
} from '@/lib/email-templates'
import { calendar } from '@/lib/google-calendar'
import {
  getAdminGoogleAuth,
  clearAdminGoogleConnection,
  isRevokedGoogleTokenError,
} from '@/lib/google-admin'
import { getAuthUser, requireAdmin } from '@/lib/auth'
import { reportError } from '@/lib/report-error'
import {
  buildSessionCalendarPlan,
  getMeetConferenceRequest,
} from '@/lib/session-calendar'
import { operationalRecipients, sessionStudentName } from '@/lib/session-recipients'
import {
  replaceManagedStudentAttendee,
  studentAssignmentPolicy,
} from '@/lib/session-student-assignment'

type SessionPerson = {
  id: string
  email: string
  full_name: string
}

type SessionRecord = {
  id: string
  session_type?: string | null
  confirmed_start?: string | null
  confirmed_end?: string | null
  tutor_calendar_event_id?: string | null
  student_calendar_event_id?: string | null
  meet_url?: string | null
  customers: SessionPerson
  students?: SessionPerson | null
  tutors: SessionPerson
  [key: string]: unknown
}

type AssignmentOrder = {
  id: string
  customer_id: string | null
  student_id: string | null
  payment_method: string | null
  payment_type: string | null
  course_enrollment_id: string | null
  credit_source_id: string | null
  purchase_key: string | null
}

const studentIdSchema = z.string().uuid()

// Thrown when a session cannot be scheduled (e.g. online session with no
// ScoreMax Google connection). Surfaces to the admin UI as a 400.
class SchedulingError extends Error {}

/**
 * sessions.subjects stores subject *ids*; the calendar event title needs names.
 * Returns them in the session's own order, dropping any id that no longer
 * resolves — a deleted subject should cost you that one name, not the title.
 */
async function resolveSubjectNames(subjects: unknown): Promise<string[]> {
  const ids = Array.isArray(subjects)
    ? subjects.filter((value): value is string => typeof value === 'string' && value.length > 0)
    : []
  if (!ids.length) return []

  const { data, error } = await supabaseAdmin.from('subjects').select('id, name').in('id', ids)
  if (error) {
    // Non-fatal: buildSessionCalendarPlan falls back to the subject-less title.
    reportError('schedule:subject-lookup', error, { subjectIds: ids })
    return []
  }

  const byId = new Map((data ?? []).map((row) => [row.id as string, row.name as string]))
  return ids.map((id) => byId.get(id)).filter((name): name is string => Boolean(name))
}

function getMeetUrl(event: { data?: calendar_v3.Schema$Event }) {
  const videoEntry = event?.data?.conferenceData?.entryPoints?.find(
    (entry) => entry.entryPointType === 'video'
  )
  return event?.data?.hangoutLink ?? videoEntry?.uri ?? null
}

// Creates the single ScoreMax-owned calendar event (tutor + student invited).
// Google delivers invites to both attendees, so neither needs their own
// Google connection. Returns session-record updates.
async function createSessionEvent(session: SessionRecord): Promise<Record<string, string | null>> {
  const updates: Record<string, string | null> = {}
  const plan = buildSessionCalendarPlan(session)
  const adminAuth = await getAdminGoogleAuth()

  if (!adminAuth) {
    if (plan.isOnline) {
      throw new SchedulingError(
        'The ScoreMax Google account is not connected, so a Google Meet cannot be created. Connect it in Settings → Integrations, then schedule this session.'
      )
    }
    console.error('ScoreMax Google account not connected; scheduling in-person session without a calendar invite')
    return updates
  }

  try {
    const requestBody = {
      ...plan.requestBody,
      ...(plan.shouldCreateMeet ? getMeetConferenceRequest(session.id) : {}),
    }
    const event = await calendar.events.insert({
      auth: adminAuth,
      calendarId: 'primary',
      conferenceDataVersion: plan.shouldCreateMeet ? 1 : 0,
      sendUpdates: 'all',
      requestBody,
    })
    // Single ScoreMax-owned event; stored in tutor_calendar_event_id
    // (schema predates the single-event model).
    updates.tutor_calendar_event_id = event.data.id ?? null
    updates.student_calendar_event_id = null
    const meetUrl = getMeetUrl(event)
    if (meetUrl) {
      updates.meet_url = meetUrl
    } else if (plan.shouldCreateMeet) {
      if (event.data.id) {
        try {
          await calendar.events.delete({
            auth: adminAuth,
            calendarId: 'primary',
            eventId: event.data.id,
            sendUpdates: 'none',
          })
        } catch (cleanupError) {
          console.error('Failed to clean up event without Meet link', cleanupError)
        }
      }
      throw new SchedulingError(
        'Google did not return a Meet link for this session. Try again, or reconnect the ScoreMax Google account in Settings → Integrations.'
      )
    }
  } catch (error) {
    if (error instanceof SchedulingError) throw error
    reportError('schedule:calendar-create', error, { sessionId: session.id })

    // A revoked token would otherwise leave the dashboard showing "Google
    // Connected" while every booking failed. Clear it so the badge flips and
    // the admin is told to reconnect.
    if (isRevokedGoogleTokenError(error)) {
      await clearAdminGoogleConnection()
      throw new SchedulingError(
        'The ScoreMax Google connection has been revoked or has expired. Reconnect it in Settings → Integrations, then schedule this session again.'
      )
    }

    if (plan.isOnline) {
      throw new SchedulingError(
        'Could not create the Google Meet for this session. Check the ScoreMax Google connection in Settings → Integrations and try again.'
      )
    }
  }

  return updates
}

// Sessions are sold and delivered in Florida, and the server runs in UTC on
// Netlify. toLocaleString() there rendered a 4pm ET session as "8:00 PM" with no
// timezone label, so both the student and the tutor were told the wrong time.
// Format explicitly in the business timezone and say so.
const BUSINESS_TIME_ZONE = 'America/New_York'

function formatSessionTime(iso: string | null | undefined): string {
  if (!iso) return 'Time to be confirmed'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return 'Time to be confirmed'
  const formatted = new Intl.DateTimeFormat('en-US', {
    dateStyle: 'full',
    timeStyle: 'short',
    timeZone: BUSINESS_TIME_ZONE,
  }).format(d)
  const zoneLabel =
    new Intl.DateTimeFormat('en-US', {
      timeZone: BUSINESS_TIME_ZONE,
      timeZoneName: 'short',
    })
      .formatToParts(d)
      .find((p) => p.type === 'timeZoneName')?.value ?? 'ET'
  return `${formatted} (${zoneLabel})`
}

async function sendScheduleEmails(
  session: SessionRecord,
  meetUrl: string | null,
  hasCalendarInvite: boolean
): Promise<boolean> {
  const startTime = formatSessionTime(session.confirmed_start)
  const isOnline = session.session_type === 'online'
  const locationText = isOnline
    ? `Online (Google Meet)${meetUrl ? ` - <a href="${meetUrl}">Join Meeting</a>` : ''}`
    : 'Sawgrass, FL'

  // Only promise an invite when one was actually created. An in-person session
  // scheduled while the ScoreMax Google account is disconnected gets no
  // calendar event, but both emails used to claim one was on its way.
  const inviteLine = hasCalendarInvite
    ? ' A calendar invite is on its way to your inbox.'
    : ''

  /*
   * Best effort by design — see the note below on why these run only after the
   * database write. The session is scheduled and the calendar invite already
   * sent, so neither failure should unwind anything; both simply need to be
   * visible. These two fire back to back, which is the shape that used to trip
   * Resend's 2-requests-per-second default; sendEmail now spaces them itself,
   * so this pair costs one extra ~550ms and no caller has to think about it.
   */
  const studentName = sessionStudentName(session)
  let familyOk = true
  for (const recipient of operationalRecipients(session.customers, session.students)) {
    const owner = recipient.role === 'owner'
    familyOk = (await sendEmail(
      {
        ...getEmailDefaults(),
        to: recipient.email,
        subject: 'Session Confirmed: Your session is scheduled',
        html: emailLayout({
          title: 'Session Confirmed',
          greeting: `Hi ${recipient.full_name || 'there'},`,
          body: [
            `<p style="margin: 0 0 16px 0;">${owner ? 'The selected student’s' : 'Your'} tutoring session has been confirmed!${inviteLine}</p>`,
            ...(owner ? [detailRow('Student:', studentName)] : []),
            detailRow('Tutor:', session.tutors.full_name),
            detailRow('Time:', startTime),
            detailRow('Location:', locationText),
          ].join(''),
        }),
      },
      `admin:session-confirmed:${recipient.role}:${session.id}:${session.confirmed_start ?? 'unscheduled'}`
    )) && familyOk
  }

  const tutorOk = await sendEmail(
    {
      ...getEmailDefaults(),
      to: session.tutors.email,
      subject: 'New Session Assigned',
      html: emailLayout({
        title: 'New Session Assigned',
        greeting: `Hi ${session.tutors.full_name},`,
        body: [
          `<p style="margin: 0 0 16px 0;">You have been assigned a new session.${inviteLine}</p>`,
          detailRow('Student:', studentName),
          detailRow('Time:', startTime),
          detailRow('Location:', locationText),
        ].join(''),
      }),
    },
    `admin:session-confirmed:tutor:${session.id}:${session.confirmed_start ?? 'unscheduled'}`
  )

  return familyOk && tutorOk
}

/**
 * Tell the tutor who just lost a session that they lost it.
 *
 * The reassign patch removes them from the calendar event's attendees, which
 * makes Google send its own unbranded "the event has changed" notice — the only
 * thing they used to hear from us. Everything this needs is passed in rather
 * than read off the session record, because by the time the reassign branch has
 * finished building `merged` the outgoing tutor and the old start time are both
 * gone from it.
 *
 * Best effort, like the other sends in this route: it runs on the deferred path
 * after the write, so the reassignment is already durable and a failed send must
 * not unwind it. sendEmail() reports its own failures to Sentry; the log line
 * here is what ties one to a session id in the Netlify log.
 */
async function sendUnassignedEmail(outgoing: {
  tutor: SessionPerson
  studentName: string | null | undefined
  startsAt: string | null | undefined
  sessionId: string
}): Promise<boolean> {
  const { subject, html } = sessionUnassignedEmail({
    tutorName: outgoing.tutor.full_name,
    studentName: outgoing.studentName,
    startsAt: outgoing.startsAt,
  })

  const ok = await sendEmail(
    { ...getEmailDefaults(), to: outgoing.tutor.email, subject, html },
    `admin:session-unassigned:tutor:${outgoing.sessionId}`
  )
  if (!ok) {
    console.error(
      `Session ${outgoing.sessionId} was reassigned but the outgoing tutor could not be notified.`
    )
  }
  return ok
}

async function sendRescheduleEmails(options: {
  session: SessionRecord
  previousStart: string | null | undefined
  previousEnd: string | null | undefined
  calendarUpdated: boolean
}): Promise<boolean> {
  const { session, previousStart, previousEnd, calendarUpdated } = options
  const shared = {
    previousStart,
    previousEnd,
    newStart: session.confirmed_start,
    newEnd: session.confirmed_end,
    sessionType: session.session_type,
    meetUrl: session.meet_url,
    calendarUpdated,
  }
  const studentName = sessionStudentName(session)
  let familyOk = true
  for (const recipient of operationalRecipients(session.customers, session.students)) {
    const message = sessionRescheduledEmail({
      ...shared,
      recipient: recipient.role,
      recipientName: recipient.full_name,
      counterpartName: session.tutors.full_name,
      studentName,
    })
    familyOk = (await sendEmail(
      { ...getEmailDefaults(), to: recipient.email, ...message },
      `admin:session-rescheduled:${recipient.role}:${session.id}:${session.confirmed_start ?? 'unscheduled'}`
    )) && familyOk
  }

  const tutorMessage = sessionRescheduledEmail({
    ...shared,
    recipient: 'tutor',
    recipientName: session.tutors.full_name,
    counterpartName: studentName,
    studentName,
  })
  const tutorOk = await sendEmail(
    { ...getEmailDefaults(), to: session.tutors.email, ...tutorMessage },
    `admin:session-rescheduled:tutor:${session.id}:${session.confirmed_start ?? 'unscheduled'}`
  )

  return familyOk && tutorOk
}

async function sendCancellationEmails(session: SessionRecord): Promise<boolean> {
  const studentName = sessionStudentName(session)
  const startTime = formatSessionTime(session.confirmed_start)
  let delivered = true
  for (const recipient of operationalRecipients(session.customers, session.students)) {
    const owner = recipient.role === 'owner'
    delivered = (await sendEmail({
      ...getEmailDefaults(),
      to: recipient.email,
      subject: 'Session Cancelled',
      html: emailLayout({
        title: 'Session Cancelled',
        greeting: `Hi ${recipient.full_name || 'there'},`,
        body: [
          `<p style="margin: 0 0 16px 0;">${owner ? 'The selected student’s' : 'Your'} ScoreMax session has been cancelled.</p>`,
          ...(owner ? [detailRow('Student:', studentName)] : []),
          detailRow('Time:', startTime),
        ].join(''),
      }),
    }, `admin:session-cancelled:${recipient.role}:${session.id}:${session.confirmed_start ?? 'unscheduled'}`)) && delivered
  }
  if (session.tutors?.email) {
    delivered = (await sendEmail({
      ...getEmailDefaults(),
      to: session.tutors.email,
      subject: 'Session Cancelled',
      html: emailLayout({
        title: 'Session Cancelled',
        greeting: `Hi ${session.tutors.full_name},`,
        body: [
          '<p style="margin: 0 0 16px 0;">This ScoreMax session has been cancelled and removed from your calendar.</p>',
          detailRow('Student:', studentName),
          detailRow('Time:', startTime),
        ].join(''),
      }),
    }, `admin:session-cancelled:tutor:${session.id}:${session.confirmed_start ?? 'unscheduled'}`)) && delivered
  }
  return delivered
}

// Calendar work happens now (so a failure aborts the whole change with a 400
// and nothing is persisted), but the emails are returned as a deferred callback
// for the caller to run *after* the database write succeeds. Previously both
// fired first, so a failed write left the attendees holding an invite and a
// confirmation email for a session the database did not record as scheduled.
type ScheduleOutcome = {
  updates: Record<string, string | null>
  rollbackCalendar: (() => Promise<void>) | null
  sendEmails: () => Promise<boolean>
}

async function handleSchedule(session: SessionRecord): Promise<ScheduleOutcome> {
  const updates = await createSessionEvent(session)
  const eventId = updates.tutor_calendar_event_id
  return {
    updates,
    // If the subsequent database write fails, remove the event we just made.
    // This also protects the reassign fallback that has to create a missing
    // event rather than leaving an orphaned invite in Google Calendar.
    rollbackCalendar: eventId
      ? async () => {
          await handleCancel({ ...session, tutor_calendar_event_id: eventId })
        }
      : null,
    sendEmails: () =>
      sendScheduleEmails(
        session,
        updates.meet_url ?? null,
        Boolean(updates.tutor_calendar_event_id)
      ),
  }
}

// Tutor changed on an already-scheduled session: patch the existing event's
// attendees (Google notifies the removed tutor, invites the new one) and keep
// the same Meet link. Falls back to creating a fresh event if none exists.
async function handleReassign(
  session: SessionRecord,
  previousSession: SessionRecord
): Promise<ScheduleOutcome> {
  const adminAuth = await getAdminGoogleAuth()
  const eventId = session.tutor_calendar_event_id

  if (!eventId) {
    return handleSchedule(session)
  }

  if (!adminAuth) {
    throw new SchedulingError(
      'Google Calendar is not connected, so the tutor or time could not be changed. Reconnect it in Settings → Integrations, then try again.'
    )
  }

  const plan = buildSessionCalendarPlan(session)
  const previousPlan = buildSessionCalendarPlan(previousSession)
  const patchEvent = (requestBody: calendar_v3.Schema$Event) =>
    calendar.events.patch({
      auth: adminAuth,
      calendarId: 'primary',
      eventId,
      sendUpdates: 'all',
      requestBody,
    })

  try {
    await patchEvent(plan.requestBody)
  } catch (error) {
    reportError('schedule:calendar-tutor-change', error, { sessionId: session.id })
    if (isRevokedGoogleTokenError(error)) {
      await clearAdminGoogleConnection()
      throw new SchedulingError(
        'The ScoreMax Google connection has expired, so no changes were saved. Reconnect it in Settings → Integrations, then try again.'
      )
    }
    throw new SchedulingError(
      'Google Calendar could not update the tutor or time, so no changes were saved. Please try again.'
    )
  }

  return {
    updates: {},
    rollbackCalendar: async () => {
      await patchEvent(previousPlan.requestBody)
    },
    sendEmails: () => sendScheduleEmails(session, session.meet_url ?? null, true),
  }
}

type StudentAssignmentCalendarOutcome = {
  updates: Record<string, string | null>
  rollbackCalendar: (() => Promise<void>) | null
  calendarUpdated: boolean
}

/**
 * Update only the student-facing parts of an already-scheduled event. Google
 * sends the added/removed attendee notices; sending a second custom email here
 * would duplicate the same session information.
 */
async function handleScheduledStudentAssignment(
  session: SessionRecord,
  previousSession: SessionRecord
): Promise<StudentAssignmentCalendarOutcome> {
  const adminAuth = await getAdminGoogleAuth()
  if (!adminAuth) {
    throw new SchedulingError(
      'Google Calendar is not connected, so the student could not be changed. Reconnect it in Settings → Integrations, then try again.'
    )
  }

  const eventId = session.tutor_calendar_event_id
  if (!eventId) {
    // A few legacy in-person sessions may have been scheduled without an
    // event. Create one now so the newly assigned student still receives the
    // session information and the account is no longer externally inconsistent.
    const updates = await createSessionEvent(session)
    const createdEventId = updates.tutor_calendar_event_id
    if (!createdEventId) {
      throw new SchedulingError(
        'This scheduled session has no linked Google Calendar event, so the student could not be changed.'
      )
    }
    return {
      updates,
      calendarUpdated: true,
      rollbackCalendar: async () => {
        await calendar.events.delete({
          auth: adminAuth,
          calendarId: 'primary',
          eventId: createdEventId,
          sendUpdates: 'all',
        })
      },
    }
  }

  let existingEvent: calendar_v3.Schema$Event
  try {
    const event = await calendar.events.get({
      auth: adminAuth,
      calendarId: 'primary',
      eventId,
    })
    existingEvent = event.data
  } catch (error) {
    reportError('schedule:calendar-student-load', error, { sessionId: session.id })
    if (isRevokedGoogleTokenError(error)) {
      await clearAdminGoogleConnection()
      throw new SchedulingError(
        'The ScoreMax Google connection has expired, so no changes were saved. Reconnect it in Settings → Integrations, then try again.'
      )
    }
    throw new SchedulingError(
      'Google Calendar could not load this session, so the student was not changed. Please try again.'
    )
  }

  const nextPlan = buildSessionCalendarPlan(session)
  const nextAttendees = replaceManagedStudentAttendee(
    existingEvent.attendees,
    previousSession.students,
    session.students!,
    session.customers,
    session.tutors
  )
  const previousEventFields: calendar_v3.Schema$Event = {
    attendees: existingEvent.attendees ?? [],
    summary: existingEvent.summary ?? null,
    description: existingEvent.description ?? null,
  }
  const patchEvent = (requestBody: calendar_v3.Schema$Event) =>
    calendar.events.patch({
      auth: adminAuth,
      calendarId: 'primary',
      eventId,
      sendUpdates: 'all',
      requestBody,
    })

  try {
    await patchEvent({
      attendees: nextAttendees,
      // Keep the subject and tutor while replacing the student name wherever
      // it appears. Omitting time/conference fields preserves them exactly.
      summary: nextPlan.requestBody.summary,
      description: nextPlan.requestBody.description,
    })
  } catch (error) {
    reportError('schedule:calendar-student-change', error, { sessionId: session.id })
    if (isRevokedGoogleTokenError(error)) {
      await clearAdminGoogleConnection()
      throw new SchedulingError(
        'The ScoreMax Google connection has expired, so no changes were saved. Reconnect it in Settings → Integrations, then try again.'
      )
    }
    throw new SchedulingError(
      'Google Calendar could not update the student, so no changes were saved. Please try again.'
    )
  }

  return {
    updates: {},
    calendarUpdated: true,
    rollbackCalendar: async () => {
      await patchEvent(previousEventFields)
    },
  }
}

async function resolveBoundStudentId(order: AssignmentOrder): Promise<string | null> {
  if (order.course_enrollment_id) {
    const { data } = await supabaseAdmin
      .from('course_enrollments')
      .select('student_id')
      .eq('id', order.course_enrollment_id)
      .maybeSingle()
    return data?.student_id ?? null
  }

  if (order.payment_type === 'package' && order.credit_source_id) {
    const { data } = await supabaseAdmin
      .from('packages')
      .select('student_id')
      .eq('id', order.credit_source_id)
      .maybeSingle()
    return data?.student_id ?? null
  }

  if (order.payment_method === 'step_up' && order.purchase_key) {
    const { data } = await supabaseAdmin
      .from('packages')
      .select('student_id')
      .eq('purchase_key', order.purchase_key)
      .maybeSingle()
    return data?.student_id ?? null
  }

  return null
}

async function sendCompletionEmail(session: SessionRecord) {
  // Purely a review prompt, so the mildest failure of the set — but it was also
  // the only send with no error handling of any kind, not even a try/catch.
  await sendEmail(
    {
      ...getEmailDefaults(),
      to: session.customers.email,
      subject: 'Thank you for choosing ScoreMax',
      html: emailLayout({
        title: 'Session Completed',
        greeting: `Hi ${session.customers.full_name},`,
        body: '<p style="margin: 0;">We hope you had a great session! Please leave us a review.</p>',
        ctaText: 'Book Another Session',
        ctaUrl: `${process.env.NEXT_PUBLIC_APP_URL}/book`,
      }),
    },
    `admin:session-completed:${session.id}`
  )
}

async function handleCancel(session: SessionRecord) {
  const adminAuth = await getAdminGoogleAuth()
  const eventId = session.tutor_calendar_event_id

  const cleared = {
    tutor_calendar_event_id: null,
    student_calendar_event_id: null,
    meet_url: null,
  }

  if (!adminAuth || !eventId) return cleared

  try {
    await calendar.events.delete({
      auth: adminAuth,
      calendarId: 'primary',
      eventId,
      sendUpdates: 'all',
    })
    return cleared
  } catch (e) {
    // 404/410 mean the event is already gone from Google, so clearing our
    // reference to it is correct.
    const status = (e as { code?: number; status?: number })?.code ?? (e as { status?: number })?.status
    if (status === 404 || status === 410) return cleared

    // Any other failure means the invite is probably still live on the
    // attendees' calendars. Keep the event id: wiping it would orphan the
    // event permanently, since nothing would know how to delete it later.
    console.error(
      `Failed to delete calendar event ${eventId} for session ${session.id}; keeping the reference so it can be retried.`,
      e
    )
    throw new SchedulingError(
      'The session could not be cancelled because its Google Calendar event could not be removed. Check the ScoreMax Google connection in Settings → Integrations and try again.'
    )
  }
}

type RescheduleOutcome = {
  calendarUpdated: boolean
  rollbackCalendar: (() => Promise<void>) | null
  sendEmails: () => Promise<boolean>
}

async function handleReschedule(
  session: SessionRecord,
  newStart: string,
  newEnd: string
): Promise<RescheduleOutcome> {
  const adminAuth = await getAdminGoogleAuth()
  const eventId = session.tutor_calendar_event_id
  const previousStart = session.confirmed_start
  const previousEnd = session.confirmed_end

  if (!previousStart || !previousEnd) {
    throw new SchedulingError(
      'This session is missing its previous start or end time, so it cannot be safely rescheduled.'
    )
  }

  // In-person sessions may legitimately have no calendar event if ScoreMax was
  // disconnected when they were first scheduled. The branded emails still
  // make the new time explicit. An online session must never silently drift
  // away from its Meet invitation.
  if (!eventId) {
    if (session.session_type === 'online') {
      throw new SchedulingError(
        'This online session has no linked Google Calendar event, so no changes were saved. Reconnect Google in Settings → Integrations and repair the calendar event before rescheduling.'
      )
    }

    const updatedSession = { ...session, confirmed_start: newStart, confirmed_end: newEnd }
    return {
      calendarUpdated: false,
      rollbackCalendar: null,
      sendEmails: () =>
        sendRescheduleEmails({
          session: updatedSession,
          previousStart,
          previousEnd,
          calendarUpdated: false,
        }),
    }
  }

  if (!adminAuth) {
    throw new SchedulingError(
      'Google Calendar is not connected, so no changes were saved. Reconnect it in Settings → Integrations, then try again.'
    )
  }

  const patchCalendarTime = (start: string, end: string) =>
    calendar.events.patch({
      auth: adminAuth,
      calendarId: 'primary',
      eventId,
      sendUpdates: 'all',
      requestBody: {
        start: { dateTime: new Date(start).toISOString() },
        end: { dateTime: new Date(end).toISOString() },
      },
    })

  try {
    await patchCalendarTime(newStart, newEnd)
  } catch (e) {
    reportError('schedule:calendar-update', e, { sessionId: session.id })
    if (isRevokedGoogleTokenError(e)) {
      await clearAdminGoogleConnection()
      throw new SchedulingError(
        'The ScoreMax Google connection has expired, so no changes were saved. Reconnect it in Settings → Integrations, then try again.'
      )
    }
    throw new SchedulingError(
      'Google Calendar could not be updated, so no changes were saved. Please try again.'
    )
  }

  const updatedSession = { ...session, confirmed_start: newStart, confirmed_end: newEnd }
  return {
    calendarUpdated: true,
    // Google has already notified attendees. If the database write fails, put
    // the event back immediately so the calendar and ScoreMax do not disagree.
    rollbackCalendar: async () => {
      await patchCalendarTime(previousStart, previousEnd)
    },
    sendEmails: () =>
      sendRescheduleEmails({
        session: updatedSession,
        previousStart,
        previousEnd,
        calendarUpdated: true,
      }),
  }
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authError = await requireAdmin()
  if (authError) return authError

  const { id } = await params
  // booking_requests is joined through sessions.order_id so a caller scheduling
  // this session can see the availability the customer actually asked for. The
  // FK makes this a read-path change — nothing is copied onto sessions, so
  // there is no second value to drift.
  const { data, error } = await supabaseAdmin
    .from('sessions')
    .select(`
      *,
      customers (id, email, full_name),
      students (id, email, full_name),
      tutors (id, email, full_name),
      booking_requests!sessions_order_id_fkey (
        available_windows, available_days, available_time_start,
        available_time_end, timezone
      )
    `)
    .eq('id', id)
    .single()

  if (error) {
    // requireAdmin() above already scoped this to admins, so the only way here
    // is a genuinely missing id. Don't hand the caller the Postgres message.
    return NextResponse.json({ error: 'Session not found' }, { status: 404 })
  }
  return NextResponse.json(data)
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authError = await requireAdmin()
  if (authError) return authError

  const adminUser = await getAuthUser()
  if (!adminUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const body = await req.json()
  const { assigned_tutor_id, confirmed_start, confirmed_end, status, internal_notes } = body
  const hasStudentUpdate = Object.prototype.hasOwnProperty.call(body, 'student_id')
  const parsedStudentId = hasStudentUpdate && body.student_id !== null
    ? studentIdSchema.safeParse(body.student_id)
    : null
  if (parsedStudentId && !parsedStudentId.success) {
    return NextResponse.json({ error: 'Invalid student selection' }, { status: 400 })
  }
  const requestedStudentId = hasStudentUpdate
    ? parsedStudentId?.success ? parsedStudentId.data : null
    : undefined

  const { data: currentSession, error: fetchError } = await supabaseAdmin
    .from('sessions')
    .select(`
      *,
      customers (id, email, full_name),
      students (id, email, full_name),
      tutors (id, email, full_name),
      booking_requests!sessions_order_id_fkey (
        id, customer_id, student_id, payment_method, payment_type,
        course_enrollment_id, credit_source_id, purchase_key
      )
    `)
    .eq('id', id)
    .single()

  if (fetchError || !currentSession) {
    return NextResponse.json({ error: 'Session not found' }, { status: 404 })
  }

  const currentStudentId = currentSession.student_id as string | null
  const studentChanged = hasStudentUpdate && requestedStudentId !== currentStudentId
  let nextStudent = currentSession.students as SessionPerson | null
  const assignmentOrder = currentSession.booking_requests as unknown as AssignmentOrder | null

  if (studentChanged) {
    if (!requestedStudentId) {
      return NextResponse.json(
        { error: 'A student assignment cannot be cleared. Choose another active student instead.' },
        { status: 400 }
      )
    }
    if (!assignmentOrder || !currentSession.order_id) {
      return NextResponse.json(
        { error: 'This session has no linked order, so its student cannot be changed safely.' },
        { status: 400 }
      )
    }
    if (
      assignmentOrder.customer_id !== currentSession.customer_id ||
      assignmentOrder.student_id !== currentStudentId
    ) {
      return NextResponse.json(
        { error: 'The session and order do not currently match. Repair their identity before assigning a student.' },
        { status: 409 }
      )
    }

    const { data: ownedStudent, error: studentError } = await supabaseAdmin
      .from('students')
      .select('id, customer_id, email, full_name, grade, is_active')
      .eq('id', requestedStudentId)
      .eq('customer_id', currentSession.customer_id)
      .eq('is_active', true)
      .maybeSingle()
    if (studentError) {
      return NextResponse.json({ error: 'Could not verify the selected student' }, { status: 500 })
    }
    if (!ownedStudent) {
      return NextResponse.json(
        { error: 'Choose an active student belonging to this account.' },
        { status: 400 }
      )
    }

    const boundStudentId = await resolveBoundStudentId(assignmentOrder)
    const policy = studentAssignmentPolicy({
      currentStudentId,
      nextStudentId: requestedStudentId,
      paymentMethod: assignmentOrder.payment_method,
      paymentType: assignmentOrder.payment_type,
      courseEnrollmentId: assignmentOrder.course_enrollment_id,
      boundStudentId,
    })
    if (!policy.allowed) {
      return NextResponse.json({ error: policy.message, code: policy.code }, { status: 409 })
    }
    nextStudent = ownedStudent
  }

  // Attached once, here, so every scheduling path below inherits it — including
  // the reassign branch, which spreads currentSession into `merged`.
  currentSession.subjectNames = await resolveSubjectNames(currentSession.subjects)

  let updates: Record<string, unknown> = {
    assigned_tutor_id,
    confirmed_start,
    confirmed_end,
    status,
    internal_notes,
  }

  const newStatus = status
  const oldStatus = currentSession.status
  const statusUnchanged = !newStatus || newStatus === oldStatus
  const timesChanged =
    (confirmed_start !== undefined && confirmed_start !== currentSession.confirmed_start) ||
    (confirmed_end !== undefined && confirmed_end !== currentSession.confirmed_end)
  const tutorChanged =
    assigned_tutor_id !== undefined && assigned_tutor_id !== currentSession.assigned_tutor_id

  // A scheduled attendee change is externally sensitive. Keep it as one clear
  // operation so its Google rollback maps to one atomic identity transaction.
  if (
    studentChanged &&
    oldStatus === 'scheduled' &&
    (!statusUnchanged || tutorChanged || timesChanged)
  ) {
    return NextResponse.json(
      { error: 'Save the student change first, then update the tutor, time, or status in a separate save.' },
      { status: 400 }
    )
  }

  // Queued until the database write succeeds — see ScheduleOutcome.
  let pendingEmails: (() => Promise<void | boolean>) | null = null
  let rollbackExternalChange: (() => Promise<void>) | null = null
  let rescheduleCalendarUpdated: boolean | null = null
  let studentAssignmentCalendarUpdated: boolean | null = studentChanged ? false : null

  try {
    if (newStatus && newStatus !== oldStatus) {
      // Any transition INTO 'scheduled' needs a calendar event, not only from
      // 'pending_scheduling'. Rescheduling a cancelled or completed session
      // previously flipped the status with no event created and no one told,
      // and cancelling clears the event id, so a fresh event is correct here.
      if (newStatus === 'scheduled' && oldStatus !== 'scheduled') {
        if (!updates.assigned_tutor_id || !updates.confirmed_start || !updates.confirmed_end) {
          return NextResponse.json(
            { error: 'Cannot schedule without tutor and confirmed time' },
            { status: 400 }
          )
        }

        const merged = {
          ...currentSession,
          ...updates,
          ...(studentChanged ? { students: nextStudent } : {}),
        }
        if (updates.assigned_tutor_id !== currentSession.assigned_tutor_id) {
          const { data: newTutor } = await supabaseAdmin
            .from('tutors')
            .select('id, email, full_name')
            .eq('id', updates.assigned_tutor_id)
            .single()
          if (newTutor) merged.tutors = newTutor
        }

        const outcome = await handleSchedule(merged)
        updates = { ...updates, ...outcome.updates }
        rollbackExternalChange = outcome.rollbackCalendar
        pendingEmails = outcome.sendEmails
        if (studentChanged) studentAssignmentCalendarUpdated = Boolean(outcome.updates.tutor_calendar_event_id)
      }

      if (newStatus === 'completed') {
        const completed = { ...currentSession, ...updates }
        if (!studentChanged) pendingEmails = () => sendCompletionEmail(completed)
      }

      if (newStatus === 'cancelled') {
        const cancelUpdates = await handleCancel(currentSession)
        updates = { ...updates, ...cancelUpdates }
        if (!studentChanged) pendingEmails = () => sendCancellationEmails(currentSession)
      }
    }

    if (statusUnchanged && oldStatus === 'scheduled' && studentChanged) {
      const merged = {
        ...currentSession,
        ...updates,
        students: nextStudent,
      }
      const outcome = await handleScheduledStudentAssignment(merged, currentSession)
      updates = { ...updates, ...outcome.updates }
      rollbackExternalChange = outcome.rollbackCalendar
      studentAssignmentCalendarUpdated = outcome.calendarUpdated
      // Google sendUpdates=all provides the incoming invitation and removes
      // the former student. Do not send a duplicate custom confirmation.
      pendingEmails = null
    } else if (statusUnchanged && oldStatus === 'scheduled' && tutorChanged) {
      const merged = {
        ...currentSession,
        ...updates,
        confirmed_start: confirmed_start || currentSession.confirmed_start,
        confirmed_end: confirmed_end || currentSession.confirmed_end,
      }
      // Read before the line below overwrites it: right now `currentSession
      // .tutors` is the tutor being taken *off* the session, and once
      // `merged.tutors` becomes the incoming one there is no longer anywhere to
      // find them. Nullable, because assigned_tutor_id is — a session that had
      // no tutor has nobody to tell.
      const previousTutor = currentSession.tutors as SessionPerson | null
      const previousStart = currentSession.confirmed_start as string | null

      const { data: newTutor } = await supabaseAdmin
        .from('tutors')
        .select('id, email, full_name')
        .eq('id', assigned_tutor_id)
        .single()
      if (newTutor) merged.tutors = newTutor

      // The reassign patch carries the merged start/end too, so a separate
      // reschedule call is unnecessary even when times changed together.
      const outcome = await handleReassign(merged, currentSession)
      updates = { ...updates, ...outcome.updates }
      rollbackExternalChange = outcome.rollbackCalendar

      // Same id on both sides means nobody actually lost the session: either a
      // self-reassign that `tutorChanged` should already have excluded, or the
      // tutors lookup above came back empty and `merged.tutors` is still the
      // outgoing tutor — in which case the "New Session Assigned" mail is
      // already going to them and a "you have lost it" beside it would be
      // nonsense. Send nothing either way.
      const notifyOutgoing =
        previousTutor?.email && previousTutor.id !== (merged.tutors as SessionPerson | null)?.id
          ? previousTutor
          : null

      pendingEmails = async () => {
        let delivered = await outcome.sendEmails()
        if (notifyOutgoing) {
          delivered =
            (await sendUnassignedEmail({
              tutor: notifyOutgoing,
              studentName: sessionStudentName(currentSession),
              startsAt: previousStart,
              sessionId: id,
            })) && delivered
        }
        return delivered
      }
    } else if (statusUnchanged && oldStatus === 'scheduled' && timesChanged) {
      const outcome = await handleReschedule(
        currentSession,
        confirmed_start || currentSession.confirmed_start,
        confirmed_end || currentSession.confirmed_end
      )
      rescheduleCalendarUpdated = outcome.calendarUpdated
      rollbackExternalChange = outcome.rollbackCalendar
      pendingEmails = outcome.sendEmails
    }
  } catch (error) {
    if (error instanceof SchedulingError) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    // buildSessionCalendarPlan rejects a session with no usable start/end
    // rather than letting it become the 1970 epoch on Google's calendar.
    const message = error instanceof Error ? error.message : ''
    if (message.startsWith('session_missing_') || message === 'session_end_not_after_start') {
      return NextResponse.json(
        { error: 'This session needs a valid start and end time before it can be scheduled.' },
        { status: 400 }
      )
    }
    throw error
  }

  const persisted = studentChanged
    ? await supabaseAdmin
        .rpc('assign_admin_session_student', {
          p_session_id: id,
          p_expected_student_id: currentStudentId,
          p_new_student_id: requestedStudentId!,
          p_admin_profile_id: adminUser.id,
          p_assigned_tutor_id:
            updates.assigned_tutor_id === undefined
              ? currentSession.assigned_tutor_id
              : updates.assigned_tutor_id,
          p_confirmed_start:
            updates.confirmed_start === undefined
              ? currentSession.confirmed_start
              : updates.confirmed_start,
          p_confirmed_end:
            updates.confirmed_end === undefined
              ? currentSession.confirmed_end
              : updates.confirmed_end,
          p_status: updates.status === undefined ? currentSession.status : updates.status,
          p_internal_notes:
            updates.internal_notes === undefined
              ? currentSession.internal_notes
              : updates.internal_notes,
          p_tutor_calendar_event_id:
            updates.tutor_calendar_event_id === undefined
              ? currentSession.tutor_calendar_event_id
              : updates.tutor_calendar_event_id,
          p_student_calendar_event_id:
            updates.student_calendar_event_id === undefined
              ? currentSession.student_calendar_event_id
              : updates.student_calendar_event_id,
          p_meet_url: updates.meet_url === undefined ? currentSession.meet_url : updates.meet_url,
        })
        .single()
    : await supabaseAdmin
        .from('sessions')
    .update(updates)
        .eq('id', id)
        .select()
        .single()

  const { data, error } = persisted

  if (error) {
    console.error(`Failed to persist session ${id}:`, error.message)
    if (rollbackExternalChange) {
      try {
        await rollbackExternalChange()
      } catch (rollbackError) {
        reportError('schedule:calendar-rollback', rollbackError, { sessionId: id })
        return NextResponse.json(
          {
            error:
              'The session could not be saved, and its calendar event may need manual review. Please check Google Calendar before trying again.',
          },
          { status: 500 }
        )
      }
    }
    const knownAssignmentErrors: Record<string, string> = {
      session_assignment_conflict:
        'This session changed while you were editing it. Refresh and try again.',
      student_not_active_or_owned:
        'Choose an active student belonging to this account.',
      step_up_student_reassignment_blocked:
        'This Step Up session is tied to the original student. Contact support before moving it to another child.',
      course_student_reassignment_blocked:
        'This course session is tied to the enrolled student. Change the enrollment before moving this session.',
      course_assignment_missing_enrollment:
        'This course order is missing its enrollment link. Repair the enrollment before assigning a student.',
      step_up_package_grant_missing:
        'This Step Up package is missing its student credit record. Repair the package before assigning a student.',
      student_bound_credit_reassignment_blocked:
        'This session used student-specific credits. It can only remain assigned to the student who owns those credits.',
      session_order_identity_mismatch:
        'The session and order do not currently match. Repair their identity before assigning a student.',
    }
    const assignmentMessage = Object.entries(knownAssignmentErrors)
      .find(([code]) => error.message.includes(code))?.[1]
    return NextResponse.json(
      { error: assignmentMessage ?? 'Could not save the session' },
      { status: assignmentMessage ? 409 : 500 }
    )
  }

  // Only now that the change is durable. A failure here is logged rather than
  // surfaced: the session IS scheduled, and returning an error would invite the
  // admin to retry and create a duplicate calendar event.
  let notificationWarning: string | null = null
  if (pendingEmails) {
    try {
      const delivered = await pendingEmails()
      if (delivered === false) {
        notificationWarning = rescheduleCalendarUpdated
          ? 'The session was saved and Google Calendar was updated, but one or more confirmation emails could not be delivered.'
          : 'The session was saved, but one or more confirmation emails could not be delivered.'
      }
    } catch (emailError) {
      console.error(`Session ${id} saved but notification emails failed:`, emailError)
      notificationWarning = rescheduleCalendarUpdated
        ? 'The session was saved and Google Calendar was updated, but the confirmation emails could not be sent.'
        : 'The session was saved, but the confirmation emails could not be sent.'
    }
  }

  return NextResponse.json({
    ...data,
    ...(studentAssignmentCalendarUpdated !== null
      ? {
          student_assignment: {
            calendar_updated: studentAssignmentCalendarUpdated,
            notifications: studentAssignmentCalendarUpdated ? 'google_calendar' : 'none',
          },
        }
      : {}),
    ...(rescheduleCalendarUpdated !== null
      ? {
          reschedule: {
            calendar_updated: rescheduleCalendarUpdated,
            notifications_sent: !notificationWarning,
          },
        }
      : {}),
    ...(notificationWarning ? { warning: notificationWarning } : {}),
  })
}
