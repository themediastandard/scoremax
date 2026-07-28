export interface OrderAmountSource {
  amount_cents?: number | null
  payments?: Array<{ amount_cents?: number | null }> | null
  stripe_payment_intent_id?: string | null
}

/** What was actually charged, in cents. 0 for credit bookings, null if unknown. */
export function getChargedCents(order: OrderAmountSource | null | undefined): number | null

/** Paid with hours rather than money. */
export function isCreditFundedOrder(order: OrderAmountSource | null | undefined): boolean

/** Human-readable amount, e.g. "$895" or "1 credit used". */
export function formatOrderAmount(order: OrderAmountSource | null | undefined): string
