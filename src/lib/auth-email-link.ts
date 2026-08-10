import type { EmailOtpType } from '@supabase/supabase-js'

const SUPPORTED_EMAIL_OTP_TYPES = new Set<EmailOtpType>([
  'email',
  'email_change',
  'invite',
  'magiclink',
  'recovery',
  'signup',
])

export function readEmailOtpType(value: unknown): EmailOtpType | null {
  if (typeof value !== 'string') return null
  return SUPPORTED_EMAIL_OTP_TYPES.has(value as EmailOtpType)
    ? (value as EmailOtpType)
    : null
}

export function readRelativeNextPath(value: unknown): string | null {
  if (typeof value !== 'string') return null
  if (!value.startsWith('/') || value.startsWith('//')) return null
  return value
}

/**
 * Email security scanners follow links automatically. Sending them directly to
 * /auth/callback consumes Supabase's single-use token before the customer can
 * act. The email now opens a harmless interstitial; only its explicit POST
 * button submits the token to the callback.
 */
export function buildAuthContinueUrl(
  appUrl: string,
  tokenHash: string,
  type: EmailOtpType,
  next?: string | null
): string {
  const params = new URLSearchParams({ token_hash: tokenHash, type })
  const safeNext = readRelativeNextPath(next)
  if (safeNext) params.set('next', safeNext)

  return `${appUrl.replace(/\/$/, '')}/auth/continue?${params.toString()}`
}
