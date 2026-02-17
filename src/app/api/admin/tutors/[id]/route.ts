import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const { data, error } = await supabaseAdmin
    .from('tutors')
    .select('*')
    .eq('id', params.id)
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 404 })
  }

  return NextResponse.json(data)
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json()
  
  // Remove fields that shouldn't be updated directly via PATCH if any
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { id, profile_id, created_at, ...updates } = body

  const { data, error } = await supabaseAdmin
    .from('tutors')
    .update(updates)
    .eq('id', params.id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  // First get the profile_id (auth user id)
  const { data: tutor } = await supabaseAdmin
    .from('tutors')
    .select('profile_id')
    .eq('id', params.id)
    .single()

  if (!tutor) {
    return NextResponse.json({ error: 'Tutor not found' }, { status: 404 })
  }

  // 1. Delete Tutor Record
  const { error: tutorError } = await supabaseAdmin
    .from('tutors')
    .delete()
    .eq('id', params.id)

  if (tutorError) {
    return NextResponse.json({ error: tutorError.message }, { status: 500 })
  }

  // 2. Delete Auth User (Cascades to Profile)
  const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(tutor.profile_id)

  if (authError) {
    // Note: Tutor record is already gone, so this is a partial failure state
    // But auth user deletion is critical for cleanup
    console.error('Failed to delete auth user after tutor deletion', authError)
    return NextResponse.json({ error: 'Failed to delete user account' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
