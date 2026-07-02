import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import {
  emptyCustomerCreditSummary,
  sanitizeCustomerCreditSummary,
} from '@/lib/customer-credit-summary'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const email = body.email?.trim().toLowerCase()

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
    
  // Check Packages (active, not expired)
  const { data: packages } = await supabaseAdmin
    .from('packages')
    .select('remaining_hours')
    .eq('customer_id', customer.id)
    .gt('remaining_hours', 0)
    .gt('expires_at', new Date().toISOString())
    
  const { data: satCourses } = await supabaseAdmin
    .from('course_enrollments')
    .select('remaining_sessions')
    .eq('customer_id', customer.id)
    .eq('status', 'active')
    .gt('remaining_sessions', 0)

  const { data: actCourses } = await supabaseAdmin
    .from('act_course_enrollments')
    .select('remaining_sessions')
    .eq('customer_id', customer.id)
    .eq('status', 'active')
    .gt('remaining_sessions', 0)

  const courses = [...(satCourses || []), ...(actCourses || [])]

  return NextResponse.json(sanitizeCustomerCreditSummary({
    customer,
    membership,
    packages: packages ?? [],
    courseEnrollments: courses,
  } as any))
}
