'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { ChevronDown, ChevronRight, Users, Loader2, Mail, Phone, Clock, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatTime24To12 } from '@/lib/order-format'
import { CohortForm } from './CohortForm'

interface Cohort {
  id: string
  start_date: string
  end_date: string
  max_students: number
  enrolled_count: number
  status: string
  price_cents: number
  session_time_start?: string
  session_time_end?: string
}

interface Enrollee {
  id: string
  enrolledAt: string
  customerId: string
  name: string
  email: string
  phone: string | null
}

interface CohortRowProps {
  cohort: Cohort
  testType?: 'sat' | 'act'
}

export function CohortRow({ cohort, testType = 'sat' }: CohortRowProps) {
  const router = useRouter()
  const [expanded, setExpanded] = useState(false)
  const [enrollees, setEnrollees] = useState<Enrollee[]>([])
  const [loadingEnrollees, setLoadingEnrollees] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)

  async function handleDelete() {
    setDeleting(true)
    try {
      const base = testType === 'act' ? '/api/admin/cohorts/act' : '/api/admin/cohorts'
      const res = await fetch(`${base}/${cohort.id}`, { method: 'DELETE' })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || 'Failed to delete cohort')
      }
      setConfirmDelete(false)
      router.refresh()
    } catch (error: any) {
      console.error(error)
      alert(error.message)
    } finally {
      setDeleting(false)
    }
  }

  useEffect(() => {
    if (!expanded || cohort.enrolled_count === 0) {
      setEnrollees([])
      return
    }
    setLoadingEnrollees(true)
    const base = testType === 'act' ? '/api/admin/cohorts/act' : '/api/admin/cohorts'
    fetch(`${base}/${cohort.id}/enrollees`)
      .then((res) => res.json())
      .then((data) => {
        setEnrollees(Array.isArray(data) ? data : [])
      })
      .catch(() => setEnrollees([]))
      .finally(() => setLoadingEnrollees(false))
  }, [expanded, cohort.id, cohort.enrolled_count, testType])

  const statusColors: Record<string, string> = {
    active: 'bg-green-100 text-green-800',
    upcoming: 'bg-blue-100 text-blue-800',
    completed: 'bg-gray-100 text-gray-800',
    cancelled: 'bg-red-100 text-red-800',
  }

  return (
    <div className="border-b border-gray-100 last:border-b-0">
      {/* Collapsed row - always visible */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => setExpanded((e) => !e)}
        onKeyDown={(e) => e.key === 'Enter' && setExpanded((prev) => !prev)}
        className="flex items-center justify-between gap-4 px-6 py-4 hover:bg-gray-50/80 cursor-pointer transition-colors"
      >
        <div className="flex items-center gap-3 min-w-0">
          {expanded ? (
            <ChevronDown className="w-5 h-5 text-gray-400 shrink-0" />
          ) : (
            <ChevronRight className="w-5 h-5 text-gray-400 shrink-0" />
          )}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-1">
            <span className="text-sm font-medium text-gray-900">
              {format(new Date(cohort.start_date), 'MMM d, yyyy')} – {format(new Date(cohort.end_date), 'MMM d, yyyy')}
            </span>
            {(cohort.session_time_start || cohort.session_time_end) && (
              <span className="text-sm text-gray-500 flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {formatTime24To12(cohort.session_time_start)} – {formatTime24To12(cohort.session_time_end)}
              </span>
            )}
            <span className="text-sm text-gray-500 flex items-center gap-1">
              <Users className="w-4 h-4" />
              {cohort.enrolled_count} / {cohort.max_students}
            </span>
            <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${statusColors[cohort.status] ?? 'bg-gray-100 text-gray-800'}`}>
              {cohort.status}
            </span>
            <span className="text-sm font-semibold text-[#1e293b]">
              ${(cohort.price_cents / 100).toLocaleString()}
            </span>
          </div>
        </div>
        <div onClick={(e) => e.stopPropagation()} className="shrink-0 flex items-center gap-1">
          <CohortForm cohort={cohort} testType={testType} />
          <Button
            variant="ghost"
            size="sm"
            className="text-red-400 hover:text-red-600 hover:bg-red-50"
            onClick={() => setConfirmDelete(true)}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Delete confirmation */}
      {confirmDelete && (
        <div className="px-6 py-4 bg-red-50 border-t border-red-100 flex items-center justify-between gap-4">
          <p className="text-sm text-red-700">
            Delete this cohort? {cohort.enrolled_count > 0 && <strong>It has {cohort.enrolled_count} enrolled student{cohort.enrolled_count > 1 ? 's' : ''}.</strong>} This cannot be undone.
          </p>
          <div className="flex items-center gap-2 shrink-0">
            <Button variant="outline" size="sm" onClick={() => setConfirmDelete(false)}>Cancel</Button>
            <Button variant="destructive" size="sm" disabled={deleting} onClick={handleDelete}>
              {deleting ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </div>
      )}

      {/* Expanded content */}
      {expanded && (
        <div className="px-6 pb-6 pt-0 pl-14 border-t border-gray-100 bg-gray-50/50">
          <div className="pt-4 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-gray-700">Enrolled Students</h4>
            </div>

            {loadingEnrollees ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
              </div>
            ) : enrollees.length > 0 ? (
              <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                      <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                      <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase hidden sm:table-cell">Phone</th>
                      <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase">Enrolled</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {enrollees.map((e) => (
                      <tr key={e.id} className="hover:bg-gray-50/50">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{e.name}</td>
                        <td className="px-4 py-3 text-sm">
                          <a href={`mailto:${e.email}`} className="text-[#517cad] hover:underline inline-flex items-center gap-1">
                            <Mail className="w-3.5 h-3.5" />
                            {e.email}
                          </a>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 hidden sm:table-cell">
                          {e.phone ? (
                            <a href={`tel:${e.phone}`} className="inline-flex items-center gap-1 hover:text-[#517cad]">
                              <Phone className="w-3.5 h-3.5" />
                              {e.phone}
                            </a>
                          ) : (
                            '—'
                          )}
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-500">
                          {format(new Date(e.enrolledAt), 'MMM d, yyyy')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-gray-500 py-4">No enrollees yet.</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
