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
import { Search, Calendar, Video, MapPin, X } from 'lucide-react'
import { JoinClassButton } from './JoinClassButton'

interface Session {
  id: string
  customer_id: string
  confirmed_start: string | null
  confirmed_end: string | null
  session_type: string
  subjects: string[]
  status: string
  meet_url: string | null
  customers: { full_name: string; email: string } | null
}

interface TutorSessionsTableProps {
  sessions: Session[]
  subjectMap: Record<string, string>
}

const statusDisplay: Record<string, { label: string; class: string }> = {
  scheduled: { label: 'Scheduled', class: 'bg-blue-50 text-blue-700' },
  completed: { label: 'Completed', class: 'bg-emerald-50 text-emerald-700' },
  pending_scheduling: { label: 'Pending', class: 'bg-amber-50 text-amber-700' },
}

export function TutorSessionsTable({ sessions, subjectMap }: TutorSessionsTableProps) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('upcoming')
  const [typeFilter, setTypeFilter] = useState('all')
  const [sortBy, setSortBy] = useState<'soonest' | 'latest'>('soonest')

  const filtered = useMemo(() => {
    let result = [...sessions]

    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter((s) => {
        const name = s.customers?.full_name?.toLowerCase() ?? ''
        const email = s.customers?.email?.toLowerCase() ?? ''
        const subs = s.subjects?.map((id) => subjectMap[id]?.toLowerCase() ?? '').join(' ')
        return name.includes(q) || email.includes(q) || subs.includes(q)
      })
    }

    if (statusFilter !== 'all') {
      if (statusFilter === 'upcoming') {
        result = result.filter((s) => s.status === 'scheduled')
      } else {
        result = result.filter((s) => s.status === statusFilter)
      }
    }

    if (typeFilter !== 'all') {
      result = result.filter((s) => s.session_type === typeFilter)
    }

    result.sort((a, b) => {
      const da = a.confirmed_start ? new Date(a.confirmed_start).getTime() : 0
      const db = b.confirmed_start ? new Date(b.confirmed_start).getTime() : 0
      return sortBy === 'soonest' ? da - db : db - da
    })

    return result
  }, [sessions, search, statusFilter, typeFilter, sortBy, subjectMap])

  const hasFilters = search || statusFilter !== 'upcoming' || typeFilter !== 'all'

  return (
    <>
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search student or subject..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9"
          />
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[140px] h-9">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sessions</SelectItem>
            <SelectItem value="upcoming">Upcoming</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>

        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[130px] h-9">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="online">Online</SelectItem>
            <SelectItem value="in-person">In Person</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={(v) => setSortBy(v as 'soonest' | 'latest')}>
          <SelectTrigger className="w-[130px] h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="soonest">Soonest</SelectItem>
            <SelectItem value="latest">Latest</SelectItem>
          </SelectContent>
        </Select>

        {hasFilters && (
          <button
            onClick={() => { setSearch(''); setStatusFilter('upcoming'); setTypeFilter('all') }}
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
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date & Time</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Student</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Subjects</th>
                <th className="px-5 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-5 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((session) => {
                const cfg = statusDisplay[session.status] ?? statusDisplay.scheduled
                const subjectNames = session.subjects
                  ?.map((id) => subjectMap[id] ?? id)
                  .join(', ')

                return (
                  <tr key={session.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-5 py-3.5">
                      {session.confirmed_start ? (
                        <div>
                          <p className="text-sm font-medium text-[#1e293b]">
                            {new Date(session.confirmed_start).toLocaleDateString(undefined, {
                              weekday: 'short', month: 'short', day: 'numeric',
                            })}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {new Date(session.confirmed_start).toLocaleTimeString(undefined, {
                              hour: 'numeric', minute: '2-digit',
                            })}
                            {session.confirmed_end && (
                              <span>
                                {' – '}
                                {new Date(session.confirmed_end).toLocaleTimeString(undefined, {
                                  hour: 'numeric', minute: '2-digit',
                                })}
                              </span>
                            )}
                          </p>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400 italic">TBD</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="text-sm font-medium text-[#1e293b]">
                        {session.customers?.full_name ?? 'Unknown'}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {session.customers?.email}
                      </p>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-sm text-gray-600">
                        {subjectNames || '—'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                        {session.session_type === 'online' ? (
                          <><Video className="h-3.5 w-3.5" /> Online</>
                        ) : (
                          <><MapPin className="h-3.5 w-3.5" /> In Person</>
                        )}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <span className={`inline-flex px-2.5 py-0.5 text-xs font-semibold rounded-full ${cfg.class}`}>
                        {cfg.label}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      {session.meet_url && session.session_type === 'online' &&
                       session.status === 'scheduled' && session.confirmed_start && session.confirmed_end && (
                        <JoinClassButton
                          meetUrl={session.meet_url}
                          sessionStart={session.confirmed_start}
                          sessionEnd={session.confirmed_end}
                        />
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-dashed border-gray-200 py-16 text-center">
          <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          {hasFilters ? (
            <>
              <p className="text-gray-500 font-medium">No matching sessions</p>
              <p className="text-sm text-gray-400 mt-1">Try adjusting your filters</p>
            </>
          ) : (
            <>
              <p className="text-gray-500 font-medium">No sessions yet</p>
              <p className="text-sm text-gray-400 mt-1">Sessions will appear here once assigned</p>
            </>
          )}
        </div>
      )}

      <p className="text-xs text-gray-400 text-right">
        Showing {filtered.length} of {sessions.length} sessions
      </p>
    </>
  )
}
