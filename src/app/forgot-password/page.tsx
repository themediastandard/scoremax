"use client"

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Loader2, CheckCircle } from 'lucide-react'
import Link from 'next/link'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback`,
    })

    if (error) {
      setError(error.message)
    } else {
      setSent(true)
    }
    setLoading(false)
  }

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <CheckCircle className="h-12 w-12 text-emerald-500 mb-4" />
            <p className="text-lg font-semibold text-[#1e293b]">Check your email</p>
            <p className="text-sm text-gray-500 mt-1 text-center">
              We sent a password reset link to <span className="font-medium text-[#1e293b]">{email}</span>
            </p>
            <Link href="/login" className="mt-6 text-sm text-[#517cad] hover:underline">
              Back to sign in
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Reset your password</CardTitle>
          <p className="text-center text-gray-500">
            Enter your email and we will send you a link to reset your password.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <Button type="submit" className="w-full bg-[#1e293b]" disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Send Reset Link'}
            </Button>

            <div className="text-center">
              <Link href="/login" className="text-sm text-[#517cad] hover:underline">
                Back to sign in
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
