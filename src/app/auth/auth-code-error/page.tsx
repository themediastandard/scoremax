import Link from 'next/link'
import type { Metadata } from 'next'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

export const metadata: Metadata = {
  title: 'Link expired | ScoreMax',
  robots: { index: false, follow: false },
}

// The auth callback redirects here when a token cannot be verified. The route
// was referenced but never created, so every expired or already-used link — the
// common case, since these tokens are single-use and mail providers scan links
// before a human clicks — produced a 404 instead of an explanation.
export default function AuthCodeErrorPage() {
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
            Password reset and sign-in links can only be used once, and they
            expire after a short time. This one is no longer valid.
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
          <p className="text-xs text-gray-400 text-center">
            If you keep seeing this, request a new link and open it straight
            away — some email apps follow links automatically, which uses them up.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
