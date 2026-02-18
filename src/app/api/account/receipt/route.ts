import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { stripe } from '@/lib/stripe'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const bookingId = req.nextUrl.searchParams.get('booking_id')
  if (!bookingId) return NextResponse.json({ error: 'Missing booking_id' }, { status: 400 })

  const { data: booking } = await supabaseAdmin
    .from('booking_requests')
    .select('stripe_payment_intent_id, customer_id')
    .eq('id', bookingId)
    .single()

  if (!booking?.stripe_payment_intent_id) {
    return NextResponse.json({ error: 'No payment found' }, { status: 404 })
  }

  try {
    const pi = await stripe.paymentIntents.retrieve(booking.stripe_payment_intent_id)
    const chargeId = typeof pi.latest_charge === 'string' ? pi.latest_charge : pi.latest_charge?.id
    if (!chargeId) return NextResponse.json({ error: 'No charge found' }, { status: 404 })

    const charge = await stripe.charges.retrieve(chargeId as string)
    if (!charge.receipt_url) return NextResponse.json({ error: 'No receipt available' }, { status: 404 })

    return NextResponse.json({ url: charge.receipt_url })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch receipt' }, { status: 500 })
  }
}
