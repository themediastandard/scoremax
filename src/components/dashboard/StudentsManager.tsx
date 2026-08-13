"use client"

import { FormEvent, useCallback, useEffect, useState } from 'react'
import { CheckCircle2, GraduationCap, Loader2, Pencil, Plus, RotateCcw, UserRoundX, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { GRADE_OPTIONS } from '@/lib/student-grades'
import type {
  CreateStudentRequest,
  CreateStudentResponse,
  StudentApiError,
  StudentDto,
  StudentsResponse,
  UpdateStudentRequest,
  UpdateStudentResponse,
} from '@/lib/student-contract'

const STUDENT_EMAIL_HELPER = 'This email receives session schedules and reminders. It does not create a ScoreMax login.'

type StudentDraft = {
  fullName: string
  email: string
  phone: string
  grade: string
}

const EMPTY_DRAFT: StudentDraft = { fullName: '', email: '', phone: '', grade: '' }

async function responseError(response: Response, fallback: string) {
  const body = await response.json().catch(() => null) as StudentApiError | null
  return body?.error || fallback
}

function StudentFields({
  idPrefix,
  draft,
  onChange,
  disabled,
}: {
  idPrefix: string
  draft: StudentDraft
  onChange: (draft: StudentDraft) => void
  disabled?: boolean
}) {
  const helperId = `${idPrefix}-email-helper`
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <div className="space-y-2 sm:col-span-2">
        <Label htmlFor={`${idPrefix}-name`}>Student Name</Label>
        <Input
          id={`${idPrefix}-name`}
          value={draft.fullName}
          onChange={(event) => onChange({ ...draft, fullName: event.target.value })}
          autoComplete="name"
          maxLength={200}
          required
          disabled={disabled}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-email`}>Student Email</Label>
        <Input
          id={`${idPrefix}-email`}
          type="email"
          value={draft.email}
          onChange={(event) => onChange({ ...draft, email: event.target.value })}
          autoComplete="email"
          maxLength={320}
          aria-describedby={helperId}
          required
          disabled={disabled}
        />
        <p id={helperId} className="text-xs leading-5 text-gray-500">{STUDENT_EMAIL_HELPER}</p>
      </div>
      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-phone`}>Student Phone <span className="font-normal text-gray-500">(Optional)</span></Label>
        <Input
          id={`${idPrefix}-phone`}
          type="tel"
          value={draft.phone}
          onChange={(event) => onChange({ ...draft, phone: event.target.value })}
          placeholder="(555) 123-4567"
          autoComplete="tel"
          maxLength={50}
          disabled={disabled}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-grade`}>Grade</Label>
        <Select
          value={draft.grade || undefined}
          onValueChange={(grade) => onChange({ ...draft, grade })}
          disabled={disabled}
        >
          <SelectTrigger id={`${idPrefix}-grade`} className="w-full" aria-label="Grade" aria-required="true">
            <SelectValue placeholder="Select grade" />
          </SelectTrigger>
          <SelectContent>
            {draft.grade && !GRADE_OPTIONS.includes(draft.grade) && (
              <SelectItem value={draft.grade}>{draft.grade}</SelectItem>
            )}
            {GRADE_OPTIONS.map((grade) => (
              <SelectItem key={grade} value={grade}>{grade}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}

function StudentCard({
  student,
  onUpdated,
}: {
  student: StudentDto
  onUpdated: (student: StudentDto) => void
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState<StudentDraft>({
    fullName: student.fullName,
    email: student.email,
    phone: student.phone ?? '',
    grade: student.grade,
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const closeEditor = () => {
    setDraft({ fullName: student.fullName, email: student.email, phone: student.phone ?? '', grade: student.grade })
    setError(null)
    setEditing(false)
  }

  const patchStudent = async (updates: UpdateStudentRequest) => {
    setSaving(true)
    setError(null)
    try {
      const response = await fetch(`/api/account/students/${student.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })
      if (!response.ok) {
        setError(await responseError(response, 'Could not update this student.'))
        return false
      }
      const body = await response.json() as UpdateStudentResponse
      onUpdated(body.student)
      return true
    } catch {
      setError('Could not update this student. Check your connection and try again.')
      return false
    } finally {
      setSaving(false)
    }
  }

  const saveDetails = async (event: FormEvent) => {
    event.preventDefault()
    if (!draft.fullName.trim() || !draft.email.trim() || !draft.grade) {
      setError('Name, email, and grade are required.')
      return
    }
    const saved = await patchStudent({
      fullName: draft.fullName.trim(),
      email: draft.email.trim(),
      phone: draft.phone.trim(),
      grade: draft.grade,
    })
    if (saved) setEditing(false)
  }

  const toggleActive = async () => {
    const saved = await patchStudent({ isActive: !student.isActive })
    if (saved) setEditing(false)
  }

  return (
    <article className={`rounded-xl border bg-white shadow-sm ${student.isActive ? 'border-gray-200' : 'border-gray-200 opacity-80'}`}>
      <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${student.isActive ? 'bg-[#517cad]/10 text-[#4a729f]' : 'bg-gray-100 text-gray-400'}`}>
            <GraduationCap className="h-5 w-5" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="truncate font-semibold text-[#1e293b]">{student.fullName}</h2>
              <Badge variant="outline" className={student.isActive ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-gray-200 bg-gray-50 text-gray-500'}>
                {student.isActive ? 'Active' : 'Inactive'}
              </Badge>
            </div>
            <p className="mt-1 break-all text-sm text-gray-600">{student.email}</p>
            <p className="mt-1 text-sm text-gray-500">{student.phone || 'Phone not provided'}</p>
            <p className="mt-1 text-sm text-gray-500">{student.grade}</p>
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => setEditing((current) => !current)} disabled={saving}>
            {editing ? <X className="h-4 w-4" aria-hidden="true" /> : <Pencil className="h-4 w-4" aria-hidden="true" />}
            {editing ? 'Close' : 'Edit'}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={toggleActive}
            disabled={saving}
            className={student.isActive ? 'text-gray-600' : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'}
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : student.isActive ? (
              <UserRoundX className="h-4 w-4" aria-hidden="true" />
            ) : (
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
            )}
            {student.isActive ? 'Deactivate' : 'Reactivate'}
          </Button>
        </div>
      </div>

      {editing && (
        <form onSubmit={saveDetails} className="border-t border-gray-100 bg-slate-50/60 p-5">
          <StudentFields idPrefix={`edit-student-${student.id}`} draft={draft} onChange={setDraft} disabled={saving} />
          {error && <p className="mt-4 text-sm text-red-700" role="alert">{error}</p>}
          <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button type="button" variant="ghost" onClick={closeEditor} disabled={saving}>Cancel</Button>
            <Button type="submit" className="bg-[#1e293b] hover:bg-[#334155]" disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
              Save Student
            </Button>
          </div>
        </form>
      )}
      {!editing && error && <p className="border-t border-red-100 bg-red-50 px-5 py-3 text-sm text-red-700" role="alert">{error}</p>}
    </article>
  )
}

export function StudentsManager() {
  const [students, setStudents] = useState<StudentDto[]>([])
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [showAdd, setShowAdd] = useState(false)
  const [draft, setDraft] = useState<StudentDraft>(EMPTY_DRAFT)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  const loadStudents = useCallback(async () => {
    setStatus('loading')
    setError(null)
    try {
      const response = await fetch('/api/account/students', { cache: 'no-store' })
      if (!response.ok) {
        setError(await responseError(response, 'Could not load your students.'))
        setStatus('error')
        return
      }
      const body = await response.json() as StudentsResponse
      setStudents(body.students)
      setStatus('ready')
    } catch {
      setError('Could not load your students. Check your connection and try again.')
      setStatus('error')
    }
  }, [])

  useEffect(() => {
    void loadStudents()
  }, [loadStudents])

  const submitNewStudent = async (event: FormEvent) => {
    event.preventDefault()
    setError(null)
    setNotice(null)
    if (!draft.fullName.trim() || !draft.email.trim() || !draft.grade) {
      setError('Name, email, and grade are required.')
      return
    }

    const request: CreateStudentRequest = {
      fullName: draft.fullName.trim(),
      email: draft.email.trim(),
      phone: draft.phone.trim(),
      grade: draft.grade,
    }
    setSaving(true)
    try {
      const response = await fetch('/api/account/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      })
      if (!response.ok) {
        setError(await responseError(response, 'Could not add this student.'))
        return
      }
      const body = await response.json() as CreateStudentResponse
      setStudents((current) => [...current, body.student])
      setDraft(EMPTY_DRAFT)
      setShowAdd(false)
      setNotice(`${body.student.fullName} was added to your account.`)
    } catch {
      setError('Could not add this student. Check your connection and try again.')
    } finally {
      setSaving(false)
    }
  }

  const updateStudent = (updated: StudentDto) => {
    setStudents((current) => current.map((student) => student.id === updated.id ? updated : student))
    setNotice(`${updated.fullName} was updated.`)
  }

  const sortedStudents = [...students].sort((a, b) => {
    if (a.isActive !== b.isActive) return a.isActive ? -1 : 1
    return a.fullName.localeCompare(b.fullName)
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-serif font-bold text-[#1e293b] sm:text-3xl">My Students</h1>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-gray-500">
            Manage the students on your account. Students receive scheduling messages but do not sign in.
          </p>
        </div>
        <Button
          type="button"
          onClick={() => { setShowAdd((current) => !current); setError(null); setNotice(null) }}
          className="w-full shrink-0 bg-[#1e293b] hover:bg-[#334155] sm:w-auto"
        >
          {showAdd ? <X className="h-4 w-4" aria-hidden="true" /> : <Plus className="h-4 w-4" aria-hidden="true" />}
          {showAdd ? 'Close Form' : 'Add a Student'}
        </Button>
      </div>

      {showAdd && (
        <form onSubmit={submitNewStudent} className="rounded-xl border border-[#517cad]/25 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-lg font-semibold text-[#1e293b]">Add a Student</h2>
          <p className="mb-5 mt-1 text-sm text-gray-500">Enter the student&apos;s current contact and grade information.</p>
          <StudentFields idPrefix="new-student" draft={draft} onChange={setDraft} disabled={saving} />
          {error && <p className="mt-4 text-sm text-red-700" role="alert">{error}</p>}
          <div className="mt-5 flex justify-end">
            <Button type="submit" className="w-full bg-[#b08a30] hover:bg-[#9a7628] sm:w-auto" disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
              Add Student
            </Button>
          </div>
        </form>
      )}

      {notice && (
        <div className="flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800" role="status">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          {notice}
        </div>
      )}

      {status === 'loading' ? (
        <div className="flex min-h-48 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white text-sm text-gray-500" role="status">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          Loading students…
        </div>
      ) : status === 'error' ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center" role="alert">
          <p className="font-semibold text-red-900">{error || 'Could not load your students.'}</p>
          <Button type="button" variant="outline" className="mt-4" onClick={() => void loadStudents()}>Try Again</Button>
        </div>
      ) : sortedStudents.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-gray-200 bg-white px-6 py-12 text-center">
          <GraduationCap className="mx-auto h-10 w-10 text-gray-300" aria-hidden="true" />
          <p className="mt-4 font-semibold text-[#1e293b]">No students yet</p>
          <p className="mx-auto mt-1 max-w-sm text-sm text-gray-500">Add the first student you plan to book tutoring for.</p>
          <Button type="button" className="mt-5 bg-[#1e293b] hover:bg-[#334155]" onClick={() => setShowAdd(true)}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add a Student
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {sortedStudents.map((student) => (
            <StudentCard key={student.id} student={student} onUpdated={updateStudent} />
          ))}
        </div>
      )}
    </div>
  )
}
