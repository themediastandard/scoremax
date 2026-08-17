'use client'

import { ChangeEvent, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Camera, Check, Loader2, Trash2, UserRound } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

const MAX_PHOTO_BYTES = 5 * 1024 * 1024
const ALLOWED_PHOTO_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif'])

interface TutorPublicProfileFormProps {
  fullName: string
  bio: string
  photoUrl: string | null
  specialties: string[]
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}

function parseSpecialties(value: string) {
  const seen = new Set<string>()
  return value
    .split(',')
    .map((specialty) => specialty.trim())
    .filter((specialty) => {
      const key = specialty.toLocaleLowerCase()
      if (!specialty || seen.has(key)) return false
      seen.add(key)
      return true
    })
}

export function TutorPublicProfileForm({
  fullName,
  bio: initialBio,
  photoUrl: initialPhotoUrl,
  specialties: initialSpecialties,
}: TutorPublicProfileFormProps) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const initialSubjects = initialSpecialties.join(', ')
  const [bio, setBio] = useState(initialBio)
  const [subjects, setSubjects] = useState(initialSubjects)
  const [savedBio, setSavedBio] = useState(initialBio)
  const [savedSubjects, setSavedSubjects] = useState(initialSubjects)
  const [photoUrl, setPhotoUrl] = useState(initialPhotoUrl)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [removing, setRemoving] = useState(false)
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')

  const hasChanges = bio !== savedBio || subjects !== savedSubjects
  const busy = saving || uploading || removing

  async function saveProfile() {
    setSaving(true)
    setStatus('')
    setError('')

    try {
      const response = await fetch('/api/tutor/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bio, specialties: parseSpecialties(subjects) }),
      })
      const result = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(result.error || 'Could not save public profile')

      const savedSpecialties = Array.isArray(result.specialties) ? result.specialties.join(', ') : subjects
      const savedBioValue = typeof result.bio === 'string' ? result.bio : bio
      setBio(savedBioValue)
      setSubjects(savedSpecialties)
      setSavedBio(savedBioValue)
      setSavedSubjects(savedSpecialties)
      setStatus('Public profile saved.')
      router.refresh()
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Could not save public profile')
    } finally {
      setSaving(false)
    }
  }

  async function uploadPhoto(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    setStatus('')
    setError('')
    if (!ALLOWED_PHOTO_TYPES.has(file.type)) {
      setError('Use a JPEG, PNG, WebP, or AVIF image.')
      event.target.value = ''
      return
    }
    if (file.size > MAX_PHOTO_BYTES) {
      setError('Photo must be 5MB or smaller.')
      event.target.value = ''
      return
    }

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const response = await fetch('/api/tutor/profile/photo', {
        method: 'POST',
        body: formData,
      })
      const result = await response.json().catch(() => ({}))
      if (!response.ok || typeof result.url !== 'string') {
        throw new Error(result.error || 'Could not upload photo')
      }

      setPhotoUrl(result.url)
      setStatus('Profile photo updated.')
      router.refresh()
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : 'Could not upload photo')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  async function removePhoto() {
    setRemoving(true)
    setStatus('')
    setError('')

    try {
      const response = await fetch('/api/tutor/profile/photo', { method: 'DELETE' })
      const result = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(result.error || 'Could not remove photo')

      setPhotoUrl(null)
      setStatus('Profile photo removed.')
      router.refresh()
    } catch (removeError) {
      setError(removeError instanceof Error ? removeError.message : 'Could not remove photo')
    } finally {
      setRemoving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
        <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full border border-gray-200 bg-slate-50">
          {photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- user-uploaded Supabase host is project-specific and not wildcarded in next.config
            <img
              src={photoUrl}
              alt={`${fullName} profile photo`}
              className="h-full w-full object-cover"
            />
          ) : initials(fullName) ? (
            <span className="font-serif text-2xl font-semibold text-[#4a729f]" aria-hidden="true">
              {initials(fullName)}
            </span>
          ) : (
            <UserRound className="h-8 w-8 text-gray-500" aria-hidden="true" />
          )}
        </div>

        <div className="min-w-0 flex-1 space-y-3">
          <div>
            <Label htmlFor="tutor-profile-photo">Profile Photo</Label>
            <p id="tutor-profile-photo-help" className="mt-1 text-sm text-gray-600">
              JPEG, PNG, WebP, or AVIF. Maximum 5MB.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Input
              ref={fileInputRef}
              id="tutor-profile-photo"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif"
              aria-describedby="tutor-profile-photo-help"
              disabled={busy}
              onChange={uploadPhoto}
              className="max-w-sm cursor-pointer"
            />
            {photoUrl && (
              <Button
                type="button"
                variant="outline"
                onClick={removePhoto}
                disabled={busy}
                className="self-start text-red-600 hover:text-red-700"
              >
                {removing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                Remove photo
              </Button>
            )}
          </div>
          {uploading && (
            <p className="flex items-center gap-2 text-sm text-gray-600">
              <Camera className="h-4 w-4" aria-hidden="true" />
              Uploading photo…
            </p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between gap-3">
          <Label htmlFor="tutor-profile-bio">Public Bio</Label>
          <span className="text-xs font-medium text-gray-600">{bio.length}/2,000</span>
        </div>
        <Textarea
          id="tutor-profile-bio"
          value={bio}
          onChange={(event) => {
            setBio(event.target.value)
            setStatus('')
            setError('')
          }}
          maxLength={2000}
          rows={7}
          disabled={saving}
          aria-describedby="tutor-profile-bio-help"
          placeholder="Share your teaching experience, approach, and what students can expect."
        />
        <p id="tutor-profile-bio-help" className="text-sm text-gray-600">
          The public tutors page displays active tutors once their bio is at least 40 characters.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="tutor-profile-subjects">Subjects &amp; Specialties</Label>
        <Input
          id="tutor-profile-subjects"
          value={subjects}
          onChange={(event) => {
            setSubjects(event.target.value)
            setStatus('')
            setError('')
          }}
          disabled={saving}
          aria-describedby="tutor-profile-subjects-help"
          placeholder="SAT Math, Algebra, Physics"
        />
        <p id="tutor-profile-subjects-help" className="text-sm text-gray-600">
          Separate up to 12 subjects with commas. These appear on your public profile.
        </p>
      </div>

      <div className="flex flex-col gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:items-center">
        <Button
          type="button"
          onClick={saveProfile}
          disabled={saving || !hasChanges}
          className="self-start bg-[#1e293b]"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save Public Profile'}
        </Button>
        {hasChanges && !saving && !status && (
          <span className="text-sm font-medium text-amber-700">Unsaved profile changes</span>
        )}
        <div aria-live="polite" aria-atomic="true" className="min-h-5 text-sm">
          {status && (
            <span className="flex items-center gap-1.5 font-medium text-emerald-700">
              <Check className="h-4 w-4" aria-hidden="true" />
              {status}
            </span>
          )}
          {error && <span role="alert" className="font-medium text-red-700">{error}</span>}
        </div>
      </div>
    </div>
  )
}
