"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Loader2, Check } from 'lucide-react'

interface ProfileFormProps {
  fullName: string
  email: string
  phone: string
  studentGrade: string
  role: string
}

export function ProfileForm({ fullName, email, phone, studentGrade, role }: ProfileFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)

  const [name, setName] = useState(fullName)
  const [ph, setPh] = useState(phone)
  const [grade, setGrade] = useState(studentGrade)

  const hasChanges = name !== fullName || ph !== phone || grade !== studentGrade

  const handleSave = async () => {
    setLoading(true)
    setSaved(false)
    try {
      const res = await fetch('/api/account/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: name,
          phone: ph,
          studentGrade: grade,
        })
      })
      if (res.ok) {
        setSaved(true)
        router.refresh()
        setTimeout(() => setSaved(false), 3000)
      } else {
        const err = await res.json()
        alert(err.error || 'Failed to update')
      }
    } catch {
      alert('Error updating profile')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Full Name</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Email</Label>
          <Input value={email} readOnly className="bg-gray-50 text-gray-500" />
          <p className="text-xs text-gray-400">Email cannot be changed</p>
        </div>
        <div className="space-y-2">
          <Label>Phone Number</Label>
          <Input value={ph} onChange={(e) => setPh(e.target.value)} placeholder="(555) 123-4567" />
        </div>
        {role === 'customer' && (
          <div className="space-y-2">
            <Label>Student Grade</Label>
            <Input value={grade} onChange={(e) => setGrade(e.target.value)} placeholder="e.g. 11th Grade" />
          </div>
        )}
      </div>
      <div className="flex items-center gap-3 pt-2">
        <Button onClick={handleSave} disabled={loading || !hasChanges} className="bg-[#1e293b]">
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Save Changes'}
        </Button>
        {saved && (
          <span className="flex items-center gap-1.5 text-sm text-emerald-600">
            <Check className="h-4 w-4" />
            Saved
          </span>
        )}
        {hasChanges && !saved && (
          <span className="flex items-center gap-1.5 text-xs text-amber-600">
            <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
            Unsaved changes
          </span>
        )}
      </div>
    </div>
  )
}
