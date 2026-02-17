import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  // Find tutor
  const { data: tutor } = await supabaseAdmin
    .from('tutors')
    .select('id')
    .eq('profile_id', user.id)
    .single()
    
  if (!tutor) {
    return NextResponse.json({ error: 'Not a tutor' }, { status: 403 })
  }
  
  // Fetch sessions
  const { data: sessions, error } = await supabaseAdmin
    .from('booking_requests')
    .select(`
      *,
      customers (full_name, email, phone)
    `)
    .eq('assigned_tutor_id', tutor.id)
    .eq('status', 'active')
    .order('confirmed_start')
    
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  
  return NextResponse.json(sessions)
}