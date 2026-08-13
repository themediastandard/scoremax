import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { unexpiredPackagesClause } from '@/lib/package-expiry'
import {
  emptyCustomerCreditSummary,
  sanitizeCustomerCreditSummary,
} from '@/lib/customer-credit-summary'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const email = body.email?.trim().toLowerCase()
  const selectedStudentId = typeof body.student_id === 'string' ? body.student_id : null

  if (!email) {
    return NextResponse.json({ error: 'Email is required' }, { status: 400 })
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json(emptyCustomerCreditSummary())
  }

  let { data: customer, error: customerError } = await supabaseAdmin
    .from('customers')
    .select('id, full_name, email')
    .eq('profile_id', user.id)
    .maybeSingle()

  if (!customer && user.email) {
    const result = await supabaseAdmin
      .from('customers')
      .select('id, full_name, email')
      .ilike('email', user.email)
      .maybeSingle()
    customer = result.data
    customerError = result.error
  }
  
  if (customerError && customerError.code !== 'PGRST116') { // PGRST116 = not found
    return NextResponse.json({ error: customerError.message }, { status: 500 })
  }
  
  if (!customer) {
    return NextResponse.json(emptyCustomerCreditSummary())
  }

  if (selectedStudentId) {
    const { data: ownedStudent } = await supabaseAdmin
      .from('students')
      .select('id')
      .eq('id', selectedStudentId)
      .eq('customer_id', customer.id)
      .eq('is_active', true)
      .maybeSingle()
    if (!ownedStudent) {
      return NextResponse.json({ error: 'Select an active student on your account' }, { status: 403 })
    }
  }

  const customerEmail = customer.email?.trim().toLowerCase()
  const authEmail = user.email?.trim().toLowerCase()
  if (email !== customerEmail && email !== authEmail) {
    return NextResponse.json(emptyCustomerCreditSummary())
  }
  
  // Check Membership
  const { data: membership } = await supabaseAdmin
    .from('memberships')
    .select('tier, included_hours, used_hours, rollover_hours')
    .eq('customer_id', customer.id)
    .eq('status', 'active')
    .single()
    
  // Packages that are active and not expired. A NULL expires_at means "never
  // expires" and must be admitted explicitly — `.gt('expires_at', now)` alone
  // silently drops those rows, because NULL fails every comparison.
  const { data: packages } = await supabaseAdmin
    .from('packages')
    .select('remaining_hours, student_id')
    .eq('customer_id', customer.id)
    .gt('remaining_hours', 0)
    .or(unexpiredPackagesClause())
    
  const { data: satCourses } = await supabaseAdmin
    .from('course_enrollments')
    .select('remaining_sessions, student_id')
    .eq('customer_id', customer.id)
    .eq('status', 'active')
    .gt('remaining_sessions', 0)

  const { data: actCourses } = await supabaseAdmin
    .from('act_course_enrollments')
    .select('remaining_sessions, student_id')
    .eq('customer_id', customer.id)
    .eq('status', 'active')
    .gt('remaining_sessions', 0)

  const courses = [...(satCourses || []), ...(actCourses || [])]
  const { data: students } = await supabaseAdmin
    .from('students')
    .select('id, full_name')
    .eq('customer_id', customer.id)

  const membershipCredits = membership
    ? Math.max(0, (membership.included_hours ?? 0) + (membership.rollover_hours ?? 0) - (membership.used_hours ?? 0))
    : 0
  const familyPackageCredits = (packages ?? [])
    .filter((pkg) => !pkg.student_id)
    .reduce((sum, pkg) => sum + (pkg.remaining_hours ?? 0), 0)
  const familyCredits = membershipCredits + familyPackageCredits
  const byStudent = new Map<string, number>()
  for (const grant of [...(packages ?? []), ...courses]) {
    if (!grant.student_id) continue
    const credits = 'remaining_hours' in grant ? grant.remaining_hours : grant.remaining_sessions
    byStudent.set(grant.student_id, (byStudent.get(grant.student_id) ?? 0) + (credits ?? 0))
  }
  const studentCredits = (students ?? []).map((student) => ({
    studentId: student.id,
    studentName: student.full_name,
    credits: byStudent.get(student.id) ?? 0,
  }))

  return NextResponse.json({ ...sanitizeCustomerCreditSummary({
    customer,
    membership,
    packages: packages ?? [],
    courseEnrollments: courses,
  }),
    familyCredits,
    studentCredits,
    selectedStudentId,
    eligibleCredits: familyCredits + (selectedStudentId ? (byStudent.get(selectedStudentId) ?? 0) : 0),
  })
}
