import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { buildSubjectCatalog, getSubjectMap } from '@/lib/subject-catalog'
import {
    availabilityWindowsFromLegacy,
    legacyAvailabilityFromWindows,
    normalizeAvailabilityWindows,
} from '@/lib/availability-windows'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { plan_type, plan_name, price_id, booking_details } = body

    // Cohort-based in-person SAT courses are no longer offered. Reject the plan
    // type outright and ignore any cohort_id an old client still sends.
    if (plan_type === 'sat-course-inperson') {
      throw new Error('In-person SAT courses are no longer offered')
    }

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
    const resolvedSubjects = rawSubjects.filter(id => id !== 'in-person-sat')

    // Per-day availability, with the pre-2026-08-04 flat shape accepted as a
    // fallback so a client running the previous bundle mid-deploy still books.
    // Both shapes are written from the same normalised value — see the note in
    // src/lib/availability-windows.js on why the legacy columns get the
    // envelope. Unlike /api/booking/submit this is not rejected when empty:
    // availability has never been required to take a payment, and refusing the
    // checkout over it would turn a missing preference into a lost sale.
    const availabilityWindows =
        normalizeAvailabilityWindows(booking_details.available_windows) ??
        availabilityWindowsFromLegacy(
            booking_details.available_days,
            booking_details.available_time_start,
            booking_details.available_time_end
        )
    const legacyAvailability = legacyAvailabilityFromWindows(availabilityWindows)

    // Resolve trusted price from server based on plan type
    let trustedPriceCents = 0
    let trustedPlanName = plan_name || ''
    let trustedIncludedHours: number | null = null
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
            .select('price_cents, name, included_hours')
            .eq('id', pkgId)
            .eq('type', 'package')
            .single()
        if (!pkg) throw new Error('Invalid package plan')
        trustedPriceCents = pkg.price_cents
        trustedPlanName = pkg.name
        trustedIncludedHours = pkg.included_hours
        line_items.push({
            price_data: { currency: 'usd', product_data: { name: pkg.name }, unit_amount: pkg.price_cents },
            quantity: 1,
        })
    } else if (plan_type === 'single') {
        const subjectIds: string[] = resolvedSubjects
        if (subjectIds.length === 0) throw new Error('No subjects selected')
        const { data: subjectRows } = await supabaseAdmin
            .from('subjects')
            .select('*')
            .eq('is_active', true)
        const subjectMap = getSubjectMap(buildSubjectCatalog(subjectRows ?? []))
        const maxRate = subjectIds.reduce((max: number, id: string) => {
            const rate = subjectMap[id]?.hourly_rate_cents ?? 0
            return Math.max(max, rate)
        }, 0)
        if (maxRate <= 0) throw new Error('Could not determine session rate')
        trustedPriceCents = maxRate
        trustedPlanName = 'Single Session'
        line_items.push({
            price_data: { currency: 'usd', product_data: { name: 'Tutoring Session' }, unit_amount: maxRate },
            quantity: 1,
        })
    } else if (plan_type === 'course') {
        const { data: coursePricing } = await supabaseAdmin
            .from('pricing')
            .select('price_cents, name')
            .eq('type', 'course')
        const courseType = String(body.courseType || 'sat')
        const matchesCourseType = (name: string) => {
            const n = name.toLowerCase()
            const hasSat = n.includes('sat')
            const hasAct = n.includes('act')
            if (courseType === 'sat-act-combined') return hasSat && hasAct
            if (courseType === 'act') return hasAct && !hasSat
            return hasSat && !hasAct
        }
        const matched = coursePricing?.find((c: { name: string }) => matchesCourseType(c.name))
        if (!matched) throw new Error(`No course pricing found for course type: ${courseType}`)

        trustedPriceCents = matched.price_cents
        trustedPlanName = matched.name

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
            // Left `undefined` rather than null when there is no availability:
            // supabase-js drops undefined keys, so the column is omitted from
            // the insert exactly as it was before this field existed.
            available_days: legacyAvailability?.days,
            available_time_start: legacyAvailability?.startTime,
            available_time_end: legacyAvailability?.endTime,
            available_windows: availabilityWindows,
            timezone: booking_details.timezone,
            session_type: booking_details.session_type,
            status: 'pending_payment',
            payment_type: plan_type,
            notes: booking_details.notes,
            amount_cents: trustedPriceCents,
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
            ...(body.plan_id && { plan_id: body.plan_id }),
            ...(trustedIncludedHours && { package_hours: String(trustedIncludedHours) }),
            user_id: user?.id,
            contact_name: booking_details.full_name,
            contact_email: booking_details.email,
            ...(booking_details.phone && { contact_phone: booking_details.phone }),
            ...(booking_details.student_grade && { student_grade: booking_details.student_grade }),
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
  } catch (error: unknown) {
    console.error('Stripe Checkout Error:', error)
    const message = error instanceof Error ? error.message : 'Unable to create checkout session'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
