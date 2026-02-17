'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CreditCard, Calendar, Clock, AlertCircle, Loader2 } from 'lucide-react'
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

interface SubscriptionViewProps {
  membership: Membership | null
  hasStripeCustomer: boolean
}

function formatTierName(tier: string): string {
  const map: Record<string, string> = {
    starter: 'Starter Membership',
    core: 'Core Membership',
    premier: 'Premier Membership',
  }
  return map[tier?.toLowerCase()] ?? tier ?? 'Membership'
}

export function SubscriptionView({ membership, hasStripeCustomer }: SubscriptionViewProps) {
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

  if (!membership && !hasStripeCustomer) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <CreditCard className="h-12 w-12 text-gray-300 mb-4" />
          <p className="text-gray-500 font-medium">No active subscription</p>
          <p className="text-sm text-gray-400 mt-1">
            Subscribe to a membership plan to unlock tutoring credits and manage your subscription here.
          </p>
          <Button asChild className="mt-6 bg-[#c79d3c] hover:bg-[#b58b2a]">
            <a href="/book">Browse Plans</a>
          </Button>
        </CardContent>
      </Card>
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
    <div className="space-y-6">
      {membership ? (
        <Card className="border-gray-100 shadow-sm">
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <CardTitle className="text-xl flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-[#c79d3c]" />
                {formatTierName(membership.tier)}
              </CardTitle>
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
    </div>
  )
}
