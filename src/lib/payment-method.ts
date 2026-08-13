export type PurchasePaymentMethod =
  | 'credit_card'
  | 'step_up'
  | 'zelle'
  | 'account_credit'

export type OfflinePaymentMethod = 'step_up' | 'zelle'

export function isOfflinePaymentMethod(value: unknown): value is OfflinePaymentMethod {
  return value === 'step_up' || value === 'zelle'
}

export function formatPaymentMethod(value: string | null | undefined): string {
  if (value === 'credit_card') return 'Credit Card'
  if (value === 'step_up') return 'Step Up'
  if (value === 'zelle') return 'Zelle'
  if (value === 'account_credit') return 'Account Credit'
  return '—'
}

export function paymentApprovalMessage(method: OfflinePaymentMethod): string {
  const label = formatPaymentMethod(method)
  return `Your account has not been approved for ${label} purchases. Please contact ScoreMax for approval.`
}

export function paymentApprovalControlId(
  scope: 'mobile' | 'desktop',
  customerId: string,
  method: OfflinePaymentMethod
): string {
  return `payment-approval-${scope}-${customerId}-${method}`
}

export function paymentApprovalErrorId(
  scope: 'mobile' | 'desktop',
  customerId: string
): string {
  return `payment-approval-${scope}-error-${customerId}`
}
