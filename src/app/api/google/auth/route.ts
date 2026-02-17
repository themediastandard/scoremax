import { NextRequest, NextResponse } from 'next/server'
import { oauth2Client } from '@/lib/google-calendar'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const role = req.nextUrl.searchParams.get('role') // 'tutor' or 'customer'
  const userId = req.nextUrl.searchParams.get('userId') // Optional if fetching from auth
  
  if (!role) {
    return NextResponse.json({ error: 'Role is required' }, { status: 400 })
  }
  
  // Verify auth
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user && !userId) {
     return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }
  
  const id = userId || user?.id
  
  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline', // Get refresh token
    scope: ['https://www.googleapis.com/auth/calendar.events'],
    prompt: 'consent', // Force consent to ensure refresh token
    state: JSON.stringify({ role, userId: id })
  })
  
  return NextResponse.redirect(url)
}