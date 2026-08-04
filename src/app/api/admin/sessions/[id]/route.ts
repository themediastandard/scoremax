import { NextRequest, NextResponse } from 'next/server'
import { type calendar_v3 } from 'googleapis'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { sendEmail, getEmailDefaults } from '@/lib/resend'
import { emailLayout, detailRow } from '@/lib/email-templates'
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
) {
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
   * visible. Note these two fire back to back, which is exactly the shape that
   * trips Resend's 2-requests-per-second default.
   */
  await sendEmail(
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

  await sendEmail(
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
}

// Calendar work happens now (so a failure aborts the whole change with a 400
// and nothing is persisted), but the emails are returned as a deferred callback
// for the caller to run *after* the database write succeeds. Previously both
// fired first, so a failed write left the attendees holding an invite and a
// confirmation email for a session the database did not record as scheduled.
type ScheduleOutcome = {
  updates: Record<string, string | null>
  sendEmails: () => Promise<void>
}

async function handleSchedule(session: SessionRecord): Promise<ScheduleOutcome> {
  const updates = await createSessionEvent(session)
  return {
    updates,
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
async function handleReassign(session: SessionRecord): Promise<ScheduleOutcome> {
  const adminAuth = await getAdminGoogleAuth()
  const eventId = session.tutor_calendar_event_id

  if (!adminAuth || !eventId) {
    return handleSchedule(session)
  }

  const plan = buildSessionCalendarPlan(session)
  try {
    await calendar.events.patch({
      auth: adminAuth,
      calendarId: 'primary',
      eventId,
      sendUpdates: 'all',
      requestBody: plan.requestBody,
    })
  } catch (error) {
    reportError('schedule:calendar-tutor-change', error, { sessionId: session.id })
  }
  return {
    updates: {},
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

async function handleReschedule(session: SessionRecord, newStart: string, newEnd: string) {
  const adminAuth = await getAdminGoogleAuth()
  const eventId = session.tutor_calendar_event_id
  if (!adminAuth || !eventId) return

  try {
    await calendar.events.patch({
      auth: adminAuth,
      calendarId: 'primary',
      eventId,
      sendUpdates: 'all',
      requestBody: {
        start: { dateTime: new Date(newStart).toISOString() },
        end: { dateTime: new Date(newEnd).toISOString() },
      },
    })
  } catch (e) {
    reportError('schedule:calendar-update', e, { sessionId: session.id })
  }
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authError = await requireAdmin()
  if (authError) return authError

  const { id } = await params
  const { data, error } = await supabaseAdmin
    .from('sessions')
    .select(`
      *,
      customers (id, email, full_name),
      tutors (id, email, full_name)
    `)
    .eq('id', id)
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 404 })
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
  let pendingEmails: (() => Promise<void>) | null = null

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
      const { data: newTutor } = await supabaseAdmin
        .from('tutors')
        .select('id, email, full_name')
        .eq('id', assigned_tutor_id)
        .single()
      if (newTutor) merged.tutors = newTutor

      // The reassign patch carries the merged start/end too, so a separate
      // reschedule call is unnecessary even when times changed together.
      const outcome = await handleReassign(merged)
      updates = { ...updates, ...outcome.updates }
      pendingEmails = outcome.sendEmails
    } else if (statusUnchanged && oldStatus === 'scheduled' && timesChanged) {
      await handleReschedule(
        currentSession,
        confirmed_start || currentSession.confirmed_start,
        confirmed_end || currentSession.confirmed_end
      )
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
    return NextResponse.json({ error: 'Could not save the session' }, { status: 500 })
  }

  // Only now that the change is durable. A failure here is logged rather than
  // surfaced: the session IS scheduled, and returning an error would invite the
  // admin to retry and create a duplicate calendar event.
  if (pendingEmails) {
    try {
      await pendingEmails()
    } catch (emailError) {
      console.error(`Session ${id} saved but notification emails failed:`, emailError)
    }
  }

  return NextResponse.json(data)
}
