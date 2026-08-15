import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const read = (relative) => fs.readFileSync(path.join(ROOT, relative), 'utf8')

const SESSION_PRESENTATION_SURFACES = [
  'src/app/dashboard/page.tsx',
  'src/components/dashboard/SessionList.tsx',
  'src/components/dashboard/TutorSessionsTable.tsx',
]

test('session presentation surfaces cannot format confirmed times in the runtime timezone', () => {
  for (const relative of SESSION_PRESENTATION_SURFACES) {
    const source = read(relative)
    assert.match(source, /formatBusiness(Date|Time)/, `${relative} must use the business timezone helper`)
    assert.doesNotMatch(
      source,
      /new Date\(\s*[^)]*confirmed_(?:start|end)[^)]*\)\s*\.\s*toLocale(?:Date|Time)String/s,
      `${relative} reintroduced runtime-local session formatting`,
    )
  }
})

test('admin session edits round-trip through Eastern time instead of the browser timezone', () => {
  const form = read('src/components/dashboard/SessionForm.tsx')

  assert.match(form, /businessDateTimeInputValues\(session\.confirmed_start\)/)
  assert.match(form, /businessLocalDateTimeToIso\(date, time\)/)
  assert.match(form, /Time \(Eastern\)/)
  assert.doesNotMatch(form, /fromLocalDateTimeValues|toLocalDateValue|toLocalTimeValue/)
})
