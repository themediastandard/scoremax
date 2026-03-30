import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { requireAdmin } from '@/lib/auth'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authError = await requireAdmin()
  if (authError) return authError

  const { id } = await params
  const { data, error } = await supabaseAdmin
    .from('act_course_cohorts')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 404 })
  }

  return NextResponse.json(data)
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authError = await requireAdmin()
  if (authError) return authError

  const { id } = await params
  const body = await req.json()
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { id: _id, created_at, enrolled_count, ...updates } = body

  if (updates.session_time_start !== undefined || updates.session_time_end !== undefined) {
    if (!updates.session_time_start || !updates.session_time_end) {
      return NextResponse.json({ error: 'Session time start and end are required' }, { status: 400 })
    }
  }

  const { data, error } = await supabaseAdmin
    .from('act_course_cohorts')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authError = await requireAdmin()
  if (authError) return authError

  const { id } = await params
  const { error } = await supabaseAdmin
    .from('act_course_cohorts')
    .delete()
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
