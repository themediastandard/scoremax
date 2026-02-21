import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { formatPlanLabel } from '@/lib/order-format'
import { getAuthUser, getProfile } from '@/lib/auth'
import { OrdersTable } from '@/components/dashboard/OrdersTable'
import { OrderMetrics } from '@/components/dashboard/OrderMetrics'

export default async function OrdersPage() {
  const user = await getAuthUser()
  if (!user) redirect('/login')

  const profile = await getProfile(user.id)
  const isAdmin = profile?.role === 'admin'
  const supabase = await createClient()

  let query = supabase.from('booking_requests').select(`
    *,
    customers (full_name, email, packages(total_hours), memberships(tier, status)),
    payments (amount_cents)
  `).neq('status', 'pending_payment').order('created_at', { ascending: false })

  if (profile?.role === 'customer') {
    const { data: customer } = await supabase.from('customers').select('id').eq('profile_id', user.id).single()
    if (customer) {
      query = query.eq('customer_id', customer.id)
    } else {
      query = query.eq('customer_id', '00000000-0000-0000-0000-000000000000')
    }
  }

  const [{ data: orders }, { data: subjects }] = await Promise.all([
    query,
    supabase.from('subjects').select('id, name'),
  ])

  const subjectMap = Object.fromEntries((subjects ?? []).map((s) => [s.id, s.name]))

  const planLabels: Record<string, string> = {}
  for (const order of orders ?? []) {
    const effectiveAmount = order.amount_cents || order.payments?.[0]?.amount_cents || 0
    let label = formatPlanLabel({ payment_type: order.payment_type, amount_cents: effectiveAmount })
    if (effectiveAmount === 0) {
      if (order.payment_type === 'package') {
        const pkg = order.customers?.packages?.[0]
        if (pkg) label = `${pkg.total_hours}-Hr Package (Credit)`
      } else if (order.payment_type === 'membership') {
        const mem = order.customers?.memberships?.find((m: any) => m.status === 'active')
        if (mem?.tier) label = `${mem.tier.charAt(0).toUpperCase() + mem.tier.slice(1)} Membership (Credit)`
      }
    }
    planLabels[order.id] = label
  }

  let metrics = null
  if (isAdmin && orders) {
    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

    let allTimeRevenue = 0
    let monthRevenue = 0
    let monthOrderCount = 0
    let refundTotal = 0
    let refundCount = 0
    let paidCount = 0

    for (const o of orders) {
      const amt = o.amount_cents || o.payments?.[0]?.amount_cents || 0
      if (o.status === 'refunded') {
        refundTotal += amt
        refundCount++
        continue
      }
      if (amt === 0) continue
      allTimeRevenue += amt
      paidCount++
      if (new Date(o.created_at) >= monthStart) {
        monthRevenue += amt
        monthOrderCount++
      }
    }

    metrics = {
      monthRevenue,
      allTimeRevenue,
      refundTotal,
      refundCount,
      monthOrderCount,
      avgOrderValue: paidCount > 0 ? Math.round(allTimeRevenue / paidCount) : 0,
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-serif font-bold text-[#1e293b]">Orders</h1>
        <p className="mt-1 text-gray-500">{orders?.length ?? 0} total</p>
      </div>

      {metrics && <OrderMetrics {...metrics} />}

      <OrdersTable
        orders={orders ?? []}
        isAdmin={isAdmin}
        subjectMap={subjectMap}
        planLabels={planLabels}
      />
    </div>
  )
}
