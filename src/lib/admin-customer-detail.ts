import 'server-only'

import { supabaseAdmin } from '@/lib/supabase/admin'
import { unexpiredPackagesClause } from '@/lib/package-expiry'

export interface AdminCustomerDetail {
  customer: {
    id: string
    full_name: string | null
    email: string
    phone: string | null
    account_type: 'parent' | 'student' | null
    created_at: string
  }
  students: Array<{
    id: string
    full_name: string
    email: string
    phone: string | null
    grade: string
    is_active: boolean
  }>
  memberships: Array<{
    tier: string
    status: string
    included_hours: number
    used_hours: number
    rollover_hours: number
  }>
  packages: Array<{
    total_hours: number
    remaining_hours: number
    student_id: string | null
  }>
  courseEnrollments: Array<{
    student_id: string | null
    remaining_sessions: number
    status: string
  }>
  orders: Array<{
    id: string
    created_at: string
    status: string | null
    payment_type: string | null
    payment_method: string | null
    amount_cents: number | null
    stripe_payment_intent_id: string | null
    payments: Array<{ amount_cents: number | null; payment_method: string | null }> | null
    customers: {
      packages: Array<{
        total_hours: number
        stripe_payment_intent_id: string | null
      }>
    } | null
    student: { id: string; full_name: string; grade: string } | null
  }>
  sessions: Array<{
    id: string
    status: string | null
    confirmed_start: string | null
    confirmed_end: string | null
    session_type: string | null
    student: { id: string; full_name: string; grade: string } | null
    tutors: { full_name: string | null } | null
  }>
  approvals: { step_up: boolean; zelle: boolean }
}

type QueryResult = { data: unknown; error: { message?: string } | null }

function assertRelatedQueries(results: QueryResult[]) {
  if (results.some((result) => result.error)) {
    throw new Error('Could not load customer details')
  }
}

export async function loadAdminCustomerDetail(
  customerId: string
): Promise<AdminCustomerDetail | null> {
  const { data: customer, error: customerError } = await supabaseAdmin
    .from('customers')
    .select('id, full_name, email, phone, account_type, created_at')
    .eq('id', customerId)
    .maybeSingle()

  if (customerError) throw new Error('Could not load customer')
  if (!customer) return null

  const [
    studentsResult,
    membershipsResult,
    packagesResult,
    satCoursesResult,
    actCoursesResult,
    ordersResult,
    sessionsResult,
    approvalsResult,
  ] = await Promise.all([
    supabaseAdmin
      .from('students')
      .select('id, full_name, email, phone, grade, is_active')
      .eq('customer_id', customerId)
      .order('is_active', { ascending: false })
      .order('full_name', { ascending: true }),
    supabaseAdmin
      .from('memberships')
      .select('tier, status, included_hours, used_hours, rollover_hours')
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false }),
    supabaseAdmin
      .from('packages')
      .select('total_hours, remaining_hours, student_id')
      .eq('customer_id', customerId)
      .gt('remaining_hours', 0)
      .or(unexpiredPackagesClause()),
    supabaseAdmin
      .from('course_enrollments')
      .select('student_id, remaining_sessions, status')
      .eq('customer_id', customerId)
      .eq('status', 'active')
      .gt('remaining_sessions', 0),
    supabaseAdmin
      .from('act_course_enrollments')
      .select('student_id, remaining_sessions, status')
      .eq('customer_id', customerId)
      .eq('status', 'active')
      .gt('remaining_sessions', 0),
    supabaseAdmin
      .from('booking_requests')
      .select('id, created_at, status, payment_type, payment_method, amount_cents, stripe_payment_intent_id, payments(amount_cents, payment_method), customers(packages(total_hours, stripe_payment_intent_id)), student:students(id, full_name, grade)')
      .eq('customer_id', customerId)
      .neq('status', 'pending_payment')
      .order('created_at', { ascending: false }),
    supabaseAdmin
      .from('sessions')
      .select('id, status, confirmed_start, confirmed_end, session_type, student:students(id, full_name, grade), tutors(full_name)')
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false }),
    supabaseAdmin
      .from('customer_payment_approvals')
      .select('payment_method, approved_at, revoked_at')
      .eq('customer_id', customerId)
      .in('payment_method', ['step_up', 'zelle']),
  ])

  assertRelatedQueries([
    studentsResult,
    membershipsResult,
    packagesResult,
    satCoursesResult,
    actCoursesResult,
    ordersResult,
    sessionsResult,
    approvalsResult,
  ])

  const approvals = { step_up: false, zelle: false }
  for (const approval of approvalsResult.data ?? []) {
    const paymentMethod = approval.payment_method as unknown
    if (paymentMethod !== 'step_up' && paymentMethod !== 'zelle') continue
    approvals[paymentMethod] = Boolean(approval.approved_at && !approval.revoked_at)
  }

  return {
    customer,
    students: studentsResult.data ?? [],
    memberships: membershipsResult.data ?? [],
    packages: packagesResult.data ?? [],
    courseEnrollments: [...(satCoursesResult.data ?? []), ...(actCoursesResult.data ?? [])],
    // Supabase's ungenerated client types infer aliased to-one relationships as
    // arrays. PostgREST returns the singular objects described by these types.
    orders: (ordersResult.data ?? []) as unknown as AdminCustomerDetail['orders'],
    sessions: (sessionsResult.data ?? []) as unknown as AdminCustomerDetail['sessions'],
    approvals,
  }
}
