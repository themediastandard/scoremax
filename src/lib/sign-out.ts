/**
 * Ends the session server-side, then hard-navigates to `destination`.
 *
 * Two deliberate choices here:
 *
 *  - The clearing happens in `POST /api/auth/signout`, not via the browser
 *    client. See that route for why `supabase.auth.signOut()` alone can leave
 *    the user signed in.
 *  - `window.location.href`, not `router.push`. A full navigation guarantees
 *    middleware re-reads cookies; a client-side transition can render from
 *    cache with the old session still in memory.
 *
 * Navigation happens even if the request fails, so the button is never dead.
 */
export async function signOutAndRedirect(destination: string) {
  try {
    await fetch('/api/auth/signout', {
      method: 'POST',
      // Without this the request can hang indefinitely and the redirect below
      // never runs — the second way the old button appeared to do nothing.
      signal: AbortSignal.timeout(8000),
    })
  } catch {
    // Offline, aborted, or a 5xx. Nothing useful to do but navigate: if the
    // cookies really did survive, /login bounces back and the user can retry,
    // which is still better than a button with no visible effect.
  }

  window.location.href = destination
}
