import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { requireAdmin } from '@/lib/auth'

export async function GET() {
  const authError = await requireAdmin()
  if (authError) return authError

  const { data, error } = await supabaseAdmin
    .from('admin_settings')
    .select('value')
    .eq('key', 'notification_emails')
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ emails: data.value })
}

export async function PATCH(req: NextRequest) {
  const authError = await requireAdmin()
  if (authError) return authError

  const { emails } = await req.json()
  
  if (!emails) {
    return NextResponse.json({ error: 'Emails are required' }, { status: 400 })
  }

  const { data, error } = await supabaseAdmin
    .from('admin_settings')
    .update({ value: emails })
    .eq('key', 'notification_emails')
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ emails: data.value })
}