import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

/**
 * Public API: returns upcoming/active In-Person SAT cohorts.
 * Query param: test_type=sat|act (default: sat)
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const testType = searchParams.get('test_type') ?? 'sat'
  const table = testType === 'act' ? 'act_course_cohorts' : 'sat_course_cohorts'
  const today = new Date().toISOString().slice(0, 10)

  // Auto-mark expired cohorts as completed
  await supabaseAdmin
    .from(table)
    .update({ status: 'completed' })
    .lt('end_date', today)
    .in('status', ['upcoming', 'active'])

  const { data, error } = await supabaseAdmin
    .from(table)
    .select('id, start_date, end_date, max_students, enrolled_count, price_cents, status, session_time_start, session_time_end')
    .gte('end_date', today)
    .in('status', ['upcoming', 'active'])
    .order('start_date', { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data ?? [])
}
