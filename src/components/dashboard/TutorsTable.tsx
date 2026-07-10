'use client'

import { useState, useMemo } from 'react'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Search, GraduationCap, X } from 'lucide-react'
import { TutorForm } from '@/components/dashboard/TutorForm'

interface Tutor {
  id: string
  full_name: string
  email: string
  phone: string
  bio: string
  photo_url: string
  specialties: string[]
  is_active: boolean
}

interface SessionStats {
  completed: number
  upcoming: number
}

interface TutorsTableProps {
  tutors: Tutor[]
  sessionMap: Record<string, SessionStats>
  allSubjects: string[]
}

type SortOption = 'name-asc' | 'name-desc' | 'sessions' | 'upcoming'

export function TutorsTable({ tutors, sessionMap, allSubjects }: TutorsTableProps) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [subjectFilter, setSubjectFilter] = useState('all')
  const [sortBy, setSortBy] = useState<SortOption>('name-asc')

  const filtered = useMemo(() => {
    let result = [...tutors]

    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter((t) => {
        const name = t.full_name?.toLowerCase() ?? ''
        const email = t.email?.toLowerCase() ?? ''
        const phone = t.phone?.toLowerCase() ?? ''
        return name.includes(q) || email.includes(q) || phone.includes(q)
      })
    }

    if (statusFilter !== 'all') {
      const active = statusFilter === 'active'
      result = result.filter((t) => t.is_active === active)
    }

    if (subjectFilter !== 'all') {
      const q = subjectFilter.toLowerCase()
      result = result.filter((t) =>
        t.specialties?.some((s) => s.toLowerCase() === q)
      )
    }

    result.sort((a, b) => {
      switch (sortBy) {
        case 'name-asc':
          return (a.full_name ?? '').localeCompare(b.full_name ?? '')
        case 'name-desc':
          return (b.full_name ?? '').localeCompare(a.full_name ?? '')
        case 'sessions': {
          const sa = sessionMap[a.id] ?? { completed: 0, upcoming: 0 }
          const sb = sessionMap[b.id] ?? { completed: 0, upcoming: 0 }
          return (sb.completed + sb.upcoming) - (sa.completed + sa.upcoming)
        }
        case 'upcoming': {
          const sa = sessionMap[a.id] ?? { completed: 0, upcoming: 0 }
          const sb = sessionMap[b.id] ?? { completed: 0, upcoming: 0 }
          return sb.upcoming - sa.upcoming
        }
        default:
          return 0
      }
    })

    return result
  }, [tutors, search, statusFilter, subjectFilter, sortBy, sessionMap])

  const hasFilters = search || statusFilter !== 'all' || subjectFilter !== 'all'

  const clearFilters = () => {
    setSearch('')
    setStatusFilter('all')
    setSubjectFilter('all')
  }

  return (
    <>
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search name, email, phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9"
          />
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[130px] h-9">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>

        {allSubjects.length > 0 && (
          <Select value={subjectFilter} onValueChange={setSubjectFilter}>
            <SelectTrigger className="w-[150px] h-9">
              <SelectValue placeholder="Subject" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Subjects</SelectItem>
              {allSubjects.map((s) => (
                <SelectItem key={s} value={s.toLowerCase()}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
          <SelectTrigger className="w-[160px] h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name-asc">Name A–Z</SelectItem>
            <SelectItem value="name-desc">Name Z–A</SelectItem>
            <SelectItem value="sessions">Most Sessions</SelectItem>
            <SelectItem value="upcoming">Most Upcoming</SelectItem>
          </SelectContent>
        </Select>

        {hasFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="h-3 w-3" />
            Clear
          </button>
        )}
      </div>

      {filtered.length > 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr className="bg-gray-50/80">
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Tutor</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Contact</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Subjects</th>
                <th className="px-5 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Sessions</th>
                <th className="px-5 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((tutor) => {
                const stats = sessionMap[tutor.id] ?? { completed: 0, upcoming: 0 }

                return (
                  <tr key={tutor.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-5 py-3.5">
                      <p className="font-medium text-sm text-[#1e293b]">{tutor.full_name}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="text-sm text-gray-600">{tutor.email}</p>
                      {tutor.phone && (
                        <p className="text-xs text-gray-400 mt-0.5">{tutor.phone}</p>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {tutor.specialties?.length > 0 ? (
                          tutor.specialties.map((s) => (
                            <Badge
                              key={s}
                              variant="secondary"
                              className="font-medium bg-slate-100 text-slate-600 text-[11px]"
                            >
                              {s}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {stats.upcoming > 0 && (
                          <span className="inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">
                            {stats.upcoming} upcoming
                          </span>
                        )}
                        {stats.completed > 0 && (
                          <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                            {stats.completed} done
                          </span>
                        )}
                        {stats.upcoming === 0 && stats.completed === 0 && (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <span
                        className={`inline-flex px-2.5 py-0.5 text-xs font-semibold rounded-full ${
                          tutor.is_active
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {tutor.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <TutorForm tutor={tutor} />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-dashed border-gray-200 py-16 text-center">
          <GraduationCap className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          {hasFilters ? (
            <>
              <p className="text-gray-500 font-medium">No matching tutors</p>
              <p className="text-sm text-gray-400 mt-1">Try adjusting your filters</p>
            </>
          ) : (
            <>
              <p className="text-gray-500 font-medium">No tutors yet</p>
              <p className="text-sm text-gray-400 mt-1">Add a tutor to get started</p>
            </>
          )}
        </div>
      )}

      <p className="text-xs text-gray-400 text-right">
        Showing {filtered.length} of {tutors.length} tutors
      </p>
    </>
  )
}
