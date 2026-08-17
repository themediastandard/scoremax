import { randomUUID } from 'node:crypto'
import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { requireOwnedTutor } from '@/lib/tutor-profile-server'
import {
  TUTOR_PHOTO_MAX_BYTES,
  ownedTutorPhotoPath,
  processTutorPhoto,
} from '@/lib/tutor-profile-photo'

const PHOTO_BUCKET = 'tutor-photos'

export async function POST(req: NextRequest) {
  const owner = await requireOwnedTutor()
  if (owner instanceof NextResponse) return owner

  const formData = await req.formData().catch(() => null)
  const file = formData?.get('file')

  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: 'Choose an image to upload.' }, { status: 400 })
  }

  if (file.size > TUTOR_PHOTO_MAX_BYTES) {
    return NextResponse.json({ error: 'Photo must be 5MB or smaller.' }, { status: 400 })
  }

  const originalBytes = new Uint8Array(await file.arrayBuffer())
  const photo = await processTutorPhoto(file.type, originalBytes)
  if (!photo) {
    return NextResponse.json(
      { error: 'Use a valid JPEG, PNG, WebP, or AVIF image.' },
      { status: 400 },
    )
  }

  // A new, authenticated-user-owned path avoids overwrites and stale CDN
  // content. After the row points here, a prior object is removed only when
  // its public URL proves that it belongs to this same user namespace.
  const photoPath = `${owner.userId}/${randomUUID()}.${photo.extension}`
  const { error: uploadError } = await supabaseAdmin.storage
    .from(PHOTO_BUCKET)
    .upload(photoPath, photo.bytes, {
      contentType: photo.contentType,
      upsert: false,
    })

  if (uploadError) {
    return NextResponse.json({ error: 'Could not upload photo' }, { status: 500 })
  }

  const { data: publicUrl } = supabaseAdmin.storage
    .from(PHOTO_BUCKET)
    .getPublicUrl(photoPath)

  let updateQuery = supabaseAdmin
    .from('tutors')
    .update({ photo_url: publicUrl.publicUrl })
    .eq('id', owner.tutorId)
    .eq('profile_id', owner.userId)
  updateQuery = owner.photoUrl
    ? updateQuery.eq('photo_url', owner.photoUrl)
    : updateQuery.is('photo_url', null)

  const { data: updatedTutor, error: updateError } = await updateQuery
    .select('photo_url')
    .single()

  if (updateError) {
    const { error: cleanupError } = await supabaseAdmin.storage
      .from(PHOTO_BUCKET)
      .remove([photoPath])
    if (cleanupError) console.error('Failed to clean up unsaved tutor photo', cleanupError.message)
    return NextResponse.json({ error: 'Photo uploaded but could not be saved' }, { status: 500 })
  }

  const previousPath = ownedTutorPhotoPath(owner.photoUrl, owner.userId)
  if (previousPath && previousPath !== photoPath) {
    const { error: cleanupError } = await supabaseAdmin.storage
      .from(PHOTO_BUCKET)
      .remove([previousPath])
    if (cleanupError) console.error('Failed to remove previous tutor photo', cleanupError.message)
  }

  revalidatePath('/tutors')
  return NextResponse.json({ url: updatedTutor.photo_url })
}

export async function DELETE() {
  const owner = await requireOwnedTutor()
  if (owner instanceof NextResponse) return owner

  let clearQuery = supabaseAdmin
    .from('tutors')
    .update({ photo_url: null })
    .eq('id', owner.tutorId)
    .eq('profile_id', owner.userId)
  clearQuery = owner.photoUrl
    ? clearQuery.eq('photo_url', owner.photoUrl)
    : clearQuery.is('photo_url', null)

  const { error } = await clearQuery
    .select('photo_url')
    .single()

  if (error) {
    return NextResponse.json({ error: 'Could not remove photo' }, { status: 500 })
  }

  const previousPath = ownedTutorPhotoPath(owner.photoUrl, owner.userId)
  if (previousPath) {
    const { error: cleanupError } = await supabaseAdmin.storage
      .from(PHOTO_BUCKET)
      .remove([previousPath])
    if (cleanupError) console.error('Failed to remove tutor photo object', cleanupError.message)
  }

  revalidatePath('/tutors')
  return NextResponse.json({ success: true })
}
