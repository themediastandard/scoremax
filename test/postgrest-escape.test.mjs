import assert from 'node:assert/strict'
import test from 'node:test'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const { escapeLikePattern } = require('../src/lib/postgrest-escape.js')

test('an ordinary address is unchanged', () => {
  assert.equal(escapeLikePattern('parent@example.com'), 'parent@example.com')
})

test('underscores are escaped — the case that actually bites', () => {
  // first_last@ is a common corporate format. Unescaped, ILIKE treats the
  // underscore as "any single character", so this pattern also matches
  // firstXlast@example.com.
  assert.equal(
    escapeLikePattern('first_last@example.com'),
    'first\\_last@example.com'
  )
})

test('percent signs are escaped', () => {
  assert.equal(escapeLikePattern('a%b@example.com'), 'a\\%b@example.com')
})

test('backslashes are escaped first, so later escapes are not doubled', () => {
  // If \ ran after % and _, the backslashes this function adds would
  // themselves be escaped and the pattern would stop matching.
  assert.equal(escapeLikePattern('a\\b'), 'a\\\\b')
  assert.equal(escapeLikePattern('a\\_b'), 'a\\\\\\_b')
})

test('every wildcard in one value is escaped', () => {
  assert.equal(escapeLikePattern('a_b%c'), 'a\\_b\\%c')
})

test('escaping is idempotent in effect, not in output', () => {
  // Documenting the trap: never call this twice on the same value.
  const once = escapeLikePattern('a_b')
  assert.notEqual(escapeLikePattern(once), once)
})
