import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { requireAdmin } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase/admin'

const paramsSchema = z.object({ id: z.string().uuid() })
const updateSchema = z.strictObject({
  account_type: z.enum(['parent', 'student']),
})

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireAdmin()
  if (authError) return authError

  const parsedParams = paramsSchema.safeParse(await params)
  if (!parsedParams.success) {
    return NextResponse.json({ error: 'Invalid customer id' }, { status: 400 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const parsedBody = updateSchema.safeParse(body)
  if (!parsedBody.success) {
    return NextResponse.json({ error: 'Invalid account type' }, { status: 400 })
  }

  const { data, error } = await supabaseAdmin
    .from('customers')
    .update({ account_type: parsedBody.data.account_type })
    .eq('id', parsedParams.data.id)
    .select('id, account_type')
    .maybeSingle()

  if (error) {
    return NextResponse.json({ error: 'Could not update account type' }, { status: 500 })
  }
  if (!data) {
    return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
  }

  return NextResponse.json({ accountType: data.account_type })
}
