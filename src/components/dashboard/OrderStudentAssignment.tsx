'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

type OrderStudent = {
  id: string
  full_name: string
  email: string
  grade: string
  is_active: boolean
}

type LinkedSession = {
  id: string
  status: string | null
  student_id: string | null
  assigned_tutor_id: string | null
  confirmed_start: string | null
  confirmed_end: string | null
  internal_notes: string | null
}

export function OrderStudentAssignment({
  orderId,
  currentStudentId,
  students,
  linkedSession,
}: {
  orderId: string
  currentStudentId: string | null
  students: OrderStudent[]
  linkedSession: LinkedSession | null
}) {
  const router = useRouter()
  const [studentId, setStudentId] = useState(currentStudentId ?? '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const activeStudents = useMemo(
    () => students.filter((student) => student.is_active),
    [students]
  )
  const selectedStudent = students.find((student) => student.id === studentId) ?? null
  const changed = Boolean(studentId && studentId !== currentStudentId)
  const canSave = Boolean(
    linkedSession && changed && selectedStudent?.is_active && !saving
  )

  const saveStudent = async () => {
    if (!linkedSession || !canSave) return

    setSaving(true)
    setError(null)
    setSuccess(null)
    try {
      // The session endpoint uses the service-only atomic RPC that updates the
      // order and its one linked session together. Send the current session
      // fields unchanged because a scheduled student-only edit must not be
      // mistaken for a tutor, time, or status change.
      const response = await fetch(
        `/api/admin/sessions/${encodeURIComponent(linkedSession.id)}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            student_id: studentId,
            assigned_tutor_id: linkedSession.assigned_tutor_id,
            confirmed_start: linkedSession.confirmed_start,
            confirmed_end: linkedSession.confirmed_end,
            status: linkedSession.status,
            internal_notes: linkedSession.internal_notes,
          }),
        }
      )
      const result = await response.json().catch(() => null)
      if (!response.ok) {
        throw new Error(result?.error || 'Could not assign the student')
      }

      const calendarUpdated = result?.student_assignment?.calendar_updated === true
      setSuccess(
        calendarUpdated
          ? 'Student assigned to the order and session. Google Calendar was updated.'
          : 'Student assigned to the order and session.'
      )
      router.refresh()
    } catch (saveError) {
      setError(
        saveError instanceof Error ? saveError.message : 'Could not assign the student'
      )
    } finally {
      setSaving(false)
    }
  }

  if (!linkedSession) {
    return (
      <div className="flex gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
        <p>This order has no linked session, so its student cannot be changed safely.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4 border-t border-gray-100 pt-5">
      <div>
        <h3 className="text-sm font-semibold text-[#1e293b]">Admin assignment</h3>
        <p className="mt-1 text-sm leading-6 text-gray-500">
          Choose an active student from this account. The order and linked session will stay together.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="min-w-0 flex-1 space-y-2">
          <Label htmlFor={`order-student-${orderId}`}>Student</Label>
          <Select value={studentId || undefined} onValueChange={setStudentId} disabled={saving}>
            <SelectTrigger id={`order-student-${orderId}`} className="w-full">
              <SelectValue placeholder="Choose a student" />
            </SelectTrigger>
            <SelectContent>
              {students.map((student) => (
                <SelectItem
                  key={student.id}
                  value={student.id}
                  disabled={!student.is_active}
                >
                  {student.full_name} · {student.grade}{student.is_active ? '' : ' · Inactive'}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button
          type="button"
          onClick={() => void saveStudent()}
          disabled={!canSave}
          className="bg-[#1e293b] hover:bg-[#334155] sm:min-w-36"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : 'Save Student'}
        </Button>
      </div>

      {activeStudents.length === 0 && (
        <p className="text-sm text-amber-700">
          This account has no active students. The account owner must add or reactivate a student first.
        </p>
      )}
      {linkedSession.status === 'scheduled' && changed && (
        <p className="text-xs leading-5 text-gray-500">
          Saving will update the student on the existing Google Calendar invitation. The account owner and tutor remain invited.
        </p>
      )}
      {error && <p className="text-sm text-red-600" role="alert">{error}</p>}
      {success && (
        <p className="flex items-start gap-2 text-sm text-emerald-700" role="status">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          {success}
        </p>
      )}
    </div>
  )
}
