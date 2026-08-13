import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getAuthUser, requireAdmin } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase/admin'

const paramsSchema = z.object({
  id: z.string().uuid(),
})

const updateSchema = z.object({
  payment_method: z.enum(['step_up', 'zelle']),
  approved: z.boolean(),
}).strict()

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireAdmin()
  if (authError) return authError

  // The authenticated admin is also the audit authority stored with the
  // approval transition. requireAdmin() establishes the role; this obtains the
  // same verified auth identity without trusting anything from the request.
  const adminUser = await getAuthUser()
  if (!adminUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const parsedParams = paramsSchema.safeParse(await params)
  if (!parsedParams.success) {
    return NextResponse.json({ error: 'Invalid customer id' }, { status: 400 })
  }

  let json: unknown
  try {
    json = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const parsed = updateSchema.safeParse(json)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid payment approval update' }, { status: 400 })
  }

  const customerId = parsedParams.data.id
  const { payment_method: paymentMethod, approved } = parsed.data

  const { data: customer, error: customerError } = await supabaseAdmin
    .from('customers')
    .select('id')
    .eq('id', customerId)
    .maybeSingle()

  if (customerError) {
    return NextResponse.json({ error: 'Could not verify customer' }, { status: 500 })
  }
  if (!customer) {
    return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
  }

  const { data: existing, error: existingError } = await supabaseAdmin
    .from('customer_payment_approvals')
    .select('customer_id, payment_method, approved_at, approved_by, revoked_at, revoked_by')
    .eq('customer_id', customerId)
    .eq('payment_method', paymentMethod)
    .maybeSingle()

  if (existingError) {
    return NextResponse.json({ error: 'Could not load payment approval' }, { status: 500 })
  }

  const isCurrentlyApproved = Boolean(existing?.approved_at && !existing.revoked_at)
  if (isCurrentlyApproved === approved) {
    return NextResponse.json({
      customer_id: customerId,
      payment_method: paymentMethod,
      approved,
    })
  }

  // approved_at is the immutable audit of the grant that is now being revoked.
  // Include every field in the upsert so PostgREST cannot null a prior audit
  // value when resolving the composite-key conflict.
  const now = new Date().toISOString()
  const approval = approved
    ? {
        customer_id: customerId,
        payment_method: paymentMethod,
        approved_at: now,
        approved_by: adminUser.id,
        revoked_at: null,
        revoked_by: null,
      }
    : {
        customer_id: customerId,
        payment_method: paymentMethod,
        approved_at: existing!.approved_at,
        approved_by: existing!.approved_by,
        revoked_at: now,
        revoked_by: adminUser.id,
      }

  const { data, error } = await supabaseAdmin
    .from('customer_payment_approvals')
    .upsert(approval, { onConflict: 'customer_id,payment_method' })
    .select('customer_id, payment_method, approved_at, approved_by, revoked_at, revoked_by')
    .single()

  if (error) {
    return NextResponse.json({ error: 'Could not update payment approval' }, { status: 500 })
  }

  return NextResponse.json({
    ...data,
    approved: Boolean(data.approved_at && !data.revoked_at),
  })
}
