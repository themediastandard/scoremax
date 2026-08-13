import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

function readSource(path) {
  return readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')
}

test('managed student contract and APIs persist an optional phone number', () => {
  const contract = readSource('src/lib/student-contract.ts')
  const server = readSource('src/lib/student-server.ts')
  const collection = readSource('src/app/api/account/students/route.ts')
  const item = readSource('src/app/api/account/students/[id]/route.ts')

  assert.match(contract, /phone: string \| null/)
  assert.match(server, /phone: student\.phone/)
  assert.match(server, /return phone\?\.trim\(\) \|\| null/)
  assert.match(collection, /phone: z\.string\(\)\.trim\(\)\.max\(50\)\.optional\(\)\.default\(''\)/)
  assert.match(collection, /phone: normalizeStudentPhone\(parsed\.data\.phone\)/)
  assert.match(item, /phone: z\.string\(\)\.trim\(\)\.max\(50\)\.optional\(\)/)
  assert.match(item, /updates\.phone = normalizeStudentPhone\(parsed\.data\.phone\)/)
})

test('parent portal can add, edit, clear, and view a student phone', () => {
  const manager = readSource('src/components/dashboard/StudentsManager.tsx')

  assert.match(manager, /Student Phone/)
  assert.match(manager, /type="tel"/)
  assert.match(manager, /maxLength=\{50\}/)
  assert.match(manager, /phone: draft\.phone\.trim\(\)/)
  assert.match(manager, /student\.phone \|\| 'Phone not provided'/)
})

test('admins see student phone and self student profiles stay synchronized', () => {
  const detailLoader = readSource('src/lib/admin-customer-detail.ts')
  const detail = readSource('src/components/dashboard/CustomerDetailContent.tsx')
  const callback = readSource('src/app/auth/callback/route.ts')
  const profile = readSource('src/app/api/account/profile/route.ts')
  const privacy = readSource('src/app/privacy/page.tsx')

  assert.match(detailLoader, /select\('id, full_name, email, phone, grade, is_active'\)/)
  assert.match(detail, /student\.phone \|\| 'Phone not provided'/)
  assert.match(callback, /phone: customer\.phone\?\.trim\(\) \|\| null/)
  assert.match(profile, /customer\.account_type === 'student'/)
  assert.match(profile, /\.update\(\{ phone: customerUpdates\.phone \?\? null \}\)/)
  assert.match(privacy, /optional phone number/)
})
