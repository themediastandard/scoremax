import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import test from 'node:test'

const require = createRequire(import.meta.url)
const { formatPhoneForDisplay } = require('../src/lib/phone-display.js')
const customersTable = readFileSync(
  new URL('../src/components/dashboard/CustomersTable.tsx', import.meta.url),
  'utf8'
)

test('customer directory uses the requested compact operational columns', () => {
  const desktopTable = customersTable.slice(customersTable.indexOf('<table className="min-w-'))
  const columns = [
    '>Owner</th>',
    '>Students</th>',
    '>Plan</th>',
    '>Payment Access</th>',
    '>Credits Available</th>',
    '>Orders / Total Spent</th>',
  ]

  let previous = -1
  for (const column of columns) {
    const index = desktopTable.indexOf(column)
    assert.ok(index > previous, `${column} should appear in operational order`)
    previous = index
  }

  assert.doesNotMatch(desktopTable, />Account Type<\/th>|>Joined<\/th>|>Next Session<\/th>/)
  assert.doesNotMatch(customersTable, /Next session|Next Session/)
  assert.doesNotMatch(customersTable, /ArrowRight|View details/)
})

test('mobile cards and desktop rows open the full customer surface', () => {
  assert.match(
    customersTable,
    /<Link[\s\S]*key=\{customer\.id\}[\s\S]*href=\{detailsHref\}[\s\S]*className="block rounded-xl/
  )
  assert.match(
    customersTable,
    /<tr[\s\S]*role="link"[\s\S]*tabIndex=\{0\}[\s\S]*onClick=\{\(\) => openCustomer\(customer\.id\)\}/
  )
  assert.match(customersTable, /event\.key !== 'Enter'/)
  assert.match(customersTable, /router\.push\(`\/dashboard\/customers\/\$\{customerId\}`\)/)
})

test('attention filter covers the combined and individual cleanup queues', () => {
  assert.match(customersTable, /const \[attentionFilter, setAttentionFilter\]/)
  assert.match(customersTable, /const noStudent = \(studentMap\[customer\.id\] \?\? \[\]\)\.length === 0/)
  assert.match(customersTable, /const typeNotSpecified = !customer\.account_type/)
  assert.match(customersTable, /const missingPhone = !customer\.phone\?\.trim\(\)/)
  assert.match(customersTable, /return noStudent \|\| typeNotSpecified \|\| missingPhone/)

  for (const [value, label] of [
    ['needs-attention', 'Needs Attention'],
    ['no-student', 'No Student'],
    ['type-not-specified', 'Type Not Specified'],
    ['missing-phone', 'Missing Phone'],
  ]) {
    assert.match(customersTable, new RegExp(`<SelectItem value="${value}">${label}<\\/SelectItem>`))
  }
})

test('phone display formats North American numbers and preserves unknown formats', () => {
  assert.equal(formatPhoneForDisplay('4075551212'), '(407) 555-1212')
  assert.equal(formatPhoneForDisplay('+1 407 555 1212'), '(407) 555-1212')
  assert.equal(formatPhoneForDisplay('(407) 555-1212'), '(407) 555-1212')
  assert.equal(formatPhoneForDisplay('+44 20 7946 0958'), '+44 20 7946 0958')
  assert.equal(formatPhoneForDisplay('407-555-1212 ext 9'), '407-555-1212 ext 9')
  assert.equal(formatPhoneForDisplay(null), '')
  assert.match(customersTable, /formatPhoneForDisplay\(customer\.phone\)/)
})

test('search and every customer select trigger have accessible names', () => {
  assert.match(customersTable, /aria-label="Search customers"/)
  for (const label of [
    'Filter customers by plan',
    'Filter customers by student grade',
    'Filter customers by available credits',
    'Filter customers needing attention',
    'Sort customers',
  ]) {
    assert.match(customersTable, new RegExp(`SelectTrigger aria-label="${label}"`))
  }

  const triggerCount = (customersTable.match(/<SelectTrigger/g) ?? []).length
  const labelledTriggerCount = (customersTable.match(/<SelectTrigger aria-label=/g) ?? []).length
  assert.equal(labelledTriggerCount, triggerCount)
})
