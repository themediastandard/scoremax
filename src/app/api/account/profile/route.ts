import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .maybeSingle()

  const { data: customer } = await supabaseAdmin
    .from('customers')
    .select('full_name, email, phone, student_grade')
    .eq('profile_id', user.id)
    .maybeSingle()

  return NextResponse.json({
    fullName: customer?.full_name || profile?.full_name || '',
    email: customer?.email || user.email || '',
    phone: customer?.phone || '',
    studentGrade: customer?.student_grade || '',
  })
}

export async function PATCH(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { fullName, phone, studentGrade } = await req.json()

  await supabaseAdmin
    .from('profiles')
    .update({ full_name: fullName })
    .eq('id', user.id)

  // The signup trigger is supposed to create the customers row, but accounts
  // exist without one — updating only-if-present silently discarded phone and
  // grade while still reporting success. Adopt an unlinked row matching the
  // user's email, or create the row outright.
  let { data: customer } = await supabaseAdmin
    .from('customers')
    .select('id')
    .eq('profile_id', user.id)
    .maybeSingle()

  if (!customer && user.email) {
    const { data: byEmail } = await supabaseAdmin
      .from('customers')
      .select('id')
      .eq('email', user.email)
      .is('profile_id', null)
      .maybeSingle()
    if (byEmail) {
      await supabaseAdmin.from('customers').update({ profile_id: user.id }).eq('id', byEmail.id)
      customer = byEmail
    }
  }

  if (customer) {
    const { error } = await supabaseAdmin
      .from('customers')
      .update({
        full_name: fullName,
        phone: phone || null,
        student_grade: studentGrade || null,
      })
      .eq('id', customer.id)
    if (error) {
      return NextResponse.json({ error: 'Could not save profile' }, { status: 500 })
    }
  } else {
    const { error } = await supabaseAdmin.from('customers').insert({
      profile_id: user.id,
      full_name: fullName,
      email: user.email,
      phone: phone || null,
      student_grade: studentGrade || null,
    })
    if (error) {
      return NextResponse.json({ error: 'Could not save profile' }, { status: 500 })
    }
  }

  return NextResponse.json({ success: true })
}
