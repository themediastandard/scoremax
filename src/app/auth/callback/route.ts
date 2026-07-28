import { type EmailOtpType } from '@supabase/supabase-js'
import { type NextRequest, NextResponse } from 'next/server'

import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  const next = searchParams.get('next') ?? '/dashboard'
  const code = searchParams.get('code')

  if (token_hash && type) {
    const supabase = await createClient()

    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    })
    if (!error) {
      if (type === 'recovery' || type === 'invite') {
        return NextResponse.redirect(new URL('/reset-password', request.url))
      }
      return NextResponse.redirect(new URL(next, request.url))
    }
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
      return NextResponse.redirect(new URL(next, request.url))
    }
  }

  // return the user to an error page with some instructions
  return NextResponse.redirect(new URL('/auth/auth-code-error', request.url))
}