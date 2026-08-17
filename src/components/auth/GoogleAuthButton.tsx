"use client"

import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { Chrome } from 'lucide-react'
import type { AccountType } from '@/lib/account-type'
import { readBookContinuation } from '@/lib/auth-continuation'
import {
  signupStudentDraftError,
  writePendingGoogleSignup,
  type SignupStudentDraft,
} from '@/lib/signup-onboarding'

export function GoogleAuthButton({
  mode = 'signin',
  signupAccountType,
  studentGrade,
  signupStudents,
  next,
  onError,
}: {
  mode?: 'signin' | 'signup'
  signupAccountType?: AccountType | null
  studentGrade?: string
  signupStudents?: SignupStudentDraft[]
  next?: string | null
  onError?: (message: string) => void
}) {
  const signupDetailsMissing =
    mode === 'signup' &&
    (!signupAccountType || (signupAccountType === 'student' && !studentGrade))

  const handleGoogle = async () => {
    if (signupDetailsMissing) return

    const safeNext = readBookContinuation(next)
    if (mode === 'signup' && signupAccountType === 'parent') {
      const studentError = signupStudentDraftError(signupStudents)
      if (studentError) {
        onError?.(studentError)
        return
      }
      const stored = writePendingGoogleSignup(window.sessionStorage, {
        accountType: 'parent',
        students: signupStudents!,
        next: safeNext,
      })
      if (!stored) {
        onError?.('Your browser could not safely preserve the student details. Use email signup or enable session storage and try again.')
        return
      }
    } else if (mode === 'signup' && signupAccountType === 'student' && studentGrade) {
      const stored = writePendingGoogleSignup(window.sessionStorage, {
        accountType: 'student',
        studentGrade,
        next: safeNext,
      })
      if (!stored) {
        onError?.('Your browser could not safely preserve the grade. Use email signup or enable session storage and try again.')
        return
      }
    }

    const supabase = createClient()
    const callbackUrl = new URL('/auth/callback', window.location.origin)
    if (safeNext) callbackUrl.searchParams.set('next', safeNext)
    if (mode === 'signup' && signupAccountType) {
      callbackUrl.searchParams.set('account_type', signupAccountType)
    }

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: callbackUrl.toString(),
        queryParams: {
          access_type: 'offline',
          prompt: 'consent'
        }
      }
    })
    if (error) onError?.(error.message)
  }

  return (
    <Button 
      variant="outline" 
      onClick={handleGoogle} 
      disabled={signupDetailsMissing}
      type="button"
      className="w-full flex items-center justify-center gap-2"
    >
      <Chrome className="w-4 h-4" />
      {mode === 'signin' ? 'Sign in with Google' : 'Sign up with Google'}
    </Button>
  )
}
