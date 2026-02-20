import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { resend, getEmailDefaults } from '@/lib/resend'
import { emailLayout, detailRow } from '@/lib/email-templates'
import { calendar } from '@/lib/google-calendar'
import { google } from 'googleapis'
import { stripe } from '@/lib/stripe'

// Helper to get auth client
const getAuthClient = (refreshToken: string) => {
  const client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    `${process.env.NEXT_PUBLIC_APP_URL}/api/google/callback`
  )
  client.setCredentials({ refresh_token: refreshToken })
  return client
}

async function handleStatusChange(booking: any, newStatus: string) {
  const updates: any = {}

  // 1. Processing -> Active
  if (booking.status === 'processing' && newStatus === 'active') {
    if (!booking.assigned_tutor_id || !booking.confirmed_start || !booking.confirmed_end) {
      throw new Error('Cannot activate booking without tutor and confirmed time')
    }

    const startTime = new Date(booking.confirmed_start)
    const endTime = new Date(booking.confirmed_end)

    const isOnline = booking.session_type === 'online'
    const meetConference = isOnline ? {
      conferenceData: {
        createRequest: {
          requestId: `scoremax-${booking.id}`,
          conferenceSolutionKey: { type: 'hangoutsMeet' }
        }
      }
    } : {}

    const eventBody = {
      summary: `ScoreMax: ${isOnline ? 'Online' : 'In-Person'} Session`,
      description: `Student: ${booking.customers.full_name}\nTutor: ${booking.tutors.full_name}\nLocation: ${isOnline ? 'Online (Google Meet)' : 'Sawgrass, FL'}`,
      start: { dateTime: startTime.toISOString() },
      end: { dateTime: endTime.toISOString() },
    }

    // Tutor Calendar (creates the Meet link for online sessions)
    if (booking.tutors?.google_refresh_token) {
      try {
        const tutorAuth = getAuthClient(booking.tutors.google_refresh_token)
        const event = await calendar.events.insert({
          auth: tutorAuth,
          calendarId: 'primary',
          conferenceDataVersion: isOnline ? 1 : 0,
          requestBody: {
            ...eventBody,
            ...meetConference,
            summary: `ScoreMax Session: ${booking.customers.full_name}`
          }
        })
        updates.tutor_calendar_event_id = event.data.id
        if (event.data.hangoutLink) {
          updates.meet_url = event.data.hangoutLink
        }
      } catch (error) {
        console.error('Failed to create tutor calendar event', error)
      }
    }

    // Student Calendar (includes Meet link if one was created)
    if (booking.customers?.google_refresh_token) {
      try {
        const studentAuth = getAuthClient(booking.customers.google_refresh_token)
        const studentEventBody = { ...eventBody, summary: `ScoreMax Session: ${booking.tutors.full_name}` }
        if (updates.meet_url) {
          studentEventBody.description += `\n\nGoogle Meet: ${updates.meet_url}`
        }
        const event = await calendar.events.insert({
          auth: studentAuth,
          calendarId: 'primary',
          conferenceDataVersion: isOnline ? 1 : 0,
          requestBody: {
            ...studentEventBody,
            ...meetConference,
          }
        })
        updates.student_calendar_event_id = event.data.id
      } catch (error) {
        console.error('Failed to create student calendar event', error)
      }
    }

    const locationText = isOnline
      ? `Online (Google Meet)${updates.meet_url ? ` - <a href="${updates.meet_url}">Join Meeting</a>` : ''}`
      : 'Sawgrass, FL'

    await resend.emails.send({
      ...getEmailDefaults(),
      to: booking.customers.email,
      subject: 'Booking Confirmed: Your session is scheduled',
      html: emailLayout({
        title: 'Session Confirmed',
        greeting: `Hi ${booking.customers.full_name},`,
        body: [
          '<p style="margin: 0 0 16px 0;">Your tutoring session has been confirmed!</p>',
          detailRow('Tutor:', booking.tutors.full_name),
          detailRow('Time:', startTime.toLocaleString()),
          detailRow('Location:', locationText),
        ].join(''),
      }),
    })

    await resend.emails.send({
      ...getEmailDefaults(),
      to: booking.tutors.email,
      subject: 'New Session Assigned',
      html: emailLayout({
        title: 'New Session Assigned',
        greeting: `Hi ${booking.tutors.full_name},`,
        body: [
          '<p style="margin: 0 0 16px 0;">You have been assigned a new session.</p>',
          detailRow('Student:', booking.customers.full_name),
          detailRow('Time:', startTime.toLocaleString()),
          detailRow('Location:', locationText),
        ].join(''),
      }),
    })
  }

  // 2. Active -> Completed
  if (booking.status === 'active' && newStatus === 'completed') {
    await resend.emails.send({
      ...getEmailDefaults(),
      to: booking.customers.email,
      subject: 'Thank you for choosing ScoreMax',
      html: emailLayout({
        title: 'Session Completed',
        greeting: `Hi ${booking.customers.full_name},`,
        body: '<p style="margin: 0;">We hope you had a great session! Please leave us a review.</p>',
        ctaText: 'Book Another Session',
        ctaUrl: `${process.env.NEXT_PUBLIC_APP_URL}/book`,
      }),
    })
  }

  // 3. Any -> Refunded
  if (newStatus === 'refunded') {
    // Refund Email
    await resend.emails.send({
      ...getEmailDefaults(),
      to: booking.customers.email,
      subject: 'Refund Processed',
      html: emailLayout({
        title: 'Refund Processed',
        greeting: `Hi ${booking.customers.full_name},`,
        body: '<p style="margin: 0;">Your session has been cancelled and a refund has been initiated.</p>',
      }),
    })

    // Delete Calendar Events
    if (booking.tutor_calendar_event_id && booking.tutors?.google_refresh_token) {
      try {
        const tutorAuth = getAuthClient(booking.tutors.google_refresh_token)
        await calendar.events.delete({
          auth: tutorAuth,
          calendarId: 'primary',
          eventId: booking.tutor_calendar_event_id
        })
        updates.tutor_calendar_event_id = null
      } catch (e) { console.error('Error deleting tutor calendar event:', e) }
    }

    if (booking.student_calendar_event_id && booking.customers?.google_refresh_token) {
      try {
        const studentAuth = getAuthClient(booking.customers.google_refresh_token)
        await calendar.events.delete({
          auth: studentAuth,
          calendarId: 'primary',
          eventId: booking.student_calendar_event_id
        })
        updates.student_calendar_event_id = null
      } catch (e) { console.error('Error deleting student calendar event:', e) }
    }

    // Stripe Refund
    if (booking.stripe_payment_intent_id) {
        try {
            await stripe.refunds.create({
                payment_intent: booking.stripe_payment_intent_id,
            })
        } catch (e) { console.error('Stripe refund failed', e) }
    }
  }
  
  return updates
}

async function handleReschedule(booking: any, newStart: string, newEnd: string) {
  const updates: any = {}
  const startTime = new Date(newStart)
  const endTime = new Date(newEnd)

  if (booking.tutor_calendar_event_id && booking.tutors?.google_refresh_token) {
    try {
      const tutorAuth = getAuthClient(booking.tutors.google_refresh_token)
      await calendar.events.patch({
        auth: tutorAuth,
        calendarId: 'primary',
        eventId: booking.tutor_calendar_event_id,
        requestBody: {
          start: { dateTime: startTime.toISOString() },
          end: { dateTime: endTime.toISOString() },
        }
      })
    } catch (e) { console.error('Failed to update tutor calendar event', e) }
  }

  if (booking.student_calendar_event_id && booking.customers?.google_refresh_token) {
    try {
      const studentAuth = getAuthClient(booking.customers.google_refresh_token)
      await calendar.events.patch({
        auth: studentAuth,
        calendarId: 'primary',
        eventId: booking.student_calendar_event_id,
        requestBody: {
          start: { dateTime: startTime.toISOString() },
          end: { dateTime: endTime.toISOString() },
        }
      })
    } catch (e) { console.error('Failed to update student calendar event', e) }
  }

  return updates
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const { data, error } = await supabaseAdmin
    .from('booking_requests')
    .select(`
      *,
      customers (
        id, email, full_name, google_refresh_token
      ),
      tutors (
        id, email, full_name, google_refresh_token
      )
    `)
    .eq('id', params.id)
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 404 })
  }

  return NextResponse.json(data)
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json()
  const { assigned_tutor_id, confirmed_start, confirmed_end, status, internal_notes } = body

  // Fetch current booking with tokens
  const { data: currentBooking, error: fetchError } = await supabaseAdmin
    .from('booking_requests')
    .select(`
      *,
      customers (
        id, email, full_name, google_refresh_token
      ),
      tutors (
        id, email, full_name, google_refresh_token
      )
    `)
    .eq('id', params.id)
    .single()

  if (fetchError || !currentBooking) {
    return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
  }

  let updates = {
    assigned_tutor_id,
    confirmed_start,
    confirmed_end,
    status,
    internal_notes
  }

  // Handle Status Logic
  if (status && status !== currentBooking.status) {
    try {
      const statusUpdates = await handleStatusChange({
        ...currentBooking,
        ...updates
      }, status)
      
      updates = { ...updates, ...statusUpdates }
    } catch (err: any) {
      return NextResponse.json({ error: err.message }, { status: 400 })
    }
  }

  // Handle reschedule on active bookings (status unchanged but times changed)
  const statusUnchanged = !status || status === currentBooking.status
  const timesChanged = (confirmed_start && confirmed_start !== currentBooking.confirmed_start) ||
    (confirmed_end && confirmed_end !== currentBooking.confirmed_end)
  if (statusUnchanged && currentBooking.status === 'active' && timesChanged) {
    const rescheduleUpdates = await handleReschedule(
      currentBooking,
      confirmed_start || currentBooking.confirmed_start,
      confirmed_end || currentBooking.confirmed_end
    )
    updates = { ...updates, ...rescheduleUpdates }
  }

  // Update Database
  const { data, error } = await supabaseAdmin
    .from('booking_requests')
    .update(updates)
    .eq('id', params.id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}
