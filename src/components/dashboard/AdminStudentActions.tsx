'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, MoreHorizontal, Pencil, RotateCcw, Trash2, UserRoundX } from 'lucide-react'

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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function AdminStudentActions({
  customerId,
  studentId,
  studentName,
  studentPhone,
  isActive,
  isAccountOwner,
}: {
  customerId: string
  studentId: string
  studentName: string
  studentPhone: string | null
  isActive: boolean
  isAccountOwner: boolean
}) {
  const router = useRouter()
  const [currentName, setCurrentName] = useState(studentName)
  const [currentPhone, setCurrentPhone] = useState(studentPhone)
  const [currentActive, setCurrentActive] = useState(isActive)
  const [editOpen, setEditOpen] = useState(false)
  const [fullName, setFullName] = useState(studentName)
  const [phone, setPhone] = useState(studentPhone ?? '')
  const [editing, setEditing] = useState(false)
  const [editError, setEditError] = useState<string | null>(null)
  const [updating, setUpdating] = useState(false)
  const [statusError, setStatusError] = useState<string | null>(null)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  useEffect(() => {
    setCurrentName(studentName)
    setCurrentPhone(studentPhone)
    setFullName(studentName)
    setPhone(studentPhone ?? '')
  }, [studentName, studentPhone])

  useEffect(() => {
    setCurrentActive(isActive)
  }, [isActive])

  const handleEditOpenChange = (nextOpen: boolean) => {
    if (editing) return
    if (nextOpen) {
      setFullName(currentName)
      setPhone(currentPhone ?? '')
      setEditError(null)
    }
    setEditOpen(nextOpen)
  }

  const updateDetails = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!fullName.trim() || !phone.trim()) {
      setEditError('Enter the student name and phone number.')
      return
    }

    setEditing(true)
    setEditError(null)
    try {
      const response = await fetch(
        `/api/admin/customers/${encodeURIComponent(customerId)}/students/${encodeURIComponent(studentId)}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'details',
            fullName,
            phone,
            expectedFullName: currentName,
            expectedPhone: currentPhone,
          }),
        }
      )
      const result = await response.json().catch(() => null) as {
        error?: string
        fullName?: string
        phone?: string | null
      } | null

      if (!response.ok || typeof result?.fullName !== 'string' || typeof result.phone !== 'string') {
        if (response.status === 409 && typeof result?.fullName === 'string') {
          setCurrentName(result.fullName)
          setCurrentPhone(result.phone ?? null)
          setFullName(result.fullName)
          setPhone(result.phone ?? '')
          router.refresh()
        }
        throw new Error(result?.error || 'Could not update the student details')
      }

      setCurrentName(result.fullName)
      setCurrentPhone(result.phone)
      setFullName(result.fullName)
      setPhone(result.phone)
      setEditOpen(false)
      router.refresh()
    } catch (updateError) {
      setEditError(updateError instanceof Error ? updateError.message : 'Could not update the student details')
    } finally {
      setEditing(false)
    }
  }

  const updateStatus = async () => {
    const nextActive = !currentActive
    setUpdating(true)
    setStatusError(null)
    try {
      const response = await fetch(
        `/api/admin/customers/${encodeURIComponent(customerId)}/students/${encodeURIComponent(studentId)}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'status',
            isActive: nextActive,
            expectedIsActive: currentActive,
          }),
        }
      )
      const result = await response.json().catch(() => null) as {
        error?: string
        isActive?: boolean
      } | null

      if (!response.ok || typeof result?.isActive !== 'boolean') {
        if (response.status === 409 && typeof result?.isActive === 'boolean') {
          setCurrentActive(result.isActive)
          router.refresh()
        }
        throw new Error(result?.error || 'Could not update the student status')
      }

      setCurrentActive(result.isActive)
      router.refresh()
    } catch (updateError) {
      setStatusError(updateError instanceof Error ? updateError.message : 'Could not update the student status')
    } finally {
      setUpdating(false)
    }
  }

  const handleDeleteOpenChange = (nextOpen: boolean) => {
    if (deleting) return
    setDeleteError(null)
    setDeleteOpen(nextOpen)
  }

  const deleteStudent = async () => {
    setDeleting(true)
    setDeleteError(null)
    try {
      const response = await fetch(
        `/api/admin/customers/${encodeURIComponent(customerId)}/students/${encodeURIComponent(studentId)}`,
        {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ expectedIsActive: currentActive }),
        }
      )
      const result = await response.json().catch(() => null) as {
        error?: string
        deleted?: boolean
        isActive?: boolean
      } | null

      if (!response.ok || result?.deleted !== true) {
        if (response.status === 409 && typeof result?.isActive === 'boolean') {
          setCurrentActive(result.isActive)
          router.refresh()
        }
        throw new Error(result?.error || 'Could not delete the student')
      }

      setDeleteOpen(false)
      router.refresh()
    } catch (removeError) {
      setDeleteError(removeError instanceof Error ? removeError.message : 'Could not delete the student')
    } finally {
      setDeleting(false)
    }
  }

  const deleteDisabled = currentActive || isAccountOwner || updating || editing
  const deleteLabel = isAccountOwner
    ? 'Required account profile'
    : currentActive ? 'Deactivate before deleting' : 'Delete student'

  return (
    <div data-admin-student-actions className="flex flex-col items-end gap-1">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            disabled={updating || deleting || editing}
            aria-label={`Manage ${currentName}`}
          >
            {updating ? (
              <Loader2 className="animate-spin" aria-hidden="true" />
            ) : (
              <MoreHorizontal aria-hidden="true" />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          {isAccountOwner && (
            <>
              <DropdownMenuLabel className="text-xs leading-5 text-slate-500">
                Required student account profile
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
            </>
          )}
          <DropdownMenuItem
            disabled={isAccountOwner || editing}
            onSelect={() => setEditOpen(true)}
          >
            <Pencil aria-hidden="true" />
            {isAccountOwner ? 'Edit through Account Owner' : 'Edit student'}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            disabled={isAccountOwner || updating}
            onSelect={() => void updateStatus()}
          >
            {currentActive ? (
              <UserRoundX aria-hidden="true" />
            ) : (
              <RotateCcw aria-hidden="true" />
            )}
            {currentActive ? 'Deactivate student' : 'Activate student'}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            disabled={deleteDisabled}
            onSelect={() => setDeleteOpen(true)}
          >
            <Trash2 aria-hidden="true" />
            {deleteLabel}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {statusError && (
        <p className="max-w-52 text-right text-xs leading-4 text-red-600" role="alert">
          {statusError}
        </p>
      )}

      <Dialog open={editOpen} onOpenChange={handleEditOpenChange}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={updateDetails} className="space-y-5">
            <DialogHeader>
              <DialogTitle>Edit student</DialogTitle>
              <DialogDescription>
                Update this student&apos;s name and phone number. Email and grade stay unchanged.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-2">
              <Label htmlFor={`admin-student-${studentId}-name`}>Student Name</Label>
              <Input
                id={`admin-student-${studentId}-name`}
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                maxLength={120}
                autoComplete="name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`admin-student-${studentId}-phone`}>Phone Number</Label>
              <Input
                id={`admin-student-${studentId}-phone`}
                type="tel"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                maxLength={50}
                autoComplete="tel"
                required
              />
            </div>

            {editError && <p className="text-sm text-red-600" role="alert">{editError}</p>}

            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline" disabled={editing}>Cancel</Button>
              </DialogClose>
              <Button type="submit" disabled={editing} className="bg-[#1e293b] hover:bg-[#334155]">
                {editing && <Loader2 className="animate-spin" aria-hidden="true" />}
                Save Student
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteOpen} onOpenChange={handleDeleteOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete {currentName}?</DialogTitle>
            <DialogDescription>
              This permanently removes the student from this account. Students with orders,
              sessions, credits, or course history cannot be deleted and should remain inactive.
            </DialogDescription>
          </DialogHeader>

          {deleteError && <p className="text-sm text-red-600" role="alert">{deleteError}</p>}

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={deleting}>Cancel</Button>
            </DialogClose>
            <Button type="button" variant="destructive" disabled={deleting} onClick={deleteStudent}>
              {deleting && <Loader2 className="animate-spin" aria-hidden="true" />}
              Delete Student
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
