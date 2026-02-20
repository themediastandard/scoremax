"use client"

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Loader2 } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'

interface ContactFormProps {
  value: {
    fullName: string
    email: string
    phone: string
    studentGrade: string
    notes: string
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onChange: (value: any) => void
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onMemberCheck: (status: any) => void
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  externalMemberStatus?: any
}

export function ContactForm({ value, onChange, onMemberCheck, externalMemberStatus }: ContactFormProps) {
  const [checking, setChecking] = useState(false)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [internalMemberStatus, setInternalMemberStatus] = useState<any>(null)

  const memberStatus = internalMemberStatus || externalMemberStatus

  const lastCheckedEmail = useRef<string | null>(null)

  const runCheck = async (emailToCheck: string) => {
    const normalized = emailToCheck?.trim().toLowerCase()
    if (!normalized?.includes('@')) return
    if (lastCheckedEmail.current === normalized) return

    lastCheckedEmail.current = normalized
    setChecking(true)
    try {
      const res = await fetch(`/api/customer/check?email=${encodeURIComponent(normalized)}`)
      const data = await res.json()
      setInternalMemberStatus(data)
      onMemberCheck(data)
    } catch (err) {
      console.error(err)
      lastCheckedEmail.current = null
    } finally {
      setChecking(false)
    }
  }

  const handleBlur = () => {
    runCheck(value.email)
  }

  // Detect autofill: browser can populate the input without triggering React state. Poll the DOM briefly.
  useEffect(() => {
    const input = document.querySelector<HTMLInputElement>('[data-booking-email]')
    if (!input) return

    let count = 0
    const maxAttempts = 10
    const interval = setInterval(() => {
      const domValue = input.value?.trim()
      if (domValue?.includes('@') && domValue !== lastCheckedEmail.current) {
        onChange({ ...value, email: domValue })
        runCheck(domValue)
        clearInterval(interval)
        return
      }
      count++
      if (count >= maxAttempts) clearInterval(interval)
    }, 200)

    return () => clearInterval(interval)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // When value.email changes (typing or sync from elsewhere), run check after a short debounce
  useEffect(() => {
    const email = value.email?.trim()
    if (!email?.includes('@')) return

    const t = setTimeout(() => runCheck(email), 400)
    return () => clearTimeout(t)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value.email])

  const handleChange = (field: string, val: string) => {
    onChange({ ...value, [field]: val })
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-serif text-[#1e293b]">How can we reach you?</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="fullName">Full Name</Label>
          <Input 
            id="fullName" 
            value={value.fullName} 
            onChange={(e) => handleChange('fullName', e.target.value)} 
            placeholder="Student or Parent Name"
          />
        </div>
        
        <div className="space-y-2 relative">
          <Label htmlFor="email">Email Address</Label>
          <div className="relative">
            <Input 
              id="email" 
              type="email" 
              data-booking-email
              value={value.email} 
              onChange={(e) => handleChange('email', e.target.value)} 
              onBlur={handleBlur}
              placeholder="you@example.com"
            />
            {checking && <Loader2 className="absolute right-3 top-2.5 h-4 w-4 animate-spin text-gray-400" />}
          </div>
          {memberStatus?.isMember && (
            <div className="mt-2 flex items-center space-x-2 text-green-600 bg-green-50 p-2 rounded text-sm">
              <Badge variant="outline" className="border-green-600 text-green-600">Member</Badge>
              <span>Welcome back! You have {memberStatus.totalCredits} session credits available.</span>
            </div>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number</Label>
          <Input 
            id="phone" 
            type="tel" 
            value={value.phone} 
            onChange={(e) => handleChange('phone', e.target.value)} 
            placeholder="(555) 123-4567"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="grade">Student Grade (Optional)</Label>
          <Input 
            id="grade" 
            value={value.studentGrade} 
            onChange={(e) => handleChange('studentGrade', e.target.value)} 
            placeholder="e.g. 11th Grade"
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="notes">Notes or Goals (Optional)</Label>
        <Textarea 
          id="notes" 
          value={value.notes} 
          onChange={(e) => handleChange('notes', e.target.value)} 
          placeholder="Anything specific you'd like the tutor to focus on?"
          className="min-h-[100px]"
        />
      </div>
    </div>
  )
}