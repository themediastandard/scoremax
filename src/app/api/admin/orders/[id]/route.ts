import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { resend, getEmailDefaults } from '@/lib/resend'
import { emailLayout } from '@/lib/email-templates'
import { stripe } from '@/lib/stripe'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = await params
  const { data, error } = await supabaseAdmin
    .from('booking_requests')
    .select(`
      *,
      customers (id, email, full_name, phone, student_grade, notes, google_refresh_token),
      payments (amount_cents)
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
  const { status } = body

  if (status !== 'refunded') {
    return NextResponse.json({ error: 'Only refund status changes are supported' }, { status: 400 })
  }

  const { data: currentBooking, error: fetchError } = await supabaseAdmin
    .from('booking_requests')
    .select(`
      *,
      customers (id, email, full_name)
    `)
    .eq('id', id)
    .single()

  if (fetchError || !currentBooking) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  }

  if (status === 'refunded' && currentBooking.status !== 'refunded') {
    if (currentBooking.stripe_payment_intent_id) {
      try {
        await stripe.refunds.create({
          payment_intent: currentBooking.stripe_payment_intent_id,
        })
      } catch (e) {
        console.error('Stripe refund failed', e)
      }
    }

    await supabaseAdmin
      .from('sessions')
      .update({ status: 'cancelled' })
      .eq('order_id', id)

    if (currentBooking.customers?.email) {
      await resend.emails.send({
        ...getEmailDefaults(),
        to: currentBooking.customers.email,
        subject: 'Refund Processed',
        html: emailLayout({
          title: 'Refund Processed',
          greeting: `Hi ${currentBooking.customers.full_name},`,
          body: '<p style="margin: 0;">Your order has been cancelled and a refund has been initiated.</p>',
        }),
      })
    }
  }

  const { data, error } = await supabaseAdmin
    .from('booking_requests')
    .update({ status })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}
