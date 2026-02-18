'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CreditCard, Calendar, Clock, AlertCircle, Loader2, Check, ArrowUp, ArrowDown } from 'lucide-react'
import { useState } from 'react'

interface Membership {
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

interface Plan {
  id: string
  name: string
  tier: string
  price_cents: number
  included_hours: number
  stripe_price_id: string
}

interface SubscriptionViewProps {
  membership: Membership | null
  hasStripeCustomer: boolean
  plans: Plan[]
}

function formatTierName(tier: string): string {
  const map: Record<string, string> = {
    starter: 'Starter Membership',
    core: 'Core Membership',
    premier: 'Premier Membership',
  }
  return map[tier?.toLowerCase()] ?? tier ?? 'Membership'
}

const TIER_ORDER: Record<string, number> = { starter: 0, core: 1, premier: 2 }

const TIER_FEATURES: Record<string, string[]> = {
  starter: [
    'Priority scheduling',
    'Rollover (1 hr/mo)',
    'Cancel anytime',
  ],
  core: [
    'Priority scheduling',
    'Video library access',
    'Rollover (1 hr/mo)',
    'Cancel anytime',
  ],
  premier: [
    'Priority scheduling',
    'Video library access',
    'Weekend access',
    'Rollover (1 hr/mo)',
    'Cancel anytime',
  ],
}

export function SubscriptionView({ membership, hasStripeCustomer, plans }: SubscriptionViewProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleManageSubscription = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/stripe/portal', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Could not open subscription management')
        return
      }
      if (data.url) window.location.href = data.url
    } catch {
      setError('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const currentTierRank = membership ? (TIER_ORDER[membership.tier?.toLowerCase()] ?? -1) : -1

  if (!membership && !hasStripeCustomer) {
    return (
      <div className="space-y-8">
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <CreditCard className="h-12 w-12 text-gray-300 mb-4" />
            <p className="text-gray-500 font-medium">No active subscription</p>
            <p className="text-sm text-gray-400 mt-1">
              Subscribe to a membership plan to unlock tutoring credits.
            </p>
          </CardContent>
        </Card>

        {plans.length > 0 && (
          <PlansGrid
            plans={plans}
            currentTier={null}
            currentTierRank={-1}
            onSelect={handleManageSubscription}
            loading={loading}
            isNewSubscriber
          />
        )}

        {error && (
          <div className="flex items-center gap-2 text-sm text-red-600">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}
      </div>
    )
  }

  const remainingHours = (membership?.included_hours ?? 0) + (membership?.rollover_hours ?? 0) - (membership?.used_hours ?? 0)
  const renewsAt = membership?.current_period_end
    ? new Date(membership.current_period_end).toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : null

  return (
    <div className="space-y-8">
      {membership ? (
        <Card
          className={
            membership.tier?.toLowerCase() === 'core'
              ? 'border-2 border-[#b08a30] shadow-md bg-gradient-to-br from-amber-50/50 to-white'
              : 'border-gray-100 shadow-sm'
          }
        >
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <CardTitle className="text-xl flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-[#b08a30]" />
                  {formatTierName(membership.tier)}
                </CardTitle>
                <p className="mt-1 text-lg font-semibold text-[#b08a30]">
                  ${(plans.find(p => p.tier === membership.tier)?.price_cents ?? 0) / 100}/mo
                </p>
              </div>
              <Badge
                variant="secondary"
                className={
                  membership.status === 'active'
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'bg-amber-50 text-amber-700'
                }
              >
                {membership.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="flex gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#517cad]/10">
                  <Clock className="h-5 w-5 text-[#517cad]" />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Credits remaining
                  </p>
                  <p className="text-lg font-semibold text-[#1e293b]">
                    {remainingHours} of {membership.included_hours} hours
                    {membership.rollover_hours ? ` (+${membership.rollover_hours} rollover)` : ''}
                  </p>
                </div>
              </div>
              {renewsAt && (
                <div className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50">
                    <Calendar className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Renews on
                    </p>
                    <p className="text-lg font-medium text-[#1e293b]">{renewsAt}</p>
                  </div>
                </div>
              )}
            </div>

            {(membership.stripe_subscription_id || hasStripeCustomer) && (
              <div className="pt-4 border-t border-gray-100">
                <p className="text-sm text-gray-500 mb-3">
                  Update payment method, cancel your subscription, or view billing history.
                </p>
                {error && (
                  <div className="flex items-center gap-2 text-sm text-red-600 mb-3">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    {error}
                  </div>
                )}
                <Button
                  onClick={handleManageSubscription}
                  disabled={loading}
                  variant="outline"
                  className="border-[#517cad]/40 text-[#517cad] hover:bg-[#517cad]/5"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    'Manage subscription'
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <CreditCard className="h-12 w-12 text-gray-300 mb-4" />
            <p className="text-gray-500 font-medium">Manage your subscription</p>
            <p className="text-sm text-gray-400 mt-1 mb-4">
              Update payment, cancel, or view billing history in the Stripe portal.
            </p>
            {error && (
              <div className="flex items-center gap-2 text-sm text-red-600 mb-3">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}
            <Button
              onClick={handleManageSubscription}
              disabled={loading}
              variant="outline"
              className="border-[#517cad]/40 text-[#517cad] hover:bg-[#517cad]/5"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Manage subscription'}
            </Button>
          </CardContent>
        </Card>
      )}

      {plans.length > 0 && (
        <PlansGrid
          plans={plans}
          currentTier={membership?.tier?.toLowerCase() ?? null}
          currentTierRank={currentTierRank}
          onSelect={handleManageSubscription}
          loading={loading}
        />
      )}
    </div>
  )
}

function PlansGrid({
  plans,
  currentTier,
  currentTierRank,
  onSelect,
  loading,
  isNewSubscriber,
}: {
  plans: Plan[]
  currentTier: string | null
  currentTierRank: number
  onSelect: () => void
  loading: boolean
  isNewSubscriber?: boolean
}) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-serif font-bold text-[#1e293b]">
          {currentTier ? 'Switch Plans' : 'Choose a Plan'}
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          {currentTier
            ? 'Changes take effect at the start of your next billing cycle.'
            : 'Pick the membership that fits your needs.'}
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const tierKey = plan.tier?.toLowerCase()
          const isCurrent = tierKey === currentTier
          const planRank = TIER_ORDER[tierKey] ?? -1
          const isUpgrade = currentTier !== null && planRank > currentTierRank
          const isDowngrade = currentTier !== null && planRank < currentTierRank
          const features = TIER_FEATURES[tierKey] ?? []
          const isCore = tierKey === 'core'

          return (
            <Card
              key={plan.id}
              className={`flex flex-col relative ${
                isCurrent
                  ? 'border-2 border-emerald-500 shadow-md bg-emerald-50/30'
                  : isCore && !currentTier
                    ? 'border-2 border-[#b08a30] shadow-lg'
                    : 'border-gray-200 hover:border-gray-300 transition-colors'
              }`}
            >
              {isCurrent && (
                <div className="bg-emerald-500 text-white text-center text-xs py-1.5 uppercase font-bold tracking-wider">
                  Current Plan
                </div>
              )}
              {isCore && !currentTier && (
                <div className="bg-[#b08a30] text-white text-center text-xs py-1.5 uppercase font-bold tracking-wider">
                  Most Popular
                </div>
              )}
              <CardHeader>
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <div className="mt-2">
                  <span className="text-3xl font-bold text-[#1e293b]">${plan.price_cents / 100}</span>
                  <span className="text-gray-500 text-sm">/mo</span>
                </div>
                <p className="text-sm text-[#517cad] font-medium">{plan.included_hours} hours included</p>
                <p className="text-xs text-gray-400">${Math.round(plan.price_cents / plan.included_hours / 100)}/hr effective rate</p>
              </CardHeader>
              <CardContent className="flex-1">
                <ul className="space-y-2 text-sm">
                  {features.map((f) => (
                    <li key={f} className="flex items-start">
                      <Check className="w-4 h-4 mr-2 text-emerald-500 mt-0.5 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
              </CardContent>
              <div className="px-6 pb-6">
                {isCurrent ? (
                  <Button disabled variant="outline" className="w-full text-emerald-700 border-emerald-300">
                    Your current plan
                  </Button>
                ) : isNewSubscriber ? (
                  <Button
                    className={`w-full ${isCore ? 'bg-[#b08a30] hover:bg-[#b58b2a]' : 'bg-[#1e293b] hover:bg-[#334155]'}`}
                    asChild
                  >
                    <a href="/book">Get Started</a>
                  </Button>
                ) : (
                  <Button
                    className={`w-full gap-1.5 ${
                      isUpgrade
                        ? 'bg-[#b08a30] hover:bg-[#b58b2a]'
                        : 'bg-[#1e293b] hover:bg-[#334155]'
                    }`}
                    onClick={onSelect}
                    disabled={loading}
                  >
                    {loading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : isUpgrade ? (
                      <>
                        <ArrowUp className="h-4 w-4" />
                        Upgrade
                      </>
                    ) : isDowngrade ? (
                      <>
                        <ArrowDown className="h-4 w-4" />
                        Downgrade
                      </>
                    ) : (
                      'Switch Plan'
                    )}
                  </Button>
                )}
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
