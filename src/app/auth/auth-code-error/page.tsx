import Link from 'next/link'
import type { Metadata } from 'next'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { readEmailOtpType } from '@/lib/auth-email-link'
import { ResendSignupConfirmationForm } from './ResendSignupConfirmationForm'

export const metadata: Metadata = {
  title: 'Link expired | ScoreMax',
  robots: { index: false, follow: false },
}

type PageSearchParams = Promise<Record<string, string | string[] | undefined>>

function readSingle(value: string | string[] | undefined): string | null {
  return typeof value === 'string' ? value : null
}

export default async function AuthCodeErrorPage({
  searchParams,
}: {
  searchParams: PageSearchParams
}) {
  const params = await searchParams
  const type = readEmailOtpType(readSingle(params.type))
  const isSignupConfirmation = type === 'signup'

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            {isSignupConfirmation
              ? 'This confirmation link is no longer valid'
              : 'This link has expired'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-500 text-center">
            {isSignupConfirmation
              ? 'Enter your email and we will send a new signup confirmation link.'
              : 'Password reset and sign-in links can only be used once, and they expire after a short time. This one is no longer valid.'}
          </p>

          {isSignupConfirmation ? (
            <ResendSignupConfirmationForm />
          ) : (
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
          )}

          {isSignupConfirmation && (
            <Link
              href="/register?next=%2Fbook"
              className="block w-full rounded-md border border-gray-200 px-4 py-2.5 text-center text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Back to sign up
            </Link>
          )}

          {!isSignupConfirmation && (
            <p className="text-xs text-gray-400 text-center">
              Request a new link and use the newest email. Older one-time links will not work.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
