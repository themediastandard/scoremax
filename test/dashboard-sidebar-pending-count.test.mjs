import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import test from 'node:test'

const root = process.cwd()
const readSource = (file) => fs.readFileSync(path.join(root, file), 'utf8')

const layout = readSource('src/app/dashboard/layout.tsx')
const shell = readSource('src/components/dashboard/DashboardShell.tsx')
const sidebar = readSource('src/components/dashboard/DashboardSidebar.tsx')

test('dashboard layout counts awaiting-scheduling and scheduled sessions separately', () => {
  assert.equal((layout.match(/\.from\('sessions'\)/g) ?? []).length, 2)
  assert.equal((layout.match(/\.select\('\*', \{ count: 'exact', head: true \}\)/g) ?? []).length, 2)
  assert.match(layout, /\.eq\('status', 'pending_scheduling'\)/)
  assert.match(layout, /\.eq\('status', 'scheduled'\)/)
  assert.match(layout, /pendingSessionCount=\{pendingSessionCount\}/)
  assert.match(layout, /scheduledSessionCount=\{scheduledSessionCount\}/)
})

test('shared sidebar shows amber pending and blue scheduled counts only on the admin Sessions link', () => {
  assert.match(shell, /pendingSessionCount=\{pendingSessionCount\}/)
  assert.match(shell, /scheduledSessionCount=\{scheduledSessionCount\}/)
  assert.match(sidebar, /role === 'admin'/)
  assert.match(sidebar, /link\.href === '\/dashboard\/sessions'/)
  assert.match(sidebar, /pendingSessionCount != null/)
  assert.match(sidebar, /\{pendingSessionCount\}/)
  assert.match(sidebar, /sessions awaiting scheduling/)
  assert.match(sidebar, /scheduledSessionCount != null/)
  assert.match(sidebar, /\{scheduledSessionCount\}/)
  assert.match(sidebar, /scheduled sessions/)
  assert.match(sidebar, /bg-amber-100/)
  assert.match(sidebar, /bg-blue-100/)
})
