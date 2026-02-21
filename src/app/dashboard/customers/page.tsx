import { redirect } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { getAuthUser, getProfile } from '@/lib/auth'

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

  const membershipMap = new Map(
    (memberships ?? []).map((m) => [m.customer_id, m])
  )

  const packageMap = new Map<string, number>()
  for (const p of packages ?? []) {
    packageMap.set(p.customer_id, (packageMap.get(p.customer_id) ?? 0) + p.remaining_hours)
  }

  const orderCountMap = new Map<string, number>()
  for (const o of orders ?? []) {
    orderCountMap.set(o.customer_id, (orderCountMap.get(o.customer_id) ?? 0) + 1)
  }

  const sessionCountMap = new Map<string, { completed: number; upcoming: number }>()
  for (const s of sessions ?? []) {
    const curr = sessionCountMap.get(s.customer_id) ?? { completed: 0, upcoming: 0 }
    if (s.status === 'completed') curr.completed++
    else if (s.status === 'scheduled' || s.status === 'pending_scheduling') curr.upcoming++
    sessionCountMap.set(s.customer_id, curr)
  }

  const getCredits = (customerId: string) => {
    const mem = membershipMap.get(customerId)
    const memCredits = mem
      ? (mem.included_hours + mem.rollover_hours) - mem.used_hours
      : 0
    const pkgCredits = packageMap.get(customerId) ?? 0
    return memCredits + pkgCredits
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-serif font-bold text-[#1e293b]">Customers</h1>
        <p className="mt-1 text-gray-500">{customers?.length ?? 0} total</p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr className="bg-gray-50/80">
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Contact</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Grade</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Plan</th>
              <th className="px-5 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Credits</th>
              <th className="px-5 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Orders</th>
              <th className="px-5 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Sessions</th>
              <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {customers && customers.length > 0 ? (
              customers.map((customer) => {
                const membership = membershipMap.get(customer.id)
                const credits = getCredits(customer.id)
                const orderCount = orderCountMap.get(customer.id) ?? 0
                const sessionStats = sessionCountMap.get(customer.id) ?? { completed: 0, upcoming: 0 }

                return (
                  <tr key={customer.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-5 py-3.5">
                      <p className="font-medium text-sm text-[#1e293b]">{customer.full_name || 'Unnamed'}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="text-sm text-gray-600">{customer.email}</p>
                      {customer.phone && (
                        <p className="text-xs text-gray-400 mt-0.5">{customer.phone}</p>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-sm text-gray-600">{customer.student_grade || '—'}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      {membership ? (
                        <Badge
                          variant="outline"
                          className={
                            membership.tier === 'core'
                              ? 'border-[#b08a30] text-[#b08a30]'
                              : membership.tier === 'premier'
                                ? 'border-purple-500 text-purple-600'
                                : 'border-[#517cad] text-[#517cad]'
                          }
                        >
                          {membership.tier.charAt(0).toUpperCase() + membership.tier.slice(1)}
                        </Badge>
                      ) : packageMap.has(customer.id) ? (
                        <Badge variant="outline" className="border-gray-300 text-gray-600">
                          Package
                        </Badge>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      {credits > 0 ? (
                        <span className="inline-flex items-center rounded-full bg-[#517cad]/10 px-2.5 py-0.5 text-xs font-semibold text-[#517cad]">
                          {credits}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">0</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <span className="text-sm text-gray-700">{orderCount}</span>
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {sessionStats.upcoming > 0 && (
                          <span className="inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">
                            {sessionStats.upcoming} upcoming
                          </span>
                        )}
                        {sessionStats.completed > 0 && (
                          <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                            {sessionStats.completed} done
                          </span>
                        )}
                        {sessionStats.upcoming === 0 && sessionStats.completed === 0 && (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <span className="text-xs text-gray-400">
                        {new Date(customer.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </td>
                  </tr>
                )
              })
            ) : (
              <tr>
                <td colSpan={8} className="px-5 py-12 text-center text-gray-400">
                  No customers yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
