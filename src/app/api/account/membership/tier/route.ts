import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { getCustomerMembership } from '@/lib/customer-membership'

export const dynamic = 'force-dynamic'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const result = await getCustomerMembership(user.id, user.email ?? null)
  const m = result?.membership
  const membershipCredits = m
    ? (m.included_hours + m.rollover_hours) - m.used_hours
    : 0

  let packageCredits = 0
  if (result?.customerId) {
    const { data: packages } = await supabaseAdmin
      .from('packages')
      .select('remaining_hours')
      .eq('customer_id', result.customerId)
      .gt('remaining_hours', 0)
    packageCredits = (packages ?? []).reduce((sum: number, p: any) => sum + p.remaining_hours, 0)
  }

  const totalCredits = membershipCredits + packageCredits

  return NextResponse.json({
    membershipTier: result?.membershipTier ?? null,
    credits: totalCredits,
  })
}
