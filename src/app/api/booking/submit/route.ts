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

  // 1. Fetch Customer & Membership/Package Status
  const { data: customer } = await supabaseAdmin
    .from('customers')
    .select('*, memberships(*), packages(*), course_enrollments(*)')
    .eq('profile_id', user.id)
    .single()

  if (!customer) {
    return NextResponse.json({ error: 'Customer profile not found' }, { status: 404 })
  }

  // 2. Determine Credit Source
  let creditSource: 'membership' | 'package' | 'course' | null = null
  let sourceId = null
  let updates = {}
  const courseEnrollmentId = null // Not implementing complex course matching yet

  // Check Membership
  const activeMembership = customer.memberships?.find((m: any) => m.status === 'active')
  if (activeMembership) {
    const available = activeMembership.included_hours + activeMembership.rollover_hours - activeMembership.used_hours
    if (available > 0) {
        creditSource = 'membership'
        sourceId = activeMembership.id
        updates = { used_hours: activeMembership.used_hours + 1 }
    }
  }

  // Check Packages (if no membership credit used)
  if (!creditSource) {
    const activePackage = customer.packages?.find((p: any) => p.remaining_hours > 0 && new Date(p.expires_at) > new Date())
    if (activePackage) {
      creditSource = 'package'
      sourceId = activePackage.id
      updates = { remaining_hours: activePackage.remaining_hours - 1 }
    }
  }

  if (!creditSource) {
     return NextResponse.json({ error: 'No available credits' }, { status: 400 })
  }

  // 3. Deduct Credit
  if (creditSource === 'membership') {
    await supabaseAdmin.from('memberships').update(updates).eq('id', sourceId)
  } else if (creditSource === 'package') {
    await supabaseAdmin.from('packages').update(updates).eq('id', sourceId)
  }

  // 4. Create Booking Request
  const { data: booking, error } = await supabaseAdmin
    .from('booking_requests')
    .insert({
      customer_id: customer.id,
      subjects, 
      available_days,
      available_time_start,
      available_time_end,
      timezone,
      session_type,
      status: 'paid',
      payment_type: creditSource,
      course_enrollment_id: courseEnrollmentId,
      notes,
      amount_cents: 0
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // 5. Create Session Record
  await supabaseAdmin.from('sessions').insert({
    order_id: booking.id,
    customer_id: customer.id,
    session_type,
    subjects,
    status: 'pending_scheduling',
  })

  // 6. Notify Admin
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
