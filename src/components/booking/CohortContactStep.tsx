"use client"

import { useEffect, useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Check, Loader2, Calendar, Users, Clock } from 'lucide-react'
import { format } from 'date-fns'
import { formatTime24To12 } from '@/lib/order-format'

interface Cohort {
  id: string
  start_date: string
  end_date: string
  max_students: number
  enrolled_count: number
  price_cents: number
  session_time_start?: string
  session_time_end?: string
}

interface CohortContactStepProps {
  testType: 'sat' | 'act'
  courseName: string
  contact: {
    fullName: string
    email: string
    phone: string
    studentGrade: string
    notes: string
  }
  onChange: (contact: CohortContactStepProps['contact']) => void
  onEnroll: (params: { cohortId: string; priceCents: number; courseName: string }) => void
  loading?: boolean
}

export function CohortContactStep({ testType, courseName, contact, onChange, onEnroll, loading }: CohortContactStepProps) {
  const [cohorts, setCohorts] = useState<Cohort[]>([])
  const [cohortsLoading, setCohortsLoading] = useState(true)
  const [selectedCohort, setSelectedCohort] = useState<Cohort | null>(null)

  useEffect(() => {
    fetch(`/api/cohorts?test_type=${testType}`)
      .then(res => res.json())
      .then((data: Cohort[]) => {
        setCohorts(Array.isArray(data) ? data : [])
        setCohortsLoading(false)
      })
      .catch(() => setCohortsLoading(false))
  }, [testType])

  // Prefill contact from profile if logged in and contact is empty
  useEffect(() => {
    if (contact.email?.trim()) return
    async function prefill() {
      try {
        const res = await fetch('/api/account/profile')
        if (!res.ok) return
        const data = await res.json()
        if (data.email || data.fullName) {
          onChange({
            fullName: data.fullName || contact.fullName,
            email: data.email || contact.email,
            phone: data.phone || contact.phone,
            studentGrade: data.studentGrade || contact.studentGrade,
            notes: contact.notes
          })
        }
      } catch {
        // Not logged in
      }
    }
    prefill()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const availableCohorts = cohorts.filter(c => (c.enrolled_count ?? 0) < (c.max_students ?? 15))
  const handleChange = (field: string, value: string) => onChange({ ...contact, [field]: value })
  const canCheckout = selectedCohort && contact.fullName?.trim() && contact.email?.trim()

  return (
    <div className="space-y-8">
      {/* Step 1: Select cohort */}
      <div>
        <h2 className="text-2xl font-serif text-[#1e293b] mb-2">Choose a Cohort</h2>
        <p className="text-gray-600 text-sm mb-4">Select an available date for your in-person course.</p>
        {cohortsLoading ? (
          <div className="flex justify-center py-8"><Loader2 className="w-8 h-8 animate-spin text-gray-400" /></div>
        ) : availableCohorts.length > 0 ? (
          <div className="flex flex-col gap-3">
            {availableCohorts.map((cohort) => {
              const start = new Date(cohort.start_date)
              const end = new Date(cohort.end_date)
              const spotsLeft = Math.max(0, cohort.max_students - (cohort.enrolled_count ?? 0))
              const isSelected = selectedCohort?.id === cohort.id
              return (
                <button
                  key={cohort.id}
                  type="button"
                  onClick={() => setSelectedCohort(cohort)}
                  className={`w-full flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 p-4 rounded-lg border-2 bg-white text-left transition-all hover:border-[#1e293b]/70 cursor-pointer ${isSelected ? 'border-[#1e293b] ring-2 ring-[#1e293b]/20' : 'border-gray-200'}`}
                >
                  <div className="flex flex-col gap-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                      <span className="font-medium text-[#1e293b] flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-500 shrink-0" />
                        {format(start, 'MMM d')} – {format(end, 'MMM d, yyyy')}
                      </span>
                      {(cohort.session_time_start || cohort.session_time_end) && (
                        <span className="text-sm text-gray-600 flex items-center gap-2">
                          <Clock className="w-4 h-4 text-gray-500 shrink-0" />
                          {formatTime24To12(cohort.session_time_start)} – {formatTime24To12(cohort.session_time_end)}
                        </span>
                      )}
                      <span className="text-sm text-gray-600 flex items-center gap-2">
                        <Users className="w-4 h-4 text-gray-500 shrink-0" />
                        {spotsLeft} spots left
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Check className="w-4 h-4 text-green-500 shrink-0" />
                      <span>
                        {(cohort.session_time_start || cohort.session_time_end)
                          ? `${formatTime24To12(cohort.session_time_start)} – ${formatTime24To12(cohort.session_time_end)} • `
                          : ''}
                        Small group (max {cohort.max_students}) • 2 hrs 1:1 included
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    <span className="text-xl font-bold text-[#1e293b]">
                      ${(cohort.price_cents / 100).toLocaleString()}
                    </span>
                    {isSelected && (
                      <span className="text-sm font-medium text-[#1e293b]">Selected</span>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        ) : (
          <div className="rounded-lg border border-amber-200 bg-amber-50/50 px-4 py-3 text-sm text-gray-700">
            No upcoming {testType === 'sat' ? 'SAT' : 'ACT'} cohorts at the moment. <a href="/contact" className="text-[#b08a30] font-medium hover:underline cursor-pointer">Contact us</a> to be notified when new sessions are added.
          </div>
        )}
      </div>

      {/* Step 2: User info (shown when cohort selected) */}
      {selectedCohort && (
        <div className="space-y-4 pt-4 border-t border-gray-100">
          <div>
            <h3 className="font-semibold text-lg text-[#1e293b]">Your Information</h3>
            <p className="text-sm text-gray-600">Required for checkout. Prefilled if you&apos;re logged in.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cohort-fullName">Full Name</Label>
              <Input
                id="cohort-fullName"
                value={contact.fullName}
                onChange={(e) => handleChange('fullName', e.target.value)}
                placeholder="Student or Parent Name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cohort-email">Email Address</Label>
              <Input
                id="cohort-email"
                type="email"
                value={contact.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cohort-phone">Phone Number</Label>
              <Input
                id="cohort-phone"
                type="tel"
                value={contact.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="(555) 123-4567"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cohort-grade">Student Grade (Optional)</Label>
              <Input
                id="cohort-grade"
                value={contact.studentGrade}
                onChange={(e) => handleChange('studentGrade', e.target.value)}
                placeholder="e.g. 11th Grade"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="cohort-notes">Notes (Optional)</Label>
            <Textarea
              id="cohort-notes"
              value={contact.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              placeholder="Anything specific you'd like us to know?"
              className="min-h-[80px]"
            />
          </div>

          {/* Step 3: Proceed to Checkout */}
          <div className="pt-4">
            <Button
              className="w-full bg-[#1e293b] hover:bg-[#334155]"
              size="lg"
              onClick={() => onEnroll({
                cohortId: selectedCohort.id,
                priceCents: selectedCohort.price_cents,
                courseName
              })}
              disabled={loading || !canCheckout}
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin mx-auto" />
              ) : (
                `Proceed to Checkout – $${(selectedCohort.price_cents / 100).toLocaleString()}`
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
