import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { resend, getEmailDefaults } from '@/lib/resend'
import { emailLayout, detailRow } from '@/lib/email-templates'
import { calendar } from '@/lib/google-calendar'
import { google } from 'googleapis'

const getAuthClient = (refreshToken: string) => {
  const client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    `${process.env.NEXT_PUBLIC_APP_URL}/api/google/callback`
  )
  client.setCredentials({ refresh_token: refreshToken })
  return client
}

async function handleSchedule(session: any) {
  const updates: Record<string, string | null> = {}
  const startTime = new Date(session.confirmed_start)
  const endTime = new Date(session.confirmed_end)
  const isOnline = session.session_type === 'online'

  const meetConference = isOnline ? {
    conferenceData: {
      createRequest: {
        requestId: `scoremax-session-${session.id}`,
        conferenceSolutionKey: { type: 'hangoutsMeet' }
      }
    }
  } : {}

  const eventBody = {
    summary: `ScoreMax: ${isOnline ? 'Online' : 'In-Person'} Session`,
    description: `Student: ${session.customers.full_name}\nTutor: ${session.tutors.full_name}\nLocation: ${isOnline ? 'Online (Google Meet)' : 'Sawgrass, FL'}`,
    start: { dateTime: startTime.toISOString() },
    end: { dateTime: endTime.toISOString() },
  }

  if (session.tutors?.google_refresh_token) {
    try {
      const tutorAuth = getAuthClient(session.tutors.google_refresh_token)
      const event = await calendar.events.insert({
        auth: tutorAuth,
        calendarId: 'primary',
        conferenceDataVersion: isOnline ? 1 : 0,
        requestBody: {
          ...eventBody,
          ...meetConference,
          summary: `ScoreMax Session: ${session.customers.full_name}`
        }
      })
      updates.tutor_calendar_event_id = event.data.id ?? null
      if (event.data.hangoutLink) {
        updates.meet_url = event.data.hangoutLink
      }
    } catch (error) {
      console.error('Failed to create tutor calendar event', error)
    }
  }

  if (session.customers?.google_refresh_token) {
    try {
      const studentAuth = getAuthClient(session.customers.google_refresh_token)
      const studentEventBody = { ...eventBody, summary: `ScoreMax Session: ${session.tutors.full_name}` }
      if (updates.meet_url) {
        studentEventBody.description += `\n\nGoogle Meet: ${updates.meet_url}`
      }
      const event = await calendar.events.insert({
        auth: studentAuth,
        calendarId: 'primary',
        conferenceDataVersion: isOnline ? 1 : 0,
        requestBody: { ...studentEventBody, ...meetConference },
      })
      updates.student_calendar_event_id = event.data.id ?? null
    } catch (error) {
      console.error('Failed to create student calendar event', error)
    }
  }

  const locationText = isOnline
    ? `Online (Google Meet)${updates.meet_url ? ` - <a href="${updates.meet_url}">Join Meeting</a>` : ''}`
    : 'Sawgrass, FL'

  await resend.emails.send({
    ...getEmailDefaults(),
    to: session.customers.email,
    subject: 'Session Confirmed: Your session is scheduled',
    html: emailLayout({
      title: 'Session Confirmed',
      greeting: `Hi ${session.customers.full_name},`,
      body: [
        '<p style="margin: 0 0 16px 0;">Your tutoring session has been confirmed!</p>',
        detailRow('Tutor:', session.tutors.full_name),
        detailRow('Time:', startTime.toLocaleString()),
        detailRow('Location:', locationText),
      ].join(''),
    }),
  })

  await resend.emails.send({
    ...getEmailDefaults(),
    to: session.tutors.email,
    subject: 'New Session Assigned',
    html: emailLayout({
      title: 'New Session Assigned',
      greeting: `Hi ${session.tutors.full_name},`,
      body: [
        '<p style="margin: 0 0 16px 0;">You have been assigned a new session.</p>',
        detailRow('Student:', session.customers.full_name),
        detailRow('Time:', startTime.toLocaleString()),
        detailRow('Location:', locationText),
      ].join(''),
    }),
  })

  return updates
}

async function handleComplete(session: any) {
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

async function handleCancel(session: any) {
  if (session.tutor_calendar_event_id && session.tutors?.google_refresh_token) {
    try {
      const tutorAuth = getAuthClient(session.tutors.google_refresh_token)
      await calendar.events.delete({
        auth: tutorAuth,
        calendarId: 'primary',
        eventId: session.tutor_calendar_event_id
      })
    } catch (e) { console.error('Error deleting tutor calendar event:', e) }
  }

  if (session.student_calendar_event_id && session.customers?.google_refresh_token) {
    try {
      const studentAuth = getAuthClient(session.customers.google_refresh_token)
      await calendar.events.delete({
        auth: studentAuth,
        calendarId: 'primary',
        eventId: session.student_calendar_event_id
      })
    } catch (e) { console.error('Error deleting student calendar event:', e) }
  }

  return {
    tutor_calendar_event_id: null,
    student_calendar_event_id: null,
    meet_url: null,
  }
}

async function handleReschedule(session: any, newStart: string, newEnd: string) {
  const startTime = new Date(newStart)
  const endTime = new Date(newEnd)

  if (session.tutor_calendar_event_id && session.tutors?.google_refresh_token) {
    try {
      const tutorAuth = getAuthClient(session.tutors.google_refresh_token)
      await calendar.events.patch({
        auth: tutorAuth,
        calendarId: 'primary',
        eventId: session.tutor_calendar_event_id,
        requestBody: {
          start: { dateTime: startTime.toISOString() },
          end: { dateTime: endTime.toISOString() },
        }
      })
    } catch (e) { console.error('Failed to update tutor calendar event', e) }
  }

  if (session.student_calendar_event_id && session.customers?.google_refresh_token) {
    try {
      const studentAuth = getAuthClient(session.customers.google_refresh_token)
      await calendar.events.patch({
        auth: studentAuth,
        calendarId: 'primary',
        eventId: session.student_calendar_event_id,
        requestBody: {
          start: { dateTime: startTime.toISOString() },
          end: { dateTime: endTime.toISOString() },
        }
      })
    } catch (e) { console.error('Failed to update student calendar event', e) }
  }
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = await params
  const { data, error } = await supabaseAdmin
    .from('sessions')
    .select(`
      *,
      customers (id, email, full_name, google_refresh_token),
      tutors (id, email, full_name, google_refresh_token)
    `)
    .eq('id', id)
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 404 })
  }
  return NextResponse.json(data)
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = await params
  const body = await req.json()
  const { assigned_tutor_id, confirmed_start, confirmed_end, status, internal_notes } = body

  const { data: currentSession, error: fetchError } = await supabaseAdmin
    .from('sessions')
    .select(`
      *,
      customers (id, email, full_name, google_refresh_token),
      tutors (id, email, full_name, google_refresh_token)
    `)
    .eq('id', id)
    .single()

  if (fetchError || !currentSession) {
    return NextResponse.json({ error: 'Session not found' }, { status: 404 })
  }

  let updates: Record<string, any> = {
    assigned_tutor_id,
    confirmed_start,
    confirmed_end,
    status,
    internal_notes,
  }

  const newStatus = status
  const oldStatus = currentSession.status

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
          .select('id, email, full_name, google_refresh_token')
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

  if (statusUnchanged && oldStatus === 'scheduled' && timesChanged) {
    await handleReschedule(
      currentSession,
      confirmed_start || currentSession.confirmed_start,
      confirmed_end || currentSession.confirmed_end
    )
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
