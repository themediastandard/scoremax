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
const resetPasswordPage = readSource('src/app/reset-password/page.tsx')
const resetPasswordForm = readSource('src/app/reset-password/ResetPasswordForm.tsx')
const updatePasswordRoute = readSource('src/app/api/auth/update-password/route.ts')

test('auth emails use the scanner-safe interstitial and Stripe fulfillment creates no guest identity', () => {
  assert.match(emailHook, /buildAuthContinueUrl/)
  assert.match(stripeWebhook, /authoritativeBooking\.customer_id/)
  assert.doesNotMatch(stripeWebhook, /auth\.admin\.(createUser|generateLink)/)
  assert.doesNotMatch(emailHook, /\/auth\/callback\?\$\{params/)
  assert.doesNotMatch(stripeWebhook, /setPasswordUrl = `\$\{appUrl\}\/auth\/callback/)
})

test('the interstitial consumes a token only after an explicit POST', () => {
  assert.match(continuePage, /<form action="\/auth\/callback" method="post">/)
  assert.match(continuePage, /name="token_hash"/)
  assert.match(callback, /export async function POST/)
  assert.match(callback, /supabase\.auth\.verifyOtp/)
})

test('successful auth callbacks attach the new session cookies to their redirect', () => {
  assert.match(callback, /getAll\(\) \{[\s\S]*request\.cookies\.getAll\(\)/)
  assert.match(callback, /setAll\(cookiesToSet\) \{[\s\S]*pendingCookies\.push/)
  assert.match(callback, /response\.cookies\.set\(name, value, options\)/)
  assert.match(callback, /verifyOtp[\s\S]*return redirectWithSessionCookies/)
  assert.match(callback, /exchangeCodeForSession[\s\S]*return redirectWithSessionCookies/)
})

test('auth callbacks redirect to the public ScoreMax origin instead of Netlify internal request URLs', () => {
  assert.match(callback, /const APP_URL = process\.env\.NEXT_PUBLIC_APP_URL \|\| 'https:\/\/www\.scoremaxtutoring\.com'/)
  assert.match(callback, /function publicUrl\(path: string\): URL/)
  assert.match(callback, /new URL\(path, APP_URL\)/)
  assert.match(callback, /redirectWithSessionCookies\(publicUrl\(destinationFor\(type, next\)\), 303\)/)
  assert.doesNotMatch(callback, /new URL\(destinationFor\(type, next\), request\.url\)/)
})

test('password recovery checks the session on the server without an indefinite client spinner', () => {
  assert.match(resetPasswordPage, /export const dynamic = 'force-dynamic'/)
  assert.match(resetPasswordPage, /supabase\.auth\.getUser\(\)/)
  assert.match(resetPasswordPage, /<ResetPasswordForm hasSession=\{Boolean\(user\)\}/)
  assert.doesNotMatch(resetPasswordForm, /auth\.getSession\(\)/)
  assert.doesNotMatch(resetPasswordForm, /hasSession === null/)
})

test('password changes use the authenticated server session instead of the locking browser client', () => {
  assert.match(resetPasswordForm, /fetch\('\/api\/auth\/update-password'/)
  assert.match(resetPasswordForm, /controller\.abort\(\)/)
  assert.doesNotMatch(resetPasswordForm, /supabase\.auth\.updateUser/)
  assert.match(updatePasswordRoute, /supabase\.auth\.getUser\(\)/)
  assert.match(updatePasswordRoute, /supabase\.auth\.updateUser\(\{ password \}\)/)
  assert.match(updatePasswordRoute, /requestOrigin !== request\.nextUrl\.origin/)
})

test('the legacy Netlify production hostname redirects to the canonical host', () => {
  assert.match(middleware, /LEGACY_PRODUCTION_HOST = 'scoremaxtutor\.netlify\.app'/)
  assert.match(middleware, /CANONICAL_PRODUCTION_HOST = 'www\.scoremaxtutoring\.com'/)
  assert.match(middleware, /NextResponse\.redirect\(canonical, 308\)/)
  assert.match(middleware, /request\.nextUrl\.pathname !== '\/api\/auth\/send-email'/)
})

test('Netlify deploy hostnames cannot retain customers inside the auth and booking journey', () => {
  assert.match(middleware, /NETLIFY_DEPLOY_HOST_SUFFIX = '--scoremaxtutor\.netlify\.app'/)
  assert.match(middleware, /'\/auth\/continue'/)
  assert.match(middleware, /'\/auth\/callback'/)
  assert.match(middleware, /'\/book'/)
  assert.match(middleware, /host\.endsWith\(NETLIFY_DEPLOY_HOST_SUFFIX\)/)
  assert.match(middleware, /CANONICAL_AUTH_PATHS\.has\(request\.nextUrl\.pathname\)/)
  assert.match(middleware, /NextResponse\.redirect\(canonical, 307\)/)
})
