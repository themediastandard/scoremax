import * as Sentry from '@sentry/nextjs'

/**
 * Browser-side init. Next.js loads this automatically for the client bundle.
 *
 * Deliberately minimal: no session replay and no performance tracing beyond a
 * sample. The value here is knowing that a customer hit a crash on /book, not
 * recording what they typed into it — this form collects student names, grades
 * and contact details.
 */
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  enabled: Boolean(process.env.NEXT_PUBLIC_SENTRY_DSN),
  environment: process.env.NODE_ENV,
  sendDefaultPii: false,
  tracesSampleRate: 0.1,
})

// Required for Next.js navigation instrumentation in the App Router.
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart
