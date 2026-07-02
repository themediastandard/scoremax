import { NextRequest, NextResponse } from 'next/server'
import { oauth2Client } from '@/lib/google-calendar'
import { createClient } from '@/lib/supabase/server'
import {
  createGoogleOAuthNonce,
  createGoogleOAuthState,
  GOOGLE_OAUTH_STATE_COOKIE,
} from '@/lib/google-oauth-state'

export async function GET(req: NextRequest) {
  const role = req.nextUrl.searchParams.get('role')
  
  if (role !== 'customer' && role !== 'tutor') {
    return NextResponse.json({ error: 'Valid role is required' }, { status: 400 })
  }
  
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
     return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }
  
  const nonce = createGoogleOAuthNonce()
  const state = createGoogleOAuthState({
    role,
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
