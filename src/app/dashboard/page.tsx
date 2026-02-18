import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { formatPlanLabel } from '@/lib/order-format'
import { ChevronRight, Calendar, BookOpen, Clock, CheckCircle } from 'lucide-react'

export default async function DashboardHome() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) redirect('/login')
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('id', user.id)
    .single()
    
  if (!profile) return <div>Profile not found</div>
  
  // ADMIN VIEW
  if (profile.role === 'admin') {
    // Fetch stats
    // We can call our API or fetch directly. Fetching directly is faster/SSR.
    // For MVP simplicity, let's fetch directly here.
    
    // Pending Orders
    const { count: pendingCount } = await supabase
      .from('booking_requests')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'processing')
      
    // Active Sessions
    const { count: activeCount } = await supabase
      .from('booking_requests')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active')
      
    // Active Members
    const { count: memberCount } = await supabase
      .from('memberships')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active')

    const { data: pendingOrders } = await supabase
      .from('booking_requests')
      .select('id, created_at, status, payment_type, amount_cents, confirmed_start, subjects, session_type, customers(full_name)')
      .eq('status', 'processing')
      .order('created_at', { ascending: false })
      .limit(10)

    const { data: activeOrders } = await supabase
      .from('booking_requests')
      .select('id, created_at, status, payment_type, amount_cents, confirmed_start, confirmed_end, subjects, session_type, customers(full_name), tutors(full_name)')
      .eq('status', 'active')
      .order('confirmed_start', { ascending: true })
      .limit(10)

    return (
      <div className="space-y-8">
        <h1 className="text-3xl font-serif font-bold text-[#1e293b]">Welcome back, {profile.full_name}</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500 uppercase tracking-wider">Pending Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-[#c79d3c]">{pendingCount || 0}</div>
              <p className="text-xs text-gray-500 mt-1">Requires attention</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500 uppercase tracking-wider">Active Sessions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-[#517cad]">{activeCount || 0}</div>
              <p className="text-xs text-gray-500 mt-1">Scheduled & confirmed</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500 uppercase tracking-wider">Active Members</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-green-600">{memberCount || 0}</div>
              <p className="text-xs text-gray-500 mt-1">Paying subscribers</p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-amber-600" />
                Pending Orders
              </CardTitle>
              <Link href="/dashboard/orders">
                <Button variant="ghost" size="sm" className="text-[#517cad]">
                  View all <ChevronRight className="h-4 w-4 ml-0.5" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {pendingOrders && pendingOrders.length > 0 ? (
                <div className="space-y-3">
                  {pendingOrders.map((order: any) => (
                    <Link
                      key={order.id}
                      href={`/dashboard/orders/${order.id}`}
                      className="block rounded-lg border border-amber-100 p-4 hover:bg-amber-50/40 hover:border-amber-300 transition-colors"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <p className="font-medium text-[#1e293b]">{order.customers?.full_name || 'Unknown'}</p>
                          <p className="text-xs text-gray-500 mt-0.5 capitalize">{order.session_type} session</p>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <span>{new Date(order.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                          <ChevronRight className="h-4 w-4 text-gray-400" />
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-sm py-4 text-center">No pending orders</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-emerald-600" />
                Active Sessions
              </CardTitle>
              <Link href="/dashboard/orders">
                <Button variant="ghost" size="sm" className="text-[#517cad]">
                  View all <ChevronRight className="h-4 w-4 ml-0.5" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {activeOrders && activeOrders.length > 0 ? (
                <div className="space-y-3">
                  {activeOrders.map((order: any) => (
                    <Link
                      key={order.id}
                      href={`/dashboard/orders/${order.id}`}
                      className="block rounded-lg border border-emerald-100 p-4 hover:bg-emerald-50/40 hover:border-emerald-300 transition-colors"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <p className="font-medium text-[#1e293b]">{order.customers?.full_name || 'Unknown'}</p>
                          {order.tutors?.full_name && (
                            <p className="text-xs text-gray-500 mt-0.5">Tutor: {order.tutors.full_name}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          {order.confirmed_start ? (
                            <span className="flex items-center gap-1.5">
                              <Calendar className="h-3.5 w-3.5 shrink-0" />
                              {new Date(order.confirmed_start).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                            </span>
                          ) : (
                            <span className="italic text-xs">Not scheduled</span>
                          )}
                          <ChevronRight className="h-4 w-4 text-gray-400" />
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-sm py-4 text-center">No active sessions</p>
              )}
            </CardContent>
          </Card>
        </div>
        
        <div className="flex gap-4">
          <Link href="/dashboard/orders">
            <Button>Manage Orders</Button>
          </Link>
          <Link href="/dashboard/tutors">
            <Button variant="outline">Manage Tutors</Button>
          </Link>
        </div>
      </div>
    )
  }
  
  // TUTOR VIEW
  if (profile.role === 'tutor') {
    // Get tutor ID
    const { data: tutor } = await supabase
      .from('tutors')
      .select('id')
      .eq('profile_id', user.id)
      .single()
      
    // Count upcoming sessions
    const { count: sessionCount } = await supabase
      .from('booking_requests')
      .select('*', { count: 'exact', head: true })
      .eq('assigned_tutor_id', tutor?.id)
      .eq('status', 'active')
      .gte('confirmed_start', new Date().toISOString())
      
    return (
      <div className="space-y-8">
        <h1 className="text-3xl font-serif font-bold text-[#1e293b]">Welcome back, {profile.full_name}</h1>
        
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Upcoming Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-[#517cad]">{sessionCount || 0}</div>
            <p className="text-sm text-gray-500 mt-2">Scheduled sessions coming up</p>
            <div className="mt-4">
              <Link href="/dashboard/sessions">
                <Button className="w-full">View Schedule</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }
  
  // CUSTOMER VIEW
  const { data: customer } = await supabase
    .from('customers')
    .select('id')
    .eq('profile_id', user.id)
    .maybeSingle()

  const { data: orders } = await supabase
    .from('booking_requests')
    .select('id, created_at, status, payment_type, amount_cents, confirmed_start, confirmed_end, tutors(full_name)')
    .eq('customer_id', customer?.id ?? '00000000-0000-0000-0000-000000000000')
    .order('created_at', { ascending: false })
    .limit(5)

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-serif font-bold text-[#1e293b]">Welcome back, {profile.full_name}</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-[#f8fafc] border-dashed border-2 border-gray-200 flex flex-col items-center justify-center p-8 text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Need help with a subject?</h3>
          <p className="text-gray-500 mb-6">Book a new tutoring session or enroll in a course.</p>
          <Link href="/book">
            <Button size="lg" className="bg-[#c79d3c] hover:bg-[#b58b2a]">Book a Session</Button>
          </Link>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Your Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500 mb-4">View your booking history and status.</p>
            <Link href="/dashboard/orders">
              <Button variant="outline" className="w-full">View My Orders</Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {orders && orders.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-[#517cad]" />
              Active Orders
            </CardTitle>
            <Link href="/dashboard/orders">
              <Button variant="ghost" size="sm" className="text-[#517cad]">
                View all <ChevronRight className="h-4 w-4 ml-0.5" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {orders.map((order: any) => (
                <Link
                  key={order.id}
                  href={`/dashboard/orders/${order.id}`}
                  className="block rounded-lg border border-gray-100 p-4 hover:bg-gray-50/80 hover:border-[#517cad]/30 transition-colors"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-3">
                      <span
                        className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                          order.status === 'active'
                            ? 'bg-emerald-50 text-emerald-700'
                            : order.status === 'processing'
                              ? 'bg-amber-50 text-amber-700'
                              : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {order.status}
                      </span>
                      <span className="font-medium text-[#1e293b]">{formatPlanLabel(order)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      {order.confirmed_start ? (
                        <>
                          <Calendar className="h-4 w-4 shrink-0" />
                          <span>
                            {new Date(order.confirmed_start).toLocaleDateString(undefined, {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric',
                            })}{' '}
                            {new Date(order.confirmed_start).toLocaleTimeString(undefined, {
                              hour: 'numeric',
                              minute: '2-digit',
                            })}
                          </span>
                        </>
                      ) : (
                        <span className="italic">Not yet scheduled</span>
                      )}
                      <ChevronRight className="h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                  {order.tutors?.full_name && (
                    <p className="text-xs text-gray-500 mt-2">Tutor: {order.tutors.full_name}</p>
                  )}
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}