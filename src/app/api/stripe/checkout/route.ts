import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { plan_type, plan_name, price_id, booking_details } = body
    const cohortId = booking_details?.cohort_id ?? null

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    let customerId = null
    let dbCustomerId = null
    let customerEmail = booking_details?.email

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

    const rawSubjects: string[] = Array.isArray(booking_details.subjects) ? booking_details.subjects : []
    const needsInPersonResolve = rawSubjects.includes('in-person-sat')
    let resolvedSubjects = rawSubjects

    if (needsInPersonResolve) {
        const { data: subjectRows } = await supabaseAdmin
            .from('subjects')
            .select('id, slug')
            .eq('slug', 'sat')
        const satId = subjectRows?.[0]?.id
        resolvedSubjects = rawSubjects
            .map((id: string) => (id === 'in-person-sat' && satId) ? satId : id)
            .filter((id: string) => id !== 'in-person-sat')
    }

    // Resolve trusted price from server based on plan type
    let trustedPriceCents = 0
    let trustedPlanName = plan_name || ''
    const line_items: Array<{ price?: string; price_data?: { currency: string; product_data: { name: string }; unit_amount: number }; quantity: number }> = []
    let mode: 'payment' | 'subscription' = 'payment'

    if (plan_type === 'membership') {
        if (!price_id) throw new Error('Missing price_id for membership')
        const { data: memberPlan } = await supabaseAdmin
            .from('pricing')
            .select('price_cents, name, stripe_price_id')
            .eq('stripe_price_id', price_id)
            .eq('type', 'membership')
            .single()
        if (!memberPlan) throw new Error('Invalid membership plan')
        trustedPriceCents = memberPlan.price_cents
        trustedPlanName = memberPlan.name
        mode = 'subscription'
        line_items.push({ price: memberPlan.stripe_price_id, quantity: 1 })
    } else if (plan_type === 'package') {
        const pkgId = body.plan_id || body.booking_details?.plan_id
        if (!pkgId) throw new Error('Missing plan_id for package')
        const { data: pkg } = await supabaseAdmin
            .from('pricing')
            .select('price_cents, name')
            .eq('id', pkgId)
            .eq('type', 'package')
            .single()
        if (!pkg) throw new Error('Invalid package plan')
        trustedPriceCents = pkg.price_cents
        trustedPlanName = pkg.name
        line_items.push({
            price_data: { currency: 'usd', product_data: { name: pkg.name }, unit_amount: pkg.price_cents },
            quantity: 1,
        })
    } else if (plan_type === 'single') {
        const subjectIds: string[] = resolvedSubjects
        if (subjectIds.length === 0) throw new Error('No subjects selected')
        const { data: subjects } = await supabaseAdmin
            .from('subjects')
            .select('hourly_rate_cents')
            .in('id', subjectIds)
        const maxRate = (subjects ?? []).reduce((max: number, s: { hourly_rate_cents: number }) => Math.max(max, s.hourly_rate_cents), 0)
        if (maxRate <= 0) throw new Error('Could not determine session rate')
        trustedPriceCents = maxRate
        trustedPlanName = 'Single Session'
        line_items.push({
            price_data: { currency: 'usd', product_data: { name: 'Tutoring Session' }, unit_amount: maxRate },
            quantity: 1,
        })
    } else if (plan_type === 'course' || plan_type === 'sat-course-inperson') {
        const { data: coursePricing } = await supabaseAdmin
            .from('pricing')
            .select('price_cents, name')
            .eq('type', 'course')
        const courseType = body.courseType || plan_type
        let matched = coursePricing?.find((c: { name: string }) => c.name.toLowerCase().includes(courseType.replace(/-/g, ' ')))
        if (!matched && coursePricing?.length) matched = coursePricing[0]

        if (plan_type === 'sat-course-inperson' && cohortId) {
            const { data: cohort } = await supabaseAdmin.from('sat_course_cohorts').select('price_cents').eq('id', cohortId).single()
            if (cohort) {
                trustedPriceCents = cohort.price_cents
                trustedPlanName = 'In-Person SAT Course'
            }
        } else if (matched) {
            trustedPriceCents = matched.price_cents
            trustedPlanName = matched.name
        }

        if (trustedPriceCents <= 0) throw new Error('Could not determine course price')
        line_items.push({
            price_data: { currency: 'usd', product_data: { name: trustedPlanName }, unit_amount: trustedPriceCents },
            quantity: 1,
        })
    } else {
        throw new Error(`Unknown plan type: ${plan_type}`)
    }

    const { data: booking, error: bookingError } = await supabaseAdmin
        .from('booking_requests')
        .insert({
            customer_id: dbCustomerId,
            subjects: resolvedSubjects,
            available_days: booking_details.available_days,
            available_time_start: booking_details.available_time_start,
            available_time_end: booking_details.available_time_end,
            timezone: booking_details.timezone,
            session_type: booking_details.session_type,
            status: 'pending_payment',
            payment_type: plan_type,
            notes: booking_details.notes,
            amount_cents: trustedPriceCents,
            ...(cohortId && { cohort_id: cohortId }),
        })
        .select()
        .single()

    if (bookingError) {
        throw new Error(`Failed to create booking: ${bookingError.message}`)
    }

    const session = await stripe.checkout.sessions.create({
        customer: customerId ?? undefined,
        customer_email: customerId ? undefined : customerEmail,
        line_items,
        mode,
        success_url: `${process.env.NEXT_PUBLIC_APP_URL}/book/confirmation?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/book`,
        allow_promotion_codes: true,
        metadata: {
            booking_request_id: booking.id,
            plan_type,
            plan_name: trustedPlanName || plan_type,
            user_id: user?.id,
            contact_name: booking_details.full_name,
            contact_email: booking_details.email,
            ...(cohortId && { cohort_id: cohortId }),
            ...(body.courseType && { course_type: body.courseType }),
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

