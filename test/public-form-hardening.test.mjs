import assert from 'node:assert/strict'
import test from 'node:test'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)

const { escapeHtml } = require('../src/lib/html-escape.js')
const {
  cleanEmail,
  cleanString,
  isHoneypotTripped,
  MAX_EMAIL_LENGTH,
  MAX_FIELD_LENGTH,
} = require('../src/lib/form-validation.js')

test('escapeHtml neutralises a script tag', () => {
  assert.equal(
    escapeHtml('<script>alert(1)</script>'),
    '&lt;script&gt;alert(1)&lt;/script&gt;'
  )
})

test('escapeHtml neutralises an injected link, the realistic attack on these emails', () => {
  // An admin opening the notification would otherwise see a clickable link
  // that appears to come from ScoreMax's own verified sending domain.
  const injected = '<a href="https://evil.example/reset">Reset your password</a>'
  const escaped = escapeHtml(injected)
  // The text "href=" survives, harmlessly — what matters is that no < or >
  // remains, so a mail client renders this as visible text, not as an anchor.
  assert.ok(!escaped.includes('<'))
  assert.ok(!escaped.includes('>'))
  assert.equal(
    escaped,
    '&lt;a href=&quot;https://evil.example/reset&quot;&gt;Reset your password&lt;/a&gt;'
  )
})

test('escapeHtml escapes ampersands first, so nothing is double-escaped', () => {
  assert.equal(escapeHtml('Tom & <b>Jerry</b>'), 'Tom &amp; &lt;b&gt;Jerry&lt;/b&gt;')
  // If & ran last, the &lt; produced above would become &amp;lt;.
  assert.ok(!escapeHtml('<b>').includes('&amp;lt;'))
})

test('escapeHtml escapes both quote styles, so attribute contexts are safe', () => {
  assert.equal(escapeHtml(`" onload="x`), '&quot; onload=&quot;x')
  assert.equal(escapeHtml("' onload='x"), '&#39; onload=&#39;x')
})

test('escapeHtml turns null and undefined into empty string, not "null"', () => {
  assert.equal(escapeHtml(null), '')
  assert.equal(escapeHtml(undefined), '')
})

test('cleanEmail accepts ordinary addresses and lower-cases them', () => {
  assert.equal(cleanEmail('Parent@Example.COM'), 'parent@example.com')
  assert.equal(cleanEmail('  a.b+tag@sub.example.co.uk  '), 'a.b+tag@sub.example.co.uk')
})

test('cleanEmail rejects what the old `if (!email)` check let through', () => {
  // Each of these was previously passed straight to resend.emails.send().
  assert.equal(cleanEmail('not-an-email'), null)
  assert.equal(cleanEmail('no@tld'), null)
  assert.equal(cleanEmail('two@@example.com'), null)
  assert.equal(cleanEmail('spaces in@example.com'), null)
  assert.equal(cleanEmail(['a@example.com']), null)
  assert.equal(cleanEmail({ email: 'a@example.com' }), null)
  assert.equal(cleanEmail(12345), null)
  assert.equal(cleanEmail(''), null)
  assert.equal(cleanEmail(null), null)
})

test('cleanEmail rejects an address longer than RFC 5321 allows', () => {
  const tooLong = 'a'.repeat(MAX_EMAIL_LENGTH) + '@example.com'
  assert.equal(cleanEmail(tooLong), null)
})

test('cleanString rejects non-strings rather than stringifying them', () => {
  assert.equal(cleanString({}), null)
  assert.equal(cleanString([1, 2]), null)
  assert.equal(cleanString(7), null)
  assert.equal(cleanString(null), null)
})

test('cleanString rejects oversized input instead of truncating it', () => {
  // Truncating would let a caller push content past a length check by padding.
  assert.equal(cleanString('x'.repeat(MAX_FIELD_LENGTH + 1)), null)
  assert.equal(cleanString('x'.repeat(MAX_FIELD_LENGTH))?.length, MAX_FIELD_LENGTH)
})

test('cleanString trims, and treats whitespace-only as absent', () => {
  assert.equal(cleanString('  Ada Lovelace  '), 'Ada Lovelace')
  assert.equal(cleanString('   '), null)
})

test('cleanString preserves markup so escaping stays the single choke point', () => {
  // Validation must not silently strip tags; detailRow() is where escaping
  // happens, and splitting that responsibility invites one of them to be missed.
  assert.equal(cleanString('<b>hi</b>'), '<b>hi</b>')
})

test('isHoneypotTripped fires only on actual content', () => {
  assert.equal(isHoneypotTripped('anything'), true)
  assert.equal(isHoneypotTripped(''), false)
  assert.equal(isHoneypotTripped('   '), false)
  assert.equal(isHoneypotTripped(undefined), false)
  assert.equal(isHoneypotTripped(null), false)
})
