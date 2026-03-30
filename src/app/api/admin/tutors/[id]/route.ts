import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { requireAdmin } from '@/lib/auth'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authError = await requireAdmin()
  if (authError) return authError

  const { id } = await params
  const { data, error } = await supabaseAdmin
    .from('tutors')
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
  const { id: _id, profile_id, created_at, password, ...updates } = body

  const { data, error } = await supabaseAdmin
    .from('tutors')
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
  const { data: tutor } = await supabaseAdmin
    .from('tutors')
    .select('profile_id')
    .eq('id', id)
    .single()

  if (!tutor) {
    return NextResponse.json({ error: 'Tutor not found' }, { status: 404 })
  }

  const { error: tutorError } = await supabaseAdmin
    .from('tutors')
    .delete()
    .eq('id', id)

  if (tutorError) {
    return NextResponse.json({ error: tutorError.message }, { status: 500 })
  }

  const { error: deleteUserError } = await supabaseAdmin.auth.admin.deleteUser(tutor.profile_id)

  if (deleteUserError) {
    console.error('Failed to delete auth user after tutor deletion', deleteUserError)
    return NextResponse.json({ error: 'Failed to delete user account' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
