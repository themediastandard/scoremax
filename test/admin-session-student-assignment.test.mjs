import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

import assignment from '../src/lib/session-student-assignment.js'

const { replaceManagedStudentAttendee, studentAssignmentPolicy } = assignment
const readSource = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')

test('calendar assignment replaces only the child and preserves owner, tutor, and other attendees', () => {
  const owner = { email: 'parent@example.com', full_name: 'Parent' }
  const tutor = { email: 'tutor@example.com', full_name: 'Tutor' }
  const oldStudent = { email: 'old@example.com', full_name: 'Old Student' }
  const nextStudent = { email: 'new@example.com', full_name: 'New Student' }
  const attendees = [
    { email: owner.email, responseStatus: 'accepted', comment: 'keep-owner-state' },
    { email: tutor.email, responseStatus: 'tentative', comment: 'keep-tutor-state' },
    { email: oldStudent.email, responseStatus: 'accepted' },
    { email: 'observer@example.com', responseStatus: 'needsAction' },
  ]

  const result = replaceManagedStudentAttendee(
    attendees,
    oldStudent,
    nextStudent,
    owner,
    tutor
  )

  assert.deepEqual(result, [
    attendees[0],
    attendees[1],
    attendees[3],
    { email: nextStudent.email, displayName: nextStudent.full_name },
  ])
  assert.equal(result.filter((item) => item.email === nextStudent.email).length, 1)
  assert.equal(result.some((item) => item.email === oldStudent.email), false)
})

test('a child sharing the owner email cannot remove or duplicate the owner attendee', () => {
  const owner = { email: 'family@example.com', full_name: 'Parent' }
  const tutor = { email: 'tutor@example.com', full_name: 'Tutor' }
  const ownerAttendee = { email: owner.email, responseStatus: 'accepted' }
  const result = replaceManagedStudentAttendee(
    [ownerAttendee, { email: tutor.email }],
    { email: owner.email, full_name: 'Old Student' },
    { email: 'new@example.com', full_name: 'New Student' },
    owner,
    tutor
  )

  assert.equal(result[0], ownerAttendee)
  assert.equal(result.filter((item) => item.email === owner.email).length, 1)
})

test('student-bound products fail closed while ordinary family payments can move siblings', () => {
  assert.equal(studentAssignmentPolicy({
    currentStudentId: 'student-a', nextStudentId: 'student-b', paymentMethod: 'step_up',
  }).code, 'step_up_student_reassignment_blocked')
  assert.equal(studentAssignmentPolicy({
    currentStudentId: 'student-a', nextStudentId: 'student-b', paymentMethod: 'zelle',
    paymentType: 'course', courseEnrollmentId: 'course-a',
  }).code, 'course_student_reassignment_blocked')
  assert.equal(studentAssignmentPolicy({
    currentStudentId: null, nextStudentId: 'student-b', paymentMethod: 'account_credit',
    paymentType: 'package', boundStudentId: 'student-a',
  }).code, 'student_bound_credit_reassignment_blocked')
  assert.deepEqual(studentAssignmentPolicy({
    currentStudentId: 'student-a', nextStudentId: 'student-b', paymentMethod: 'credit_card',
    paymentType: 'package', boundStudentId: null,
  }), { allowed: true })
  assert.deepEqual(studentAssignmentPolicy({
    currentStudentId: 'student-a', nextStudentId: 'student-b', paymentMethod: 'zelle',
    paymentType: 'single',
  }), { allowed: true })
})

test('a genuinely unassigned legacy Step Up session can receive its bound child', () => {
  assert.deepEqual(studentAssignmentPolicy({
    currentStudentId: null,
    nextStudentId: 'student-a',
    paymentMethod: 'step_up',
    paymentType: 'package',
    boundStudentId: 'student-a',
  }), { allowed: true })
})

test('admin route validates ownership and uses the atomic assignment RPC', () => {
  const route = readSource('src/app/api/admin/sessions/[id]/route.ts')

  assert.match(route, /const authError = await requireAdmin\(\)/)
  assert.match(route, /const adminUser = await getAuthUser\(\)/)
  assert.match(route, /\.eq\('customer_id', currentSession\.customer_id\)/)
  assert.match(route, /\.eq\('is_active', true\)/)
  assert.match(route, /assignmentOrder\.student_id !== currentStudentId/)
  assert.match(route, /\.rpc\('assign_admin_session_student'/)
  assert.match(route, /p_admin_profile_id: adminUser\.id/)
  assert.match(route, /p_expected_student_id: currentStudentId/)
})

test('scheduled assignment patches Google first, compensates database failure, and avoids duplicate mail', () => {
  const route = readSource('src/app/api/admin/sessions/[id]/route.ts')
  const calendarPatch = route.indexOf('await patchEvent({')
  const databaseWrite = route.indexOf(".rpc('assign_admin_session_student'")

  assert.ok(calendarPatch > 0 && databaseWrite > calendarPatch)
  assert.match(route, /sendUpdates: 'all'/)
  assert.match(route, /previousEventFields/)
  assert.match(route, /await patchEvent\(previousEventFields\)/)
  assert.match(route, /rollbackExternalChange = outcome\.rollbackCalendar/)
  assert.match(route, /await rollbackExternalChange\(\)/)
  assert.match(route, /pendingEmails = null/)
  assert.match(route, /studentAssignmentCalendarUpdated: boolean \| null = studentChanged \? false : null/)
})

test('admin UI loads active students once, scopes them by account, and keeps customer sessions read-only', () => {
  const page = readSource('src/app/dashboard/sessions/page.tsx')
  const list = readSource('src/components/dashboard/SessionList.tsx')
  const form = readSource('src/components/dashboard/SessionForm.tsx')
  const metrics = readSource('src/components/dashboard/SessionMetrics.tsx')

  assert.match(page, /\.from\('students'\)/)
  assert.match(page, /\.in\('customer_id', customerIds\)/)
  assert.match(page, /\.eq\('is_active', true\)/)
  assert.match(list, /studentsByCustomer\.get\(s\.customer_id\) \?\? \[\]/)
  assert.match(form, /<Label>Student<\/Label>/)
  assert.match(form, /placeholder="Student not assigned"/)
  assert.match(form, /Legacy session: student not assigned/)
  assert.match(form, /This account has no active managed students/)
  assert.match(form, /disabled=\{loading \|\| !hasChanges \|\| !hasActiveStudents \|\| needsStudent\}/)
  assert.match(metrics, /label: 'Tutor Unassigned'/)

  const adminBranch = list.indexOf('isAdmin ? (')
  const editableForm = list.indexOf('<SessionForm', adminBranch)
  const readOnlyDetails = list.indexOf('<SessionDetails', editableForm)
  assert.ok(adminBranch > 0 && editableForm > adminBranch && readOnlyDetails > editableForm)
})
