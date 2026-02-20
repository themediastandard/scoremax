import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function GET(req: NextRequest) {
  const raw = req.nextUrl.searchParams.get('email')
  const email = raw?.trim().toLowerCase()

  if (!email) {
    return NextResponse.json({ error: 'Email is required' }, { status: 400 })
  }

  // Use supabaseAdmin to bypass RLS - match email case-insensitively (emails are case-insensitive)
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
    
  // Check Course Enrollments (active)
  const { data: courses } = await supabaseAdmin
    .from('course_enrollments')
    .select('*')
    .eq('customer_id', customer.id)
    .eq('status', 'active')
    .gt('remaining_sessions', 0)
    
  // Check if they have ANY credits (membership hours, package hours, or course sessions)
  const hasMembershipCredits = membership ? (membership.included_hours - membership.used_hours + membership.rollover_hours > 0) : false
  const hasPackageCredits = packages && packages.length > 0
  const hasCourseCredits = courses && courses.length > 0
  
  return NextResponse.json({
    customer,
    membership: membership || null,
    packages: packages || [],
    courseEnrollments: courses || [],
    isMember: !!membership,
    hasCredits: hasMembershipCredits || hasPackageCredits || hasCourseCredits,
    totalCredits: (membership ? (membership.included_hours - membership.used_hours + membership.rollover_hours) : 0) + 
                  (packages ? packages.reduce((sum: any, p: any) => sum + p.remaining_hours, 0) : 0),
    totalCourseSessions: courses ? courses.reduce((sum: any, c: any) => sum + c.remaining_sessions, 0) : 0
  })
}
