import { stripe } from '@/lib/stripe'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { getSubscriptionPeriod } from '@/lib/stripe-subscription'
import type { AccountType } from '@/lib/account-type'
import { isMissingStripeCustomerError } from '@/lib/stripe-customer-error'
import {
  linkStripeCustomerByEmail,
  recoverMissingStripeCustomer,
} from '@/lib/stripe-customer-server'
import { flushReports, reportError } from '@/lib/report-error'

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
  accountType: AccountType | null
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
    .select('id, stripe_customer_id, email, account_type')
    .eq('profile_id', userId)
    .maybeSingle()
    .then((r) => r.data)

  if (!customer) {
    customer = await supabaseAdmin
      .from('customers')
      .select('id, stripe_customer_id, email, account_type')
      .eq('email', userEmail ?? '')
      .maybeSingle()
      .then((r) => r.data)
  }

  if (!customer) return null

  let stripeCustomerId = customer.stripe_customer_id
  if (!stripeCustomerId && customer.email) {
    try {
      stripeCustomerId = await linkStripeCustomerByEmail(customer)
    } catch (error) {
      reportError('billing:customer-email-link', error, { customerId: customer.id })
      await flushReports()
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

  const syncMembershipFromStripe = async (stripeId: string) => {
    const subs = await stripe.subscriptions.list({
      customer: stripeId,
      status: 'all',
      limit: 10,
    })
    const sub = subs.data.find((s) => s.status === 'active' || s.status === 'trialing') ?? subs.data[0]
    if (!sub || (sub.status !== 'active' && sub.status !== 'trialing')) return null

    const existing = await supabaseAdmin
      .from('memberships')
      .select('tier')
      .eq('stripe_subscription_id', sub.id)
      .maybeSingle()
      .then((r) => r.data)
    if (existing) return existing

    const priceId = sub.items?.data?.[0]?.price?.id
    const pricingId = sub.metadata?.pricing_id
    let pricing = null
    if (pricingId) {
      pricing = await supabaseAdmin
        .from('pricing')
        .select('name, included_hours')
        .eq('id', pricingId)
        .eq('type', 'membership')
        .maybeSingle()
        .then((r) => r.data)
    }
    if (!pricing && priceId) {
      pricing = await supabaseAdmin
        .from('pricing')
        .select('name, included_hours')
        .eq('type', 'membership')
        .or(`stripe_price_id.eq.${priceId},stripe_online_price_id.eq.${priceId}`)
        .maybeSingle()
        .then((r) => r.data)
    }
    const tier = pricing?.name?.replace(/\s*Membership$/i, '')?.toLowerCase() ?? 'starter'
    const includedHours = pricing?.included_hours ?? 2
    const period = getSubscriptionPeriod(sub)
    await supabaseAdmin.from('memberships').insert({
      customer_id: customer.id,
      tier,
      stripe_subscription_id: sub.id,
      status: 'active',
      included_hours: includedHours,
      used_hours: 0,
      rollover_hours: 0,
      current_period_start: period.currentPeriodStart,
      current_period_end: period.currentPeriodEnd,
    })
    return { tier }
  }

  if (!membership && stripeCustomerId) {
    try {
      membership = await syncMembershipFromStripe(stripeCustomerId)
    } catch (error) {
      if (isMissingStripeCustomerError(error)) {
        try {
          stripeCustomerId = await recoverMissingStripeCustomer(
            { ...customer, stripe_customer_id: stripeCustomerId },
            stripeCustomerId
          )
          if (stripeCustomerId) {
            membership = await syncMembershipFromStripe(stripeCustomerId)
          }
        } catch (recoveryError) {
          reportError('billing:customer-recovery', recoveryError, { customerId: customer.id })
          await flushReports()
        }
      } else {
        reportError('billing:subscription-sync', error, { customerId: customer.id })
        await flushReports()
      }
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
    accountType: customer.account_type as AccountType | null,
    membershipTier,
    membership: fullMembership,
    hasStripeCustomer: Boolean(stripeCustomerId),
  }
}
