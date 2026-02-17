"use client"

import { useEffect, useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Check, Star, Loader2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface PlanSelectionProps {
  subjects: string[]
  sessionType: 'online' | 'in-person'
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  memberStatus: any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onSelect: (plan: any) => void
  loading?: boolean
}

export function PlanSelection({ subjects, sessionType, memberStatus, onSelect, loading: processing }: PlanSelectionProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [pricing, setPricing] = useState<any[]>([])
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [subjectMap, setSubjectMap] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/pricing').then(res => res.json()),
      fetch('/api/subjects').then(res => res.json())
    ]).then(([pricingData, subjectsData]) => {
      setPricing(pricingData)
      
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const flat: Record<string, any> = {}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      Object.values(subjectsData).forEach((arr: any) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        arr.forEach((s: any) => flat[s.id] = s)
      })
      setSubjectMap(flat)
      setLoading(false)
    })
  }, [])

  const getSingleRate = () => {
    if (subjects.length === 0) return 0
    let maxRate = 0
    subjects.forEach(id => {
      const s = subjectMap[id]
      if (s && s.hourly_rate_cents > maxRate) maxRate = s.hourly_rate_cents
    })
    return maxRate / 100
  }

  if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>

  const isSAT = subjects.some(id => subjectMap[id]?.slug === 'sat')
  const isACT = subjects.some(id => subjectMap[id]?.slug === 'act')
  const singleRate = getSingleRate()

  const packageList = pricing.filter(p => p.type === 'package').map(pkg => {
    const packageHourlyCents = pkg.price_cents / pkg.included_hours
    const singleRateCents = singleRate * 100
    const savingsPercent = singleRateCents > 0 ? Math.round(((singleRateCents - packageHourlyCents) / singleRateCents) * 100) : null
    return { pkg, savingsPercent }
  })

  // Existing Credits View
  if (memberStatus?.hasCredits && !processing) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-serif text-[#1e293b]">How would you like to pay?</h2>
        
        <Card className="border-[#c79d3c] bg-amber-50/20">
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              <span>Use Existing Credit</span>
              <Badge className="bg-[#c79d3c] hover:bg-[#b58b2a]">Recommended</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg">You have <span className="font-bold">{memberStatus.totalCredits} credits</span> remaining.</p>
            <p className="text-sm text-gray-500 mt-2">Use 1 credit to book this session now.</p>
            {memberStatus.totalCourseSessions > 0 && (
               <p className="text-xs text-blue-600 mt-1">Including {memberStatus.totalCourseSessions} course sessions.</p>
            )}
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full bg-[#1e293b] hover:bg-[#334155] text-white"
              onClick={() => {
                // Determine which credit to use
                // Prioritize Course > Membership > Package
                let type = 'membership'
                let id = memberStatus.membership?.id
                let courseId = null
                
                if (memberStatus.courseEnrollments?.length > 0) {
                   // Match course type to subject if possible, or just use first valid
                   // For MVP, use first active course enrollment
                   type = 'course'
                   courseId = memberStatus.courseEnrollments[0].id
                } else if (memberStatus.membership?.remaining_hours > 0) {
                   type = 'membership'
                   id = memberStatus.membership.id
                } else if (memberStatus.packages?.length > 0) {
                   type = 'package'
                   id = memberStatus.packages[0].id
                }
                
                onSelect({ type, id, courseEnrollmentId: courseId })
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
      <div className="rounded-lg border border-[#c79d3c]/30 bg-amber-50/30 px-4 py-3">
        <p className="text-center font-medium text-[#1e293b]">
          Choose <span className="font-bold">one</span> plan below. Pick the option that works best for you.
        </p>
      </div>

      {/* SAT/ACT Exam Prep - shown when applicable, before options */}
      {(isSAT || isACT) && (
        <div className="space-y-4">
          <h3 className="font-semibold text-lg text-[#1e293b] flex items-center">
            <Star className="w-5 h-5 text-[#c79d3c] mr-2 fill-current" />
            Exam Prep Course Programs
          </h3>
          <p className="text-sm text-gray-600">Structured curriculum for SAT/ACT. Choose one of these or a plan below.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {isSAT && isACT && (
              <Card className="border-[#517cad] border-2 shadow-md relative overflow-hidden md:col-span-2">
                <div className="absolute top-0 right-0 bg-[#517cad] text-white text-xs px-3 py-1 uppercase font-bold tracking-wider">Best Value</div>
                <CardHeader>
                  <CardTitle>Combined SAT+ACT Course</CardTitle>
                  <div className="mt-2"><span className="text-3xl font-bold">$3,250</span></div>
                  <p className="text-sm text-gray-500">13 Sessions • Full Prep for Both Exams</p>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start"><Check className="w-4 h-4 mr-2 text-green-500 mt-0.5" /> Structured curriculum covering both tests</li>
                    <li className="flex items-start"><Check className="w-4 h-4 mr-2 text-green-500 mt-0.5" /> Flexible scheduling (2-4x/week)</li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button className="w-full bg-[#517cad] hover:bg-[#3b5c85]" onClick={() => onSelect({ type: 'course', courseType: 'sat-act-combined', price: 325000, name: 'Combined SAT+ACT Course' })} disabled={processing}>
                    {processing ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Enroll Now'}
                  </Button>
                </CardFooter>
              </Card>
            )}
            {isSAT && !isACT && (
              <Card className="border-[#517cad] border-2 shadow-md relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-[#517cad] text-white text-xs px-3 py-1 uppercase font-bold tracking-wider">Recommended</div>
                <CardHeader>
                  <CardTitle>Full SAT Course</CardTitle>
                  <div className="mt-2"><span className="text-3xl font-bold">$2,500</span></div>
                  <p className="text-sm text-gray-500">10 Sessions • Complete Prep</p>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start"><Check className="w-4 h-4 mr-2 text-green-500 mt-0.5" /> 10 one-hour sessions</li>
                    <li className="flex items-start"><Check className="w-4 h-4 mr-2 text-green-500 mt-0.5" /> Structured curriculum</li>
                    <li className="flex items-start"><Check className="w-4 h-4 mr-2 text-green-500 mt-0.5" /> Flexible scheduling</li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button className="w-full bg-[#517cad] hover:bg-[#3b5c85]" onClick={() => onSelect({ type: 'course', courseType: 'sat', price: 250000, name: 'Full SAT Course' })} disabled={processing}>
                    {processing ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Enroll Now'}
                  </Button>
                </CardFooter>
              </Card>
            )}
            {isACT && !isSAT && (
              <Card className="border-[#517cad] border-2 shadow-md relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-[#517cad] text-white text-xs px-3 py-1 uppercase font-bold tracking-wider">Recommended</div>
                <CardHeader>
                  <CardTitle>Full ACT Course</CardTitle>
                  <div className="mt-2"><span className="text-3xl font-bold">$2,500</span></div>
                  <p className="text-sm text-gray-500">10 Sessions • Complete Prep</p>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start"><Check className="w-4 h-4 mr-2 text-green-500 mt-0.5" /> 10 one-hour sessions</li>
                    <li className="flex items-start"><Check className="w-4 h-4 mr-2 text-green-500 mt-0.5" /> Structured curriculum</li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button className="w-full bg-[#517cad] hover:bg-[#3b5c85]" onClick={() => onSelect({ type: 'course', courseType: 'act', price: 250000, name: 'Full ACT Course' })} disabled={processing}>
                    {processing ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Enroll Now'}
                  </Button>
                </CardFooter>
              </Card>
            )}
          </div>
        </div>
      )}

      {/* In-Person SAT Course - when SAT + in-person */}
      {(isSAT && sessionType === 'in-person') && (
        <div className="space-y-4">
          <h3 className="font-semibold text-lg text-[#1e293b]">In-Person Program</h3>
          <Card className="border-[#1e293b] border-2 bg-white max-w-xl">
            <CardHeader>
              <CardTitle>In-Person SAT Course (Sawgrass, FL)</CardTitle>
              <div className="mt-2"><span className="text-3xl font-bold">$895</span></div>
              <p className="text-sm text-gray-500">5-Week Program</p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start"><Check className="w-4 h-4 mr-2 text-green-500 mt-0.5" /> Small group (max 15 students)</li>
                  <li className="flex items-start"><Check className="w-4 h-4 mr-2 text-green-500 mt-0.5" /> 2 sessions/week (2 hrs each)</li>
                </ul>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start"><Check className="w-4 h-4 mr-2 text-green-500 mt-0.5" /> Includes diagnostics + materials</li>
                  <li className="flex items-start"><Check className="w-4 h-4 mr-2 text-green-500 mt-0.5" /> <strong>Bonus:</strong> 2 hours 1:1 included</li>
                </ul>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full" onClick={() => onSelect({ type: 'sat-course-inperson', price: 89500, name: 'In-Person SAT Course' })} disabled={processing}>
                {processing ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Enroll in In-Person Course'}
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}

      {/* Option 1: Monthly Memberships */}
      <OptionSection
        optionNum={1}
        title="Monthly Membership"
        description="Best for ongoing support. Cancel anytime—no commitment."
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {pricing.filter(p => p.type === 'membership').map(plan => {
            const membershipHourlyCents = plan.price_cents / plan.included_hours
            const singleRateCents = singleRate * 100
            const savingsPercent = singleRateCents > 0
              ? Math.round(((singleRateCents - membershipHourlyCents) / singleRateCents) * 100)
              : null
            
            return (
            <Card key={plan.id} className={`flex flex-col ${plan.tier === 'core' ? 'border-[#c79d3c] border-2 shadow-lg scale-105 z-10' : 'border-gray-200'}`}>
              {plan.tier === 'core' && <div className="bg-[#c79d3c] text-white text-center text-xs py-1 uppercase font-bold tracking-wider">Most Popular</div>}
              <CardHeader>
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <div className="mt-2">
                  <span className="text-3xl font-bold">${plan.price_cents / 100}</span>
                  <span className="text-gray-500 text-sm">/mo</span>
                </div>
                <p className="text-sm text-[#517cad] font-medium">{plan.included_hours} hours included</p>
              </CardHeader>
              <CardContent className="flex-1">
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start"><Check className="w-4 h-4 mr-2 text-green-500 mt-0.5 shrink-0" /> <strong>{savingsPercent != null ? `Save ${savingsPercent}% vs Single Rate` : 'Save vs Single Rate'}</strong></li>
                  <li className="flex items-start"><Check className="w-4 h-4 mr-2 text-green-500 mt-0.5 shrink-0" /> <strong>Cancel anytime</strong></li>
                  <li className="flex items-start"><Check className="w-4 h-4 mr-2 text-green-500 mt-0.5 shrink-0" /> Priority Scheduling</li>
                  {plan.tier !== 'starter' && <li className="flex items-start"><Check className="w-4 h-4 mr-2 text-green-500 mt-0.5 shrink-0" /> Video Library Access</li>}
                  {plan.tier === 'premier' && <li className="flex items-start"><Check className="w-4 h-4 mr-2 text-green-500 mt-0.5 shrink-0" /> Weekend Access</li>}
                  <li className="flex items-start"><Check className="w-4 h-4 mr-2 text-green-500 mt-0.5 shrink-0" /> Rollover (1 hr/mo)</li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button 
                  className={`w-full ${plan.tier === 'core' ? 'bg-[#c79d3c] hover:bg-[#b58b2a]' : ''}`}
                  onClick={() => onSelect({ type: 'membership', id: plan.id, priceId: plan.stripe_price_id, name: plan.name })}
                  disabled={processing}
                >
                  {processing ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Join & Book'}
                </Button>
              </CardFooter>
            </Card>
          )})}
        </div>
      </OptionSection>

      {/* Option 2: Prepaid Packages */}
      <OptionSection
        optionNum={2}
        title="Prepaid Packages"
        description="Pay upfront for a block of sessions. Valid 6 months—ideal for short-term goals."
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {packageList.map(({ pkg, savingsPercent }) => (
            <Card key={pkg.id} className="border-gray-200 bg-white hover:border-[#517cad]/50 hover:shadow-lg transition-all">
              <CardHeader>
                <CardTitle className="text-xl">{pkg.name}</CardTitle>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-[#1e293b]">${pkg.price_cents / 100}</span>
                  <span className="text-gray-500 text-sm">for {pkg.included_hours} hours</span>
                </div>
                <div className="mt-1 flex items-center gap-2">
                  <span className="text-sm font-medium text-[#517cad]">${(pkg.price_cents / pkg.included_hours / 100).toFixed(0)}/hr</span>
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
                  <li className="flex items-start"><Check className="w-4 h-4 mr-2 text-green-500 mt-0.5 shrink-0" /> Valid for 6 months</li>
                  <li className="flex items-start"><Check className="w-4 h-4 mr-2 text-green-500 mt-0.5 shrink-0" /> Ideal for short-term goals</li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button className="w-full bg-[#517cad] hover:bg-[#3b5c85] text-white" onClick={() => onSelect({ type: 'package', id: pkg.id, price: pkg.price_cents, name: pkg.name })} disabled={processing}>
                  {processing ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Select Package'}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </OptionSection>

      {/* Option 3: Single Session */}
      <OptionSection
        optionNum={3}
        title="Single Session"
        description="Pay as you go. No commitment—perfect to try before committing."
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
            <Button variant="outline" className="w-full border-[#1e293b] text-[#1e293b] hover:bg-[#1e293b] hover:text-white" size="lg" onClick={() => onSelect({ type: 'single', price: singleRate * 100, name: 'Single Session' })} disabled={processing}>
              {processing ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : `Book Single Session for $${singleRate}`}
            </Button>
          </CardFooter>
        </Card>
      </OptionSection>
    </div>
  )
}