import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { sendEmail, getEmailDefaults } from '@/lib/resend'
import { emailLayout, detailRow } from '@/lib/email-templates'
import { reportIssue } from '@/lib/report-error'
import {
  availabilityWindowsFromLegacy,
  legacyAvailabilityFromWindows,
  normalizeAvailabilityWindows,
} from '@/lib/availability-windows'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const { subjects, available_days, available_time_start, available_time_end, available_windows, timezone, session_type, notes, use_credit, full_name, phone, student_grade } = body

  if (!use_credit) {
    return NextResponse.json({ error: 'This endpoint is for credit usage only' }, { status: 400 })
  }

  // Validate the availability before it reaches Postgres. The per-day array is
  // the shape the form now sends; the legacy triple is accepted as a fallback
  // so a browser still running the previous bundle mid-deploy keeps working.
  // The legacy columns are then derived from the result rather than taken from
  // the request, so the two shapes on the row cannot contradict each other.
  const windows =
    normalizeAvailabilityWindows(available_windows) ??
    availabilityWindowsFromLegacy(available_days, available_time_start, available_time_end)
  const legacy = legacyAvailabilityFromWindows(windows)

  if (!windows || !legacy) {
    return NextResponse.json(
      { error: 'Select at least one day, each with a start and end time.' },
      { status: 400 }
    )
  }

  // 1. Redeem credit and create the booking + session atomically.
  //    Credit selection, deduction, booking insert and session insert all happen
  //    inside one Postgres transaction (see the redeem_credit_and_create_booking
  //    migration). This is what prevents the credit from being double-spent by
  //    concurrent requests, and what guarantees a failed insert can no longer
  //    consume a customer's hour.
  const { data: booking, error } = await supabaseAdmin
    .rpc('redeem_credit_and_create_booking', {
      p_profile_id: user.id,
      p_subjects: subjects,
      p_available_days: legacy.days,
      p_available_time_start: legacy.startTime,
      p_available_time_end: legacy.endTime,
      p_available_windows: windows,
      p_timezone: timezone,
      p_session_type: session_type,
      p_notes: notes,
    })
    .single<{ id: string; payment_type: string }>()

  if (error || !booking) {
    if (error?.message?.includes('customer_not_found')) {
      return NextResponse.json({ error: 'Customer profile not found' }, { status: 404 })
    }
    if (error?.message?.includes('no_available_credits')) {
      return NextResponse.json({ error: 'No available credits' }, { status: 400 })
    }
    reportIssue('booking:credit-redemption', 'Credit redemption failed', { supabaseError: error?.message })
    return NextResponse.json({ error: 'Could not create booking' }, { status: 500 })
  }

  const creditSource = booking.payment_type

  // 2. Persist the contact details from the booking form.
  //    These were collected on the contact step but never sent on the credit
  //    path, so an admin opening a credit order saw "—" for phone and grade.
  //    Only non-empty values are written, matching how the Stripe webhook
  //    treats the same fields — a blank box must not wipe what we already have.
  const contactUpdates: Record<string, string> = {}
  if (typeof full_name === 'string' && full_name.trim()) contactUpdates.full_name = full_name.trim()
  if (typeof phone === 'string' && phone.trim()) contactUpdates.phone = phone.trim()
  if (typeof student_grade === 'string' && student_grade.trim()) {
    contactUpdates.student_grade = student_grade.trim()
  }

  if (Object.keys(contactUpdates).length > 0) {
    const { error: contactError } = await supabaseAdmin
      .from('customers')
      .update(contactUpdates)
      .eq('profile_id', user.id)
    // The booking is already committed; never fail it over contact details.
    if (contactError) {
      console.error('Failed to save booking contact details:', contactError.message)
    }
  }

  // 3. Look up the customer for the notification emails. Nothing below this
  //    point may consume credit, so a failure here cannot cost the customer.
  const { data: customer } = await supabaseAdmin
    .from('customers')
    .select('id, full_name, email')
    .eq('profile_id', user.id)
    .single()

  if (!customer) {
    return NextResponse.json(booking)
  }

  // 3. Notify Admin
  const { data: adminSettings } = await supabaseAdmin.from('admin_settings').select('value').eq('key', 'notification_emails').single()
  // Trimmed to match the contact and step-up routes. Untrimmed, a
  // notification_emails value written as "a@x.com, b@y.com" yields " b@y.com" —
  // not a valid address, and one more way for a notification to go nowhere.
  const adminEmails =
    adminSettings?.value?.split(',').map((e: string) => e.trim()).filter(Boolean) || []

  /*
   * Both sends are best effort, and deliberately so. By this point
   * redeem_credit_and_create_booking() has already committed — credit is spent
   * and the booking row exists. Failing the request over an email would tell
   * the customer their booking did not happen while it demonstrably did, and
   * invite them to spend a second hour of credit re-submitting it.
   *
   * The booking is recoverable from the database, so a lost notification is an
   * inconvenience rather than a lost record. It still needs to be *visible*,
   * which is what the log lines in sendEmail are for.
   */
  if (adminEmails.length > 0) {
    await sendEmail(
      {
        ...getEmailDefaults(),
        to: adminEmails,
        subject: `New Booking Request (${creditSource} Credit Used)`,
        html: emailLayout({
          title: 'New Booking Request',
          body: [
            detailRow('Customer:', customer.full_name),
            detailRow('Payment:', `Credit Used (${creditSource})`),
            detailRow('Status:', 'Processing (Needs assignment)'),
          ].join(''),
          ctaText: 'View Order',
          ctaUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/orders/${booking.id}`,
        }),
      },
      `booking:admin:${booking.id}`
    )
  } else {
    console.error(
      `[email:booking:admin:${booking.id}] notification_emails is empty — no one was told about this booking`
    )
  }

  // 7. Notify Student
  await sendEmail(
    {
      ...getEmailDefaults(),
      to: customer.email,
      subject: 'Booking Request Received',
      html: emailLayout({
        title: 'Request Received',
        greeting: `Hi ${customer.full_name},`,
        body: '<p style="margin: 0;">We received your booking request. We will assign a tutor and confirm the time shortly.</p>',
      }),
    },
    `booking:customer:${booking.id}`
  )

  return NextResponse.json(booking)
}
