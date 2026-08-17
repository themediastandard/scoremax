import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const readSource = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')
const page = readSource('src/app/dashboard/sessions/page.tsx')
const sessionList = readSource('src/components/dashboard/SessionList.tsx')
const tutorList = sessionList.slice(
  sessionList.indexOf('export function TutorSessionList'),
  sessionList.indexOf('export function FlatSessionList'),
)

test('tutor sessions stay scoped to the signed-in tutor and use the timeline', () => {
  assert.match(page, /\.eq\('profile_id', user\.id\)/)
  assert.match(page, /\.eq\('assigned_tutor_id', tutor\?\.id\)/)
  assert.match(page, /\.in\('status', \['scheduled', 'completed'\]\)/)
  assert.match(page, /<TutorSessionList/)
  assert.doesNotMatch(page, /TutorSessionsTable|const metrics|This Week|Total Upcoming/)
})

test('tutor timeline shows all upcoming and completed sessions in date sections', () => {
  const upcoming = tutorList.indexOf('>Upcoming Sessions</h2>')
  const completed = tutorList.indexOf('>Completed Sessions</h2>', upcoming)

  assert.ok(upcoming >= 0)
  assert.ok(completed > upcoming)
  assert.match(tutorList, /useState\('all'\)/)
  assert.match(tutorList, /groupSessionsByBusinessDate\(upcoming\)/)
  assert.match(tutorList, /groupSessionsByBusinessDate\(completed\)/)
  assert.match(tutorList, /timestamp\(a\.confirmed_start, Number\.MAX_SAFE_INTEGER\) - timestamp\(b\.confirmed_start, Number\.MAX_SAFE_INTEGER\)/)
  assert.match(tutorList, /timestamp\(b\.confirmed_start, Number\.MIN_SAFE_INTEGER\) - timestamp\(a\.confirmed_start, Number\.MIN_SAFE_INTEGER\)/)
  assert.match(tutorList, /tutor-\$\{section\}-session-date-\$\{group\.key\}/)
  assert.match(tutorList, /group\.sessions\.map\(renderSession\)/)
})

test('tutor timeline cards lead with time and remain read-only', () => {
  assert.match(sessionList, /dateGrouped \? \(/)
  assert.match(sessionList, /dateGrouped[\s\S]*formatBusinessTime\(session\.confirmed_start\)[\s\S]*session\.student\?\.full_name[\s\S]*session\.subjects/)
  assert.match(tutorList, /isAdmin=\{false\}/)
  assert.match(tutorList, /dateGrouped=\{true\}/)
  assert.doesNotMatch(tutorList, /<SessionForm/)
  assert.match(sessionList, /isAdmin \? \([\s\S]*<SessionForm[\s\S]*<SessionDetails/)
})

test('tutor timeline keeps focused search, status, and student controls', () => {
  assert.match(tutorList, /aria-label="Search tutor sessions"/)
  assert.match(tutorList, /aria-label="Filter tutor sessions by status"/)
  assert.match(tutorList, /aria-label="Filter tutor sessions by student"/)
  assert.match(tutorList, /<SelectItem value="all">All Sessions<\/SelectItem>/)
  assert.match(tutorList, /<SelectItem value="scheduled">Upcoming<\/SelectItem>/)
  assert.match(tutorList, /<SelectItem value="completed">Completed<\/SelectItem>/)
  assert.doesNotMatch(tutorList, /typeFilter|All Types|TutorSessionsTable/)
})
