'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Pencil } from 'lucide-react'

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

export function AdminCustomerOwnerControl({
  customerId,
  customerEmail,
  initialName,
  initialPhone,
}: {
  customerId: string
  customerEmail: string
  initialName: string | null
  initialPhone: string | null
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [savedName, setSavedName] = useState(initialName)
  const [savedPhone, setSavedPhone] = useState(initialPhone)
  const [fullName, setFullName] = useState(initialName ?? '')
  const [phone, setPhone] = useState(initialPhone ?? '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setSavedName(initialName)
    setSavedPhone(initialPhone)
    setFullName(initialName ?? '')
    setPhone(initialPhone ?? '')
  }, [initialName, initialPhone])

  const handleOpenChange = (nextOpen: boolean) => {
    if (saving) return
    if (nextOpen) {
      setFullName(savedName ?? '')
      setPhone(savedPhone ?? '')
      setError(null)
    }
    setOpen(nextOpen)
  }

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!fullName.trim() || !phone.trim()) {
      setError('Enter the account owner name and phone number.')
      return
    }

    setSaving(true)
    setError(null)
    try {
      const response = await fetch(
        `/api/admin/customers/${encodeURIComponent(customerId)}/owner`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fullName,
            phone,
            expectedFullName: savedName,
            expectedPhone: savedPhone,
          }),
        }
      )
      const result = await response.json().catch(() => null) as {
        error?: string
        fullName?: string | null
        phone?: string | null
      } | null

      if (!response.ok || typeof result?.fullName !== 'string' || typeof result.phone !== 'string') {
        if (response.status === 409 && result) {
          setSavedName(result.fullName ?? null)
          setSavedPhone(result.phone ?? null)
        }
        throw new Error(result?.error || 'Could not update the account owner')
      }

      setSavedName(result.fullName)
      setSavedPhone(result.phone)
      setFullName(result.fullName)
      setPhone(result.phone)
      setOpen(false)
      router.refresh()
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Could not update the account owner')
    } finally {
      setSaving(false)
    }
  }

  const idPrefix = `admin-customer-${customerId}-owner`
  const ownerLabel = savedName?.trim() || customerEmail

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="xs"
          className="text-[#4a729f] hover:bg-[#4a729f]/10 hover:text-[#3b5c85]"
          aria-label={`Edit account owner details for ${ownerLabel}`}
        >
          <Pencil aria-hidden="true" />
          Edit
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <form onSubmit={submit} className="space-y-5">
          <DialogHeader>
            <DialogTitle>Edit account owner</DialogTitle>
            <DialogDescription>
              Update the name and phone number connected to {customerEmail}.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <Label htmlFor={`${idPrefix}-name`}>Name</Label>
            <Input
              id={`${idPrefix}-name`}
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              maxLength={120}
              autoComplete="name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor={`${idPrefix}-phone`}>Phone Number</Label>
            <Input
              id={`${idPrefix}-phone`}
              type="tel"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              maxLength={50}
              autoComplete="tel"
              required
            />
          </div>

          {error && <p className="text-sm text-red-600" role="alert">{error}</p>}

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={saving}>Cancel</Button>
            </DialogClose>
            <Button type="submit" disabled={saving} className="bg-[#1e293b] hover:bg-[#334155]">
              {saving && <Loader2 className="animate-spin" aria-hidden="true" />}
              Save Account Owner
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
