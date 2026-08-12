import assert from 'node:assert/strict'
import test from 'node:test'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const {
  canPurchaseMembershipForSubjects,
  getSatActSelection,
  hasSatOrActSubject,
} = require('../src/lib/booking-plan-rules.js')

const subjectMap = {
  algebra: { slug: 'algebra' },
  sat: { slug: 'sat-prep' },
  act: { slug: 'act-prep' },
}

test('SAT and ACT selections use the dedicated exam prep packages', () => {
  assert.deepEqual(getSatActSelection(['sat'], subjectMap), { isSAT: true, isACT: false })
  assert.deepEqual(getSatActSelection(['act'], subjectMap), { isSAT: false, isACT: true })
  assert.deepEqual(getSatActSelection(['sat', 'act'], subjectMap), { isSAT: true, isACT: true })
  assert.equal(hasSatOrActSubject(['sat'], subjectMap), true)
  assert.equal(hasSatOrActSubject(['act'], subjectMap), true)
})

test('academic and unknown subjects can still use generic prepaid packages', () => {
  assert.deepEqual(getSatActSelection(['algebra'], subjectMap), { isSAT: false, isACT: false })
  assert.equal(hasSatOrActSubject(['algebra'], subjectMap), false)
  assert.equal(hasSatOrActSubject(['unknown'], subjectMap), false)
})

test('memberships are hidden and rejected for SAT or ACT selections', () => {
  assert.equal(canPurchaseMembershipForSubjects(['sat'], subjectMap), false)
  assert.equal(canPurchaseMembershipForSubjects(['act'], subjectMap), false)
  assert.equal(canPurchaseMembershipForSubjects(['sat', 'act'], subjectMap), false)
  assert.equal(canPurchaseMembershipForSubjects(['algebra'], subjectMap), true)
})
