import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { formatPlanLabel, formatAmount } from '@/lib/order-format'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ChevronRight, Calendar, User, BookOpen, Video } from 'lucide-react'

export default async function OrdersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()

  let query = supabase.from('booking_requests').select(`
    *,
    customers (full_name, email),
    tutors (full_name)
  `).order('created_at', { ascending: false })

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

  const subjectMap = new Map((subjects ?? []).map((s) => [s.id, s.name]))
  const getSubjectNames = (ids: string[] | null) =>
    (ids ?? []).map((id) => subjectMap.get(id)).filter(Boolean).join(', ') || '—'

  const getOrderCardBorder = (status: string) => {
    switch (status) {
      case 'active':
        return 'border-2 border-emerald-500/60 shadow-sm'
      case 'processing':
        return 'border-2 border-amber-500/60 shadow-sm'
      case 'completed':
        return 'border-2 border-slate-300 shadow-sm'
      default:
        return 'border-2 border-red-500/60 shadow-sm'
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-serif font-bold text-[#1e293b]">Orders</h1>
        <p className="mt-1 text-gray-500">View and manage your tutoring sessions</p>
      </div>

      {orders?.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <BookOpen className="h-12 w-12 text-gray-300 mb-4" />
            <p className="text-gray-500 font-medium">No orders yet</p>
            <p className="text-sm text-gray-400 mt-1">Your tutoring sessions will appear here</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {orders?.map((order: any) => (
            <Card
              key={order.id}
              className={`overflow-hidden ${getOrderCardBorder(order.status)} hover:shadow-md transition-all duration-200`}
            >
              <CardHeader className="pb-3 px-6 sm:px-8">
                <div className="flex flex-wrap items-center justify-between gap-6">
                  <div className="flex flex-wrap items-center gap-5">
                    <span className="text-sm text-gray-500 font-medium">
                      {new Date(order.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                    <Badge variant="secondary" className="font-medium bg-slate-100 text-slate-700">
                      {formatPlanLabel(order)}
                    </Badge>
                    {formatAmount(order.amount_cents) !== 'Credit' && (
                      <span className="text-sm font-bold text-[#1e293b]">{formatAmount(order.amount_cents)}</span>
                    )}
                    <span
                      className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                        order.status === 'active'
                          ? 'bg-emerald-50 text-emerald-700'
                          : order.status === 'processing'
                            ? 'bg-amber-50 text-amber-700'
                            : order.status === 'completed'
                              ? 'bg-slate-100 text-slate-700'
                              : 'bg-red-50 text-red-700'
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>
                  <Button variant="outline" size="sm" asChild className="border-[#517cad]/40 text-[#517cad] hover:bg-[#517cad]/5">
                    <Link href={`/dashboard/orders/${order.id}`} className="gap-1">
                      View
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-0 px-6 sm:px-8">
                <div
                  className={`grid w-full grid-cols-2 gap-y-6 gap-x-12 sm:grid-cols-4 ${
                    profile?.role === 'admin' ? 'md:grid-cols-5' : ''
                  }`}
                >
                  <div className="flex gap-4">
                    <BookOpen className="h-5 w-5 text-[#517cad]/70 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Subjects</p>
                      <p className="text-gray-900 font-medium">{getSubjectNames(order.subjects)}</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <Video className="h-5 w-5 text-[#517cad]/70 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Session</p>
                      <p className="text-gray-900 font-medium capitalize">{order.session_type || '—'}</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <Calendar
                      className={`h-5 w-5 shrink-0 mt-0.5 ${order.confirmed_start ? 'text-emerald-600' : 'text-gray-400'}`}
                    />
                    <div className="flex flex-col gap-0.5">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</p>
                      {order.confirmed_start ? (
                        <>
                          <span className="font-medium text-gray-900">
                            {new Date(order.confirmed_start).toLocaleDateString(undefined, {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </span>
                          <span className="text-gray-600 text-sm font-medium">
                            {new Date(order.confirmed_start).toLocaleTimeString(undefined, {
                              hour: 'numeric',
                              minute: '2-digit',
                            })}
                            {order.confirmed_end && (
                              <>
                                {' – '}
                                {new Date(order.confirmed_end).toLocaleTimeString(undefined, {
                                  hour: 'numeric',
                                  minute: '2-digit',
                                })}
                              </>
                            )}
                          </span>
                        </>
                      ) : (
                        <span className="font-medium text-gray-500 italic">Not yet scheduled</span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <User className="h-5 w-5 text-[#517cad]/70 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Tutor</p>
                      <p className="text-gray-900 font-medium">{order.tutors?.full_name || 'Unassigned'}</p>
                    </div>
                  </div>
                  {profile?.role === 'admin' && (
                    <div className="flex gap-4">
                      <User className="h-5 w-5 text-[#c79d3c]/70 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</p>
                        <p className="text-gray-900 font-medium">{order.customers?.full_name ?? '—'}</p>
                        {order.customers?.email && (
                          <p className="text-gray-500 text-xs mt-0.5">{order.customers.email}</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}