import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { requireAdmin } from '@/lib/auth'

export async function GET() {
  const authError = await requireAdmin()
  if (authError) return authError

  // In-person SAT courses are no longer offered (checkout rejects the plan
  // type outright), so the legacy row stays out of the admin list.
  const { data, error } = await supabaseAdmin
    .from('pricing')
    .select('*')
    .neq('type', 'sat-course-inperson')
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
  const { id, price_cents, online_price_cents, name, included_hours, is_active } = body

  if (!id) {
    return NextResponse.json({ error: 'id is required' }, { status: 400 })
  }

  const { data: existing } = await supabaseAdmin
    .from('pricing')
    .select('type, price_cents, online_price_cents, stripe_online_price_id')
    .eq('id', id)
    .single()
  if (existing) {
    if (existing.type === 'membership' && existing.stripe_online_price_id) {
      return NextResponse.json({ error: 'Recurring membership prices must be changed in Stripe first' }, { status: 400 })
    }
    if (existing.type === 'sat-course-inperson') {
      return NextResponse.json({ error: 'In-person courses are no longer offered' }, { status: 400 })
    }
  }

  const updates: Record<string, unknown> = {}
  if (typeof price_cents === 'number' && price_cents >= 0) updates.price_cents = price_cents
  if (typeof online_price_cents === 'number' && online_price_cents >= 0) updates.online_price_cents = online_price_cents
  // Checkout matches course rows by NAME (sat/act keywords), so a course
  // rename can silently break purchasing. Prices and hours are fair game.
  if (typeof name === 'string' && existing?.type !== 'course') updates.name = name
  if (included_hours !== undefined) updates.included_hours = included_hours ?? null
  if (typeof is_active === 'boolean') updates.is_active = is_active

  const effectiveBasePrice = typeof price_cents === 'number' ? price_cents : existing?.price_cents
  const effectiveOnlinePrice = typeof online_price_cents === 'number' ? online_price_cents : existing?.online_price_cents
  if (
    typeof effectiveBasePrice === 'number' &&
    typeof effectiveOnlinePrice === 'number' &&
    effectiveOnlinePrice < effectiveBasePrice
  ) {
    return NextResponse.json({ error: 'Online price cannot be lower than the Zelle/base price' }, { status: 400 })
  }

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
