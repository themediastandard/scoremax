"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Loader2 } from 'lucide-react'
import {
  toLocalDateValue,
  toLocalTimeValue,
  fromLocalDateTimeValues,
} from '@/lib/local-datetime'
import { RequestedAvailability } from './RequestedAvailability'

interface SessionFormProps {
  session: {
    id: string
    assigned_tutor_id: string | null
    confirmed_start: string | null
    confirmed_end: string | null
    status: string
    internal_notes: string | null
  }
  tutors: { id: string; full_name: string }[]
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

export function SessionForm({ session, tutors, requestedAvailability }: SessionFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const [tutorId, setTutorId] = useState(session.assigned_tutor_id || '')
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
    tutorId !== initial.tutorId ||
    date !== initial.date ||
    time !== initial.time ||
    duration !== initial.duration ||
    status !== initial.status ||
    internalNotes !== initial.internalNotes

  const handleReset = () => {
    setTutorId(initial.tutorId)
    setDate(initial.date)
    setTime(initial.time)
    setDuration(initial.duration)
    setStatus(initial.status)
    setInternalNotes(initial.internalNotes)
  }

  const handleSave = async () => {
    setLoading(true)

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
          assigned_tutor_id: tutorId || null,
          confirmed_start: confirmedStart,
          confirmed_end: confirmedEnd,
          status,
          internal_notes: internalNotes,
        }),
      })

      if (!res.ok) {
        const err = await res.json()
        alert(err.error || 'Failed to update session')
      } else {
        setInitial({ tutorId, date, time, duration, status, internalNotes })
        router.refresh()
      }
    } catch (err) {
      console.error(err)
      alert('Error updating session')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-5">
      <RequestedAvailability booking={requestedAvailability} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

      <div className="flex items-end justify-between gap-4">
        <div className="space-y-2 w-48">
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
        <div className="flex items-center gap-3">
          {hasChanges && (
            <>
              <span className="flex items-center gap-1.5 text-xs text-amber-600">
                <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                Unsaved changes
              </span>
              <Button variant="outline" size="sm" onClick={handleReset} disabled={loading}>
                Undo
              </Button>
            </>
          )}
          <Button onClick={handleSave} disabled={loading} className="bg-[#1e293b]">
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Save Changes'}
          </Button>
        </div>
      </div>
    </div>
  )
}
