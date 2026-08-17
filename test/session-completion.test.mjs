import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'

const completionEmail = readFileSync(
  new URL('../src/lib/session-completion-email.ts', import.meta.url),
  'utf8'
)
const emailTemplates = readFileSync(
  new URL('../src/lib/email-templates.ts', import.meta.url),
  'utf8'
)
const adminSessionRoute = readFileSync(
  new URL('../src/app/api/admin/sessions/[id]/route.ts', import.meta.url),
  'utf8'
)
const cronRoute = readFileSync(
  new URL('../src/app/api/cron/session-reminders/route.ts', import.meta.url),
  'utf8'
)
const scheduledFunction = readFileSync(
  new URL('../netlify/functions/session-reminders.mts', import.meta.url),
  'utf8'
)

test('completion email leads with thanks and includes the client-provided Google review action', () => {
  assert.match(completionEmail, /https:\/\/g\.page\/r\/CaKfA31jvIHhEAE\/review/)
  assert.match(completionEmail, /subject: 'Thank you for choosing ScoreMax'/)
  assert.match(completionEmail, /title: 'Session Complete'/)
  assert.match(completionEmail, /We appreciate the opportunity to support your learning goals/)
  assert.equal((completionEmail.match(/Thank you for choosing ScoreMax/g) ?? []).length, 1)
  assert.match(completionEmail, /we would be grateful if you took a moment to leave us a Google review/)
  assert.match(completionEmail, /feedback helps other families find the right tutoring support/)
  assert.match(completionEmail, /ctaText: 'Leave a Google Review'/)
  assert.match(completionEmail, /secondaryCtaText: 'Book Another Session'/)
})

test('shared branded layout supports a quieter escaped secondary action', () => {
  assert.match(emailTemplates, /secondaryCtaText = options\.secondaryCtaText\s*\? escapeHtml/)
  assert.match(emailTemplates, /secondaryCtaUrl = options\.secondaryCtaUrl\s*\? escapeHtml/)
  assert.match(emailTemplates, /\$\{ctaButton\}\s*\$\{secondaryCta\}/)
})

test('manual and automatic completion share one idempotent customer email', () => {
  assert.match(adminSessionRoute, /sendSessionCompletionEmail\(\{\s*id: completed\.id,/)
  assert.match(cronRoute, /sendSessionCompletionEmail\(\{/)
  assert.match(completionEmail, /`session-completed-\$\{session\.id\}`/)
})

test('cron completes only scheduled sessions whose confirmed end has passed', () => {
  assert.match(
    cronRoute,
    /\.update\(\{ status: 'completed' \}\)\s*\.eq\('status', 'scheduled'\)\s*\.not\('confirmed_end', 'is', null\)\s*\.lte\('confirmed_end', nowIso\)/
  )
  assert.match(cronRoute, /if \(dryRun\) \{[\s\S]*\.select\(COMPLETION_EMAIL_COLUMNS\)/)
})

test('newly completed overdue sessions are emailed while unrelated historical completions are excluded', () => {
  assert.match(cronRoute, /const COMPLETION_EMAIL_WINDOW_MS = 30 \* 60 \* 1000/)
  assert.match(cronRoute, /\[\.\.\.newlyCompletedSessions, \.\.\.recentCompletionEmailCandidates\]/)
  assert.match(cronRoute, /new Map\(/)
  assert.match(cronRoute, /\.eq\('status', 'completed'\)/)
  assert.match(cronRoute, /\.gte\('confirmed_end', completionEmailWindowStart\)/)
  assert.match(cronRoute, /\.lte\('confirmed_end', nowIso\)/)
})

test('completion runs on the existing fifteen-minute scheduled function', () => {
  assert.match(scheduledFunction, /session completion and the one-hour-before reminder/)
  assert.match(scheduledFunction, /schedule: '\*\/15 \* \* \* \*'/)
})
