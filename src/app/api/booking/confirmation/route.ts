import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { buildSubjectCatalog, resolveSubjectNames } from '@/lib/subject-catalog'
import { readAvailabilityWindows } from '@/lib/availability-windows'

export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get('session_id')
  const bookingId = req.nextUrl.searchParams.get('booking_id')

  if (!sessionId && !bookingId) {
    return NextResponse.json({ error: 'Missing session_id or booking_id' }, { status: 400 })
  }

  try {
    let bookingRequestId: string | null = null
    let planInfo: { name: string; amountCents: number; type: string } | null = null

    if (sessionId) {
      let session
      try {
        session = await stripe.checkout.sessions.retrieve(sessionId, {
          expand: ['line_items.data.price.product'],
        })
      } catch {
        session = await stripe.checkout.sessions.retrieve(sessionId)
      }
      bookingRequestId = session.metadata?.booking_request_id ?? null
      if (!bookingRequestId) {
        return NextResponse.json({ error: 'No booking found for this session' }, { status: 404 })
      }
      const lineItem = session.line_items?.data?.[0]
      const product = lineItem?.price?.product as { name?: string } | undefined
      planInfo = {
        name: product?.name ?? lineItem?.description ?? 'Membership / Package',
        amountCents: session.amount_total ?? 0,
        type: session.metadata?.plan_type ?? 'membership',
      }
    } else if (bookingId) {
      const supabase = await createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }

      const { data: customer } = await supabaseAdmin
        .from('customers')
        .select('id')
        .eq('profile_id', user.id)
        .maybeSingle()

      if (!customer) {
        return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
      }

      bookingRequestId = bookingId
      planInfo = {
        name: 'Credit Used',
        amountCents: 0,
        type: 'credit',
      }

      const { data: ownedBooking } = await supabaseAdmin
        .from('booking_requests')
        .select('id')
        .eq('id', bookingRequestId)
        .eq('customer_id', customer.id)
        .maybeSingle()

      if (!ownedBooking) {
        return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
      }
    }

    const { data: booking, error: bookingError } = await supabaseAdmin
      .from('booking_requests')
      .select('subjects, available_days, available_time_start, available_time_end, available_windows, session_type, payment_type')
      .eq('id', bookingRequestId)
      .single()

    if (bookingError || !booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    let subjectNames: string[] = []
    if (booking.subjects?.length) {
      const { data: subjectRows } = await supabaseAdmin
        .from('subjects')
        .select('*')
        .eq('is_active', true)
      subjectNames = resolveSubjectNames(buildSubjectCatalog(subjectRows ?? []), booking.subjects)
    }

    // Postgres time type returns "HH:mm:ss" - normalize to "HH:mm" for display
    const fmtTime = (t: string | null) =>
      t ? t.slice(0, 5) : null

    return NextResponse.json({
      plan: planInfo,
      availability: {
        // Per-day windows, falling back to the flat shape for bookings taken
        // before that column existed. `days`/`startTime`/`endTime` are kept in
        // the response so an older cached bundle still renders something.
        windows: readAvailabilityWindows(booking) ?? [],
        days: booking.available_days ?? [],
        startTime: fmtTime(String(booking.available_time_start ?? '')),
        endTime: fmtTime(String(booking.available_time_end ?? '')),
      },
      sessionType: booking.session_type ?? 'online',
      subjects: subjectNames,
      subjectIds: booking.subjects ?? [],
    })
  } catch (err) {
    console.error('Confirmation fetch error:', err)
    return NextResponse.json({ error: 'Failed to load booking details' }, { status: 500 })
  }
}
