import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  // Find customer ID
  const { data: customer } = await supabaseAdmin
    .from('customers')
    .select('id')
    .eq('profile_id', user.id)
    .single()
    
  if (!customer) {
    return NextResponse.json({ memberships: null, packages: [], courses: [] })
  }
  
  const { data: memberships, error: mError } = await supabaseAdmin
    .from('memberships')
    .select('*')
    .eq('customer_id', customer.id)
    .order('created_at', { ascending: false })
    .single()
    
  const { data: packages, error: pError } = await supabaseAdmin
    .from('packages')
    .select('*')
    .eq('customer_id', customer.id)
    .gt('remaining_hours', 0)
    
  const { data: courses, error: cError } = await supabaseAdmin
    .from('course_enrollments')
    .select('*')
    .eq('customer_id', customer.id)
    .eq('status', 'active')
    
  if (mError && mError.code !== 'PGRST116') {
    return NextResponse.json({ error: mError.message }, { status: 500 })
  }
  
  return NextResponse.json({ 
    membership: memberships || null,
    packages: packages || [],
    courses: courses || []
  })
}