"use client"

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { siteImages } from '@/lib/site-images'
import { Label } from '@/components/ui/label'
import { GoogleAuthButton } from '@/components/auth/GoogleAuthButton'
import { AUTH_CAPTCHA_CONFIGURED, AuthTurnstile } from '@/components/auth/AuthTurnstile'
import Link from 'next/link'
import { Loader2, Eye, EyeOff, GraduationCap, TrendingUp, Award } from 'lucide-react'
import { readBookContinuation, withBookContinuation } from '@/lib/auth-continuation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  // Set when the failed address last signed in with Google. A Google user has
  // no password to get right, so "Invalid login credentials" sends them in
  // circles — which is exactly how a real account got stuck.
  const [lastUsedGoogle, setLastUsedGoogle] = useState(false)
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)
  const [captchaGeneration, setCaptchaGeneration] = useState(0)
  const [nextPath, setNextPath] = useState<'/book' | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    setNextPath(readBookContinuation(new URLSearchParams(window.location.search).get('next')))
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLastUsedGoogle(false)
    if (AUTH_CAPTCHA_CONFIGURED && !captchaToken) {
      setError('Complete the security check to continue')
      return
    }
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithPassword({
      email: email.toLowerCase().trim(),
      password,
      options: {
        ...(captchaToken && { captchaToken }),
      },
    })

    if (error) {
      setCaptchaToken(null)
      setCaptchaGeneration((generation) => generation + 1)
      // Before showing a generic failure, check whether this address last got
      // in with Google. Never let this lookup change the outcome.
      try {
        const res = await fetch('/api/auth/last-provider', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: email.toLowerCase().trim() }),
        })
        const { provider } = await res.json()
        setLastUsedGoogle(provider === 'google')
      } catch {
        setLastUsedGoogle(false)
      }
      setError(error.message)
      setLoading(false)
    } else {
      // Keep last_auth_provider current so the hint stays accurate. Fire and
      // forget — a failed write must never hold up a successful sign-in.
      fetch('/api/auth/record-login-provider', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider: 'email' }),
      }).catch(() => {})

      router.push(nextPath ?? '/dashboard')
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel: premium branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#1e293b] flex-col p-12 xl:p-16">
        <Link href="/" className="inline-block w-fit shrink-0">
          <Image
            src={siteImages.logoWide}
            alt="ScoreMax"
            width={200}
            height={50}
            className="h-8 w-auto brightness-0 invert"
          />
        </Link>
        <div className="flex-1 flex flex-col justify-center">
          <div className="space-y-8">
          <div className="uppercase font-[family-name:var(--font-playfair)] text-xs tracking-widest text-[#b08a30] font-semibold mb-3">
            Welcome back
          </div>
          <h2 className="font-[family-name:var(--font-playfair)] text-3xl xl:text-4xl text-white leading-tight tracking-tight">
            Unlock your test score potential
          </h2>
          <div className="w-10 h-[2px] bg-[#b08a30]" />
          <p className="font-[family-name:var(--font-playfair)] text-slate-300 text-sm leading-relaxed max-w-md">
            Expert 1-on-1 tutoring for SAT, ACT, and academic subjects. Personalized study plans that deliver results.
          </p>
          <div className="flex flex-col gap-4 pt-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[#b08a30]/15 border border-[#b08a30]/30 flex items-center justify-center shrink-0">
                <GraduationCap className="w-6 h-6 text-[#b08a30]" strokeWidth={1.5} />
              </div>
              <span className="font-[family-name:var(--font-playfair)] text-base text-white leading-relaxed">Certified expert tutors</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[#b08a30]/15 border border-[#b08a30]/30 flex items-center justify-center shrink-0">
                <TrendingUp className="w-6 h-6 text-[#b08a30]" strokeWidth={1.5} />
              </div>
              <span className="font-[family-name:var(--font-playfair)] text-base text-white leading-relaxed">Proven score improvements</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[#b08a30]/15 border border-[#b08a30]/30 flex items-center justify-center shrink-0">
                <Award className="w-6 h-6 text-[#b08a30]" strokeWidth={1.5} />
              </div>
              <span className="font-[family-name:var(--font-playfair)] text-base text-white leading-relaxed">Personalized learning plans</span>
            </div>
          </div>
        </div>
        </div>
      </div>

      {/* Right panel: login form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 bg-white">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8 flex justify-center">
            <Link href="/">
              <Image
                src={siteImages.logoWide}
                alt="ScoreMax"
                width={140}
                height={36}
                className="h-7 w-auto"
              />
            </Link>
          </div>
          <div className="text-center">
            <div className="uppercase font-[family-name:var(--font-playfair)] text-xs tracking-widest text-[#b08a30] font-semibold mb-3">
              Account
            </div>
            <h1 className="font-[family-name:var(--font-playfair)] text-3xl lg:text-4xl text-black mb-2">
              Sign in to ScoreMax
            </h1>
            <div className="w-10 h-[2px] bg-[#b08a30] mx-auto mb-5" />
            <p className="text-black text-sm leading-relaxed mb-8">
              Welcome back. Enter your details to continue.
            </p>
          </div>

          <GoogleAuthButton mode="signin" next={nextPath} />

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white px-3 text-xs uppercase tracking-widest text-gray-500">
                Or continue with email
              </span>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                {/*
                  tabIndex={-1} used to take this out of the tab order entirely,
                  so a keyboard-only user could not reach password recovery at
                  all — they could focus the password field but never the way
                  out of it (WCAG 2.1.1). Enlarged to 19px bold as well, so the
                  gold clears contrast at the large-text threshold.
                */}
                <Link href="/forgot-password" className="text-sm text-[#b08a30] underline font-medium">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pr-10 h-11"
                />
                <button
                  type="button"
                  tabIndex={0}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 p-1 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <AuthTurnstile
              key={captchaGeneration}
              action="login"
              onTokenChange={setCaptchaToken}
            />

            {error && !lastUsedGoogle && (
              <p className="text-sm text-red-500">{error}</p>
            )}

            {lastUsedGoogle && (
              <div className="rounded-md border border-amber-200 bg-amber-50 p-3 space-y-2">
                <p className="text-sm text-amber-900">
                  You used <strong>Sign in with Google</strong> the last time you
                  logged in. Use the Google button above. Your password won&rsquo;t
                  work for that account.
                </p>
                <p className="text-xs text-amber-800">
                  Want a password as well? Sign in with Google first, then set one
                  from your account settings.
                </p>
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-11 bg-[#b08a30] hover:bg-[#9a7628] text-white font-[family-name:var(--font-playfair)]"
              disabled={loading || (AUTH_CAPTCHA_CONFIGURED && !captchaToken)}
            >
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Sign In'}
            </Button>
          </form>

          <p className="mt-8 text-center text-sm text-gray-500 leading-relaxed">
            Don&apos;t have an account?{' '}
            {/*
              Inline inside a 14px sentence, so the "enlarge and keep the gold"
              approach used for standalone labels cannot apply here without
              breaking the line box. Set in the body colour with a permanent
              underline instead — same treatment as links in the legal pages.
            */}
            <Link href={withBookContinuation('/register', nextPath)} className="text-gray-900 underline font-semibold font-[family-name:var(--font-playfair)]">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
