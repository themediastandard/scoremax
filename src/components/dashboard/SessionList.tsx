"use client"

import { useState, useMemo } from 'react'
import { ChevronDown, ChevronRight, Clock, Calendar, User, Video, MapPin, BookOpen, Search, X } from 'lucide-react'
import { SessionForm } from './SessionForm'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { JoinClassButton } from './JoinClassButton'

interface Session {
  id: string
  order_id: string
  customer_id: string
  assigned_tutor_id: string | null
  confirmed_start: string | null
  confirmed_end: string | null
  session_type: string
  subjects: string[]
  status: string
  meet_url: string | null
  internal_notes: string | null
  tutors: { id: string; full_name: string } | null
  customers: { full_name: string; email: string } | null
}

interface CustomerGroup {
  customerId: string
  customerName: string
  customerEmail: string
  sessions: Session[]
}

const statusConfig: Record<string, { label: string; className: string }> = {
  pending_scheduling: { label: 'Pending', className: 'bg-amber-100 text-amber-700' },
  scheduled: { label: 'Scheduled', className: 'bg-blue-100 text-blue-700' },
  completed: { label: 'Completed', className: 'bg-emerald-100 text-emerald-700' },
  cancelled: { label: 'Cancelled', className: 'bg-red-100 text-red-700' },
}

function SessionCard({
  session,
  tutors,
  subjectMap,
  isAdmin,
}: {
  session: Session
  tutors: { id: string; full_name: string }[]
  subjectMap: Map<string, string>
  isAdmin: boolean
}) {
  const [expanded, setExpanded] = useState(false)
  const cfg = statusConfig[session.status] || statusConfig.pending_scheduling

  return (
    <div className="rounded-lg border border-gray-100 bg-white overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-4 text-left flex items-center justify-between gap-4 hover:bg-gray-50/60 cursor-pointer"
      >
        <div className="flex items-center gap-4 min-w-0 flex-1">
          <Badge variant="secondary" className={cfg.className}>
            {cfg.label}
          </Badge>
          <div className="flex items-center gap-3 text-sm text-gray-600 min-w-0">
            {session.subjects?.length > 0 && (
              <span className="truncate">
                {session.subjects.map((id) => subjectMap.get(id) || id).join(', ')}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-4 shrink-0">
          {session.confirmed_start && (
            <span className="flex items-center gap-1.5 text-sm text-gray-500">
              <Calendar className="h-3.5 w-3.5" />
              {new Date(session.confirmed_start).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
              })}
              {', '}
              {new Date(session.confirmed_start).toLocaleTimeString(undefined, {
                hour: 'numeric',
                minute: '2-digit',
              })}
            </span>
          )}
          {session.tutors?.full_name && (
            <span className="flex items-center gap-1.5 text-sm text-gray-500">
              <User className="h-3.5 w-3.5" />
              {session.tutors.full_name}
            </span>
          )}
          <span className="flex items-center gap-1 text-sm text-gray-400">
            {session.session_type === 'online' ? (
              <Video className="h-3.5 w-3.5" />
            ) : (
              <MapPin className="h-3.5 w-3.5" />
            )}
          </span>
          {expanded
            ? <ChevronDown className="h-4 w-4 text-gray-400" />
            : <ChevronRight className="h-4 w-4 text-gray-400" />
          }
        </div>
      </button>
      {expanded && (
        <div className="border-t border-gray-100 p-4 bg-gray-50/40">
          {isAdmin ? (
            <SessionForm session={session} tutors={tutors} />
          ) : (
            <SessionDetails session={session} subjectMap={subjectMap} />
          )}
        </div>
      )}
    </div>
  )
}

function SessionDetails({
  session,
  subjectMap,
}: {
  session: Session
  subjectMap: Map<string, string>
}) {
  const subjectNames = session.subjects
    ?.map((id) => subjectMap.get(id) || id)
    .join(', ')

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex gap-3">
          <BookOpen className="h-4 w-4 text-[#517cad] mt-0.5 shrink-0" />
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Subjects</p>
            <p className="text-sm font-medium text-[#1e293b] mt-0.5">{subjectNames || 'None'}</p>
          </div>
        </div>
        <div className="flex gap-3">
          {session.session_type === 'online' ? (
            <Video className="h-4 w-4 text-[#517cad] mt-0.5 shrink-0" />
          ) : (
            <MapPin className="h-4 w-4 text-[#517cad] mt-0.5 shrink-0" />
          )}
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Location</p>
            <p className="text-sm font-medium text-[#1e293b] mt-0.5 capitalize">
              {session.session_type === 'in-person' ? 'Sawgrass, FL' : 'Online'}
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <User className="h-4 w-4 text-[#517cad] mt-0.5 shrink-0" />
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Tutor</p>
            <p className="text-sm font-medium text-[#1e293b] mt-0.5">
              {session.tutors?.full_name || 'Not yet assigned'}
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <Calendar className="h-4 w-4 text-[#517cad] mt-0.5 shrink-0" />
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</p>
            {session.confirmed_start ? (
              <p className="text-sm font-medium text-[#1e293b] mt-0.5">
                {new Date(session.confirmed_start).toLocaleDateString(undefined, {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                })}
                {', '}
                {new Date(session.confirmed_start).toLocaleTimeString(undefined, {
                  hour: 'numeric',
                  minute: '2-digit',
                })}
                {session.confirmed_end && (
                  <span className="text-gray-500">
                    {' – '}
                    {new Date(session.confirmed_end).toLocaleTimeString(undefined, {
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                  </span>
                )}
              </p>
            ) : (
              <p className="text-sm text-gray-400 italic mt-0.5">Awaiting scheduling</p>
            )}
          </div>
        </div>
      </div>
      {session.meet_url && session.session_type === 'online' && session.confirmed_start && session.confirmed_end && (
        <div className="pt-3 border-t border-gray-100">
          <JoinClassButton
            meetUrl={session.meet_url}
            sessionStart={session.confirmed_start}
            sessionEnd={session.confirmed_end}
          />
        </div>
      )}
    </div>
  )
}

export function AdminSessionList({
  sessions,
  tutors,
  subjectMap,
}: {
  sessions: Session[]
  tutors: { id: string; full_name: string }[]
  subjectMap: Record<string, string>
}) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('active')
  const [tutorFilter, setTutorFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')

  const sMap = useMemo(() => new Map(Object.entries(subjectMap)), [subjectMap])

  const { groups, filteredCount } = useMemo(() => {
    let result = [...sessions]

    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter((s) => {
        const name = s.customers?.full_name?.toLowerCase() ?? ''
        const email = s.customers?.email?.toLowerCase() ?? ''
        return name.includes(q) || email.includes(q)
      })
    }

    if (statusFilter !== 'all') {
      if (statusFilter === 'active') {
        result = result.filter((s) => s.status !== 'completed')
      } else {
        result = result.filter((s) => s.status === statusFilter)
      }
    }

    if (tutorFilter !== 'all') {
      if (tutorFilter === 'unassigned') {
        result = result.filter((s) => !s.assigned_tutor_id)
      } else {
        result = result.filter((s) => s.assigned_tutor_id === tutorFilter)
      }
    }

    if (typeFilter !== 'all') {
      result = result.filter((s) => s.session_type === typeFilter)
    }

    const groupMap = new Map<string, CustomerGroup>()
    for (const s of result) {
      const cid = s.customer_id || 'unknown'
      if (!groupMap.has(cid)) {
        groupMap.set(cid, {
          customerId: cid,
          customerName: s.customers?.full_name || 'Unknown Customer',
          customerEmail: s.customers?.email || '',
          sessions: [],
        })
      }
      groupMap.get(cid)!.sessions.push(s)
    }

    return { groups: Array.from(groupMap.values()), filteredCount: result.length }
  }, [sessions, search, statusFilter, tutorFilter, typeFilter])

  const [expandedCustomers, setExpandedCustomers] = useState<Set<string>>(
    () => new Set(sessions.map((s) => s.customer_id))
  )

  const toggleCustomer = (id: string) => {
    setExpandedCustomers((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const hasFilters = search || statusFilter !== 'active' || tutorFilter !== 'all' || typeFilter !== 'all'

  return (
    <>
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9"
          />
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px] h-9">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active Only</SelectItem>
            <SelectItem value="pending_scheduling">Needs Scheduling</SelectItem>
            <SelectItem value="scheduled">Scheduled</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>

        <Select value={tutorFilter} onValueChange={setTutorFilter}>
          <SelectTrigger className="w-[150px] h-9">
            <SelectValue placeholder="Tutor" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Tutors</SelectItem>
            <SelectItem value="unassigned">Unassigned</SelectItem>
            {tutors.map((t) => (
              <SelectItem key={t.id} value={t.id}>{t.full_name}</SelectItem>
            ))}
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

        {hasFilters && (
          <button
            onClick={() => { setSearch(''); setStatusFilter('active'); setTutorFilter('all'); setTypeFilter('all') }}
            className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="h-3 w-3" />
            Clear
          </button>
        )}
      </div>

      {groups.length > 0 ? (
        <div className="space-y-4">
          {groups.map((group) => {
            const isOpen = expandedCustomers.has(group.customerId)
            const pending = group.sessions.filter((s) => s.status === 'pending_scheduling').length
            const needsTutor = group.sessions.filter((s) => s.status === 'scheduled' && !s.assigned_tutor_id).length
            const ready = group.sessions.filter((s) => s.status === 'scheduled' && !!s.assigned_tutor_id).length
            const completed = group.sessions.filter((s) => s.status === 'completed').length
            const hasPending = pending > 0 || needsTutor > 0

            const nextSession = group.sessions
              .filter((s) => s.status === 'scheduled' && s.confirmed_start)
              .sort((a, b) => new Date(a.confirmed_start!).getTime() - new Date(b.confirmed_start!).getTime())[0]

            const tutorNames = Array.from(new Set(
              group.sessions.map((s) => s.tutors?.full_name).filter(Boolean)
            ))

            return (
              <div
                key={group.customerId}
                className={`bg-white rounded-lg border shadow-sm overflow-hidden ${
                  hasPending ? 'border-l-amber-400 border-l-[3px] border-gray-200' : 'border-gray-200'
                }`}
              >
                <button
                  onClick={() => toggleCustomer(group.customerId)}
                  className="w-full text-left hover:bg-gray-50/60 transition-colors cursor-pointer"
                >
                  <div className="px-5 py-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 min-w-0">
                        {isOpen ? (
                          <ChevronDown className="h-5 w-5 text-gray-400 mt-0.5 shrink-0" />
                        ) : (
                          <ChevronRight className="h-5 w-5 text-gray-400 mt-0.5 shrink-0" />
                        )}
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-[#1e293b]">{group.customerName}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{group.customerEmail}</p>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-1.5 shrink-0">
                        {nextSession && (
                          <span className="flex items-center gap-1.5 text-sm font-medium text-[#1e293b]">
                            <Calendar className="h-3.5 w-3.5 text-gray-400" />
                            Next: {new Date(nextSession.confirmed_start!).toLocaleDateString(undefined, {
                              month: 'short', day: 'numeric',
                            })}, {new Date(nextSession.confirmed_start!).toLocaleTimeString(undefined, {
                              hour: 'numeric', minute: '2-digit',
                            })}
                          </span>
                        )}
                        {tutorNames.length > 0 && (
                          <span className="flex items-center gap-1.5 text-xs text-gray-400">
                            <User className="h-3 w-3" />
                            {tutorNames.join(', ')}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 mt-2.5 ml-8 text-xs">
                      {pending > 0 && (
                        <span className="flex items-center gap-1.5 font-medium text-amber-600">
                          <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                          {pending} need{pending === 1 ? 's' : ''} scheduling
                        </span>
                      )}
                      {needsTutor > 0 && (
                        <span className="flex items-center gap-1.5 font-medium text-red-500">
                          <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                          {needsTutor} need{needsTutor === 1 ? 's' : ''} tutor
                        </span>
                      )}
                      {ready > 0 && (
                        <span className="flex items-center gap-1.5 text-gray-500">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                          {ready} ready
                        </span>
                      )}
                      {completed > 0 && (
                        <span className="flex items-center gap-1.5 text-gray-400">
                          <span className="h-1.5 w-1.5 rounded-full bg-gray-300" />
                          {completed} completed
                        </span>
                      )}
                    </div>
                  </div>
                </button>
                {isOpen && (
                  <div className="border-t border-gray-100 px-5 pb-4 pt-2 space-y-2">
                    {group.sessions.map((s) => (
                      <SessionCard
                        key={s.id}
                        session={s}
                        tutors={tutors}
                        subjectMap={sMap}
                        isAdmin={true}
                      />
                    ))}
                  </div>
                )}
              </div>
            )
          })}
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
              <p className="text-sm text-gray-400 mt-1">Sessions will appear here after customers book</p>
            </>
          )}
        </div>
      )}

      <p className="text-xs text-gray-400 text-right">
        Showing {filteredCount} of {sessions.length} sessions
      </p>
    </>
  )
}

export function FlatSessionList({
  sessions,
  tutors,
  subjectMap,
  isAdmin,
}: {
  sessions: Session[]
  tutors: { id: string; full_name: string }[]
  subjectMap: Map<string, string>
  isAdmin: boolean
}) {
  if (sessions.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">No sessions found.</div>
    )
  }

  return (
    <div className="space-y-3">
      {sessions.map((s) => (
        <SessionCard
          key={s.id}
          session={s}
          tutors={tutors}
          subjectMap={subjectMap}
          isAdmin={isAdmin}
        />
      ))}
    </div>
  )
}
