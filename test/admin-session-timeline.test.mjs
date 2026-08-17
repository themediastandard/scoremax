import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const source = readFileSync(new URL('../src/components/dashboard/SessionList.tsx', import.meta.url), 'utf8')

test('admin sessions are organized by urgency and time instead of customer groups', () => {
  const adminList = source.slice(
    source.indexOf('export function AdminSessionList'),
    source.indexOf('export function FlatSessionList'),
  )
  const needsScheduling = adminList.indexOf('>Needs Scheduling</h2>')
  const upcoming = adminList.indexOf('>Upcoming Sessions</h2>', needsScheduling)
  const completed = adminList.indexOf('>Completed Sessions</h2>', upcoming)

  assert.ok(needsScheduling >= 0)
  assert.ok(upcoming > needsScheduling)
  assert.ok(completed > upcoming)
  assert.doesNotMatch(adminList, /CustomerGroup|groupMap|expandedCustomers|toggleCustomer/)
  assert.match(adminList, /session\.status === 'pending_scheduling' \|\| session\.status === 'scheduled'/)
  assert.match(adminList, /timestamp\(a\.created_at, Number\.MAX_SAFE_INTEGER\) - timestamp\(b\.created_at, Number\.MAX_SAFE_INTEGER\)/)
  assert.match(adminList, /timestamp\(a\.confirmed_start, Number\.MAX_SAFE_INTEGER\) - timestamp\(b\.confirmed_start, Number\.MAX_SAFE_INTEGER\)/)
  assert.match(adminList, /timestamp\(b\.confirmed_start, Number\.MIN_SAFE_INTEGER\) - timestamp\(a\.confirmed_start, Number\.MIN_SAFE_INTEGER\)/)
})

test('admin sessions omit summary tiles and the session type filter', () => {
  const page = readFileSync(new URL('../src/app/dashboard/sessions/page.tsx', import.meta.url), 'utf8')
  const adminList = source.slice(
    source.indexOf('export function AdminSessionList'),
    source.indexOf('export function FlatSessionList'),
  )

  assert.doesNotMatch(page, /SessionMetrics|Tutor Unassigned/)
  assert.doesNotMatch(adminList, /typeFilter|All Types/)
  assert.match(adminList, /placeholder="Search owner or student\.\.\."/)
  assert.match(adminList, /<SelectItem value="active">Active Sessions<\/SelectItem>/)
  assert.match(adminList, /<SelectItem value="all">All Students<\/SelectItem>/)
  assert.match(adminList, /<SelectItem value="all">All Tutors<\/SelectItem>/)
})

test('upcoming sessions render in date-titled sections from soonest to future', () => {
  assert.match(source, /function groupSessionsByBusinessDate\(sessions: Session\[\]\)/)
  assert.match(source, /weekday: 'long',[\s\S]*?month: 'long',[\s\S]*?day: 'numeric',[\s\S]*?year: 'numeric'/)
  assert.match(source, /const upcomingDateGroups = useMemo\(\(\) => groupSessionsByBusinessDate\(upcoming\), \[upcoming\]\)/)
  assert.match(source, /Soonest dates first/)
  assert.match(source, /group\.sessions\.map\(renderSession\)/)
  assert.match(source, /aria-labelledby=\{`session-date-\$\{group\.key\}`\}/)
})

test('each admin session card leads with time and carries its own owner context', () => {
  const card = source.slice(source.indexOf('function SessionCard'), source.indexOf('function SessionDetails'))
  const timeColumn = card.indexOf("session.status === 'pending_scheduling'")
  const studentColumn = card.indexOf("session.student?.full_name ?? 'Student not assigned'")
  const owner = card.indexOf("Owner: {session.customers?.full_name || 'Unknown customer'}")

  assert.ok(timeColumn >= 0)
  assert.ok(studentColumn > timeColumn)
  assert.ok(owner > studentColumn)
  assert.match(card, /Tutor not assigned/)
  assert.match(card, /<SessionForm/)
  assert.match(card, /aria-expanded=\{expanded\}/)
})
