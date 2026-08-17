export const TUTOR_PHOTO_MAX_BYTES: number
export const TUTOR_PHOTO_MAX_DIMENSION: number
export const TUTOR_PHOTO_MAX_PIXELS: number

export function processTutorPhoto(
  mimeType: string,
  bytes: Uint8Array,
): Promise<{
  bytes: Buffer
  contentType: string
  extension: 'jpg' | 'png' | 'webp' | 'avif'
} | null>

export function ownedTutorPhotoPath(photoUrl: unknown, ownerUserId: unknown): string | null
