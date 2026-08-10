import { type EmailOtpType } from '@supabase/supabase-js'
import { type NextRequest, NextResponse } from 'next/server'

import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { readEmailOtpType, readRelativeNextPath } from '@/lib/auth-email-link'

function destinationFor(type: EmailOtpType, next: string | null): string {
  if (type === 'recovery' || type === 'invite') return '/reset-password'
  return next ?? '/dashboard'
}

async function verifyToken(
  request: NextRequest,
  tokenHash: string | null,
  type: EmailOtpType | null,
  next: string | null
) {
  if (!tokenHash || !type) {
    return NextResponse.redirect(new URL('/auth/auth-code-error', request.url), 303)
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash })
  if (error) {
    return NextResponse.redirect(new URL('/auth/auth-code-error', request.url), 303)
  }

  return NextResponse.redirect(new URL(destinationFor(type, next), request.url), 303)
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const type = readEmailOtpType(searchParams.get('type'))
  const next = readRelativeNextPath(searchParams.get('next'))
  const code = searchParams.get('code')

  if (token_hash && type) {
    // Backward compatibility for links already issued before the scanner-safe
    // interstitial shipped. New emails POST the token after an explicit click.
    return verifyToken(request, token_hash, type, next)
  } else if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      // This branch is the OAuth return leg, so the user just signed in with
      // Google. Record it so the login page can tell them which method they
      // used, rather than leaving them retrying a password they never set.
      const provider = data?.user?.app_metadata?.provider
      if (data?.user?.id && provider === 'google') {
        const { error: recordError } = await supabaseAdmin
          .from('profiles')
          .update({ last_auth_provider: 'google' })
          .eq('id', data.user.id)
        // A hint is never worth failing a sign-in over.
        if (recordError) {
          console.error('Failed to record Google login provider:', recordError.message)
        }
      }
      return NextResponse.redirect(new URL(next ?? '/dashboard', request.url))
    }
  }

  // return the user to an error page with some instructions
  return NextResponse.redirect(new URL('/auth/auth-code-error', request.url))
}

export async function POST(request: NextRequest) {
  const formData = await request.formData()
  const tokenHash = formData.get('token_hash')
  const type = readEmailOtpType(formData.get('type'))
  const next = readRelativeNextPath(formData.get('next'))

  return verifyToken(
    request,
    typeof tokenHash === 'string' ? tokenHash : null,
    type,
    next
  )
}
