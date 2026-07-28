import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { resend, getEmailDefaults } from '@/lib/resend'
import { emailLayout, detailRow } from '@/lib/email-templates'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const { subjects, available_days, available_time_start, available_time_end, timezone, session_type, notes, use_credit } = body

  if (!use_credit) {
    return NextResponse.json({ error: 'This endpoint is for credit usage only' }, { status: 400 })
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
      p_available_days: available_days,
      p_available_time_start: available_time_start,
      p_available_time_end: available_time_end,
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
    console.error('Credit redemption failed:', error?.message)
    return NextResponse.json({ error: 'Could not create booking' }, { status: 500 })
  }

  const creditSource = booking.payment_type

  // 2. Look up the customer for the notification emails. Nothing below this
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
  const adminEmails = adminSettings?.value?.split(',') || []

  if (adminEmails.length > 0) {
    await resend.emails.send({
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
    })
  }
  
  // 7. Notify Student
  await resend.emails.send({
      ...getEmailDefaults(),
      to: customer.email,
      subject: 'Booking Request Received',
      html: emailLayout({
        title: 'Request Received',
        greeting: `Hi ${customer.full_name},`,
        body: '<p style="margin: 0;">We received your booking request. We will assign a tutor and confirm the time shortly.</p>',
      }),
  })

  return NextResponse.json(booking)
}
