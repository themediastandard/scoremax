import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const readSource = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')

const registerPage = readSource('src/app/register/page.tsx')
const googleButton = readSource('src/components/auth/GoogleAuthButton.tsx')
const callback = readSource('src/app/auth/callback/route.ts')
const completion = readSource('src/app/api/auth/complete-signup/route.ts')

test('signup explicitly requires parent or student instead of guessing', () => {
  assert.match(registerPage, /Who will use this account\?/)
  assert.match(registerPage, /Parent\/Guardian/)
  assert.match(registerPage, /Student/)
  assert.match(registerPage, /account_type: accountType/)
  assert.match(registerPage, /if \(!accountType\)/)
  assert.doesNotMatch(registerPage, /setAccountType\([^)]*students/i)
})

test('student signup requires a grade and creates a self student through trusted server paths', () => {
  assert.match(registerPage, /accountType === 'student' && !studentGrade/)
  assert.match(registerPage, /student_grade: studentGrade/)
  assert.match(registerPage, /Your student profile will be created automatically/)
  assert.match(completion, /GRADE_OPTIONS\.includes\(body\.studentGrade\)/)
  assert.match(completion, /ensureSelfStudent\(customer\)/)
  assert.match(completion, /customer\.account_type === 'student'/)
})

test('Google signup carries validated account type context without changing normal sign-in', () => {
  assert.match(googleButton, /mode === 'signup'/)
  assert.match(googleButton, /callbackUrl\.searchParams\.set\('account_type'/)
  assert.doesNotMatch(googleButton, /callbackUrl\.searchParams\.set\('student_grade'/)
  assert.match(googleButton, /studentGrade,/)
  assert.match(callback, /isAccountType\(accountTypeValue\)/)
  assert.match(callback, /SIGNUP_ONBOARDING_GATE_KEY\]: signup\.accountType/)
  assert.match(callback, /Existing accounts get no[\s\S]*gate/)
  assert.match(completion, /\.is\('account_type', null\)/)
})

test('student accounts cannot enter or mutate the parent-only managed-student workflow', () => {
  const layout = readSource('src/app/dashboard/layout.tsx')
  const shell = readSource('src/components/dashboard/DashboardShell.tsx')
  const sidebar = readSource('src/components/dashboard/DashboardSidebar.tsx')
  const page = readSource('src/app/dashboard/students/page.tsx')
  const collectionRoute = readSource('src/app/api/account/students/route.ts')
  const itemRoute = readSource('src/app/api/account/students/[id]/route.ts')

  assert.match(layout, /accountType=\{accountType\}/)
  assert.match(shell, /accountType=\{accountType\}/)
  assert.match(sidebar, /parentOnly: true/)
  assert.match(sidebar, /!link\.parentOnly \|\| accountType === 'parent'/)
  assert.match(page, /owner\?\.account_type !== 'parent'/)
  assert.match(collectionRoute, /owner\.account_type !== 'parent'/)
  assert.match(itemRoute, /owner\.account_type !== 'parent'/)
})
