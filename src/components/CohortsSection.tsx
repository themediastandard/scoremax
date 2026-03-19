'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Loader2, Calendar, Users, Clock } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { formatTime24To12 } from '@/lib/order-format'

interface Cohort {
  id: string
  start_date: string
  end_date: string
  max_students: number
  enrolled_count: number
  price_cents: number
  status: string
  session_time_start?: string
  session_time_end?: string
  testType?: 'sat' | 'act'
}

export function CohortsSection() {
  const [satCohorts, setSatCohorts] = useState<Cohort[]>([])
  const [actCohorts, setActCohorts] = useState<Cohort[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/cohorts?test_type=sat').then(res => res.json()),
      fetch('/api/cohorts?test_type=act').then(res => res.json()),
    ])
      .then(([sat, act]) => {
        setSatCohorts(Array.isArray(sat) ? sat : [])
        setActCohorts(Array.isArray(act) ? act : [])
      })
      .catch(() => {
        setSatCohorts([])
        setActCohorts([])
      })
      .finally(() => setLoading(false))
  }, [])

  const cohorts = [
    ...satCohorts.map(c => ({ ...c, testType: 'sat' as const })),
    ...actCohorts.map(c => ({ ...c, testType: 'act' as const })),
  ].sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime())

  if (loading) {
    return (
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-[#b08a30]" />
          </div>
        </div>
      </section>
    )
  }

  if (cohorts.length === 0) return null

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="uppercase text-xs tracking-widest text-[#b08a30] font-semibold mb-3">Upcoming Sessions</div>
          <h2 className="font-[family-name:var(--font-playfair)] text-3xl lg:text-4xl text-gray-900 mb-4">
            SAT & ACT In-Person Cohorts
          </h2>
          <p className="text-gray-500 text-sm max-w-xl mx-auto">
            Choose a cohort that fits your schedule. Limited spots per session.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cohorts.map((cohort) => {
            const start = parseISO(cohort.start_date)
            const end = parseISO(cohort.end_date)
            const spotsLeft = Math.max(0, cohort.max_students - (cohort.enrolled_count || 0))
            return (
              <div
                key={cohort.id}
                className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between gap-2 mb-4">
                  <div className="flex items-center gap-2 text-[#b08a30]">
                    <Calendar className="w-5 h-5" />
                    <span className="text-sm font-semibold uppercase tracking-wider">
                      {format(start, 'MMM d')} – {format(end, 'MMM d, yyyy')}
                    </span>
                  </div>
                  <span className="shrink-0 px-2 py-0.5 text-xs font-semibold rounded-full bg-[#b08a30]/10 text-[#b08a30]">
                    {cohort.testType === 'act' ? 'ACT' : 'SAT'}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-gray-500 text-sm mb-4">
                  {(cohort.session_time_start || cohort.session_time_end) && (
                    <span className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      {formatTime24To12(cohort.session_time_start)} – {formatTime24To12(cohort.session_time_end)}
                    </span>
                  )}
                  <span className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    {spotsLeft} of {cohort.max_students} spots available
                  </span>
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-4">
                  ${(cohort.price_cents / 100).toLocaleString()}
                </div>
                <Link
                  href="/book"
                  className="inline-flex items-center justify-center w-full bg-[#b08a30] text-white px-4 py-3 text-sm font-medium hover:bg-[#9a7628] transition-colors rounded-lg cursor-pointer"
                >
                  Enroll Now
                </Link>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
