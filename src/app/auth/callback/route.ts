import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { type EmailOtpType } from '@supabase/supabase-js'
import { type NextRequest, NextResponse } from 'next/server'

import { supabaseAdmin } from '@/lib/supabase/admin'
import { readEmailOtpType, readRelativeNextPath } from '@/lib/auth-email-link'
import { readBookContinuation } from '@/lib/auth-continuation'
import { isAccountType, type AccountType } from '@/lib/account-type'
import {
  SIGNUP_ADMIN_NOTIFICATION_PENDING_KEY,
  SIGNUP_ONBOARDING_GATE_KEY,
} from '@/lib/signup-onboarding'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://www.scoremaxtutoring.com'

type PendingCookie = {
  name: string
  value: string
  options: CookieOptions
}

function createCallbackClient(request: NextRequest) {
  const pendingCookies: PendingCookie[] = []
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          pendingCookies.push(...cookiesToSet)
        },
      },
    }
  )

  function redirectWithSessionCookies(destination: URL, status?: number) {
    const response = NextResponse.redirect(destination, status)
    pendingCookies.forEach(({ name, value, options }) =>
      response.cookies.set(name, value, options)
    )
    return response
  }

  return { supabase, redirectWithSessionCookies }
}

function destinationFor(type: EmailOtpType, next: string | null): string {
  if (type === 'recovery' || type === 'invite') return '/reset-password'
  if (type === 'signup') return '/book'
  return next ?? '/dashboard'
}

function publicUrl(path: string): URL {
  return new URL(path, APP_URL)
}

function authErrorUrl(type: EmailOtpType | null, next: string | null): URL {
  const url = publicUrl('/auth/auth-code-error')
  if (type) url.searchParams.set('type', type)
  if (type === 'signup') url.searchParams.set('next', next ?? '/book')
  return url
}

async function inspectGoogleSignup(
  user: {
    id: string
    email?: string
    user_metadata?: Record<string, unknown>
  },
  accountType: AccountType | null
) {
  const { data: customer, error } = await supabaseAdmin
    .from('customers')
    .select('account_type')
    .eq('profile_id', user.id)
    .maybeSingle()
  if (error) {
    console.error('Failed to inspect Google signup:', error.message)
    return { inspectionFailed: true, needsSetup: false, accountType: null }
  }

  // Never classify in the OAuth callback. Authorize only a newly created,
  // still-unclassified customer; the completion endpoint validates the
  // same-tab draft, classifies, and creates students. Existing accounts get no
  // gate and therefore cannot be changed by visiting the signup page.
  const needsSetup = customer?.account_type === null
  return {
    inspectionFailed: false,
    needsSetup,
    accountType: needsSetup ? accountType : null,
  }
}

function googleSetupUrl(next: string | null): URL {
  const url = publicUrl('/register')
  url.searchParams.set('complete', 'google')
  if (next === '/book') url.searchParams.set('next', next)
  return url
}

async function verifyToken(
  request: NextRequest,
  tokenHash: string | null,
  type: EmailOtpType | null,
  next: string | null
) {
  if (!tokenHash || !type) {
    return NextResponse.redirect(authErrorUrl(type, next), 303)
  }

  const { supabase, redirectWithSessionCookies } = createCallbackClient(request)
  const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash })
  if (error) {
    return NextResponse.redirect(authErrorUrl(type, next), 303)
  }

  return redirectWithSessionCookies(publicUrl(destinationFor(type, next)), 303)
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
    const { supabase, redirectWithSessionCookies } = createCallbackClient(request)
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      // This branch is the OAuth return leg, so the user just signed in with
      // Google. Record it so the login page can tell them which method they
      // used, rather than leaving them retrying a password they never set.
      const provider = data?.user?.app_metadata?.provider
      const providers = data?.user?.app_metadata?.providers
      const usedGoogle = provider === 'google' || (
        Array.isArray(providers) && providers.includes('google')
      )
      if (data?.user?.id && usedGoogle) {
        const { error: recordError } = await supabaseAdmin
          .from('profiles')
          .update({ last_auth_provider: 'google' })
          .eq('id', data.user.id)
        // A hint is never worth failing a sign-in over.
        if (recordError) {
          console.error('Failed to record Google login provider:', recordError.message)
        }
        const signup = await inspectGoogleSignup(
          data.user,
          signupAccountType
        )
        if (signup.accountType) {
          const { error: gateError } = await supabaseAdmin.auth.admin.updateUserById(data.user.id, {
            app_metadata: {
              ...data.user.app_metadata,
              [SIGNUP_ONBOARDING_GATE_KEY]: signup.accountType,
              [SIGNUP_ADMIN_NOTIFICATION_PENDING_KEY]: true,
            },
          })
          if (gateError) {
            console.error('Failed to authorize Google signup onboarding:', gateError.message)
            return redirectWithSessionCookies(googleSetupUrl(next), 303)
          }
        }
        // A Google sign-in can create an Auth user even when the person used
        // the login page rather than the signup form. Stop any such
        // unclassified customer before dashboard/booking and reuse /register
        // as a signed-in setup form instead of letting an empty account leak
        // into the product.
        if (signup.inspectionFailed || (signup.needsSetup && !signupAccountType)) {
          return redirectWithSessionCookies(googleSetupUrl(next), 303)
        }
      }
      return redirectWithSessionCookies(publicUrl(next ?? '/dashboard'))
    }
  }

  // Preserve the email action when it is available so the recovery page can
  // offer the matching replacement link (signup confirmation vs. password reset).
  return NextResponse.redirect(authErrorUrl(type, next))
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
