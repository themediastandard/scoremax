import { NextRequest, NextResponse } from 'next/server'
import { oauth2Client } from '@/lib/google-calendar'
import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth'
import {
  ADMIN_GOOGLE_CONNECTED_AT_KEY,
  ADMIN_GOOGLE_REFRESH_TOKEN_KEY,
  setAdminSetting,
} from '@/lib/google-admin'
import {
  GOOGLE_OAUTH_STATE_COOKIE,
  verifyGoogleOAuthState,
} from '@/lib/google-oauth-state'

// Completes the OAuth connect flow for the ScoreMax business Google account.
// Stores the refresh token in admin_settings; session scheduling uses it to
// create calendar events and Meet links owned by ScoreMax.
export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code')
  const state = req.nextUrl.searchParams.get('state')

  if (!code || !state) {
    return NextResponse.json({ error: 'Missing code or state' }, { status: 400 })
  }

  let parsedState
  try {
    parsedState = verifyGoogleOAuthState(state)
  } catch {
    return NextResponse.json({ error: 'Invalid OAuth state' }, { status: 400 })
  }

  const cookieNonce = req.cookies.get(GOOGLE_OAUTH_STATE_COOKIE)?.value
  if (!cookieNonce || cookieNonce !== parsedState.nonce) {
    return NextResponse.json({ error: 'Invalid OAuth state' }, { status: 400 })
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.id !== parsedState.userId) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const authError = await requireAdmin()
  if (authError) return authError

  // Exchange code for tokens
  const { tokens } = await oauth2Client.getToken(code)
  if (!tokens.refresh_token) {
    return NextResponse.json(
      { error: 'Google did not return a refresh token. Remove ScoreMax from the Google account\'s connected apps and try connecting again.' },
      { status: 400 }
    )
  }

  await setAdminSetting(ADMIN_GOOGLE_REFRESH_TOKEN_KEY, tokens.refresh_token)
  await setAdminSetting(ADMIN_GOOGLE_CONNECTED_AT_KEY, new Date().toISOString())

  // Redirect back to dashboard settings
  const response = NextResponse.redirect(new URL('/dashboard/settings', req.url))
  response.cookies.set(GOOGLE_OAUTH_STATE_COOKIE, '', {
    maxAge: 0,
    path: '/api/google',
  })
  return response
}
