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
  assert.equal(onboarding.parseSignupStudentDrafts([{ ...student, phone: '   ' }]), null)
  assert.equal(onboarding.parseSignupStudentDrafts([{ ...student, phone: undefined }]), null)
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

test('Google student grade and phone remain same-tab instead of entering the callback URL', () => {
  const tab = storage()
  assert.equal(onboarding.writePendingGoogleSignup(tab, {
    accountType: 'student', studentGrade: '11th Grade', studentPhone: ' 555-1234 ', next: '/book',
  }), true)
  assert.deepEqual(onboarding.readPendingGoogleSignup(tab), {
    accountType: 'student', studentGrade: '11th Grade', studentPhone: '555-1234', next: '/book',
  })
  assert.equal(onboarding.readPendingGoogleSignup({ ...tab, getItem: () => JSON.stringify({
    accountType: 'student', studentGrade: 'Not a grade', studentPhone: '555-1234', next: '/book',
  }) }), null)
  assert.equal(onboarding.readPendingGoogleSignup({ ...tab, getItem: () => JSON.stringify({
    accountType: 'student', studentGrade: '11th Grade', next: '/book',
  }) }), null)
})

test('email confirmation comparison is trimmed, case-insensitive, and rejects typos', () => {
  assert.equal(onboarding.normalizeSignupEmail(' Jennifer@Example.COM '), 'jennifer@example.com')
  assert.equal(onboarding.signupEmailsMatch(' Jennifer@Example.COM ', 'jennifer@example.com'), true)
  assert.equal(onboarding.signupEmailsMatch('jennifer@gamil.com', 'jennifer@gmail.com'), false)
})

test('Google account completion accepts only strict parent or student setup details', () => {
  assert.deepEqual(onboarding.parseGoogleAccountSetup({
    accountType: 'parent',
    students: [student],
  }), {
    accountType: 'parent',
    students: [{ fullName: 'Maya Student', email: 'maya@example.com', phone: '555-1234', grade: '6th Grade' }],
  })
  assert.deepEqual(onboarding.parseGoogleAccountSetup({
    accountType: 'student',
    studentGrade: '11th Grade',
    studentPhone: ' 555-1234 ',
  }), {
    accountType: 'student',
    studentGrade: '11th Grade',
    studentPhone: '555-1234',
  })
  assert.equal(onboarding.parseGoogleAccountSetup({
    accountType: 'student', studentGrade: '11th Grade',
  }), null)
  assert.equal(onboarding.parseGoogleAccountSetup({
    accountType: 'parent', students: [student], profileId: 'someone-else',
  }), null)
})

test('signed-out booking shows auth above a disabled first step with no child PII in links', () => {
  const book = readSource('src/app/book/page.tsx')
  const selection = readSource('src/components/booking/StudentSelection.tsx')
  const register = readSource('src/app/register/page.tsx')
  const authPrompt = book.indexOf('Create an account or sign in before booking')
  const firstStep = book.indexOf('step={1}')
  assert.ok(authPrompt >= 0 && authPrompt < firstStep)
  const authPromptSource = book.slice(authPrompt, firstStep)
  assert.match(book, /studentStatus === 'signed_out'[\s\S]*Create Account[\s\S]*Sign In/)
  assert.match(book, /disabled=\{studentStatus === 'signed_out'\}/)
  assert.match(authPromptSource, /register\?next=/)
  assert.doesNotMatch(book, /Parents add their students during signup/)
  assert.match(authPromptSource, /we save all your orders and sessions in your portal/)
  assert.match(authPromptSource, /signing in before booking helps us keep everything organized/)
  assert.doesNotMatch(selection, /Create an account or sign in before booking/)
  assert.doesNotMatch(authPromptSource, /student(Id|Email|Name)=/)
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
  const confirmEmail = register.indexOf('<Label htmlFor="confirmEmail">')
  const studentPhone = register.indexOf('<Label htmlFor="signup-student-phone">')
  const studentGrade = register.indexOf('<Label htmlFor="signup-student-grade">')
  const parentStudents = register.indexOf('Add your student{students.length')
  const password = register.indexOf('<Label htmlFor="password">')
  const confirmation = register.indexOf('<Label htmlFor="confirmPassword">')

  assert.ok(whoUses < signupMethod)
  assert.ok(signupMethod < fullName)
  assert.ok(fullName < email)
  assert.ok(email < confirmEmail)
  assert.ok(confirmEmail < studentPhone)
  assert.ok(studentPhone < studentGrade)
  assert.ok(email < parentStudents)
  assert.ok(studentGrade < password)
  assert.ok(password < confirmation)
  assert.ok(confirmation < parentStudents)
  assert.match(register, /signupMethod === 'email'/)
  assert.match(register, /signupMethod === 'google'/)
  assert.match(register, /accountType && !googleCompletionMode && \(\s*<fieldset[^>]+>\s*<legend[^>]+>How would you like to sign up\?/)
  assert.match(register, /setAccountType\(option\.value\)[\s\S]*setSignupMethod\(googleCompletionMode \? 'google' : null\)/)
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
  assert.match(register, /Your Phone Number/)
  assert.match(register, /id="confirmEmail"/)
  assert.match(register, /autoComplete="off"/)
  assert.match(register, /signupEmailsMatch\(email, confirmEmail\)/)
  assert.match(register, /Email addresses do not match/)
  assert.match(register, /Student Phone/)
  assert.match(register, /id=\{`signup-student-\$\{index\}-phone`\}[\s\S]{0,350}required/)
  assert.doesNotMatch(register, /Student Phone[\s\S]{0,80}\(Optional\)/)
  assert.doesNotMatch(register, />Required<\/span>/)
  assert.match(register, /Tip:<\/span>\{' '\}[\s\S]*At least one student is required to continue signing up\.[\s\S]*manage your students in your ScoreMax portal after your account is created\./)
  assert.match(register, /accountType === 'parent' && Boolean\(signupStudentDraftError\(students\)\)/)
  assert.match(readSource('src/components/auth/GoogleAuthButton.tsx'), /signupAccountType === 'parent' && Boolean\(signupStudentDraftError\(signupStudents\)\)/)
  assert.match(readSource('src/components/auth/GoogleAuthButton.tsx'), /signupAccountType === 'student' && \(!studentGrade \|\| !studentPhone\?\.trim\(\)\)/)
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
  const header = readSource('src/components/HeaderUserMenu.tsx')
  const book = readSource('src/app/book/page.tsx')
  const hook = readSource('src/app/api/auth/send-email/route.ts')
  const continuePage = readSource('src/app/auth/continue/page.tsx')
  const callback = readSource('src/app/auth/callback/route.ts')

  assert.match(header, /<Link href="\/register"/)
  assert.match(book, /href=\{`\/register\?next=\$\{encodeURIComponent\('\/book'\)\}`\}/)
  assert.match(register, /emailRedirectTo: new URL\('\/book'/)
  assert.match(register, /next=\{nextPath \?\? '\/book'\}/)
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
  assert.match(route, /effectiveOnboardingGate === 'student'/)
  assert.match(route, /requestStudentGrade/)
  assert.match(route, /\.is\('account_type', null\)/)
  assert.match(route, /metadataAccountType === 'parent' && metadataStudents !== null/)
  assert.match(route, /const canConsumeParentDrafts = onboardingAuthorized \|\| hasPendingEmailSignupStudents/)
  assert.match(route, /const drafts = canConsumeParentDrafts \? \(metadataStudents \?\? requestStudents\) : null/)
})

test('bare Google sign-ins are stopped and completed through the existing signup form', () => {
  const callback = readSource('src/app/auth/callback/route.ts')
  const register = readSource('src/app/register/page.tsx')
  const route = readSource('src/app/api/auth/complete-signup/route.ts')
  const book = readSource('src/app/book/page.tsx')

  assert.match(callback, /signup\.needsSetup && !signupAccountType/)
  assert.match(callback, /googleSetupUrl\(next\)/)
  assert.match(callback, /url\.searchParams\.set\('complete', 'google'\)/)
  assert.match(register, /searchParams\.get\('complete'\) === 'google'/)
  assert.match(register, /Finish setting up your account/)
  assert.match(register, /Tell us who will use ScoreMax to finish your setup/)
  assert.match(register, /body: JSON\.stringify\(accountType === 'parent'/)
  assert.match(register, /\{ accountType, studentGrade, studentPhone \}/)
  assert.match(route, /hasGoogleIdentity/)
  assert.match(route, /parseGoogleAccountSetup\(body\)/)
  assert.match(route, /code: 'account_setup_required'/)
  assert.match(route, /profile\?\.role !== 'customer'/)
  assert.match(route, /\.eq\('profile_id', user\.id\)/)
  assert.match(route, /\.is\('account_type', null\)/)
  assert.doesNotMatch(route, /body\.(profileId|customerId|userId)/)
  assert.match(book, /account_setup_required[\s\S]*\/register\?complete=google/)
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

test('booking selects an authoritative signup student but waits for the parent to continue', () => {
  const book = readSource('src/app/book/page.tsx')
  assert.match(book, /body\.students\.find\(\(student\) => student\.id === authoritativePreferredId && student\.isActive\)/)
  assert.match(book, /student\.email\.trim\(\)\.toLowerCase\(\) === pendingGoogleSignup\.students\[0\]\.email/)
  assert.match(book, /advanceAfterSelection = false/)
  assert.match(book, /if \(preferredStudent\) \{[\s\S]*studentId: preferredStudent\.id[\s\S]*\}/)
  assert.match(book, /if \(preferredStudent && advanceAfterSelection\) \{[\s\S]*setActiveSection\('subjects'\)/)
  assert.match(book, /onContinue=\{\(\) => handleNext\('student'\)\}/)
  assert.match(book, /onStudentCreated=\{\(studentId\) => void loadStudents\(studentId, true\)\}/)
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
