import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { resend, getEmailDefaults } from '@/lib/resend'
import { emailLayout, detailRow } from '@/lib/email-templates'

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
  } catch (err: any) {
    console.error(`Webhook Error: ${err.message}`)
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as any
    const metadata = session.metadata
    const bookingId = metadata.booking_request_id
    const planType = metadata.plan_type
    const planName = metadata.plan_name
    const contactEmail = metadata.contact_email
    const contactName = metadata.contact_name
    const stripeCustomerId = session.customer

    // 1. Resolve Customer
    let { data: customer } = await supabaseAdmin
        .from('customers')
        .select('*')
        .eq('stripe_customer_id', stripeCustomerId)
        .single()

    if (!customer) {
        // Check by Email
        const { data: customerByEmail } = await supabaseAdmin
            .from('customers')
            .select('*')
            .eq('email', contactEmail)
            .single()
            
        if (customerByEmail) {
            // Link Stripe ID
            await supabaseAdmin.from('customers').update({ stripe_customer_id: stripeCustomerId }).eq('id', customerByEmail.id)
            customer = customerByEmail
        } else {
            // Create Auth Account for guest checkout
            const inviteResult = await supabaseAdmin.auth.admin.inviteUserByEmail(contactEmail, {
                data: { full_name: contactName, role: 'customer' },
                redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
            })

            let profileId: string | null = null
            if (inviteResult.data?.user) {
                profileId = inviteResult.data.user.id
            } else if (inviteResult.error?.message?.includes('already been registered')) {
                const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 })
                const existingUser = existingUsers?.users?.find((u) => u.email === contactEmail)
                if (existingUser) profileId = existingUser.id
            }

            // The on_auth_user_created trigger may have already created a customer record.
            // Check for it before attempting an insert.
            const { data: triggerCreated } = await supabaseAdmin
                .from('customers')
                .select('*')
                .eq('email', contactEmail)
                .single()

            if (triggerCreated) {
                await supabaseAdmin.from('customers').update({
                    stripe_customer_id: stripeCustomerId,
                    full_name: contactName,
                }).eq('id', triggerCreated.id)
                customer = { ...triggerCreated, stripe_customer_id: stripeCustomerId }
            } else {
                const { data: newCustomer } = await supabaseAdmin.from('customers').insert({
                    full_name: contactName,
                    email: contactEmail,
                    stripe_customer_id: stripeCustomerId,
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
            status: 'processing',
            stripe_payment_intent_id: session.payment_intent || session.subscription
        }).eq('id', bookingId).in('status', ['pending_payment', 'processing'])
    }

    // 3. Record Payment
    if (customer) {
        await supabaseAdmin.from('payments').insert({
            booking_request_id: bookingId,
            customer_id: customer.id,
            stripe_payment_intent_id: session.payment_intent || session.subscription,
            amount_cents: session.amount_total,
            currency: session.currency,
            payment_type: planType,
            status: 'succeeded'
        })
    }

    // 4. Create Package/Course/Membership Records
    if (planType === 'package' && customer) {
        const hours = session.amount_total >= 200000 ? 20 : 10
        await supabaseAdmin.from('packages').insert({
            customer_id: customer.id,
            total_hours: hours,
            remaining_hours: hours, // We don't deduct for the booking automatically yet to remain safe
            stripe_payment_intent_id: session.payment_intent
        })
    } else if ((planType === 'course' || planType === 'sat-course-inperson') && customer) {
        const isCombined = session.amount_total > 300000
        const isSat = true // Simplification for MVP, ideally assume SAT or derive from price
        
        await supabaseAdmin.from('course_enrollments').insert({
            customer_id: customer.id,
            course_type: planType === 'sat-course-inperson' ? 'sat-inperson' : (isCombined ? 'sat-act-combined' : 'sat'),
            total_sessions: isCombined ? 13 : 10,
            remaining_sessions: isCombined ? 13 : 10,
            amount_cents: session.amount_total,
            status: 'active'
        })
    } else if (planType === 'membership' && customer && session.subscription) {
        const subscription = await stripe.subscriptions.retrieve(session.subscription as string)
        const priceId = subscription.items?.data?.[0]?.price?.id
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
            used_hours: 0,
            rollover_hours: 0,
            current_period_start: subscription.current_period_start
                ? new Date(subscription.current_period_start * 1000).toISOString()
                : null,
            current_period_end: subscription.current_period_end
                ? new Date(subscription.current_period_end * 1000).toISOString()
                : null,
        })
    }

    // 5. Notify Admin
    const { data: adminSettings } = await supabaseAdmin.from('admin_settings').select('value').eq('key', 'notification_emails').single()
    const adminEmails = adminSettings?.value?.split(',') || []
    
    if (adminEmails.length > 0) {
        const planLabel = planName || (planType === 'membership' ? 'Membership' : planType === 'package' ? 'Tutoring Package' : planType === 'single' ? 'Single Session' : planType === 'sat-course-inperson' ? 'In-Person SAT Course' : planType === 'course' ? 'Course Program' : planType)

        await resend.emails.send({
            ...getEmailDefaults(),
            to: adminEmails,
            subject: 'New Payment & Booking',
            html: emailLayout({
              title: 'New Payment Received',
              body: [
                detailRow('Customer:', contactName),
                detailRow('Amount:', `$${session.amount_total / 100}`),
                detailRow('Package:', planLabel),
              ].join(''),
              ctaText: 'View Orders',
              ctaUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/orders`,
            }),
        })
    }

    // 6. Notify Customer (post-payment confirmation)
    if (contactEmail) {
      const planLabel = planType === 'membership' ? 'membership' : planType === 'package' ? 'tutoring package' : 'course'
      await resend.emails.send({
        ...getEmailDefaults(),
        to: contactEmail,
        subject: 'Thank you for your purchase',
        html: emailLayout({
          title: 'Thank You for Your Purchase',
          greeting: `Hi ${contactName || 'there'},`,
          body: [
            `<p style="margin: 0 0 16px 0;">Your payment has been received. You've purchased a ${planLabel}.</p>`,
            '<p style="margin: 0;">We will assign a tutor and confirm your session time shortly. You will receive another email once your booking is confirmed.</p>',
          ].join(''),
          ctaText: 'View Dashboard',
          ctaUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
        }),
      })
    }
  }

  if (event.type === 'checkout.session.expired') {
    const session = event.data.object as any
    const bookingId = session.metadata?.booking_request_id
    if (bookingId) {
      await supabaseAdmin
        .from('booking_requests')
        .delete()
        .eq('id', bookingId)
        .eq('status', 'pending_payment')
    }
  }

  // Handle subscription updates and cancellation (sync period dates, handle cancel)
  if (event.type === 'customer.subscription.updated' || event.type === 'customer.subscription.deleted') {
    const subscription = event.data.object as any
    const membershipStatus = subscription.status === 'active' ? 'active' : 'canceled'
    await supabaseAdmin
      .from('memberships')
      .update({
        status: membershipStatus,
        current_period_start: subscription.current_period_start
          ? new Date(subscription.current_period_start * 1000).toISOString()
          : null,
        current_period_end: subscription.current_period_end
          ? new Date(subscription.current_period_end * 1000).toISOString()
          : null,
      })
      .eq('stripe_subscription_id', subscription.id)
  }

  return NextResponse.json({ received: true })
}
