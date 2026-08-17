"use client"

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { siteImages } from '@/lib/site-images'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { GoogleAuthButton } from '@/components/auth/GoogleAuthButton'
import { AUTH_CAPTCHA_CONFIGURED, AuthTurnstile } from '@/components/auth/AuthTurnstile'
import Link from 'next/link'
import { Loader2, Eye, EyeOff, GraduationCap, TrendingUp, Award, MailCheck, Plus, Trash2, UserRound, Users } from 'lucide-react'
import type { AccountType } from '@/lib/account-type'
import { GRADE_OPTIONS } from '@/lib/student-grades'
import { readBookContinuation, withBookContinuation } from '@/lib/auth-continuation'
import {
  PENDING_STUDENTS_METADATA_KEY,
  signupStudentDraftError,
  type SignupStudentDraft,
} from '@/lib/signup-onboarding'

const EMPTY_STUDENT: SignupStudentDraft = { fullName: '', email: '', phone: '', grade: '' }

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [accountType, setAccountType] = useState<AccountType | null>(null)
  const [studentGrade, setStudentGrade] = useState('')
  const [students, setStudents] = useState<SignupStudentDraft[]>([{ ...EMPTY_STUDENT }])
  const [nextPath, setNextPath] = useState<'/book' | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [awaitingConfirmation, setAwaitingConfirmation] = useState(false)
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)
  const [captchaGeneration, setCaptchaGeneration] = useState(0)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    setNextPath(readBookContinuation(new URLSearchParams(window.location.search).get('next')))
  }, [])

  const updateStudent = (index: number, updates: Partial<SignupStudentDraft>) => {
    setStudents((current) => current.map((student, studentIndex) => (
      studentIndex === index ? { ...student, ...updates } : student
    )))
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }
    if (!accountType) {
      setError('Choose whether this is a parent/guardian or student account')
      return
    }
    if (accountType === 'student' && !studentGrade) {
      setError('Select your grade to continue')
      return
    }
    const studentError = accountType === 'parent' ? signupStudentDraftError(students) : null
    if (studentError) {
      setError(studentError)
      return
    }
    if (AUTH_CAPTCHA_CONFIGURED && !captchaToken) {
      setError('Complete the security check to continue')
      return
    }
    setLoading(true)
    setError(null)

    const { data, error } = await supabase.auth.signUp({
      email: email.toLowerCase().trim(),
      password,
      options: {
        ...(captchaToken && { captchaToken }),
        emailRedirectTo: new URL('/book', window.location.origin).toString(),
        data: {
          full_name: fullName,
          account_type: accountType,
          ...(accountType === 'student' && { student_grade: studentGrade }),
          ...(accountType === 'parent' && { [PENDING_STUDENTS_METADATA_KEY]: students }),
        }
      }
    })

    if (error) {
      setError(error.message)
      setCaptchaToken(null)
      setCaptchaGeneration((generation) => generation + 1)
      setLoading(false)
      return
    }

    // No session means Supabase is set to confirm addresses before granting
    // access. Pushing to /dashboard then just bounces off the middleware to
    // /login with nothing explaining why, which reads as a failed signup and
    // gets people re-registering. Tell them to check their inbox instead.
    // Works either way: with confirmation off a session comes back and the
    // redirect happens as before.
    if (!data.session) {
      setAwaitingConfirmation(true)
      setLoading(false)
      return
    }

    router.push('/book')
    router.refresh()
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
                src={siteImages.logoWide}
                alt="ScoreMax"
                width={140}
                height={36}
                className="h-7 w-auto"
              />
            </Link>
          </div>
          {awaitingConfirmation ? (
            <div className="text-center">
              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#b08a30]/10">
                <MailCheck className="h-7 w-7 text-[#b08a30]" aria-hidden="true" />
              </div>
              <h1 className="font-[family-name:var(--font-playfair)] text-3xl text-black mb-2">
                Check your email
              </h1>
              <div className="w-10 h-[2px] bg-[#b08a30] mx-auto mb-5" />
              <p className="text-black text-sm leading-relaxed">
                We sent a confirmation link to{' '}
                <span className="font-semibold break-all">{email.toLowerCase().trim()}</span>.
                Click it to activate your account and continue your booking.
              </p>
              <p className="text-gray-500 text-xs leading-relaxed mt-4">
                The link can take a minute to arrive. Check your spam folder if you don&apos;t see it.
              </p>
              <Link
                href="/book"
                className="mt-8 inline-flex w-full items-center justify-center bg-[#b08a30] px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-[#9a7628] font-[family-name:var(--font-playfair)]"
              >
                Continue Booking After Confirming
              </Link>
            </div>
          ) : (
          <>
          <div className="text-center">
            <div className="uppercase font-[family-name:var(--font-playfair)] text-xs tracking-widest text-[#b08a30] font-semibold mb-3">
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

          <fieldset className="mb-6 space-y-3">
            <legend className="text-sm font-medium text-gray-900">Who will use this account?</legend>
            <div className="grid grid-cols-2 gap-3">
              {([
                {
                  value: 'parent' as const,
                  label: 'Parent/Guardian',
                  description: 'Book and manage sessions for your children',
                  icon: Users,
                },
                {
                  value: 'student' as const,
                  label: 'Student',
                  description: 'Book and manage your own sessions',
                  icon: UserRound,
                },
              ]).map((option) => {
                const Icon = option.icon
                const selected = accountType === option.value
                return (
                  <label
                    key={option.value}
                    className={`cursor-pointer border p-4 transition-colors focus-within:ring-2 focus-within:ring-[#b08a30] focus-within:ring-offset-2 ${
                      selected
                        ? 'border-[#b08a30] bg-[#b08a30]/5'
                        : 'border-gray-200 hover:border-[#b08a30]/50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="account-type"
                      value={option.value}
                      checked={selected}
                      onChange={() => {
                        setAccountType(option.value)
                        if (option.value === 'parent') setStudentGrade('')
                      }}
                      className="sr-only"
                    />
                    <Icon className={`pointer-events-none h-5 w-5 ${selected ? 'text-[#b08a30]' : 'text-gray-400'}`} aria-hidden="true" />
                    <span className="mt-2 block text-sm font-semibold text-gray-900">{option.label}</span>
                    <span className="mt-1 block text-xs leading-5 text-gray-500">{option.description}</span>
                  </label>
                )
              })}
            </div>
          </fieldset>

          {accountType === 'student' && (
            <div className="mb-6 space-y-2">
              <Label htmlFor="signup-student-grade">Your Grade</Label>
              <Select value={studentGrade || undefined} onValueChange={setStudentGrade}>
                <SelectTrigger id="signup-student-grade" className="h-11 w-full" aria-required="true">
                  <SelectValue placeholder="Select grade" />
                </SelectTrigger>
                <SelectContent>
                  {GRADE_OPTIONS.map((grade) => (
                    <SelectItem key={grade} value={grade}>{grade}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs leading-5 text-gray-500">
                Your student profile will be created automatically using this account&apos;s name and email.
              </p>
            </div>
          )}

          {accountType === 'parent' && (
            <fieldset className="mb-6 space-y-4">
              <legend className="text-sm font-medium text-gray-900">Add your student{students.length > 1 ? 's' : ''}</legend>
              <div>
                <p className="mt-1 text-xs leading-5 text-gray-500">
                  Student emails receive session schedules and reminders. They do not create separate logins.
                </p>
              </div>
              {students.map((student, index) => (
                <div key={index} className="space-y-4 rounded-xl border border-gray-200 bg-slate-50/60 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-[#1e293b]">Student {index + 1}</p>
                    {students.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-gray-500 hover:text-red-700"
                        onClick={() => setStudents((current) => current.filter((_, studentIndex) => studentIndex !== index))}
                        aria-label={`Remove student ${index + 1}`}
                      >
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                        Remove
                      </Button>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`signup-student-${index}-name`}>Student Name</Label>
                    <Input
                      id={`signup-student-${index}-name`}
                      value={student.fullName}
                      onChange={(event) => updateStudent(index, { fullName: event.target.value })}
                      maxLength={200}
                      autoComplete="name"
                      required
                      className="h-11 bg-white"
                    />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor={`signup-student-${index}-email`}>Student Email</Label>
                      <Input
                        id={`signup-student-${index}-email`}
                        type="email"
                        value={student.email}
                        onChange={(event) => updateStudent(index, { email: event.target.value })}
                        maxLength={320}
                        autoComplete="email"
                        required
                        className="h-11 bg-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`signup-student-${index}-phone`}>
                        Student Phone <span className="font-normal text-gray-500">(Optional)</span>
                      </Label>
                      <Input
                        id={`signup-student-${index}-phone`}
                        type="tel"
                        value={student.phone}
                        onChange={(event) => updateStudent(index, { phone: event.target.value })}
                        maxLength={50}
                        autoComplete="tel"
                        className="h-11 bg-white"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`signup-student-${index}-grade`}>Grade</Label>
                    <Select value={student.grade || undefined} onValueChange={(grade) => updateStudent(index, { grade })}>
                      <SelectTrigger id={`signup-student-${index}-grade`} className="h-11 w-full bg-white" aria-required="true">
                        <SelectValue placeholder="Select grade" />
                      </SelectTrigger>
                      <SelectContent>
                        {GRADE_OPTIONS.map((grade) => (
                          <SelectItem key={grade} value={grade}>{grade}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => setStudents((current) => [...current, { ...EMPTY_STUDENT }])}
                disabled={students.length >= 10}
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
                Add Another Student
              </Button>
            </fieldset>
          )}

          <GoogleAuthButton
            mode="signup"
            signupAccountType={accountType}
            studentGrade={studentGrade}
            signupStudents={accountType === 'parent' ? students : undefined}
            next={nextPath ?? '/book'}
            onError={setError}
          />

          {!accountType && (
            <p className="mt-2 text-center text-xs text-gray-500">
              Choose an account type before continuing with Google.
            </p>
          )}

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

            <AuthTurnstile
              key={captchaGeneration}
              action="register"
              onTokenChange={setCaptchaToken}
            />

            {error && <p className="text-sm text-red-500">{error}</p>}

            <Button
              type="submit"
              className="w-full h-11 bg-[#b08a30] hover:bg-[#9a7628] text-white font-[family-name:var(--font-playfair)]"
              disabled={loading || (AUTH_CAPTCHA_CONFIGURED && !captchaToken)}
            >
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Create Account'}
            </Button>
          </form>

          <p className="mt-8 text-center text-sm text-gray-500 leading-relaxed">
            Already have an account?{' '}
            {/* Inline link in 14px copy — see the matching note on /login. */}
            <Link href={withBookContinuation('/login', nextPath ?? '/book')} className="text-gray-900 underline font-semibold font-[family-name:var(--font-playfair)]">
              Sign in
            </Link>
          </p>
          </>
          )}
        </div>
      </div>
    </div>
  )
}
