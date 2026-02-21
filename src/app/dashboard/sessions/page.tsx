import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getAuthUser, getProfile } from '@/lib/auth'
import { AdminSessionList, FlatSessionList } from '@/components/dashboard/SessionList'
import { SessionMetrics } from '@/components/dashboard/SessionMetrics'

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

    const { data: sessions } = await supabase
      .from('sessions')
      .select(`
        *,
        customers (full_name, email),
        tutors (id, full_name)
      `)
      .eq('assigned_tutor_id', tutor?.id)
      .in('status', ['scheduled'])
      .order('confirmed_start', { ascending: true })

    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-serif font-bold text-[#1e293b]">Upcoming Sessions</h1>
        <FlatSessionList
          sessions={(sessions || []) as any}
          tutors={[]}
          subjectMap={subjectMap}
          isAdmin={false}
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
