import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { resend } from '@/lib/resend'
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

    // Send Student Confirmation Email
    await resend.emails.send({
      from: 'ScoreMax <noreply@scoremax.com>',
      to: booking.customers.email,
      subject: 'Booking Confirmed: Your session is scheduled',
      html: `
        <h1>Session Confirmed</h1>
        <p>Hi ${booking.customers.full_name},</p>
        <p>Your tutoring session has been confirmed!</p>
        <p><strong>Tutor:</strong> ${booking.tutors.full_name}</p>
        <p><strong>Time:</strong> ${startTime.toLocaleString()}</p>
        <p><strong>Location:</strong> ${booking.session_type === 'in-person' ? 'Sawgrass, FL' : 'Online (Zoom)'}</p>
      `
    })

    // Send Tutor Notification
    await resend.emails.send({
      from: 'ScoreMax <noreply@scoremax.com>',
      to: booking.tutors.email,
      subject: 'New Session Assigned',
      html: `
        <h1>New Session</h1>
        <p>Hi ${booking.tutors.full_name},</p>
        <p>You have been assigned a new session.</p>
        <p><strong>Student:</strong> ${booking.customers.full_name}</p>
        <p><strong>Time:</strong> ${startTime.toLocaleString()}</p>
        <p><strong>Location:</strong> ${booking.session_type === 'in-person' ? 'Sawgrass, FL' : 'Online (Zoom)'}</p>
      `
    })

    // Create Calendar Events
    const eventBody = {
      summary: `ScoreMax: ${booking.session_type === 'in-person' ? 'In-Person' : 'Online'} Session`,
      description: `Student: ${booking.customers.full_name}\nTutor: ${booking.tutors.full_name}\nLocation: ${booking.session_type === 'in-person' ? 'Sawgrass, FL' : 'Online'}`,
      start: { dateTime: startTime.toISOString() },
      end: { dateTime: endTime.toISOString() },
    }

    // Tutor Calendar
    if (booking.tutors?.google_refresh_token) {
      try {
        const tutorAuth = getAuthClient(booking.tutors.google_refresh_token)
        const event = await calendar.events.insert({
          auth: tutorAuth,
          calendarId: 'primary',
          requestBody: {
            ...eventBody,
            summary: `ScoreMax Session: ${booking.customers.full_name}`
          }
        })
        updates.tutor_calendar_event_id = event.data.id
      } catch (error) {
        console.error('Failed to create tutor calendar event', error)
      }
    }

    // Student Calendar
    if (booking.customers?.google_refresh_token) {
      try {
        const studentAuth = getAuthClient(booking.customers.google_refresh_token)
        const event = await calendar.events.insert({
          auth: studentAuth,
          calendarId: 'primary',
          requestBody: {
            ...eventBody,
            summary: `ScoreMax Session: ${booking.tutors.full_name}`
          }
        })
        updates.student_calendar_event_id = event.data.id
      } catch (error) {
         console.error('Failed to create student calendar event', error)
      }
    }
  }

  // 2. Active -> Completed
  if (booking.status === 'active' && newStatus === 'completed') {
    await resend.emails.send({
      from: 'ScoreMax <noreply@scoremax.com>',
      to: booking.customers.email,
      subject: 'Thank you for choosing ScoreMax',
      html: `
        <h1>Session Completed</h1>
        <p>Hi ${booking.customers.full_name},</p>
        <p>We hope you had a great session! Please leave us a review.</p>
        <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/book">Book Another Session</a></p>
      `
    })
  }

  // 3. Any -> Refunded
  if (newStatus === 'refunded') {
    // Refund Email
    await resend.emails.send({
      from: 'ScoreMax <noreply@scoremax.com>',
      to: booking.customers.email,
      subject: 'Refund Processed',
      html: `
        <h1>Refund Processed</h1>
        <p>Hi ${booking.customers.full_name},</p>
        <p>Your session has been cancelled and a refund has been initiated.</p>
      `
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
