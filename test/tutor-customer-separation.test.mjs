import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

function readSource(path) {
  return readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')
}

test('profile saves keep tutors and admins out of the customer creation path', () => {
  const route = readSource('src/app/api/account/profile/route.ts')

  assert.match(route, /\.select\('full_name, role'\)/)
  assert.match(route, /profile\?\.role === 'customer'/)
  assert.match(route, /profile\?\.role === 'tutor'/)
  assert.match(route, /if \(profile\.role === 'tutor'\)/)
  assert.match(route, /\.from\('tutors'\)[\s\S]*\.eq\('profile_id', user\.id\)/)
  assert.match(route, /if \(profile\.role !== 'customer'\)/)

  const nonCustomerGuard = route.indexOf("if (profile.role !== 'customer')")
  const customerInsert = route.indexOf("supabaseAdmin.from('customers').insert")
  assert.ok(nonCustomerGuard > -1 && customerInsert > nonCustomerGuard)
})

test('admin credit booking lists only accounts with an active student', () => {
  const page = readSource('src/app/dashboard/sessions/page.tsx')

  assert.match(page, /const bookingCustomerIds = new Set/)
  assert.match(page, /bookingStudents \?\? \[\]/)
  assert.match(page, /accounts=\{\(bookingAccounts \?\? \[\]\)\.filter\(\(account\) => bookingCustomerIds\.has\(account\.id\)\)\}/)
})
