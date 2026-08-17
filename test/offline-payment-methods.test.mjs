import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const { formatOrderAmount, isCreditFundedOrder } = require('../src/lib/order-amount.js')
const {
  formatPaymentMethod,
  isOfflinePaymentMethod,
  paymentApprovalControlId,
  paymentApprovalErrorId,
  paymentApprovalMessage,
} = await import('../src/lib/payment-method.ts')

const readSource = (path) =>
  readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')

const paymentSelector = readSource('src/components/booking/PaymentMethodSelection.tsx')
const planSelection = readSource('src/components/booking/PlanSelection.tsx')
const bookingPage = readSource('src/app/book/page.tsx')
const approvalLookup = readSource('src/app/api/account/payment-methods/route.ts')
const offlinePurchase = readSource('src/app/api/offline-purchase/route.ts')
const adminApproval = readSource('src/app/api/admin/customers/[id]/payment-approvals/route.ts')
const stripeCheckout = readSource('src/app/api/stripe/checkout/route.ts')
const stripeWebhook = readSource('src/app/api/stripe/webhook/route.ts')
const resend = readSource('src/lib/resend.ts')
const ordersTable = readSource('src/components/dashboard/OrdersTable.tsx')
const orderDetail = readSource('src/app/dashboard/orders/[id]/page.tsx')
const ordersPage = readSource('src/app/dashboard/orders/page.tsx')
const dashboardHome = readSource('src/app/dashboard/page.tsx')
const confirmationRoute = readSource('src/app/api/booking/confirmation/route.ts')
const confirmationView = readSource('src/components/booking/ConfirmationView.tsx')
const customersPage = readSource('src/app/dashboard/customers/page.tsx')
const customersTable = readSource('src/components/dashboard/CustomersTable.tsx')
const customerDetail = readSource('src/components/dashboard/CustomerDetailContent.tsx')
const customerDetailLoader = readSource('src/lib/admin-customer-detail.ts')
const approvalControls = readSource('src/components/dashboard/PaymentApprovalControls.tsx')
const profileRoute = readSource('src/app/api/account/profile/route.ts')
const bookingDraft = readSource('src/lib/booking-draft.ts')
const confirmationViewSource = readSource('src/components/booking/ConfirmationView.tsx')

function sourceBetween(source, start, end) {
  const startIndex = source.indexOf(start)
  const endIndex = source.indexOf(end, startIndex)
  assert.ok(startIndex >= 0, `missing source marker: ${start}`)
  assert.ok(endIndex > startIndex, `missing source marker: ${end}`)
  return source.slice(startIndex, endIndex)
}

test('the payment selector offers exactly Credit Card, Step Up, then Zelle before plan choices', () => {
  const methods = sourceBetween(paymentSelector, 'const METHODS', 'const EMPTY_APPROVALS')
  const values = [...methods.matchAll(/value:\s*'([^']+)'/g)].map((match) => match[1])
  const labels = [...methods.matchAll(/label:\s*'([^']+)'/g)].map((match) => match[1])

  assert.deepEqual(values, ['credit_card', 'step_up', 'zelle'])
  assert.deepEqual(labels, ['Credit Card', 'Step Up', 'Zelle'])

  const selectorIndex = planSelection.indexOf('<PaymentMethodSelection')
  const planChoicesIndex = planSelection.indexOf('{paymentMethod && (')
  assert.ok(selectorIndex > 0 && planChoicesIndex > selectorIndex)

  // A customer who already has credits keeps the established no-payment flow.
  assert.ok(planSelection.indexOf('if (memberStatus?.hasCredits') < selectorIndex)
})

test('unapproved Step Up and Zelle choices use the exact fail-closed copy and actions', () => {
  assert.equal(
    paymentApprovalMessage('step_up'),
    'Your account has not been approved for Step Up purchases. Please contact ScoreMax for approval.'
  )
  assert.equal(
    paymentApprovalMessage('zelle'),
    'Your account has not been approved for Zelle purchases. Please contact ScoreMax for approval.'
  )

  assert.match(paymentSelector, /<DialogTitle>Account Not Approved<\/DialogTitle>/)
  assert.match(paymentSelector, /<Link href="\/contact">Contact ScoreMax<\/Link>/)
  assert.doesNotMatch(paymentSelector, /Choose Another Payment Method/)
  assert.match(paymentSelector, /Check Approval Again\s*<\/Button>/)
  assert.match(paymentSelector, /cache: 'no-store'/)
  assert.match(paymentSelector, /status\.signedIn && status\.approvals\[method\]/)
  assert.match(paymentSelector, /onChange\(method\)/)
  assert.match(paymentSelector, /paymentApprovalMessage\(effectiveBlockedMethod\)/)
})

test('an interrupted approval flow restores completed booking steps and clears them only after confirmation', () => {
  assert.match(profileRoute, /profileId: user\.id/)
  assert.match(bookingPage, /readBookingDraft\(window\.sessionStorage, data\.profileId\)/)
  assert.match(bookingPage, /writeBookingDraft\(window\.sessionStorage, draftProfileId/)
  assert.match(bookingPage, /We restored your booking details\. Continue where you left off\./)
  assert.doesNotMatch(bookingDraft, /fullName|phone|notes/)
  assert.match(confirmationViewSource, /if \(bookingDetails\) clearBookingDrafts\(window\.sessionStorage\)/)
})

test('signed-out, missing-customer, unapproved, and approval-check-error states fail closed', () => {
  assert.match(approvalLookup, /if \(!user\) return unavailable\(false\)/)
  assert.match(approvalLookup, /if \(!customer\) return unavailable\(true\)/)
  assert.match(approvalLookup, /approvals: \{ step_up: false, zelle: false \}/)
  assert.match(approvalLookup, /filter\(\(row\) => row\.approved_at && !row\.revoked_at\)/)

  assert.match(
    paymentSelector,
    /if \(!approvalStatus\.signedIn \|\| !approvalStatus\.approvals\[method\]\) \{\s*setBlockedMethod\(method\)\s*return/s
  )
  assert.match(paymentSelector, /setApprovalStatus\(EMPTY_APPROVALS\)/)
  assert.match(paymentSelector, /We could not verify offline-payment approval\. Credit Card is still available\./)
})

test('authorization is scoped to the signed-in customer and the exact offline method', () => {
  assert.match(approvalLookup, /\.eq\('profile_id', user\.id\)/)
  assert.match(approvalLookup, /\.eq\('customer_id', customer\.id\)/)
  assert.match(approvalLookup, /\.in\('payment_method', \['step_up', 'zelle'\]\)/)
  assert.match(approvalLookup, /step_up: active\.has\('step_up'\)/)
  assert.match(approvalLookup, /zelle: active\.has\('zelle'\)/)

  assert.match(offlinePurchase, /if \(!user\).*Unauthorized.*status: 401/s)
  assert.match(offlinePurchase, /\.rpc\('create_offline_purchase', \{/)
  assert.match(offlinePurchase, /p_profile_id: user\.id/)
  assert.match(offlinePurchase, /p_payment_method: body\.payment_method/)
  assert.match(offlinePurchase, /account_not_approved/)
  assert.match(offlinePurchase, /code: 'account_not_approved'/)
  assert.match(offlinePurchase, /status: 403/)

  // If the session expires or approval is revoked after the initial GET, the
  // authoritative POST response reopens the same accessible dialog instead of
  // degrading to a browser alert.
  assert.match(bookingPage, /res\.status === 401/)
  assert.match(bookingPage, /res\.status === 403 && data\?\.code === 'account_not_approved'/)
  assert.match(bookingPage, /setAuthoritativeBlockedMethod\(plan\.paymentMethod\)/)
  assert.match(planSelection, /if \(authoritativeBlockedMethod\) setPaymentMethod\(null\)/)
  assert.match(paymentSelector, /authoritativeBlockedMethod \?\? blockedMethod/)

  assert.match(adminApproval, /await requireAdmin\(\)/)
  assert.match(adminApproval, /payment_method: z\.enum\(\['step_up', 'zelle'\]\)/)
  assert.match(adminApproval, /approved_by: adminUser\.id/)
  assert.match(adminApproval, /revoked_by: adminUser\.id/)
  assert.match(adminApproval, /onConflict: 'customer_id,payment_method'/)
})

test('the offline request boundary rejects forged methods and accepts no client price or customer authority', () => {
  const schema = sourceBetween(
    offlinePurchase,
    'const purchaseSchema',
    'interface OfflinePurchaseResult'
  )

  assert.match(schema, /payment_method: z\.enum\(\['step_up', 'zelle'\]\)/)
  assert.match(schema, /idempotency_key: z\.string\(\)\.uuid\(\)/)
  assert.match(schema, /plan_type: z\.enum\(\['single', 'package', 'course'\]\)/)
  assert.match(schema, /session_type: z\.literal\('online'\)/)
  assert.match(schema, /\}\)\.strict\(\)/)
  assert.doesNotMatch(schema, /\b(?:amount_cents|price_cents|price_id|customer_id|profile_id|approved)\s*:/)

  // The privileged RPC gets the authenticated profile and selected identities,
  // never a client-supplied customer id, approval flag, or dollar amount.
  const rpcArguments = sourceBetween(
    offlinePurchase,
    ".rpc('create_offline_purchase', {",
    '})\n    .single<OfflinePurchaseResult>()'
  )
  assert.match(rpcArguments, /p_profile_id: user\.id/)
  assert.doesNotMatch(rpcArguments, /p_(?:amount|price|customer|approved)/)
  assert.doesNotMatch(offlinePurchase, /body\.(?:amount_cents|price_cents|price|customer_id|profile_id|approved)/)
})

test('offline plans show base prices and monthly memberships stay credit-card only', () => {
  assert.match(
    planSelection,
    /const showMemberships = isCreditCard && canPurchaseMembershipForSubjects\(subjects, subjectMap\)/
  )
  assert.match(
    planSelection,
    /const singleRateCents = isCreditCard \? getOnlinePriceCents\(singleBaseRateCents\) : singleBaseRateCents/
  )
  assert.match(
    planSelection,
    /isCreditCard \? onlinePriceFor\(row\) : row\.price_cents/
  )
  assert.match(planSelection, /Prices shown are base prices for/)

  // Membership is absent from the server enum too, so a forged client cannot
  // bypass the hidden card even if it posts directly to the route.
  assert.match(offlinePurchase, /plan_type: z\.enum\(\['single', 'package', 'course'\]\)/)
  assert.doesNotMatch(
    sourceBetween(offlinePurchase, 'const purchaseSchema', 'interface OfflinePurchaseResult'),
    /'membership'/
  )
})

test('offline pricing and the returned amount remain server-derived', () => {
  const rpcArguments = sourceBetween(
    offlinePurchase,
    ".rpc('create_offline_purchase', {",
    '})\n    .single<OfflinePurchaseResult>()'
  )

  assert.match(rpcArguments, /p_plan_type: body\.plan_type/)
  assert.match(rpcArguments, /p_plan_id: body\.plan_id/)
  assert.match(rpcArguments, /p_subjects: details\.subjects/)
  assert.doesNotMatch(rpcArguments, /amount_cents|price_cents|unit_amount/)
  assert.match(offlinePurchase, /const amountLabel = `\$\$\{\(data\.amount_cents \/ 100\)\.toLocaleString\(\)\}`/)
  assert.match(offlinePurchase, /amount_cents: data\.amount_cents/)
})

test('an exact retry reuses one idempotency key through the atomic purchase RPC', () => {
  assert.match(bookingPage, /scoremax:offline-purchase-keys:v1/)
  assert.match(bookingPage, /window\.sessionStorage\.getItem/)
  assert.match(bookingPage, /window\.sessionStorage\.setItem/)
  assert.match(bookingPage, /const requestFingerprint = JSON\.stringify\(requestWithoutKey\)/)
  assert.match(bookingPage, /idempotencyKeys\.get\(requestFingerprint\)/)
  assert.match(bookingPage, /idempotencyKeys\.set\(requestFingerprint, idempotencyKey\)/)
  assert.match(bookingPage, /idempotencyKeys\.delete\(requestFingerprint\)/)
  assert.match(bookingPage, /idempotency_key: idempotencyKey/)
  assert.match(offlinePurchase, /p_idempotency_key: body\.idempotency_key/)
  assert.match(offlinePurchase, /idempotency_key_reused/)
  assert.match(offlinePurchase, /idempotent_replay: !data\.created/)

  // Replaying an already-created purchase never invokes either notification;
  // the optional Resend key protects ambiguous provider responses on the first.
  assert.match(offlinePurchase, /if \(data\.created && adminEmails\.length > 0\)/)
  assert.match(offlinePurchase, /if \(data\.created && customer\?\.email\)/)
  assert.match(offlinePurchase, /`offline:admin:\$\{data\.booking_id\}`/)
  assert.match(offlinePurchase, /`offline:customer:\$\{data\.booking_id\}`/)
  assert.match(resend, /resend\.emails\.send\([\s\S]*idempotencyKey \? \{ idempotencyKey \} : undefined/)
  assert.match(
    offlinePurchase,
    /`offline:admin:\$\{data\.booking_id\}`,[\s\S]*`offline:admin:\$\{data\.booking_id\}`/
  )
  assert.match(
    offlinePurchase,
    /`offline:customer:\$\{data\.booking_id\}`,[\s\S]*`offline:customer:\$\{data\.booking_id\}`/
  )
})

test('credit-card purchases keep the established Stripe checkout and webhook path', () => {
  const offlineBranch = bookingPage.indexOf("plan.paymentMethod === 'step_up'")
  const stripeCall = bookingPage.indexOf("fetch('/api/stripe/checkout'")
  assert.ok(offlineBranch > 0 && stripeCall > offlineBranch)

  assert.match(stripeCheckout, /line_items,/)
  assert.match(stripeCheckout, /allow_promotion_codes: true/)
  assert.match(stripeCheckout, /mode = 'subscription'/)
  assert.equal(stripeCheckout.split('unit_amount: trustedPriceCents').length - 1, 3)
  assert.match(stripeCheckout, /payment_method: 'credit_card'/)
  assert.match(stripeWebhook, /payment_method: 'credit_card'/)
  assert.match(stripeWebhook, /\.upsert\(\{[\s\S]*stripe_payment_intent_id: stripePaymentIntentId/)
})

test('paid Step Up and Zelle orders keep dollar amounts instead of masquerading as credit', () => {
  for (const method of ['step_up', 'zelle']) {
    const order = {
      payment_method: method,
      amount_cents: 120000,
      payments: [{ amount_cents: 120000, payment_method: method }],
      stripe_payment_intent_id: null,
    }
    assert.equal(isCreditFundedOrder(order), false)
    assert.equal(formatOrderAmount(order), '$1,200')
    assert.equal(isOfflinePaymentMethod(method), true)
  }

  assert.equal(formatPaymentMethod('credit_card'), 'Credit Card')
  assert.equal(formatPaymentMethod('step_up'), 'Step Up')
  assert.equal(formatPaymentMethod('zelle'), 'Zelle')
  assert.equal(formatPaymentMethod('account_credit'), 'Account Credit')
})

test('admin and customer order surfaces display the method and hide Stripe-only actions offline', () => {
  assert.match(ordersPage, /payments \(amount_cents, payment_method\)/)
  assert.match(ordersTable, /formatPaymentMethod\(paymentMethod\)/)
  assert.match(ordersTable, /!isOfflinePaymentMethod\(paymentMethod\)/)
  assert.match(ordersTable, /<SelectItem value="step_up">Step Up<\/SelectItem>/)
  assert.match(ordersTable, /<SelectItem value="zelle">Zelle<\/SelectItem>/)

  assert.match(orderDetail, /Payment Method/)
  assert.match(orderDetail, /formatPaymentMethod\(paymentMethod\)/)
  assert.match(orderDetail, /order\.stripe_payment_intent_id && !isOfflinePayment/)
  assert.match(orderDetail, /profile\?\.role === 'admin'.*!isOfflinePayment/s)

  assert.match(dashboardHome, /formatPaymentMethod\(order\.payment_method \?\? order\.payments\?\.\[0\]\?\.payment_method\)/)
  assert.match(confirmationRoute, /payment_type, payment_method, amount_cents, pricing_id/)
  assert.match(confirmationRoute, /paymentMethod: booking\.payment_method/)
  assert.match(confirmationView, /Payment method:/)
  assert.match(confirmationView, /formatPaymentMethod\(bookingDetails\.plan\.paymentMethod\)/)
})

test('admin customer controls expose separate audited Step Up and Zelle approvals', () => {
  assert.match(customersPage, /\.from\('customer_payment_approvals'\)/)
  assert.match(customersPage, /paymentApprovalMap=\{paymentApprovalMap\}/)
  assert.match(customerDetailLoader, /\.from\('customer_payment_approvals'\)/)
  assert.match(customerDetailLoader, /approved_at, revoked_at/)
  assert.match(customerDetailLoader, /paymentMethod !== 'step_up' && paymentMethod !== 'zelle'/)
  assert.match(
    customerDetailLoader,
    /approvals\[paymentMethod\] = Boolean\(approval\.approved_at && !approval\.revoked_at\)/
  )
  assert.doesNotMatch(customersTable, /<PaymentApprovalControls/)
  assert.match(customersTable, />Payment access<\/p>/)
  assert.match(customersTable, /<PaymentAccess approvals=\{paymentApprovalMap\[customer\.id\]\}/)
  assert.match(customerDetail, /Payment Approvals/)
  assert.match(customerDetail, /<PaymentApprovalControls/)
  assert.match(approvalControls, /\['step_up', 'zelle'\]/)
  assert.match(approvalControls, /payment_method: method, approved/)
  assert.match(approvalControls, /formatPaymentMethod\(method\)/)
})

test('approval control ids remain method-specific on the customer details page', () => {
  const customerId = '00000000-0000-0000-0000-000000000123'
  const ids = [
    paymentApprovalControlId('desktop', customerId, 'step_up'),
    paymentApprovalControlId('desktop', customerId, 'zelle'),
    paymentApprovalErrorId('desktop', customerId),
  ]

  assert.equal(new Set(ids).size, ids.length)
  assert.match(customerDetail, /idScope="desktop"/)
  assert.match(approvalControls, /htmlFor=\{controlId\}/)
  assert.match(approvalControls, /aria-describedby=\{error \? errorId : undefined\}/)
})
