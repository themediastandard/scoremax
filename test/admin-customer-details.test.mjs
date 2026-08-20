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
const addStudentControl = readSource('src/components/dashboard/AdminAddStudentDialog.tsx')
const customerOwnerControl = readSource('src/components/dashboard/AdminCustomerOwnerControl.tsx')
const studentActionsControl = readSource('src/components/dashboard/AdminStudentActions.tsx')
const addStudentRoute = readSource('src/app/api/admin/customers/[id]/students/route.ts')
const studentActionsRoute = readSource('src/app/api/admin/customers/[id]/students/[studentId]/route.ts')
const customerOwnerRoute = readSource('src/app/api/admin/customers/[id]/owner/route.ts')

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

test('managed students render as a compact responsive directory with an account-scoped add action', () => {
  assert.match(detailContent, /data-managed-student-table/)
  assert.match(detailContent, /data-managed-student-two-line-row/)
  assert.match(detailContent, /data-managed-student-card/)
  assert.match(detailContent, /hidden overflow-x-auto md:block/)
  assert.match(detailContent, /divide-y divide-slate-100 md:hidden/)
  for (const heading of ['Student', 'Details', 'Status / Actions']) {
    assert.match(detailContent, new RegExp(`>${heading}<\\/th>`))
  }
  assert.match(detailContent, /min-w-\[560px\]/)
  assert.match(detailContent, /student\.is_active \? 'Active' : 'Inactive'/)
  assert.match(detailContent, /href=\{`mailto:\$\{student\.email\}`\}/)
  assert.match(detailContent, /href=\{`tel:\$\{student\.phone\}`\}/)
  assert.match(detailContent, /formatPhoneForDisplay\(student\.phone\)/)
  assert.match(detailContent, /reserved credits/)
  assert.match(detailContent, /No managed students yet/)
  assert.match(detailContent, /customer\.account_type === 'parent'[\s\S]*<AdminAddStudentDialog/)
  assert.match(detailContent, /customerId=\{customer\.id\}/)
  assert.match(detailContent, /customerName=\{customer\.full_name \|\| customer\.email\}/)
})

test('admin student actions expose accessible status controls and guarded deletion', () => {
  assert.match(detailContent, /<AdminStudentActions/)
  assert.match(detailContent, /studentId=\{student\.id\}/)
  assert.match(detailContent, /studentPhone=\{student\.phone\}/)
  assert.match(detailContent, /isActive=\{student\.is_active\}/)
  assert.match(detailContent, /isAccountOwner=\{customer\.account_type === 'student' && selfStudent\?\.id === student\.id\}/)
  assert.match(studentActionsControl, /aria-label=\{`Manage \$\{currentName\}`\}/)
  assert.match(studentActionsControl, /Deactivate student/)
  assert.match(studentActionsControl, /Activate student/)
  assert.match(studentActionsControl, /Deactivate before deleting/)
  assert.match(studentActionsControl, /Delete Student/)
  assert.match(studentActionsControl, /Students with orders,[\s\S]*sessions, credits, or course history cannot be deleted/)
  assert.match(studentActionsControl, /method: 'PATCH'/)
  assert.match(studentActionsControl, /method: 'DELETE'/)
  assert.match(studentActionsControl, /router\.refresh\(\)/)
  assert.match(studentActionsControl, /role="alert"/)
  assert.doesNotMatch(studentActionsControl, /alert\(/)
})

test('admin can edit a managed student name and phone with accessible, scoped controls', () => {
  assert.match(studentActionsControl, /Edit student/)
  assert.match(studentActionsControl, /Edit through Account Owner/)
  assert.match(studentActionsControl, /Student Name/)
  assert.match(studentActionsControl, /Phone Number/)
  assert.match(studentActionsControl, /Save Student/)
  assert.match(studentActionsControl, /htmlFor=\{`admin-student-\$\{studentId\}-name`\}/)
  assert.match(studentActionsControl, /id=\{`admin-student-\$\{studentId\}-name`\}/)
  assert.match(studentActionsControl, /htmlFor=\{`admin-student-\$\{studentId\}-phone`\}/)
  assert.match(studentActionsControl, /id=\{`admin-student-\$\{studentId\}-phone`\}/)
  assert.match(studentActionsControl, /action: 'details'/)
  assert.match(studentActionsControl, /expectedFullName: currentName/)
  assert.match(studentActionsControl, /expectedPhone: currentPhone/)
  assert.match(studentActionsControl, /role="alert"/)
  assert.doesNotMatch(studentActionsControl, /alert\(/)

  assert.match(studentActionsRoute, /z\.discriminatedUnion\('action'/)
  assert.match(studentActionsRoute, /action: z\.literal\('status'\)/)
  assert.match(studentActionsRoute, /action: z\.literal\('details'\)/)
  assert.match(studentActionsRoute, /normalizeStudentPhone\(parsedBody\.data\.phone\)/)
  assert.match(studentActionsRoute, /Edit this student through Account Owner so the linked profile stays synchronized/)
  assert.match(studentActionsRoute, /\.update\(\{ full_name: fullName, phone \}\)/)
  assert.match(studentActionsRoute, /\.eq\('id', studentId\)[\s\S]*\.eq\('customer_id', customerId\)[\s\S]*\.eq\('full_name', context\.student\.full_name\)/)
  assert.match(studentActionsRoute, /updateQuery\.is\('phone', null\)/)
  assert.match(studentActionsRoute, /updateQuery\.eq\('phone', context\.student\.phone\)/)
  assert.match(studentActionsRoute, /current\?\.full_name === fullName && current\.phone === phone/)
  assert.match(studentActionsRoute, /revalidateCustomer\(customerId\)/)
  assert.doesNotMatch(studentActionsRoute, /body\.(customerId|studentId)/)
})

test('admin student status and deletion stay account-scoped and preserve operational history', () => {
  assert.match(studentActionsRoute, /requireAdmin\(\)/)
  assert.match(studentActionsRoute, /id: z\.string\(\)\.uuid\(\)/)
  assert.match(studentActionsRoute, /studentId: z\.string\(\)\.uuid\(\)/)
  assert.match(studentActionsRoute, /z\.strictObject\(\{[\s\S]*isActive[\s\S]*expectedIsActive/)
  assert.match(studentActionsControl, /action: 'status'/)
  assert.match(studentActionsRoute, /\.eq\('id', studentId\)[\s\S]*\.eq\('customer_id', customerId\)/)
  assert.match(studentActionsRoute, /isRequiredSelfStudent\(context\.customer, context\.student\)/)
  assert.match(studentActionsRoute, /Change this account type before deactivating/)
  assert.match(studentActionsRoute, /Deactivate this student before deleting them/)
  for (const table of [
    'booking_requests',
    'sessions',
    'packages',
    'course_enrollments',
    'act_course_enrollments',
    'admin_session_booking_audit',
  ]) {
    assert.ok(studentActionsRoute.includes(`'${table}'`), `missing delete guard for ${table}`)
  }
  assert.match(studentActionsRoute, /\.delete\(\)[\s\S]*\.eq\('id', studentId\)[\s\S]*\.eq\('customer_id', customerId\)[\s\S]*\.eq\('is_active', false\)/)
  assert.match(studentActionsRoute, /deleteError\?\.code === '23503'/)
  assert.match(studentActionsRoute, /committed = \(await readStudent\(customerId, studentId\)\) === null/)
  assert.match(studentActionsRoute, /revalidatePath\(`\/dashboard\/customers\/\$\{customerId\}`\)/)
  assert.doesNotMatch(studentActionsRoute, /body\.(customerId|studentId)/)
})

test('orders and sessions use matching responsive operational tables', () => {
  assert.match(detailContent, /data-customer-orders-table/)
  assert.match(detailContent, /data-customer-order-card/)
  for (const heading of ['Plan', 'Student', 'Payment', 'Amount', 'Date', 'Status']) {
    assert.match(detailContent, new RegExp(`>${heading}<\\/th>`))
  }
  assert.match(detailContent, /href=\{`\/dashboard\/orders\/\$\{order\.id\}`\}/)
  assert.match(detailContent, /order\.student\?\.full_name/)
  assert.match(detailContent, /order\.paymentMethod/)
  assert.match(detailContent, /order\.amount/)
  assert.match(detailContent, /order\.date/)

  assert.match(detailContent, /data-customer-sessions-table/)
  assert.match(detailContent, /data-customer-session-card/)
  for (const heading of ['Student', 'Tutor', 'Status']) {
    assert.match(detailContent, new RegExp(`>${heading}<\\/th>`))
  }
  assert.doesNotMatch(detailContent, />Type<\/th>/)
  assert.match(detailContent, /Date &amp; Time/)
  assert.match(detailContent, /session\.student\?\.full_name/)
  assert.match(detailContent, /session\.tutors\?\.full_name/)
  assert.doesNotMatch(detailContent, /session\.sessionType/)
  assert.match(detailContent, /session\.dateTime/)
  assert.match(detailContent, /session\.statusPresentation/)
})

test('admin student creation is strict, parent-only, owner-scoped, and retry-safe', () => {
  assert.match(addStudentRoute, /requireAdmin\(\)/)
  assert.match(addStudentRoute, /z\.object\(\{ id: z\.string\(\)\.uuid\(\) \}\)/)
  assert.match(addStudentRoute, /parseSignupStudentDrafts\(\[body\]\)/)
  assert.match(addStudentRoute, /customer\.account_type !== 'parent'/)
  assert.match(addStudentRoute, /customer_id: customerId/)
  assert.match(addStudentRoute, /const studentId = randomUUID\(\)/)
  assert.match(addStudentRoute, /readCreatedStudent\(customerId, studentId\)/)
  assert.match(addStudentRoute, /error\?\.code === '23505'/)
  assert.match(addStudentRoute, /A student with this email already exists on this account/)
  assert.match(addStudentRoute, /revalidatePath\(`\/dashboard\/customers\/\$\{customerId\}`\)/)
  assert.doesNotMatch(addStudentRoute, /body\.(customerId|profileId|studentId)/)
  assert.doesNotMatch(addStudentRoute, /\.delete\(/)
})

test('admin add-student dialog requires every field and has associated accessible controls', () => {
  assert.match(addStudentControl, /Add Student/)
  assert.match(addStudentControl, /method: 'POST'/)
  assert.match(addStudentControl, /router\.refresh\(\)/)
  assert.match(addStudentControl, /Name, email, phone, and grade are required\./)
  for (const suffix of ['name', 'email', 'phone', 'grade']) {
    assert.ok(addStudentControl.includes('htmlFor={`${idPrefix}-' + suffix + '`}'))
    assert.ok(addStudentControl.includes('id={`${idPrefix}-' + suffix + '`}'))
  }
  assert.match(addStudentControl, /aria-label=\{`Student grade for \$\{customerName\}`\}/)
  assert.match(addStudentControl, /role="alert"/)
  assert.doesNotMatch(addStudentControl, /alert\(/)
})

test('account owner edit action updates name and phone without breaking linked identity records', () => {
  assert.match(detailContent, /title="Account Owner"[\s\S]*action=\{\([\s\S]*<AdminCustomerOwnerControl/)
  assert.match(detailContent, /initialName=\{customer\.full_name\}/)
  assert.match(detailContent, /initialPhone=\{customer\.phone\}/)
  assert.match(customerOwnerRoute, /requireAdmin\(\)/)
  assert.match(customerOwnerRoute, /z\.strictObject\(\{[\s\S]*fullName[\s\S]*phone[\s\S]*expectedFullName[\s\S]*expectedPhone/)
  assert.match(customerOwnerRoute, /customer\.full_name !== parsedBody\.data\.expectedFullName/)
  assert.match(customerOwnerRoute, /customer\.phone !== parsedBody\.data\.expectedPhone/)
  assert.match(customerOwnerRoute, /customer\.account_type === 'student'/)
  assert.match(customerOwnerRoute, /readSelfStudent\(customer\)/)
  assert.match(customerOwnerRoute, /profile\.role !== 'customer'/)
  assert.match(customerOwnerRoute, /\.from\('students'\)[\s\S]*\.update\(\{ full_name: fullName, phone \}\)/)
  assert.match(customerOwnerRoute, /\.from\('profiles'\)[\s\S]*\.update\(\{ full_name: fullName \}\)/)
  assert.match(customerOwnerRoute, /restoreCustomerOwner\(customer, fullName, phone\)/)
  assert.match(customerOwnerRoute, /restoreSelfStudent\(selfStudent, customerId, fullName, phone\)/)
  assert.match(customerOwnerRoute, /restoreProfileName\(profile, fullName\)/)
  assert.match(customerOwnerRoute, /revalidatePath\('\/dashboard\/customers'\)/)
  assert.doesNotMatch(customerOwnerRoute, /body\.(customerId|profileId|studentId)/)
  assert.match(customerOwnerControl, /Edit account owner/)
  assert.match(customerOwnerControl, /Save Account Owner/)
  assert.match(customerOwnerControl, /aria-label=\{`Edit account owner details for \$\{ownerLabel\}`\}/)
  for (const suffix of ['name', 'phone']) {
    assert.ok(customerOwnerControl.includes('htmlFor={`${idPrefix}-' + suffix + '`}'))
    assert.ok(customerOwnerControl.includes('id={`${idPrefix}-' + suffix + '`}'))
  }
  assert.match(customerOwnerControl, /role="alert"/)
  assert.doesNotMatch(customerOwnerControl, /alert\(/)
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
