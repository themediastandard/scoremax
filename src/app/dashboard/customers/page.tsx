import { redirect } from 'next/navigation'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { getAuthUser, getProfile } from '@/lib/auth'
import { CustomersTable } from '@/components/dashboard/CustomersTable'

export default async function CustomersPage() {
  const user = await getAuthUser()
  if (!user) redirect('/login')

  const profile = await getProfile(user.id)
  if (profile?.role !== 'admin') redirect('/dashboard')

  const [
    { data: customers },
    { data: memberships },
    { data: packages },
    { data: orders },
    { data: sessions },
  ] = await Promise.all([
    supabaseAdmin
      .from('customers')
      .select('id, full_name, email, phone, student_grade, created_at')
      .order('created_at', { ascending: false }),
    supabaseAdmin
      .from('memberships')
      .select('customer_id, tier, status, included_hours, used_hours, rollover_hours')
      .eq('status', 'active'),
    supabaseAdmin
      .from('packages')
      .select('customer_id, total_hours, remaining_hours')
      .gt('remaining_hours', 0),
    supabaseAdmin
      .from('booking_requests')
      .select('customer_id')
      .eq('status', 'paid'),
    supabaseAdmin
      .from('sessions')
      .select('customer_id, status'),
  ])

  const membershipMap: Record<string, { tier: string; status: string; included_hours: number; used_hours: number; rollover_hours: number }> = {}
  for (const m of memberships ?? []) {
    membershipMap[m.customer_id] = m
  }

  const packageCreditsMap: Record<string, number> = {}
  for (const p of packages ?? []) {
    packageCreditsMap[p.customer_id] = (packageCreditsMap[p.customer_id] ?? 0) + p.remaining_hours
  }

  const orderCountMap: Record<string, number> = {}
  for (const o of orders ?? []) {
    orderCountMap[o.customer_id] = (orderCountMap[o.customer_id] ?? 0) + 1
  }

  const sessionCountMap: Record<string, { completed: number; upcoming: number }> = {}
  for (const s of sessions ?? []) {
    const curr = sessionCountMap[s.customer_id] ?? { completed: 0, upcoming: 0 }
    if (s.status === 'completed') curr.completed++
    else if (s.status === 'scheduled' || s.status === 'pending_scheduling') curr.upcoming++
    sessionCountMap[s.customer_id] = curr
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
        orderCountMap={orderCountMap}
        sessionCountMap={sessionCountMap}
      />
    </div>
  )
}
