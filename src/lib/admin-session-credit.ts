import 'server-only'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { unexpiredPackagesClause } from '@/lib/package-expiry'

export type AdminStudentCreditSummary = {
  customerId: string
  studentId: string
  eligibleCredits: number
  familyCredits: number
  studentCredits: number
  breakdown: {
    membership: number
    familyPackage: number
    studentPackage: number
    studentCourse: number
  }
}

const sum = <T>(rows: T[] | null, value: (row: T) => number) =>
  (rows ?? []).reduce((total, row) => total + Math.max(0, value(row)), 0)

/** Read-only preview. The submit RPC locks and recomputes every value. */
export async function loadAdminStudentCreditSummary(
  customerId: string,
  studentId: string,
): Promise<AdminStudentCreditSummary | null> {
  const { data: student, error: studentError } = await supabaseAdmin
    .from('students')
    .select('id')
    .eq('id', studentId)
    .eq('customer_id', customerId)
    .eq('is_active', true)
    .maybeSingle()
  if (studentError) throw studentError
  if (!student) return null

  const [memberships, familyPackages, studentPackages, courses] = await Promise.all([
    supabaseAdmin
      .from('memberships')
      .select('included_hours, used_hours, rollover_hours')
      .eq('customer_id', customerId)
      .eq('status', 'active'),
    supabaseAdmin
      .from('packages')
      .select('remaining_hours')
      .eq('customer_id', customerId)
      .is('student_id', null)
      .gt('remaining_hours', 0)
      .or(unexpiredPackagesClause()),
    supabaseAdmin
      .from('packages')
      .select('remaining_hours')
      .eq('customer_id', customerId)
      .eq('student_id', studentId)
      .gt('remaining_hours', 0)
      .or(unexpiredPackagesClause()),
    supabaseAdmin
      .from('course_enrollments')
      .select('remaining_sessions')
      .eq('customer_id', customerId)
      .eq('student_id', studentId)
      .eq('status', 'active')
      .gt('remaining_sessions', 0),
  ])

  for (const result of [memberships, familyPackages, studentPackages, courses]) {
    if (result.error) throw result.error
  }

  const membership = sum(memberships.data, (row) =>
    (row.included_hours ?? 0) + (row.rollover_hours ?? 0) - (row.used_hours ?? 0)
  )
  const familyPackage = sum(familyPackages.data, (row) => row.remaining_hours ?? 0)
  const studentPackage = sum(studentPackages.data, (row) => row.remaining_hours ?? 0)
  const studentCourse = sum(courses.data, (row) => row.remaining_sessions ?? 0)
  const familyCredits = membership + familyPackage
  const studentCredits = studentPackage + studentCourse

  return {
    customerId,
    studentId,
    eligibleCredits: familyCredits + studentCredits,
    familyCredits,
    studentCredits,
    breakdown: { membership, familyPackage, studentPackage, studentCourse },
  }
}
