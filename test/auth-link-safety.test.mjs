import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const readSource = (path) =>
  readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')

const emailHook = readSource('src/app/api/auth/send-email/route.ts')
const stripeWebhook = readSource('src/app/api/stripe/webhook/route.ts')
const continuePage = readSource('src/app/auth/continue/page.tsx')
const callback = readSource('src/app/auth/callback/route.ts')
const middleware = readSource('src/middleware.ts')

test('auth emails and guest checkout use the scanner-safe interstitial', () => {
  assert.match(emailHook, /buildAuthContinueUrl/)
  assert.match(stripeWebhook, /buildAuthContinueUrl\(appUrl, tokenHash, 'recovery'\)/)
  assert.doesNotMatch(emailHook, /\/auth\/callback\?\$\{params/)
  assert.doesNotMatch(stripeWebhook, /setPasswordUrl = `\$\{appUrl\}\/auth\/callback/)
})

test('the interstitial consumes a token only after an explicit POST', () => {
  assert.match(continuePage, /<form action="\/auth\/callback" method="post">/)
  assert.match(continuePage, /name="token_hash"/)
  assert.match(callback, /export async function POST/)
  assert.match(callback, /supabase\.auth\.verifyOtp/)
})

test('the legacy Netlify production hostname redirects to the canonical host', () => {
  assert.match(middleware, /LEGACY_PRODUCTION_HOST = 'scoremaxtutor\.netlify\.app'/)
  assert.match(middleware, /CANONICAL_PRODUCTION_HOST = 'www\.scoremaxtutoring\.com'/)
  assert.match(middleware, /NextResponse\.redirect\(canonical, 308\)/)
  assert.match(middleware, /request\.nextUrl\.pathname !== '\/api\/auth\/send-email'/)
})
