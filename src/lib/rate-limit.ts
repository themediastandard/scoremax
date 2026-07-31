import type { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

/**
 * Shared rate limiting for public, unauthenticated routes.
 *
 * State lives in Postgres rather than in this process: the app runs on Netlify
 * Functions, so consecutive requests routinely land on different instances and
 * an in-memory counter would enforce nothing.
 */

/**
 * Best-effort client IP.
 *
 * Netlify sets x-nf-client-connection-ip to the real peer address, which cannot
 * be spoofed by the client. x-forwarded-for can be, so it is only a fallback
 * for other hosting, and only its first entry is used.
 */
export function getClientIp(req: NextRequest): string | null {
  const netlifyIp = req.headers.get('x-nf-client-connection-ip')
  if (netlifyIp) return netlifyIp.trim()

  const forwarded = req.headers.get('x-forwarded-for')
  if (forwarded) {
    const first = forwarded.split(',')[0]?.trim()
    if (first) return first
  }

  return req.headers.get('x-real-ip')?.trim() ?? null
}

/**
 * Record an attempt and report whether it is within the limit.
 *
 * Fails **open**: if the database call errors the request is allowed through.
 * A rate limiter that takes the contact form down when Postgres hiccups would
 * cost the client more than the spam it prevents.
 *
 * @param scope      logical bucket, e.g. 'contact:ip'
 * @param identifier the value being limited, e.g. an IP or an email address
 * @param max        attempts permitted within the window
 * @param window     Postgres interval literal, e.g. '1 hour'
 */
export async function withinRateLimit(
  scope: string,
  identifier: string | null,
  max: number,
  window: string
): Promise<boolean> {
  if (!identifier) return true

  const { data, error } = await supabaseAdmin.rpc('check_form_rate_limit', {
    p_scope: scope,
    p_identifier: identifier,
    p_max: max,
    p_window: window,
  })

  if (error) {
    console.error(`Rate limit check failed for ${scope}; allowing request:`, error.message)
    return true
  }

  return data !== false
}

/** Response body for a throttled request. Deliberately vague about limits. */
export const RATE_LIMITED_MESSAGE =
  'Too many submissions from this address. Please try again later, or email us directly.'
