import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const readSource = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')

const orderPage = readSource('src/app/dashboard/orders/[id]/page.tsx')
const control = readSource('src/components/dashboard/OrderStudentAssignment.tsx')

test('order details expose student assignment only to admins and scope choices to the account', () => {
  assert.match(orderPage, /profile\?\.role === 'admin' && order\.customer_id/)
  assert.match(orderPage, /\.from\('students'\)/)
  assert.match(orderPage, /\.eq\('customer_id', order\.customer_id\)/)
  assert.match(orderPage, /profile\?\.role === 'admin' && \(/)
  assert.match(orderPage, /<OrderStudentAssignment/)
})

test('order assignment reuses the atomic session and order path without changing session details', () => {
  assert.match(control, /`\/api\/admin\/sessions\/\$\{encodeURIComponent\(linkedSession\.id\)\}`/)
  assert.match(control, /student_id: studentId/)
  assert.match(control, /assigned_tutor_id: linkedSession\.assigned_tutor_id/)
  assert.match(control, /confirmed_start: linkedSession\.confirmed_start/)
  assert.match(control, /confirmed_end: linkedSession\.confirmed_end/)
  assert.match(control, /status: linkedSession\.status/)
  assert.match(control, /internal_notes: linkedSession\.internal_notes/)
  assert.match(control, /order and linked session will stay together/)
})

test('order assignment fails closed without a session or active managed student', () => {
  assert.match(control, /This order has no linked session, so its student cannot be changed safely/)
  assert.match(control, /students\.filter\(\(student\) => student\.is_active\)/)
  assert.match(control, /disabled=\{!student\.is_active\}/)
  assert.match(control, /The account owner must add or reactivate a student first/)
  assert.match(control, /The account owner and tutor remain invited/)
})
