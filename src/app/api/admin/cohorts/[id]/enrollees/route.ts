import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

/**
 * GET enrollees for a cohort (from course_enrollments + customers).
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const cohortId = params.id

  const { data, error } = await supabaseAdmin
    .from('course_enrollments')
    .select(`
      id,
      created_at,
      customers (
        id,
        full_name,
        email,
        phone
      )
    `)
    .eq('cohort_id', cohortId)
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Supabase may return `customers` or `customer` depending on schema
  const enrollees = (data ?? []).map((row: { id: string; created_at: string; customers?: { id: string; full_name: string; email: string; phone: string } | null; customer?: { id: string; full_name: string; email: string; phone: string } | null }) => {
    const c = row.customers ?? row.customer ?? null
    return {
      id: row.id,
      enrolledAt: row.created_at,
      customerId: c?.id ?? null,
      name: c?.full_name ?? '—',
      email: c?.email ?? '—',
      phone: c?.phone ?? null,
    }
  })

  return NextResponse.json(enrollees)
}
