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
    return NextResponse.json({ bookings: [] })
  }
  
  const { data: bookings, error } = await supabaseAdmin
    .from('booking_requests')
    .select('*')
    .eq('customer_id', customer.id)
    .order('created_at', { ascending: false })
    
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  
  return NextResponse.json(bookings)
}