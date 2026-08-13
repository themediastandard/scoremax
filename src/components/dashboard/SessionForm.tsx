"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { CalendarClock, CheckCircle2, Loader2, TriangleAlert } from 'lucide-react'
import {
  toLocalDateValue,
  toLocalTimeValue,
  fromLocalDateTimeValues,
} from '@/lib/local-datetime'
import { RequestedAvailability } from './RequestedAvailability'

interface SessionFormProps {
  session: {
    id: string
    student_id: string | null
    assigned_tutor_id: string | null
    confirmed_start: string | null
    confirmed_end: string | null
    status: string
    internal_notes: string | null
  }
  tutors: { id: string; full_name: string }[]
  students: { id: string; full_name: string; email: string; grade: string }[]
  /**
   * The booking_requests row this session came from, joined through
   * sessions.order_id. Shown above the controls so the time below is picked
   * against what the customer said they were free for rather than blind.
   */
  requestedAvailability?: {
    available_windows?: unknown
    available_days?: string[] | null
    available_time_start?: string | null
    available_time_end?: string | null
    timezone?: string | null
  } | null
}

export function SessionForm({ session, tutors, students, requestedAvailability }: SessionFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [feedback, setFeedback] = useState<{
    tone: 'success' | 'warning' | 'error'
    message: string
  } | null>(null)

  const [tutorId, setTutorId] = useState(session.assigned_tutor_id || '')
  const [studentId, setStudentId] = useState(session.student_id || '')
  const [date, setDate] = useState(
    session.confirmed_start ? toLocalDateValue(session.confirmed_start) : ''
  )
  const [time, setTime] = useState(
    session.confirmed_start ? toLocalTimeValue(session.confirmed_start) : ''
  )
  const [duration, setDuration] = useState(() => {
    if (session.confirmed_start && session.confirmed_end) {
      const diff =
        (new Date(session.confirmed_end).getTime() -
          new Date(session.confirmed_start).getTime()) /
        60000
      return String(diff)
    }
    return '60'
  })
  const [status, setStatus] = useState(session.status)
  const [internalNotes, setInternalNotes] = useState(session.internal_notes || '')

  const [initial, setInitial] = useState(() => ({
    studentId: session.student_id || '',
    tutorId: session.assigned_tutor_id || '',
    date: session.confirmed_start ? toLocalDateValue(session.confirmed_start) : '',
    time: session.confirmed_start ? toLocalTimeValue(session.confirmed_start) : '',
    duration:
      session.confirmed_start && session.confirmed_end
        ? String(
            (new Date(session.confirmed_end).getTime() -
              new Date(session.confirmed_start).getTime()) /
              60000
          )
        : '60',
    status: session.status,
    internalNotes: session.internal_notes || '',
  }))

  const hasChanges =
    studentId !== initial.studentId ||
    tutorId !== initial.tutorId ||
    date !== initial.date ||
    time !== initial.time ||
    duration !== initial.duration ||
    status !== initial.status ||
    internalNotes !== initial.internalNotes

  const isReschedule =
    session.status === 'scheduled' &&
    status === 'scheduled' &&
    (date !== initial.date || time !== initial.time || duration !== initial.duration)
  const studentChanged = studentId !== initial.studentId
  const hasActiveStudents = students.length > 0
  const needsStudent = !studentId

  const handleReset = () => {
    setStudentId(initial.studentId)
    setTutorId(initial.tutorId)
    setDate(initial.date)
    setTime(initial.time)
    setDuration(initial.duration)
    setStatus(initial.status)
    setInternalNotes(initial.internalNotes)
    setFeedback(null)
  }

  const handleSave = async () => {
    setLoading(true)
    setFeedback(null)

    let confirmedStart = null
    let confirmedEnd = null

    const start = fromLocalDateTimeValues(date, time)
    if (start) {
      confirmedStart = start.toISOString()
      confirmedEnd = new Date(
        start.getTime() + Number(duration) * 60 * 1000
      ).toISOString()
    }

    try {
      const res = await fetch(`/api/admin/sessions/${session.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: studentId || null,
          assigned_tutor_id: tutorId || null,
          confirmed_start: confirmedStart,
          confirmed_end: confirmedEnd,
          status,
          internal_notes: internalNotes,
        }),
      })

      if (!res.ok) {
        const err = await res.json()
        setFeedback({ tone: 'error', message: err.error || 'Failed to update session' })
      } else {
        const result = await res.json()
        setInitial({ studentId, tutorId, date, time, duration, status, internalNotes })
        setFeedback(
          result.warning
            ? { tone: 'warning', message: result.warning }
            : {
                tone: 'success',
                message: isReschedule
                  ? result.reschedule?.calendar_updated === false
                    ? 'Session rescheduled. Confirmations were sent to the student and tutor. This session did not have a linked Google Calendar event.'
                    : 'Session rescheduled. Google Calendar was updated and confirmations were sent to the student and tutor.'
                  : studentChanged
                    ? result.student_assignment?.calendar_updated
                      ? 'Student assigned. The order and session now match, and Google Calendar was updated.'
                      : 'Student assigned. The order and session now match.'
                    : 'Session saved successfully.',
              }
        )
        router.refresh()
      }
    } catch (err) {
      console.error(err)
      setFeedback({ tone: 'error', message: 'Error updating session' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-5">
      <RequestedAvailability booking={requestedAvailability} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Student</Label>
          <Select value={studentId || undefined} onValueChange={setStudentId} disabled={!hasActiveStudents || loading}>
            <SelectTrigger aria-label="Student">
              <SelectValue placeholder="Student not assigned" />
            </SelectTrigger>
            <SelectContent>
              {students.map((student) => (
                <SelectItem key={student.id} value={student.id}>
                  {student.full_name} · {student.grade}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {!initial.studentId && (
            <p className="text-xs font-medium text-amber-700">
              Legacy session: student not assigned. Choose an active student before saving.
            </p>
          )}
          {!hasActiveStudents && (
            <p className="text-xs text-red-700" role="alert">
              This account has no active managed students. The account owner must add or reactivate a student first.
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Assign Tutor</Label>
          <Select value={tutorId} onValueChange={setTutorId}>
            <SelectTrigger>
              <SelectValue placeholder="Select a tutor" />
            </SelectTrigger>
            <SelectContent>
              {tutors.map((t) => (
                <SelectItem key={t.id} value={t.id}>
                  {t.full_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Date</Label>
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>

        <div className="space-y-2">
          <Label>Time</Label>
          <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
        </div>

        <div className="space-y-2">
          <Label>Duration</Label>
          <Select value={duration} onValueChange={setDuration}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="30">30 minutes</SelectItem>
              <SelectItem value="60">1 hour</SelectItem>
              <SelectItem value="90">1.5 hours</SelectItem>
              <SelectItem value="120">2 hours</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Internal Notes</Label>
        <Textarea
          value={internalNotes}
          onChange={(e) => setInternalNotes(e.target.value)}
          placeholder="Private notes for admin team..."
        />
      </div>

      {isReschedule && (
        <div className="flex gap-3 rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-900">
          <CalendarClock className="mt-0.5 h-4 w-4 shrink-0" />
          <p>
            Saving will update the linked Google Calendar event, when present, and notify the
            student and tutor. Their Meet link and the customer&apos;s credit balance will stay the
            same.
          </p>
        </div>
      )}

      {studentChanged && status === 'scheduled' && (
        <div className="flex gap-3 rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-900">
          <CalendarClock className="mt-0.5 h-4 w-4 shrink-0" />
          <p>
            Saving will replace only the student on the existing calendar invitation. The account
            owner, tutor, time, Meet link, and credit balance stay unchanged.
          </p>
        </div>
      )}

      {studentChanged && (session.status === 'completed' || session.status === 'cancelled') && (
        <div className="flex gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm text-gray-700">
          <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
          <p>This historical correction updates ScoreMax records only. No live-session notice will be sent.</p>
        </div>
      )}

      {feedback && (
        <div
          role={feedback.tone === 'error' ? 'alert' : 'status'}
          className={`flex gap-2 rounded-lg border p-3 text-sm ${
            feedback.tone === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
              : feedback.tone === 'warning'
                ? 'border-amber-200 bg-amber-50 text-amber-800'
                : 'border-red-200 bg-red-50 text-red-700'
          }`}
        >
          {feedback.tone === 'success' ? (
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
          ) : (
            <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="w-full space-y-2 sm:w-48">
          <Label>Status</Label>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending_scheduling">Pending</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
          {hasChanges && (
            <span className="flex items-center gap-1.5 text-xs text-amber-600">
              <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
              Unsaved changes
            </span>
          )}
          <div className="flex items-center justify-end gap-3">
            {hasChanges && (
              <Button variant="outline" size="sm" onClick={handleReset} disabled={loading}>
                Undo
              </Button>
            )}
            <Button
              onClick={handleSave}
              disabled={loading || !hasActiveStudents || needsStudent}
              className="bg-[#1e293b]"
            >
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : isReschedule ? (
                'Reschedule Session'
              ) : (
                'Save Changes'
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
