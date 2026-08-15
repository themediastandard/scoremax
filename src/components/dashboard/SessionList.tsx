"use client"

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { ChevronDown, ChevronRight, Calendar, User, Video, MapPin, BookOpen, Search, X, GraduationCap } from 'lucide-react'
import { SessionForm } from './SessionForm'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { JoinClassButton } from './JoinClassButton'
import { AdminBookingDeliveryStatus, type AdminBookingDelivery } from './AdminBookingDeliveryStatus'
import { formatBusinessDate, formatBusinessTime } from '@/lib/business-datetime'

interface Session {
  id: string
  order_id: string
  customer_id: string
  student_id: string | null
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
  student: { id: string; full_name: string; email: string; grade: string } | null
  // Joined through sessions.order_id -> booking_requests.id so the admin can
  // see what the customer actually asked for while picking the time. Read
  // through the FK rather than copied onto sessions: a copy would drift, and
  // nothing here wants a frozen snapshot. Absent on the customer and tutor
  // views, which do not select it.
  booking_requests?: {
    available_windows?: unknown
    available_days?: string[] | null
    available_time_start?: string | null
    available_time_end?: string | null
    timezone?: string | null
  } | null
  admin_session_booking_delivery?: AdminBookingDelivery | null
}

interface CustomerGroup {
  customerId: string
  customerName: string
  customerEmail: string
  sessions: Session[]
}

interface ActiveStudent {
  id: string
  customer_id: string
  full_name: string
  email: string
  grade: string
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
  activeStudents,
}: {
  session: Session
  tutors: { id: string; full_name: string }[]
  subjectMap: Map<string, string>
  isAdmin: boolean
  activeStudents: ActiveStudent[]
}) {
  const [expanded, setExpanded] = useState(false)
  const cfg = statusConfig[session.status] || statusConfig.pending_scheduling

  return (
    <div className="rounded-lg border border-gray-100 bg-white overflow-hidden">
      {/* Stacks below sm — the badge, subjects, date, and tutor don't fit one
          phone-width row. */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-4 text-left flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 hover:bg-gray-50/60 cursor-pointer"
      >
        <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
          <Badge variant="secondary" className={cfg.className}>
            {cfg.label}
          </Badge>
          {isAdmin && session.admin_session_booking_delivery?.status === 'attention' && (
            <Badge variant="secondary" className="bg-amber-100 text-amber-800">
              Setup attention
            </Badge>
          )}
          <div className="flex items-center gap-3 text-sm text-gray-600 min-w-0">
            <span className={`flex shrink-0 items-center gap-1.5 font-medium ${session.student ? 'text-[#1e293b]' : 'text-amber-700'}`}>
              <GraduationCap className="h-3.5 w-3.5" aria-hidden="true" />
              {session.student?.full_name ?? 'Student not assigned'}
            </span>
            {session.subjects?.length > 0 && (
              <span className="truncate">
                {session.subjects.map((id) => subjectMap.get(id) || id).join(', ')}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center flex-wrap gap-x-4 gap-y-1 sm:shrink-0 pl-0.5">
          {session.confirmed_start && (
            <span className="flex items-center gap-1.5 text-sm text-gray-500">
              <Calendar className="h-3.5 w-3.5" />
              {formatBusinessDate(session.confirmed_start, {
                month: 'short',
                day: 'numeric',
              })}
              {', '}
              {formatBusinessTime(session.confirmed_start)}
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
          {isAdmin && session.admin_session_booking_delivery && (
            <div className="mb-4">
              <AdminBookingDeliveryStatus
                sessionId={session.id}
                delivery={session.admin_session_booking_delivery}
              />
            </div>
          )}
          {isAdmin ? (
            <SessionForm
              session={session}
              tutors={tutors}
              students={activeStudents}
              requestedAvailability={session.booking_requests ?? null}
            />
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
          <GraduationCap className="h-4 w-4 text-[#4a729f] mt-0.5 shrink-0" />
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Student</p>
            <p className={`text-sm font-medium mt-0.5 ${session.student ? 'text-[#1e293b]' : 'text-amber-700'}`}>
              {session.student?.full_name ?? 'Student not assigned'}
            </p>
            {session.student && <p className="text-xs text-gray-500">{session.student.grade}</p>}
          </div>
        </div>
        <div className="flex gap-3">
          <BookOpen className="h-4 w-4 text-[#4a729f] mt-0.5 shrink-0" />
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Subjects</p>
            <p className="text-sm font-medium text-[#1e293b] mt-0.5">{subjectNames || 'None'}</p>
          </div>
        </div>
        <div className="flex gap-3">
          {session.session_type === 'online' ? (
            <Video className="h-4 w-4 text-[#4a729f] mt-0.5 shrink-0" />
          ) : (
            <MapPin className="h-4 w-4 text-[#4a729f] mt-0.5 shrink-0" />
          )}
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Location</p>
            <p className="text-sm font-medium text-[#1e293b] mt-0.5 capitalize">
              {session.session_type === 'in-person' ? 'Sawgrass, FL' : 'Online'}
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <User className="h-4 w-4 text-[#4a729f] mt-0.5 shrink-0" />
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Tutor</p>
            <p className="text-sm font-medium text-[#1e293b] mt-0.5">
              {session.tutors?.full_name || 'Not yet assigned'}
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <Calendar className="h-4 w-4 text-[#4a729f] mt-0.5 shrink-0" />
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</p>
            {session.confirmed_start ? (
              <p className="text-sm font-medium text-[#1e293b] mt-0.5">
                {formatBusinessDate(session.confirmed_start, {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                })}
                {', '}
                {formatBusinessTime(session.confirmed_start)}
                {session.confirmed_end && (
                  <span className="text-gray-500">
                    {' – '}
                    {formatBusinessTime(session.confirmed_end)}
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
  activeStudents,
  subjectMap,
}: {
  sessions: Session[]
  tutors: { id: string; full_name: string }[]
  activeStudents: ActiveStudent[]
  subjectMap: Record<string, string>
}) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('active')
  const [tutorFilter, setTutorFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [studentFilter, setStudentFilter] = useState('all')

  const sMap = useMemo(() => new Map(Object.entries(subjectMap)), [subjectMap])
  const studentsByCustomer = useMemo(() => {
    const byCustomer = new Map<string, ActiveStudent[]>()
    for (const student of activeStudents) {
      const current = byCustomer.get(student.customer_id) ?? []
      current.push(student)
      byCustomer.set(student.customer_id, current)
    }
    return byCustomer
  }, [activeStudents])
  const studentOptions = useMemo(() => {
    const byId = new Map<string, string>()
    for (const session of sessions) {
      if (session.student) byId.set(session.student.id, session.student.full_name)
    }
    return Array.from(byId, ([id, name]) => ({ id, name })).sort((a, b) => a.name.localeCompare(b.name))
  }, [sessions])
  const hasUnassigned = sessions.some((session) => !session.student)

  const { groups, filteredCount } = useMemo(() => {
    let result = [...sessions]

    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter((s) => {
        const name = s.customers?.full_name?.toLowerCase() ?? ''
        const email = s.customers?.email?.toLowerCase() ?? ''
        const studentName = s.student?.full_name?.toLowerCase() ?? ''
        const studentEmail = s.student?.email?.toLowerCase() ?? ''
        return name.includes(q) || email.includes(q) || studentName.includes(q) || studentEmail.includes(q)
      })
    }

    if (studentFilter !== 'all') {
      result = result.filter((session) => studentFilter === 'unassigned'
        ? !session.student
        : session.student?.id === studentFilter)
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
  }, [sessions, search, statusFilter, tutorFilter, typeFilter, studentFilter])

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

  const hasFilters = search || statusFilter !== 'active' || tutorFilter !== 'all' || typeFilter !== 'all' || studentFilter !== 'all'

  return (
    <>
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search owner or student..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9"
          />
        </div>

        <Select value={studentFilter} onValueChange={setStudentFilter}>
          <SelectTrigger className="w-[170px] h-9">
            <SelectValue placeholder="Student" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Students</SelectItem>
            {studentOptions.map((student) => (
              <SelectItem key={student.id} value={student.id}>{student.name}</SelectItem>
            ))}
            {hasUnassigned && <SelectItem value="unassigned">Student not assigned</SelectItem>}
          </SelectContent>
        </Select>

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
            onClick={() => { setSearch(''); setStatusFilter('active'); setTutorFilter('all'); setTypeFilter('all'); setStudentFilter('all') }}
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
                          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Account Owner</p>
                          <p className="text-sm font-semibold text-[#1e293b]">{group.customerName}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{group.customerEmail}</p>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-1.5 shrink-0">
                        {nextSession && (
                          <span className="flex items-center gap-1.5 text-sm font-medium text-[#1e293b]">
                            <Calendar className="h-3.5 w-3.5 text-gray-400" />
                            Next: {formatBusinessDate(nextSession.confirmed_start!, {
                              month: 'short', day: 'numeric',
                            })}, {formatBusinessTime(nextSession.confirmed_start!)}
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
                        activeStudents={studentsByCustomer.get(s.customer_id) ?? []}
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
  const [studentFilter, setStudentFilter] = useState('all')
  const studentOptions = useMemo(() => {
    const byId = new Map<string, string>()
    for (const session of sessions) {
      if (session.student) byId.set(session.student.id, session.student.full_name)
    }
    return Array.from(byId, ([id, name]) => ({ id, name })).sort((a, b) => a.name.localeCompare(b.name))
  }, [sessions])
  const hasUnassigned = sessions.some((session) => !session.student)
  const filteredSessions = studentFilter === 'all'
    ? sessions
    : sessions.filter((session) => studentFilter === 'unassigned'
      ? !session.student
      : session.student?.id === studentFilter)

  if (sessions.length === 0) {
    return (
      <div className="bg-white rounded-xl border-2 border-dashed border-gray-200 py-14 px-6 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#517cad]/10">
          <Calendar className="h-7 w-7 text-[#4a729f]" aria-hidden="true" />
        </div>
        <p className="font-semibold text-[#1e293b]">No upcoming sessions</p>
        <p className="text-sm text-gray-500 mt-1 mx-auto max-w-sm">
          When you book tutoring, your sessions and meeting links will appear here.
        </p>
        {!isAdmin && (
          <Link
            href="/book"
            className="mt-6 inline-flex items-center justify-center bg-[#b08a30] hover:bg-[#9a7628] text-white px-6 py-2.5 rounded-md text-sm font-medium transition-colors"
          >
            Book a Session
          </Link>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {(studentOptions.length > 1 || hasUnassigned) && (
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-medium text-gray-600">Filter by student</p>
          <Select value={studentFilter} onValueChange={setStudentFilter}>
            <SelectTrigger className="w-[190px]">
              <SelectValue placeholder="Student" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Students</SelectItem>
              {studentOptions.map((student) => (
                <SelectItem key={student.id} value={student.id}>{student.name}</SelectItem>
              ))}
              {hasUnassigned && <SelectItem value="unassigned">Student not assigned</SelectItem>}
            </SelectContent>
          </Select>
        </div>
      )}
      {filteredSessions.length > 0 ? (
        <div className="space-y-3">
          {filteredSessions.map((s) => (
            <SessionCard
              key={s.id}
              session={s}
              tutors={tutors}
              activeStudents={[]}
              subjectMap={subjectMap}
              isAdmin={isAdmin}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border-2 border-dashed border-gray-200 bg-white px-6 py-10 text-center">
          <p className="font-semibold text-[#1e293b]">No sessions for this student</p>
          <p className="mt-1 text-sm text-gray-500">Choose another student or book a new session.</p>
        </div>
      )}
    </div>
  )
}
