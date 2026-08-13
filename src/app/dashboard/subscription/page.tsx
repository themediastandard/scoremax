import { redirect } from 'next/navigation'
import { SubscriptionView } from '@/components/dashboard/SubscriptionView'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { getAuthUser, getProfile } from '@/lib/auth'
import { getCustomerMembership } from '@/lib/customer-membership'

export default async function SubscriptionPage() {
  const user = await getAuthUser()
  if (!user) redirect('/login')

  const profile = await getProfile(user.id)
  if (profile?.role !== 'customer') {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#1e293b]">Subscription</h1>
        <p className="text-gray-500">This page is for customers only.</p>
      </div>
    )
  }

  const customerMembership = await getCustomerMembership(user.id, user.email ?? null)
  const membership = customerMembership?.membership ?? null

  const { data: plans } = await supabaseAdmin
    .from('pricing')
    .select('id, name, tier, price_cents, online_price_cents, included_hours, stripe_online_price_id')
    .eq('type', 'membership')
    .order('price_cents', { ascending: true })

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#1e293b]">My Subscription</h1>
        <p className="mt-1 text-gray-500">View and manage your membership</p>
      </div>
      <SubscriptionView
        membership={membership}
        hasStripeCustomer={customerMembership?.hasStripeCustomer ?? false}
        plans={plans ?? []}
      />
    </div>
  )
}
