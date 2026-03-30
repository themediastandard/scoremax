import { NextRequest, NextResponse } from 'next/server'
import { oauth2Client } from '@/lib/google-calendar'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const role = req.nextUrl.searchParams.get('role')
  
  if (!role) {
    return NextResponse.json({ error: 'Role is required' }, { status: 400 })
  }
  
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
     return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }
  
  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/calendar.events'],
    prompt: 'consent',
    state: JSON.stringify({ role, userId: user.id })
  })
  
  return NextResponse.redirect(url)
}