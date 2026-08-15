import assert from 'node:assert/strict'
import test from 'node:test'
import businessDateTime from '../src/lib/business-datetime.js'

const {
  businessDateTimeInputValues,
  formatBusinessDate,
  formatBusinessDateTime,
  formatBusinessTime,
} = businessDateTime

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

test('customer dashboard split dates and times render in Eastern Time', () => {
  const storedUtcInstant = '2026-08-22T16:30:00.000Z'

  assert.equal(
    formatBusinessDate(storedUtcInstant, { weekday: 'long', month: 'short', day: 'numeric' }),
    'Saturday, Aug 22',
  )
  assert.equal(formatBusinessTime(storedUtcInstant), '12:30 PM')
  assert.notEqual(formatBusinessTime(storedUtcInstant), '4:30 PM')
})

test('split dashboard formatters reject missing or invalid timestamps', () => {
  assert.equal(formatBusinessDate(null), null)
  assert.equal(formatBusinessTime('not-a-time'), null)
})

test('admin session inputs always open with Eastern date and time values', () => {
  assert.deepEqual(
    businessDateTimeInputValues('2026-08-22T16:30:00.000Z'),
    { date: '2026-08-22', time: '12:30' },
  )
  assert.deepEqual(
    businessDateTimeInputValues('2026-01-22T17:30:00.000Z'),
    { date: '2026-01-22', time: '12:30' },
  )
  assert.deepEqual(businessDateTimeInputValues('not-a-time'), { date: '', time: '' })
})
