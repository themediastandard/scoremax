import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: customer } = await supabaseAdmin
    .from('customers')
    .select('id, stripe_customer_id')
    .eq('profile_id', user.id)
    .single()

  if (!customer?.stripe_customer_id) {
    return NextResponse.json(
      { error: 'No billing account found. Subscribe to a plan to manage your subscription.' },
      { status: 400 }
    )
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: customer.stripe_customer_id,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/subscription`,
  })

  return NextResponse.json({ url: session.url })
}
