import * as Sentry from '@sentry/nextjs'

/**
 * Next.js instrumentation hook. Runs once per runtime before anything else.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('../sentry.server.config')
  }
  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('../sentry.edge.config')
  }
}

/**
 * Catches errors thrown out of route handlers, server components and server
 * actions — the ones Next.js turns into a 500.
 *
 * Note what this does NOT cover: every deliberate `console.error(...)` that
 * swallows a failure and returns normally. Those are the interesting ones in
 * this codebase (a dropped email, a calendar event that outlived its booking),
 * and they are reported explicitly via reportError in src/lib/report-error.ts.
 */
export const onRequestError = Sentry.captureRequestError
