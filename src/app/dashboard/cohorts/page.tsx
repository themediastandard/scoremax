import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { CohortForm } from '@/components/dashboard/CohortForm'
import { CohortRow } from '@/components/dashboard/CohortRow'
import { getAuthUser, getProfile } from '@/lib/auth'

export default async function CohortsPage() {
  const user = await getAuthUser()
  if (!user) redirect('/login')

  const profile = await getProfile(user.id)
  const supabase = await createClient()

  if (profile?.role !== 'admin') {
    return <div>Access Denied</div>
  }

  const [{ data: satCohorts }, { data: actCohorts }] = await Promise.all([
    supabase.from('sat_course_cohorts').select('*').order('start_date'),
    supabase.from('act_course_cohorts').select('*').order('start_date'),
  ])

  const cohortCard = (
    cohorts: { id: string; start_date: string; end_date: string; max_students: number; enrolled_count: number; status: string; price_cents: number }[] | null,
    testType: 'sat' | 'act',
    title: string
  ) => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-serif font-bold text-[#1e293b]">{title}</h2>
        <CohortForm testType={testType} />
      </div>

      <div className="bg-white rounded-lg shadow border border-gray-100 overflow-hidden">
        <div className="px-6 py-3 bg-gray-50 border-b border-gray-100">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
            Click a row to expand and see enrollees
          </p>
        </div>
        <div className="divide-y divide-gray-100">
          {cohorts?.map((cohort) => (
            <CohortRow key={cohort.id} cohort={cohort} testType={testType} />
          ))}
        </div>
        {(!cohorts || cohorts.length === 0) && (
          <div className="px-6 py-12 text-center text-sm text-gray-500">No cohorts found.</div>
        )}
      </div>
    </div>
  )

  return (
    <div className="space-y-10">
      <h1 className="text-3xl font-serif font-bold text-[#1e293b]">Cohorts</h1>

      {cohortCard(satCohorts ?? [], 'sat', 'SAT Cohorts')}
      {cohortCard(actCohorts ?? [], 'act', 'ACT Cohorts')}
    </div>
  )
}
