import { NextRequest, NextResponse } from 'next/server'
import { oauth2Client } from '@/lib/google-calendar'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code')
  const state = req.nextUrl.searchParams.get('state')
  
  if (!code || !state) {
    return NextResponse.json({ error: 'Missing code or state' }, { status: 400 })
  }
  
  const { role, userId } = JSON.parse(state)
  
  // Exchange code for tokens
  const { tokens } = await oauth2Client.getToken(code)
  
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
      .update({
        google_access_token: tokens.access_token,
        google_refresh_token: tokens.refresh_token,
        google_token_expiry: tokens.expiry_date ? new Date(tokens.expiry_date).toISOString() : null,
        google_calendar_connected: true
      })
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
      .update({
        google_access_token: tokens.access_token,
        google_refresh_token: tokens.refresh_token,
        google_token_expiry: tokens.expiry_date ? new Date(tokens.expiry_date).toISOString() : null,
        google_calendar_connected: true
      })
      .eq('id', customer.id)
  }
  
  // Redirect back to dashboard settings
  return NextResponse.redirect(new URL('/dashboard/settings', req.url))
}