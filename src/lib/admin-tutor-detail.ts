import 'server-only'

import { supabaseAdmin } from '@/lib/supabase/admin'
import { buildSubjectCatalog, getSubjectNameMap } from '@/lib/subject-catalog'
import { groupTutorSessions } from '@/lib/tutor-session-groups'

export interface AdminTutorSession {
  id: string
  order_id: string | null
  customer_id: string
  status: string | null
  confirmed_start: string | null
  confirmed_end: string | null
  session_type: string | null
  subjects: string[] | null
  meet_url: string | null
  created_at: string
  student: { id: string; full_name: string; email: string; grade: string } | null
  customers: { full_name: string | null; email: string } | null
}

export interface AdminTutorDetail {
  tutor: {
    id: string
    full_name: string
    email: string
    phone: string | null
    photo_url: string | null
    bio: string | null
    specialties: string[] | null
    is_active: boolean
    created_at: string
  }
  upcomingSessions: AdminTutorSession[]
  pastSessions: AdminTutorSession[]
  subjectMap: Record<string, string>
}

export async function loadAdminTutorDetail(tutorId: string): Promise<AdminTutorDetail | null> {
  // Keep this select explicit: auth linkage and Google OAuth credentials are
  // not tutor-profile content and must never reach the page.
  const { data: tutor, error: tutorError } = await supabaseAdmin
    .from('tutors')
    .select('id, full_name, email, phone, photo_url, bio, specialties, is_active, created_at')
    .eq('id', tutorId)
    .maybeSingle()

  if (tutorError) throw new Error('Could not load tutor')
  if (!tutor) return null

  const [sessionsResult, subjectsResult] = await Promise.all([
    supabaseAdmin
      .from('sessions')
      .select('id, order_id, customer_id, status, confirmed_start, confirmed_end, session_type, subjects, meet_url, created_at, student:students(id, full_name, email, grade), customers(full_name, email)')
      .eq('assigned_tutor_id', tutorId)
      .order('confirmed_start', { ascending: true, nullsFirst: true }),
    supabaseAdmin
      .from('subjects')
      .select('id, name, slug, category, hourly_rate_cents'),
  ])

  if (sessionsResult.error || subjectsResult.error) {
    throw new Error('Could not load tutor details')
  }

  const sessions = (sessionsResult.data ?? []) as unknown as AdminTutorSession[]
  const databaseSubjectMap = Object.fromEntries(
    (subjectsResult.data ?? []).map((subject) => [subject.id, subject.name])
  )
  const subjectMap = {
    ...getSubjectNameMap(buildSubjectCatalog(subjectsResult.data ?? [])),
    ...databaseSubjectMap,
  }
  const { upcoming, past } = groupTutorSessions(sessions)

  return {
    tutor,
    upcomingSessions: upcoming,
    pastSessions: past,
    subjectMap,
  }
}
