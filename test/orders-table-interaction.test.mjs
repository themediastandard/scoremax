import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const ordersTable = readFileSync(new URL('../src/components/dashboard/OrdersTable.tsx', import.meta.url), 'utf8')
const ordersPage = readFileSync(new URL('../src/app/dashboard/orders/page.tsx', import.meta.url), 'utf8')

test('orders list removes type and dedicated receipt or view actions', () => {
  assert.doesNotMatch(ordersTable, /typeFilter/)
  assert.doesNotMatch(ordersTable, />Type<\/th>/)
  assert.doesNotMatch(ordersTable, /ReceiptButton/)
  assert.doesNotMatch(ordersTable, />\s*View\s*</)
})

test('mobile cards and desktop rows open order details from the whole surface', () => {
  assert.match(ordersTable, /<Link[\s\S]*key=\{order\.id\}[\s\S]*href=\{`\/dashboard\/orders\/\$\{order\.id\}`\}/)
  assert.match(ordersTable, /<tr[\s\S]*role="link"[\s\S]*tabIndex=\{0\}[\s\S]*onClick=\{\(\) => openOrder\(order\.id\)\}/)
  assert.match(ordersTable, /event\.key !== 'Enter'/)
  assert.match(ordersTable, /router\.push\(`\/dashboard\/orders\/\$\{orderId\}`\)/)
})

test('the full orders page uses the condensed owner-first operational columns', () => {
  const desktopTable = ordersTable.slice(ordersTable.indexOf('<table className="min-w-full'))
  const columns = [
    '>Account Owner</th>',
    '>Student</th>',
    '>Plan</th>',
    '>Payment</th>',
    '>Scheduled</th>',
    '>Amount</th>',
    '>Date</th>',
  ]

  let previous = -1
  for (const column of columns) {
    const index = desktopTable.indexOf(column)
    assert.ok(index > previous, `${column} should appear in operational order`)
    previous = index
  }

  assert.doesNotMatch(desktopTable, />Subjects<\/th>|>Status<\/th>/)
  assert.match(ordersTable, /function isOrderScheduled\(order: OrderRow\)/)
  assert.match(ordersTable, /session\.status === 'scheduled' \|\| session\.status === 'completed'/)
  assert.match(ordersTable, /Scheduled: \$\{scheduled \? 'Yes' : 'No'\}/)
  assert.match(ordersPage, /sessions \(status, confirmed_start\)/)
})
