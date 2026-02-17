import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { plan_type, price_id, price_cents, booking_details } = body
    // plan_type: 'single', 'membership', 'package', 'course', 'sat-course-inperson'
    
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    let customerId = null
    let dbCustomerId = null
    let customerEmail = booking_details?.email

    // 1. Resolve Customer if Logged In
    if (user) {
        const { data: profile } = await supabaseAdmin
            .from('customers')
            .select('id, stripe_customer_id, email')
            .eq('profile_id', user.id)
            .single()
            
        if (profile) {
            customerId = profile.stripe_customer_id
            dbCustomerId = profile.id
            customerEmail = profile.email 
        }
    }

    // 2. Create Pending Booking Request
    const { data: booking, error: bookingError } = await supabaseAdmin
        .from('booking_requests')
        .insert({
            customer_id: dbCustomerId, // Nullable initially
            subjects: booking_details.subjects,
            available_days: booking_details.available_days,
            available_time_start: booking_details.available_time_start,
            available_time_end: booking_details.available_time_end,
            timezone: booking_details.timezone,
            session_type: booking_details.session_type,
            status: 'processing',
            payment_type: plan_type,
            notes: booking_details.notes,
            amount_cents: plan_type === 'single' ? price_cents : 0
        })
        .select()
        .single()

    if (bookingError) {
        throw new Error(`Failed to create booking: ${bookingError.message}`)
    }

    // 3. Prepare Stripe Session
    const line_items = []
    let mode: 'payment' | 'subscription' = 'payment'

    if (plan_type === 'membership') {
        mode = 'subscription'
        line_items.push({
            price: price_id,
            quantity: 1,
        })
    } else {
        mode = 'payment'
        line_items.push({
            price_data: {
                currency: 'usd',
                product_data: {
                    name: getProductName(plan_type, price_cents, booking_details),
                },
                unit_amount: price_cents,
            },
            quantity: 1,
        })
    }

    const session = await stripe.checkout.sessions.create({
        customer: customerId ?? undefined,
        customer_email: customerId ? undefined : customerEmail,
        line_items,
        mode,
        success_url: `${process.env.NEXT_PUBLIC_APP_URL}/book/confirmation?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/book`,
        metadata: {
            booking_request_id: booking.id,
            plan_type,
            user_id: user?.id,
            contact_name: booking_details.full_name,
            contact_email: booking_details.email
        },
        payment_intent_data: mode === 'payment' ? {
            metadata: {
                booking_request_id: booking.id
            }
        } : undefined,
        subscription_data: mode === 'subscription' ? {
            metadata: {
                booking_request_id: booking.id
            }
        } : undefined
    })

    return NextResponse.json({ url: session.url })
  } catch (error: any) {
    console.error('Stripe Checkout Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

function getProductName(type: string, cents: number, details: any) {
    if (type === 'package') {
        // Simple heuristic or generic name
        return 'Tutoring Package'
    }
    if (type === 'course') return 'Course Program'
    if (type === 'sat-course-inperson') return 'In-Person SAT Course'
    return `Tutoring Session (${details.session_type})`
}
