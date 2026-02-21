import { redirect } from 'next/navigation'
import { getAuthUser, getProfile } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { TutorForm } from '@/components/dashboard/TutorForm'
import { TutorsTable } from '@/components/dashboard/TutorsTable'
import { TutorMetrics } from '@/components/dashboard/TutorMetrics'

export default async function TutorsPage() {
  const user = await getAuthUser()
  if (!user) redirect('/login')

  const profile = await getProfile(user.id)
  if (profile?.role !== 'admin') redirect('/dashboard')

  const [{ data: tutors }, { data: sessions }] = await Promise.all([
    supabaseAdmin.from('tutors').select('*').order('full_name'),
    supabaseAdmin
      .from('sessions')
      .select('assigned_tutor_id, status')
      .not('assigned_tutor_id', 'is', null),
  ])

  const sessionMap: Record<string, { completed: number; upcoming: number }> = {}
  let totalUpcoming = 0
  let totalCompleted = 0
  for (const s of sessions ?? []) {
    const id = s.assigned_tutor_id
    if (!id) continue
    const curr = sessionMap[id] ?? { completed: 0, upcoming: 0 }
    if (s.status === 'completed') {
      curr.completed++
      totalCompleted++
    } else if (s.status === 'scheduled' || s.status === 'pending_scheduling') {
      curr.upcoming++
      totalUpcoming++
    }
    sessionMap[id] = curr
  }

  const allSubjects = Array.from(
    new Set((tutors ?? []).flatMap((t) => t.specialties ?? []))
  ).sort()

  const activeTutors = (tutors ?? []).filter((t) => t.is_active).length

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-serif font-bold text-[#1e293b]">Tutors</h1>
          <p className="mt-1 text-gray-500">{tutors?.length ?? 0} total</p>
        </div>
        <TutorForm />
      </div>

      <TutorMetrics
        totalTutors={tutors?.length ?? 0}
        activeTutors={activeTutors}
        totalUpcoming={totalUpcoming}
        totalCompleted={totalCompleted}
        subjectsCovered={allSubjects.length}
      />

      <TutorsTable
        tutors={tutors ?? []}
        sessionMap={sessionMap}
        allSubjects={allSubjects}
      />
    </div>
  )
}
