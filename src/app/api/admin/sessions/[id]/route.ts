import { NextRequest, NextResponse } from 'next/server'
import { type calendar_v3 } from 'googleapis'
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
import { requireAdmin } from '@/lib/auth'
import { reportError } from '@/lib/report-error'
import {
  buildSessionCalendarPlan,
  getMeetConferenceRequest,
} from '@/lib/session-calendar'

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
  tutors: SessionPerson
  [key: string]: unknown
}

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
  const customerOk = await sendEmail(
    {
      ...getEmailDefaults(),
      to: session.customers.email,
      subject: 'Session Confirmed: Your session is scheduled',
      html: emailLayout({
        title: 'Session Confirmed',
        greeting: `Hi ${session.customers.full_name},`,
        body: [
          `<p style="margin: 0 0 16px 0;">Your tutoring session has been confirmed!${inviteLine}</p>`,
          detailRow('Tutor:', session.tutors.full_name),
          detailRow('Time:', startTime),
          detailRow('Location:', locationText),
        ].join(''),
      }),
    },
    `admin:session-confirmed:customer:${session.id}`
  )

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
          detailRow('Student:', session.customers.full_name),
          detailRow('Time:', startTime),
          detailRow('Location:', locationText),
        ].join(''),
      }),
    },
    `admin:session-confirmed:tutor:${session.id}`
  )

  return customerOk && tutorOk
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

  const customerMessage = sessionRescheduledEmail({
    ...shared,
    recipient: 'student',
    recipientName: session.customers.full_name,
    counterpartName: session.tutors.full_name,
  })
  const customerOk = await sendEmail(
    { ...getEmailDefaults(), to: session.customers.email, ...customerMessage },
    `admin:session-rescheduled:customer:${session.id}`
  )

  const tutorMessage = sessionRescheduledEmail({
    ...shared,
    recipient: 'tutor',
    recipientName: session.tutors.full_name,
    counterpartName: session.customers.full_name,
  })
  const tutorOk = await sendEmail(
    { ...getEmailDefaults(), to: session.tutors.email, ...tutorMessage },
    `admin:session-rescheduled:tutor:${session.id}`
  )

  return customerOk && tutorOk
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

  const { id } = await params
  const body = await req.json()
  const { assigned_tutor_id, confirmed_start, confirmed_end, status, internal_notes } = body

  const { data: currentSession, error: fetchError } = await supabaseAdmin
    .from('sessions')
    .select(`
      *,
      customers (id, email, full_name),
      tutors (id, email, full_name)
    `)
    .eq('id', id)
    .single()

  if (fetchError || !currentSession) {
    return NextResponse.json({ error: 'Session not found' }, { status: 404 })
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

  // Queued until the database write succeeds — see ScheduleOutcome.
  let pendingEmails: (() => Promise<void | boolean>) | null = null
  let rollbackExternalChange: (() => Promise<void>) | null = null
  let rescheduleCalendarUpdated: boolean | null = null

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

        const merged = { ...currentSession, ...updates }
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
      }

      if (newStatus === 'completed') {
        const completed = { ...currentSession, ...updates }
        pendingEmails = () => sendCompletionEmail(completed)
      }

      if (newStatus === 'cancelled') {
        const cancelUpdates = await handleCancel(currentSession)
        updates = { ...updates, ...cancelUpdates }
      }
    }

    const statusUnchanged = !newStatus || newStatus === oldStatus
    const timesChanged =
      (confirmed_start && confirmed_start !== currentSession.confirmed_start) ||
      (confirmed_end && confirmed_end !== currentSession.confirmed_end)
    const tutorChanged =
      assigned_tutor_id &&
      assigned_tutor_id !== currentSession.assigned_tutor_id

    if (statusUnchanged && oldStatus === 'scheduled' && tutorChanged) {
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
              studentName: (currentSession.customers as SessionPerson | null)?.full_name,
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

  const { data, error } = await supabaseAdmin
    .from('sessions')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

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
    return NextResponse.json({ error: 'Could not save the session' }, { status: 500 })
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
