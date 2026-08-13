"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { CheckCircle, Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface ResetPasswordFormProps {
  hasSession: boolean
}

export function ResetPasswordForm({ hasSession }: ResetPasswordFormProps) {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [sessionAvailable, setSessionAvailable] = useState(hasSession)
  const router = useRouter()

  useEffect(() => {
    // Do not leave a single-use token or redirect query in browser history.
    if (window.location.search) {
      window.history.replaceState(null, '', window.location.pathname)
    }
  }, [])

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError(null)

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }
    if (password !== confirm) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)
    const controller = new AbortController()
    const timeout = window.setTimeout(() => controller.abort(), 15_000)

    try {
      const response = await fetch('/api/auth/update-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
        signal: controller.signal,
      })
      const result = (await response.json().catch(() => null)) as
        | { error?: string }
        | null

      if (!response.ok) {
        if (response.status === 401) {
          setSessionAvailable(false)
        } else {
          setError(result?.error ?? 'Could not update your password. Please try again.')
        }
        return
      }

      setSuccess(true)
      setTimeout(() => router.push('/dashboard'), 2000)
    } catch (requestError) {
      if (requestError instanceof DOMException && requestError.name === 'AbortError') {
        setError(
          'The update took too long. Before retrying, try signing in with the new password.'
        )
      } else {
        setError('Could not update your password. Check your connection and try again.')
      }
    } finally {
      window.clearTimeout(timeout)
      setLoading(false)
    }
  }

  if (!sessionAvailable) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">
              This link has expired
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-500 text-center">
              Password reset links can only be used once, and they expire after a
              short time. Request a new one and open it straight away.
            </p>
            <div className="space-y-2">
              <Link
                href="/forgot-password"
                className="block w-full rounded-md bg-[#1e293b] px-4 py-2.5 text-center text-sm font-medium text-white hover:bg-[#0f172a] transition-colors"
              >
                Send me a new link
              </Link>
              <Link
                href="/login"
                className="block w-full rounded-md border border-gray-200 px-4 py-2.5 text-center text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Back to sign in
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <CheckCircle className="h-12 w-12 text-emerald-500 mb-4" />
            <p className="text-lg font-semibold text-[#1e293b]">Password updated</p>
            <p className="text-sm text-gray-500 mt-1">Redirecting to your dashboard...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Set your password</CardTitle>
          <p className="text-center text-gray-500">Enter a new password for your account.</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">New Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="At least 6 characters"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm">Confirm Password</Label>
              <Input
                id="confirm"
                type="password"
                placeholder="Re-enter your password"
                value={confirm}
                onChange={(event) => setConfirm(event.target.value)}
                required
              />
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <Button type="submit" className="w-full bg-[#1e293b]" disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Set Password'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
