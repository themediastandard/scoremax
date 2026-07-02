import assert from 'node:assert/strict'
import test from 'node:test'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const { buildSubjectCatalog } = require('../src/lib/subject-catalog.js')

const rows = [
  { id: 'sat-id', name: 'SAT Prep', slug: 'sat-prep', category: 'test-prep', hourly_rate_cents: 15000 },
  { id: 'act-id', name: 'ACT Prep', slug: 'act-prep', category: 'test-prep', hourly_rate_cents: 15000 },
  { id: 'lsat-id', name: 'LSAT Prep', slug: 'lsat-prep', category: 'test-prep', hourly_rate_cents: 25000 },
  { id: 'bio-id', name: 'Biology', slug: 'biology', category: 'high-school', hourly_rate_cents: 12500 },
  { id: 'chem-id', name: 'Chemistry', slug: 'chemistry', category: 'high-school', hourly_rate_cents: 12500 },
  { id: 'physics-id', name: 'Physics', slug: 'physics', category: 'high-school', hourly_rate_cents: 12500 },
  { id: 'calc-id', name: 'Calculus AB/BC', slug: 'calculus', category: 'high-school', hourly_rate_cents: 12500 },
  { id: 'stats-id', name: 'Statistics', slug: 'statistics', category: 'high-school', hourly_rate_cents: 12500 },
  { id: 'history-id', name: 'History (US/World/Euro)', slug: 'history', category: 'high-school', hourly_rate_cents: 12500 },
  { id: 'spanish-id', name: 'Spanish', slug: 'spanish', category: 'high-school', hourly_rate_cents: 12500 },
  { id: 'college-calc-id', name: 'College Calculus 1-3', slug: 'college-calculus', category: 'college', hourly_rate_cents: 15000 },
  { id: 'middle-math-id', name: 'Middle School Math', slug: 'middle-math', category: 'elementary', hourly_rate_cents: 11000 },
  { id: 'elem-math-id', name: 'Elementary Math', slug: 'elem-math', category: 'elementary', hourly_rate_cents: 10000 },
]

test('builds the launch subject catalog requested by the client', () => {
  const catalog = buildSubjectCatalog(rows)

  const allNames = Object.values(catalog).flat().map((subject) => subject.name)

  assert.deepEqual(
    Object.keys(catalog),
    ['test-prep', 'high-school', 'college', 'middle-school', 'elementary']
  )
  assert.ok(!allNames.includes('In-Person SAT'))
  assert.ok(!allNames.includes('Biology'))
  assert.ok(!allNames.includes('Spanish'))
  assert.ok(!allNames.includes('History (US/World/Euro)'))

  assert.ok(catalog['test-prep'].some((subject) => subject.name === 'GMAT Prep'))
  assert.ok(catalog['test-prep'].some((subject) => subject.name === 'GRE Prep'))
  const apGroup = catalog['test-prep'].find((subject) => subject.name === 'AP Preparation')
  assert.ok(apGroup)
  assert.deepEqual(
    apGroup.children.map((subject) => subject.name),
    ['AP Chemistry', 'AP Physics', 'AP Calculus', 'AP Statistics']
  )
  assert.equal(apGroup.children[0].hourly_rate_cents, 20000)
  assert.ok(catalog['college'].some((subject) => subject.name === 'College Pre-Calculus'))
  assert.ok(catalog['middle-school'].some((subject) => subject.name === 'Middle School Math'))
  assert.ok(catalog['elementary'].some((subject) => subject.name === 'Elementary Math'))
})

test('uses database-backed AP subjects inside the AP group without duplicating them', () => {
  const catalog = buildSubjectCatalog([
    ...rows,
    { id: 'ap-chem-db-id', name: 'AP Chemistry', slug: 'ap-chemistry', category: 'test-prep', hourly_rate_cents: 20000 },
  ])

  const testPrepNames = catalog['test-prep'].map((subject) => subject.name)
  const apGroup = catalog['test-prep'].find((subject) => subject.name === 'AP Preparation')

  assert.equal(testPrepNames.filter((name) => name === 'AP Chemistry').length, 0)
  assert.equal(apGroup.children.find((subject) => subject.slug === 'ap-chemistry').id, 'ap-chem-db-id')
  assert.equal(apGroup.children.find((subject) => subject.slug === 'ap-chemistry').hourly_rate_cents, 20000)
})
