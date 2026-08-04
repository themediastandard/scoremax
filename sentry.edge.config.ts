import * as Sentry from '@sentry/nextjs'

/**
 * Edge runtime init — src/middleware.ts runs here, not in Node.
 *
 * Same DSN gating as the server config. Kept separate because the edge runtime
 * has no Node APIs and the SDK ships a distinct build for it.
 */
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  enabled: Boolean(process.env.NEXT_PUBLIC_SENTRY_DSN),
  environment: process.env.NODE_ENV,
  sendDefaultPii: false,
  tracesSampleRate: 0.1,
})
