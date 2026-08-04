import * as Sentry from '@sentry/nextjs'

/**
 * Server-side Sentry init. Loaded from src/instrumentation.ts.
 *
 * Everything is gated on the DSN being present: with no DSN the SDK is inert,
 * so local development and any deploy where the env var is unset behave exactly
 * as they did before. That also means forgetting the var fails silently — check
 * for the startup breadcrumb in Sentry rather than assuming it is wired.
 */
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  enabled: Boolean(process.env.NEXT_PUBLIC_SENTRY_DSN),

  environment: process.env.NODE_ENV,

  /*
   * This app handles real customer and payment data. sendDefaultPii would attach
   * request headers, cookies and IP addresses to every event — including the
   * Stripe signature header and Supabase auth cookies. Off, deliberately.
   *
   * Error *messages* can still contain a customer email where the code put one
   * there; that is accepted, since stripping it would gut the diagnostics that
   * make an alert actionable.
   */
  sendDefaultPii: false,

  // Errors are the point here, not performance. A low sample keeps traces
  // useful for context without burning the free tier on a low-traffic site.
  tracesSampleRate: 0.1,

  // Netlify functions are short-lived; flush fast so an event is not lost when
  // the lambda freezes right after responding.
  shutdownTimeout: 2000,
})
