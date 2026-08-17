import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { requireOwnedTutor } from '@/lib/tutor-profile-server'

export const dynamic = 'force-dynamic'

const tutorProfileSchema = z.object({
  bio: z.string().trim().max(2000),
  specialties: z.array(z.string().trim().min(1).max(80)).max(12),
}).strict()

function dedupeSpecialties(specialties: string[]) {
  const seen = new Set<string>()
  return specialties.filter((specialty) => {
    const key = specialty.toLocaleLowerCase()
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

export async function PATCH(req: NextRequest) {
  const owner = await requireOwnedTutor()
  if (owner instanceof NextResponse) return owner

  const body = await req.json().catch(() => null)
  const parsed = tutorProfileSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Enter a bio under 2,000 characters and up to 12 subjects.' },
      { status: 400 },
    )
  }

  const specialties = dedupeSpecialties(parsed.data.specialties)
  const { data, error } = await supabaseAdmin
    .from('tutors')
    .update({
      bio: parsed.data.bio || null,
      specialties: specialties.length > 0 ? specialties : null,
    })
    .eq('id', owner.tutorId)
    .eq('profile_id', owner.userId)
    .select('bio, specialties')
    .single()

  if (error) {
    return NextResponse.json({ error: 'Could not save public profile' }, { status: 500 })
  }

  revalidatePath('/tutors')
  return NextResponse.json({
    bio: data.bio ?? '',
    specialties: data.specialties ?? [],
  })
}
