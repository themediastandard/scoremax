import { type EmailOtpType } from '@supabase/supabase-js'
import { type NextRequest, NextResponse } from 'next/server'

import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { readEmailOtpType, readRelativeNextPath } from '@/lib/auth-email-link'
import { readBookContinuation } from '@/lib/auth-continuation'
import { isAccountType, type AccountType } from '@/lib/account-type'
import { SIGNUP_ONBOARDING_GATE_KEY } from '@/lib/signup-onboarding'

function destinationFor(type: EmailOtpType, next: string | null): string {
  if (type === 'recovery' || type === 'invite') return '/reset-password'
  return next ?? '/dashboard'
}

async function authorizeGoogleSignup(
  user: {
    id: string
    email?: string
    user_metadata?: Record<string, unknown>
  },
  accountType: AccountType | null
) {
  if (!accountType) return { classified: false, accountType: null }
  const { data: customer, error } = await supabaseAdmin
    .from('customers')
    .select('account_type')
    .eq('profile_id', user.id)
    .maybeSingle()
  if (error) {
    console.error('Failed to inspect Google signup:', error.message)
    return { classified: false, accountType: null }
  }

  // Never classify in the OAuth callback. Authorize only a newly created,
  // still-unclassified customer; the completion endpoint validates the
  // same-tab draft, classifies, and creates students. Existing accounts get no
  // gate and therefore cannot be changed by visiting the signup page.
  return customer?.account_type === null
    ? { classified: true, accountType }
    : { classified: false, accountType: null }
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
  const code = searchParams.get('code')
  const next = type === 'signup'
    ? readBookContinuation(searchParams.get('next'))
    : code
      ? readBookContinuation(searchParams.get('next'))
      : readRelativeNextPath(searchParams.get('next'))
  const accountTypeValue = searchParams.get('account_type')
  const signupAccountType = isAccountType(accountTypeValue) ? accountTypeValue : null

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
        const signup = await authorizeGoogleSignup(
          data.user,
          signupAccountType
        )
        if (signup.classified && signup.accountType) {
          const { error: gateError } = await supabaseAdmin.auth.admin.updateUserById(data.user.id, {
            app_metadata: {
              ...data.user.app_metadata,
              [SIGNUP_ONBOARDING_GATE_KEY]: signup.accountType,
            },
          })
          if (gateError) {
            console.error('Failed to authorize Google parent onboarding:', gateError.message)
          }
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
  const next = type === 'signup'
    ? readBookContinuation(formData.get('next'))
    : readRelativeNextPath(formData.get('next'))

  return verifyToken(
    request,
    typeof tokenHash === 'string' ? tokenHash : null,
    type,
    next
  )
}
