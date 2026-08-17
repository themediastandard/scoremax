"use client"

import Link from 'next/link'
import { AlertCircle, GraduationCap, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { StudentDto } from '@/lib/student-contract'
import { AddFirstStudentForm } from '@/components/booking/AddFirstStudentForm'

interface StudentSelectionProps {
  students: StudentDto[]
  selectedStudentId: string | null
  status: 'loading' | 'ready' | 'error'
  onSelect: (student: StudentDto) => void
  onContinue: () => void
  onRetry: () => void
  onStudentCreated: (studentId: string) => void
}

export function StudentSelection({
  students,
  selectedStudentId,
  status,
  onSelect,
  onContinue,
  onRetry,
  onStudentCreated,
}: StudentSelectionProps) {
  if (status === 'loading') {
    return (
      <div className="flex min-h-36 items-center justify-center gap-2 text-sm text-gray-500" role="status">
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        Loading your students…
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-5" role="alert">
        <div className="flex items-start gap-3">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" aria-hidden="true" />
          <div>
            <p className="font-semibold text-red-900">We couldn&apos;t load your students</p>
            <p className="mt-1 text-sm text-red-700">Try again before continuing with this booking.</p>
            <Button type="button" variant="outline" size="sm" className="mt-4" onClick={onRetry}>
              Try Again
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const activeStudents = students.filter((student) => student.isActive)
  const inactiveCount = students.length - activeStudents.length

  if (activeStudents.length === 0) {
    return (
      <div className="space-y-3">
        <AddFirstStudentForm onCreated={onStudentCreated} />
        {inactiveCount > 0 && (
          <p className="text-center text-xs text-gray-500">
            You also have {inactiveCount} inactive {inactiveCount === 1 ? 'student' : 'students'} you can reactivate in My Students.
          </p>
        )}
      </div>
    )
  }

  return (
    <fieldset className="space-y-5">
      <legend className="sr-only">Choose the student receiving this session</legend>
      <p className="text-sm leading-6 text-gray-600">
        Select one active student. Credits and course eligibility will update for that student.
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        {activeStudents.map((student) => {
          const selected = selectedStudentId === student.id
          return (
            <label
              key={student.id}
              className={`relative flex cursor-pointer items-start gap-3 rounded-xl border-2 p-4 transition-colors focus-within:ring-2 focus-within:ring-[#517cad] focus-within:ring-offset-2 ${
                selected
                  ? 'border-[#517cad] bg-[#517cad]/5'
                  : 'border-gray-200 bg-white hover:border-[#517cad]/40'
              }`}
            >
              <input
                type="radio"
                name="booking-student"
                value={student.id}
                checked={selected}
                onChange={() => onSelect(student)}
                className="mt-1 h-4 w-4 border-gray-300 text-[#4a729f] focus:ring-[#517cad]"
              />
              <span className="min-w-0">
                <span className="flex items-center gap-2 font-semibold text-[#1e293b]">
                  <GraduationCap className="h-4 w-4 shrink-0 text-[#b08a30]" aria-hidden="true" />
                  <span className="truncate">{student.fullName}</span>
                </span>
                <span className="mt-1 block truncate text-sm text-gray-500">{student.email}</span>
                <span className="mt-1 block text-xs font-medium text-gray-500">{student.grade}</span>
              </span>
            </label>
          )
        })}
      </div>
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link href="/dashboard/students" className="text-sm font-medium text-[#4a729f] hover:text-[#3b5c85]">
          Manage Students
        </Link>
        <Button
          type="button"
          onClick={onContinue}
          disabled={!selectedStudentId}
          className="bg-[#1e293b] hover:bg-[#334155]"
        >
          Continue
        </Button>
      </div>
    </fieldset>
  )
}
