import 'server-only'
import { stripe } from '@/lib/stripe'
import { supabaseAdmin } from '@/lib/supabase/admin'

export interface StoredStripeCustomer {
  id: string
  email: string | null
  stripe_customer_id: string | null
}

async function readStoredStripeCustomerId(customerId: string): Promise<string | null> {
  const { data, error } = await supabaseAdmin
    .from('customers')
    .select('stripe_customer_id')
    .eq('id', customerId)
    .single()
  if (error) throw new Error(`Could not read the billing account: ${error.message}`)
  return data?.stripe_customer_id ?? null
}

/**
 * Finds an existing live-mode Stripe Customer for the account email and stores
 * it only while the database slot is empty. A concurrent webhook or request
 * therefore wins instead of being overwritten by an older lookup.
 */
export async function linkStripeCustomerByEmail(
  customer: Pick<StoredStripeCustomer, 'id' | 'email'>
): Promise<string | null> {
  if (!customer.email) return null

  const listed = await stripe.customers.list({ email: customer.email, limit: 10 })
  const normalizedEmail = customer.email.trim().toLowerCase()
  const match = listed.data.find(
    (candidate) => candidate.email?.trim().toLowerCase() === normalizedEmail
  )
  if (!match) return null

  const { error } = await supabaseAdmin
    .from('customers')
    .update({ stripe_customer_id: match.id })
    .eq('id', customer.id)
    .is('stripe_customer_id', null)
  if (error) throw new Error(`Could not reconnect the billing account: ${error.message}`)

  return (await readStoredStripeCustomerId(customer.id)) ?? match.id
}

/**
 * Clears only the exact stale ID that failed, then reconnects a valid Customer
 * with the same email if Stripe has one. The equality guard prevents this
 * request from erasing a newer ID written by a webhook or another request.
 */
export async function recoverMissingStripeCustomer(
  customer: StoredStripeCustomer,
  missingCustomerId: string
): Promise<string | null> {
  const { error } = await supabaseAdmin
    .from('customers')
    .update({ stripe_customer_id: null })
    .eq('id', customer.id)
    .eq('stripe_customer_id', missingCustomerId)
  if (error) throw new Error(`Could not clear the unavailable billing account: ${error.message}`)

  const currentId = await readStoredStripeCustomerId(customer.id)
  if (currentId && currentId !== missingCustomerId) return currentId

  return linkStripeCustomerByEmail(customer)
}
