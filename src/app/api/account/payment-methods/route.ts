import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

const unavailable = (signedIn: boolean) => NextResponse.json({
  signedIn,
  approvals: { step_up: false, zelle: false },
})

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return unavailable(false)

  const { data: customer, error: customerError } = await supabaseAdmin
    .from('customers')
    .select('id')
    .eq('profile_id', user.id)
    .maybeSingle()

  if (customerError) {
    return NextResponse.json({ error: 'Could not check payment approvals' }, { status: 500 })
  }
  if (!customer) return unavailable(true)

  const { data: approvals, error } = await supabaseAdmin
    .from('customer_payment_approvals')
    .select('payment_method, approved_at, revoked_at')
    .eq('customer_id', customer.id)
    .in('payment_method', ['step_up', 'zelle'])

  if (error) {
    return NextResponse.json({ error: 'Could not check payment approvals' }, { status: 500 })
  }

  const active = new Set(
    (approvals ?? [])
      .filter((row) => row.approved_at && !row.revoked_at)
      .map((row) => row.payment_method)
  )

  return NextResponse.json({
    signedIn: true,
    approvals: {
      step_up: active.has('step_up'),
      zelle: active.has('zelle'),
    },
  })
}
