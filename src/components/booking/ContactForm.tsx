"use client"

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { GRADE_OPTIONS } from '@/lib/student-grades'
import { Loader2 } from 'lucide-react'
import Link from 'next/link'
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
  /** Set when the server confirms a signed-in user; suppresses the email input. */
  signedInEmail?: string | null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  externalMemberStatus?: any
}

export function ContactForm({ value, onChange, onMemberCheck, externalMemberStatus, signedInEmail }: ContactFormProps) {
  const [checking, setChecking] = useState(false)
  const [hasExistingAccount, setHasExistingAccount] = useState(false)
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
      const res = await fetch('/api/customer/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: normalized }),
      })
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
    // Nothing to autofill when signed in — the address is rendered as text, so
    // the element this looks for is a div with no .value to read.
    if (signedInEmail) return
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

  // A signed-out visitor typing an address that already has an account is about
  // to pay for credit they may already own. /api/customer/check cannot help
  // here — it resolves the customer from the session and returns an empty
  // summary to anyone signed out, precisely so it cannot be used to read a
  // stranger's balance. This asks the one question that is safe to answer.
  useEffect(() => {
    if (signedInEmail) return
    const email = value.email?.trim()
    if (!email?.includes('@')) {
      setHasExistingAccount(false)
      return
    }

    let cancelled = false
    const t = setTimeout(async () => {
      try {
        const res = await fetch('/api/customer/account-exists', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        })
        if (!res.ok) return
        const data = await res.json()
        if (!cancelled) setHasExistingAccount(!!data.hasAccount)
      } catch {
        // Silent: the prompt is a courtesy, not a requirement.
      }
    }, 600)

    return () => {
      cancelled = true
      clearTimeout(t)
    }
  }, [value.email, signedInEmail])

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
          {signedInEmail ? (
            // Signed in: state the address rather than ask for it again. It stays
            // in form state and is still submitted, but editing it here could not
            // move the booking to another account anyway — both the credit lookup
            // and the Stripe webhook resolve the customer from the session, never
            // from this field.
            <div
              data-booking-email
              className="flex flex-wrap items-center gap-x-2 rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700"
            >
              <span className="font-medium break-all">{signedInEmail}</span>
              <span className="text-xs text-gray-400">Signed in</span>
            </div>
          ) : (
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
          )}
          {memberStatus?.isMember && (
            <div className="mt-2 flex items-center space-x-2 text-green-600 bg-green-50 p-2 rounded text-sm">
              <Badge variant="outline" className="border-green-600 text-green-600">Member</Badge>
              <span>Welcome back! You have {memberStatus.totalCredits} session credits available.</span>
            </div>
          )}
          {!signedInEmail && hasExistingAccount && (
            // Says only that an account exists. Any credit balance stays behind
            // the sign-in, which is the whole reason this is a separate check.
            <div className="mt-2 rounded border border-[#b08a30]/30 bg-amber-50 p-2 text-sm text-[#8a6a25]">
              You already have a ScoreMax account.{' '}
              <Link
                href={`/login?next=${encodeURIComponent('/book')}`}
                className="font-semibold underline underline-offset-2 hover:text-[#6d5320]"
              >
                Sign in
              </Link>{' '}
              to use any credits you have before paying again.
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
          {/* Same list the account settings form uses — this writes to the same
              customers.student_grade column, so the two must agree. */}
          <Select
            value={value.studentGrade || undefined}
            onValueChange={(val) => handleChange('studentGrade', val)}
          >
            <SelectTrigger id="grade" className="w-full">
              <SelectValue placeholder="Select grade" />
            </SelectTrigger>
            <SelectContent>
              {/* A grade saved before this was a dropdown still shows until the
                  customer picks a canonical one. */}
              {value.studentGrade && !GRADE_OPTIONS.includes(value.studentGrade) && (
                <SelectItem value={value.studentGrade}>{value.studentGrade}</SelectItem>
              )}
              {GRADE_OPTIONS.map((g) => (
                <SelectItem key={g} value={g}>{g}</SelectItem>
              ))}
            </SelectContent>
          </Select>
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