"use client"

import { useEffect, useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Check, Loader2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import type { SubjectCatalogEntry } from '@/lib/subject-catalog'
import { PACKAGE_VALIDITY_MONTHS } from '@/lib/package-expiry'
import { canPurchaseMembershipForSubjects, getSatActSelection } from '@/lib/booking-plan-rules'
import { getOnlinePriceCents } from '@/lib/online-price'
import {
  PaymentMethodSelection,
  type PaymentMethod,
} from '@/components/booking/PaymentMethodSelection'
import type { OfflinePaymentMethod } from '@/lib/payment-method'
import type { StudentCreditSummaryResponse } from '@/lib/student-contract'

interface PlanSelectionProps {
  subjects: string[]
  memberStatus: StudentCreditSummaryResponse | null
  selectedStudentName: string
  creditSummaryLoading?: boolean
  creditSummaryError?: string | null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onSelect: (plan: any) => void
  loading?: boolean
  authoritativeBlockedMethod?: OfflinePaymentMethod | null
  onAuthoritativeBlockDismiss?: () => void
}

export function PlanSelection({
  subjects,
  memberStatus,
  selectedStudentName,
  creditSummaryLoading = false,
  creditSummaryError = null,
  onSelect,
  loading: processing,
  authoritativeBlockedMethod = null,
  onAuthoritativeBlockDismiss,
}: PlanSelectionProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [pricing, setPricing] = useState<any[]>([])
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [subjectMap, setSubjectMap] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState(true)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null)

  useEffect(() => {
    Promise.all([
      fetch('/api/pricing').then(res => res.json()),
      fetch('/api/subjects').then(res => res.json())
    ]).then(([pricingData, subjectsData]) => {
      setPricing(pricingData)

      const flat: Record<string, SubjectCatalogEntry> = {}
      Object.values(subjectsData as Record<string, SubjectCatalogEntry[]>).forEach((arr) => {
        arr.forEach((s) => {
          if (s.children?.length) {
            s.children.forEach((child) => flat[child.id] = child)
          } else {
            flat[s.id] = s
          }
        })
      })
      setSubjectMap(flat)
      setLoading(false)
    })
  }, [])

  // The POST route is authoritative. If a session expires or an approval is
  // revoked after the selector's initial check, reset the choice while the same
  // accessible approval dialog explains what happened.
  useEffect(() => {
    if (authoritativeBlockedMethod) setPaymentMethod(null)
  }, [authoritativeBlockedMethod])

  const getSingleBaseRateCents = () => {
    if (subjects.length === 0) return 0
    let maxRate = 0
    subjects.forEach(id => {
      const s = subjectMap[id]
      if (s && s.hourly_rate_cents > maxRate) maxRate = s.hourly_rate_cents
    })
    return maxRate
  }

  if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>

  const { isSAT, isACT } = getSatActSelection(subjects, subjectMap)
  const isCreditCard = paymentMethod === 'credit_card'
  const showMemberships = isCreditCard && canPurchaseMembershipForSubjects(subjects, subjectMap)
  const singleBaseRateCents = getSingleBaseRateCents()
  const singleRateCents = isCreditCard ? getOnlinePriceCents(singleBaseRateCents) : singleBaseRateCents
  const singleRate = singleRateCents / 100
  const onlinePriceFor = (row: { price_cents: number; online_price_cents?: number | null }) =>
    getOnlinePriceCents(row.price_cents, row.online_price_cents)
  const selectedPriceFor = (row: { price_cents: number; online_price_cents?: number | null }) =>
    isCreditCard ? onlinePriceFor(row) : row.price_cents

  // Course prices come from the same `pricing` rows checkout charges from,
  // matched by the same sat/act name keywords — the cards can never quote a
  // number checkout disagrees with. Fallbacks only cover a failed fetch.
  const courseRows = pricing.filter(p => p.type === 'course')
  const findCourse = (courseType: string) =>
    courseRows.find(c => {
      const n = String(c.name ?? '').toLowerCase()
      const hasSat = n.includes('sat')
      const hasAct = n.includes('act')
      if (courseType === 'sat-act-combined') return hasSat && hasAct
      if (courseType === 'act') return hasAct && !hasSat
      return hasSat && !hasAct
    })
  const combinedCourse = findCourse('sat-act-combined') ?? { id: null, price_cents: 325000, online_price_cents: 335000, included_hours: 13 }
  const satCourse = findCourse('sat') ?? { id: null, price_cents: 250000, online_price_cents: 257500, included_hours: 10 }
  const actCourse = findCourse('act') ?? { id: null, price_cents: 250000, online_price_cents: 257500, included_hours: 10 }
  const dollars = (cents: number) => `$${(cents / 100).toLocaleString()}`

  const packageList = pricing.filter(p => p.type === 'package').map(pkg => {
    const selectedPriceCents = selectedPriceFor(pkg)
    const packageHourlyCents = selectedPriceCents / pkg.included_hours
    const savingsPercent = singleRateCents > 0 ? Math.round(((singleRateCents - packageHourlyCents) / singleRateCents) * 100) : null
    return { pkg, selectedPriceCents, savingsPercent }
  })

  if (creditSummaryLoading) {
    return (
      <div className="flex min-h-32 items-center justify-center gap-2 text-sm text-gray-500" role="status">
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        Checking credits for {selectedStudentName}…
      </div>
    )
  }

  // Existing credits remain ahead of every purchase method, but eligibility is
  // calculated for the explicitly selected child. Account-wide card/Zelle
  // credits can appear here for any sibling; Step Up and courses cannot.
  if ((memberStatus?.eligibleCredits ?? 0) > 0 && !processing) {
    const selectedStudentCredits = memberStatus?.studentCredits.find(
      (entry) => entry.studentId === memberStatus.selectedStudentId
    )?.credits ?? 0
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-serif text-[#1e293b]">How would you like to pay?</h2>
        
        <Card className="border-[#b08a30] bg-amber-50/20">
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              <span>Use Existing Credit</span>
              <Badge className="bg-[#b08a30] hover:bg-[#b58b2a]">Recommended</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg">
              <span className="font-bold">{memberStatus?.eligibleCredits ?? 0} credits</span> are eligible for {selectedStudentName}.
            </p>
            <p className="mt-2 text-sm text-gray-500">Use 1 eligible credit to book this session now.</p>
            <p className="mt-2 text-xs text-gray-500">
              {memberStatus?.familyCredits ?? 0} family-wide
              {selectedStudentCredits > 0 ? ` · ${selectedStudentCredits} assigned to ${selectedStudentName}` : ''}
            </p>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full bg-[#1e293b] hover:bg-[#334155] text-white"
              onClick={() => {
                onSelect({ type: 'credit' })
              }}
              disabled={processing}
            >
              {processing ? <Loader2 className="animate-spin" /> : 'Book with Credit'}
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  const OptionSection = ({ optionNum, title, description, children }: { optionNum: number; title: string; description?: string; children: React.ReactNode }) => (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-black text-sm font-bold text-white aspect-square">
          {optionNum}
        </span>
        <div>
          <h3 className="font-semibold text-lg text-[#1e293b]">{title}</h3>
          {description && <p className="text-sm text-gray-600">{description}</p>}
        </div>
      </div>
      {children}
    </div>
  )

  return (
    <div className="space-y-8">
      {creditSummaryError && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
          {creditSummaryError} Existing credits are hidden until the account can be checked safely.
        </div>
      )}
      {(memberStatus?.totalCredits ?? 0) > 0 && (memberStatus?.eligibleCredits ?? 0) === 0 && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900" role="status">
          <p className="font-semibold">No existing credits are eligible for {selectedStudentName}.</p>
          <p className="mt-1 leading-6 text-amber-800">
            Family-wide card and Zelle credits can be shared. Step Up credits and course sessions stay with the student they were purchased for.
          </p>
        </div>
      )}
      <PaymentMethodSelection
        value={paymentMethod}
        onChange={setPaymentMethod}
        disabled={processing}
        authoritativeBlockedMethod={authoritativeBlockedMethod}
        onAuthoritativeBlockDismiss={onAuthoritativeBlockDismiss}
      />

      {paymentMethod && (
        <>
          <div className="rounded-lg border border-[#b08a30]/30 bg-amber-50/30 px-4 py-3">
            <p className="text-center font-medium text-[#1e293b]">
              Choose <span className="font-bold">one</span> plan below. Pick the option that works best for you.
            </p>
            <p className="mt-1 text-center text-sm text-gray-600">
              {isCreditCard
                ? 'Prices shown are standard online payment prices.'
                : `Prices shown are base prices for ${paymentMethod === 'step_up' ? 'Step Up' : 'Zelle'}.`}
            </p>
          </div>

          {/* Memberships are available only for eligible credit-card purchases. */}
          {showMemberships && (
            <OptionSection
              optionNum={1}
              title="Monthly Membership"
              description="Best for ongoing support. Cancel anytime, no commitment."
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {pricing.filter(p => p.type === 'membership').map(plan => {
            const selectedPriceCents = selectedPriceFor(plan)
            const membershipHourlyCents = selectedPriceCents / plan.included_hours
            const savingsPercent = singleRateCents > 0
              ? Math.round(((singleRateCents - membershipHourlyCents) / singleRateCents) * 100)
              : null
            
            return (
            <Card key={plan.id} className={`flex flex-col ${plan.tier === 'core' ? 'border-[#b08a30] border-2 shadow-lg scale-105 z-10' : 'border-gray-200'}`}>
              {plan.tier === 'core' && <div className="bg-[#b08a30] text-white text-center text-xs py-1 uppercase font-bold tracking-wider">Most Popular</div>}
              <CardHeader>
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <div className="mt-2">
                  <span className="text-3xl font-bold">${selectedPriceCents / 100}</span>
                  <span className="text-gray-500 text-sm">/mo</span>
                </div>
                <p className="text-sm text-[#4a729f] font-medium">{plan.included_hours} hours included per month</p>
              </CardHeader>
              <CardContent className="flex-1">
                <ul className="space-y-2 text-sm">
                  {/*
                    Only claim a saving when there is one. The rate compared
                    against is the highest of the subjects the customer picked,
                    so on a $155 subject Starter works out at $154.50/hr and this
                    rendered the words "Save 0% vs Single Rate". Matches the
                    guard the package cards already had.
                  */}
                  {savingsPercent != null && savingsPercent > 0 && (
                    <li className="flex items-start"><Check className="w-4 h-4 mr-2 text-green-500 mt-0.5 shrink-0" /> <strong>Save {savingsPercent}% vs Single Rate</strong></li>
                  )}
                  <li className="flex items-start"><Check className="w-4 h-4 mr-2 text-green-500 mt-0.5 shrink-0" /> <strong>Locked-in hourly rate</strong></li>
                  <li className="flex items-start"><Check className="w-4 h-4 mr-2 text-green-500 mt-0.5 shrink-0" /> <strong>Cancel anytime</strong></li>
                  <li className="flex items-start"><Check className="w-4 h-4 mr-2 text-green-500 mt-0.5 shrink-0" /> Priority Scheduling</li>
                  {plan.tier === 'premier' && <li className="flex items-start"><Check className="w-4 h-4 mr-2 text-green-500 mt-0.5 shrink-0" /> Weekend Access</li>}
                  <li className="flex items-start"><Check className="w-4 h-4 mr-2 text-green-500 mt-0.5 shrink-0" /> Unused hours roll over (up to {plan.included_hours} carried forward)</li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button 
                  className={`w-full ${plan.tier === 'core' ? 'bg-[#b08a30] hover:bg-[#b58b2a]' : ''}`}
                  onClick={() => onSelect({ type: 'membership', id: plan.id, priceId: plan.stripe_online_price_id, name: plan.name, paymentMethod })}
                  disabled={processing}
                >
                  {processing ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Join & Book'}
                </Button>
              </CardFooter>
            </Card>
            )})}
              </div>
            </OptionSection>
          )}

      {/* The exam-prep package becomes the first option when memberships are hidden. */}
      <OptionSection
        optionNum={showMemberships ? 2 : 1}
        title="Prepaid Packages"
        description={isSAT || isACT
          ? 'Pay upfront for a complete SAT or ACT preparation package.'
          : `Pay upfront for a block of sessions. Valid ${PACKAGE_VALIDITY_MONTHS} months, ideal for short-term goals.`}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {isSAT && isACT && (
            <Card className="border-[#517cad] border-2 shadow-md relative overflow-hidden md:col-span-2">
              <div className="absolute top-0 right-0 bg-[#517cad] text-white text-xs px-3 py-1 uppercase font-bold tracking-wider">Best Value</div>
              <CardHeader>
                <CardTitle>Combined SAT + ACT Package</CardTitle>
                <div className="mt-2"><span className="text-3xl font-bold">{dollars(selectedPriceFor(combinedCourse))}</span></div>
                <p className="text-sm text-gray-500">{combinedCourse.included_hours} Sessions • Full Prep for Both Exams</p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start"><Check className="w-4 h-4 mr-2 text-green-500 mt-0.5" /> Structured curriculum covering both tests</li>
                  <li className="flex items-start"><Check className="w-4 h-4 mr-2 text-green-500 mt-0.5" /> Flexible scheduling (2-4x/week)</li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button className="w-full bg-[#517cad] hover:bg-[#3b5c85]" onClick={() => onSelect({ type: 'course', id: combinedCourse.id, courseType: 'sat-act-combined', name: 'Combined SAT + ACT Package', paymentMethod })} disabled={processing}>
                  {processing ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Select Package'}
                </Button>
              </CardFooter>
            </Card>
          )}
          {isSAT && !isACT && (
            <Card className="border-[#517cad] border-2 shadow-md relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-[#517cad] text-white text-xs px-3 py-1 uppercase font-bold tracking-wider">Recommended</div>
              <CardHeader>
                <CardTitle>SAT Prep Package</CardTitle>
                <div className="mt-2"><span className="text-3xl font-bold">{dollars(selectedPriceFor(satCourse))}</span></div>
                <p className="text-sm text-gray-500">{satCourse.included_hours} Sessions • Complete Prep</p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start"><Check className="w-4 h-4 mr-2 text-green-500 mt-0.5" /> {satCourse.included_hours} one-hour sessions</li>
                  <li className="flex items-start"><Check className="w-4 h-4 mr-2 text-green-500 mt-0.5" /> Structured curriculum</li>
                  <li className="flex items-start"><Check className="w-4 h-4 mr-2 text-green-500 mt-0.5" /> Flexible scheduling</li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button className="w-full bg-[#517cad] hover:bg-[#3b5c85]" onClick={() => onSelect({ type: 'course', id: satCourse.id, courseType: 'sat', name: 'SAT Prep Package', paymentMethod })} disabled={processing}>
                  {processing ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Select Package'}
                </Button>
              </CardFooter>
            </Card>
          )}
          {isACT && !isSAT && (
            <Card className="border-[#517cad] border-2 shadow-md relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-[#517cad] text-white text-xs px-3 py-1 uppercase font-bold tracking-wider">Recommended</div>
              <CardHeader>
                <CardTitle>ACT Prep Package</CardTitle>
                <div className="mt-2"><span className="text-3xl font-bold">{dollars(selectedPriceFor(actCourse))}</span></div>
                <p className="text-sm text-gray-500">{actCourse.included_hours} Sessions • Complete Prep</p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start"><Check className="w-4 h-4 mr-2 text-green-500 mt-0.5" /> {actCourse.included_hours} one-hour sessions</li>
                  <li className="flex items-start"><Check className="w-4 h-4 mr-2 text-green-500 mt-0.5" /> Structured curriculum</li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button className="w-full bg-[#517cad] hover:bg-[#3b5c85]" onClick={() => onSelect({ type: 'course', id: actCourse.id, courseType: 'act', name: 'ACT Prep Package', paymentMethod })} disabled={processing}>
                  {processing ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Select Package'}
                </Button>
              </CardFooter>
            </Card>
          )}
          {!isSAT && !isACT && packageList.map(({ pkg, selectedPriceCents, savingsPercent }) => (
            <Card key={pkg.id} className="border-gray-200 bg-white hover:border-[#517cad]/50 hover:shadow-lg transition-all">
              <CardHeader>
                <CardTitle className="text-xl">{pkg.name}</CardTitle>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-[#1e293b]">${selectedPriceCents / 100}</span>
                  <span className="text-gray-500 text-sm">for {pkg.included_hours} hours</span>
                </div>
                <div className="mt-1 flex items-center gap-2">
                  <span className="text-sm font-medium text-[#4a729f]">${(selectedPriceCents / pkg.included_hours / 100).toFixed(0)}/hr</span>
                  {savingsPercent != null && savingsPercent > 0 && (
                    <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200 text-xs font-semibold">
                      Save {savingsPercent}%
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2.5 text-sm">
                  <li className="flex items-start"><Check className="w-4 h-4 mr-2 text-green-500 mt-0.5 shrink-0" /> <strong>{savingsPercent != null && savingsPercent > 0 ? `Save ${savingsPercent}% vs single session` : 'Discounted rate vs single session'}</strong></li>
                  <li className="flex items-start"><Check className="w-4 h-4 mr-2 text-green-500 mt-0.5 shrink-0" /> {pkg.included_hours} one-hour sessions included</li>
                  <li className="flex items-start"><Check className="w-4 h-4 mr-2 text-green-500 mt-0.5 shrink-0" /> Valid for {PACKAGE_VALIDITY_MONTHS} months from purchase</li>
                  <li className="flex items-start"><Check className="w-4 h-4 mr-2 text-green-500 mt-0.5 shrink-0" /> Ideal for short-term goals</li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button className="w-full bg-[#517cad] hover:bg-[#3b5c85] text-white" onClick={() => onSelect({ type: 'package', id: pkg.id, name: pkg.name, paymentMethod })} disabled={processing}>
                  {processing ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Select Package'}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </OptionSection>

      {/* Single sessions are second for SAT/ACT, third for academic subjects. */}
      <OptionSection
        optionNum={showMemberships ? 3 : 2}
        title="Single Session"
        description="Pay as you go. No commitment, perfect to try before committing."
      >
        <Card className="border-gray-200 bg-slate-50/50 hover:border-gray-300 transition-colors max-w-md">
          <CardHeader>
            <CardTitle className="text-xl">Pay As You Go</CardTitle>
            <div className="mt-2">
              <span className="text-3xl font-bold text-[#1e293b]">${singleRate}</span>
              <span className="text-gray-500 text-sm ml-1">/hr</span>
            </div>
            <p className="text-sm text-gray-600">No contract • Book individually</p>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start"><Check className="w-4 h-4 mr-2 text-green-500 mt-0.5 shrink-0" /> No commitment required</li>
              <li className="flex items-start"><Check className="w-4 h-4 mr-2 text-green-500 mt-0.5 shrink-0" /> Flexibility to try before committing</li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full border-[#1e293b] text-[#1e293b] hover:bg-[#1e293b] hover:text-white" size="lg" onClick={() => onSelect({ type: 'single', name: 'Single Session', paymentMethod })} disabled={processing}>
              {processing ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : `Book Single Session for $${singleRate}`}
            </Button>
          </CardFooter>
        </Card>
          </OptionSection>
        </>
      )}
    </div>
  )
}
