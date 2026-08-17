import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getAuthUser, getProfile } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { AdminSessionList, FlatSessionList, TutorSessionList } from '@/components/dashboard/SessionList'
import { AdminCreateSessionDialog } from '@/components/dashboard/AdminCreateSessionDialog'
import { buildSubjectCatalog, flattenSubjectCatalog, getSubjectNameMap } from '@/lib/subject-catalog'

export default async function SessionsPage() {
  const user = await getAuthUser()
  if (!user) redirect('/login')

  const profile = await getProfile(user.id)
  const supabase = await createClient()

  const { data: subjects } = await supabase.from('subjects').select('*')
  const subjectMap = new Map(Object.entries(getSubjectNameMap(buildSubjectCatalog(subjects ?? []))))

  if (profile?.role === 'admin') {
    const [
      { data: allSessions },
      { data: tutors },
      { data: bookingAccounts },
      { data: bookingStudents },
    ] = await Promise.all([
      supabaseAdmin
        .from('sessions')
        .select(`
          *,
          customers (full_name, email),
          student:students(id, full_name, email, grade),
          tutors (id, full_name),
          booking_requests!sessions_order_id_fkey (
            available_windows, available_days, available_time_start,
            available_time_end, timezone
          ),
          admin_session_booking_delivery (
            status, calendar_status, email_status, last_error
          )
        `)
        .in('status', ['pending_scheduling', 'scheduled', 'completed'])
        .order('created_at', { ascending: false }),
      supabase
        .from('tutors')
        .select('id, full_name')
        .eq('is_active', true)
        .order('full_name', { ascending: true, nullsFirst: false }),
      supabaseAdmin
        .from('customers')
        .select('id, full_name, email, account_type')
        .order('full_name', { ascending: true }),
      supabaseAdmin
        .from('students')
        .select('id, customer_id, full_name, email, grade')
        .eq('is_active', true)
        .order('full_name', { ascending: true }),
    ])

    const sessions = allSessions ?? []
    const customerIds = Array.from(new Set(
      sessions.map((session) => session.customer_id).filter((id): id is string => Boolean(id))
    ))
    const { data: activeStudents } = customerIds.length
      ? await supabaseAdmin
          .from('students')
          .select('id, customer_id, full_name, email, grade')
          .in('customer_id', customerIds)
          .eq('is_active', true)
          .order('full_name', { ascending: true })
      : { data: [] }
    const active = sessions.filter((s) => s.status !== 'completed')
    const totalCompleted = sessions.filter((s) => s.status === 'completed').length

    const subjectMapObj = Object.fromEntries(subjectMap)
    const bookingCustomerIds = new Set(
      (bookingStudents ?? []).map((student) => student.customer_id)
    )
    const bookingSubjects = flattenSubjectCatalog(buildSubjectCatalog(
      (subjects ?? []).filter((subject) => subject.is_active === true)
    )).filter((subject) => !subject.is_virtual)

    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#1e293b]">Sessions</h1>
            <p className="mt-1 text-gray-500">{active.length} active · {totalCompleted} completed</p>
          </div>
          <AdminCreateSessionDialog
            accounts={(bookingAccounts ?? []).filter((account) => bookingCustomerIds.has(account.id))}
            students={bookingStudents ?? []}
            tutors={tutors ?? []}
            subjects={bookingSubjects.map((subject) => ({
              id: subject.id,
              name: subject.name,
              category: subject.category,
            }))}
          />
        </div>
        <AdminSessionList
          sessions={sessions ?? []}
          tutors={tutors || []}
          activeStudents={activeStudents ?? []}
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
        student:students(id, full_name, email, grade),
        tutors (id, full_name)
      `)
      .eq('assigned_tutor_id', tutor?.id)
      .in('status', ['scheduled', 'completed'])
      .order('confirmed_start', { ascending: true })

    const allSessions = sessions ?? []
    const upcoming = allSessions.filter((s) => s.status === 'scheduled')
    const completed = allSessions.filter((s) => s.status === 'completed')

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#1e293b]">My Sessions</h1>
          <p className="mt-1 text-gray-500">{upcoming.length} upcoming · {completed.length} completed</p>
        </div>

        <TutorSessionList
          sessions={allSessions}
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
        student:students(id, full_name, email, grade),
        tutors (id, full_name)
      `)
      .eq('customer_id', customer?.id)
      .in('status', ['pending_scheduling', 'scheduled'])
      .order('confirmed_start', { ascending: true, nullsFirst: true })

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#1e293b]">Your Sessions</h1>
          <p className="mt-1 text-gray-500">Upcoming and pending tutoring sessions</p>
        </div>
        <FlatSessionList
          sessions={sessions || []}
          tutors={[]}
          subjectMap={subjectMap}
          isAdmin={false}
        />
      </div>
    )
  }

  return <div>Access Denied</div>
}
