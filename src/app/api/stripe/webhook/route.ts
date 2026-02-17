import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { resend } from '@/lib/resend'

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
            // Create New Customer
            const { data: newCustomer } = await supabaseAdmin.from('customers').insert({
                full_name: contactName,
                email: contactEmail,
                stripe_customer_id: stripeCustomerId,
            }).select().single()
            customer = newCustomer
        }
    }

    // 2. Update Booking Request
    if (bookingId && customer) {
        await supabaseAdmin.from('booking_requests').update({
            customer_id: customer.id,
            status: 'processing',
            stripe_payment_intent_id: session.payment_intent || session.subscription
        }).eq('id', bookingId)
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
    }

    // 5. Notify Admin
    const { data: adminSettings } = await supabaseAdmin.from('admin_settings').select('value').eq('key', 'notification_emails').single()
    const adminEmails = adminSettings?.value?.split(',') || []
    
    if (adminEmails.length > 0) {
        await resend.emails.send({
            from: 'ScoreMax <noreply@scoremax.com>',
            to: adminEmails,
            subject: 'New Payment & Booking',
            html: `
                <h1>New Payment Received</h1>
                <p><strong>Customer:</strong> ${contactName}</p>
                <p><strong>Amount:</strong> $${session.amount_total / 100}</p>
                <p><strong>Plan:</strong> ${planType}</p>
                <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/orders">View Orders</a></p>
            `
        })
    }
  }

  return NextResponse.json({ received: true })
}
