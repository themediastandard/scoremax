import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { requireAdmin } from '@/lib/auth'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireAdmin()
  if (authError) return authError

  const { id: cohortId } = await params

  const { data, error } = await supabaseAdmin
    .from('act_course_enrollments')
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
