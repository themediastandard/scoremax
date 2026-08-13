"use client"

import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { Chrome } from 'lucide-react'
import type { AccountType } from '@/lib/account-type'

export function GoogleAuthButton({
  mode = 'signin',
  signupAccountType,
  studentGrade,
}: {
  mode?: 'signin' | 'signup'
  signupAccountType?: AccountType | null
  studentGrade?: string
}) {
  const signupDetailsMissing =
    mode === 'signup' &&
    (!signupAccountType || (signupAccountType === 'student' && !studentGrade))

  const handleGoogle = async () => {
    if (signupDetailsMissing) return

    const supabase = createClient()
    const callbackUrl = new URL('/auth/callback', window.location.origin)
    if (mode === 'signup' && signupAccountType) {
      callbackUrl.searchParams.set('account_type', signupAccountType)
      if (signupAccountType === 'student' && studentGrade) {
        callbackUrl.searchParams.set('student_grade', studentGrade)
      }
    }

    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: callbackUrl.toString(),
        queryParams: {
          access_type: 'offline',
          prompt: 'consent'
        }
      }
    })
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
