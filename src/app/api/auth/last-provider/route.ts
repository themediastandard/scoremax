import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

/**
 * Which sign-in method did this address last use?
 *
 * Powers the hint on the login page after a failed password attempt: someone
 * whose last sign-in was Google has no password to get wrong, and telling them
 * so is far more useful than "Invalid login credentials".
 *
 * DELIBERATELY NARROW. This endpoint only ever answers "google" or nothing:
 *
 *   - last sign-in was Google  -> { provider: 'google' }
 *   - anything else, including no such account -> { provider: null }
 *
 * Returning the same empty answer for "email account" and "no account" keeps
 * this from becoming a general account-existence oracle. It still reveals that
 * a given address is a Google user here, which is the unavoidable cost of
 * showing the hint at all — the same trade-off Slack, Notion and Google make.
 * If that is ever unacceptable, delete this route and show a static
 * "Signed up with Google? Use the Google button" instead.
 */
export async function POST(req: NextRequest) {
  let email: unknown
  try {
    ;({ email } = await req.json())
  } catch {
    return NextResponse.json({ provider: null })
  }

  if (typeof email !== 'string' || !email.includes('@') || email.length > 320) {
    return NextResponse.json({ provider: null })
  }

  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('last_auth_provider')
    .eq('email', email.toLowerCase().trim())
    .maybeSingle()

  if (error) {
    console.error('last-provider lookup failed:', error.message)
    return NextResponse.json({ provider: null })
  }

  return NextResponse.json({
    provider: data?.last_auth_provider === 'google' ? 'google' : null,
  })
}
