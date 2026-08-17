import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const readSource = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')

test('the admin and tutor portals start on Sessions instead of the overview', () => {
  const dashboard = readSource('src/app/dashboard/page.tsx')
  const redirectIndex = dashboard.indexOf("if (profile.role === 'admin' || profile.role === 'tutor') redirect('/dashboard/sessions')")
  const clientIndex = dashboard.indexOf('const supabase = await createClient()')

  assert.ok(redirectIndex >= 0)
  assert.ok(clientIndex > redirectIndex)
})

test('admin and tutor navigation treat Sessions as home and hide Overview', () => {
  const sidebar = readSource('src/components/dashboard/DashboardSidebar.tsx')
  const shell = readSource('src/components/dashboard/DashboardShell.tsx')
  const headerMenu = readSource('src/components/HeaderUserMenu.tsx')
  const overviewLink = sidebar.slice(
    sidebar.indexOf("label: 'Overview'"),
    sidebar.indexOf("label: 'My Orders'")
  )

  assert.match(overviewLink, /roles: \['customer'\]/)
  assert.doesNotMatch(overviewLink, /'admin'|'tutor'/)
  assert.match(sidebar, /label: 'Sessions'[\s\S]*?roles: \['admin', 'tutor'\]/)
  assert.ok(sidebar.indexOf("label: 'Sessions'") < sidebar.indexOf("label: 'Overview'"))
  assert.match(sidebar, /label: 'Orders'[\s\S]*?roles: \['admin'\]/)
  assert.doesNotMatch(sidebar, /label: 'All Orders'/)
  assert.match(shell, /const homeHref = role === 'admin' \|\| role === 'tutor' \? '\/dashboard\/sessions' : '\/dashboard'/)
  assert.match(shell, /<Link href=\{homeHref\}/)
  assert.match(headerMenu, /href=\{role === 'admin' \|\| role === 'tutor' \? '\/dashboard\/sessions' : '\/dashboard'\}/)
})
