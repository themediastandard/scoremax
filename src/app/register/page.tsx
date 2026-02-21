"use client"

import { useState } from 'react'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { GoogleAuthButton } from '@/components/auth/GoogleAuthButton'
import Link from 'next/link'
import { Loader2, Eye, EyeOff, GraduationCap, TrendingUp, Award } from 'lucide-react'

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signUp({
      email: email.toLowerCase().trim(),
      password,
      options: {
        data: {
          full_name: fullName,
          role: 'customer'
        }
      }
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/dashboard')
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel: premium branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#1e293b] flex-col p-12 xl:p-16">
        <Link href="/" className="inline-block w-fit shrink-0">
          <Image
            src="/Images/score-max-logo-wide.png"
            alt="ScoreMax"
            width={200}
            height={50}
            className="h-8 w-auto brightness-0 invert"
          />
        </Link>
        <div className="flex-1 flex flex-col justify-center">
          <div className="space-y-8">
          <div className="uppercase text-xs tracking-widest text-[#b08a30] font-semibold mb-3">
            Get started
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

      {/* Right panel: register form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 bg-white">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8 flex justify-center">
            <Link href="/">
              <Image
                src="/Images/score-max-logo-wide.png"
                alt="ScoreMax"
                width={140}
                height={36}
                className="h-7 w-auto"
              />
            </Link>
          </div>
          <div className="text-center">
            <div className="uppercase text-xs tracking-widest text-[#b08a30] font-semibold mb-3">
              Account
            </div>
            <h1 className="font-[family-name:var(--font-playfair)] text-3xl lg:text-4xl text-black mb-2">
              Create an account
            </h1>
            <div className="w-10 h-[2px] bg-[#b08a30] mx-auto mb-5" />
            <p className="text-black text-sm leading-relaxed mb-8">
              Enter your information to get started.
            </p>
          </div>

          <GoogleAuthButton mode="signup" />

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

          <form onSubmit={handleRegister} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                placeholder="John Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="h-11"
              />
            </div>
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
              <Label htmlFor="password">Password</Label>
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
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="pr-10 h-11"
                />
                <button
                  type="button"
                  tabIndex={0}
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  onClick={() => setShowConfirmPassword((p) => !p)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 p-1 cursor-pointer"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <Button type="submit" className="w-full h-11 bg-[#b08a30] hover:bg-[#9a7628] text-white font-[family-name:var(--font-playfair)]" disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Create Account'}
            </Button>
          </form>

          <p className="mt-8 text-center text-sm text-gray-500 leading-relaxed">
            Already have an account?{' '}
            <Link href="/login" className="text-[#b08a30] hover:underline font-medium font-[family-name:var(--font-playfair)]">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
