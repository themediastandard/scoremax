import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import sharp from 'sharp'
import photoValidation from '../src/lib/tutor-profile-photo.js'

const {
  TUTOR_PHOTO_MAX_BYTES,
  TUTOR_PHOTO_MAX_DIMENSION,
  TUTOR_PHOTO_MAX_PIXELS,
  ownedTutorPhotoPath,
  processTutorPhoto,
} = photoValidation

function readSource(path) {
  return readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')
}

test('tutor profile routes authenticate the current tutor and scope every write to their row', () => {
  const authorization = readSource('src/lib/tutor-profile-server.ts')
  const profileRoute = readSource('src/app/api/tutor/profile/route.ts')
  const photoRoute = readSource('src/app/api/tutor/profile/photo/route.ts')

  assert.match(authorization, /supabase\.auth\.getUser\(\)/)
  assert.match(authorization, /status: 401/)
  assert.match(authorization, /profile\?\.role !== 'tutor'/)
  assert.match(authorization, /status: 403/)
  assert.match(authorization, /\.from\('tutors'\)[\s\S]*?\.eq\('profile_id', user\.id\)/)

  for (const source of [profileRoute, photoRoute]) {
    assert.match(source, /requireOwnedTutor\(\)/)
    assert.match(source, /\.eq\('id', owner\.tutorId\)[\s\S]*?\.eq\('profile_id', owner\.userId\)/)
  }
})

test('public profile updates whitelist, bound, normalize, and persist only bio and specialties', () => {
  const route = readSource('src/app/api/tutor/profile/route.ts')

  assert.match(route, /z\.object\(\{[\s\S]*bio: z\.string\(\)\.trim\(\)\.max\(2000\)/)
  assert.match(route, /specialties: z\.array\(z\.string\(\)\.trim\(\)\.min\(1\)\.max\(80\)\)\.max\(12\)/)
  assert.match(route, /\}\)\.strict\(\)/)
  assert.match(route, /dedupeSpecialties\(parsed\.data\.specialties\)/)
  assert.match(route, /\.update\(\{[\s\S]*?bio: parsed\.data\.bio \|\| null,[\s\S]*?specialties:/)
  assert.doesNotMatch(route, /\.update\(body\)|\.update\(parsed\.data\)/)
})

test('photo validation fully decodes, bounds, and re-encodes image content', async () => {
  assert.equal(TUTOR_PHOTO_MAX_BYTES, 5 * 1024 * 1024)
  assert.equal(TUTOR_PHOTO_MAX_PIXELS, 25_000_000)

  const validPng = await sharp({
    create: { width: 2000, height: 1000, channels: 4, background: '#517cad' },
  }).png().toBuffer()
  const processed = await processTutorPhoto('image/png', validPng)
  assert.ok(processed)
  assert.equal(processed.extension, 'png')
  assert.equal(processed.contentType, 'image/png')
  const metadata = await sharp(processed.bytes).metadata()
  assert.equal(metadata.width, TUTOR_PHOTO_MAX_DIMENSION)
  assert.equal(metadata.height, 800)

  for (const [mimeType, encoder, extension] of [
    ['image/jpeg', 'jpeg', 'jpg'],
    ['image/png', 'png', 'png'],
    ['image/webp', 'webp', 'webp'],
    ['image/avif', 'avif', 'avif'],
  ]) {
    const input = await sharp({
      create: { width: 4, height: 3, channels: 4, background: '#517cad' },
    })[encoder]().toBuffer()
    const result = await processTutorPhoto(mimeType, input)
    assert.equal(result?.extension, extension)
    assert.ok(result?.bytes.length)
  }

  assert.equal(
    await processTutorPhoto('image/jpeg', Uint8Array.from([0xff, 0xd8, 0xff, 0x00])),
    null,
    'a four-byte JPEG signature is not a decodable image',
  )
  assert.equal(await processTutorPhoto('image/jpeg', validPng), null, 'declared MIME must match decoded format')
  assert.equal(await processTutorPhoto('image/svg+xml', Buffer.from('<svg/>')), null)
})

test('only this project and current tutor namespace can produce a cleanup path', () => {
  const ownerId = '11111111-1111-4111-8111-111111111111'
  const fileId = '22222222-2222-4222-8222-222222222222'
  const ownedUrl = `https://fceekjlispfjduetumrf.supabase.co/storage/v1/object/public/tutor-photos/${ownerId}/${fileId}.webp`

  assert.equal(ownedTutorPhotoPath(ownedUrl, ownerId), `${ownerId}/${fileId}.webp`)
  assert.equal(ownedTutorPhotoPath(ownedUrl, '33333333-3333-4333-8333-333333333333'), null)
  assert.equal(ownedTutorPhotoPath(ownedUrl.replace('fceekjlispfjduetumrf', 'other-project'), ownerId), null)
  assert.equal(ownedTutorPhotoPath(`${ownedUrl}?download=1`, ownerId), null)
  assert.equal(ownedTutorPhotoPath(`${ownedUrl}/nested.png`, ownerId), null)
  assert.equal(
    ownedTutorPhotoPath(
      `https://fceekjlispfjduetumrf.supabase.co/storage/v1/object/public/tutor-photos/${fileId}.webp`,
      ownerId,
    ),
    null,
  )
})

test('photo storage cleans up only owned objects and persists zero-row failures', () => {
  const route = readSource('src/app/api/tutor/profile/photo/route.ts')

  assert.match(route, /file\.size > TUTOR_PHOTO_MAX_BYTES/)
  assert.match(route, /processTutorPhoto\(file\.type, originalBytes\)/)
  assert.match(route, /const photoPath = `\$\{owner\.userId\}\/\$\{randomUUID\(\)\}\.\$\{photo\.extension\}`/)
  assert.match(route, /\.upload\(photoPath, photo\.bytes, \{[\s\S]*?contentType: photo\.contentType,[\s\S]*?upsert: false/)
  assert.match(route, /\.update\(\{ photo_url: publicUrl\.publicUrl \}\)/)
  assert.match(route, /owner\.photoUrl[\s\S]*?updateQuery\.eq\('photo_url', owner\.photoUrl\)[\s\S]*?updateQuery\.is\('photo_url', null\)/)
  assert.match(route, /\.select\('photo_url'\)\s*\.single\(\)/)
  assert.match(route, /if \(updateError\) \{[\s\S]*?\.remove\(\[photoPath\]\)/)
  assert.match(route, /ownedTutorPhotoPath\(owner\.photoUrl, owner\.userId\)/)
  assert.match(route, /previousPath && previousPath !== photoPath[\s\S]*?\.remove\(\[previousPath\]\)/)
  assert.match(route, /export async function DELETE\(\)[\s\S]*?\.update\(\{ photo_url: null \}\)[\s\S]*?clearQuery\.eq\('photo_url', owner\.photoUrl\)[\s\S]*?clearQuery\.is\('photo_url', null\)[\s\S]*?\.select\('photo_url'\)\s*\.single\(\)/)
  assert.match(route, /if \(previousPath\) \{[\s\S]*?\.remove\(\[previousPath\]\)/)
})

test('public tutor profile mutations revalidate the listing and its image host is narrow', () => {
  const profileRoute = readSource('src/app/api/tutor/profile/route.ts')
  const photoRoute = readSource('src/app/api/tutor/profile/photo/route.ts')
  const nextConfig = readSource('next.config.ts')

  assert.match(profileRoute, /revalidatePath\('\/tutors'\)/)
  assert.equal(photoRoute.match(/revalidatePath\('\/tutors'\)/g)?.length, 2)
  assert.match(nextConfig, /hostname: 'fceekjlispfjduetumrf\.supabase\.co'/)
  assert.match(nextConfig, /pathname: '\/storage\/v1\/object\/public\/tutor-photos\/\*\*'/)
  assert.doesNotMatch(nextConfig, /hostname: '\*\.supabase\.co'|hostname: '\*'/)
})

test('tutor settings load all public fields without changing customer or admin cards', () => {
  const page = readSource('src/app/dashboard/settings/page.tsx')

  assert.match(page, /if \(profile\?\.role === 'customer'\)/)
  assert.match(page, /if \(profile\?\.role === 'tutor'\)/)
  assert.match(page, /\.select\('full_name, email, phone, photo_url, bio, specialties'\)/)
  assert.match(page, /\.eq\('profile_id', user\.id\)/)
  assert.match(page, /profile\?\.role === 'tutor' && tutorData/)
  assert.match(page, /<TutorPublicProfileForm/)
  assert.match(page, /\{isAdmin && \(/)
  assert.match(page, /<CardTitle>Security<\/CardTitle>/)
})

test('tutor public profile UI has associated controls, inline status, and the public bio rule', () => {
  const form = readSource('src/components/dashboard/TutorPublicProfileForm.tsx')
  const accountForm = readSource('src/components/dashboard/ProfileForm.tsx')

  for (const id of ['tutor-profile-photo', 'tutor-profile-bio', 'tutor-profile-subjects']) {
    assert.match(form, new RegExp(`htmlFor="${id}"`))
    assert.match(form, new RegExp(`id="${id}"`))
  }
  assert.match(form, /accept="image\/jpeg,image\/png,image\/webp,image\/avif"/)
  assert.match(form, /maxLength=\{2000\}/)
  assert.match(form, /up to 12 subjects/)
  assert.match(form, /bio is at least 40 characters/)
  assert.match(form, /aria-live="polite"/)
  assert.match(form, /role="alert"/)
  assert.match(form, /fetch\('\/api\/tutor\/profile'/)
  assert.match(form, /fetch\('\/api\/tutor\/profile\/photo'/)
  assert.match(form, /method: 'DELETE'/)

  for (const id of ['account-full-name', 'account-email', 'account-phone']) {
    assert.match(accountForm, new RegExp(`htmlFor="${id}"`))
    assert.match(accountForm, new RegExp(`id="${id}"`))
  }
})
