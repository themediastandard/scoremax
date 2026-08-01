import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { cleanEmail } from '@/lib/form-validation'
import { escapeLikePattern } from '@/lib/postgrest-escape'
import { getClientIp, withinRateLimit } from '@/lib/rate-limit'

/**
 * Does this email already have a ScoreMax account?
 *
 * Exists so a returning customer who is not signed in can be told to sign in
 * before paying again for credit they already hold. The booking form asks for
 * an email before it asks for payment, which is the right moment to catch it.
 *
 * Deliberately answers ONE boolean and nothing else. /api/customer/check is the
 * authenticated endpoint that returns balances, and it resolves the customer
 * from the session rather than from any email in the request — that is what
 * stops a stranger reading someone's credit balance, and this route must not
 * become a way around it. No name, no tier, no counts, no "isMember".
 *
 * Disclosing that an address has an account is a mild enumeration tradeoff,
 * accepted because it is what nearly every checkout does and because the
 * alternative is customers paying twice. It is rate limited per IP to stop
 * anyone grinding a list of addresses through it.
 */

/** Generous: a real person retypes and corrects an address several times. */
const MAX_LOOKUPS_PER_IP = 20
const WINDOW = '1 hour'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const email = cleanEmail(body.email)

    // Same answer for a malformed address as for one with no account, so the
    // response never doubles as an address validator.
    if (!email) {
      return NextResponse.json({ hasAccount: false })
    }

    const allowed = await withinRateLimit(
      'account-exists:ip',
      getClientIp(req),
      MAX_LOOKUPS_PER_IP,
      WINDOW
    )
    if (!allowed) {
      // Answer false rather than 429. A throttled attacker learns nothing, and
      // a real customer who somehow hits this still gets a working form — they
      // just miss the prompt.
      return NextResponse.json({ hasAccount: false })
    }

    // profiles, not customers. Every account gets a profiles row from the
    // handle_new_user trigger, but a customers row only appears once someone
    // buys something — so checking customers would tell a registered visitor
    // who has never purchased that they have no account, which is exactly the
    // person most likely to be about to create a duplicate.
    const { data } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .ilike('email', escapeLikePattern(email))
      .limit(1)
      .maybeSingle()

    return NextResponse.json({ hasAccount: !!data })
  } catch {
    // Never fail the booking form over this. No prompt is a worse experience
    // than a working one, not a broken one.
    return NextResponse.json({ hasAccount: false })
  }
}
