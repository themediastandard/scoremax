import { redirect } from 'next/navigation'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { getAuthUser, getProfile } from '@/lib/auth'
import { CustomersTable } from '@/components/dashboard/CustomersTable'
import { unexpiredPackagesClause } from '@/lib/package-expiry'
import { getChargedCents } from '@/lib/order-amount'

export default async function CustomersPage() {
  const user = await getAuthUser()
  if (!user) redirect('/login')

  const profile = await getProfile(user.id)
  if (profile?.role !== 'admin') redirect('/dashboard')

  const [
    { data: customers },
    { data: memberships },
    { data: packages },
    { data: satCourses },
    { data: actCourses },
    { data: orders },
    { data: sessions },
    { data: students },
    { data: paymentApprovals },
  ] = await Promise.all([
    supabaseAdmin
      .from('customers')
      .select('id, full_name, email, phone, student_grade, account_type, created_at')
      .order('created_at', { ascending: false }),
    supabaseAdmin
      .from('memberships')
      .select('customer_id, tier, status, included_hours, used_hours, rollover_hours')
      .eq('status', 'active'),
    supabaseAdmin
      .from('packages')
      .select('customer_id, total_hours, remaining_hours')
      .gt('remaining_hours', 0)
      .or(unexpiredPackagesClause()),
    supabaseAdmin
      .from('course_enrollments')
      .select('customer_id, remaining_sessions')
      .eq('status', 'active')
      .gt('remaining_sessions', 0),
    supabaseAdmin
      .from('act_course_enrollments')
      .select('customer_id, remaining_sessions')
      .eq('status', 'active')
      .gt('remaining_sessions', 0),
    supabaseAdmin
      .from('booking_requests')
      .select('customer_id, amount_cents, stripe_payment_intent_id, payments(amount_cents)')
      .eq('status', 'paid'),
    supabaseAdmin
      .from('sessions')
      .select('customer_id, status, confirmed_start'),
    supabaseAdmin
      .from('students')
      .select('id, customer_id, full_name, email, grade, is_active')
      .order('full_name', { ascending: true }),
    supabaseAdmin
      .from('customer_payment_approvals')
      .select('customer_id, payment_method, approved_at, revoked_at')
      .in('payment_method', ['step_up', 'zelle']),
  ])

  const studentMap: Record<string, Array<{ id: string; full_name: string; email: string; grade: string; is_active: boolean }>> = {}
  for (const student of students ?? []) {
    studentMap[student.customer_id] = [...(studentMap[student.customer_id] ?? []), student]
  }

  const membershipMap: Record<string, { tier: string; status: string; included_hours: number; used_hours: number; rollover_hours: number }> = {}
  for (const m of memberships ?? []) {
    membershipMap[m.customer_id] = m
  }

  const packageCreditsMap: Record<string, number> = {}
  for (const p of packages ?? []) {
    packageCreditsMap[p.customer_id] = (packageCreditsMap[p.customer_id] ?? 0) + p.remaining_hours
  }

  const courseCreditsMap: Record<string, number> = {}
  for (const enrollment of [...(satCourses ?? []), ...(actCourses ?? [])]) {
    courseCreditsMap[enrollment.customer_id] =
      (courseCreditsMap[enrollment.customer_id] ?? 0) + enrollment.remaining_sessions
  }

  const orderCountMap: Record<string, number> = {}
  const totalSpentMap: Record<string, number> = {}
  for (const o of orders ?? []) {
    orderCountMap[o.customer_id] = (orderCountMap[o.customer_id] ?? 0) + 1
    totalSpentMap[o.customer_id] =
      (totalSpentMap[o.customer_id] ?? 0) + (getChargedCents(o) ?? 0)
  }

  const paymentApprovalMap: Record<string, { step_up: boolean; zelle: boolean }> = {}
  for (const approval of paymentApprovals ?? []) {
    const current = paymentApprovalMap[approval.customer_id] ?? { step_up: false, zelle: false }
    const isApproved = Boolean(approval.approved_at && !approval.revoked_at)
    if (approval.payment_method === 'step_up') current.step_up = isApproved
    else if (approval.payment_method === 'zelle') current.zelle = isApproved
    else continue
    paymentApprovalMap[approval.customer_id] = current
  }

  const sessionCountMap: Record<string, { completed: number; upcoming: number }> = {}
  const nextSessionMap: Record<string, {
    status: 'pending_scheduling' | 'scheduled'
    confirmed_start: string | null
  }> = {}
  const now = new Date()
  for (const s of sessions ?? []) {
    const curr = sessionCountMap[s.customer_id] ?? { completed: 0, upcoming: 0 }
    if (s.status === 'completed') curr.completed++
    else if (s.status === 'scheduled' || s.status === 'pending_scheduling') curr.upcoming++
    sessionCountMap[s.customer_id] = curr

    if (s.status === 'pending_scheduling' && !nextSessionMap[s.customer_id]) {
      nextSessionMap[s.customer_id] = { status: 'pending_scheduling', confirmed_start: null }
    }
    if (s.status === 'scheduled' && s.confirmed_start && new Date(s.confirmed_start) >= now) {
      const currentNext = nextSessionMap[s.customer_id]
      if (
        !currentNext?.confirmed_start ||
        new Date(s.confirmed_start) < new Date(currentNext.confirmed_start)
      ) {
        nextSessionMap[s.customer_id] = {
          status: 'scheduled',
          confirmed_start: s.confirmed_start,
        }
      }
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-serif font-bold text-[#1e293b]">Customers</h1>
        <p className="mt-1 text-gray-500">{customers?.length ?? 0} total</p>
      </div>

      <CustomersTable
        customers={customers ?? []}
        membershipMap={membershipMap}
        packageCreditsMap={packageCreditsMap}
        courseCreditsMap={courseCreditsMap}
        orderCountMap={orderCountMap}
        sessionCountMap={sessionCountMap}
        nextSessionMap={nextSessionMap}
        studentMap={studentMap}
        paymentApprovalMap={paymentApprovalMap}
        totalSpentMap={totalSpentMap}
      />
    </div>
  )
}
