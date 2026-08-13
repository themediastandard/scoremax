import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { isMissingStripeCustomerError } from '@/lib/stripe-customer-error'
import {
  linkStripeCustomerByEmail,
  recoverMissingStripeCustomer,
} from '@/lib/stripe-customer-server'

export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: customer } = await supabaseAdmin
    .from('customers')
    .select('id, stripe_customer_id, email')
    .eq('profile_id', user.id)
    .single()

  if (!customer) {
    return NextResponse.json(
      { error: 'No billing account found. Subscribe to a plan to manage your subscription.' },
      { status: 400 }
    )
  }

  let stripeCustomerId = customer.stripe_customer_id
  if (!stripeCustomerId) {
    stripeCustomerId = await linkStripeCustomerByEmail(customer)
  }
  if (!stripeCustomerId) {
    return NextResponse.json(
      { error: 'No billing account found. Subscribe to a plan to manage your subscription.' },
      { status: 400 }
    )
  }

  const createPortalSession = (customerId: string) =>
    stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/subscription`,
    })

  let session
  try {
    session = await createPortalSession(stripeCustomerId)
  } catch (error) {
    if (!isMissingStripeCustomerError(error)) throw error

    stripeCustomerId = await recoverMissingStripeCustomer(
      { ...customer, stripe_customer_id: stripeCustomerId },
      stripeCustomerId
    )
    if (!stripeCustomerId) {
      return NextResponse.json(
        { error: 'No billing account found. Subscribe to a plan to manage your subscription.' },
        { status: 400 }
      )
    }
    session = await createPortalSession(stripeCustomerId)
  }

  return NextResponse.json({ url: session.url })
}
