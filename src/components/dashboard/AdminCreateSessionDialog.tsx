'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AlertTriangle, CalendarPlus, CheckCircle2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

export type AdminBookingAccount = {
  id: string
  full_name: string | null
  email: string
  account_type: string | null
}

export type AdminBookingStudent = {
  id: string
  customer_id: string
  full_name: string
  email: string
  grade: string
}

export type AdminBookingTutor = { id: string; full_name: string | null }
export type AdminBookingSubject = { id: string; name: string; category: string }

type CreditSummary = {
  eligibleCredits: number
  familyCredits: number
  studentCredits: number
  breakdown: {
    membership: number
    familyPackage: number
    studentPackage: number
    studentCourse: number
  }
}

type Success = {
  sessionId: string
  remaining: number
  warning?: string
  deliveryStatus: string
}

const categoryNames: Record<string, string> = {
  'test-prep': 'Test Prep',
  'high-school': 'High School',
  college: 'College',
  'middle-school': 'Middle School',
  elementary: 'Elementary',
}

function newKey() {
  return typeof crypto !== 'undefined' ? crypto.randomUUID() : ''
}

function initialDate() {
  const tomorrow = new Date(Date.now() + 24 * 60 * 60_000)
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(tomorrow)
  const value = Object.fromEntries(parts.map((part) => [part.type, part.value]))
  return `${value.year}-${value.month}-${value.day}`
}

export function AdminCreateSessionDialog({
  accounts,
  students,
  tutors,
  subjects,
}: {
  accounts: AdminBookingAccount[]
  students: AdminBookingStudent[]
  tutors: AdminBookingTutor[]
  subjects: AdminBookingSubject[]
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [customerId, setCustomerId] = useState('')
  const [studentId, setStudentId] = useState('')
  const [tutorId, setTutorId] = useState('')
  const [subjectIds, setSubjectIds] = useState<string[]>([])
  const [date, setDate] = useState(initialDate)
  const [startTime, setStartTime] = useState('15:00')
  const [endTime, setEndTime] = useState('16:00')
  const [internalNotes, setInternalNotes] = useState('')
  const [idempotencyKey, setIdempotencyKey] = useState(newKey)
  const [credit, setCredit] = useState<CreditSummary | null>(null)
  const [creditLoading, setCreditLoading] = useState(false)
  const [creditError, setCreditError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState<Success | null>(null)
  const [retrying, setRetrying] = useState(false)

  const accountStudents = useMemo(
    () => students.filter((student) => student.customer_id === customerId),
    [customerId, students],
  )
  const subjectsByCategory = useMemo(() => {
    const grouped = new Map<string, AdminBookingSubject[]>()
    for (const subject of subjects) {
      grouped.set(subject.category, [...(grouped.get(subject.category) ?? []), subject])
    }
    return grouped
  }, [subjects])

  useEffect(() => {
    setStudentId('')
    setCredit(null)
    setCreditError('')
  }, [customerId])

  useEffect(() => {
    if (!customerId || !studentId) {
      setCredit(null)
      return
    }
    const controller = new AbortController()
    setCreditLoading(true)
    setCreditError('')
    fetch(`/api/admin/session-bookings?customer_id=${customerId}&student_id=${studentId}`, {
      signal: controller.signal,
    })
      .then(async (response) => {
        const body = await response.json()
        if (!response.ok) throw new Error(body.error || 'Could not load credits.')
        setCredit(body)
      })
      .catch((requestError) => {
        if (requestError.name !== 'AbortError') {
          setCredit(null)
          setCreditError(requestError.message || 'Could not load credits.')
        }
      })
      .finally(() => setCreditLoading(false))
    return () => controller.abort()
  }, [customerId, studentId])

  const reset = () => {
    setCustomerId('')
    setStudentId('')
    setTutorId('')
    setSubjectIds([])
    setDate(initialDate())
    setStartTime('15:00')
    setEndTime('16:00')
    setInternalNotes('')
    setIdempotencyKey(newKey())
    setCredit(null)
    setCreditError('')
    setError('')
    setSuccess(null)
  }

  const closeAndReset = () => {
    reset()
    setOpen(false)
  }

  const toggleSubject = (id: string, checked: boolean) => {
    setSubjectIds((current) => checked ? [...current, id] : current.filter((value) => value !== id))
  }

  const canSubmit = Boolean(
    customerId && studentId && tutorId && subjectIds.length && date && startTime && endTime &&
    credit && credit.eligibleCredits > 0 && !creditLoading && !submitting
  )

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!canSubmit) return
    setSubmitting(true)
    setError('')
    try {
      const response = await fetch('/api/admin/session-bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId,
          studentId,
          tutorId,
          subjectIds,
          date,
          startTime,
          endTime,
          internalNotes,
          idempotencyKey,
        }),
      })
      const body = await response.json()
      if (!response.ok) throw new Error(body.error || 'Could not book the session.')
      setSuccess({
        sessionId: body.sessionId,
        remaining: body.credit.after,
        warning: body.delivery.warning,
        deliveryStatus: body.delivery.status,
      })
      router.refresh()
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Could not book the session.')
    } finally {
      setSubmitting(false)
    }
  }

  const retryDelivery = async () => {
    if (!success) return
    setRetrying(true)
    setError('')
    try {
      const response = await fetch(`/api/admin/sessions/${success.sessionId}/delivery`, { method: 'POST' })
      const body = await response.json()
      if (!response.ok) throw new Error(body.error || 'Could not retry calendar and emails.')
      setSuccess((current) => current ? {
        ...current,
        deliveryStatus: body.delivery.status,
        warning: body.delivery.warning,
      } : null)
      router.refresh()
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Could not retry calendar and emails.')
    } finally {
      setRetrying(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (submitting) return
        setOpen(next)
        if (!next) reset()
      }}
    >
      <DialogTrigger asChild>
        <Button className="h-10 bg-[#1e293b] px-4 text-white hover:bg-[#334155]">
          <CalendarPlus aria-hidden="true" />
          Create Session
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[92vh] overflow-y-auto p-0 sm:max-w-3xl">
        <DialogHeader className="border-b border-gray-100 px-5 py-5 pr-12 sm:px-7">
          <DialogTitle className="font-serif text-2xl text-[#1e293b]">Create a Session</DialogTitle>
          <DialogDescription>
            Book a confirmed one-hour session for a customer and use one eligible credit.
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="space-y-5 px-5 py-6 sm:px-7">
            <div className={`rounded-xl border p-5 ${success.warning ? 'border-amber-200 bg-amber-50' : 'border-emerald-200 bg-emerald-50'}`}>
              <div className="flex items-start gap-3">
                {success.warning
                  ? <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" />
                  : <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700" />}
                <div>
                  <p className="font-semibold text-[#1e293b]">Session booked and 1 credit used</p>
                  <p className="mt-1 text-sm text-gray-600">{success.remaining} eligible credits remain.</p>
                  {success.warning && <p className="mt-3 text-sm font-medium text-amber-800">{success.warning}</p>}
                </div>
              </div>
            </div>
            {error && <p role="alert" className="text-sm font-medium text-red-700">{error}</p>}
            <DialogFooter>
              {success.deliveryStatus !== 'complete' && (
                <Button type="button" variant="outline" onClick={retryDelivery} disabled={retrying}>
                  {retrying && <Loader2 className="animate-spin" />}
                  Retry calendar & emails
                </Button>
              )}
              <Button type="button" onClick={closeAndReset}>Done</Button>
            </DialogFooter>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-6 px-5 py-6 sm:px-7">
            <section className="space-y-4">
              <div>
                <h3 className="font-semibold text-[#1e293b]">1. Account and student</h3>
                <p className="text-sm text-gray-500">The account owns the credits. The student receives the session.</p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Account owner</Label>
                  <Select value={customerId} onValueChange={setCustomerId}>
                    <SelectTrigger aria-label="Account owner"><SelectValue placeholder="Choose account" /></SelectTrigger>
                    <SelectContent>
                      {accounts.map((account) => (
                        <SelectItem key={account.id} value={account.id}>
                          {account.full_name?.trim() || 'Unnamed account'} · {account.email}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Student</Label>
                  <Select value={studentId} onValueChange={setStudentId} disabled={!customerId}>
                    <SelectTrigger aria-label="Student"><SelectValue placeholder={customerId ? 'Choose student' : 'Choose account first'} /></SelectTrigger>
                    <SelectContent>
                      {accountStudents.map((student) => (
                        <SelectItem key={student.id} value={student.id}>
                          {student.full_name} · {student.grade}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {customerId && accountStudents.length === 0 && (
                    <p className="text-xs font-medium text-amber-700">This account has no active students.</p>
                  )}
                </div>
              </div>

              {(studentId || creditLoading || creditError) && (
                <div className={`rounded-lg border px-4 py-3 ${credit?.eligibleCredits ? 'border-emerald-200 bg-emerald-50/70' : 'border-amber-200 bg-amber-50/70'}`}>
                  {creditLoading ? (
                    <p className="flex items-center gap-2 text-sm text-gray-600"><Loader2 className="h-4 w-4 animate-spin" />Checking credits…</p>
                  ) : creditError ? (
                    <p role="alert" className="text-sm font-medium text-red-700">{creditError}</p>
                  ) : credit ? (
                    <>
                      <p className="font-semibold text-[#1e293b]">{credit.eligibleCredits} eligible credits available</p>
                      {credit.eligibleCredits > 0 ? (
                        <p className="mt-1 text-sm text-gray-600">This booking will use 1 credit, leaving {credit.eligibleCredits - 1}.</p>
                      ) : (
                        <p className="mt-1 text-sm font-medium text-amber-800">No eligible credits. A free session cannot be created.</p>
                      )}
                      <p className="mt-2 text-xs text-gray-500">
                        {credit.familyCredits} family-wide · {credit.studentCredits} for this student
                        {credit.breakdown.studentCourse > 0 ? ` · ${credit.breakdown.studentCourse} course` : ''}
                      </p>
                    </>
                  ) : null}
                </div>
              )}
            </section>

            <section className="space-y-4 border-t border-gray-100 pt-5">
              <div>
                <h3 className="font-semibold text-[#1e293b]">2. Tutoring details</h3>
                <p className="text-sm text-gray-500">Choose the subject and assigned tutor.</p>
              </div>
              <div className="space-y-2">
                <Label>Tutor</Label>
                <Select value={tutorId} onValueChange={setTutorId}>
                  <SelectTrigger aria-label="Tutor"><SelectValue placeholder="Choose active tutor" /></SelectTrigger>
                  <SelectContent>{tutors.map((tutor) => <SelectItem key={tutor.id} value={tutor.id}>{tutor.full_name?.trim() || 'Unnamed tutor'}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Subject(s)</Label>
                <div className="max-h-52 space-y-4 overflow-y-auto rounded-lg border border-gray-200 p-3">
                  {Array.from(subjectsByCategory.entries()).map(([category, options]) => (
                    <div key={category}>
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">{categoryNames[category] ?? category}</p>
                      <div className="grid gap-2 sm:grid-cols-2">
                        {options.map((subject) => (
                          <label key={subject.id} className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 hover:bg-gray-50">
                            <Checkbox
                              checked={subjectIds.includes(subject.id)}
                              onCheckedChange={(checked) => toggleSubject(subject.id, checked === true)}
                            />
                            <span className="text-sm text-gray-700">{subject.name}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section className="space-y-4 border-t border-gray-100 pt-5">
              <div>
                <h3 className="font-semibold text-[#1e293b]">3. Date and time</h3>
                <p className="text-sm text-gray-500">All times are entered in ScoreMax Eastern Time. A Google Meet link will be created automatically.</p>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2"><Label htmlFor="admin-session-date">Date</Label><Input id="admin-session-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} /></div>
                <div className="space-y-2"><Label htmlFor="admin-session-start">Start</Label><Input id="admin-session-start" type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} /></div>
                <div className="space-y-2"><Label htmlFor="admin-session-end">End</Label><Input id="admin-session-end" type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} /></div>
              </div>
              <p className="text-xs text-gray-500">One credit covers exactly one hour.</p>
              <div className="space-y-2">
                <Label htmlFor="admin-session-notes">Admin notes <span className="font-normal text-gray-400">(optional)</span></Label>
                <Textarea id="admin-session-notes" value={internalNotes} onChange={(e) => setInternalNotes(e.target.value)} maxLength={2000} placeholder="Anything the tutor or admin team should know" />
              </div>
            </section>

            {error && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-700">{error}</p>}
            <DialogFooter className="border-t border-gray-100 pt-5">
              <Button type="button" variant="outline" onClick={closeAndReset} disabled={submitting}>Cancel</Button>
              <Button type="submit" disabled={!canSubmit} className="bg-[#1e293b] hover:bg-[#334155]">
                {submitting && <Loader2 className="animate-spin" />}
                Book Session & Use 1 Credit
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
