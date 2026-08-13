import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const require = createRequire(import.meta.url)
const { groupTutorSessions, isSafeHttpUrl } = require('../src/lib/tutor-session-groups.js')
const readSource = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')

const tutorPage = readSource('src/app/dashboard/tutors/[id]/page.tsx')
const tutorLoader = readSource('src/lib/admin-tutor-detail.ts')
const tutorDetail = readSource('src/components/dashboard/TutorDetailContent.tsx')
const tutorSessionCard = readSource('src/components/dashboard/TutorSessionCard.tsx')
const tutorDirectory = readSource('src/components/dashboard/TutorsTable.tsx')

test('tutor details route fails closed and validates the requested tutor id', () => {
  assert.match(tutorPage, /if \(!user\) redirect\('\/login'\)/)
  assert.match(tutorPage, /if \(profile\?\.role !== 'admin'\) redirect\('\/dashboard'\)/)
  assert.match(tutorPage, /z\.string\(\)\.uuid\(\)/)
  assert.match(tutorPage, /if \(!parsedId\.success\) notFound\(\)/)
  assert.match(tutorPage, /loadAdminTutorDetail\(parsedId\.data\)/)
  assert.match(tutorPage, /if \(!detail\) notFound\(\)/)
})

test('loader selects safe tutor fields and scopes session history to that tutor', () => {
  assert.match(tutorLoader, /\.from\('tutors'\)/)
  assert.match(tutorLoader, /\.eq\('id', tutorId\)/)
  assert.match(tutorLoader, /\.maybeSingle\(\)/)
  assert.match(tutorLoader, /\.from\('sessions'\)/)
  assert.match(tutorLoader, /\.eq\('assigned_tutor_id', tutorId\)/)
  assert.match(tutorLoader, /student:students\(id, full_name, email, grade\)/)
  assert.match(tutorLoader, /customers\(full_name, email\)/)
  assert.match(tutorLoader, /Promise\.all/)
  assert.doesNotMatch(tutorLoader, /google_access_token/)
  assert.doesNotMatch(tutorLoader, /google_refresh_token/)
  assert.doesNotMatch(tutorLoader, /google_token_expiry/)
  assert.doesNotMatch(tutorLoader, /google_calendar_connected/)
})

test('every tutor directory row links to its details page without moving edit controls', () => {
  assert.match(tutorDirectory, /`\/dashboard\/tutors\/\$\{tutor\.id\}`/)
  assert.match(tutorDirectory, /<Link href=\{detailsHref\}/)
  assert.match(tutorDirectory, /aria-label=\{`View details for/)
  assert.match(tutorDirectory, /<TutorForm tutor=\{tutor\}/)
  assert.match(tutorDirectory, /<TutorAvatar tutor=\{tutor\}/)
  assert.match(tutorDirectory, /tutor\.photo_url/)
  assert.match(tutorDirectory, /tutorInitials\(tutor\.full_name\)/)
  assert.match(tutorDirectory, /onError=\{\(event\) => \{ event\.currentTarget\.style\.display = 'none' \}\}/)
  assert.match(tutorDirectory, /alt=""/)
  assert.match(tutorDirectory, /aria-hidden="true"/)
})

test('details display the tutor profile, sidebar bio, full session groups, and honest empty states', () => {
  for (const text of [
    'Tutor Profile',
    'Specialties',
    'Bio',
    'Upcoming Sessions',
    'Past Sessions',
    'No upcoming sessions are assigned to this tutor.',
    'No past sessions are recorded for this tutor.',
  ]) {
    assert.match(tutorDetail, new RegExp(text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')))
  }
  for (const text of ['Time not set', 'Student not assigned', 'View order']) {
    assert.match(tutorSessionCard, new RegExp(text))
  }
  assert.match(tutorSessionCard, /formatBusinessDateTime\(session\.confirmed_start\)/)
  assert.match(tutorSessionCard, /IN_PERSON_LOCATION/)
  assert.match(tutorSessionCard, /subjectMap\[subjectId\]/)
  assert.match(tutorSessionCard, /isSafeHttpUrl\(session\.meet_url\)/)
  assert.match(tutorDetail, /tutor\.is_active \? 'Active' : 'Inactive'/)
  assert.doesNotMatch(tutorDetail, /Status & Integrations/)
  assert.doesNotMatch(tutorDetail, /Tutor calendar/)
  assert.doesNotMatch(tutorDetail, /google_calendar_connected/)

  const asideStart = tutorDetail.indexOf('<aside')
  const bioStart = tutorDetail.indexOf('<Section title="Bio">')
  assert.ok(asideStart >= 0 && bioStart > asideStart, 'Bio must remain in the tutor sidebar')
  assert.match(tutorDetail, /xl:max-h-\[32rem\]/)
  assert.match(tutorDetail, /xl:overflow-y-auto/)
})

test('sessions use accessible collapsed tiles with organized expandable details', () => {
  assert.match(tutorDetail, /<TutorSessionCard key=\{session\.id\}/)
  assert.match(tutorSessionCard, /const \[expanded, setExpanded\] = useState\(false\)/)
  assert.match(tutorSessionCard, /<article data-session-card/)
  assert.match(tutorSessionCard, /<button[\s\S]*aria-expanded=\{expanded\}/)
  assert.match(tutorSessionCard, /aria-controls=\{detailsId\}/)
  assert.match(tutorSessionCard, /onClick=\{\(\) => setExpanded/)
  assert.match(tutorSessionCard, /<ChevronDown/)
  assert.match(tutorSessionCard, /<ChevronRight/)
  assert.match(tutorSessionCard, /id=\{detailsId\}[\s\S]*role="region"[\s\S]*aria-labelledby=\{toggleId\}[\s\S]*hidden=\{!expanded\}/)
  assert.match(tutorSessionCard, /<dl className=/)
  assert.match(tutorSessionCard, /<dt[^>]*>[\s\S]*Date & time[\s\S]*<\/dt>/)
  assert.match(tutorSessionCard, /<dt[^>]*>[\s\S]*Subjects[\s\S]*<\/dt>/)
  assert.match(tutorSessionCard, /Session format & location/)
  assert.match(tutorSessionCard, /Join Google Meet/)
  assert.match(tutorSessionCard, /View order/)

  const toggleEnd = tutorSessionCard.indexOf('</button>')
  assert.ok(toggleEnd >= 0)
  assert.ok(tutorSessionCard.indexOf('Join Google Meet') > toggleEnd, 'Meet link must stay outside the toggle button')
  assert.ok(tutorSessionCard.indexOf('View order') > toggleEnd, 'order link must stay outside the toggle button')
})

test('session grouping uses terminal status and confirmed time without losing a row', () => {
  const now = new Date('2026-08-13T16:00:00.000Z')
  const sessions = [
    { id: 'completed-future', status: 'completed', confirmed_start: '2026-08-14T16:00:00.000Z' },
    { id: 'cancelled-future', status: 'cancelled', confirmed_start: '2026-08-14T16:00:00.000Z' },
    { id: 'pending-old', status: 'pending_scheduling', confirmed_start: '2026-08-12T16:00:00.000Z' },
    { id: 'scheduled-missing', status: 'scheduled', confirmed_start: null },
    { id: 'scheduled-past', status: 'scheduled', confirmed_start: '2026-08-12T16:00:00.000Z' },
    { id: 'scheduled-now', status: 'scheduled', confirmed_start: now.toISOString() },
    { id: 'legacy-future', status: 'confirmed', confirmed_start: '2026-08-14T16:00:00.000Z' },
    { id: 'legacy-past', status: 'archived', confirmed_start: '2026-08-11T16:00:00.000Z' },
    { id: 'legacy-no-time', status: 'mystery', confirmed_start: 'not-a-date' },
  ]

  const grouped = groupTutorSessions(sessions, now)
  assert.deepEqual(
    new Set(grouped.upcoming.map((session) => session.id)),
    new Set(['pending-old', 'scheduled-missing', 'scheduled-now', 'legacy-future', 'legacy-no-time'])
  )
  assert.deepEqual(
    new Set(grouped.past.map((session) => session.id)),
    new Set(['completed-future', 'cancelled-future', 'scheduled-past', 'legacy-past'])
  )
  assert.equal(grouped.upcoming.length + grouped.past.length, sessions.length)
  assert.equal(new Set([...grouped.upcoming, ...grouped.past]).size, sessions.length)
})

test('session grouping rejects a bad clock and Meet links allow only ordinary HTTP(S)', () => {
  assert.throws(() => groupTutorSessions([], 'not-a-date'), TypeError)
  assert.equal(isSafeHttpUrl('https://meet.google.com/abc-defg-hij'), true)
  assert.equal(isSafeHttpUrl('http://example.com/meeting'), true)
  assert.equal(isSafeHttpUrl('javascript:alert(1)'), false)
  assert.equal(isSafeHttpUrl('https://user:pass@example.com/meeting'), false)
  assert.equal(isSafeHttpUrl('/relative-meeting'), false)
  assert.equal(isSafeHttpUrl(null), false)
})
