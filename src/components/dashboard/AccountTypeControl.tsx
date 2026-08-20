'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, UserRound, Users } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { formatAccountType, type AccountType } from '@/lib/account-type'
import { GRADE_OPTIONS } from '@/lib/student-grades'

export function AccountTypeControl({
  customerId,
  customerName,
  customerEmail,
  customerPhone,
  customerGrade,
  selfStudentPhone,
  selfStudentGrade,
  initialAccountType,
  hasActiveStudents,
  hasNonSelfStudents,
}: {
  customerId: string
  customerName: string
  customerEmail: string
  customerPhone: string | null
  customerGrade: string | null
  selfStudentPhone: string | null
  selfStudentGrade: string | null
  initialAccountType: AccountType | null
  hasActiveStudents: boolean
  hasNonSelfStudents: boolean
}) {
  const router = useRouter()
  const [accountType, setAccountType] = useState<AccountType | null>(initialAccountType)
  const [open, setOpen] = useState(false)
  const [selectedType, setSelectedType] = useState<AccountType | null>(null)
  const [managedStudentName, setManagedStudentName] = useState('')
  const [managedStudentEmail, setManagedStudentEmail] = useState('')
  const [managedStudentPhone, setManagedStudentPhone] = useState('')
  const [managedStudentGrade, setManagedStudentGrade] = useState('')
  const initialOwnerPhone = selfStudentPhone ?? customerPhone ?? ''
  const initialOwnerGrade = selfStudentGrade && GRADE_OPTIONS.includes(selfStudentGrade)
    ? selfStudentGrade
    : customerGrade && GRADE_OPTIONS.includes(customerGrade)
      ? customerGrade
      : ''
  const [ownerPhone, setOwnerPhone] = useState(initialOwnerPhone)
  const [ownerGrade, setOwnerGrade] = useState(
    initialOwnerGrade
  )
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const resetForm = () => {
    setSelectedType(null)
    setManagedStudentName('')
    setManagedStudentEmail('')
    setManagedStudentPhone('')
    setManagedStudentGrade('')
    setOwnerPhone(initialOwnerPhone)
    setOwnerGrade(initialOwnerGrade)
    setError(null)
  }

  const handleOpenChange = (nextOpen: boolean) => {
    if (saving) return
    if (nextOpen) resetForm()
    setOpen(nextOpen)
  }

  const completeAccountSetup = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!selectedType) {
      setError('Choose Parent / Guardian or Student')
      return
    }
    if (selectedType === 'student' && hasNonSelfStudents) {
      setError('Resolve the managed student records before changing this to a student account')
      return
    }

    setSaving(true)
    setError(null)
    try {
      const response = await fetch(
        `/api/admin/customers/${encodeURIComponent(customerId)}/account-type`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(selectedType === 'parent'
            ? {
                account_type: 'parent',
                ...(!hasActiveStudents && {
                  student: {
                    fullName: managedStudentName,
                    email: managedStudentEmail,
                    phone: managedStudentPhone,
                    grade: managedStudentGrade,
                  },
                }),
              }
            : {
                account_type: 'student',
                studentPhone: ownerPhone,
                studentGrade: ownerGrade,
              }),
        }
      )
      const result = await response.json().catch(() => null) as {
        error?: string
        accountType?: AccountType | null
      } | null
      if (response.status === 409 && result?.accountType === selectedType) {
        setAccountType(result.accountType)
        setOpen(false)
        router.refresh()
        return
      }
      if (!response.ok || result?.accountType !== selectedType) {
        throw new Error(result?.error || 'Could not update account type')
      }
      setAccountType(selectedType)
      setOpen(false)
      router.refresh()
    } catch (updateError) {
      setError(
        updateError instanceof Error ? updateError.message : 'Could not update account type'
      )
    } finally {
      setSaving(false)
    }
  }

  const parentReady = hasActiveStudents || Boolean(
    managedStudentName.trim() &&
    managedStudentEmail.trim() &&
    managedStudentPhone.trim() &&
    managedStudentGrade
  )
  const studentReady = !hasNonSelfStudents && Boolean(ownerPhone.trim() && ownerGrade)
  const canSubmit = selectedType === 'parent'
    ? selectedType !== accountType && parentReady
    : selectedType === 'student'
      ? selectedType !== accountType && studentReady
      : false

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {accountType && (
        <div className="mb-3">
          <Badge variant="secondary">{formatAccountType(accountType)}</Badge>
        </div>
      )}
      <Button type="button" onClick={() => handleOpenChange(true)} className="w-full bg-[#1e293b] hover:bg-[#334155]">
        {accountType ? 'Change Account Type' : 'Complete Account Setup'}
      </Button>
      <p className="mt-2 text-xs leading-5 text-gray-500">
        {accountType
          ? 'Correct the account type through the guided conversion flow.'
          : 'Choose the account type and add the required student information together.'}
      </p>

      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-xl">
        <form onSubmit={completeAccountSetup} className="space-y-5">
          <DialogHeader>
            <DialogTitle>{accountType ? 'Change account type' : 'Complete account setup'}</DialogTitle>
            <DialogDescription>
              {accountType
                ? `Change ${customerName} from the current ${formatAccountType(accountType).toLowerCase()} classification.`
                : `Set up ${customerName} as a parent/guardian or student.`}
            </DialogDescription>
          </DialogHeader>

          <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm">
            <p className="font-medium text-[#1e293b]">{customerName}</p>
            <p className="mt-0.5 break-all text-gray-600">{customerEmail}</p>
          </div>

          <fieldset className="space-y-3">
            <legend className="text-sm font-medium text-[#1e293b]">Who owns this account?</legend>
            <div className="grid gap-3 sm:grid-cols-2">
              {([
                {
                  value: 'parent' as const,
                  label: 'Parent / Guardian',
                  description: accountType === 'parent'
                    ? 'Current account type'
                    : 'Manages bookings for a student',
                  icon: Users,
                  disabled: accountType === 'parent',
                },
                {
                  value: 'student' as const,
                  label: 'Student',
                  description: accountType === 'student'
                    ? 'Current account type'
                    : hasNonSelfStudents
                      ? 'Unavailable until managed student records are resolved'
                      : 'Books and manages their own sessions',
                  icon: UserRound,
                  disabled: accountType === 'student' || hasNonSelfStudents,
                },
              ]).map((option) => {
                const Icon = option.icon
                const selected = selectedType === option.value
                return (
                  <label
                    key={option.value}
                    className={`rounded-lg border p-4 transition-colors ${
                      option.disabled
                        ? 'cursor-not-allowed border-gray-200 bg-gray-50 opacity-60'
                        : selected
                          ? 'cursor-pointer border-[#b08a30] bg-[#b08a30]/5'
                          : 'cursor-pointer border-gray-200 hover:border-[#b08a30]/50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="admin-account-type"
                      value={option.value}
                      checked={selected}
                      disabled={option.disabled}
                      onChange={() => {
                        setSelectedType(option.value)
                        setError(null)
                      }}
                      className="sr-only"
                    />
                    <Icon className="h-5 w-5 text-[#b08a30]" aria-hidden="true" />
                    <span className="mt-2 block text-sm font-semibold text-[#1e293b]">{option.label}</span>
                    <span className="mt-1 block text-xs leading-5 text-gray-500">{option.description}</span>
                  </label>
                )
              })}
            </div>
          </fieldset>

          {accountType && selectedType && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-950">
              This changes the portal experience from {formatAccountType(accountType).toLowerCase()} to{' '}
              {formatAccountType(selectedType).toLowerCase()}. Existing students, bookings, orders, and credits stay connected.
            </div>
          )}

          {selectedType === 'parent' && hasActiveStudents && (
            <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-900">
              This account already has an active managed student. That student will remain connected.
            </div>
          )}

          {selectedType === 'parent' && !hasActiveStudents && (
            <fieldset className="space-y-4 rounded-lg border border-gray-200 p-4">
              <legend className="px-1 text-sm font-semibold text-[#1e293b]">First student</legend>
              <div className="space-y-2">
                <Label htmlFor={`setup-${customerId}-student-name`}>Student Name</Label>
                <Input
                  id={`setup-${customerId}-student-name`}
                  value={managedStudentName}
                  onChange={(event) => setManagedStudentName(event.target.value)}
                  maxLength={200}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`setup-${customerId}-student-email`}>Student Email</Label>
                <Input
                  id={`setup-${customerId}-student-email`}
                  type="email"
                  value={managedStudentEmail}
                  onChange={(event) => setManagedStudentEmail(event.target.value)}
                  maxLength={320}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`setup-${customerId}-student-phone`}>Student Phone</Label>
                <Input
                  id={`setup-${customerId}-student-phone`}
                  type="tel"
                  value={managedStudentPhone}
                  onChange={(event) => setManagedStudentPhone(event.target.value)}
                  maxLength={50}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`setup-${customerId}-student-grade`}>Student Grade</Label>
                <Select value={managedStudentGrade || undefined} onValueChange={setManagedStudentGrade}>
                  <SelectTrigger
                    id={`setup-${customerId}-student-grade`}
                    aria-label={`Student grade for ${customerName}`}
                    className="w-full"
                  >
                    <SelectValue placeholder="Select grade" />
                  </SelectTrigger>
                  <SelectContent>
                    {GRADE_OPTIONS.map((grade) => (
                      <SelectItem key={grade} value={grade}>{grade}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </fieldset>
          )}

          {selectedType === 'student' && (
            <fieldset className="space-y-4 rounded-lg border border-gray-200 p-4">
              <legend className="px-1 text-sm font-semibold text-[#1e293b]">Student details</legend>
              <p className="text-xs leading-5 text-gray-500">
                The account owner&apos;s name and email will be used for their student profile.
              </p>
              <div className="space-y-2">
                <Label htmlFor={`setup-${customerId}-owner-phone`}>Phone Number</Label>
                <Input
                  id={`setup-${customerId}-owner-phone`}
                  type="tel"
                  value={ownerPhone}
                  onChange={(event) => setOwnerPhone(event.target.value)}
                  maxLength={50}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`setup-${customerId}-owner-grade`}>Grade</Label>
                <Select value={ownerGrade || undefined} onValueChange={setOwnerGrade}>
                  <SelectTrigger
                    id={`setup-${customerId}-owner-grade`}
                    aria-label={`Grade for ${customerName}`}
                    className="w-full"
                  >
                    <SelectValue placeholder="Select grade" />
                  </SelectTrigger>
                  <SelectContent>
                    {GRADE_OPTIONS.map((grade) => (
                      <SelectItem key={grade} value={grade}>{grade}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </fieldset>
          )}

          {error && <p className="text-sm text-red-600" role="alert">{error}</p>}

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={saving}>Cancel</Button>
            </DialogClose>
            <Button type="submit" disabled={saving || !canSubmit} className="bg-[#1e293b] hover:bg-[#334155]">
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />}
              {accountType ? 'Change Account Type' : 'Complete Setup'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
