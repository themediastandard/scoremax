import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { resend, getEmailDefaults } from '@/lib/resend'
import { emailLayout, detailRow } from '@/lib/email-templates'

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
    await supabaseAdmin.auth.admin.deleteUser(authUser.user.id)
    return NextResponse.json({ error: tutorError.message }, { status: 500 })
  }

  try {
    await resend.emails.send({
      ...getEmailDefaults(),
      to: email,
      subject: 'Welcome to ScoreMax',
      html: emailLayout({
        title: 'Welcome to the Team',
        greeting: `Hi ${full_name},`,
        body: [
          '<p style="margin: 0 0 16px 0;">You\'ve been added as a tutor on ScoreMax. Use the credentials below to sign in to your dashboard:</p>',
          detailRow('Email:', email),
          detailRow('Temporary Password:', password),
          '<p style="margin: 16px 0 0 0; font-size: 14px; color: #6b7280;">You can change your password anytime from your account settings.</p>',
        ].join(''),
        ctaText: 'Sign In',
        ctaUrl: `${process.env.NEXT_PUBLIC_APP_URL}/login`,
      }),
    })
  } catch (e) {
    console.error('Failed to send tutor welcome email', e)
  }

  return NextResponse.json(tutor)
}
