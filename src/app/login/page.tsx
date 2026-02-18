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

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
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
        <div className="flex-1 flex flex-col justify-center">
          <div className="space-y-8">
          <Link href="/" className="inline-block w-fit">
            <Image
              src="/Images/score-max-logo-white.png"
              alt="ScoreMax"
              width={200}
              height={50}
              className="h-12 w-auto"
            />
          </Link>
          <div className="uppercase text-xs tracking-widest text-[#c79d3c] font-semibold mb-3">
            Welcome back
          </div>
          <h2 className="font-[family-name:var(--font-playfair)] text-3xl xl:text-4xl text-white leading-tight tracking-tight">
            Unlock your test score potential
          </h2>
          <div className="w-10 h-[2px] bg-[#c79d3c]" />
          <p className="text-slate-300 text-sm leading-relaxed max-w-md">
            Expert 1-on-1 tutoring for SAT, ACT, and academic subjects. Personalized study plans that deliver results.
          </p>
          <div className="flex flex-col gap-4 pt-4">
            <div className="flex items-center gap-3 text-slate-200">
              <div className="w-10 h-10 bg-[#c79d3c]/10 flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-[#c79d3c]" />
              </div>
              <span className="text-sm leading-relaxed">Certified expert tutors</span>
            </div>
            <div className="flex items-center gap-3 text-slate-200">
              <div className="w-10 h-10 bg-[#c79d3c]/10 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-[#c79d3c]" />
              </div>
              <span className="text-sm leading-relaxed">Proven score improvements</span>
            </div>
            <div className="flex items-center gap-3 text-slate-200">
              <div className="w-10 h-10 bg-[#c79d3c]/10 flex items-center justify-center">
                <Award className="w-5 h-5 text-[#c79d3c]" />
              </div>
              <span className="text-sm leading-relaxed">Personalized learning plans</span>
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
                src="/Images/score-max-logo-black.png"
                alt="ScoreMax"
                width={140}
                height={36}
                className="h-9 w-auto"
              />
            </Link>
          </div>
          <div className="text-center">
            <div className="uppercase text-xs tracking-widest text-[#c79d3c] font-semibold mb-3">
              Account
            </div>
            <h1 className="font-[family-name:var(--font-playfair)] text-3xl lg:text-4xl text-black mb-2">
              Sign in to ScoreMax
            </h1>
            <div className="w-10 h-[2px] bg-[#c79d3c] mx-auto mb-5" />
            <p className="text-black text-sm leading-relaxed mb-8">
              Welcome back. Enter your details to continue.
            </p>
          </div>

          <GoogleAuthButton mode="signin" />

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
                <Link href="/forgot-password" tabIndex={-1} className="text-sm text-[#c79d3c] hover:underline font-medium">
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

            {error && <p className="text-sm text-red-500">{error}</p>}

            <Button type="submit" className="w-full h-11 bg-[#c79d3c] hover:bg-[#b08a30] text-white font-[family-name:var(--font-playfair)]" disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Sign In'}
            </Button>
          </form>

          <p className="mt-8 text-center text-sm text-gray-500 leading-relaxed">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-[#c79d3c] hover:underline font-medium font-[family-name:var(--font-playfair)]">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}