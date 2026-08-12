import assert from 'node:assert/strict'
import test from 'node:test'
import packageOrderLabel from '../src/lib/package-order-label.js'

const { formatPackageHoursLabel } = packageOrderLabel

test('a corrected five-hour package displays its package hours, not a price-derived guess', () => {
  assert.equal(formatPackageHoursLabel(5), '5-Hr Package')
})

test('credit-funded package labels retain the credit marker', () => {
  assert.equal(formatPackageHoursLabel(5, true), '5-Hr Package (Credit)')
})

test('invalid package hours leave the caller to use its existing fallback', () => {
  assert.equal(formatPackageHoursLabel(null), null)
  assert.equal(formatPackageHoursLabel(0), null)
})
