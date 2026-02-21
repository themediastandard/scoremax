"use client"

import { useState } from 'react'
import { ChevronDown, ChevronRight, Clock, Calendar, User, Video, MapPin, CheckCircle, BookOpen } from 'lucide-react'
import { SessionForm } from './SessionForm'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
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
  groups,
  tutors,
  subjectMap,
}: {
  groups: CustomerGroup[]
  tutors: { id: string; full_name: string }[]
  subjectMap: Map<string, string>
}) {
  const [expandedCustomers, setExpandedCustomers] = useState<Set<string>>(new Set())

  const toggleCustomer = (id: string) => {
    setExpandedCustomers((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  if (groups.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">No sessions found.</div>
    )
  }

  return (
    <div className="space-y-4">
      {groups.map((group) => {
        const isOpen = expandedCustomers.has(group.customerId)
        const pending = group.sessions.filter((s) => s.status === 'pending_scheduling').length
        const scheduled = group.sessions.filter((s) => s.status === 'scheduled').length
        const completed = group.sessions.filter((s) => s.status === 'completed').length

        return (
          <Card key={group.customerId} className="border-gray-100 shadow-sm overflow-hidden">
            <button
              onClick={() => toggleCustomer(group.customerId)}
              className="w-full text-left"
            >
              <CardHeader className="hover:bg-gray-50/60 transition-colors cursor-pointer py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {isOpen ? (
                      <ChevronDown className="h-5 w-5 text-gray-400" />
                    ) : (
                      <ChevronRight className="h-5 w-5 text-gray-400" />
                    )}
                    <div>
                      <CardTitle className="text-base">{group.customerName}</CardTitle>
                      <p className="text-sm text-gray-500 font-normal">{group.customerEmail}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-600 font-medium">
                      {group.sessions.length} session{group.sessions.length !== 1 ? 's' : ''}
                    </span>
                    <div className="flex gap-1.5">
                      {pending > 0 && (
                        <Badge variant="secondary" className="bg-amber-100 text-amber-700">
                          <Clock className="h-3 w-3 mr-1" />
                          {pending}
                        </Badge>
                      )}
                      {scheduled > 0 && (
                        <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                          <Calendar className="h-3 w-3 mr-1" />
                          {scheduled}
                        </Badge>
                      )}
                      {completed > 0 && (
                        <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          {completed}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>
            </button>
            {isOpen && (
              <CardContent className="pt-0 pb-4 space-y-2">
                {group.sessions.map((s) => (
                  <SessionCard
                    key={s.id}
                    session={s}
                    tutors={tutors}
                    subjectMap={subjectMap}
                    isAdmin={true}
                  />
                ))}
              </CardContent>
            )}
          </Card>
        )
      })}
    </div>
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
