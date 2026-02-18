import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { SubscriptionView } from '@/components/dashboard/SubscriptionView'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { stripe } from '@/lib/stripe'

export default async function SubscriptionPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'customer') {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-serif font-bold text-[#1e293b]">Subscription</h1>
        <p className="text-gray-500">This page is for customers only.</p>
      </div>
    )
  }

  let customer = await supabaseAdmin
    .from('customers')
    .select('id, stripe_customer_id, email')
    .eq('profile_id', user.id)
    .maybeSingle()
    .then((r) => r.data)

  if (!customer && user.email) {
    customer = await supabaseAdmin
      .from('customers')
      .select('id, stripe_customer_id, email')
      .eq('email', user.email)
      .maybeSingle()
      .then((r) => r.data)
  }

  if (!customer?.stripe_customer_id && customer?.email) {
    const stripeCustomers = await stripe.customers.list({ email: customer.email, limit: 1 })
    const sc = stripeCustomers.data[0]
    if (sc) {
      await supabaseAdmin.from('customers').update({ stripe_customer_id: sc.id }).eq('id', customer.id)
      customer = { ...customer, stripe_customer_id: sc.id }
    }
  }

  let membership = await supabaseAdmin
    .from('memberships')
    .select('*')
    .eq('customer_id', customer?.id)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .maybeSingle()
    .then((r) => r.data)

  if (!membership && customer?.stripe_customer_id) {
    const subs = await stripe.subscriptions.list({
      customer: customer.stripe_customer_id,
      status: 'all',
      limit: 10,
    })
    const sub = subs.data.find((s) => s.status === 'active' || s.status === 'trialing') ?? subs.data[0]
    if (sub && (sub.status === 'active' || sub.status === 'trialing')) {
      const { data: existing } = await supabaseAdmin
        .from('memberships')
        .select('*')
        .eq('stripe_subscription_id', sub.id)
        .maybeSingle()
      if (existing) {
        membership = existing
      } else {
        const priceId = sub.items?.data?.[0]?.price?.id
        const { data: pricing } = await supabaseAdmin
          .from('pricing')
          .select('name, included_hours')
          .eq('stripe_price_id', priceId)
          .eq('type', 'membership')
          .maybeSingle()
        const tier = pricing?.name?.replace(/\s*Membership$/i, '')?.toLowerCase() ?? 'starter'
        const includedHours = pricing?.included_hours ?? 2
        const { data: inserted } = await supabaseAdmin
          .from('memberships')
          .insert({
            customer_id: customer.id,
            tier,
            stripe_subscription_id: sub.id,
            status: 'active',
            included_hours: includedHours,
            used_hours: 0,
            rollover_hours: 0,
            current_period_start: new Date(sub.current_period_start * 1000).toISOString(),
            current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
          })
          .select()
          .single()
        membership = inserted
      }
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-serif font-bold text-[#1e293b]">My Subscription</h1>
        <p className="mt-1 text-gray-500">View and manage your membership</p>
      </div>
      <SubscriptionView
        membership={membership ?? null}
        hasStripeCustomer={!!customer?.stripe_customer_id}
      />
    </div>
  )
}
