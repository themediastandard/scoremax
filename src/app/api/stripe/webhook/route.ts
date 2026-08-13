import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import type Stripe from 'stripe'
import { stripe } from '@/lib/stripe'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { sendEmail, getEmailDefaults } from '@/lib/resend'
import { emailLayout, detailRow } from '@/lib/email-templates'
import { packageExpiresAt } from '@/lib/package-expiry'
import { cancelCalendarEventsForBookings } from '@/lib/session-calendar-cleanup'
import { reportError, reportIssue, flushReports } from '@/lib/report-error'
import { courseTypeFromPricingName } from '@/lib/course-plan-rules'
import {
  getCheckoutPaymentIntentId,
  getInvoicePaymentIntentId,
  getInvoiceSubscriptionId,
  getStripeId,
  getSubscriptionPeriod,
  isRenewalInvoice,
} from '@/lib/stripe-subscription'

async function findMembershipPricing(pricingId?: string | null, stripePriceId?: string | null) {
  if (pricingId) {
    const { data } = await supabaseAdmin
      .from('pricing')
      .select('name, included_hours')
      .eq('id', pricingId)
      .eq('type', 'membership')
      .maybeSingle()
    if (data) return data
  }

  if (!stripePriceId) return null
  const { data } = await supabaseAdmin
    .from('pricing')
    .select('name, included_hours')
    .eq('type', 'membership')
    .or(`stripe_price_id.eq.${stripePriceId},stripe_online_price_id.eq.${stripePriceId}`)
    .maybeSingle()
  return data
}

export async function POST(req: Request) {
  const body = await req.text()
  const signature = (await headers()).get('Stripe-Signature') as string

  let event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    /*
     * Usually a stray probe hitting the endpoint, which is noise — but it is
     * also exactly how a rotated STRIPE_WEBHOOK_SECRET presents, and that is a
     * silent, total payment outage. Kept its own tag so it can be muted
     * independently if the noise ever outweighs the signal.
     */
    reportIssue('stripe:webhook-signature', 'Webhook signature verification failed', { message })
    await flushReports()
    return NextResponse.json({ error: `Webhook Error: ${message}` }, { status: 400 })
  }

  // Skip events already processed to completion. The marker is written only
  // after every side effect below has committed, so a failed or timed-out
  // delivery leaves no marker and Stripe's retry is allowed to re-run the
  // handler. Re-running is safe because each credit grant is guarded by a unique
  // index on stripe_payment_intent_id and inserted with ON CONFLICT DO NOTHING.
  //
  // Previously the marker was reserved up front and deleted in the catch block,
  // which lost grants on timeout (marker survived, retry rejected as duplicate)
  // and double-granted on mid-handler failure (marker deleted, retry re-ran).
  const { data: alreadyProcessed } = await supabaseAdmin
    .from('processed_stripe_events')
    .select('event_id')
    .eq('event_id', event.id)
    .maybeSingle()

  if (alreadyProcessed) {
    return NextResponse.json({ received: true, skipped: true })
  }

  try {
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const metadata = session.metadata ?? {}
    const bookingId = metadata.booking_request_id
    const planName = metadata.plan_name
    const contactName = metadata.contact_name
    const contactPhone = metadata.contact_phone
    const studentGrade = metadata.student_grade
    if (!bookingId) {
      throw new Error(`Stripe checkout ${session.id} has no booking_request_id`)
    }
    const { data: authoritativeBooking, error: bookingLookupError } = await supabaseAdmin
      .from('booking_requests')
      .select('id, customer_id, student_id, pricing_id, purchase_key, payment_type, subjects, session_type')
      .eq('id', bookingId)
      .maybeSingle()
    if (bookingLookupError || !authoritativeBooking?.customer_id) {
      throw new Error(
        `Stripe checkout ${session.id} could not resolve its authoritative booking: ` +
        `${bookingLookupError?.message ?? bookingId}`
      )
    }
    // The booking was written by the authenticated checkout route before the
    // browser reached Stripe. Metadata is diagnostic only: payer and student
    // are both loaded from that authoritative row before any mutation occurs.
    const planType = authoritativeBooking.payment_type
    const purchaseKey = authoritativeBooking.purchase_key
    const bookingStudentId = authoritativeBooking?.student_id ?? null
    const stripeCustomerId = typeof session.customer === 'string' ? session.customer : session.customer?.id ?? null
    let stripePaymentIntentId = getCheckoutPaymentIntentId(session)
    let membershipSubscription: Stripe.Subscription | null = null

    if (planType === 'membership' && session.subscription) {
      membershipSubscription = await stripe.subscriptions.retrieve(session.subscription as string, {
        // `latest_invoice.payment_intent` no longer exists — see the note on
        // getInvoicePaymentIntentId. `payments` is what carries it now, and it
        // is only returned when explicitly expanded.
        expand: ['latest_invoice.payments'],
      })
      stripePaymentIntentId ||= getInvoicePaymentIntentId(membershipSubscription.latest_invoice)
    }

    // 1. Resolve Customer exclusively through booking_requests.customer_id.
    // A Stripe customer id or contact email can never select which ScoreMax
    // account receives payment records or credits.
    const { data: authoritativeCustomer, error: customerLookupError } = await supabaseAdmin
      .from('customers')
      .select('*')
      .eq('id', authoritativeBooking.customer_id)
      .maybeSingle()
    if (customerLookupError || !authoritativeCustomer) {
      throw new Error(
        `Stripe checkout ${session.id} could not resolve booking customer ${authoritativeBooking.customer_id}: ` +
        `${customerLookupError?.message ?? 'row missing'}`
      )
    }

    let customer = authoritativeCustomer
    if (stripeCustomerId) {
      const { data: linkedStripeCustomer, error: stripeOwnerError } = await supabaseAdmin
        .from('customers')
        .select('id')
        .eq('stripe_customer_id', stripeCustomerId)
        .maybeSingle()
      if (stripeOwnerError) {
        throw new Error(`Could not verify Stripe customer ownership: ${stripeOwnerError.message}`)
      }
      if (linkedStripeCustomer && linkedStripeCustomer.id !== customer.id) {
        throw new Error(`Stripe customer is already linked to a different ScoreMax account`)
      }
    }
    if (
      stripeCustomerId &&
      customer.stripe_customer_id &&
      customer.stripe_customer_id !== stripeCustomerId
    ) {
      throw new Error(`Stripe customer does not match booking customer ${customer.id}`)
    }

    const legacyStudentGrade = bookingStudentId ? null : studentGrade
    if (stripeCustomerId || contactPhone || legacyStudentGrade || contactName) {
      const refreshed = {
        ...(!customer.stripe_customer_id && stripeCustomerId && { stripe_customer_id: stripeCustomerId }),
        ...(contactName && { full_name: contactName }),
        ...(contactPhone && { phone: contactPhone }),
        ...(legacyStudentGrade && { student_grade: legacyStudentGrade }),
      }
      const { error: refreshError } = await supabaseAdmin
        .from('customers')
        .update(refreshed)
        .eq('id', customer.id)
      if (refreshError) {
        console.error('Failed to refresh customer contact details:', refreshError.message)
      } else {
        customer = { ...customer, ...refreshed }
      }
    }

    // 2. Update Booking Request
    if (bookingId && customer) {
        await supabaseAdmin.from('booking_requests').update({
            status: 'paid',
            payment_method: 'credit_card',
            stripe_payment_intent_id: stripePaymentIntentId,
        }).eq('id', bookingId).in('status', ['pending_payment', 'paid'])
    }

    // 3. Record Payment
    if (customer) {
        // ON CONFLICT DO NOTHING: a Stripe retry re-runs this handler, and the
        // unique index on stripe_payment_intent_id must not turn that into a 500.
        await supabaseAdmin.from('payments').upsert({
            booking_request_id: bookingId,
            customer_id: customer.id,
            stripe_payment_intent_id: stripePaymentIntentId,
            payment_method: 'credit_card',
            purchase_key: purchaseKey,
            amount_cents: session.amount_total,
            currency: session.currency,
            payment_type: planType,
            status: 'succeeded'
        }, { onConflict: 'stripe_payment_intent_id', ignoreDuplicates: true })
    }

    // 4. Create Package/Course/Membership Records
    if (planType === 'package' && customer) {
        let hours: number | null = null
        if (authoritativeBooking.pricing_id) {
          const { data: packagePricing } = await supabaseAdmin
            .from('pricing')
            .select('included_hours')
            .eq('id', authoritativeBooking.pricing_id)
            .eq('type', 'package')
            .single()
          hours = packagePricing?.included_hours ?? null
        }
        if (!hours) {
          hours = (session.amount_total ?? 0) >= 200000 ? 20 : 10
          console.error(`Package hours could not be resolved from authoritative pricing for booking ${bookingId}; falling back to amount heuristic (${hours}h). Verify the package record.`)
        }
        await supabaseAdmin.from('packages').upsert({
            customer_id: customer.id,
            total_hours: hours,
            remaining_hours: hours - 1,
            expires_at: packageExpiresAt(),
            stripe_payment_intent_id: stripePaymentIntentId,
            purchase_key: purchaseKey,
        }, { onConflict: 'stripe_payment_intent_id', ignoreDuplicates: true })
    } else if (planType === 'course' && customer) {
        if (!authoritativeBooking.pricing_id) {
          throw new Error(`Paid course booking ${bookingId} has no authoritative pricing row`)
        }
        const { data: coursePricing, error: coursePricingError } = await supabaseAdmin
          .from('pricing')
          .select('id, name, included_hours')
          .eq('id', authoritativeBooking.pricing_id)
          .eq('type', 'course')
          .maybeSingle()
        const totalSessions = Number(coursePricing?.included_hours)
        const courseType = courseTypeFromPricingName(coursePricing?.name)
        if (
          coursePricingError ||
          !coursePricing ||
          !courseType ||
          !Number.isInteger(totalSessions) ||
          totalSessions < 1
        ) {
          throw new Error(
            `Paid course booking ${bookingId} has invalid authoritative pricing: ` +
            `${coursePricingError?.message ?? authoritativeBooking.pricing_id}`
          )
        }

        await supabaseAdmin.from('course_enrollments').upsert({
            customer_id: customer.id,
            student_id: bookingStudentId,
            course_type: courseType,
            total_sessions: totalSessions,
            // Minus the session this same checkout books below (step 5 inserts a
            // sessions row unconditionally). Packages and memberships already net
            // that out — `remaining_hours: hours - 1` and `used_hours: 1` — and
            // without it here every course buyer received one session more than
            // the count they were sold.
            remaining_sessions: totalSessions - 1,
            amount_cents: session.amount_total,
            // Was never recorded, which left course enrollments with no
            // idempotency key and made them untraceable from a refund.
            stripe_payment_intent_id: stripePaymentIntentId,
            purchase_key: purchaseKey,
            status: 'active'
        }, { onConflict: 'stripe_payment_intent_id', ignoreDuplicates: true })
    } else if (planType === 'membership' && customer && session.subscription) {
        const subscription = membershipSubscription ?? await stripe.subscriptions.retrieve(session.subscription as string, {
          expand: ['latest_invoice.payment_intent'],
        })
        const priceId = subscription.items?.data?.[0]?.price?.id
        const period = getSubscriptionPeriod(subscription)
        const pricing = await findMembershipPricing(authoritativeBooking.pricing_id, priceId)
        // If the lookup misses, the fallback silently grants a Starter allocation
        // — so a customer who paid $899 for Premier would receive 2 hours and
        // nobody would find out. The fallback stays, because refusing to grant
        // anything after a successful payment is worse, but it must be loud: this
        // is a paid subscription whose price ID is not in the pricing table.
        if (!pricing) {
            console.error(
                `Membership pricing lookup failed for Stripe price ${priceId} ` +
                `(subscription ${subscription.id}, customer ${customer.id}). ` +
                `Granting the 2-hour Starter fallback — verify the membership Stripe price IDs ` +
                `matches the live Stripe prices and correct this membership by hand.`
            )
        }
        const tier = pricing?.name?.replace(/\s*Membership$/i, '')?.toLowerCase() ?? 'starter'
        const includedHours = pricing?.included_hours ?? 2
        await supabaseAdmin.from('memberships').insert({
            customer_id: customer.id,
            tier,
            stripe_subscription_id: subscription.id,
            // How refund_booking finds this row to revoke. Packages and course
            // enrollments have always carried it; memberships did not, which is
            // why a refunded membership kept its credit.
            stripe_payment_intent_id: stripePaymentIntentId,
            purchase_key: purchaseKey,
            status: 'active',
            included_hours: includedHours,
            used_hours: 1,
            rollover_hours: 0,
            current_period_start: period.currentPeriodStart,
            current_period_end: period.currentPeriodEnd,
        })
    }

    // 5. Create Session Records
    if (bookingId && customer) {
        await supabaseAdmin.from('sessions').upsert({
            order_id: bookingId,
            customer_id: customer.id,
            student_id: authoritativeBooking.student_id ?? null,
            session_type: authoritativeBooking.session_type || 'online',
            subjects: authoritativeBooking.subjects || [],
            status: 'pending_scheduling',
        }, { onConflict: 'order_id', ignoreDuplicates: true })
    }

    // 6. Notify Admin
    const { data: adminSettings } = await supabaseAdmin.from('admin_settings').select('value').eq('key', 'notification_emails').single()
    // Trimmed to match the other notification routes — an untrimmed
    // "a@x.com, b@y.com" yields " b@y.com", which is not a valid address.
    const adminEmails =
      adminSettings?.value?.split(',').map((e: string) => e.trim()).filter(Boolean) || []
    
    if (adminEmails.length > 0) {
        const planLabel = planName || (planType === 'membership' ? 'Membership' : planType === 'package' ? 'Tutoring Package' : planType === 'single' ? 'Single Session' : planType === 'course' ? 'Course Program' : String(planType))

        /*
         * Best effort, and it must stay that way: the payment is already
         * recorded and the event already de-duped in
         * processed_stripe_events, so a non-2xx here would make Stripe retry
         * an event whose side effects are deliberately skipped on replay —
         * the email would not be resent, and the retry would achieve nothing
         * but noise. The previous try/catch only caught *thrown* errors, so a
         * Resend rejection passed straight through it unlogged.
         */
        await sendEmail(
          {
            ...getEmailDefaults(),
            to: adminEmails,
            subject: 'New Payment & Booking',
            html: emailLayout({
              title: 'New Payment Received',
              body: [
                detailRow('Customer:', customer.full_name || customer.email || 'Unknown'),
                detailRow('Amount:', `$${(session.amount_total ?? 0) / 100}`),
                detailRow('Package:', planLabel),
              ].join(''),
              ctaText: 'View Orders',
              ctaUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/orders`,
            }),
          },
          `stripe:admin-payment:${session.id}`
        )
    }

    // 7. Notify Customer (post-payment confirmation)
    if (customer.email) {
      const planLabel = planType === 'membership' ? 'membership' : planType === 'package' ? 'tutoring package' : 'course'
      const purchaseBody = `<p style="margin: 0 0 16px 0;">Your payment has been received. You've purchased a ${planLabel}.</p>`

      const nextSteps = '<p style="margin: 0 0 16px 0;">We will assign a tutor and confirm your session time shortly. You will receive another email once your booking is confirmed.</p>'

      /*
       * Best effort for the same de-dupe reason as the admin notification
       * above. The buyer is already authenticated and the booking remains in
       * their dashboard if mail fails; the log line is how the failed receipt
       * surfaces because this webhook event will not resend it on retry.
       */
      await sendEmail(
        {
          ...getEmailDefaults(),
          to: customer.email,
          subject: 'Thank you for your purchase',
          html: emailLayout({
            title: 'Thank You for Your Purchase',
            greeting: `Hi ${customer.full_name || 'there'},`,
            body: purchaseBody + nextSteps,
            ctaText: 'Sign In to Your Dashboard',
            ctaUrl: `${process.env.NEXT_PUBLIC_APP_URL}/login`,
          }),
        },
        `stripe:customer-purchase:${session.id}`
      )
    }
  }

  if (event.type === 'checkout.session.expired') {
    const session = event.data.object as Stripe.Checkout.Session
    const bookingId = session.metadata?.booking_request_id
    if (bookingId) {
      await supabaseAdmin
        .from('booking_requests')
        .delete()
        .eq('id', bookingId)
        .eq('status', 'pending_payment')
    }
  }

  // Refunds issued outside the app — from the Stripe dashboard, or a customer
  // chargeback — previously did nothing here, so the money went back while the
  // credit stayed. charge.refunded covers dashboard refunds and the app's own
  // (already-settled, so refund_booking reports already_refunded and no-ops);
  // charge.dispute.created covers chargebacks.
  if (event.type === 'charge.refunded' || event.type === 'charge.dispute.created') {
    const paymentIntentId =
      event.type === 'charge.refunded'
        ? getStripeId((event.data.object as Stripe.Charge).payment_intent)
        : getStripeId((event.data.object as Stripe.Dispute).payment_intent)

    if (paymentIntentId) {
      /*
       * Deliberately not filtered on status. Settlement still only applies to a
       * 'paid' row, but the admin notification below must fire for the app's own
       * refunds too — those have already flipped the row to 'refunded' by the
       * time this event lands, so a status filter here would silently limit the
       * notification to externally-issued refunds.
       */
      const { data: matched } = await supabaseAdmin
        .from('booking_requests')
        .select('id, amount_cents, payment_type, status, customers(full_name, email)')
        .eq('stripe_payment_intent_id', paymentIntentId)

      const rows = matched ?? []

      for (const row of rows) {
        if (row.status !== 'paid') continue
        const { error: refundError } = await supabaseAdmin
          .rpc('refund_booking', { p_booking_id: row.id })
        if (refundError) {
          throw new Error(
            `Failed to settle external refund for booking ${row.id}: ${refundError.message}`
          )
        }
      }

      /*
       * A refund returns the money already charged; it does not stop the next
       * one. Nothing cancelled the subscription, so a refunded member was billed
       * again the following cycle — confirmed live on 2026-08-04, and cancelled
       * by hand at the time.
       *
       * Runs after refund_booking so the credit is already revoked: cancelling
       * first would emit customer.subscription.deleted against a membership that
       * still looked active. Read by payment intent, the same key refund_booking
       * revokes on, so this only ever cancels a subscription that this refund
       * actually settled.
       *
       * Disputes cancel too. A chargeback that later resolves in our favour is
       * rare and recoverable by resubscribing; continuing to bill a member whose
       * credit has just been revoked is neither.
       */
      /*
       * refund_booking cancels the session rows, but it runs in Postgres and
       * cannot call Google — so the invite stayed live on the customer's and
       * tutor's calendars, Meet link included, with nothing in the UI pointing at
       * the orphan. Confirmed live on 2026-08-04: a refunded booking left a
       * confirmed event six days out.
       *
       * The admin route's handleCancel does the same cleanup but only fires on a
       * status transition away from 'scheduled'; after a refund the row is
       * already 'cancelled', so it can never reach these. Runs over every matched
       * booking, not only freshly settled ones, so the app's own refunds — where
       * the row was flipped before this event arrived — are covered too.
       */
      const deletedEvents = await cancelCalendarEventsForBookings(rows.map((row) => row.id))
      if (deletedEvents > 0) {
        console.log(`[refund] deleted ${deletedEvents} calendar event(s) for ${paymentIntentId}`)
      }

      const { data: refundedMemberships } = await supabaseAdmin
        .from('memberships')
        .select('id, stripe_subscription_id')
        .eq('stripe_payment_intent_id', paymentIntentId)
        .not('stripe_subscription_id', 'is', null)

      for (const membership of refundedMemberships ?? []) {
        try {
          await stripe.subscriptions.cancel(membership.stripe_subscription_id as string)
        } catch (cancelError) {
          /*
           * Logged, never thrown. The refund and the credit revocation have both
           * committed; a non-2xx here would make Stripe retry an event whose side
           * effects are skipped on replay, so the cancel would not be reattempted
           * anyway. An already-cancelled subscription lands here too via
           * resource_missing, which is the desired end state regardless.
           */
          reportError('refund:subscription-cancel', cancelError, {
            subscriptionId: membership.stripe_subscription_id,
            membershipId: membership.id,
            note: 'customer will keep being billed until this is cancelled by hand',
          })
        }
      }

      /*
       * Money going back out was the one movement nobody was told about:
       * purchases notify the admin list, refunds notified only the customer, and
       * a dashboard-issued refund reached no inbox at all. Reported here rather
       * than in the admin route so both origins are covered by one path.
       *
       * Best effort for the same reason as the purchase notification — the
       * refund is settled and the event de-duped, so a non-2xx would only make
       * Stripe retry an event whose side effects are skipped on replay.
       */
      if (rows.length > 0) {
        const { data: refundAdminSettings } = await supabaseAdmin
          .from('admin_settings')
          .select('value')
          .eq('key', 'notification_emails')
          .single()
        const refundAdminEmails =
          refundAdminSettings?.value?.split(',').map((e: string) => e.trim()).filter(Boolean) || []

        if (refundAdminEmails.length > 0) {
          const isDispute = event.type === 'charge.dispute.created'
          // The event carries what actually moved; the booking's amount_cents is
          // the original total and overstates a partial refund.
          const movedCents = isDispute
            ? (event.data.object as Stripe.Dispute).amount
            : (event.data.object as Stripe.Charge).amount_refunded

          for (const row of rows) {
            const customer = (Array.isArray(row.customers) ? row.customers[0] : row.customers) as
              | { full_name?: string | null; email?: string | null }
              | null

            await sendEmail(
              {
                ...getEmailDefaults(),
                to: refundAdminEmails,
                subject: isDispute ? 'Chargeback Opened' : 'Refund Issued',
                html: emailLayout({
                  title: isDispute ? 'Chargeback Opened' : 'Refund Issued',
                  body: [
                    detailRow('Customer:', customer?.full_name || customer?.email || 'Unknown'),
                    detailRow('Amount:', `$${(movedCents ?? 0) / 100}`),
                    detailRow('Original order:', `$${(row.amount_cents ?? 0) / 100}`),
                    detailRow('Payment type:', row.payment_type || 'Unknown'),
                    detailRow('Credit revoked:', row.status === 'paid' ? 'Yes' : 'Already settled'),
                  ].join(''),
                  ctaText: 'View Orders',
                  ctaUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/orders`,
                }),
              },
              `webhook:${isDispute ? 'chargeback' : 'refund'}:admin:${row.id}`
            )
          }
        }
      }
    }
  }

  // Membership renewal. Without this, used_hours was never reset: a recurring
  // member received their included_hours once and was then permanently out of
  // credit while Stripe kept billing them. renew_membership_period computes the
  // carry-over and resets the counter in a single atomic statement.
  if (event.type === 'invoice.paid') {
    const invoice = event.data.object as Stripe.Invoice
    const subscriptionId = getInvoiceSubscriptionId(invoice)

    if (isRenewalInvoice(invoice) && subscriptionId) {
      const subscription = await stripe.subscriptions.retrieve(subscriptionId)
      const period = getSubscriptionPeriod(subscription)

      const { error: renewError } = await supabaseAdmin.rpc('renew_membership_period', {
        p_stripe_subscription_id: subscriptionId,
        p_period_start: period.currentPeriodStart,
        p_period_end: period.currentPeriodEnd,
      })

      // Throw rather than swallow: the catch below returns 500 so Stripe retries.
      // A silently dropped renewal leaves a paying customer with zero hours.
      if (renewError) {
        throw new Error(
          `Failed to renew membership for subscription ${subscriptionId}: ${renewError.message}`
        )
      }
    }
  }

  if (event.type === 'customer.subscription.updated' || event.type === 'customer.subscription.deleted') {
    const subscription = event.data.object as Stripe.Subscription
    const membershipStatus = subscription.status === 'active' ? 'active' : 'canceled'
    const period = getSubscriptionPeriod(subscription)

    const updates: Record<string, unknown> = {
      status: membershipStatus,
      current_period_start: period.currentPeriodStart,
      current_period_end: period.currentPeriodEnd,
    }

    if (event.type === 'customer.subscription.updated') {
      const priceId = subscription.items?.data?.[0]?.price?.id
      const pricing = await findMembershipPricing(subscription.metadata?.pricing_id, priceId)
      if (pricing) {
        updates.tier = pricing.name?.replace(/\s*Membership$/i, '')?.toLowerCase() ?? 'starter'
        updates.included_hours = pricing.included_hours
      }
    }

    await supabaseAdmin
      .from('memberships')
      .update(updates)
      .eq('stripe_subscription_id', subscription.id)
  }

  // Every side effect for this event has now committed, so record it. Anything
  // that failed above threw and skipped this line, leaving the event unmarked so
  // Stripe retries it.
  await supabaseAdmin
    .from('processed_stripe_events')
    .upsert({ event_id: event.id }, { onConflict: 'event_id', ignoreDuplicates: true })

  return NextResponse.json({ received: true })
  } catch (error) {
    /*
     * Reported explicitly, not left to Sentry's automatic instrumentation:
     * onRequestError only fires for errors that escape the handler, and this
     * catch swallows every one of them to return a controlled 500. Without this
     * line the most consequential route in the app is invisible.
     *
     * A 500 makes Stripe retry, and the retry re-runs the handler because the
     * processed_stripe_events marker is only written on success — so a spike
     * here means credit grants are failing, not merely that one delivery did.
     */
    reportError('stripe:webhook', error, { eventId: event.id, eventType: event.type })
    await flushReports()
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}
