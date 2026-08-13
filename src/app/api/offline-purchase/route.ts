import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { isOfflinePaymentMethod, formatPaymentMethod } from '@/lib/payment-method'
import {
  availabilityWindowsFromLegacy,
  legacyAvailabilityFromWindows,
  normalizeAvailabilityWindows,
} from '@/lib/availability-windows'
import { sendEmail, getEmailDefaults } from '@/lib/resend'
import { emailLayout, detailRow } from '@/lib/email-templates'
import { reportIssue } from '@/lib/report-error'

const optionalUuid = z.string().uuid().nullish().transform((value) => value ?? null)

const purchaseSchema = z.object({
  payment_method: z.enum(['step_up', 'zelle']),
  idempotency_key: z.string().uuid(),
  plan_type: z.enum(['single', 'package', 'course']),
  student_id: z.string().uuid(),
  plan_id: optionalUuid,
  courseType: z.enum(['sat', 'act', 'sat-act-combined']).nullish(),
  booking_details: z.object({
    subjects: z.array(z.string().uuid()).min(1).max(20),
    available_windows: z.unknown().optional(),
    available_days: z.unknown().optional(),
    available_time_start: z.unknown().optional(),
    available_time_end: z.unknown().optional(),
    timezone: z.string().trim().min(1).max(100),
    session_type: z.literal('online'),
    full_name: z.string().trim().min(1).max(200),
    phone: z.string().trim().max(50).optional().default(''),
    // Accepted only so a stale pre-child browser bundle does not fail during a
    // rolling deploy. Managed-child grade belongs to students.grade and is
    // deliberately not forwarded to the customer/RPC.
    student_grade: z.string().trim().max(100).optional().default(''),
    notes: z.string().trim().max(5000).optional().default(''),
  }).strict(),
}).strict()

interface OfflinePurchaseResult {
  booking_id: string
  customer_id: string
  student_id: string
  amount_cents: number
  payment_method: 'step_up' | 'zelle'
  plan_type: 'single' | 'package' | 'course'
  plan_name: string
  purchase_key: string
  created: boolean
}

function rpcErrorResponse(message: string, paymentMethod: 'step_up' | 'zelle') {
  if (message.includes('account_not_approved')) {
    return NextResponse.json({
      error: 'Account Not Approved',
      code: 'account_not_approved',
      payment_method: paymentMethod,
    }, { status: 403 })
  }
  if (message.includes('customer_not_found')) {
    return NextResponse.json({ error: 'Customer profile not found' }, { status: 404 })
  }
  if (message.includes('student_not_active_or_owned')) {
    return NextResponse.json({ error: 'Select an active student on your account' }, { status: 403 })
  }
  if (message.includes('idempotency_key_reused')) {
    return NextResponse.json({ error: 'This purchase key was already used for different details' }, { status: 409 })
  }
  if (
    /invalid_|missing_|not_allowed|no_subjects|sat_act_requires|course_subject|single_session/.test(message)
  ) {
    return NextResponse.json({ error: 'Invalid purchase selection' }, { status: 400 })
  }
  return null
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let json: unknown
  try {
    json = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const parsed = purchaseSchema.safeParse(json)
  if (!parsed.success || !isOfflinePaymentMethod(parsed.data.payment_method)) {
    return NextResponse.json({ error: 'Invalid purchase request' }, { status: 400 })
  }

  const body = parsed.data
  const details = body.booking_details
  const windows =
    normalizeAvailabilityWindows(details.available_windows) ??
    availabilityWindowsFromLegacy(
      details.available_days,
      details.available_time_start,
      details.available_time_end
    )
  const legacy = legacyAvailabilityFromWindows(windows)

  if (!windows || !legacy) {
    return NextResponse.json(
      { error: 'Select at least one day, each with a start and end time.' },
      { status: 400 }
    )
  }

  const { data, error } = await supabaseAdmin
    .rpc('create_offline_purchase', {
      p_profile_id: user.id,
      p_student_id: body.student_id,
      p_payment_method: body.payment_method,
      p_idempotency_key: body.idempotency_key,
      p_plan_type: body.plan_type,
      p_plan_id: body.plan_id,
      p_course_type: body.courseType ?? null,
      p_subjects: details.subjects,
      p_available_days: legacy.days,
      p_available_time_start: legacy.startTime,
      p_available_time_end: legacy.endTime,
      p_available_windows: windows,
      p_timezone: details.timezone,
      p_session_type: details.session_type,
      p_notes: details.notes,
      p_full_name: details.full_name,
      p_phone: details.phone,
    })
    .single<OfflinePurchaseResult>()

  if (error || !data) {
    const safeResponse = rpcErrorResponse(error?.message ?? '', body.payment_method)
    if (safeResponse) return safeResponse
    reportIssue('offline-purchase:transaction', 'Offline purchase transaction failed', {
      supabaseError: error?.message,
      paymentMethod: body.payment_method,
      planType: body.plan_type,
    })
    return NextResponse.json({ error: 'Could not complete purchase' }, { status: 500 })
  }

  const [{ data: customer }, { data: adminSettings }] = await Promise.all([
    supabaseAdmin
      .from('customers')
      .select('full_name, email')
      .eq('id', data.customer_id)
      .single(),
    supabaseAdmin
      .from('admin_settings')
      .select('value')
      .eq('key', 'notification_emails')
      .maybeSingle(),
  ])

  const methodLabel = formatPaymentMethod(data.payment_method)
  const amountLabel = `$${(data.amount_cents / 100).toLocaleString()}`
  const adminEmails = adminSettings?.value
    ?.split(',')
    .map((email: string) => email.trim())
    .filter(Boolean) ?? []

  // Notifications are best effort after the transaction commits. A replay of
  // the same purchase never sends again; if the original send fails, the order
  // remains durable and the failure is reported by sendEmail for follow-up.
  if (data.created && adminEmails.length > 0) {
    await sendEmail(
      {
        ...getEmailDefaults(),
        to: adminEmails,
        subject: `New ${methodLabel} Purchase & Booking`,
        html: emailLayout({
          title: 'New Payment Received',
          body: [
            detailRow('Customer:', customer?.full_name ?? customer?.email ?? 'Unknown'),
            detailRow('Amount:', amountLabel),
            detailRow('Method:', methodLabel),
            detailRow('Package:', data.plan_name),
          ].join(''),
          ctaText: 'View Order',
          ctaUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/orders/${data.booking_id}`,
        }),
      },
      `offline:admin:${data.booking_id}`,
      `offline:admin:${data.booking_id}`
    )
  }

  if (data.created && customer?.email) {
    await sendEmail(
      {
        ...getEmailDefaults(),
        to: customer.email,
        subject: 'ScoreMax Purchase Confirmed',
        html: emailLayout({
          title: 'Purchase Confirmed',
          greeting: `Hi ${customer.full_name},`,
          body: [
            '<p style="margin: 0 0 16px 0;">Your payment has been recorded and your booking request is ready for scheduling.</p>',
            detailRow('Purchase:', data.plan_name),
            detailRow('Amount:', amountLabel),
            detailRow('Payment method:', methodLabel),
          ].join(''),
          ctaText: 'View Your Orders',
          ctaUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/orders/${data.booking_id}`,
        }),
      },
      `offline:customer:${data.booking_id}`,
      `offline:customer:${data.booking_id}`
    )
  }

  return NextResponse.json({
    id: data.booking_id,
    booking_id: data.booking_id,
    amount_cents: data.amount_cents,
    payment_method: data.payment_method,
    idempotent_replay: !data.created,
  })
}
