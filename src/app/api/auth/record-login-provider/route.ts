import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

const ALLOWED = new Set(['google', 'email'])

/**
 * Record which method the caller just signed in with.
 *
 * profiles.last_auth_provider was previously written once at sign-up and never
 * again, so it recorded the SIGN-UP provider and drifted immediately — every
 * row read 'email', including an account whose recent sign-ins were all Google.
 *
 * auth.identities carries a last_sign_in_at per provider and is most of the way
 * there, but it misses flows that authenticate without going through an
 * identity: a password-recovery link signs the user in without touching the
 * email identity's timestamp. Recording it here, where the app knows exactly
 * which path ran, is accurate for every flow.
 *
 * Writes only the caller's own row, keyed off the session rather than anything
 * in the request body. The worst a caller can do is mislabel their own hint.
 */
export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let provider: unknown
  try {
    ;({ provider } = await req.json())
  } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
  }

  if (typeof provider !== 'string' || !ALLOWED.has(provider)) {
    return NextResponse.json({ error: 'Unsupported provider' }, { status: 400 })
  }

  const { error } = await supabaseAdmin
    .from('profiles')
    .update({ last_auth_provider: provider })
    .eq('id', user.id)

  if (error) {
    // Never block a sign-in over a UI hint.
    console.error('Failed to record login provider:', error.message)
    return NextResponse.json({ ok: false })
  }

  return NextResponse.json({ ok: true })
}
