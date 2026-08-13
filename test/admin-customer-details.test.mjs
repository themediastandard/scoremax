import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const readSource = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')

const customersPage = readSource('src/app/dashboard/customers/page.tsx')
const customersTable = readSource('src/components/dashboard/CustomersTable.tsx')
const detailPage = readSource('src/app/dashboard/customers/[id]/page.tsx')
const detailContent = readSource('src/components/dashboard/CustomerDetailContent.tsx')
const detailLoader = readSource('src/lib/admin-customer-detail.ts')
const accountTypeControl = readSource('src/components/dashboard/AccountTypeControl.tsx')
const accountTypeRoute = readSource('src/app/api/admin/customers/[id]/account-type/route.ts')

test('customer directory is a compact read-only index with details navigation', () => {
  assert.doesNotMatch(customersTable, /PaymentApprovalControls/)
  assert.doesNotMatch(customersTable, /Account Payment Approvals/)
  assert.match(customersTable, /`\/dashboard\/customers\/\$\{customer\.id\}`/)
  assert.match(customersTable, /View details/)
  assert.match(customersTable, />Type<\/th>/)
  assert.match(customersTable, />Payment Access<\/th>/)
  assert.match(customersTable, /<PaymentAccess approvals=\{paymentApprovalMap\[customer\.id\]\}/)
  assert.match(customersTable, /approvals\.step_up/)
  assert.match(customersTable, /approvals\.zelle/)
  assert.match(customersTable, /formatAccountType\(customer\.account_type\)/)
  assert.match(customersTable, /Next Session/)
  assert.match(customersTable, /first\.full_name/)
  assert.match(customersTable, /displayStudents\.length > 1/)
  assert.match(customersTable, /\{displayStudents\.length\} students/)
  assert.doesNotMatch(customersTable, /\+\{moreCount\}/)
  assert.match(customersTable, /aria-label=\{`View details for/)
  assert.match(customersPage, /\.select\('customer_id, status, confirmed_start'\)/)
  assert.match(customersPage, /\.from\('course_enrollments'\)/)
  assert.match(customersPage, /\.from\('act_course_enrollments'\)/)
  assert.match(customersTable, /<SelectItem value="course">Course<\/SelectItem>/)
  assert.match(customersPage, /\.from\('customer_payment_approvals'\)/)
  assert.match(customersPage, /approved_at, revoked_at/)
  assert.match(customersPage, /paymentApprovalMap=\{paymentApprovalMap\}/)
})

test('customer details route fails closed to admin users and validates its id', () => {
  assert.match(detailPage, /if \(!user\) redirect\('\/login'\)/)
  assert.match(detailPage, /if \(profile\?\.role !== 'admin'\) redirect\('\/dashboard'\)/)
  assert.match(detailPage, /z\.string\(\)\.uuid\(\)/)
  assert.match(detailPage, /if \(!parsedId\.success\) notFound\(\)/)
  assert.match(detailPage, /loadAdminCustomerDetail\(parsedId\.data\)/)
  assert.match(detailPage, /if \(!detail\) notFound\(\)/)
})

test('customer detail loader scopes every related record to the selected customer', () => {
  for (const table of [
    'students',
    'memberships',
    'packages',
    'course_enrollments',
    'act_course_enrollments',
    'booking_requests',
    'sessions',
    'customer_payment_approvals',
  ]) {
    const tableStart = detailLoader.indexOf(`.from('${table}')`)
    assert.ok(tableStart >= 0, `missing ${table} query`)
    const nextQuery = detailLoader.indexOf(".from('", tableStart + 7)
    const query = detailLoader.slice(tableStart, nextQuery >= 0 ? nextQuery : undefined)
    assert.match(query, /\.eq\('customer_id', customerId\)/, `${table} must be customer scoped`)
  }

  assert.match(detailLoader, /\.eq\('id', customerId\)/)
  assert.match(detailLoader, /throw new Error\('Could not load customer details'\)/)
})

test('details page contains owner, child, credits, approvals, orders, and sessions', () => {
  assert.match(detailContent, /Account Owner/)
  assert.match(detailContent, /Managed Students/)
  assert.match(detailContent, /student\.full_name/)
  assert.match(detailContent, /student\.email/)
  assert.match(detailContent, /student\.grade/)
  assert.match(detailContent, /Reserved credits/)
  assert.match(detailContent, /Family credits can be used for any selected student/)
  assert.match(detailContent, /<PaymentApprovalControls/)
  assert.match(detailContent, /<AccountTypeControl/)
  assert.match(detailLoader, /customers\(packages\(total_hours, stripe_payment_intent_id\)\)/)
  assert.match(detailContent, /package_hours: linkedPackage\?\.total_hours/)
  assert.match(detailContent, /title=\{`Orders \(\$\{orders\.length\}\)`\}/)
  assert.match(detailContent, /title=\{`Sessions \(\$\{sessions\.length\}\)`\}/)
})

test('admin can classify legacy accounts without inferring from child count', () => {
  assert.match(accountTypeRoute, /requireAdmin\(\)/)
  assert.match(accountTypeRoute, /z\.enum\(\['parent', 'student'\]\)/)
  assert.match(accountTypeRoute, /\.eq\('id', parsedParams\.data\.id\)/)
  assert.match(accountTypeControl, /SelectItem value="parent"/)
  assert.match(accountTypeControl, /SelectItem value="student"/)
  assert.doesNotMatch(customersTable, /managedStudents\.length.*account_type/s)
})
