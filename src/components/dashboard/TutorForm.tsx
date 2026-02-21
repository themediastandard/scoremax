'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'

interface Tutor {
  id: string
  full_name: string
  email: string
  phone: string
  bio: string
  photo_url: string
  specialties: string[]
  is_active: boolean
}

export function TutorForm({ tutor }: { tutor?: Tutor }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [isActive, setIsActive] = useState(tutor ? tutor.is_active : true)
  const router = useRouter()

  const isEditing = !!tutor

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const specialties = (formData.get('specialties') as string).split(',').map(s => s.trim()).filter(Boolean)

    const data = {
      full_name: formData.get('full_name'),
      email: isEditing ? tutor!.email : formData.get('email'),
      phone: formData.get('phone'),
      bio: formData.get('bio'),
      photo_url: formData.get('photo_url'),
      specialties,
      password: formData.get('password'),
      is_active: isActive,
    }

    try {
      const url = isEditing ? `/api/admin/tutors/${tutor.id}` : '/api/admin/tutors'
      const method = isEditing ? 'PATCH' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || err.message || 'Failed to save tutor')
      }

      setOpen(false)
      router.refresh()
    } catch (error: any) {
      console.error(error)
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete() {
    if (!tutor) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/admin/tutors/${tutor.id}`, { method: 'DELETE' })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || 'Failed to delete tutor')
      }
      setOpen(false)
      setConfirmDelete(false)
      router.refresh()
    } catch (error: any) {
      console.error(error)
      alert(error.message)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setConfirmDelete(false) }}>
      <DialogTrigger asChild>
        <Button variant={isEditing ? 'ghost' : 'default'} className={isEditing ? 'text-[#517cad] hover:text-[#3b5c85]' : ''}>
          {isEditing ? 'Edit' : 'Add Tutor'}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Tutor' : 'Add New Tutor'}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Update tutor details below.' : 'Create a new tutor account. Provide a temporary password to share with them.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="full_name">Full Name</Label>
            <Input id="full_name" name="full_name" defaultValue={tutor?.full_name} required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" defaultValue={tutor?.email} required disabled={isEditing} />
          </div>
          {!isEditing && (
            <div className="grid gap-2">
              <Label htmlFor="password">Temporary Password</Label>
              <Input id="password" name="password" type="text" required minLength={6} placeholder="Shared with tutor" />
            </div>
          )}
          <div className="grid gap-2">
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" name="phone" type="tel" defaultValue={tutor?.phone} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="photo_url">Photo URL (Optional)</Label>
            <Input id="photo_url" name="photo_url" type="url" defaultValue={tutor?.photo_url} placeholder="https://..." />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="specialties">Specialties (comma separated)</Label>
            <Input id="specialties" name="specialties" defaultValue={tutor?.specialties?.join(', ')} placeholder="Math, Physics, SAT" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea id="bio" name="bio" defaultValue={tutor?.bio} />
          </div>
          
          <div className="flex items-center space-x-2 pt-2">
            <Switch 
              id="is_active" 
              checked={isActive} 
              onCheckedChange={setIsActive} 
            />
            <Label htmlFor="is_active">Active Account</Label>
          </div>

          <div className="flex justify-end gap-3 mt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save'}</Button>
          </div>
        </form>

        {isEditing && (
          <div className="border-t border-gray-100 pt-4 mt-2">
            {!confirmDelete ? (
              <Button
                variant="ghost"
                className="text-red-500 hover:text-red-700 hover:bg-red-50 w-full"
                onClick={() => setConfirmDelete(true)}
              >
                Delete Tutor
              </Button>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-red-600 text-center">
                  This will permanently delete <strong>{tutor!.full_name}</strong> and their account. This cannot be undone.
                </p>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setConfirmDelete(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    className="flex-1"
                    disabled={deleting}
                    onClick={handleDelete}
                  >
                    {deleting ? 'Deleting...' : 'Confirm Delete'}
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
