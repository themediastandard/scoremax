import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const email = body.email?.trim().toLowerCase()

  if (!email) {
    return NextResponse.json({ error: 'Email is required' }, { status: 400 })
  }

  const { data: customer, error: customerError } = await supabaseAdmin
    .from('customers')
    .select('id, full_name')
    .ilike('email', email)
    .maybeSingle()
  
  if (customerError && customerError.code !== 'PGRST116') { // PGRST116 = not found
    return NextResponse.json({ error: customerError.message }, { status: 500 })
  }
  
  if (!customer) {
    return NextResponse.json({ 
      isMember: false,
      hasCredits: false,
      packages: [],
      courseEnrollments: []
    })
  }
  
  // Check Membership
  const { data: membership } = await supabaseAdmin
    .from('memberships')
    .select('*')
    .eq('customer_id', customer.id)
    .eq('status', 'active')
    .single()
    
  // Check Packages (active, not expired)
  const { data: packages } = await supabaseAdmin
    .from('packages')
    .select('*')
    .eq('customer_id', customer.id)
    .gt('remaining_hours', 0)
    .gt('expires_at', new Date().toISOString())
    
  const { data: satCourses } = await supabaseAdmin
    .from('course_enrollments')
    .select('*')
    .eq('customer_id', customer.id)
    .eq('status', 'active')
    .gt('remaining_sessions', 0)

  const { data: actCourses } = await supabaseAdmin
    .from('act_course_enrollments')
    .select('*')
    .eq('customer_id', customer.id)
    .eq('status', 'active')
    .gt('remaining_sessions', 0)

  const courses = [...(satCourses || []), ...(actCourses || [])]

  const hasMembershipCredits = membership ? (membership.included_hours - membership.used_hours + membership.rollover_hours > 0) : false
  const hasPackageCredits = packages && packages.length > 0
  const hasCourseCredits = courses.length > 0
  
  return NextResponse.json({
    customer: { id: customer.id, full_name: customer.full_name },
    membership: membership ? { id: membership.id, tier: membership.tier, included_hours: membership.included_hours, used_hours: membership.used_hours, rollover_hours: membership.rollover_hours } : null,
    packages: (packages || []).map((p: { id: string; remaining_hours: number }) => ({ id: p.id, remaining_hours: p.remaining_hours })),
    courseEnrollments: (courses || []).map((c: { id: string; remaining_sessions: number }) => ({ id: c.id, remaining_sessions: c.remaining_sessions })),
    isMember: !!membership,
    hasCredits: hasMembershipCredits || hasPackageCredits || hasCourseCredits,
    totalCredits: (membership ? (membership.included_hours - membership.used_hours + membership.rollover_hours) : 0) + 
                  (packages ? packages.reduce((sum: number, p: { remaining_hours: number }) => sum + p.remaining_hours, 0) : 0),
    totalCourseSessions: courses ? courses.reduce((sum: number, c: { remaining_sessions: number }) => sum + c.remaining_sessions, 0) : 0
  })
}
