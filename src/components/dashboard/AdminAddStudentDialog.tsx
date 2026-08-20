'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, UserPlus } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
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
import { GRADE_OPTIONS } from '@/lib/student-grades'

const EMPTY_FORM = { fullName: '', email: '', phone: '', grade: '' }

export function AdminAddStudentDialog({
  customerId,
  customerName,
}: {
  customerId: string
  customerName: string
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleOpenChange = (nextOpen: boolean) => {
    if (saving) return
    if (nextOpen) {
      setForm(EMPTY_FORM)
      setError(null)
    }
    setOpen(nextOpen)
  }

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!form.fullName.trim() || !form.email.trim() || !form.phone.trim() || !form.grade) {
      setError('Name, email, phone, and grade are required.')
      return
    }

    setSaving(true)
    setError(null)
    try {
      const response = await fetch(
        `/api/admin/customers/${encodeURIComponent(customerId)}/students`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        }
      )
      const result = await response.json().catch(() => null) as {
        error?: string
        student?: { id?: string }
      } | null
      if (!response.ok || !result?.student?.id) {
        throw new Error(result?.error || 'Could not add student')
      }

      setOpen(false)
      setForm(EMPTY_FORM)
      router.refresh()
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Could not add student')
    } finally {
      setSaving(false)
    }
  }

  const idPrefix = `admin-student-${customerId}`

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button type="button" size="sm" className="bg-[#1e293b] hover:bg-[#334155]">
          <UserPlus aria-hidden="true" />
          Add Student
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-lg">
        <form onSubmit={submit} className="space-y-5">
          <DialogHeader>
            <DialogTitle>Add a student</DialogTitle>
            <DialogDescription>
              Add a managed student to {customerName}&apos;s account. They will be available for future bookings and orders.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor={`${idPrefix}-name`}>Student Name</Label>
              <Input
                id={`${idPrefix}-name`}
                value={form.fullName}
                onChange={(event) => setForm((current) => ({ ...current, fullName: event.target.value }))}
                maxLength={200}
                autoComplete="name"
                required
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor={`${idPrefix}-email`}>Student Email</Label>
              <Input
                id={`${idPrefix}-email`}
                type="email"
                value={form.email}
                onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                maxLength={320}
                autoComplete="email"
                required
              />
              <p className="text-xs leading-5 text-gray-500">Receives schedules and reminders. This does not create a login.</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor={`${idPrefix}-phone`}>Student Phone</Label>
              <Input
                id={`${idPrefix}-phone`}
                type="tel"
                value={form.phone}
                onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))}
                maxLength={50}
                autoComplete="tel"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`${idPrefix}-grade`}>Student Grade</Label>
              <Select
                value={form.grade || undefined}
                onValueChange={(grade) => setForm((current) => ({ ...current, grade }))}
              >
                <SelectTrigger
                  id={`${idPrefix}-grade`}
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
          </div>

          {error && <p className="text-sm text-red-600" role="alert">{error}</p>}

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={saving}>Cancel</Button>
            </DialogClose>
            <Button type="submit" disabled={saving} className="bg-[#1e293b] hover:bg-[#334155]">
              {saving && <Loader2 className="animate-spin" aria-hidden="true" />}
              Add Student
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
