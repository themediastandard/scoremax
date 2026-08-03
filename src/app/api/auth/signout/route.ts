import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

/**
 * Ends the caller's session.
 *
 * This exists because `supabase.auth.signOut()` in the browser is not enough on
 * its own. auth-js revokes the token server-side FIRST and returns early on any
 * error that isn't 401/403/404 — before it reaches `_removeSession()`
 * (GoTrueClient `_signOut`). A flaky network or a 5xx from GoTrue therefore
 * leaves the `sb-*` cookies intact while the click handler redirects anyway;
 * middleware then sees a valid user on /login and bounces straight back to
 * /dashboard, which reads as "the sign out button does nothing".
 *
 * So the revoke here is best-effort and its result is deliberately ignored. The
 * unconditional cookie purge below is what actually ends the session, and it
 * runs whether or not GoTrue was reachable.
 */
export async function POST() {
  try {
    const supabase = await createClient()
    // Default scope ('global') preserves the previous behaviour: signing out
    // revokes this user's refresh tokens everywhere, not just in this browser.
    await supabase.auth.signOut()
  } catch {
    // Unreachable GoTrue. Fall through — the cookies still get cleared.
  }

  const cookieStore = await cookies()
  for (const cookie of cookieStore.getAll()) {
    // Covers the chunked auth cookie (`sb-<ref>-auth-token.0`, `.1`, ...) as
    // well as the unchunked one, without hardcoding the project ref.
    if (cookie.name.startsWith('sb-')) {
      cookieStore.delete(cookie.name)
    }
  }

  return NextResponse.json({ success: true })
}
