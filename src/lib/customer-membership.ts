import { stripe } from '@/lib/stripe'
import { supabaseAdmin } from '@/lib/supabase/admin'

export interface MembershipRecord {
  id: string
  tier: string
  status: string
  included_hours: number
  used_hours: number
  rollover_hours: number
  current_period_start: string | null
  current_period_end: string | null
  stripe_subscription_id: string | null
}

export interface CustomerWithMembership {
  customerId: string
  membershipTier: string | null
  membership: MembershipRecord | null
  hasStripeCustomer: boolean
}

/**
 * Resolves customer and active membership for a user, with Stripe sync fallbacks.
 * Use in dashboard layout and subscription page for consistent data.
 */
export async function getCustomerMembership(userId: string, userEmail: string | null): Promise<CustomerWithMembership | null> {
  let customer = await supabaseAdmin
    .from('customers')
    .select('id, stripe_customer_id, email')
    .eq('profile_id', userId)
    .maybeSingle()
    .then((r) => r.data)

  if (!customer) {
    customer = await supabaseAdmin
      .from('customers')
      .select('id, stripe_customer_id, email')
      .eq('email', userEmail ?? '')
      .maybeSingle()
      .then((r) => r.data)
  }

  if (!customer) return null

  if (!customer.stripe_customer_id && customer.email) {
    const stripeCustomers = await stripe.customers.list({ email: customer.email, limit: 1 })
    const stripeCustomer = stripeCustomers.data[0]
    if (stripeCustomer) {
      await supabaseAdmin
        .from('customers')
        .update({ stripe_customer_id: stripeCustomer.id })
        .eq('id', customer.id)
      customer = { ...customer, stripe_customer_id: stripeCustomer.id }
    }
  }

  let membership = await supabaseAdmin
    .from('memberships')
    .select('tier')
    .eq('customer_id', customer.id)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .maybeSingle()
    .then((r) => r.data)

  if (!membership && customer.stripe_customer_id) {
    try {
      const subs = await stripe.subscriptions.list({
        customer: customer.stripe_customer_id,
        status: 'all',
        limit: 10,
      })
      const sub = subs.data.find((s) => s.status === 'active' || s.status === 'trialing') ?? subs.data[0]
      if (sub && (sub.status === 'active' || sub.status === 'trialing')) {
        const priceId = sub.items?.data?.[0]?.price?.id
        const { data: pricing } = await supabaseAdmin
          .from('pricing')
          .select('name, included_hours')
          .eq('stripe_price_id', priceId)
          .eq('type', 'membership')
          .maybeSingle()
      const tier = pricing?.name?.replace(/\s*Membership$/i, '')?.toLowerCase() ?? 'starter'
      const includedHours = pricing?.included_hours ?? 2
        const { error } = await supabaseAdmin.from('memberships').insert({
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
        if (!error) {
          membership = { tier }
        } else {
          const existing = await supabaseAdmin
            .from('memberships')
            .select('tier')
            .eq('stripe_subscription_id', sub.id)
            .maybeSingle()
            .then((r) => r.data)
          if (existing) membership = existing
        }
      }
    } catch {
      // Stripe API error - membership stays null
    }
  }

  const tierMap: Record<string, string> = {
    starter: 'Starter',
    core: 'Core',
    premier: 'Premier',
  }
  const membershipTier = membership
    ? (tierMap[membership.tier?.toLowerCase() ?? ''] ?? membership.tier ?? null)
    : null

  let fullMembership: MembershipRecord | null = null
  if (membership) {
    const { data } = await supabaseAdmin
      .from('memberships')
      .select('*')
      .eq('customer_id', customer.id)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .maybeSingle()
    fullMembership = data as MembershipRecord | null
  }

  return {
    customerId: customer.id,
    membershipTier,
    membership: fullMembership,
    hasStripeCustomer: !!customer.stripe_customer_id,
  }
}
