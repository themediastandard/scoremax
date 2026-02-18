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

  const { data: customer } = await supabaseAdmin
    .from('customers')
    .select('id')
    .eq('profile_id', user.id)
    .maybeSingle()

  if (customer) {
    await supabaseAdmin
      .from('customers')
      .update({
        full_name: fullName,
        phone: phone || null,
        student_grade: studentGrade || null,
      })
      .eq('id', customer.id)
  }

  return NextResponse.json({ success: true })
}
