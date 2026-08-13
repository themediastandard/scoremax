"use client"

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { GraduationCap } from 'lucide-react'
import type { BookingStudentDto } from '@/lib/student-contract'

interface ContactValue {
  fullName: string
  email: string
  phone: string
  notes: string
}

interface ContactFormProps {
  value: ContactValue
  onChange: (value: ContactValue) => void
  /** Set when the server confirms a signed-in account owner. */
  signedInEmail?: string | null
  selectedStudent: BookingStudentDto
  isStudentAccount?: boolean
}

export function ContactForm({
  value,
  onChange,
  signedInEmail,
  selectedStudent,
  isStudentAccount = false,
}: ContactFormProps) {
  const handleChange = (field: keyof ContactValue, next: string) => {
    onChange({ ...value, [field]: next })
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-serif text-[#1e293b]">
          {isStudentAccount ? 'Your contact information' : 'Parent / account owner contact'}
        </h2>
        <p className="mt-1 text-sm leading-6 text-gray-600">
          {isStudentAccount
            ? 'We\'ll use this information for account and purchase questions. You will receive session schedules and reminders.'
            : 'We\'ll use this information for account and purchase questions. The account owner and selected student both receive session schedules and reminders.'}
        </p>
      </div>

      <div className="rounded-xl border border-[#517cad]/20 bg-[#517cad]/5 p-4">
        <div className="flex items-start gap-3">
          <GraduationCap className="mt-0.5 h-5 w-5 shrink-0 text-[#4a729f]" aria-hidden="true" />
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Student</p>
            <p className="mt-0.5 font-semibold text-[#1e293b]">{selectedStudent.fullName}</p>
            <p className="mt-0.5 break-all text-sm text-gray-600">{selectedStudent.email}</p>
            <p className="mt-0.5 text-xs text-gray-500">{selectedStudent.grade}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="accountOwnerName">{isStudentAccount ? 'Your Name' : 'Account Owner Name'}</Label>
          <Input
            id="accountOwnerName"
            value={value.fullName}
            onChange={(event) => handleChange('fullName', event.target.value)}
            placeholder="Parent or account owner"
            autoComplete="name"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="accountOwnerEmail">{isStudentAccount ? 'Your Email' : 'Account Owner Email'}</Label>
          {signedInEmail ? (
            <div className="flex flex-wrap items-center gap-x-2 rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700">
              <span className="break-all font-medium">{signedInEmail}</span>
              <span className="text-xs text-gray-400">Signed in</span>
            </div>
          ) : (
            <Input
              id="accountOwnerEmail"
              type="email"
              value={value.email}
              onChange={(event) => handleChange('email', event.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
            />
          )}
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="accountOwnerPhone">{isStudentAccount ? 'Your Phone' : 'Account Owner Phone'}</Label>
          <Input
            id="accountOwnerPhone"
            type="tel"
            value={value.phone}
            onChange={(event) => handleChange('phone', event.target.value)}
            placeholder="(555) 123-4567"
            autoComplete="tel"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes or Goals (Optional)</Label>
        <Textarea
          id="notes"
          value={value.notes}
          onChange={(event) => handleChange('notes', event.target.value)}
          placeholder="Anything specific you'd like the tutor to focus on?"
          className="min-h-[100px]"
        />
      </div>
    </div>
  )
}
