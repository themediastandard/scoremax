"use client"

import { FormEvent, useState } from 'react'
import { Loader2, UserPlus } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { GRADE_OPTIONS } from '@/lib/student-grades'
import type { CreateStudentResponse, StudentApiError } from '@/lib/student-contract'

export function AddFirstStudentForm({ onCreated }: { onCreated: (studentId: string) => void }) {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [grade, setGrade] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (!fullName.trim() || !email.trim() || !phone.trim() || !grade) {
      setError('Name, email, phone, and grade are required.')
      return
    }
    setSaving(true)
    setError(null)
    try {
      const response = await fetch('/api/account/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, email, phone, grade }),
      })
      const body = await response.json() as CreateStudentResponse | StudentApiError
      if (!response.ok || !('student' in body)) {
        setError('error' in body ? body.error : 'Could not add this student.')
        return
      }
      onCreated(body.student.id)
    } catch {
      setError('Could not add this student. Check your connection and try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={submit} className="rounded-xl border border-[#517cad]/25 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#517cad]/10">
          <UserPlus className="h-5 w-5 text-[#4a729f]" aria-hidden="true" />
        </div>
        <div>
          <h3 className="font-semibold text-[#1e293b]">Add a student to continue</h3>
          <p className="mt-1 text-sm leading-6 text-gray-600">
            This parent account does not have an active student yet. Add the student receiving tutoring, and we&apos;ll continue this booking as soon as they&apos;re saved.
          </p>
        </div>
      </div>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="booking-first-student-name">Student Name</Label>
          <Input id="booking-first-student-name" value={fullName} onChange={(event) => setFullName(event.target.value)} maxLength={200} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="booking-first-student-email">Student Email</Label>
          <Input id="booking-first-student-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} maxLength={320} required />
          <p className="text-xs leading-5 text-gray-500">Receives schedules and reminders. This does not create a login.</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="booking-first-student-phone">Student Phone</Label>
          <Input id="booking-first-student-phone" type="tel" value={phone} onChange={(event) => setPhone(event.target.value)} maxLength={50} required />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="booking-first-student-grade">Grade</Label>
          <Select value={grade || undefined} onValueChange={setGrade}>
            <SelectTrigger id="booking-first-student-grade" className="w-full" aria-required="true">
              <SelectValue placeholder="Select grade" />
            </SelectTrigger>
            <SelectContent>
              {GRADE_OPTIONS.map((option) => <SelectItem key={option} value={option}>{option}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>
      {error && <p className="mt-4 text-sm text-red-700" role="alert">{error}</p>}
      <Button type="submit" className="mt-5 w-full bg-[#1e293b] hover:bg-[#334155] sm:w-auto" disabled={saving}>
        {saving && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
        Add Student & Continue
      </Button>
    </form>
  )
}
