import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { supabaseAdmin } from '@/lib/supabase/admin'

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
      bookingRequestId = bookingId
      planInfo = {
        name: 'Credit Used',
        amountCents: 0,
        type: 'credit',
      }
    }

    const { data: booking, error: bookingError } = await supabaseAdmin
      .from('booking_requests')
      .select('subjects, available_days, available_time_start, available_time_end, session_type')
      .eq('id', bookingRequestId)
      .single()

    if (bookingError || !booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    let subjectNames: string[] = []
    if (booking.subjects?.length) {
      const { data: subjects } = await supabaseAdmin
        .from('subjects')
        .select('name')
        .in('id', booking.subjects)
      subjectNames = (subjects ?? []).map((s) => s.name)
    }

    // Postgres time type returns "HH:mm:ss" - normalize to "HH:mm" for display
    const fmtTime = (t: string | null) =>
      t ? t.slice(0, 5) : null

    return NextResponse.json({
      plan: planInfo,
      availability: {
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
