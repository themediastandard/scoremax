"use client"

import { useState } from 'react'
import { CheckCircle, Loader2 } from 'lucide-react'

import { AUTH_CAPTCHA_CONFIGURED, AuthTurnstile } from '@/components/auth/AuthTurnstile'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase/client'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://www.scoremaxtutoring.com'

export function ResendSignupConfirmationForm() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)
  const [captchaGeneration, setCaptchaGeneration] = useState(0)
  const supabase = createClient()

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (AUTH_CAPTCHA_CONFIGURED && !captchaToken) {
      setError('Complete the security check to continue')
      return
    }

    const normalizedEmail = email.trim().toLowerCase()
    setLoading(true)
    setError(null)

    const { error: resendError } = await supabase.auth.resend({
      type: 'signup',
      email: normalizedEmail,
      options: {
        emailRedirectTo: new URL('/book', APP_URL).toString(),
        ...(captchaToken && { captchaToken }),
      },
    })

    if (resendError) {
      setError(resendError.message)
      setCaptchaToken(null)
      setCaptchaGeneration((generation) => generation + 1)
    } else {
      setEmail(normalizedEmail)
      setSent(true)
    }
    setLoading(false)
  }

  if (sent) {
    return (
      <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-center" role="status">
        <CheckCircle className="mx-auto mb-2 h-7 w-7 text-emerald-600" aria-hidden="true" />
        <p className="font-semibold text-[#1e293b]">Check your email</p>
        <p className="mt-1 text-sm leading-6 text-gray-600">
          We sent a new signup confirmation link to{' '}
          <span className="font-medium break-all text-[#1e293b]">{email}</span>.
          {' '}Use the newest message—older confirmation links will not work.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2 text-left">
        <Label htmlFor="confirmation-email">Email</Label>
        <Input
          id="confirmation-email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
      </div>

      {error && <p className="text-sm text-red-600" role="alert">{error}</p>}

      <AuthTurnstile
        key={captchaGeneration}
        action="register"
        onTokenChange={setCaptchaToken}
      />

      <Button
        type="submit"
        className="w-full bg-[#1e293b] hover:bg-[#0f172a]"
        disabled={loading || (AUTH_CAPTCHA_CONFIGURED && !captchaToken)}
      >
        {loading && <Loader2 className="animate-spin" aria-hidden="true" />}
        Send Me a New Confirmation Link
      </Button>
    </form>
  )
}
