import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from('tutors')
    .select('*')
    .order('full_name')

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

const emptyToNull = (v: unknown) => (v === '' || v === undefined ? null : v)

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { full_name, email, phone, bio, photo_url, specialties, password } = body

  if (!email || !password || !full_name) {
    return NextResponse.json({ error: 'Missing required fields: name, email, and password' }, { status: 400 })
  }

  // 1. Create Auth User (Trigger creates Profile)
  const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name, role: 'tutor' }
  })

  if (authError) {
    const msg = authError.message?.toLowerCase().includes('already')
      ? 'That email is already registered. Use a different email or invite them to log in as an existing user.'
      : authError.message
    return NextResponse.json({ error: msg }, { status: 400 })
  }

  // 2. Create Tutor Record linked to Auth User
  const { data: tutor, error: tutorError } = await supabaseAdmin
    .from('tutors')
    .insert({
      profile_id: authUser.user.id,
      full_name: String(full_name).trim(),
      email: String(email).trim().toLowerCase(),
      phone: emptyToNull(phone),
      bio: emptyToNull(bio),
      photo_url: emptyToNull(photo_url),
      specialties: Array.isArray(specialties) && specialties.length > 0 ? specialties : null,
      is_active: true
    })
    .select()
    .single()

  if (tutorError) {
    // Rollback auth user if tutor creation fails
    await supabaseAdmin.auth.admin.deleteUser(authUser.user.id)
    return NextResponse.json({ error: tutorError.message }, { status: 500 })
  }

  return NextResponse.json(tutor)
}
