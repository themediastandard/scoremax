import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { registerHooks } from 'node:module'
import test from 'node:test'
import { pathToFileURL } from 'node:url'

const REPO = new URL('../', import.meta.url)
const SRC = new URL('src/', REPO).pathname

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (!specifier.startsWith('@/')) return nextResolve(specifier, context)
    const base = SRC + specifier.slice(2)
    const target = [base, `${base}.ts`, `${base}.tsx`, `${base}.js`].find((path) => existsSync(path)) ?? base
    return nextResolve(pathToFileURL(target).href, context)
  },
})

const readSource = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')
const continuation = await import(new URL('src/lib/auth-continuation.ts', REPO).href)
const onboarding = await import(new URL('src/lib/signup-onboarding.ts', REPO).href)

function storage() {
  const values = new Map()
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    removeItem: (key) => values.delete(key),
    values,
  }
}

const student = {
  fullName: ' Maya Student ',
  email: ' MAYA@example.com ',
  phone: ' 555-1234 ',
  grade: '6th Grade',
}

test('auth continuation accepts only the exact booking entry point', () => {
  assert.equal(continuation.readBookContinuation('/book'), '/book')
  for (const unsafe of ['/dashboard', '//evil.test', '/book?student=maya', 'https://evil.test/book', null]) {
    assert.equal(continuation.readBookContinuation(unsafe), null)
  }
  assert.equal(
    continuation.readBookContinuationFromRedirect('https://www.scoremaxtutoring.com/book', 'https://www.scoremaxtutoring.com'),
    '/book'
  )
  assert.equal(
    continuation.readBookContinuationFromRedirect('https://evil.test/book', 'https://www.scoremaxtutoring.com'),
    null
  )
})

test('multi-student signup normalizes rows and rejects duplicate emails', () => {
  const parsed = onboarding.parseSignupStudentDrafts([student])
  assert.deepEqual(parsed, [{ fullName: 'Maya Student', email: 'maya@example.com', phone: '555-1234', grade: '6th Grade' }])
  assert.equal(onboarding.parseSignupStudentDrafts([]), null)
  assert.equal(onboarding.parseSignupStudentDrafts([{ ...student, grade: 'Made Up' }]), null)
  assert.equal(onboarding.parseSignupStudentDrafts([student, { ...student, email: 'maya@EXAMPLE.com' }]), null)
})

test('Google parent draft is same-tab, validated on read, and cleared after finalization', () => {
  const tab = storage()
  assert.equal(onboarding.writePendingGoogleSignup(tab, {
    accountType: 'parent', students: [student], next: '/book',
  }), true)
  assert.equal(onboarding.readPendingGoogleSignup(tab)?.students[0].email, 'maya@example.com')
  const serialized = [...tab.values.values()].join('')
  assert.match(serialized, /MAYA@example\.com/)
  onboarding.clearPendingGoogleSignup(tab)
  assert.equal(onboarding.readPendingGoogleSignup(tab), null)
})

test('Google student grade remains same-tab instead of entering the callback URL', () => {
  const tab = storage()
  assert.equal(onboarding.writePendingGoogleSignup(tab, {
    accountType: 'student', studentGrade: '11th Grade', next: '/book',
  }), true)
  assert.deepEqual(onboarding.readPendingGoogleSignup(tab), {
    accountType: 'student', studentGrade: '11th Grade', next: '/book',
  })
  assert.equal(onboarding.readPendingGoogleSignup({ ...tab, getItem: () => JSON.stringify({
    accountType: 'student', studentGrade: 'Not a grade', next: '/book',
  }) }), null)
})

test('signed-out booking clearly offers account creation and sign in with no child PII in links', () => {
  const selection = readSource('src/components/booking/StudentSelection.tsx')
  const register = readSource('src/app/register/page.tsx')
  assert.match(selection, /Create Account/)
  assert.match(selection, /Sign In/)
  assert.match(selection, /register\?next=/)
  assert.doesNotMatch(selection, /student(Id|Email|Name)=/)
  assert.match(register, /<GoogleAuthButton/)
  assert.match(register, /Sign up with Google/)
  assert.match(readSource('src/components/auth/GoogleAuthButton.tsx'), /'Sign up with Google'/)
})

test('registration clearly separates email signup from Google signup requirements', () => {
  const register = readSource('src/app/register/page.tsx')
  const whoUses = register.indexOf('Who will use this account?')
  const signupMethod = register.indexOf('How would you like to sign up?')
  const fullName = register.indexOf('<Label htmlFor="fullName">')
  const email = register.indexOf('<Label htmlFor="email">')
  const studentGrade = register.indexOf('<Label htmlFor="signup-student-grade">')
  const parentStudents = register.indexOf('Add your student{students.length')
  const password = register.indexOf('<Label htmlFor="password">')
  const confirmation = register.indexOf('<Label htmlFor="confirmPassword">')

  assert.ok(whoUses < signupMethod)
  assert.ok(signupMethod < fullName)
  assert.ok(fullName < email)
  assert.ok(email < studentGrade)
  assert.ok(email < parentStudents)
  assert.ok(studentGrade < password)
  assert.ok(password < confirmation)
  assert.ok(confirmation < parentStudents)
  assert.match(register, /signupMethod === 'email'/)
  assert.match(register, /signupMethod === 'google'/)
  assert.match(register, /accountType && \(\s*<fieldset[^>]+>\s*<legend[^>]+>How would you like to sign up\?/)
  assert.match(register, /setAccountType\(option\.value\)[\s\S]*setSignupMethod\(null\)/)
  assert.doesNotMatch(register, /Google creates the account owner&apos;s login/)
  assert.doesNotMatch(register, /Google provides your name and email/)
  assert.match(register, /accountType === 'parent' \? 'Parent \/ Guardian Name' : 'Full Name'/)
  assert.match(register, /accountType === 'parent' \? 'Parent \/ Guardian Email' : 'Email'/)
  assert.match(register, /label: 'Parent \/ Guardian'/)
  assert.doesNotMatch(register, /label: 'Parent\/Guardian'/)
  assert.match(register, /rounded-2xl border-2 border-\[#b08a30\]\/40/)
  assert.match(register, /Parent \/ Guardian Information/)
  assert.match(register, /Secure your account/)
  assert.match(register, /Student Details/)
  assert.doesNotMatch(register, />Required<\/span>/)
  assert.match(register, /Tip:<\/span>\{' '\}[\s\S]*At least one student is required to continue signing up\.[\s\S]*manage your students in your ScoreMax portal after your account is created\./)
  assert.match(register, /accountType === 'parent' && Boolean\(signupStudentDraftError\(students\)\)/)
  assert.match(readSource('src/components/auth/GoogleAuthButton.tsx'), /signupAccountType === 'parent' && Boolean\(signupStudentDraftError\(signupStudents\)\)/)
  assert.ok((register.match(/rounded-2xl border-2 border-\[#b08a30\]\/40 bg-\[#b08a30\]\/5 px-5 pb-5 pt-1/g) ?? []).length >= 5)
  assert.ok((register.match(/bg-white/g) ?? []).length >= 10)
  assert.ok((register.match(/focus-visible:border-\[#b08a30\] focus-visible:ring-0/g) ?? []).length >= 9)
  assert.doesNotMatch(register, /Choose Parent\/Guardian if you will manage bookings for your child/)
  assert.match(register, /Sign up with your email/)
  assert.doesNotMatch(register, /Email signup creates a ScoreMax password/)
  assert.doesNotMatch(register, /Google signup uses your Google account/)
})

test('email confirmation and Google OAuth preserve only the safe booking continuation', () => {
  const register = readSource('src/app/register/page.tsx')
  const login = readSource('src/app/login/page.tsx')
  const google = readSource('src/components/auth/GoogleAuthButton.tsx')
  const hook = readSource('src/app/api/auth/send-email/route.ts')
  const continuePage = readSource('src/app/auth/continue/page.tsx')
  const callback = readSource('src/app/auth/callback/route.ts')

  assert.match(register, /emailRedirectTo: new URL\('\/book'/)
  assert.match(login, /router\.push\(nextPath \?\? '\/dashboard'\)/)
  assert.match(google, /readBookContinuation\(next\)/)
  assert.doesNotMatch(google, /searchParams\.set\('student_grade'/)
  assert.match(hook, /readBookContinuationFromRedirect/)
  assert.match(continuePage, /type === 'signup'[\s\S]*readBookContinuation/)
  assert.match(continuePage, /button: 'Confirm Email & Start Booking'/)
  assert.match(callback, /type === 'signup'[\s\S]*readBookContinuation/)
  assert.doesNotMatch(google, /searchParams\.set\('student_(email|name|phone)'/)
})

test('parent drafts remain untrusted until verified server finalization', () => {
  const route = readSource('src/app/api/auth/complete-signup/route.ts')
  assert.match(route, /supabase\.auth\.getUser\(\)/)
  assert.match(route, /!user\.email_confirmed_at/)
  assert.match(route, /profile\?\.role !== 'customer'/)
  assert.match(route, /\.eq\('profile_id', profileId\)/)
  assert.match(route, /parseSignupStudentDrafts/)
  assert.match(route, /customer\.account_type === 'student'/)
  assert.match(route, /onboardingAuthorized/)
  assert.match(route, /SIGNUP_ONBOARDING_GATE_KEY/)
  assert.match(route, /onboardingGate === 'student'/)
  assert.match(route, /requestStudentGrade/)
  assert.match(route, /\.is\('account_type', null\)/)
  assert.match(route, /metadataAccountType === 'parent' && metadataStudents !== null/)
  assert.match(route, /const canConsumeParentDrafts = onboardingAuthorized \|\| hasPendingEmailSignupStudents/)
  assert.match(route, /const drafts = canConsumeParentDrafts \? \(metadataStudents \?\? requestStudents\) : null/)
})

test('multi-student creation is atomic, owner-scoped, idempotent, and retry-safe', () => {
  const route = readSource('src/app/api/auth/complete-signup/route.ts')
  assert.match(route, /from\('students'\)\.insert\(missing\.map/)
  assert.match(route, /customer_id: customerId/)
  assert.match(route, /error\.code !== '23505'/)
  assert.match(route, /drafts\.every/)
  assert.match(route, /PENDING_STUDENTS_METADATA_KEY\]: null/)
  assert.match(route, /SIGNUP_ONBOARDING_GATE_KEY\]: null/)
})

test('booking selects only an authoritative active returned student and keeps payment paths intact', () => {
  const book = readSource('src/app/book/page.tsx')
  assert.match(book, /body\.students\.find\(\(student\) => student\.id === authoritativePreferredId && student\.isActive\)/)
  assert.match(book, /student\.email\.trim\(\)\.toLowerCase\(\) === pendingGoogleSignup\.students\[0\]\.email/)
  assert.match(book, /setActiveSection\('subjects'\)/)
  assert.match(book, /\/api\/booking\/submit/)
  assert.match(book, /\/api\/offline-purchase/)
  assert.match(book, /\/api\/stripe\/checkout/)
})

test('zero-student parents recover inside booking while student accounts retain self selection', () => {
  const selection = readSource('src/components/booking/StudentSelection.tsx')
  const firstStudent = readSource('src/components/booking/AddFirstStudentForm.tsx')
  const book = readSource('src/app/book/page.tsx')
  assert.match(selection, /activeStudents\.length === 0/)
  assert.match(firstStudent, /Add your first student/)
  assert.match(firstStudent, /Add Student & Continue/)
  assert.match(book, /accountType === 'student' && selfStudentId/)
  assert.match(book, /Student accounts always book for their own server-identified profile/)
})

test('a lost Google parent draft clears the one-time gate and reaches Add First Student', () => {
  const route = readSource('src/app/api/auth/complete-signup/route.ts')
  assert.match(route, /canConsumeParentDrafts && !drafts/)
  assert.match(route, /missing child details[\s\S]*Add First Student recovery path/)
  assert.match(route, /PENDING_STUDENTS_METADATA_KEY\]: null/)
  assert.match(route, /SIGNUP_ONBOARDING_GATE_KEY\]: null/)
  assert.doesNotMatch(route, /Student details are missing\. Add the first student below/)
})
