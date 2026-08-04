import * as Sentry from '@sentry/nextjs'

/**
 * Report a failure that the code deliberately swallows.
 *
 * Next.js's Sentry instrumentation only sees errors that escape a route handler.
 * A great many failures here never do, on purpose: a refund's confirmation email
 * is best effort because the money already moved, a calendar event is deleted
 * after the booking is already refunded, the Stripe webhook must return 2xx or
 * Stripe retries an event whose side effects are skipped on replay. Every one of
 * those paths logs and continues — which, before this existed, meant they were
 * invisible unless someone happened to be reading Netlify logs at the time.
 *
 * Always logs to the console exactly as before, so nothing that relied on
 * grepping the function logs changes. Sentry is additive.
 *
 * `context` is a stable, greppable slug — `refund:calendar-delete`, not a
 * sentence. It becomes the Sentry fingerprint tag, so keep it constant across
 * occurrences or they will not group.
 */
export function reportError(
  context: string,
  error: unknown,
  extra?: Record<string, unknown>
): void {
  console.error(`[${context}]`, error, extra ?? '')

  Sentry.captureException(error, {
    tags: { context },
    extra,
  })
}

/**
 * Same, for a failure with no thrown error behind it — a Supabase call that
 * returns `{ error }`, a precondition that should not have been reachable.
 */
export function reportIssue(
  context: string,
  message: string,
  extra?: Record<string, unknown>
): void {
  console.error(`[${context}] ${message}`, extra ?? '')

  Sentry.captureMessage(message, {
    level: 'error',
    tags: { context },
    extra,
  })
}
