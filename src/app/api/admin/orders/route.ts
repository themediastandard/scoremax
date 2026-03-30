import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { requireAdmin } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const authError = await requireAdmin()
  if (authError) return authError

  const { data, error } = await supabaseAdmin
    .from('booking_requests')
    .select(`
      *,
      customers (full_name, email),
      tutors (full_name)
    `)
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}
