import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { resend, getEmailDefaults } from '@/lib/resend'
import { emailLayout } from '@/lib/email-templates'
import { stripe } from '@/lib/stripe'
import { requireAdmin } from '@/lib/auth'
import { isPaymentIntentId } from '@/lib/stripe-subscription'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authError = await requireAdmin()
  if (authError) return authError

  const { id } = await params
  const { data, error } = await supabaseAdmin
    .from('booking_requests')
    .select(`
      *,
      customers (id, email, full_name, phone, student_grade, notes),
      payments (amount_cents)
    `)
    .eq('id', id)
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 404 })
  }

  return NextResponse.json(data)
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authError = await requireAdmin()
  if (authError) return authError

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

  if (currentBooking.status === 'refunded') {
    return NextResponse.json(currentBooking)
  }

  // A credit-funded booking has no Stripe payment to reverse — the customer paid
  // with hours, so the refund is purely a matter of giving those hours back.
  // Previously these could not be refunded at all: the route demanded a payment
  // intent that credit bookings never have.
  const isCreditFunded =
    (currentBooking.amount_cents ?? 0) === 0 && !currentBooking.stripe_payment_intent_id

  if (!isCreditFunded) {
    if (!isPaymentIntentId(currentBooking.stripe_payment_intent_id)) {
      return NextResponse.json(
        { error: 'No refundable Stripe payment intent found for this order' },
        { status: 400 }
      )
    }

    try {
      await stripe.refunds.create({
        payment_intent: currentBooking.stripe_payment_intent_id,
      })
    } catch (e) {
      console.error('Stripe refund failed', e)
      return NextResponse.json({ error: 'Stripe refund failed' }, { status: 502 })
    }
  }

  // Settle the credit, cancel the sessions and mark the booking refunded in one
  // transaction. For a purchase this revokes the credit the payment bought; for
  // a credit booking it restores the debited hour. Idempotent — a repeat call
  // reports already_refunded and changes nothing.
  //
  // Deliberately after the Stripe call: money moves first, so a failed refund
  // leaves the booking untouched rather than marked refunded with no refund.
  const { data: refundResult, error: refundError } = await supabaseAdmin
    .rpc('refund_booking', { p_booking_id: id })

  if (refundError) {
    console.error('Refund bookkeeping failed after Stripe refund:', refundError.message)
    return NextResponse.json(
      { error: 'Refund was issued but could not be recorded. Check this order manually.' },
      { status: 500 }
    )
  }

  const creditAction = (refundResult as { credit_action?: string } | null)?.credit_action
  if (creditAction === 'unknown_source_not_restored' || creditAction === 'source_row_missing') {
    console.error(
      `Refunded booking ${id} but could not restore credit (${creditAction}). Adjust the customer's balance manually.`
    )
  }

  if (currentBooking.customers?.email) {
    try {
      await resend.emails.send({
        ...getEmailDefaults(),
        to: currentBooking.customers.email,
        subject: isCreditFunded ? 'Booking Cancelled' : 'Refund Processed',
        html: emailLayout({
          title: isCreditFunded ? 'Booking Cancelled' : 'Refund Processed',
          greeting: `Hi ${currentBooking.customers.full_name},`,
          body: isCreditFunded
            ? '<p style="margin: 0;">Your booking has been cancelled and the session credit has been returned to your account.</p>'
            : '<p style="margin: 0;">Your order has been cancelled and a refund has been initiated.</p>',
        }),
      })
    } catch (emailError) {
      console.error('Failed to send refund notification:', emailError)
    }
  }

  const { data, error } = await supabaseAdmin
    .from('booking_requests')
    .select()
    .eq('id', id)
    .single()

  if (error) {
    return NextResponse.json({ error: 'Could not load the refunded order' }, { status: 500 })
  }

  return NextResponse.json({ ...data, credit_action: creditAction })
}
