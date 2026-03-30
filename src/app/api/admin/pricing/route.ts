import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { requireAdmin } from '@/lib/auth'

export async function GET() {
  const authError = await requireAdmin()
  if (authError) return authError

  const { data, error } = await supabaseAdmin
    .from('pricing')
    .select('*')
    .order('type', { ascending: true })
    .order('price_cents', { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json(data)
}

export async function PATCH(req: NextRequest) {
  const authError = await requireAdmin()
  if (authError) return authError

  const body = await req.json()
  const { id, price_cents, name, included_hours, is_active } = body

  if (!id) {
    return NextResponse.json({ error: 'id is required' }, { status: 400 })
  }

  const { data: existing } = await supabaseAdmin.from('pricing').select('type, stripe_price_id').eq('id', id).single()
  if (existing) {
    if (existing.type === 'membership' && existing.stripe_price_id) {
      return NextResponse.json({ error: 'Membership pricing is handled by Stripe' }, { status: 400 })
    }
    if (existing.type === 'course') {
      return NextResponse.json({ error: 'Course pricing is managed in code' }, { status: 400 })
    }
  }

  const updates: Record<string, unknown> = {}
  if (typeof price_cents === 'number' && price_cents >= 0) updates.price_cents = price_cents
  if (typeof name === 'string') updates.name = name
  if (included_hours !== undefined) updates.included_hours = included_hours ?? null
  if (typeof is_active === 'boolean') updates.is_active = is_active

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
  }

  const { data, error } = await supabaseAdmin
    .from('pricing')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json(data)
}
