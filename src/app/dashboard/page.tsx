import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ChevronRight, Calendar, BookOpen, Clock, CheckCircle, Users, CreditCard, Video, MapPin } from 'lucide-react'
import { JoinClassButton } from '@/components/dashboard/JoinClassButton'
import { getAuthUser, getProfile } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { formatPlanLabel } from '@/lib/order-format'
import { buildSubjectCatalog, getSubjectNameMap } from '@/lib/subject-catalog'
import { getChargedCents, formatOrderAmount } from '@/lib/order-amount'
import { unexpiredPackagesClause } from '@/lib/package-expiry'
import { formatPaymentMethod } from '@/lib/payment-method'
import { formatBusinessDate, formatBusinessTime } from '@/lib/business-datetime'

// supabase-js without generated DB types infers to-one joins as arrays,
// but FK joins return single objects at runtime — cast results to the runtime shape.
function toRows<T>(data: unknown): T[] {
  return (data ?? []) as T[]
}

type AdminOrderRow = {
  id: string
  created_at: string
  status: string | null
  payment_type: string | null
  payment_method: string | null
  amount_cents: number | null
  subjects: string[] | null
  session_type: string | null
  stripe_payment_intent_id: string | null
  customers: {
    full_name: string | null
    packages: Array<{ total_hours: number | null; stripe_payment_intent_id: string | null }> | null
    memberships: Array<{ tier: string | null; status: string | null }> | null
  } | null
  student: { id: string; full_name: string; email: string; grade: string } | null
  payments: Array<{ amount_cents: number | null; payment_method: string | null }> | null
}

type AdminSessionRow = {
  id: string
  status: string | null
  confirmed_start: string
  confirmed_end: string | null
  session_type: string | null
  subjects: string[] | null
  customers: { full_name: string | null } | null
  student: { id: string; full_name: string; email: string; grade: string } | null
  tutors: { full_name: string | null } | null
}

type TutorSessionRow = {
  id: string
  confirmed_start: string
  confirmed_end: string | null
  session_type: string | null
  subjects: string[] | null
  customers: { full_name: string | null; email: string | null } | null
  student: { id: string; full_name: string; email: string; grade: string } | null
}

type CustomerSessionRow = {
  id: string
  status: string | null
  confirmed_start: string | null
  confirmed_end: string | null
  session_type: string | null
  subjects: string[] | null
  meet_url: string | null
  tutors: { full_name: string | null } | null
  student: { id: string; full_name: string; email: string; grade: string } | null
}

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
      { data: recentOrdersData },
      { data: upcomingSessionsData },
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
        .select('id, created_at, status, payment_type, payment_method, amount_cents, subjects, session_type, stripe_payment_intent_id, customers(full_name, packages(total_hours, stripe_payment_intent_id), memberships(tier, status)), student:students(id, full_name, email, grade), payments(amount_cents, payment_method)')
        .eq('status', 'paid')
        .order('created_at', { ascending: false })
        .limit(10),
      supabase
        .from('sessions')
        .select('id, status, confirmed_start, confirmed_end, session_type, subjects, customers(full_name), student:students(id, full_name, email, grade), tutors(full_name)')
        .eq('status', 'scheduled')
        .order('confirmed_start', { ascending: true })
        .limit(10),
      supabase.from('subjects').select('*'),
    ])

    const recentOrders = toRows<AdminOrderRow>(recentOrdersData)
    const upcomingSessions = toRows<AdminSessionRow>(upcomingSessionsData)

    const adminSubjectMap = new Map(Object.entries(getSubjectNameMap(buildSubjectCatalog(adminSubjects ?? []))))
    const resolveSubjects = (ids: string[] | null) =>
      (ids ?? []).map((id) => adminSubjectMap.get(id)).filter(Boolean).join(', ')
    const resolvePlanLabel = (order: {
      amount_cents?: number | null
      payment_type?: string | null
      stripe_payment_intent_id?: string | null
      payments?: Array<{ amount_cents?: number | null }> | null
      customers?: {
        packages?: Array<{ total_hours?: number | null; stripe_payment_intent_id?: string | null }> | null
        memberships?: Array<{ status?: string | null; tier?: string | null }> | null
      } | null
    }) => {
      const amt = getChargedCents(order) ?? 0
      const linkedPackage = order.customers?.packages?.find(
        (pkg) =>
          Boolean(order.stripe_payment_intent_id) &&
          pkg.stripe_payment_intent_id === order.stripe_payment_intent_id
      )
      if (amt > 0) {
        return formatPlanLabel({
          payment_type: order.payment_type,
          amount_cents: amt,
          package_hours: linkedPackage?.total_hours,
        })
      }
      if (order.payment_type === 'package') {
        const pkg = order.customers?.packages?.[0]
        if (pkg) return `${pkg.total_hours}-Hr Package (Credit)`
      }
      if (order.payment_type === 'membership') {
        const mem = order.customers?.memberships?.find((m) => m.status === 'active')
        if (mem?.tier) return `${mem.tier.charAt(0).toUpperCase() + mem.tier.slice(1)} Membership (Credit)`
      }
      return formatPlanLabel({ payment_type: order.payment_type, amount_cents: amt })
    }

    const adminMetrics = [
      { label: 'Pending Sessions', value: pendingSessionCount || 0, sub: 'Needs scheduling', color: 'text-[#b08a30]' },
      { label: 'Upcoming Sessions', value: scheduledSessionCount || 0, sub: 'Scheduled & confirmed', color: 'text-[#4a729f]' },
      { label: 'Active Members', value: memberCount || 0, sub: 'Paying subscribers', color: 'text-green-600' },
      { label: 'Total Customers', value: customerCount || 0, sub: 'Registered customers', color: 'text-gray-700' },
    ]

    return (
      <div className="space-y-6">
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#1e293b]">Welcome back, {profile.full_name}</h1>

        {/* Dense stat tiles — the Card version gave each number a whole
            screen-width card on phones. */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {adminMetrics.map((m) => (
            <div key={m.label} className="bg-white rounded-lg border border-gray-200 shadow-sm px-4 py-3.5">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{m.label}</p>
              <p className={`text-2xl sm:text-3xl font-bold mt-1 ${m.color}`}>{m.value}</p>
              <p className="text-xs text-gray-400 mt-0.5">{m.sub}</p>
            </div>
          ))}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-[#b08a30]" />
                Recent Orders
              </CardTitle>
              <Link href="/dashboard/orders">
                <Button variant="ghost" size="sm" className="text-[#4a729f]">
                  View all <ChevronRight className="h-4 w-4 ml-0.5" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {recentOrders && recentOrders.length > 0 ? (
                <div className="space-y-3">
                  {recentOrders.map((order) => {
                    const amountLabel = formatOrderAmount(order)
                    return (
                      <Link
                        key={order.id}
                        href={`/dashboard/orders/${order.id}`}
                        className="block rounded-lg border border-gray-100 p-4 hover:bg-gray-50/40 hover:border-gray-300 transition-colors"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2.5 flex-wrap">
                              <p className="font-medium text-[#1e293b]">{order.student?.full_name || 'Student not assigned'}</p>
                              <span className="text-xs text-gray-400">Owner: {order.customers?.full_name || 'Unknown'}</span>
                              <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-slate-100 text-slate-600">
                                {resolvePlanLabel(order)}
                              </span>
                              <span className="text-xs font-bold text-[#1e293b]">{amountLabel}</span>
                              <span className="text-xs font-medium text-gray-500">
                                {formatPaymentMethod(order.payment_method ?? order.payments?.[0]?.payment_method)}
                              </span>
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
                <div className="py-8 text-center">
                  <CreditCard className="h-8 w-8 text-gray-300 mx-auto mb-2" aria-hidden="true" />
                  <p className="text-sm font-medium text-gray-500">No orders yet</p>
                  <p className="text-xs text-gray-400 mt-0.5">Paid bookings will show up here</p>
                </div>
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
                <Button variant="ghost" size="sm" className="text-[#4a729f]">
                  View all <ChevronRight className="h-4 w-4 ml-0.5" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {upcomingSessions && upcomingSessions.length > 0 ? (
                <div className="space-y-3">
                  {upcomingSessions.map((session) => (
                    <Link
                      key={session.id}
                      href="/dashboard/sessions"
                      className="block rounded-lg border border-emerald-100 p-4 hover:bg-emerald-50/40 hover:border-emerald-300 transition-colors"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2.5 flex-wrap">
                            <p className="font-medium text-[#1e293b]">{session.student?.full_name || 'Student not assigned'}</p>
                            <span className="text-xs text-gray-400">Owner: {session.customers?.full_name || 'Unknown'}</span>
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
                                {formatBusinessDate(session.confirmed_start, { weekday: 'short', month: 'short', day: 'numeric' })}
                              </span>
                              <span className="text-xs text-gray-400">
                                {formatBusinessTime(session.confirmed_start)}
                                {session.confirmed_end && (
                                  <> – {formatBusinessTime(session.confirmed_end)}</>
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
                <div className="py-8 text-center">
                  <Calendar className="h-8 w-8 text-gray-300 mx-auto mb-2" aria-hidden="true" />
                  <p className="text-sm font-medium text-gray-500">No upcoming sessions</p>
                  <p className="text-xs text-gray-400 mt-0.5">Scheduled sessions will show up here</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Stacked full-width on phones — a fixed row of three overflowed the
            viewport sideways. */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button asChild>
            <Link href="/dashboard/orders">Manage Orders</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/dashboard/sessions">Manage Sessions</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/dashboard/tutors">Manage Tutors</Link>
          </Button>
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

    const { data: subjects } = await supabase.from('subjects').select('*')
    const subjectMap = new Map(Object.entries(getSubjectNameMap(buildSubjectCatalog(subjects ?? []))))

    const [{ data: upcomingSessions }, { count: totalUpcoming }, { count: totalCompleted }] = await Promise.all([
      supabaseAdmin
        .from('sessions')
        .select('*, customers (full_name, email), student:students(id, full_name, email, grade)')
        .eq('assigned_tutor_id', tutor?.id)
        .eq('status', 'scheduled')
        .gte('confirmed_start', new Date().toISOString())
        .order('confirmed_start', { ascending: true })
        .limit(5),
      supabaseAdmin
        .from('sessions')
        .select('*', { count: 'exact', head: true })
        .eq('assigned_tutor_id', tutor?.id)
        .eq('status', 'scheduled'),
      supabaseAdmin
        .from('sessions')
        .select('*', { count: 'exact', head: true })
        .eq('assigned_tutor_id', tutor?.id)
        .eq('status', 'completed'),
    ])

    const sessions = toRows<TutorSessionRow>(upcomingSessions)
    const now = new Date()
    const weekEnd = new Date(now)
    weekEnd.setDate(weekEnd.getDate() + 7)
    const thisWeek = sessions.filter((s) => {
      if (!s.confirmed_start) return false
      return new Date(s.confirmed_start) <= weekEnd
    })
    const nextSession = sessions[0] ?? null

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#1e293b]">Welcome back, {profile.full_name}</h1>
          <p className="mt-1 text-gray-500">Here&apos;s your schedule overview</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm px-5 py-4 flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">This Week</span>
              <span className="rounded-md p-1.5 text-[#4a729f] bg-[#517cad]/10"><Calendar className="h-4 w-4" /></span>
            </div>
            <p className="text-2xl font-bold text-[#1e293b] tracking-tight">{thisWeek.length}</p>
            <p className="text-xs text-gray-400">sessions coming up</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm px-5 py-4 flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Upcoming</span>
              <span className="rounded-md p-1.5 text-amber-600 bg-amber-50"><Clock className="h-4 w-4" /></span>
            </div>
            <p className="text-2xl font-bold text-[#1e293b] tracking-tight">{totalUpcoming ?? 0}</p>
            <p className="text-xs text-gray-400">scheduled sessions</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm px-5 py-4 flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Completed</span>
              <span className="rounded-md p-1.5 text-emerald-600 bg-emerald-50"><CheckCircle className="h-4 w-4" /></span>
            </div>
            <p className="text-2xl font-bold text-[#1e293b] tracking-tight">{totalCompleted ?? 0}</p>
            <p className="text-xs text-gray-400">all time</p>
          </div>
        </div>

        {nextSession ? (
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-100 bg-gray-50/80">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Next Session</p>
            </div>
            <div className="px-5 py-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-lg font-bold text-[#1e293b]">
                    {nextSession.student?.full_name ?? 'Student not assigned'}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {nextSession.subjects?.map((id: string) => subjectMap.get(id) ?? id).join(', ') || 'No subjects'}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-semibold text-[#1e293b]">
                    {formatBusinessDate(nextSession.confirmed_start, {
                      weekday: 'long', month: 'short', day: 'numeric',
                    })}
                  </p>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {formatBusinessTime(nextSession.confirmed_start)}
                    {nextSession.confirmed_end && (
                      <span>
                        {' – '}
                        {formatBusinessTime(nextSession.confirmed_end)}
                      </span>
                    )}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 mt-4">
                <span className="inline-flex items-center gap-1.5 text-xs text-gray-500">
                  {nextSession.session_type === 'online' ? (
                    <><Video className="h-3.5 w-3.5" /> Online</>
                  ) : (
                    <><MapPin className="h-3.5 w-3.5" /> In Person</>
                  )}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-dashed border-gray-200 py-12 text-center">
            <Calendar className="h-10 w-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No upcoming sessions</p>
            <p className="text-sm text-gray-400 mt-1">You&apos;ll see your next session here once assigned</p>
          </div>
        )}

        {sessions.length > 1 && (
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-100 bg-gray-50/80 flex items-center justify-between">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Coming Up</p>
              <Link href="/dashboard/sessions" className="text-xs text-[#4a729f] hover:text-[#3b5c85] font-medium transition-colors">
                View All
              </Link>
            </div>
            <div className="divide-y divide-gray-100">
              {sessions.slice(1).map((s) => (
                <div key={s.id} className="px-5 py-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="text-center shrink-0 w-12">
                      <p className="text-xs font-medium text-gray-500 uppercase">
                        {formatBusinessDate(s.confirmed_start, { month: 'short' })}
                      </p>
                      <p className="text-lg font-bold text-[#1e293b] -mt-0.5">
                        {formatBusinessDate(s.confirmed_start, { day: 'numeric' })}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#1e293b]">{s.student?.full_name ?? 'Student not assigned'}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {formatBusinessTime(s.confirmed_start)}
                        {' · '}
                        {s.subjects?.map((id: string) => subjectMap.get(id) ?? id).join(', ') || '—'}
                      </p>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 text-xs text-gray-400">
                    {s.session_type === 'online' ? <Video className="h-3.5 w-3.5" /> : <MapPin className="h-3.5 w-3.5" />}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
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

  const [{ data: sessionsData }, { data: subjects }, { data: membership }, { data: packages }, { count: completedCount }] = await Promise.all([
    supabase
      .from('sessions')
      .select('id, status, confirmed_start, confirmed_end, session_type, subjects, meet_url, tutors(full_name), student:students(id, full_name, email, grade)')
      .eq('customer_id', customerId)
      .in('status', ['pending_scheduling', 'scheduled'])
      .order('confirmed_start', { ascending: true, nullsFirst: true })
      .limit(5),
    supabase.from('subjects').select('*'),
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
      .select('total_hours, remaining_hours, expires_at')
      .eq('customer_id', customerId)
      .gt('remaining_hours', 0)
      .or(unexpiredPackagesClause()),
    supabase
      .from('sessions')
      .select('*', { count: 'exact', head: true })
      .eq('customer_id', customerId)
      .eq('status', 'completed')
  ])

  const sessions = toRows<CustomerSessionRow>(sessionsData)

  const subjectMap = new Map(Object.entries(getSubjectNameMap(buildSubjectCatalog(subjects ?? []))))

  const membershipCredits = membership
    ? (membership.included_hours + membership.rollover_hours) - membership.used_hours
    : 0
  const packageCredits = (packages ?? []).reduce((sum: number, p) => sum + p.remaining_hours, 0)
  const packageTotal = (packages ?? []).reduce((sum: number, p) => sum + p.total_hours, 0)
  const totalCredits = membershipCredits + packageCredits
  // Soonest expiry across packages that still have hours on them. NULL means a
  // package bought before expiry existed, which never expires and so should not
  // put a deadline on the page.
  const nextPackageExpiry = (packages ?? [])
    .map((p) => p.expires_at)
    .filter((d): d is string => !!d)
    .sort()[0]
  const totalUsed = (membership?.used_hours ?? 0) + (packageTotal - packageCredits)
  const totalIncluded = (membership?.included_hours ?? 0) + packageTotal
  const hasCredits = totalCredits > 0 || membership || (packages && packages.length > 0)

  const now = new Date()
  const nextSession = sessions
    .filter((s) => s.status === 'scheduled' && s.confirmed_start)
    .sort((a, b) => new Date(a.confirmed_start ?? 0).getTime() - new Date(b.confirmed_start ?? 0).getTime())
    .find((s) => new Date(s.confirmed_end || s.confirmed_start || 0).getTime() > now.getTime())
  const nextSessionTutor = Array.isArray(nextSession?.tutors)
    ? nextSession.tutors[0]
    : nextSession?.tutors

  const hoursUntilNext = nextSession
    ? (new Date(nextSession.confirmed_start ?? 0).getTime() - now.getTime()) / 3600000
    : null

  return (
    <div className="space-y-8">
      <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#1e293b]">Welcome back, {profile.full_name}</h1>

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
                {nextSession.student?.full_name ?? 'Student not assigned'} · {(nextSession.subjects ?? []).map((id: string) => subjectMap.get(id)).filter(Boolean).join(', ')}
                {nextSessionTutor?.full_name && ` with ${nextSessionTutor.full_name}`}
              </p>
            </div>
          </div>
          {nextSession.meet_url && nextSession.session_type === 'online' && nextSession.confirmed_start && nextSession.confirmed_end && (
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
                  <CreditCard className="h-6 w-6 text-[#4a729f]" />
                </div>
                <div>
                  <p className="text-lg font-semibold text-[#1e293b]">Session Credits</p>
                  {membership?.current_period_end && (
                    <p className="text-xs text-gray-500 mt-0.5">
                      Membership renews {new Date(membership.current_period_end).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                    </p>
                  )}
                  {nextPackageExpiry && (
                    <p className="text-xs text-gray-500 mt-0.5">
                      Package hours expire {new Date(nextPackageExpiry).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                    </p>
                  )}
                </div>
              </div>
              {/* 2×2 grid on phones; the divider-separated row needs sm+. */}
              <div className="grid grid-cols-2 gap-3 sm:flex sm:items-center sm:gap-6">
                <div className="text-center rounded-lg bg-slate-50 py-2.5 sm:bg-transparent sm:py-0">
                  <p className="text-2xl sm:text-3xl font-bold text-[#1e293b]">{totalCredits}</p>
                  <p className="text-xs text-gray-500">Credits left</p>
                </div>
                <div className="hidden sm:block h-8 w-px bg-gray-200" />
                <div className="text-center rounded-lg bg-slate-50 py-2.5 sm:bg-transparent sm:py-0">
                  <p className="text-2xl sm:text-3xl font-bold text-gray-400">{totalUsed}</p>
                  <p className="text-xs text-gray-500">Used</p>
                </div>
                <div className="hidden sm:block h-8 w-px bg-gray-200" />
                <div className="text-center rounded-lg bg-slate-50 py-2.5 sm:bg-transparent sm:py-0">
                  <p className="text-2xl sm:text-3xl font-bold text-gray-300">{totalIncluded}</p>
                  <p className="text-xs text-gray-500">Total</p>
                </div>
                {(completedCount ?? 0) > 0 && (
                  <>
                    <div className="hidden sm:block h-8 w-px bg-gray-200" />
                    <div className="text-center rounded-lg bg-slate-50 py-2.5 sm:bg-transparent sm:py-0">
                      <p className="text-2xl sm:text-3xl font-bold text-[#4a729f]">{completedCount}</p>
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
          <CardContent className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#517cad]/10">
                <CreditCard className="h-6 w-6 text-[#4a729f]" aria-hidden="true" />
              </div>
              <div>
                <p className="font-semibold text-[#1e293b]">No session credits</p>
                <p className="text-sm text-gray-500 mt-0.5">Purchase a package or subscribe to get session credits.</p>
              </div>
            </div>
            <Link href="/dashboard/subscription">
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
            <Button variant="ghost" size="sm" className="text-[#4a729f]">
              View all <ChevronRight className="h-4 w-4 ml-0.5" />
            </Button>
          </Link>
        </div>

        {sessions && sessions.length > 0 ? (
          <div className="space-y-4">
            {sessions.map((session) => {
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

                      <p className={`font-semibold ${session.student ? 'text-[#1e293b]' : 'text-amber-700'}`}>
                        Student: {session.student?.full_name ?? 'Student not assigned'}
                      </p>

                      {subjectNames && (
                        <p className="font-medium text-[#1e293b]">{subjectNames}</p>
                      )}

                      <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-sm text-gray-600">
                        {session.confirmed_start ? (
                          <span className="flex items-center gap-1.5">
                            <Calendar className="h-4 w-4 text-gray-400 shrink-0" />
                            {formatBusinessDate(session.confirmed_start, {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric',
                            })}
                            {', '}
                            {formatBusinessTime(session.confirmed_start)}
                            {session.confirmed_end && (
                              <span className="text-gray-400">
                                {' – '}
                                {formatBusinessTime(session.confirmed_end)}
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
                            <Users className="h-4 w-4 text-[#4a729f]" />
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
