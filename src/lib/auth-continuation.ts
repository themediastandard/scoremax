export const BOOK_CONTINUATION = '/book' as const

/** Auth flows may return only to the booking entry point. */
export function readBookContinuation(value: unknown): typeof BOOK_CONTINUATION | null {
  return value === BOOK_CONTINUATION ? BOOK_CONTINUATION : null
}

/**
 * Supabase sends the configured redirect as an absolute URL to the email hook.
 * Reduce it to the one accepted application path before placing it in an email.
 */
export function readBookContinuationFromRedirect(
  value: unknown,
  appUrl: string
): typeof BOOK_CONTINUATION | null {
  if (typeof value !== 'string') return null

  try {
    const redirect = new URL(value)
    const app = new URL(appUrl)
    if (redirect.origin !== app.origin) return null
    if (redirect.pathname !== BOOK_CONTINUATION) return null
    if (redirect.search || redirect.hash) return null
    return BOOK_CONTINUATION
  } catch {
    return readBookContinuation(value)
  }
}

export function withBookContinuation(path: '/login' | '/register', next: unknown): string {
  return readBookContinuation(next)
    ? `${path}?next=${encodeURIComponent(BOOK_CONTINUATION)}`
    : path
}
