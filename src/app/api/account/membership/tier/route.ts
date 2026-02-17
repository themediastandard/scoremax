import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getCustomerMembership } from '@/lib/customer-membership'

export const dynamic = 'force-dynamic'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const result = await getCustomerMembership(user.id, user.email ?? null)
  return NextResponse.json({
    membershipTier: result?.membershipTier ?? null,
  })
}
