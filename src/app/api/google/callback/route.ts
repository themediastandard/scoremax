import { NextRequest, NextResponse } from 'next/server'
import { oauth2Client } from '@/lib/google-calendar'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import {
  GOOGLE_OAUTH_STATE_COOKIE,
  verifyGoogleOAuthState,
} from '@/lib/google-oauth-state'

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

  const { role, userId } = parsedState
  
  // Exchange code for tokens
  const { tokens } = await oauth2Client.getToken(code)
  const tokenUpdates = {
    ...(tokens.access_token && { google_access_token: tokens.access_token }),
    ...(tokens.refresh_token && { google_refresh_token: tokens.refresh_token }),
    google_token_expiry: tokens.expiry_date ? new Date(tokens.expiry_date).toISOString() : null,
    google_calendar_connected: true,
  }
  
  // Store tokens
  if (role === 'tutor') {
    // Check if user is tutor
    const { data: tutor } = await supabaseAdmin
      .from('tutors')
      .select('id')
      .eq('profile_id', userId)
      .single()
      
    if (!tutor) return NextResponse.json({ error: 'Tutor not found' }, { status: 404 })
    
    await supabaseAdmin
      .from('tutors')
      .update(tokenUpdates)
      .eq('id', tutor.id)
      
  } else if (role === 'customer') {
    // Check if user is customer
    const { data: customer } = await supabaseAdmin
      .from('customers')
      .select('id')
      .eq('profile_id', userId)
      .single()
      
    if (!customer) return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
    
    await supabaseAdmin
      .from('customers')
      .update(tokenUpdates)
      .eq('id', customer.id)
  }
  
  // Redirect back to dashboard settings
  const response = NextResponse.redirect(new URL('/dashboard/settings', req.url))
  response.cookies.set(GOOGLE_OAUTH_STATE_COOKIE, '', {
    maxAge: 0,
    path: '/api/google',
  })
  return response
}
