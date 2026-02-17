import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from('sat_course_cohorts')
    .select('*')
    .order('start_date', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { start_date, end_date, max_students, price_cents, status } = body

  if (!start_date || !end_date) {
    return NextResponse.json({ error: 'Start and End dates are required' }, { status: 400 })
  }

  const { data, error } = await supabaseAdmin
    .from('sat_course_cohorts')
    .insert({
      start_date,
      end_date,
      max_students: max_students || 15,
      price_cents: price_cents || 89500,
      status: status || 'upcoming',
      enrolled_count: 0
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}
