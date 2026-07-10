import { NextResponse } from 'next/server'
import { oauth2Client } from '@/lib/google-calendar'
import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth'
import {
  createGoogleOAuthNonce,
  createGoogleOAuthState,
  GOOGLE_OAUTH_STATE_COOKIE,
} from '@/lib/google-oauth-state'

// Starts the OAuth connect flow for the single ScoreMax business Google
// account. Admin-only: this account owns every session calendar event.
export async function GET() {
  const authError = await requireAdmin()
  if (authError) return authError

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const nonce = createGoogleOAuthNonce()
  const state = createGoogleOAuthState({
    role: 'admin',
    userId: user.id,
    nonce,
    iat: Date.now(),
  })

  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/calendar.events'],
    prompt: 'consent',
    state,
  })

  const response = NextResponse.redirect(url)
  response.cookies.set(GOOGLE_OAUTH_STATE_COOKIE, nonce, {
    httpOnly: true,
    maxAge: 10 * 60,
    path: '/api/google',
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  })

  return response
}
