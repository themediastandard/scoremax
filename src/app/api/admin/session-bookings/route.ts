import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { getAuthUser, requireAdmin } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase/admin'
import {
  businessLocalDateTimeToIso,
  isOneHourSession,
} from '@/lib/admin-session-booking'
import { loadAdminStudentCreditSummary } from '@/lib/admin-session-credit'
import { processAdminSessionDelivery } from '@/lib/admin-session-delivery'
import { reportError } from '@/lib/report-error'

const uuid = z.string().uuid()
const createSchema = z.object({
  customerId: uuid,
  studentId: uuid,
  tutorId: uuid,
  subjectIds: z.array(uuid).min(1).max(20),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/),
  internalNotes: z.string().trim().max(2000).optional().default(''),
  idempotencyKey: uuid,
})

type BookingResult = {
  booking_id: string
  session_id: string
  audit_id: string
  credit_source_type: string
  credit_source_id: string
  eligible_credits_before: number
  eligible_credits_after: number
  created: boolean
}

const knownErrors: Array<[string, string, number]> = [
  ['admin_required', 'Administrator access is required.', 403],
  ['customer_not_found', 'Choose a valid account owner.', 400],
  ['student_not_active_or_owned', 'Choose an active student belonging to this account.', 400],
  ['tutor_not_active', 'Choose an active tutor.', 400],
  ['invalid_subject_selection', 'Choose at least one currently available subject.', 400],
  ['invalid_session_time', 'Choose a future one-hour session in Eastern Time.', 400],
  ['admin_booking_tutor_overlap', 'That tutor already has a session during this time.', 409],
  ['no_available_credits', 'No eligible credits are available for this student.', 409],
  ['idempotency_key_reused', 'This booking attempt changed. Close the form and start a new booking.', 409],
]

export async function GET(req: NextRequest) {
  const authError = await requireAdmin()
  if (authError) return authError

  const customerId = req.nextUrl.searchParams.get('customer_id')
  const studentId = req.nextUrl.searchParams.get('student_id')
  if (!uuid.safeParse(customerId).success || !uuid.safeParse(studentId).success) {
    return NextResponse.json({ error: 'Choose an account owner and student.' }, { status: 400 })
  }

  try {
    const summary = await loadAdminStudentCreditSummary(customerId!, studentId!)
    if (!summary) {
      return NextResponse.json(
        { error: 'Choose an active student belonging to this account.' },
        { status: 404 },
      )
    }
    return NextResponse.json(summary)
  } catch (error) {
    reportError('admin-booking:credit-summary', error, { customerId, studentId })
    return NextResponse.json({ error: 'Could not load the credit balance.' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const authError = await requireAdmin()
  if (authError) return authError
  const admin = await getAuthUser()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const parsed = createSchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ error: 'Check every required booking field and try again.' }, { status: 400 })
  }

  const input = parsed.data
  const start = businessLocalDateTimeToIso(input.date, input.startTime)
  const end = businessLocalDateTimeToIso(input.date, input.endTime)
  if (!start.ok || !end.ok) {
    const ambiguous = (!start.ok && start.code === 'ambiguous_business_datetime') ||
      (!end.ok && end.code === 'ambiguous_business_datetime')
    return NextResponse.json(
      {
        error: ambiguous
          ? 'That time occurs twice during the daylight-saving change. Choose another time.'
          : 'That date or time is not valid in Eastern Time.',
      },
      { status: 400 },
    )
  }
  if (!isOneHourSession(start.iso, end.iso)) {
    return NextResponse.json(
      { error: 'One credit books exactly one hour. Choose an end time one hour after the start.' },
      { status: 400 },
    )
  }

  const { data: booking, error } = await supabaseAdmin
    .rpc('admin_book_session_with_credit', {
      p_admin_profile_id: admin.id,
      p_customer_id: input.customerId,
      p_student_id: input.studentId,
      p_tutor_id: input.tutorId,
      p_subject_ids: input.subjectIds,
      p_confirmed_start: start.iso,
      p_confirmed_end: end.iso,
      p_session_type: 'online',
      p_internal_notes: input.internalNotes,
      p_idempotency_key: input.idempotencyKey,
    })
    .single<BookingResult>()

  if (error || !booking) {
    const known = knownErrors.find(([code]) => error?.message.includes(code))
    if (known) return NextResponse.json({ error: known[1] }, { status: known[2] })
    reportError('admin-booking:atomic-create', error ?? new Error('missing_booking_result'))
    return NextResponse.json({ error: 'Could not book this session. No credit was used.' }, { status: 500 })
  }

  let delivery
  try {
    delivery = await processAdminSessionDelivery(booking.session_id)
  } catch (deliveryError) {
    reportError('admin-booking:delivery-start', deliveryError, { sessionId: booking.session_id })
    delivery = {
      status: 'attention' as const,
      calendarStatus: 'attention' as const,
      emailStatus: 'attention' as const,
      warning:
        'The session and credit are safely recorded, but calendar and email setup still need attention. Retry from the session.',
    }
  }

  revalidatePath('/dashboard/sessions')
  revalidatePath('/dashboard/orders')
  revalidatePath(`/dashboard/orders/${booking.booking_id}`)

  return NextResponse.json({
    bookingId: booking.booking_id,
    sessionId: booking.session_id,
    created: booking.created,
    credit: {
      source: booking.credit_source_type,
      before: booking.eligible_credits_before,
      after: booking.eligible_credits_after,
    },
    delivery,
  })
}
