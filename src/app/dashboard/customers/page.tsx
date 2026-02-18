import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { Mail, Phone, GraduationCap, ChevronRight, BookOpen } from 'lucide-react'
import { getAuthUser, getProfile } from '@/lib/auth'

export default async function CustomersPage() {
  const user = await getAuthUser()
  if (!user) redirect('/login')

  const profile = await getProfile(user.id)
  if (profile?.role !== 'admin') redirect('/dashboard')

  const { data: customers } = await supabaseAdmin
    .from('customers')
    .select('id, full_name, email, phone, student_grade, created_at')
    .order('created_at', { ascending: false })

  const { data: memberships } = await supabaseAdmin
    .from('memberships')
    .select('customer_id, tier, status')
    .eq('status', 'active')

  const membershipMap = new Map(
    (memberships ?? []).map((m) => [m.customer_id, m])
  )

  const { data: orderCounts } = await supabaseAdmin
    .from('booking_requests')
    .select('customer_id')

  const orderCountMap = new Map<string, number>()
  for (const o of orderCounts ?? []) {
    orderCountMap.set(o.customer_id, (orderCountMap.get(o.customer_id) ?? 0) + 1)
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-serif font-bold text-[#1e293b]">Customers</h1>
        <p className="mt-1 text-gray-500">{customers?.length ?? 0} total customers</p>
      </div>

      {customers && customers.length > 0 ? (
        <div className="space-y-4">
          {customers.map((customer) => {
            const membership = membershipMap.get(customer.id)
            const orders = orderCountMap.get(customer.id) ?? 0

            return (
              <Card key={customer.id} className="border-gray-100 shadow-sm hover:border-[#517cad]/30 transition-colors">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CardTitle className="text-lg">{customer.full_name || 'Unnamed'}</CardTitle>
                      {membership && (
                        <Badge
                          variant="outline"
                          className={
                            membership.tier === 'core'
                              ? 'border-[#b08a30] text-[#b08a30]'
                              : 'border-[#517cad] text-[#517cad]'
                          }
                        >
                          {membership.tier.charAt(0).toUpperCase() + membership.tier.slice(1)} Member
                        </Badge>
                      )}
                    </div>
                    <span className="text-xs text-gray-400">
                      Joined {new Date(customer.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap items-center gap-x-8 gap-y-2 text-sm text-gray-600">
                    <span className="flex items-center gap-1.5">
                      <Mail className="h-3.5 w-3.5 text-gray-400" />
                      {customer.email}
                    </span>
                    {customer.phone && (
                      <span className="flex items-center gap-1.5">
                        <Phone className="h-3.5 w-3.5 text-gray-400" />
                        {customer.phone}
                      </span>
                    )}
                    {customer.student_grade && (
                      <span className="flex items-center gap-1.5">
                        <GraduationCap className="h-3.5 w-3.5 text-gray-400" />
                        {customer.student_grade}
                      </span>
                    )}
                    <span className="flex items-center gap-1.5">
                      <BookOpen className="h-3.5 w-3.5 text-gray-400" />
                      {orders} {orders === 1 ? 'order' : 'orders'}
                    </span>
                    <Link
                      href={`/dashboard/orders?customer=${customer.id}`}
                      className="ml-auto flex items-center gap-1 text-sm text-[#517cad] hover:text-[#3b5c85] transition-colors"
                    >
                      View orders
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        <Card className="py-12 text-center">
          <CardContent>
            <p className="text-gray-500">No customers yet</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
