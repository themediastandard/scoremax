import assert from 'node:assert/strict'
import test from 'node:test'
import businessDateTime from '../src/lib/business-datetime.js'

const { formatBusinessDateTime } = businessDateTime

test('order details show a summer session in Eastern Time instead of Netlify UTC', () => {
  const formatted = formatBusinessDateTime('2026-08-15T19:00:00.000Z')

  assert.ok(formatted.includes('3:00 PM'), formatted)
  assert.ok(formatted.includes('(EDT)'), formatted)
  assert.ok(!formatted.includes('7:00 PM'), formatted)
})

test('order details follow daylight saving time in winter', () => {
  const formatted = formatBusinessDateTime('2026-01-15T20:00:00.000Z')

  assert.ok(formatted.includes('3:00 PM'), formatted)
  assert.ok(formatted.includes('(EST)'), formatted)
})

test('missing or invalid session times do not render the epoch', () => {
  assert.equal(formatBusinessDateTime(null), null)
  assert.equal(formatBusinessDateTime('not a date'), null)
})
