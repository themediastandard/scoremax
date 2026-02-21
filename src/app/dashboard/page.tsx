import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ChevronRight, Calendar, BookOpen, Clock, CheckCircle, Users, CreditCard, Video, MapPin } from 'lucide-react'
import { JoinClassButton } from '@/components/dashboard/JoinClassButton'
import { getAuthUser, getProfile } from '@/lib/auth'
import { formatPlanLabel, formatAmount } from '@/lib/order-format'

export default async function DashboardHome() {
  const user = await getAuthUser()
  if (!user) redirect('/login')

  const profile = await getProfile(user.id)
  if (!profile) return <div>Profile not found</div>

  const supabase = await createClient()

  if (profile.role === 'admin') {
    const [
      { count: pendingSessionCount },
      { count: scheduledSessionCount },
      { count: memberCount },
      { count: customerCount },
      { data: recentOrders },
      { data: upcomingSessions },
      { data: adminSubjects },
    ] = await Promise.all([
      supabase
        .from('sessions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending_scheduling'),
      supabase
        .from('sessions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'scheduled'),
      supabase
        .from('memberships')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active'),
      supabase
        .from('customers')
        .select('*', { count: 'exact', head: true }),
      supabase
        .from('booking_requests')
        .select('id, created_at, status, payment_type, amount_cents, subjects, session_type, customers(full_name, packages(total_hours), memberships(tier, status)), payments(amount_cents)')
        .eq('status', 'paid')
        .order('created_at', { ascending: false })
        .limit(10),
      supabase
        .from('sessions')
        .select('id, status, confirmed_start, confirmed_end, session_type, subjects, customers(full_name), tutors(full_name)')
        .eq('status', 'scheduled')
        .order('confirmed_start', { ascending: true })
        .limit(10),
      supabase.from('subjects').select('id, name'),
    ])

    const adminSubjectMap = new Map((adminSubjects ?? []).map((s) => [s.id, s.name]))
    const resolveSubjects = (ids: string[] | null) =>
      (ids ?? []).map((id) => adminSubjectMap.get(id)).filter(Boolean).join(', ')
    const resolvePlanLabel = (order: any) => {
      const amt = order.amount_cents || order.payments?.[0]?.amount_cents || 0
      if (amt > 0) return formatPlanLabel({ payment_type: order.payment_type, amount_cents: amt })
      if (order.payment_type === 'package') {
        const pkg = order.customers?.packages?.[0]
        if (pkg) return `${pkg.total_hours}-Hr Package (Credit)`
      }
      if (order.payment_type === 'membership') {
        const mem = order.customers?.memberships?.find((m: any) => m.status === 'active')
        if (mem?.tier) return `${mem.tier.charAt(0).toUpperCase() + mem.tier.slice(1)} Membership (Credit)`
      }
      return formatPlanLabel({ payment_type: order.payment_type, amount_cents: amt })
    }

    return (
      <div className="space-y-8">
        <h1 className="text-3xl font-serif font-bold text-[#1e293b]">Welcome back, {profile.full_name}</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500 uppercase tracking-wider">Pending Sessions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-[#b08a30]">{pendingSessionCount || 0}</div>
              <p className="text-xs text-gray-500 mt-1">Needs scheduling</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500 uppercase tracking-wider">Upcoming Sessions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-[#517cad]">{scheduledSessionCount || 0}</div>
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

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Customers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-gray-700">{customerCount || 0}</div>
              <p className="text-xs text-gray-500 mt-1">Registered customers</p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-[#b08a30]" />
                Recent Orders
              </CardTitle>
              <Link href="/dashboard/orders">
                <Button variant="ghost" size="sm" className="text-[#517cad]">
                  View all <ChevronRight className="h-4 w-4 ml-0.5" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {recentOrders && recentOrders.length > 0 ? (
                <div className="space-y-3">
                  {recentOrders.map((order: any) => {
                    const amt = order.amount_cents || order.payments?.[0]?.amount_cents
                    return (
                      <Link
                        key={order.id}
                        href={`/dashboard/orders/${order.id}`}
                        className="block rounded-lg border border-gray-100 p-4 hover:bg-gray-50/40 hover:border-gray-300 transition-colors"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2.5 flex-wrap">
                              <p className="font-medium text-[#1e293b]">{order.customers?.full_name || 'Unknown'}</p>
                              <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-slate-100 text-slate-600">
                                {resolvePlanLabel(order)}
                              </span>
                              {amt ? (
                                <span className="text-xs font-bold text-[#1e293b]">{formatAmount(amt)}</span>
                              ) : null}
                            </div>
                            <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                              {resolveSubjects(order.subjects) && (
                                <span className="flex items-center gap-1">
                                  <BookOpen className="h-3 w-3 shrink-0" />
                                  {resolveSubjects(order.subjects)}
                                </span>
                              )}
                              <span className="flex items-center gap-1 capitalize">
                                {order.session_type === 'online'
                                  ? <Video className="h-3 w-3 shrink-0" />
                                  : <MapPin className="h-3 w-3 shrink-0" />}
                                {order.session_type === 'in-person' ? 'In Person' : order.session_type}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-500 shrink-0">
                            <span>{new Date(order.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                            <ChevronRight className="h-4 w-4 text-gray-400" />
                          </div>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              ) : (
                <p className="text-gray-400 text-sm py-4 text-center">No orders yet</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-emerald-600" />
                Upcoming Sessions
              </CardTitle>
              <Link href="/dashboard/sessions">
                <Button variant="ghost" size="sm" className="text-[#517cad]">
                  View all <ChevronRight className="h-4 w-4 ml-0.5" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {upcomingSessions && upcomingSessions.length > 0 ? (
                <div className="space-y-3">
                  {upcomingSessions.map((session: any) => (
                    <Link
                      key={session.id}
                      href="/dashboard/sessions"
                      className="block rounded-lg border border-emerald-100 p-4 hover:bg-emerald-50/40 hover:border-emerald-300 transition-colors"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2.5 flex-wrap">
                            <p className="font-medium text-[#1e293b]">{session.customers?.full_name || 'Unknown'}</p>
                            {session.tutors?.full_name && (
                              <span className="flex items-center gap-1 text-xs text-gray-500">
                                <Users className="h-3 w-3 shrink-0" />
                                {session.tutors.full_name}
                              </span>
                            )}
                            <span className="flex items-center gap-1 text-xs text-gray-400 capitalize">
                              {session.session_type === 'online'
                                ? <Video className="h-3 w-3 shrink-0" />
                                : <MapPin className="h-3 w-3 shrink-0" />}
                              {session.session_type === 'in-person' ? 'In Person' : session.session_type}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                            {resolveSubjects(session.subjects) && (
                              <span className="flex items-center gap-1">
                                <BookOpen className="h-3 w-3 shrink-0" />
                                {resolveSubjects(session.subjects)}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500 shrink-0">
                          {session.confirmed_start ? (
                            <div className="text-right">
                              <span className="flex items-center gap-1.5">
                                <Calendar className="h-3.5 w-3.5 shrink-0" />
                                {new Date(session.confirmed_start).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                              </span>
                              <span className="text-xs text-gray-400">
                                {new Date(session.confirmed_start).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}
                                {session.confirmed_end && (
                                  <> – {new Date(session.confirmed_end).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}</>
                                )}
                              </span>
                            </div>
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
                <p className="text-gray-400 text-sm py-4 text-center">No upcoming sessions</p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="flex gap-4">
          <Link href="/dashboard/orders">
            <Button>Manage Orders</Button>
          </Link>
          <Link href="/dashboard/sessions">
            <Button variant="outline">Manage Sessions</Button>
          </Link>
          <Link href="/dashboard/tutors">
            <Button variant="outline">Manage Tutors</Button>
          </Link>
        </div>
      </div>
    )
  }

  if (profile.role === 'tutor') {
    const { data: tutor } = await supabase
      .from('tutors')
      .select('id')
      .eq('profile_id', user.id)
      .single()

    const { count: sessionCount } = await supabase
      .from('sessions')
      .select('*', { count: 'exact', head: true })
      .eq('assigned_tutor_id', tutor?.id)
      .eq('status', 'scheduled')
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

  const customerId = customer?.id ?? '00000000-0000-0000-0000-000000000000'

  const [{ data: sessions }, { data: subjects }, { data: membership }, { data: packages }, { count: completedCount }] = await Promise.all([
    supabase
      .from('sessions')
      .select('id, status, confirmed_start, confirmed_end, session_type, subjects, meet_url, tutors(full_name)')
      .eq('customer_id', customerId)
      .in('status', ['pending_scheduling', 'scheduled'])
      .order('confirmed_start', { ascending: true, nullsFirst: true })
      .limit(5),
    supabase.from('subjects').select('id, name'),
    supabase
      .from('memberships')
      .select('tier, status, included_hours, used_hours, rollover_hours, current_period_end')
      .eq('customer_id', customerId)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .maybeSingle()
      .then(r => r),
    supabase
      .from('packages')
      .select('total_hours, remaining_hours')
      .eq('customer_id', customerId)
      .gt('remaining_hours', 0),
    supabase
      .from('sessions')
      .select('*', { count: 'exact', head: true })
      .eq('customer_id', customerId)
      .eq('status', 'completed')
  ])

  const subjectMap = new Map((subjects ?? []).map((s) => [s.id, s.name]))

  const membershipCredits = membership
    ? (membership.included_hours + membership.rollover_hours) - membership.used_hours
    : 0
  const packageCredits = (packages ?? []).reduce((sum: number, p: any) => sum + p.remaining_hours, 0)
  const packageTotal = (packages ?? []).reduce((sum: number, p: any) => sum + p.total_hours, 0)
  const totalCredits = membershipCredits + packageCredits
  const totalUsed = (membership?.used_hours ?? 0) + (packageTotal - packageCredits)
  const totalIncluded = (membership?.included_hours ?? 0) + packageTotal
  const hasCredits = totalCredits > 0 || membership || (packages && packages.length > 0)

  const now = new Date()
  const nextSession = (sessions ?? [])
    .filter((s: any) => s.status === 'scheduled' && s.confirmed_start)
    .sort((a: any, b: any) => new Date(a.confirmed_start).getTime() - new Date(b.confirmed_start).getTime())
    .find((s: any) => new Date(s.confirmed_end || s.confirmed_start).getTime() > now.getTime())

  const hoursUntilNext = nextSession
    ? (new Date(nextSession.confirmed_start).getTime() - now.getTime()) / 3600000
    : null

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-serif font-bold text-[#1e293b]">Welcome back, {profile.full_name}</h1>

      {nextSession && hoursUntilNext !== null && hoursUntilNext <= 24 && (
        <div className={`rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
          hoursUntilNext <= 1
            ? 'bg-emerald-600 text-white'
            : 'bg-[#517cad] text-white'
        }`}>
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/20">
              <Clock className="h-6 w-6" />
            </div>
            <div>
              <p className="font-semibold text-lg">
                {hoursUntilNext <= 0
                  ? 'Your session is happening now!'
                  : hoursUntilNext < 1
                    ? `Your session starts in ${Math.round(hoursUntilNext * 60)} minutes`
                    : `Your next session is in ${Math.round(hoursUntilNext)} hours`}
              </p>
              <p className="text-sm opacity-80">
                {(nextSession.subjects ?? []).map((id: string) => subjectMap.get(id)).filter(Boolean).join(', ')}
                {nextSession.tutors?.full_name && ` with ${nextSession.tutors.full_name}`}
              </p>
            </div>
          </div>
          {nextSession.meet_url && nextSession.session_type === 'online' && (
            <JoinClassButton
              meetUrl={nextSession.meet_url}
              sessionStart={nextSession.confirmed_start}
              sessionEnd={nextSession.confirmed_end}
            />
          )}
        </div>
      )}

      {hasCredits ? (
        <Card className="shadow-sm border-gray-100">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#517cad]/10">
                  <CreditCard className="h-6 w-6 text-[#517cad]" />
                </div>
                <div>
                  <p className="text-lg font-semibold text-[#1e293b]">Session Credits</p>
                  {membership?.current_period_end && (
                    <p className="text-xs text-gray-500 mt-0.5">
                      Membership renews {new Date(membership.current_period_end).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-5 sm:gap-6">
                <div className="text-center">
                  <p className="text-2xl sm:text-3xl font-bold text-[#1e293b]">{totalCredits}</p>
                  <p className="text-xs text-gray-500">Credits left</p>
                </div>
                <div className="h-8 w-px bg-gray-200" />
                <div className="text-center">
                  <p className="text-2xl sm:text-3xl font-bold text-gray-400">{totalUsed}</p>
                  <p className="text-xs text-gray-500">Used</p>
                </div>
                <div className="h-8 w-px bg-gray-200" />
                <div className="text-center">
                  <p className="text-2xl sm:text-3xl font-bold text-gray-300">{totalIncluded}</p>
                  <p className="text-xs text-gray-500">Total</p>
                </div>
                {(completedCount ?? 0) > 0 && (
                  <>
                    <div className="h-8 w-px bg-gray-200" />
                    <div className="text-center">
                      <p className="text-2xl sm:text-3xl font-bold text-[#517cad]">{completedCount}</p>
                      <p className="text-xs text-gray-500">Completed</p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-dashed border-2 border-gray-200 bg-[#f8fafc]">
          <CardContent className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <p className="font-semibold text-[#1e293b]">No session credits</p>
              <p className="text-sm text-gray-500 mt-0.5">Purchase a package or subscribe to get session credits.</p>
            </div>
            <Link href="/book">
              <Button className="bg-[#b08a30] hover:bg-[#b58b2a]">View Plans</Button>
            </Link>
          </CardContent>
        </Card>
      )}

      <div className="flex flex-wrap gap-3">
        <Link href="/book">
          <Button className="bg-[#b08a30] hover:bg-[#b58b2a]">Book a Session</Button>
        </Link>
        <Link href="/dashboard/orders">
          <Button variant="outline">View All Orders</Button>
        </Link>
        {membership && membership.status === 'active' && (
          <Link href="/dashboard/subscription">
            <Button variant="outline">Manage Subscription</Button>
          </Link>
        )}
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-serif font-bold text-[#1e293b]">Your Upcoming Sessions</h2>
          <Link href="/dashboard/sessions">
            <Button variant="ghost" size="sm" className="text-[#517cad]">
              View all <ChevronRight className="h-4 w-4 ml-0.5" />
            </Button>
          </Link>
        </div>

        {sessions && sessions.length > 0 ? (
          <div className="space-y-4">
            {sessions.map((session: any) => {
              const subjectNames = (session.subjects ?? [])
                .map((id: string) => subjectMap.get(id))
                .filter(Boolean)
                .join(', ')
              const isScheduled = session.status === 'scheduled'
              const isPending = session.status === 'pending_scheduling'

              return (
                <div
                  key={session.id}
                  className={`block rounded-xl border-2 p-5 transition-colors ${
                    isScheduled
                      ? 'border-emerald-200 bg-emerald-50/30'
                      : isPending
                        ? 'border-amber-200 bg-amber-50/30'
                        : 'border-gray-100'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="space-y-2 flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                            isScheduled
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-amber-100 text-amber-700'
                          }`}
                        >
                          {isScheduled ? 'Confirmed' : 'Pending'}
                        </span>
                        <span className="flex items-center gap-1 text-sm text-gray-400 capitalize">
                          {session.session_type === 'online'
                            ? <Video className="h-3.5 w-3.5" />
                            : <MapPin className="h-3.5 w-3.5" />}
                          {session.session_type === 'in-person' ? 'In Person' : session.session_type}
                        </span>
                      </div>

                      {subjectNames && (
                        <p className="font-medium text-[#1e293b]">{subjectNames}</p>
                      )}

                      <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-sm text-gray-600">
                        {session.confirmed_start ? (
                          <span className="flex items-center gap-1.5">
                            <Calendar className="h-4 w-4 text-gray-400 shrink-0" />
                            {new Date(session.confirmed_start).toLocaleDateString(undefined, {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric',
                            })}
                            {', '}
                            {new Date(session.confirmed_start).toLocaleTimeString(undefined, {
                              hour: 'numeric',
                              minute: '2-digit',
                            })}
                            {session.confirmed_end && (
                              <span className="text-gray-400">
                                {' – '}
                                {new Date(session.confirmed_end).toLocaleTimeString(undefined, {
                                  hour: 'numeric',
                                  minute: '2-digit',
                                })}
                              </span>
                            )}
                          </span>
                        ) : (
                          <span className="flex items-center gap-1.5 italic text-gray-400">
                            <Calendar className="h-4 w-4 shrink-0" />
                            Awaiting scheduling
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-between gap-3 sm:gap-2 shrink-0 sm:self-stretch">
                      {session.tutors?.full_name && (
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#517cad]/10">
                            <Users className="h-4 w-4 text-[#517cad]" />
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-gray-400">Your Tutor</p>
                            <p className="text-sm font-semibold text-[#1e293b]">{session.tutors.full_name}</p>
                          </div>
                        </div>
                      )}
                      {isScheduled && session.session_type === 'online' && session.meet_url && session.confirmed_start && session.confirmed_end ? (
                        <JoinClassButton
                          meetUrl={session.meet_url}
                          sessionStart={session.confirmed_start}
                          sessionEnd={session.confirmed_end}
                        />
                      ) : null}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <Card className="border-dashed border-2 border-gray-200 bg-[#f8fafc]">
            <CardContent className="py-10 flex flex-col items-center text-center">
              <BookOpen className="h-10 w-10 text-gray-300 mb-3" />
              <p className="font-semibold text-[#1e293b]">No upcoming sessions</p>
              <p className="text-sm text-gray-500 mt-1 mb-5">Ready to keep learning? Book your next session.</p>
              <Link href="/book">
                <Button className="bg-[#b08a30] hover:bg-[#b58b2a]">Book a Session</Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
