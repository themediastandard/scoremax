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
  created_at: string
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
  dateGrouped = false,
}: {
  session: Session
  tutors: { id: string; full_name: string }[]
  subjectMap: Map<string, string>
  isAdmin: boolean
  activeStudents: ActiveStudent[]
  dateGrouped?: boolean
}) {
  const [expanded, setExpanded] = useState(false)
  const cfg = statusConfig[session.status] || statusConfig.pending_scheduling

  return (
    <div className="rounded-lg border border-gray-100 bg-white overflow-hidden">
      {/* Stacks below sm — the badge, subjects, date, and tutor don't fit one
          phone-width row. */}
      <button
        onClick={() => setExpanded(!expanded)}
        aria-expanded={expanded}
        className="w-full cursor-pointer p-4 text-left hover:bg-gray-50/60"
      >
        {isAdmin ? (
          <div className="grid w-full gap-3 md:grid-cols-[8.75rem_minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,.85fr)_auto] md:items-center">
            <div className="min-w-0">
              {session.status === 'pending_scheduling' ? (
                <>
                  <p className="text-sm font-semibold text-amber-700">Needs a date</p>
                  <p className="mt-0.5 text-xs text-gray-400">
                    Waiting since {formatBusinessDate(session.created_at, { month: 'short', day: 'numeric' })}
                  </p>
                </>
              ) : session.confirmed_start ? (
                <>
                  <p className="text-base font-semibold text-[#1e293b]">{formatBusinessTime(session.confirmed_start)}</p>
                  {session.confirmed_end && (
                    <p className="mt-0.5 text-xs text-gray-400">Until {formatBusinessTime(session.confirmed_end)}</p>
                  )}
                </>
              ) : (
                <p className="text-sm font-medium text-amber-700">Time not set</p>
              )}
            </div>

            <div className="min-w-0">
              <p className={`flex items-center gap-1.5 truncate text-sm font-semibold ${session.student ? 'text-[#1e293b]' : 'text-amber-700'}`}>
                <GraduationCap className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                {session.student?.full_name ?? 'Student not assigned'}
              </p>
              <p className="mt-0.5 truncate text-xs text-gray-500">
                Owner: {session.customers?.full_name || 'Unknown customer'}
              </p>
            </div>

            <div className="min-w-0 space-y-1">
              <p className="flex items-center gap-1.5 truncate text-sm text-gray-600">
                <BookOpen className="h-3.5 w-3.5 shrink-0 text-gray-400" aria-hidden="true" />
                {session.subjects?.length > 0
                  ? session.subjects.map((id) => subjectMap.get(id) || id).join(', ')
                  : 'No subject'}
              </p>
              <p className="flex items-center gap-1.5 text-xs capitalize text-gray-400">
                {session.session_type === 'online'
                  ? <Video className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  : <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />}
                {session.session_type === 'in-person' ? 'In Person' : session.session_type}
              </p>
            </div>

            <p className={`flex items-center gap-1.5 truncate text-sm ${session.tutors?.full_name ? 'text-gray-600' : 'font-medium text-amber-700'}`}>
              <User className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              {session.tutors?.full_name || 'Tutor not assigned'}
            </p>

            <div className="flex items-center justify-end gap-2">
              {session.admin_session_booking_delivery?.status === 'attention' && (
                <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                  Setup attention
                </Badge>
              )}
              <Badge variant="secondary" className={cfg.className}>
                {cfg.label}
              </Badge>
              {expanded
                ? <ChevronDown className="h-4 w-4 shrink-0 text-gray-400" />
                : <ChevronRight className="h-4 w-4 shrink-0 text-gray-400" />}
            </div>
          </div>
        ) : dateGrouped ? (
          <div className="grid w-full gap-3 sm:grid-cols-[7.5rem_minmax(0,1.2fr)_minmax(0,1fr)_auto] sm:items-center">
            <div className="min-w-0">
              {session.confirmed_start ? (
                <>
                  <p className="text-base font-semibold text-[#1e293b]">{formatBusinessTime(session.confirmed_start)}</p>
                  {session.confirmed_end && (
                    <p className="mt-0.5 text-xs text-gray-500">Until {formatBusinessTime(session.confirmed_end)}</p>
                  )}
                </>
              ) : (
                <p className="text-sm font-medium text-amber-700">Time not set</p>
              )}
            </div>

            <div className="min-w-0">
              <p className={`flex items-center gap-1.5 truncate text-sm font-semibold ${session.student ? 'text-[#1e293b]' : 'text-amber-700'}`}>
                <GraduationCap className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                {session.student?.full_name ?? 'Student not assigned'}
              </p>
              {session.student && (
                <p className="mt-0.5 truncate text-xs text-gray-500">{session.student.grade}</p>
              )}
            </div>

            <div className="min-w-0 space-y-1">
              <p className="flex items-center gap-1.5 truncate text-sm text-gray-600">
                <BookOpen className="h-3.5 w-3.5 shrink-0 text-gray-400" aria-hidden="true" />
                {session.subjects?.length > 0
                  ? session.subjects.map((id) => subjectMap.get(id) || id).join(', ')
                  : 'No subject'}
              </p>
              <p className="flex items-center gap-1.5 text-xs capitalize text-gray-500">
                {session.session_type === 'online'
                  ? <Video className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  : <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />}
                {session.session_type === 'in-person' ? 'In Person' : session.session_type}
              </p>
            </div>

            <div className="flex items-center justify-end gap-2">
              <Badge variant="secondary" className={cfg.className}>
                {cfg.label}
              </Badge>
              {expanded
                ? <ChevronDown className="h-4 w-4 shrink-0 text-gray-400" aria-hidden="true" />
                : <ChevronRight className="h-4 w-4 shrink-0 text-gray-400" aria-hidden="true" />}
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
            <div className="flex min-w-0 flex-1 items-center gap-3 sm:gap-4">
              <Badge variant="secondary" className={cfg.className}>
                {cfg.label}
              </Badge>
              <div className="flex min-w-0 items-center gap-3 text-sm text-gray-600">
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
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pl-0.5 sm:shrink-0">
              {session.confirmed_start && (
                <span className="flex items-center gap-1.5 text-sm text-gray-500">
                  <Calendar className="h-3.5 w-3.5" />
                  {formatBusinessDate(session.confirmed_start, { month: 'short', day: 'numeric' })}
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
                {session.session_type === 'online'
                  ? <Video className="h-3.5 w-3.5" />
                  : <MapPin className="h-3.5 w-3.5" />}
              </span>
              {expanded
                ? <ChevronDown className="h-4 w-4 text-gray-400" />
                : <ChevronRight className="h-4 w-4 text-gray-400" />}
            </div>
          </div>
        )}
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

type SessionDateGroup = {
  key: string
  label: string
  sessions: Session[]
}

function timestamp(value: string | null | undefined, fallback: number): number {
  const parsed = value ? new Date(value).getTime() : Number.NaN
  return Number.isNaN(parsed) ? fallback : parsed
}

function groupSessionsByBusinessDate(sessions: Session[]): SessionDateGroup[] {
  const groups = new Map<string, SessionDateGroup>()

  for (const session of sessions) {
    const dateKey = formatBusinessDate(session.confirmed_start, {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
    const key = dateKey?.replaceAll('/', '-') ?? `date-not-set-${session.id}`
    const label = formatBusinessDate(session.confirmed_start, {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    }) ?? 'Date not set'
    const existing = groups.get(key)

    if (existing) existing.sessions.push(session)
    else groups.set(key, { key, label, sessions: [session] })
  }

  return Array.from(groups.values())
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

  const filteredSessions = useMemo(() => {
    let result = [...sessions]

    if (search.trim()) {
      const query = search.toLowerCase()
      result = result.filter((session) => {
        const ownerName = session.customers?.full_name?.toLowerCase() ?? ''
        const ownerEmail = session.customers?.email?.toLowerCase() ?? ''
        const studentName = session.student?.full_name?.toLowerCase() ?? ''
        const studentEmail = session.student?.email?.toLowerCase() ?? ''
        return ownerName.includes(query) || ownerEmail.includes(query) || studentName.includes(query) || studentEmail.includes(query)
      })
    }

    if (studentFilter !== 'all') {
      result = result.filter((session) => studentFilter === 'unassigned'
        ? !session.student
        : session.student?.id === studentFilter)
    }

    if (statusFilter === 'active') {
      result = result.filter((session) => session.status === 'pending_scheduling' || session.status === 'scheduled')
    } else if (statusFilter !== 'all') {
      result = result.filter((session) => session.status === statusFilter)
    }

    if (tutorFilter !== 'all') {
      result = result.filter((session) => tutorFilter === 'unassigned'
        ? !session.assigned_tutor_id
        : session.assigned_tutor_id === tutorFilter)
    }

    return result
  }, [sessions, search, statusFilter, tutorFilter, studentFilter])

  const { needsScheduling, upcoming, completed } = useMemo(() => ({
    needsScheduling: filteredSessions
      .filter((session) => session.status === 'pending_scheduling')
      .sort((a, b) => timestamp(a.created_at, Number.MAX_SAFE_INTEGER) - timestamp(b.created_at, Number.MAX_SAFE_INTEGER)),
    upcoming: filteredSessions
      .filter((session) => session.status === 'scheduled')
      .sort((a, b) => timestamp(a.confirmed_start, Number.MAX_SAFE_INTEGER) - timestamp(b.confirmed_start, Number.MAX_SAFE_INTEGER)),
    completed: filteredSessions
      .filter((session) => session.status === 'completed')
      .sort((a, b) => timestamp(b.confirmed_start, Number.MIN_SAFE_INTEGER) - timestamp(a.confirmed_start, Number.MIN_SAFE_INTEGER)),
  }), [filteredSessions])

  const upcomingDateGroups = useMemo(() => groupSessionsByBusinessDate(upcoming), [upcoming])
  const completedDateGroups = useMemo(() => groupSessionsByBusinessDate(completed), [completed])
  const hasFilters = Boolean(search) || statusFilter !== 'active' || tutorFilter !== 'all' || studentFilter !== 'all'
  const showNeedsScheduling = statusFilter === 'active' || statusFilter === 'all' || statusFilter === 'pending_scheduling'
  const showUpcoming = statusFilter === 'active' || statusFilter === 'all' || statusFilter === 'scheduled'
  const showCompleted = statusFilter === 'all' || statusFilter === 'completed'

  const renderSession = (session: Session) => (
    <SessionCard
      key={session.id}
      session={session}
      tutors={tutors}
      activeStudents={studentsByCustomer.get(session.customer_id) ?? []}
      subjectMap={sMap}
      isAdmin={true}
    />
  )

  const renderDateGroups = (groups: SessionDateGroup[]) => (
    <div className="space-y-6">
      {groups.map((group) => (
        <section key={group.key} aria-labelledby={`session-date-${group.key}`} className="space-y-2.5">
          <div className="flex items-center justify-between gap-4 border-b border-gray-200 pb-2">
            <h3 id={`session-date-${group.key}`} className="flex items-center gap-2 text-sm font-semibold text-[#1e293b]">
              <Calendar className="h-4 w-4 text-[#4a729f]" aria-hidden="true" />
              {group.label}
            </h3>
            <span className="text-xs font-medium text-gray-400">
              {group.sessions.length} {group.sessions.length === 1 ? 'session' : 'sessions'}
            </span>
          </div>
          <div className="space-y-2">{group.sessions.map(renderSession)}</div>
        </section>
      ))}
    </div>
  )

  return (
    <>
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[200px] max-w-xs flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search owner or student..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="h-9 pl-9"
          />
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="h-9 w-[170px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Active Sessions</SelectItem>
            <SelectItem value="pending_scheduling">Needs Scheduling</SelectItem>
            <SelectItem value="scheduled">Upcoming</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="all">All Sessions</SelectItem>
          </SelectContent>
        </Select>

        <Select value={studentFilter} onValueChange={setStudentFilter}>
          <SelectTrigger className="h-9 w-[170px]">
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

        <Select value={tutorFilter} onValueChange={setTutorFilter}>
          <SelectTrigger className="h-9 w-[150px]">
            <SelectValue placeholder="Tutor" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Tutors</SelectItem>
            <SelectItem value="unassigned">Unassigned</SelectItem>
            {tutors.map((tutor) => (
              <SelectItem key={tutor.id} value={tutor.id}>{tutor.full_name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {hasFilters && (
          <button
            type="button"
            onClick={() => {
              setSearch('')
              setStatusFilter('active')
              setTutorFilter('all')
              setStudentFilter('all')
            }}
            className="flex items-center gap-1 text-xs text-gray-500 transition-colors hover:text-gray-700"
          >
            <X className="h-3 w-3" />
            Clear
          </button>
        )}
      </div>

      <div className="space-y-10">
        {showNeedsScheduling && (
          <section aria-labelledby="needs-scheduling-heading" className="space-y-3">
            <div className="flex items-end justify-between gap-4">
              <div>
                <h2 id="needs-scheduling-heading" className="text-xl font-serif font-bold text-[#1e293b]">Needs Scheduling</h2>
                <p className="mt-0.5 text-sm text-gray-500">Oldest requests first</p>
              </div>
              <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-800">
                {needsScheduling.length}
              </span>
            </div>
            {needsScheduling.length > 0 ? (
              <div className="space-y-2">{needsScheduling.map(renderSession)}</div>
            ) : (
              <div className="rounded-lg border border-dashed border-gray-200 bg-white py-8 text-center">
                <p className="text-sm font-medium text-gray-500">No sessions need scheduling</p>
                <p className="mt-1 text-xs text-gray-400">New unscheduled bookings will appear here.</p>
              </div>
            )}
          </section>
        )}

        {showUpcoming && (
          <section aria-labelledby="upcoming-sessions-heading" className="space-y-4">
            <div className="flex items-end justify-between gap-4">
              <div>
                <h2 id="upcoming-sessions-heading" className="text-xl font-serif font-bold text-[#1e293b]">Upcoming Sessions</h2>
                <p className="mt-0.5 text-sm text-gray-500">Soonest dates first</p>
              </div>
              <span className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-800">
                {upcoming.length}
              </span>
            </div>
            {upcomingDateGroups.length > 0 ? renderDateGroups(upcomingDateGroups) : (
              <div className="rounded-lg border border-dashed border-gray-200 bg-white py-8 text-center">
                <p className="text-sm font-medium text-gray-500">No upcoming sessions</p>
                <p className="mt-1 text-xs text-gray-400">Scheduled sessions will appear here by date.</p>
              </div>
            )}
          </section>
        )}

        {showCompleted && (
          <section aria-labelledby="completed-sessions-heading" className="space-y-4">
            <div className="flex items-end justify-between gap-4">
              <div>
                <h2 id="completed-sessions-heading" className="text-xl font-serif font-bold text-[#1e293b]">Completed Sessions</h2>
                <p className="mt-0.5 text-sm text-gray-500">Most recently completed first</p>
              </div>
              <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-800">
                {completed.length}
              </span>
            </div>
            {completedDateGroups.length > 0 ? renderDateGroups(completedDateGroups) : (
              <div className="rounded-lg border border-dashed border-gray-200 bg-white py-8 text-center">
                <p className="text-sm font-medium text-gray-500">No completed sessions</p>
                <p className="mt-1 text-xs text-gray-400">Completed sessions will appear here by date.</p>
              </div>
            )}
          </section>
        )}
      </div>

      <p className="text-right text-xs text-gray-400">
        Showing {filteredSessions.length} of {sessions.length} sessions
      </p>
    </>
  )
}

export function TutorSessionList({
  sessions,
  subjectMap,
}: {
  sessions: Session[]
  subjectMap: Record<string, string>
}) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [studentFilter, setStudentFilter] = useState('all')
  const sMap = useMemo(() => new Map(Object.entries(subjectMap)), [subjectMap])
  const studentOptions = useMemo(() => {
    const byId = new Map<string, string>()
    for (const session of sessions) {
      if (session.student) byId.set(session.student.id, session.student.full_name)
    }
    return Array.from(byId, ([id, name]) => ({ id, name })).sort((a, b) => a.name.localeCompare(b.name))
  }, [sessions])

  const filteredSessions = useMemo(() => {
    let result = [...sessions]

    if (search.trim()) {
      const query = search.trim().toLowerCase()
      result = result.filter((session) => {
        const studentName = session.student?.full_name?.toLowerCase() ?? ''
        const studentEmail = session.student?.email?.toLowerCase() ?? ''
        const ownerName = session.customers?.full_name?.toLowerCase() ?? ''
        const subjects = session.subjects
          ?.map((id) => subjectMap[id]?.toLowerCase() ?? id.toLowerCase())
          .join(' ') ?? ''
        return studentName.includes(query) || studentEmail.includes(query) || ownerName.includes(query) || subjects.includes(query)
      })
    }

    if (statusFilter !== 'all') {
      result = result.filter((session) => session.status === statusFilter)
    }

    if (studentFilter !== 'all') {
      result = result.filter((session) => session.student?.id === studentFilter)
    }

    return result
  }, [sessions, search, statusFilter, studentFilter, subjectMap])

  const { upcoming, completed } = useMemo(() => ({
    upcoming: filteredSessions
      .filter((session) => session.status === 'scheduled')
      .sort((a, b) => timestamp(a.confirmed_start, Number.MAX_SAFE_INTEGER) - timestamp(b.confirmed_start, Number.MAX_SAFE_INTEGER)),
    completed: filteredSessions
      .filter((session) => session.status === 'completed')
      .sort((a, b) => timestamp(b.confirmed_start, Number.MIN_SAFE_INTEGER) - timestamp(a.confirmed_start, Number.MIN_SAFE_INTEGER)),
  }), [filteredSessions])

  const upcomingDateGroups = useMemo(() => groupSessionsByBusinessDate(upcoming), [upcoming])
  const completedDateGroups = useMemo(() => groupSessionsByBusinessDate(completed), [completed])
  const showUpcoming = statusFilter === 'all' || statusFilter === 'scheduled'
  const showCompleted = statusFilter === 'all' || statusFilter === 'completed'
  const hasFilters = Boolean(search) || statusFilter !== 'all' || studentFilter !== 'all'

  const renderSession = (session: Session) => (
    <SessionCard
      key={session.id}
      session={session}
      tutors={[]}
      activeStudents={[]}
      subjectMap={sMap}
      isAdmin={false}
      dateGrouped={true}
    />
  )

  const renderDateGroups = (groups: SessionDateGroup[], section: 'upcoming' | 'completed') => (
    <div className="space-y-6">
      {groups.map((group) => {
        const headingId = `tutor-${section}-session-date-${group.key}`
        return (
          <section key={group.key} aria-labelledby={headingId} className="space-y-2.5">
            <div className="flex items-center justify-between gap-4 border-b border-gray-200 pb-2">
              <h3 id={headingId} className="flex items-center gap-2 text-sm font-semibold text-[#1e293b]">
                <Calendar className="h-4 w-4 text-[#4a729f]" aria-hidden="true" />
                {group.label}
              </h3>
              <span className="text-xs font-medium text-gray-500">
                {group.sessions.length} {group.sessions.length === 1 ? 'session' : 'sessions'}
              </span>
            </div>
            <div className="space-y-2">{group.sessions.map(renderSession)}</div>
          </section>
        )
      })}
    </div>
  )

  return (
    <>
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[200px] max-w-xs flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" aria-hidden="true" />
          <Input
            aria-label="Search tutor sessions"
            placeholder="Search student or subject..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="h-9 pl-9"
          />
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger aria-label="Filter tutor sessions by status" className="h-9 w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sessions</SelectItem>
            <SelectItem value="scheduled">Upcoming</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>

        {studentOptions.length > 1 && (
          <Select value={studentFilter} onValueChange={setStudentFilter}>
            <SelectTrigger aria-label="Filter tutor sessions by student" className="h-9 w-[180px]">
              <SelectValue placeholder="Student" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Students</SelectItem>
              {studentOptions.map((student) => (
                <SelectItem key={student.id} value={student.id}>{student.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {hasFilters && (
          <button
            type="button"
            onClick={() => {
              setSearch('')
              setStatusFilter('all')
              setStudentFilter('all')
            }}
            className="flex items-center gap-1 text-xs text-gray-500 transition-colors hover:text-gray-700"
          >
            <X className="h-3 w-3" aria-hidden="true" />
            Clear
          </button>
        )}
      </div>

      <div className="space-y-10">
        {showUpcoming && (
          <section aria-labelledby="tutor-upcoming-sessions-heading" className="space-y-4">
            <div className="flex items-end justify-between gap-4">
              <div>
                <h2 id="tutor-upcoming-sessions-heading" className="text-xl font-serif font-bold text-[#1e293b]">Upcoming Sessions</h2>
                <p className="mt-0.5 text-sm text-gray-500">Soonest dates first</p>
              </div>
              <span className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-800">{upcoming.length}</span>
            </div>
            {upcomingDateGroups.length > 0 ? renderDateGroups(upcomingDateGroups, 'upcoming') : (
              <div className="rounded-lg border border-dashed border-gray-200 bg-white py-8 text-center">
                <p className="text-sm font-medium text-gray-500">No upcoming sessions</p>
                <p className="mt-1 text-xs text-gray-500">New assignments will appear here by date.</p>
              </div>
            )}
          </section>
        )}

        {showCompleted && (
          <section aria-labelledby="tutor-completed-sessions-heading" className="space-y-4">
            <div className="flex items-end justify-between gap-4">
              <div>
                <h2 id="tutor-completed-sessions-heading" className="text-xl font-serif font-bold text-[#1e293b]">Completed Sessions</h2>
                <p className="mt-0.5 text-sm text-gray-500">Most recently completed first</p>
              </div>
              <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-800">{completed.length}</span>
            </div>
            {completedDateGroups.length > 0 ? renderDateGroups(completedDateGroups, 'completed') : (
              <div className="rounded-lg border border-dashed border-gray-200 bg-white py-8 text-center">
                <p className="text-sm font-medium text-gray-500">No completed sessions</p>
                <p className="mt-1 text-xs text-gray-500">Completed sessions will appear here by date.</p>
              </div>
            )}
          </section>
        )}
      </div>

      <p className="text-right text-xs text-gray-500">Showing {filteredSessions.length} of {sessions.length} sessions</p>
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
