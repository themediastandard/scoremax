import { randomBytes } from 'crypto'
import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import type Stripe from 'stripe'
import { stripe } from '@/lib/stripe'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { resend, getEmailDefaults } from '@/lib/resend'
import { emailLayout, detailRow } from '@/lib/email-templates'
import { formatTime24To12 } from '@/lib/order-format'
import {
  getCheckoutPaymentIntentId,
  getInvoicePaymentIntentId,
  getSubscriptionPeriod,
} from '@/lib/stripe-subscription'

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
    console.error(`Webhook Error: ${message}`)
    return NextResponse.json({ error: `Webhook Error: ${message}` }, { status: 400 })
  }

  const { error: idempotencyError } = await supabaseAdmin
    .from('processed_stripe_events')
    .insert({ event_id: event.id })

  if (idempotencyError) {
    if (idempotencyError.code === '23505') {
      return NextResponse.json({ received: true, skipped: true })
    }
    console.error('Idempotency check failed:', idempotencyError.message)
    return NextResponse.json({ error: 'Unable to reserve webhook event' }, { status: 500 })
  }

  try {
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const metadata = session.metadata ?? {}
    const bookingId = metadata.booking_request_id
    const planType = metadata.plan_type
    const planName = metadata.plan_name
    const contactEmail = metadata.contact_email?.toLowerCase()
    const contactName = metadata.contact_name
    const contactPhone = metadata.contact_phone
    const studentGrade = metadata.student_grade
    const stripeCustomerId = typeof session.customer === 'string' ? session.customer : session.customer?.id ?? null
    let stripePaymentIntentId = getCheckoutPaymentIntentId(session)
    let membershipSubscription: Stripe.Subscription | null = null

    if (planType === 'membership' && session.subscription) {
      membershipSubscription = await stripe.subscriptions.retrieve(session.subscription as string, {
        expand: ['latest_invoice.payment_intent'],
      })
      stripePaymentIntentId ||= getInvoicePaymentIntentId(membershipSubscription.latest_invoice)
    }

    // 1. Resolve Customer
    let { data: customer } = await supabaseAdmin
        .from('customers')
        .select('*')
        .eq('stripe_customer_id', stripeCustomerId)
        .single()

    let isGuestCheckout = false
    let tempPassword: string | null = null
    if (!customer) {
        // Check by Email
        const { data: customerByEmail } = await supabaseAdmin
            .from('customers')
            .select('*')
            .ilike('email', contactEmail)
            .single()
            
        if (customerByEmail) {
            // Link Stripe ID
            await supabaseAdmin.from('customers').update({
                stripe_customer_id: stripeCustomerId,
                ...(contactName && { full_name: contactName }),
                ...(contactPhone && { phone: contactPhone }),
                ...(studentGrade && { student_grade: studentGrade }),
            }).eq('id', customerByEmail.id)
            customer = customerByEmail
        } else {
            isGuestCheckout = true
            tempPassword = randomBytes(9).toString('base64url')

            const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
                email: contactEmail,
                password: tempPassword,
                email_confirm: true,
                user_metadata: { full_name: contactName },
                app_metadata: { role: 'customer' },
            })

            let profileId: string | null = null
            if (authUser?.user) {
                profileId = authUser.user.id
            } else if (authError?.message?.toLowerCase().includes('already')) {
                const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 })
                const existingUser = existingUsers?.users?.find((u) => u.email?.toLowerCase() === contactEmail)
                if (existingUser) profileId = existingUser.id
            }

            const { data: triggerCreated } = await supabaseAdmin
                .from('customers')
                .select('*')
                .ilike('email', contactEmail)
                .single()

            if (triggerCreated) {
                await supabaseAdmin.from('customers').update({
                    stripe_customer_id: stripeCustomerId,
                    full_name: contactName,
                    ...(contactPhone && { phone: contactPhone }),
                    ...(studentGrade && { student_grade: studentGrade }),
                }).eq('id', triggerCreated.id)
                customer = { ...triggerCreated, stripe_customer_id: stripeCustomerId }
            } else {
                const { data: newCustomer } = await supabaseAdmin.from('customers').insert({
                    full_name: contactName,
                    email: contactEmail,
                    stripe_customer_id: stripeCustomerId,
                    ...(contactPhone && { phone: contactPhone }),
                    ...(studentGrade && { student_grade: studentGrade }),
                    ...(profileId && { profile_id: profileId }),
                }).select().single()
                customer = newCustomer
            }
        }
    }

    // 2. Update Booking Request
    if (bookingId && customer) {
        await supabaseAdmin.from('booking_requests').update({
            customer_id: customer.id,
            status: 'paid',
            stripe_payment_intent_id: stripePaymentIntentId,
        }).eq('id', bookingId).in('status', ['pending_payment', 'paid'])
    }

    // 3. Record Payment
    if (customer) {
        await supabaseAdmin.from('payments').insert({
            booking_request_id: bookingId,
            customer_id: customer.id,
            stripe_payment_intent_id: stripePaymentIntentId,
            amount_cents: session.amount_total,
            currency: session.currency,
            payment_type: planType,
            status: 'succeeded'
        })
    }

    // 4. Create Package/Course/Membership Records
    if (planType === 'package' && customer) {
        const metadataHours = Number(metadata.package_hours)
        let hours = Number.isFinite(metadataHours) && metadataHours > 0 ? metadataHours : null
        if (!hours && metadata.plan_id) {
          const { data: packagePricing } = await supabaseAdmin
            .from('pricing')
            .select('included_hours')
            .eq('id', metadata.plan_id)
            .eq('type', 'package')
            .single()
          hours = packagePricing?.included_hours ?? null
        }
        if (!hours) {
          hours = (session.amount_total ?? 0) >= 200000 ? 20 : 10
          console.error(`Package hours could not be resolved from metadata or pricing for booking ${bookingId}; falling back to amount heuristic (${hours}h). Verify the package record.`)
        }
        await supabaseAdmin.from('packages').insert({
            customer_id: customer.id,
            total_hours: hours,
            remaining_hours: hours - 1,
            stripe_payment_intent_id: stripePaymentIntentId
        })
    } else if ((planType === 'course' || planType === 'sat-course-inperson') && customer) {
        const courseType = metadata.course_type || ''
        const isCombined = courseType === 'sat-act-combined' || (session.amount_total ?? 0) > 300000
        const isACT = courseType === 'act'
        const cohortId = metadata.cohort_id ?? null
        const totalSessions = isCombined ? 13 : isACT ? 12 : 10

        await supabaseAdmin.from('course_enrollments').insert({
            customer_id: customer.id,
            course_type: planType === 'sat-course-inperson' ? 'sat-inperson' : (isCombined ? 'sat-act-combined' : isACT ? 'act' : 'sat'),
            cohort_id: cohortId,
            total_sessions: totalSessions,
            remaining_sessions: totalSessions,
            amount_cents: session.amount_total,
            status: 'active'
        })

        if (cohortId && planType === 'sat-course-inperson') {
            // Compare-and-swap so concurrent checkouts can't both read the same
            // count and write the same incremented value.
            let incremented = false
            for (let attempt = 0; attempt < 5 && !incremented; attempt++) {
                const { data: cohort } = await supabaseAdmin
                    .from('sat_course_cohorts')
                    .select('enrolled_count')
                    .eq('id', cohortId)
                    .single()
                if (!cohort) break
                const current = cohort.enrolled_count ?? 0
                let query = supabaseAdmin
                    .from('sat_course_cohorts')
                    .update({ enrolled_count: current + 1 })
                    .eq('id', cohortId)
                query = cohort.enrolled_count === null
                    ? query.is('enrolled_count', null)
                    : query.eq('enrolled_count', current)
                const { data: updated } = await query.select('id')
                incremented = Boolean(updated?.length)
            }
            if (!incremented) {
                console.error(`Failed to increment enrolled_count for cohort ${cohortId}`)
            }
        }
    } else if (planType === 'membership' && customer && session.subscription) {
        const subscription = membershipSubscription ?? await stripe.subscriptions.retrieve(session.subscription as string, {
          expand: ['latest_invoice.payment_intent'],
        })
        const priceId = subscription.items?.data?.[0]?.price?.id
        const period = getSubscriptionPeriod(subscription)
        const { data: pricing } = await supabaseAdmin
            .from('pricing')
            .select('name, included_hours')
            .eq('stripe_price_id', priceId)
            .eq('type', 'membership')
            .single()
        const tier = pricing?.name?.replace(/\s*Membership$/i, '')?.toLowerCase() ?? 'starter'
        const includedHours = pricing?.included_hours ?? 2
        await supabaseAdmin.from('memberships').insert({
            customer_id: customer.id,
            tier,
            stripe_subscription_id: subscription.id,
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
        const { data: order } = await supabaseAdmin
            .from('booking_requests')
            .select('subjects, session_type')
            .eq('id', bookingId)
            .single()

        await supabaseAdmin.from('sessions').insert({
            order_id: bookingId,
            customer_id: customer.id,
            session_type: order?.session_type || 'online',
            subjects: order?.subjects || [],
            status: 'pending_scheduling',
        })
    }

    // 6. Notify Admin
    const { data: adminSettings } = await supabaseAdmin.from('admin_settings').select('value').eq('key', 'notification_emails').single()
    const adminEmails = adminSettings?.value?.split(',') || []
    
    if (adminEmails.length > 0) {
        const planLabel = planName || (planType === 'membership' ? 'Membership' : planType === 'package' ? 'Tutoring Package' : planType === 'single' ? 'Single Session' : planType === 'sat-course-inperson' ? 'In-Person SAT Course' : planType === 'course' ? 'Course Program' : String(planType))

        try {
        await resend.emails.send({
            ...getEmailDefaults(),
            to: adminEmails,
            subject: 'New Payment & Booking',
            html: emailLayout({
              title: 'New Payment Received',
              body: [
                detailRow('Customer:', contactName),
                detailRow('Amount:', `$${(session.amount_total ?? 0) / 100}`),
                detailRow('Package:', planLabel),
              ].join(''),
              ctaText: 'View Orders',
              ctaUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/orders`,
            }),
        })
        } catch (emailError) {
          console.error('Failed to send admin payment notification:', emailError)
        }
    }

    // 7. Notify Customer (post-payment confirmation)
    if (contactEmail) {
      const planLabel = planType === 'membership' ? 'membership' : planType === 'package' ? 'tutoring package' : planType === 'sat-course-inperson' ? 'In-Person SAT Course' : 'course'
      const isInPersonCourse = planType === 'sat-course-inperson'
      const purchaseBody = isInPersonCourse
        ? ''
        : `<p style="margin: 0 0 16px 0;">Your payment has been received. You've purchased a ${planLabel}.</p>`

      let cohortScheduleHtml = ''
      const cohortId = metadata?.cohort_id
      if (isInPersonCourse && cohortId) {
        const { data: cohort } = await supabaseAdmin
          .from('sat_course_cohorts')
          .select('start_date, end_date, session_time_start, session_time_end')
          .eq('id', cohortId)
          .single()
        if (cohort?.start_date && cohort?.end_date) {
          const start = new Date(cohort.start_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
          const end = new Date(cohort.end_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
          const timeStart = formatTime24To12(cohort.session_time_start)
          const timeEnd = formatTime24To12(cohort.session_time_end)
          const timeRange = (timeStart !== '—' && timeEnd !== '—') ? ` ${timeStart}–${timeEnd}.` : '.'
          cohortScheduleHtml = `<p style="margin: 0 0 12px 0;"><strong style="color: #1e293b;">Schedule</strong></p><p style="margin: 0 0 16px 0;">${start} – ${end}. Sessions are Tuesdays and Thursdays${timeRange}</p>`
        }
      }

      const inPersonCourseDetails = isInPersonCourse
        ? [
            cohortScheduleHtml,
            '<p style="margin: 0 0 12px 0;"><strong style="color: #1e293b;">Location</strong></p>',
            '<p style="margin: 0 0 16px 0;">Florida Blue Center · 1970 Sawgrass Mills Cir, Sunrise, FL 33323-2994</p>',
            '<p style="margin: 0 0 12px 0;"><strong style="color: #1e293b;">What to Bring</strong></p>',
            '<ul style="margin: 0 0 16px 0; padding-left: 20px;">',
            '<li>Charged laptop or tablet and charger</li>',
            '<li>Notebook and pen or pencil</li>',
            '<li>Stylus (if applicable)</li>',
            '</ul>',
          ].filter(Boolean).join('')
        : ''

      const nextSteps = isInPersonCourse
        ? ''
        : '<p style="margin: 0 0 16px 0;">We will assign a tutor and confirm your session time shortly. You will receive another email once your booking is confirmed.</p>'

      const accountBody = isGuestCheckout && tempPassword
        ? [
            '<p style="margin: 0 0 16px 0;">We\'ve created an account for you. Use the credentials below to sign in and view your dashboard:</p>',
            `<p style="margin: 0 0 4px 0;"><strong style="color: #1e293b;">Email:</strong> ${contactEmail}</p>`,
            `<p style="margin: 0 0 16px 0;"><strong style="color: #1e293b;">Temporary Password:</strong> ${tempPassword}</p>`,
            '<p style="margin: 0 0 16px 0; font-size: 14px; color: #6b7280;">You can change your password anytime from your account settings.</p>',
          ].join('')
        : ''

      try {
        await resend.emails.send({
          ...getEmailDefaults(),
          to: contactEmail,
          subject: 'Thank you for your purchase',
          html: emailLayout({
            title: isInPersonCourse ? 'Welcome to the SAT Course!' : 'Thank You for Your Purchase',
            greeting: `Hi ${contactName || 'there'},`,
            body: purchaseBody + (isInPersonCourse ? inPersonCourseDetails : '') + nextSteps + accountBody,
            ctaText: 'Sign In to Your Dashboard',
            ctaUrl: `${process.env.NEXT_PUBLIC_APP_URL}/login`,
          }),
        })
      } catch (emailError) {
        console.error('Failed to send customer payment notification:', emailError)
      }
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
      if (priceId) {
        const { data: pricing } = await supabaseAdmin
          .from('pricing')
          .select('name, included_hours')
          .eq('stripe_price_id', priceId)
          .eq('type', 'membership')
          .single()
        if (pricing) {
          updates.tier = pricing.name?.replace(/\s*Membership$/i, '')?.toLowerCase() ?? 'starter'
          updates.included_hours = pricing.included_hours
        }
      }
    }

    await supabaseAdmin
      .from('memberships')
      .update(updates)
      .eq('stripe_subscription_id', subscription.id)
  }

  return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Stripe webhook processing failed:', error)
    await supabaseAdmin
      .from('processed_stripe_events')
      .delete()
      .eq('event_id', event.id)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}
