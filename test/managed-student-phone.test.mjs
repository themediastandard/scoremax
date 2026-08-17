import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

function readSource(path) {
  return readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')
}

test('managed student contract and APIs require a phone number when creating or editing', () => {
  const contract = readSource('src/lib/student-contract.ts')
  const server = readSource('src/lib/student-server.ts')
  const collection = readSource('src/app/api/account/students/route.ts')
  const item = readSource('src/app/api/account/students/[id]/route.ts')

  assert.match(contract, /phone: string \| null/)
  assert.match(contract, /interface CreateStudentRequest[\s\S]*phone: string/)
  assert.match(server, /phone: student\.phone/)
  assert.match(server, /return phone\?\.trim\(\) \|\| null/)
  assert.match(collection, /phone: z\.string\(\)\.trim\(\)\.min\(1\)\.max\(50\)/)
  assert.match(collection, /phone: normalizeStudentPhone\(parsed\.data\.phone\)/)
  assert.match(item, /phone: z\.string\(\)\.trim\(\)\.min\(1\)\.max\(50\)\.optional\(\)/)
  assert.match(item, /updates\.phone = normalizeStudentPhone\(parsed\.data\.phone\)/)
})

test('parent portal requires student phone when adding or editing and still renders legacy records', () => {
  const manager = readSource('src/components/dashboard/StudentsManager.tsx')
  const bookingRecovery = readSource('src/components/booking/AddFirstStudentForm.tsx')

  assert.match(manager, /Student Phone/)
  assert.match(manager, /type="tel"/)
  assert.match(manager, /maxLength=\{50\}/)
  assert.match(manager, /maxLength=\{50\}[\s\S]{0,80}required/)
  assert.match(manager, /!draft\.phone\.trim\(\)/)
  assert.match(manager, /phone: draft\.phone\.trim\(\)/)
  assert.match(manager, /student\.phone \|\| 'Phone not provided'/)
  assert.doesNotMatch(manager, /Student Phone[\s\S]{0,80}\(Optional\)/)

  assert.match(bookingRecovery, /!phone\.trim\(\)/)
  assert.match(bookingRecovery, /id="booking-first-student-phone"[\s\S]{0,240}required/)
  assert.doesNotMatch(bookingRecovery, /Student Phone[\s\S]{0,80}\(Optional\)/)
})

test('admins see student phone and self student profiles stay synchronized', () => {
  const detailLoader = readSource('src/lib/admin-customer-detail.ts')
  const detail = readSource('src/components/dashboard/CustomerDetailContent.tsx')
  const completion = readSource('src/app/api/auth/complete-signup/route.ts')
  const profile = readSource('src/app/api/account/profile/route.ts')
  const privacy = readSource('src/app/privacy/page.tsx')

  assert.match(detailLoader, /select\('id, full_name, email, phone, grade, is_active'\)/)
  assert.match(detail, /student\.phone \|\| 'Phone not provided'/)
  assert.match(completion, /phone: customer\.phone\?\.trim\(\) \|\| null/)
  assert.match(profile, /customer\.account_type === 'student'/)
  assert.match(profile, /\.update\(\{ phone: customerUpdates\.phone \?\? null \}\)/)
  assert.match(privacy, /phone number, grade level/)
  assert.doesNotMatch(privacy, /optional phone number/)
})
