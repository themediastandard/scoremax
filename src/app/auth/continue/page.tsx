import type { Metadata } from 'next'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { readEmailOtpType, readRelativeNextPath } from '@/lib/auth-email-link'
import { readBookContinuation } from '@/lib/auth-continuation'

export const metadata: Metadata = {
  title: 'Continue securely | ScoreMax',
  robots: { index: false, follow: false },
}

type PageSearchParams = Promise<Record<string, string | string[] | undefined>>

function readSingle(value: string | string[] | undefined): string | null {
  return typeof value === 'string' ? value : null
}

const COPY = {
  recovery: {
    title: 'Reset your password',
    body: 'Continue to choose a new password for your ScoreMax account.',
    button: 'Continue to reset password',
  },
  invite: {
    title: 'Set up your account',
    body: 'Continue to set your password and access your ScoreMax dashboard.',
    button: 'Continue to set password',
  },
  signup: {
    title: 'Confirm your email',
    body: 'Continue to confirm your email address and finish creating your account.',
    button: 'Confirm Email & Start Booking',
  },
  magiclink: {
    title: 'Sign in to ScoreMax',
    body: 'Continue to securely sign in to your ScoreMax account.',
    button: 'Continue to sign in',
  },
  email_change: {
    title: 'Confirm your email',
    body: 'Continue to confirm the new email address for your ScoreMax account.',
    button: 'Continue to confirm email',
  },
  email: {
    title: 'Confirm your email',
    body: 'Continue to confirm your email address.',
    button: 'Continue to confirm email',
  },
} as const

export default async function AuthContinuePage({
  searchParams,
}: {
  searchParams: PageSearchParams
}) {
  const params = await searchParams
  const tokenHash = readSingle(params.token_hash)
  const type = readEmailOtpType(readSingle(params.type))
  const next = type === 'signup'
    ? readBookContinuation(readSingle(params.next))
    : readRelativeNextPath(readSingle(params.next))

  if (!tokenHash || !type) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl text-center">This link is incomplete</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <p className="text-sm text-gray-500">
              Request a new password or sign-in email and use the newest message.
            </p>
            <Link
              href="/forgot-password"
              className="block rounded-md bg-[#1e293b] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#0f172a]"
            >
              Send me a new link
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  const copy = COPY[type]

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">{copy.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <p className="text-sm text-gray-500 text-center">{copy.body}</p>
          <form action="/auth/callback" method="post">
            <input type="hidden" name="token_hash" value={tokenHash} />
            <input type="hidden" name="type" value={type} />
            {next && <input type="hidden" name="next" value={next} />}
            <Button type="submit" className="w-full bg-[#1e293b] hover:bg-[#0f172a]">
              {copy.button}
            </Button>
          </form>
          <p className="text-xs text-gray-400 text-center">
            This extra step prevents email security scanners from using your one-time link.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
