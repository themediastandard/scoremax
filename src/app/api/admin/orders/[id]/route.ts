import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { sendEmail, getEmailDefaults } from '@/lib/resend'
import { emailLayout } from '@/lib/email-templates'
import { stripe } from '@/lib/stripe'
import { requireAdmin } from '@/lib/auth'
import { isPaymentIntentId } from '@/lib/stripe-subscription'
import { reportError, reportIssue } from '@/lib/report-error'
import { cancelCalendarEventsForBookings } from '@/lib/session-calendar-cleanup'

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
    currentBooking.payment_method === 'account_credit' || (
      !currentBooking.payment_method &&
      (currentBooking.amount_cents ?? 0) === 0 &&
      !currentBooking.stripe_payment_intent_id
    )

  const isStripeFunded = currentBooking.payment_method === 'credit_card' || (
    !currentBooking.payment_method && !isCreditFunded
  )

  if (!isStripeFunded && !isCreditFunded) {
    return NextResponse.json(
      { error: `${currentBooking.payment_method === 'step_up' ? 'Step Up' : 'Zelle'} purchases must be reversed outside Stripe. Contact the customer and record the reversal through the approved offline process.` },
      { status: 400 }
    )
  }

  if (isStripeFunded) {
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
      reportError('refund:stripe', e, { bookingId: id })
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
    reportIssue('refund:bookkeeping', 'Stripe refunded but refund_booking failed — money moved, credit not revoked', { bookingId: id, supabaseError: refundError.message })
    return NextResponse.json(
      { error: 'Refund was issued but could not be recorded. Check this order manually.' },
      { status: 500 }
    )
  }

  const creditAction = (refundResult as { credit_action?: string } | null)?.credit_action
  if (creditAction === 'unknown_source_not_restored' || creditAction === 'source_row_missing') {
    reportIssue('refund:credit-not-restored', 'Refunded but could not restore credit — adjust the balance by hand', { bookingId: id, creditAction })
  }

  await cancelCalendarEventsForBookings([id])

  if (currentBooking.customers?.email) {
    /*
     * Best effort — the cancellation or refund has already been issued, so
     * failing here would misreport work that is done. The old try/catch caught
     * only thrown errors, letting a Resend rejection through unlogged; that
     * left a customer whose money moved with no word of it.
     */
    await sendEmail(
      {
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
      },
      `admin:order-${isCreditFunded ? 'cancelled' : 'refunded'}:${currentBooking.id}`
    )
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
