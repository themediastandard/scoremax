import { NextRequest, NextResponse } from 'next/server'
import { type calendar_v3 } from 'googleapis'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { resend, getEmailDefaults } from '@/lib/resend'
import { emailLayout, detailRow } from '@/lib/email-templates'
import { calendar } from '@/lib/google-calendar'
import { getAdminGoogleAuth } from '@/lib/google-admin'
import { requireAdmin } from '@/lib/auth'
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
    console.error('Failed to create session calendar event', error)
    if (plan.isOnline) {
      throw new SchedulingError(
        'Could not create the Google Meet for this session. Check the ScoreMax Google connection in Settings → Integrations and try again.'
      )
    }
  }

  return updates
}

async function sendScheduleEmails(session: SessionRecord, meetUrl: string | null) {
  const startTime = new Date(session.confirmed_start ?? '')
  const isOnline = session.session_type === 'online'
  const locationText = isOnline
    ? `Online (Google Meet)${meetUrl ? ` - <a href="${meetUrl}">Join Meeting</a>` : ''}`
    : 'Sawgrass, FL'

  try {
    await resend.emails.send({
      ...getEmailDefaults(),
      to: session.customers.email,
      subject: 'Session Confirmed: Your session is scheduled',
      html: emailLayout({
        title: 'Session Confirmed',
        greeting: `Hi ${session.customers.full_name},`,
        body: [
          '<p style="margin: 0 0 16px 0;">Your tutoring session has been confirmed! A calendar invite is on its way to your inbox.</p>',
          detailRow('Tutor:', session.tutors.full_name),
          detailRow('Time:', startTime.toLocaleString()),
          detailRow('Location:', locationText),
        ].join(''),
      }),
    })
  } catch (emailError) {
    console.error('Failed to send student schedule notification:', emailError)
  }

  try {
    await resend.emails.send({
      ...getEmailDefaults(),
      to: session.tutors.email,
      subject: 'New Session Assigned',
      html: emailLayout({
        title: 'New Session Assigned',
        greeting: `Hi ${session.tutors.full_name},`,
        body: [
          '<p style="margin: 0 0 16px 0;">You have been assigned a new session. A calendar invite is on its way to your inbox.</p>',
          detailRow('Student:', session.customers.full_name),
          detailRow('Time:', startTime.toLocaleString()),
          detailRow('Location:', locationText),
        ].join(''),
      }),
    })
  } catch (emailError) {
    console.error('Failed to send tutor schedule notification:', emailError)
  }
}

async function handleSchedule(session: SessionRecord) {
  const updates = await createSessionEvent(session)
  await sendScheduleEmails(session, updates.meet_url ?? null)
  return updates
}

// Tutor changed on an already-scheduled session: patch the existing event's
// attendees (Google notifies the removed tutor, invites the new one) and keep
// the same Meet link. Falls back to creating a fresh event if none exists.
async function handleReassign(session: SessionRecord) {
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
    console.error('Failed to update calendar event for tutor change', error)
  }
  await sendScheduleEmails(session, session.meet_url ?? null)
  return {}
}

async function handleComplete(session: SessionRecord) {
  await resend.emails.send({
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
  })
}

async function handleCancel(session: SessionRecord) {
  const adminAuth = await getAdminGoogleAuth()
  const eventId = session.tutor_calendar_event_id

  if (adminAuth && eventId) {
    try {
      await calendar.events.delete({
        auth: adminAuth,
        calendarId: 'primary',
        eventId,
        sendUpdates: 'all',
      })
    } catch (e) {
      console.error('Error deleting session calendar event:', e)
    }
  }

  return {
    tutor_calendar_event_id: null,
    student_calendar_event_id: null,
    meet_url: null,
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
    console.error('Failed to update session calendar event', e)
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

  let updates: Record<string, unknown> = {
    assigned_tutor_id,
    confirmed_start,
    confirmed_end,
    status,
    internal_notes,
  }

  const newStatus = status
  const oldStatus = currentSession.status

  try {
    if (newStatus && newStatus !== oldStatus) {
      if (newStatus === 'scheduled' && oldStatus === 'pending_scheduling') {
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

        const calendarUpdates = await handleSchedule(merged)
        updates = { ...updates, ...calendarUpdates }
      }

      if (newStatus === 'completed') {
        await handleComplete({ ...currentSession, ...updates })
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
      const reassignUpdates = await handleReassign(merged)
      updates = { ...updates, ...reassignUpdates }
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
    throw error
  }

  const { data, error } = await supabaseAdmin
    .from('sessions')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}
