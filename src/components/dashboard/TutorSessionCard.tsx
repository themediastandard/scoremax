'use client'

import Link from 'next/link'
import { useId, useState } from 'react'
import {
  BookOpen,
  Calendar,
  CalendarClock,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  MapPin,
  Video,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import type { AdminTutorSession } from '@/lib/admin-tutor-detail'
import { BUSINESS_TIME_ZONE, formatBusinessDateTime } from '@/lib/business-datetime'
import { IN_PERSON_LOCATION } from '@/lib/session-calendar'
import { isSafeHttpUrl } from '@/lib/tutor-session-groups'

const statusConfig: Record<string, { label: string; className: string }> = {
  pending_scheduling: { label: 'Pending', className: 'bg-amber-100 text-amber-700' },
  scheduled: { label: 'Scheduled', className: 'bg-blue-100 text-blue-700' },
  completed: { label: 'Completed', className: 'bg-emerald-100 text-emerald-700' },
  cancelled: { label: 'Cancelled', className: 'bg-red-100 text-red-700' },
}

function statusFor(value: string | null) {
  if (value && statusConfig[value]) return statusConfig[value]
  const label = value
    ? value.split('_').map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`).join(' ')
    : 'Unknown'
  return { label, className: 'bg-gray-100 text-gray-600' }
}

function formatEndTime(value: string | null) {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    timeZone: BUSINESS_TIME_ZONE,
    timeZoneName: 'short',
  }).format(date)
}

export function TutorSessionCard({
  session,
  subjectMap,
}: {
  session: AdminTutorSession
  subjectMap: Record<string, string>
}) {
  const [expanded, setExpanded] = useState(false)
  const id = useId()
  const toggleId = `tutor-session-toggle-${id}`
  const detailsId = `tutor-session-details-${id}`
  const status = statusFor(session.status)
  const subjectNames = (session.subjects ?? []).map((subjectId) => subjectMap[subjectId]).filter(Boolean)
  const studentName = session.student?.full_name ?? session.customers?.full_name ?? 'Student not assigned'
  const start = formatBusinessDateTime(session.confirmed_start)
  const end = formatEndTime(session.confirmed_end)
  const meetLink = session.session_type === 'online' && isSafeHttpUrl(session.meet_url)

  return (
    <article data-session-card className="overflow-hidden rounded-lg border border-gray-100 bg-white">
      <button
        id={toggleId}
        type="button"
        aria-expanded={expanded}
        aria-controls={detailsId}
        onClick={() => setExpanded((current) => !current)}
        className="flex w-full cursor-pointer flex-col gap-2 p-4 text-left hover:bg-gray-50/60 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
      >
        <div className="flex min-w-0 flex-1 items-center gap-3 sm:gap-4">
          <Badge variant="secondary" className={status.className}>{status.label}</Badge>
          <span className={`min-w-0 truncate text-sm font-medium ${session.student || session.customers ? 'text-[#1e293b]' : 'text-amber-700'}`}>
            {studentName}
          </span>
        </div>
        <div className="flex items-center gap-2 pl-0.5 text-sm sm:shrink-0">
          <span className={`flex min-w-0 items-center gap-1.5 ${start ? 'text-gray-500' : 'text-amber-700'}`}>
            <Calendar className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span className="truncate">{start ?? 'Time not set'}</span>
          </span>
          {expanded
            ? <ChevronDown className="h-4 w-4 shrink-0 text-gray-400" aria-hidden="true" />
            : <ChevronRight className="h-4 w-4 shrink-0 text-gray-400" aria-hidden="true" />}
          <span className="sr-only">{expanded ? 'Collapse session details' : 'Expand session details'}</span>
        </div>
      </button>

      <div
        id={detailsId}
        role="region"
        aria-labelledby={toggleId}
        hidden={!expanded}
        className="border-t border-gray-100 bg-gray-50/40 p-4"
      >
        <div className="border-b border-gray-200 pb-4">
          <p className="text-xs font-medium uppercase tracking-wider text-gray-400">Student contact</p>
          <p className="mt-1 text-sm text-gray-600">
            {session.student
              ? [session.student.email, session.student.grade].filter(Boolean).join(' · ')
              : session.customers
                ? `${session.customers.email} · Account owner (legacy booking)`
                : 'No student contact recorded'}
          </p>
        </div>

        <dl className="grid gap-4 py-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <dt className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-gray-400">
              <CalendarClock className="h-3.5 w-3.5" /> Date & time
            </dt>
            <dd className={`mt-1.5 text-sm ${start ? 'font-medium text-[#1e293b]' : 'text-amber-700'}`}>
              {start ?? 'Time not set'}
              {end && <span className="font-normal text-gray-500"> · Ends {end}</span>}
            </dd>
          </div>
          <div>
            <dt className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-gray-400">
              <BookOpen className="h-3.5 w-3.5" /> Subjects
            </dt>
            <dd className="mt-1.5 text-sm text-[#1e293b]">
              {subjectNames.length > 0 ? subjectNames.join(', ') : 'Subjects not recorded'}
            </dd>
          </div>
          <div>
            <dt className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-gray-400">
              {session.session_type === 'online'
                ? <Video className="h-3.5 w-3.5" />
                : <MapPin className="h-3.5 w-3.5" />}
              Session format & location
            </dt>
            <dd className="mt-1.5 text-sm text-[#1e293b]">
              {session.session_type === 'online'
                ? 'Online'
                : session.session_type === 'in-person'
                  ? IN_PERSON_LOCATION
                  : 'Session type not recorded'}
            </dd>
          </div>
        </dl>

        {(meetLink || session.order_id) && (
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-gray-200 pt-3">
            {meetLink && (
              <a
                href={session.meet_url ?? undefined}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-sm font-medium text-[#4a729f] hover:text-[#3b5c85] hover:underline"
              >
                Join Google Meet <ExternalLink className="h-3.5 w-3.5" />
              </a>
            )}
            {session.order_id && (
              <Link
                href={`/dashboard/orders/${session.order_id}`}
                className="text-sm font-medium text-[#4a729f] hover:text-[#3b5c85] hover:underline"
              >
                View order
              </Link>
            )}
          </div>
        )}
      </div>
    </article>
  )
}
