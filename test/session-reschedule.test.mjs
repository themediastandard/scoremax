import assert from 'node:assert/strict'
import test from 'node:test'
import { existsSync, readFileSync } from 'node:fs'
import { registerHooks } from 'node:module'
import { pathToFileURL } from 'node:url'

const REPO = new URL('../', import.meta.url)
const SRC = new URL('src/', REPO).pathname

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (!specifier.startsWith('@/')) return nextResolve(specifier, context)
    const base = SRC + specifier.slice(2)
    const target = [base, `${base}.ts`, `${base}.js`].find((p) => existsSync(p)) ?? base
    return nextResolve(pathToFileURL(target).href, context)
  },
})

process.env.NEXT_PUBLIC_APP_URL = 'https://www.scoremaxtutoring.com'

const { sessionRescheduledEmail } = await import(
  new URL('src/lib/email-templates.ts', REPO).href
)

const PREVIOUS_START = '2026-08-15T19:00:00.000Z'
const PREVIOUS_END = '2026-08-15T20:00:00.000Z'
const NEW_START = '2026-08-17T21:30:00.000Z'
const NEW_END = '2026-08-17T22:30:00.000Z'

function render(overrides = {}) {
  return sessionRescheduledEmail({
    recipient: 'student',
    recipientName: 'Adib Abla',
    counterpartName: 'Avi Spiller',
    previousStart: PREVIOUS_START,
    previousEnd: PREVIOUS_END,
    newStart: NEW_START,
    newEnd: NEW_END,
    sessionType: 'online',
    meetUrl: 'https://meet.google.com/abc-defg-hij',
    calendarUpdated: true,
    ...overrides,
  })
}

test('reschedule confirmation makes the old and new times explicit in Eastern Time', () => {
  const { subject, html } = render()

  assert.equal(subject, 'Session Rescheduled: New Date and Time')
  assert.ok(html.includes('Adib Abla'))
  assert.ok(html.includes('Avi Spiller'))
  assert.ok(html.includes('August 15, 2026'))
  assert.ok(html.includes('3:00 PM'))
  assert.ok(html.includes('August 17, 2026'))
  assert.ok(html.includes('5:30 PM'))
  assert.ok(html.includes('(EDT)'))
  assert.ok(html.includes('Your calendar invitation has also been updated.'))
})

test('online reschedule keeps the existing Meet link available', () => {
  const { html } = render()

  assert.ok(html.includes('Online (Google Meet)'))
  assert.ok(html.includes('href="https://meet.google.com/abc-defg-hij"'))
  assert.ok(html.includes('Open Google Meet'))
})

test('an in-person session without a calendar event gives clear instructions and no Meet link', () => {
  const { html } = render({
    sessionType: 'in-person',
    meetUrl: null,
    calendarUpdated: false,
  })

  assert.ok(html.includes('Sawgrass, FL'))
  assert.ok(html.includes('Please use the new date and time below.'))
  assert.ok(!html.includes('meet.google.com'))
  assert.ok(!html.includes('Open Google Meet'))
})

test('reschedule confirmation escapes names supplied by customers or admins', () => {
  const { html } = render({
    recipientName: '<img src=x onerror=alert(1)>',
    counterpartName: '<a href="https://evil.example">Pay</a>',
  })

  assert.ok(!html.includes('<img src=x'))
  assert.ok(!html.includes('<a href="https://evil.example">'))
  assert.ok(html.includes('&lt;img src=x onerror=alert(1)&gt;'))
  assert.ok(html.includes('&lt;a href=&quot;https://evil.example&quot;&gt;'))
})

test('the admin route fails closed, compensates a failed database write, and emails only after save', () => {
  const source = readFileSync(
    new URL('src/app/api/admin/sessions/[id]/route.ts', REPO),
    'utf8'
  )

  assert.match(source, /Google Calendar could not be updated, so no changes were saved/)
  assert.match(source, /rollbackExternalChange = outcome\.rollbackCalendar/)
  assert.match(source, /await rollbackExternalChange\(\)/)
  assert.match(source, /reportError\('schedule:calendar-rollback'/)
  assert.match(source, /handleReassign\(merged, currentSession\)/)
  assert.match(source, /sameSessionInstant\(confirmed_start, currentSession\.confirmed_start\)/)
  assert.match(source, /sameSessionInstant\(confirmed_end, currentSession\.confirmed_end\)/)
  assert.match(source, /const previousPlan = buildSessionCalendarPlan\(previousSession\)/)
  assert.match(source, /await patchEvent\(previousPlan\.requestBody\)/)

  const databaseWrite = source.indexOf(".from('sessions')\n    .update(updates)")
  const emailDelivery = source.indexOf('const delivered = await pendingEmails()')
  assert.ok(databaseWrite > 0, 'database write not found')
  assert.ok(emailDelivery > databaseWrite, 'reschedule emails moved before the durable write')
})

test('customers remain read-only while admins receive the reschedule controls', () => {
  const sessionsPage = readFileSync(
    new URL('src/app/dashboard/sessions/page.tsx', REPO),
    'utf8'
  )
  const sessionList = readFileSync(
    new URL('src/components/dashboard/SessionList.tsx', REPO),
    'utf8'
  )
  const sessionForm = readFileSync(
    new URL('src/components/dashboard/SessionForm.tsx', REPO),
    'utf8'
  )

  assert.match(sessionsPage, /profile\?\.role === 'customer'/)
  assert.match(sessionsPage, /isAdmin=\{false\}/)
  const adminBranch = sessionList.indexOf('isAdmin ? (')
  const editForm = sessionList.indexOf('<SessionForm', adminBranch)
  const readOnlyDetails = sessionList.indexOf('<SessionDetails', editForm)
  assert.ok(adminBranch > 0 && editForm > adminBranch && readOnlyDetails > editForm)
  assert.match(sessionForm, /'Reschedule Session'/)
  assert.match(sessionForm, /disabled=\{loading \|\| !hasChanges \|\| !hasActiveStudents \|\| needsStudent\}/)
})

test('initial scheduling email renders a working Meet button instead of escaped link markup', () => {
  const source = readFileSync(
    new URL('src/app/api/admin/sessions/[id]/route.ts', REPO),
    'utf8'
  )

  assert.doesNotMatch(source, /locationText[\s\S]*<a href=/)
  assert.match(source, /ctaText: 'Open Google Meet', ctaUrl: meetUrl/)
})
