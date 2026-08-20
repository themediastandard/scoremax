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
  assert.match(customersTable, /role="link"/)
  assert.match(customersTable, /Payment Access/)
  assert.match(customersTable, /<PaymentAccess approvals=\{paymentApprovalMap\[customer\.id\]\}/)
  assert.match(customersTable, /approvals\.step_up/)
  assert.match(customersTable, /approvals\.zelle/)
  assert.match(customersTable, /first\.full_name/)
  assert.match(customersTable, /displayStudents\.length > 1/)
  assert.match(customersTable, /\{displayStudents\.length\} students/)
  assert.doesNotMatch(customersTable, /\+\{moreCount\}/)
  assert.match(customersTable, /aria-label=\{`Open customer/)
  assert.match(customersTable, /<table className="min-w-\[1120px\]/)
  assert.match(customersTable, /Orders \/ Total Spent/)
  assert.match(customersTable, /formatTotalSpent\(totalSpentMap\[customer\.id\] \?\? 0\)/)
  assert.match(customersPage, /payments\(amount_cents\)/)
  assert.match(customersPage, /getChargedCents\(o\)/)
  assert.match(customersPage, /totalSpentMap=\{totalSpentMap\}/)
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

test('admin completes or corrects an account type through a required-details modal', () => {
  assert.match(accountTypeRoute, /requireAdmin\(\)/)
  assert.match(accountTypeRoute, /z\.discriminatedUnion\('account_type'/)
  assert.match(accountTypeRoute, /account_type: z\.literal\('parent'\)/)
  assert.match(accountTypeRoute, /account_type: z\.literal\('student'\)/)
  assert.match(accountTypeControl, /Complete Account Setup/)
  assert.match(accountTypeControl, /Change Account Type/)
  assert.match(accountTypeControl, /<DialogContent/)
  assert.match(accountTypeControl, /Who owns this account\?/)
  assert.match(accountTypeControl, /Parent \/ Guardian/)
  assert.match(accountTypeControl, /Student Name/)
  assert.match(accountTypeControl, /Student Email/)
  assert.match(accountTypeControl, /Student Phone/)
  assert.match(accountTypeControl, /Student Grade/)
  assert.match(accountTypeControl, /Phone Number/)
  assert.match(accountTypeControl, />Grade<\/Label>/)
  assert.match(detailContent, /customerEmail=\{customer\.email\}/)
  assert.match(detailContent, /hasActiveStudents=\{activeStudents\.length > 0\}/)
  assert.match(detailContent, /hasNonSelfStudents=\{hasNonSelfStudents\}/)
  assert.doesNotMatch(customersTable, /managedStudents\.length.*account_type/s)
})

test('account type changes are owner-scoped and create the required student record', () => {
  assert.match(accountTypeRoute, /if \(customer\.account_type === accountType\)/)
  assert.match(accountTypeRoute, /This account is already classified as/)
  assert.match(accountTypeRoute, /customer\.account_type === null[\s\S]*classificationQuery\.is\('account_type', null\)[\s\S]*classificationQuery\.eq\('account_type', customer\.account_type\)/)
  assert.match(accountTypeRoute, /parseSignupStudentDrafts\(\[parsedBody\.data\.student\]\)/)
  assert.match(accountTypeRoute, /GRADE_OPTIONS\.includes\(grade\)/)
  assert.match(accountTypeRoute, /normalizeStudentPhone\(parsedBody\.data\.studentPhone\)/)
  assert.match(accountTypeRoute, /fullName: customer\.full_name\?\.trim\(\) \|\| 'Student'/)
  assert.match(accountTypeRoute, /email: ownerEmail/)
  assert.match(accountTypeRoute, /This account already manages another student and cannot be converted to a student account/)
  assert.match(accountTypeRoute, /createSetupStudent\(customerId, studentDraft\)/)
  assert.match(accountTypeRoute, /removeSetupStudent\(customerId, createdStudentId\)/)
  assert.match(accountTypeRoute, /createdStudentId && !classificationCommitted/)
  assert.match(accountTypeRoute, /classificationCommitted = true[\s\S]*revalidatePath/)
  assert.doesNotMatch(accountTypeRoute, /body\.(customerId|profileId|studentId)/)
})

test('classified accounts can be corrected without repurposing managed students', () => {
  assert.match(accountTypeControl, /Correct the account type through the guided conversion flow/)
  assert.match(accountTypeControl, /disabled: accountType === 'parent'/)
  assert.match(accountTypeControl, /disabled: accountType === 'student' \|\| hasNonSelfStudents/)
  assert.match(accountTypeControl, /Existing students, bookings, orders, and credits stay connected/)
  assert.match(accountTypeControl, /selfStudentPhone \?\? customerPhone/)
  assert.match(accountTypeRoute, /nonSelfStudents\.length > 0/)
  assert.match(accountTypeRoute, /cannot be converted to a student account/)
  assert.doesNotMatch(accountTypeControl, /onValueChange=\{\(value\) => void updateAccountType/)
})

test('account setup modal associates every input and names both grade selectors', () => {
  for (const suffix of [
    'student-name',
    'student-email',
    'student-phone',
    'student-grade',
    'owner-phone',
    'owner-grade',
  ]) {
    assert.ok(accountTypeControl.includes('htmlFor={`setup-${customerId}-' + suffix + '`}'))
    assert.ok(accountTypeControl.includes('id={`setup-${customerId}-' + suffix + '`}'))
  }
  assert.match(accountTypeControl, /aria-label=\{`Student grade for \$\{customerName\}`\}/)
  assert.match(accountTypeControl, /aria-label=\{`Grade for \$\{customerName\}`\}/)
  assert.match(accountTypeControl, /role="alert"/)
})
