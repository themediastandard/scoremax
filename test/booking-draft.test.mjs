import assert from 'node:assert/strict'
import test from 'node:test'

import {
  clearBookingDrafts,
  parseBookingDraft,
  readBookingDraft,
  writeBookingDraft,
} from '../src/lib/booking-draft.ts'

function storage() {
  const values = new Map()
  return {
    get length() { return values.size },
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    removeItem: (key) => values.delete(key),
    key: (index) => Array.from(values.keys())[index] ?? null,
    values,
  }
}

const draft = {
  version: 1,
  studentId: '00000000-0000-0000-0000-000000000111',
  subjects: ['00000000-0000-0000-0000-000000000222'],
  availability: {
    windows: [{ day: 'Monday', start: '15:00', end: '16:00' }],
    timezone: 'America/New_York',
  },
  revealed: { student: true, subjects: true, availability: true, contact: true, plan: true },
  activeSection: 'plan',
}

test('a booking draft survives a same-tab refresh without storing contact details', () => {
  const tab = storage()
  writeBookingDraft(tab, 'profile-a', draft)

  assert.deepEqual(readBookingDraft(tab, 'profile-a'), draft)
  const serialized = Array.from(tab.values.values()).join('')
  assert.doesNotMatch(serialized, /email|phone|fullName|notes/)
})

test('drafts are scoped to the authenticated profile and cleared after confirmation', () => {
  const tab = storage()
  writeBookingDraft(tab, 'profile-a', draft)
  writeBookingDraft(tab, 'profile-b', { ...draft, studentId: 'student-b' })
  tab.setItem('scoremax:offline-purchase-keys:v1', '{"safe":"to keep"}')

  assert.equal(readBookingDraft(tab, 'profile-c'), null)
  clearBookingDrafts(tab)
  assert.equal(readBookingDraft(tab, 'profile-a'), null)
  assert.equal(readBookingDraft(tab, 'profile-b'), null)
  assert.equal(tab.getItem('scoremax:offline-purchase-keys:v1'), '{"safe":"to keep"}')
})

test('malformed or unsafe browser data is ignored instead of entering the form', () => {
  assert.equal(parseBookingDraft('not json'), null)
  assert.equal(parseBookingDraft(JSON.stringify({ ...draft, version: 2 })), null)
  assert.equal(parseBookingDraft(JSON.stringify({
    ...draft,
    availability: { ...draft.availability, windows: [{ day: 'Someday', start: '15:00', end: '16:00' }] },
  })), null)
})
