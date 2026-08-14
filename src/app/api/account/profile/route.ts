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
    .select('full_name, role')
    .eq('id', user.id)
    .maybeSingle()

  const { data: customer } = profile?.role === 'customer'
    ? await supabaseAdmin
        .from('customers')
        .select('full_name, email, phone, student_grade')
        .eq('profile_id', user.id)
        .maybeSingle()
    : { data: null }

  const { data: tutor } = profile?.role === 'tutor'
    ? await supabaseAdmin
        .from('tutors')
        .select('full_name, email, phone')
        .eq('profile_id', user.id)
        .maybeSingle()
    : { data: null }

  return NextResponse.json({
    fullName: customer?.full_name || tutor?.full_name || profile?.full_name || '',
    email: customer?.email || tutor?.email || user.email || '',
    phone: customer?.phone || tutor?.phone || '',
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

  const { data: profile, error: profileError } = await supabaseAdmin
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle()

  if (profileError || !profile) {
    return NextResponse.json({ error: 'Could not load profile' }, { status: 500 })
  }

  // Partial update: a field the caller omits is left alone, a field sent as ''
  // is cleared. The booking form syncs only the fields it collects, so treating
  // "absent" as "clear this" would let a booking wipe a saved setting.
  const customerUpdates: Record<string, string | null> = {}
  if (typeof fullName === 'string' && fullName.trim()) {
    customerUpdates.full_name = fullName.trim()
  }
  if (typeof phone === 'string') customerUpdates.phone = phone.trim() || null
  if (typeof studentGrade === 'string') customerUpdates.student_grade = studentGrade.trim() || null

  if (customerUpdates.full_name) {
    await supabaseAdmin
      .from('profiles')
      .update({ full_name: customerUpdates.full_name })
      .eq('id', user.id)
  }

  // Tutor and admin identities are not customer accounts. Tutor profile edits
  // belong on the tutor row; admins have no customer-specific phone/grade
  // record. Returning before the customer adoption/create path prevents a
  // settings save from silently turning either role into a customer.
  if (profile.role === 'tutor') {
    const tutorUpdates: Record<string, string | null> = {}
    if (customerUpdates.full_name) tutorUpdates.full_name = customerUpdates.full_name
    if (typeof phone === 'string') tutorUpdates.phone = customerUpdates.phone ?? null

    if (Object.keys(tutorUpdates).length > 0) {
      const { error: tutorError } = await supabaseAdmin
        .from('tutors')
        .update(tutorUpdates)
        .eq('profile_id', user.id)
      if (tutorError) {
        return NextResponse.json({ error: 'Could not save tutor profile' }, { status: 500 })
      }
    }
    return NextResponse.json({ success: true })
  }

  if (profile.role !== 'customer') {
    return NextResponse.json({ success: true })
  }

  // The signup trigger is supposed to create the customers row, but accounts
  // exist without one — updating only-if-present silently discarded phone and
  // grade while still reporting success. Adopt an unlinked row matching the
  // user's email, or create the row outright.
  let { data: customer } = await supabaseAdmin
    .from('customers')
    .select('id, email, account_type')
    .eq('profile_id', user.id)
    .maybeSingle()

  if (!customer && user.email) {
    const { data: byEmail } = await supabaseAdmin
      .from('customers')
      .select('id, email, account_type')
      .eq('email', user.email)
      .is('profile_id', null)
      .maybeSingle()
    if (byEmail) {
      await supabaseAdmin.from('customers').update({ profile_id: user.id }).eq('id', byEmail.id)
      customer = byEmail
    }
  }

  if (customer) {
    if (Object.keys(customerUpdates).length > 0) {
      const { error } = await supabaseAdmin
        .from('customers')
        .update(customerUpdates)
        .eq('id', customer.id)
      if (error) {
        return NextResponse.json({ error: 'Could not save profile' }, { status: 500 })
      }

      // A student account's managed profile represents that same person. Keep
      // its operational phone in sync with the account phone without touching
      // parent-owned child records.
      if (customer.account_type === 'student' && typeof phone === 'string') {
        const { error: studentPhoneError } = await supabaseAdmin
          .from('students')
          .update({ phone: customerUpdates.phone ?? null })
          .eq('customer_id', customer.id)
          .ilike('email', customer.email)
        if (studentPhoneError) {
          return NextResponse.json({ error: 'Could not save student phone' }, { status: 500 })
        }
      }
    }
  } else {
    const { error } = await supabaseAdmin.from('customers').insert({
      profile_id: user.id,
      email: user.email,
      full_name: customerUpdates.full_name ?? 'New User',
      phone: customerUpdates.phone ?? null,
      student_grade: customerUpdates.student_grade ?? null,
    })
    if (error) {
      return NextResponse.json({ error: 'Could not save profile' }, { status: 500 })
    }
  }

  return NextResponse.json({ success: true })
}
