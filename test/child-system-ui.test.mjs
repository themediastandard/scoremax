import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const readSource = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')

const bookingPage = readSource('src/app/book/page.tsx')
const bookingHook = readSource('src/hooks/useBookingForm.ts')
const contactForm = readSource('src/components/booking/ContactForm.tsx')
const availabilityForm = readSource('src/components/booking/AvailabilityForm.tsx')
const studentsRoute = readSource('src/app/api/account/students/route.ts')

test('booking contact copy tells both recipients about schedules and reminders', () => {
  assert.match(
    contactForm,
    /The account owner and selected student both receive session schedules and reminders\./
  )
  assert.match(contactForm, /isStudentAccount \? 'Your contact information'/)
  assert.match(contactForm, /You will receive session schedules and reminders\./)
  assert.match(bookingPage, /isStudentAccount=\{isStudentAccount\}/)
})

test('managed student grade never comes from legacy booking contact state or payloads', () => {
  for (const source of [bookingHook, contactForm]) {
    assert.doesNotMatch(source, /studentGrade/)
    assert.doesNotMatch(source, /student_grade/)
  }

  const bookingSubmissionStart = bookingPage.indexOf('// 1. If using credit (member)')
  const bookingSubmissionEnd = bookingPage.indexOf('if (loadingSubjects)')
  assert.ok(bookingSubmissionStart >= 0)
  assert.ok(bookingSubmissionEnd > bookingSubmissionStart)
  const bookingSubmission = bookingPage.slice(bookingSubmissionStart, bookingSubmissionEnd)
  assert.doesNotMatch(bookingSubmission, /studentGrade/)
  assert.doesNotMatch(bookingSubmission, /student_grade/)
  assert.match(bookingPage, /fetch\('\/api\/auth\/complete-signup'/)
  assert.match(bookingPage, /studentGrade: pendingGoogleSignup\?\.accountType === 'student'/)
  assert.match(bookingPage, /student_id:\s*state\.studentId/)
})

test('student accounts auto-select their self profile and skip the parent recipient picker', () => {
  assert.match(studentsRoute, /owner\.account_type === 'student'/)
  assert.match(studentsRoute, /selfStudentId/)
  assert.match(studentsRoute, /student\.is_active/)
  assert.match(bookingPage, /accountType === 'student'/)
  assert.match(bookingPage, /studentId: selfStudent\.id/)
  assert.match(bookingPage, /previous === 'student' \? 'subjects' : previous/)
  assert.match(bookingPage, /!isStudentAccount && \(/)
  assert.match(bookingPage, /const subjectStep = isStudentAccount \? 1 : 2/)
  assert.match(bookingPage, /isStudentAccount && studentStatus === 'ready' && !selfStudent/)
  assert.match(bookingPage, /We couldn&apos;t load your student profile/)
})

test('the availability step names the selected student', () => {
  assert.match(availabilityForm, /studentName: string/)
  assert.match(availabilityForm, /Choose a time for \{studentName\}/)
  assert.match(bookingPage, /studentName=\{selectedStudent\?\.fullName \?\? 'this student'\}/)
})
