import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

function readSource(path) {
  return readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')
}

test('new email and Google signups arm a trusted notification without backfilling existing accounts', () => {
  const callback = readSource('src/app/auth/callback/route.ts')
  const completion = readSource('src/app/api/auth/complete-signup/route.ts')

  assert.match(callback, /customer\?\.account_type === null/)
  assert.match(callback, /SIGNUP_ADMIN_NOTIFICATION_PENDING_KEY\]: true/)
  assert.match(completion, /if \(!customer\.account_type\) \{[\s\S]*SIGNUP_ADMIN_NOTIFICATION_PENDING_KEY\]: true/)
  assert.match(completion, /signupNotificationPending = true/)
  assert.match(completion, /SIGNUP_ADMIN_NOTIFICATION_PENDING_KEY\]: signupNotificationPending \|\| null/g)
  assert.match(completion, /await notifyAdminsOfSignup\(\{[\s\S]*notificationPending: signupNotificationPending/)
})

test('admin signup email uses configured recipients, escaped detail rows, and a customer link', () => {
  const notification = readSource('src/lib/signup-admin-notification.ts')

  assert.match(notification, /\.from\('admin_settings'\)[\s\S]*\.eq\('key', 'notification_emails'\)/)
  assert.match(notification, /notificationEmails\(adminSettings\?\.value\)/)
  assert.match(notification, /to: adminEmails/)
  assert.match(notification, /replyTo: customer\.email/)
  assert.match(notification, /detailRow\('Account Owner:',/)
  assert.match(notification, /detailRow\('Email:', customer\.email\)/)
  assert.match(notification, /detailRow\('Account Type:', accountLabel\)/)
  assert.match(notification, /dashboard\/customers\/\$\{customer\.id\}/)
  assert.doesNotMatch(notification, /body: `[^`]*\$\{customer\./)
})

test('delivery is best effort, retryable, and idempotent', () => {
  const notification = readSource('src/lib/signup-admin-notification.ts')
  const completion = readSource('src/app/api/auth/complete-signup/route.ts')

  assert.match(notification, /SIGNUP_ADMIN_NOTIFICATION_SENT_KEY.*=== 'string'/)
  assert.match(notification, /SIGNUP_ADMIN_NOTIFICATION_PENDING_KEY.*!== true/)
  assert.match(notification, /`admin-signup-\$\{userId\}`/)
  assert.match(notification, /if \(!sent\) return/)
  assert.match(notification, /SIGNUP_ADMIN_NOTIFICATION_PENDING_KEY\]: null/)
  assert.match(notification, /SIGNUP_ADMIN_NOTIFICATION_SENT_KEY\]: new Date\(\)\.toISOString\(\)/)
  assert.ok(
    completion.indexOf('await notifyAdminsOfSignup') < completion.lastIndexOf('return NextResponse.json({'),
    'notification should be attempted after durable signup work and before the successful response',
  )
  assert.doesNotMatch(completion, /if \(!await notifyAdminsOfSignup/)
})
