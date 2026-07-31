import assert from 'node:assert/strict'
import test from 'node:test'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)

const {
  PACKAGE_VALIDITY_MONTHS,
  packageExpiresAt,
  unexpiredPackagesClause,
} = require('../src/lib/package-expiry.js')

test('packages are valid for twelve months', () => {
  assert.equal(PACKAGE_VALIDITY_MONTHS, 12)
})

test('packageExpiresAt lands on the same calendar day a year later', () => {
  assert.equal(
    packageExpiresAt(new Date('2026-07-31T14:22:05.000Z')),
    '2027-07-31T14:22:05.000Z'
  )
})

test('packageExpiresAt keeps the time of day, so a package bought at 23:59 does not lose a day', () => {
  assert.equal(
    packageExpiresAt(new Date('2026-01-01T23:59:59.999Z')),
    '2027-01-01T23:59:59.999Z'
  )
})

test('packageExpiresAt rolls 29 February to 1 March', () => {
  // 2028 is a leap year, 2029 is not. Month-overflow normalisation gives the
  // conventional reading of "one year later" rather than throwing.
  assert.equal(
    packageExpiresAt(new Date('2028-02-29T12:00:00.000Z')),
    '2029-03-01T12:00:00.000Z'
  )
})

test('packageExpiresAt accepts ISO strings and epoch milliseconds', () => {
  assert.equal(packageExpiresAt('2026-03-15T00:00:00.000Z'), '2027-03-15T00:00:00.000Z')
  assert.equal(
    packageExpiresAt(Date.parse('2026-03-15T00:00:00.000Z')),
    '2027-03-15T00:00:00.000Z'
  )
})

test('packageExpiresAt rejects an unparseable date rather than emitting Invalid Date', () => {
  assert.throws(() => packageExpiresAt('not a date'), TypeError)
})

test('unexpiredPackagesClause admits NULL expiry, so legacy never-expiring packages survive', () => {
  const clause = unexpiredPackagesClause(new Date('2026-07-31T00:00:00.000Z'))
  assert.equal(clause, 'expires_at.is.null,expires_at.gt.2026-07-31T00:00:00.000Z')
  // The NULL arm is the whole point: `.gt()` alone drops those rows, which is
  // what made every pre-2026-07-31 package invisible in the earlier bug.
  assert.ok(clause.startsWith('expires_at.is.null,'))
})

test('unexpiredPackagesClause matches the guard used by redeem_credit_and_create_booking', () => {
  // The SQL is `expires_at is null or expires_at > now()`. If these two ever
  // diverge the dashboard shows credit the database will refuse to spend.
  const clause = unexpiredPackagesClause(new Date('2026-07-31T00:00:00.000Z'))
  const [nullArm, futureArm] = clause.split(',')
  assert.equal(nullArm, 'expires_at.is.null')
  assert.ok(futureArm.startsWith('expires_at.gt.'))
})
