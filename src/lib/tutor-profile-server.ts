import 'server-only'

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

type OwnedTutor = {
  userId: string
  tutorId: string
  photoUrl: string | null
}

/**
 * Service-role writes are allowed only after the request's authenticated user
 * is independently confirmed as a tutor and matched to their tutors row.
 */
export async function requireOwnedTutor(): Promise<OwnedTutor | NextResponse> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: profile, error: profileError } = await supabaseAdmin
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle()

  if (profileError) {
    return NextResponse.json({ error: 'Could not verify tutor profile' }, { status: 500 })
  }

  if (profile?.role !== 'tutor') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { data: tutor, error: tutorError } = await supabaseAdmin
    .from('tutors')
    .select('id, photo_url')
    .eq('profile_id', user.id)
    .maybeSingle()

  if (tutorError) {
    return NextResponse.json({ error: 'Could not verify tutor profile' }, { status: 500 })
  }

  if (!tutor) {
    return NextResponse.json({ error: 'Tutor profile not found' }, { status: 403 })
  }

  return { userId: user.id, tutorId: tutor.id, photoUrl: tutor.photo_url }
}
