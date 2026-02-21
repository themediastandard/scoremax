import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getAuthUser, getProfile } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { AdminSessionList, FlatSessionList } from '@/components/dashboard/SessionList'
import { SessionMetrics } from '@/components/dashboard/SessionMetrics'
import { TutorSessionsTable } from '@/components/dashboard/TutorSessionsTable'
import { CalendarCheck, Users, CheckCircle2, CalendarClock } from 'lucide-react'

export default async function SessionsPage() {
  const user = await getAuthUser()
  if (!user) redirect('/login')

  const profile = await getProfile(user.id)
  const supabase = await createClient()

  const { data: subjects } = await supabase.from('subjects').select('id, name')
  const subjectMap = new Map((subjects ?? []).map((s) => [s.id, s.name]))

  if (profile?.role === 'admin') {
    const [{ data: allSessions }, { data: tutors }] = await Promise.all([
      supabase
        .from('sessions')
        .select(`
          *,
          customers (full_name, email),
          tutors (id, full_name)
        `)
        .in('status', ['pending_scheduling', 'scheduled', 'completed'])
        .order('created_at', { ascending: false }),
      supabase
        .from('tutors')
        .select('id, full_name')
        .eq('is_active', true),
    ])

    const sessions = allSessions ?? []
    const now = new Date()
    const weekEnd = new Date(now)
    weekEnd.setDate(weekEnd.getDate() + 7)

    const active = sessions.filter((s) => s.status !== 'completed')
    const needsScheduling = sessions.filter((s) => s.status === 'pending_scheduling').length
    const unassigned = active.filter((s) => !s.assigned_tutor_id).length
    const scheduled = sessions.filter((s) => s.status === 'scheduled').length
    const totalCompleted = sessions.filter((s) => s.status === 'completed').length
    const upcomingThisWeek = sessions.filter((s) => {
      if (s.status !== 'scheduled' || !s.confirmed_start) return false
      const start = new Date(s.confirmed_start)
      return start >= now && start <= weekEnd
    }).length

    const subjectMapObj = Object.fromEntries(subjectMap)

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-serif font-bold text-[#1e293b]">Sessions</h1>
          <p className="mt-1 text-gray-500">{active.length} active · {totalCompleted} completed</p>
        </div>
        <SessionMetrics
          needsScheduling={needsScheduling}
          unassigned={unassigned}
          upcomingThisWeek={upcomingThisWeek}
          totalCompleted={totalCompleted}
          totalActive={scheduled}
        />
        <AdminSessionList
          sessions={sessions as any}
          tutors={tutors || []}
          subjectMap={subjectMapObj}
        />
      </div>
    )
  }

  if (profile?.role === 'tutor') {
    const { data: tutor } = await supabase
      .from('tutors')
      .select('id')
      .eq('profile_id', user.id)
      .single()

    const { data: sessions } = await supabaseAdmin
      .from('sessions')
      .select(`
        *,
        customers (full_name, email),
        tutors (id, full_name)
      `)
      .eq('assigned_tutor_id', tutor?.id)
      .in('status', ['scheduled', 'completed'])
      .order('confirmed_start', { ascending: true })

    const allSessions = sessions ?? []
    const now = new Date()
    const weekEnd = new Date(now)
    weekEnd.setDate(weekEnd.getDate() + 7)

    const upcoming = allSessions.filter((s) => s.status === 'scheduled')
    const completed = allSessions.filter((s) => s.status === 'completed')
    const thisWeek = upcoming.filter((s) => {
      if (!s.confirmed_start) return false
      const start = new Date(s.confirmed_start)
      return start >= now && start <= weekEnd
    })
    const uniqueStudents = new Set(allSessions.map((s) => s.customer_id)).size

    const metrics = [
      {
        label: 'This Week',
        value: thisWeek.length.toString(),
        sub: 'upcoming sessions',
        icon: <CalendarClock className="h-4 w-4" />,
        accent: thisWeek.length > 0 ? 'text-[#517cad] bg-[#517cad]/10' : 'text-gray-400 bg-gray-50',
      },
      {
        label: 'Total Upcoming',
        value: upcoming.length.toString(),
        sub: 'scheduled sessions',
        icon: <CalendarCheck className="h-4 w-4" />,
        accent: 'text-amber-600 bg-amber-50',
      },
      {
        label: 'Completed',
        value: completed.length.toString(),
        sub: 'all time',
        icon: <CheckCircle2 className="h-4 w-4" />,
        accent: 'text-emerald-600 bg-emerald-50',
      },
      {
        label: 'Students',
        value: uniqueStudents.toString(),
        sub: 'unique students',
        icon: <Users className="h-4 w-4" />,
        accent: 'text-violet-600 bg-violet-50',
      },
    ]

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-serif font-bold text-[#1e293b]">My Sessions</h1>
          <p className="mt-1 text-gray-500">{upcoming.length} upcoming · {completed.length} completed</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {metrics.map((m) => (
            <div
              key={m.label}
              className="bg-white rounded-lg border border-gray-200 shadow-sm px-5 py-4 flex flex-col gap-1"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">{m.label}</span>
                <span className={`rounded-md p-1.5 ${m.accent}`}>{m.icon}</span>
              </div>
              <p className="text-2xl font-bold text-[#1e293b] tracking-tight">{m.value}</p>
              <p className="text-xs text-gray-400">{m.sub}</p>
            </div>
          ))}
        </div>

        <TutorSessionsTable
          sessions={allSessions as any}
          subjectMap={Object.fromEntries(subjectMap)}
        />
      </div>
    )
  }

  if (profile?.role === 'customer') {
    const { data: customer } = await supabase
      .from('customers')
      .select('id')
      .eq('profile_id', user.id)
      .single()

    const { data: sessions } = await supabase
      .from('sessions')
      .select(`
        *,
        customers (full_name, email),
        tutors (id, full_name)
      `)
      .eq('customer_id', customer?.id)
      .in('status', ['pending_scheduling', 'scheduled'])
      .order('confirmed_start', { ascending: true, nullsFirst: true })

    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-serif font-bold text-[#1e293b]">Your Sessions</h1>
        <FlatSessionList
          sessions={(sessions || []) as any}
          tutors={[]}
          subjectMap={subjectMap}
          isAdmin={false}
        />
      </div>
    )
  }

  return <div>Access Denied</div>
}
